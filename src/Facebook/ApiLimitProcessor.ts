import { msToNextHour } from '../utils';
import { IAppUsage } from './types';

export class ApiLimitProcessor {
  private static readonly defaultBackoff = 2000;

  static getBackoff(appUsage: IAppUsage | null): number {
    if (this.hasApiLimitReached(appUsage)) {
      return msToNextHour();
    }
    // if nearing limit double the backoff to reduce the rate
    if (this.isNearingApiLimit(appUsage)) {
      return this.defaultBackoff * 2;
    }
    return appUsage ? this.defaultBackoff : 0;
  }

  static hasApiLimitReached(appUsage: IAppUsage | null): boolean {
    if (!appUsage) {
      return false;
    }
    return appUsage.call_count === 100 || appUsage.total_cputime === 100 || appUsage.total_time === 100;
  }

  static isNearingApiLimit(appUsage: IAppUsage | null): boolean {
    // real usage statics would help determine more appropriate boundaries
    // for now caping it to 95%
    if (!appUsage) {
      return false;
    }
    return appUsage.call_count > 95 || appUsage.total_cputime > 95 || appUsage.total_time > 95;
  }
}
