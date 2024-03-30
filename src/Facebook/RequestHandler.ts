import { sleep } from '../utils';
import AppUsage from './AppUsage';
import { RateLimitError } from './RateLimitError';
import { IAppUsage, MetaApiErrorResponse } from './types';

export class RequestHandler {
  private constructor() {}

  /**
   * Fetch data with app usage (rate limit) accounted for.
   *
   * @param endpoint
   * @returns
   */
  static async fetchData(endpoint: string): Promise<Record<string, any>> {
    await sleep(AppUsage.getBackoff());

    const resp = await fetch(endpoint);
    AppUsage.setUsage(JSON.parse(resp.headers.get('x-app-usage') as string) as IAppUsage);

    // handle error
    if (resp.status !== 200) {
      // rate limit reached
      if (AppUsage.hasApiLimitReached()) {
        throw new RateLimitError('Rate limit has been reached. Pausing api calls till the start of the next hour.');
      }

      // other errors
      const err: MetaApiErrorResponse = await resp.json();
      if (err.error.code === 190) {
        throw new Error('Token has expired.');
      } else {
        //spit out the error
        throw new Error(JSON.stringify(err));
      }
    }

    const data: Record<string, any> = await resp.json();
    if (!data) {
      throw new Error('No response, please ensure the token is correct.');
    }

    return data;
  }
}
