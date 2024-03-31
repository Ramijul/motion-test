import { describe, expect, test, jest, afterAll, beforeAll } from '@jest/globals';
import { IAppUsage, IUserInfo } from './types';
import { RequestHandler } from './RequestHandler';
import AppUsageStore from './AppUsageStore';
import { ApiLimitProcessor } from './ApiLimitProcessor';
import { afterEach } from 'node:test';
import { RateLimitError } from './RateLimitError';

const mockFetchResponse = (resp: Record<string, any>) => {
  global.fetch = jest.fn(() => Promise.resolve(resp as unknown as Response));
};
const defaultAppUsage: IAppUsage = { call_count: 1, total_cputime: 0, total_time: 0 };

describe('RequestHandler', () => {
  beforeAll(() => {
    //avoid relying on appUsage, since its a singleton
    jest.spyOn(ApiLimitProcessor, 'getBackoff').mockImplementation((_: IAppUsage | null) => 0);
  });
  afterAll(() => {
    (ApiLimitProcessor.getBackoff as jest.Mock).mockRestore();
  });
  afterEach(() => {
    (fetch as jest.Mock).mockClear();
  });
  test('happy path', async () => {
    const userInfo: IUserInfo = { id: 'akdjhaiu', name: 'Rami', last_name: 'Islam' };
    const resp = {
      status: 200,
      headers: { get: (x: any) => x.length && JSON.stringify(defaultAppUsage) },
      json: async () => ({ ...userInfo }),
    };

    mockFetchResponse(resp);

    // correct data should be returned while it also updates AppUsageStore.appUsage
    await expect(RequestHandler.fetchData('')).resolves.toEqual(userInfo);

    // app_usage should be saved
    expect(AppUsageStore.getAppUsage()).toEqual(defaultAppUsage);
  });

  test('should throw an error if no data was returned', async () => {
    const resp = {
      status: 200,
      headers: { get: (x: any) => x.length && JSON.stringify(defaultAppUsage) },
      json: async () => {},
    };

    mockFetchResponse(resp);
    await expect(RequestHandler.fetchData('')).rejects.toThrow(new Error('No response, please ensure the token is correct.'));
  });

  test('should throw RateLimitError', async () => {
    const resp = {
      status: 190,
      headers: { get: (x: any) => x.length && JSON.stringify(defaultAppUsage) },
      json: async () => null,
    };

    // simulate rate limit reached without relying on appUsage
    jest.spyOn(ApiLimitProcessor, 'hasApiLimitReached').mockImplementation((_: IAppUsage | null) => true);

    mockFetchResponse(resp);
    await expect(RequestHandler.fetchData('')).rejects.toThrow(
      new RateLimitError('Rate limit has been reached. Pausing api calls till the start of the next hour.'),
    );
  });

  test('should throw other Error', async () => {
    const error = { error: { code: 123, message: 'Some Error' } };
    const resp = {
      status: 19,
      headers: { get: (x: any) => x.length && JSON.stringify(defaultAppUsage) },
      json: async () => ({ ...error }),
    };

    // simulate rate limit reached without relying on appUsage
    jest.spyOn(ApiLimitProcessor, 'hasApiLimitReached').mockImplementation((_: IAppUsage | null) => false);

    mockFetchResponse(resp);
    await expect(RequestHandler.fetchData('')).rejects.toThrow(new Error(error.error.message));
  });
});
