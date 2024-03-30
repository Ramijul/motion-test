import { sleep } from '../utils';
import { ApiLimitProcessor } from './ApiLimitProcessor';
import AppUsageStore from './AppUsageStore';
import { RateLimitError } from './RateLimitError';
import { IAppUsage, MetaApiErrorResponse } from './types';

export class RequestHandler {
  /**
   * Fetch data with app usage (rate limit) accounted for.
   *
   * @param endpoint
   * @returns
   */
  static async fetchData(endpoint: string): Promise<Record<string, any>> {
    await sleep(ApiLimitProcessor.getBackoff(AppUsageStore.getAppUsage()));

    const resp = await fetch(endpoint);
    AppUsageStore.setAppUsage(JSON.parse(resp.headers.get('x-app-usage') as string) as IAppUsage);

    // handle error
    if (resp.status !== 200) {
      await this.handleErrors(resp);
    }

    const data: Record<string, any> = await resp.json();
    if (!data) {
      throw new Error('No response, please ensure the token is correct.');
    }

    return data;
  }

  private static async handleErrors(resp: Response) {
    // rate limit reached
    if (ApiLimitProcessor.hasApiLimitReached(AppUsageStore.getAppUsage())) {
      throw new RateLimitError('Rate limit has been reached. Pausing api calls till the start of the next hour.');
    }

    // other errors
    const err: MetaApiErrorResponse = await resp.json();
    throw new Error(err.error.message);
  }
}
