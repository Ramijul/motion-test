import { msToNextHour } from '../utils';
import { IAppUsage } from './types';

/**
 * Singleton to share AppUsage stats between api calls
 */
class RateLimitMonitor {
  private appUsage: IAppUsage | null;
  private readonly defaultBackoff = 2000;
  private static instance: RateLimitMonitor;

  private constructor() {
    this.appUsage = null;
  }

  static getInstance(): RateLimitMonitor {
    if (!RateLimitMonitor.instance) {
      RateLimitMonitor.instance = new RateLimitMonitor();
    }
    return RateLimitMonitor.instance;
  }

  getAppUsage(): IAppUsage | null {
    return this.appUsage;
  }

  setAppUsage(appUsage: IAppUsage | null) {
    this.appUsage = appUsage;
  }

  getBackoff(): number {
    if (this.hasApiLimitReached()) {
      return msToNextHour();
    }
    // if nearing limit double the backoff to reduce the rate
    if (this.isNearingApiLimit()) {
      return this.defaultBackoff * 2;
    }
    return this.appUsage ? this.defaultBackoff : 0;
  }

  hasApiLimitReached(): boolean {
    if (!this.appUsage) {
      return false;
    }
    return this.appUsage.call_count === 100 || this.appUsage.total_cputime === 100 || this.appUsage.total_time === 100;
  }

  isNearingApiLimit(): boolean {
    // real usage statics would help determine more appropriate boundaries
    // for now caping it to 95%
    if (!this.appUsage) {
      return false;
    }
    return this.appUsage.call_count > 95 || this.appUsage.total_cputime > 95 || this.appUsage.total_time > 95;
  }
}

export default RateLimitMonitor.getInstance() as RateLimitMonitor;
