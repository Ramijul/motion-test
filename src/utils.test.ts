import { describe, expect, test } from '@jest/globals';
import { IAppUsage } from './types';
import { getBackoff, getBackoffResponsiveToError, msToNextHour } from './utils';

describe('getBackoffResponsiveToError', () => {
  const appUsage: IAppUsage = { call_count: 10, total_cputime: 90, total_time: 10 };

  test('should return a backoff for next hour on reaching api limit', () => {
    const appUsageCallCount: IAppUsage = { call_count: 100, total_cputime: 90, total_time: 90 };
    const appUsageCpu: IAppUsage = { call_count: 10, total_cputime: 100, total_time: 90 };
    const appUsageCallTime: IAppUsage = { call_count: 10, total_cputime: 90, total_time: 100 };

    expect(getBackoffResponsiveToError(appUsageCallCount, {})).toBeGreaterThanOrEqual(msToNextHour());
    expect(getBackoffResponsiveToError(appUsageCpu, {})).toBeGreaterThanOrEqual(msToNextHour());
    expect(getBackoffResponsiveToError(appUsageCallTime, {})).toBeGreaterThanOrEqual(msToNextHour());
  });

  test('should return null for error response', () => {
    const errExpiredToken: Record<string, any> = { error: { code: 190 } };
    const errBadToken: Record<string, any> = { error: { code: 19, message: 'bad token' } };

    expect(getBackoffResponsiveToError(appUsage, errExpiredToken)).toBeNull();
    expect(getBackoffResponsiveToError(appUsage, errBadToken)).toBeNull();
  });
});

describe('getBackoff', () => {
  test('should return a backoff of 4s', () => {
    const appUsage: IAppUsage = { call_count: 96, total_cputime: 90, total_time: 10 };
    const headers = new Headers();
    headers.append('x-app-usage', JSON.stringify(appUsage));
    const response = new Response('', { status: 200, headers: headers });

    getBackoff(response).then((data) => expect(data).toEqual(4000));
  });
});
