import { IAppUsage } from './types';

/**
 * Singleton to share AppUsage stats between api calls
 */
class AppUsageStore {
  private appUsage: IAppUsage | null;
  private static instance: AppUsageStore;

  private constructor() {
    this.appUsage = null;
  }

  static getInstance(): AppUsageStore {
    if (!AppUsageStore.instance) {
      AppUsageStore.instance = new AppUsageStore();
    }
    return AppUsageStore.instance;
  }

  getAppUsage(): IAppUsage | null {
    return this.appUsage;
  }

  setAppUsage(appUsage: IAppUsage | null) {
    this.appUsage = appUsage;
  }
}

export default AppUsageStore.getInstance() as AppUsageStore;
