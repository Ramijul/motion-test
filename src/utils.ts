import { IAppUsage } from './types';

// promisified setTimeout
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Checks if Meta API limit has been reached
 * @param appUsage x-app-usage from response header
 * @returns true if limit has been reached, false otherwise
 */
export function hasApiLimitReached(appUsage: IAppUsage): boolean {
  return appUsage.call_count === 100 || appUsage.total_cputime === 100 || appUsage.total_time === 100;
}

/**
 * Calculate milliseconds remaining between now and the next hour
 * @returns milliseconds remainging
 */
export function msToNextHour(): number {
  return 3600000 - (new Date().getTime() % 3600000);
}

/**
 * Determine whether to extend the backoff or exit the program based on the error recieved
 *
 * @param appUsage
 * @param err
 * @returns miliseconds to backoff before the next call, or null if the programm must exit instead
 */
export function getBackoffResponsiveToError(appUsage: IAppUsage, err: Record<string, any>): number | null {
  if (hasApiLimitReached(appUsage)) {
    // facebook limits to 200 calls per rolling hour, wait till the next hour to make the next call
    console.warn('Reached API limit. Next api call is scheduled for the start of next hour');
    // new backoff
    return msToNextHour();
  } else if (err?.error?.code === 190) {
    // cannot proceed with an expired token, exit the process
    console.error('Token has expired. Please update the access token and retry.');
  } else {
    // any other error
    console.error(err);
  }
  // program must exit
  return null;
}

/**
 * Determine if api usage has exceeded a certain threshold
 *
 * @param appUsage
 * @returns true if call count, cpu time, or total time exceeds 95%, false otherwise
 */
export function isNearingApiLimit(appUsage: IAppUsage): boolean {
  // real usage statics would help determine more appropriate boundaries
  // for now caping it to 95%
  return appUsage.call_count > 95 || appUsage.total_cputime > 95 || appUsage.total_time > 95;
}

/**
 * Calculate the backoff needed based on the response
 * Default backoff is set to 2 seconds.
 *
 * @param resp Response object from API
 * @returns
 */
export async function getBackoff(resp: Response): Promise<number | null> {
  let backoff: number | null = 2000; // backoff set to 2 seconds by default

  const appUsage: IAppUsage = JSON.parse(resp.headers.get('x-app-usage') as string);
  console.log(appUsage);

  // handle errors
  if (resp.status !== 200) {
    backoff = getBackoffResponsiveToError(appUsage, await resp.json());
  } else if (isNearingApiLimit(appUsage)) {
    // preemptive approach to handling api usage
    // either double the backoff or set it to next hour, whichever is smaller
    backoff = Math.min(backoff * 2, msToNextHour());
    console.log(`Nearing API limit, setting backoff to ${backoff}`);
  }

  return backoff;
}
