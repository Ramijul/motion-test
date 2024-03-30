import { msToNextHour } from '../utils';
import { IAppUsage } from './types';

/**
 * Singleton to share AppUsage stats between api calls
 */
class AppUsage {
  private usage: IAppUsage | null;
  private readonly defaultBackoff = 2000;
  private static instance: AppUsage;

  private constructor() {
    this.usage = null;
  }

  static getInstance(): AppUsage {
    if (!AppUsage.instance) {
      AppUsage.instance = new AppUsage();
    }
    return AppUsage.instance;
  }

  getUsage(): IAppUsage | null {
    return this.usage;
  }

  setUsage(appUsage: IAppUsage) {
    this.usage = appUsage;
  }

  getBackoff(): number {
    if (this.hasApiLimitReached()) {
      return msToNextHour();
    }
    // if nearing limit double the backoff to reduce the rate
    if (this.isNearingApiLimit()) {
      return this.defaultBackoff * 2;
    }
    return this.usage ? this.defaultBackoff : 0;
  }

  hasApiLimitReached(): boolean {
    if (!this.usage) {
      return false;
    }
    return this.usage.call_count === 100 || this.usage.total_cputime === 100 || this.usage.total_time === 100;
  }

  isNearingApiLimit(): boolean {
    // real usage statics would help determine more appropriate boundaries
    // for now caping it to 95%
    if (!this.usage) {
      return false;
    }
    return this.usage.call_count > 95 || this.usage.total_cputime > 95 || this.usage.total_time > 95;
  }
}

export default AppUsage.getInstance() as AppUsage;
