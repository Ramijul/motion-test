import { describe, expect, test, beforeEach, jest } from '@jest/globals';
import RateLimitMonitor from './RateLimitMonitor';

describe('RateLimitMonitor', () => {
  // reset appUsage to null before each test
  beforeEach(() => {
    RateLimitMonitor.setAppUsage(null);
  });

  // intial state
  test('intial appUsage state should be null', () => {
    expect(RateLimitMonitor.getAppUsage()).toBeNull();
  });

  // test isNearingApiLimit
  describe('isNearingApiLimit', () => {
    test('should return false when appUsage is null', () => {
      expect(RateLimitMonitor.isNearingApiLimit()).toEqual(false);
    });

    test('should return false when appUsage <= 95%', () => {
      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 90, total_time: 90 });
      expect(RateLimitMonitor.isNearingApiLimit()).toEqual(false);

      RateLimitMonitor.setAppUsage({ call_count: 90, total_cputime: 95, total_time: 90 });
      expect(RateLimitMonitor.isNearingApiLimit()).toEqual(false);

      RateLimitMonitor.setAppUsage({ call_count: 90, total_cputime: 90, total_time: 95 });
      expect(RateLimitMonitor.isNearingApiLimit()).toEqual(false);
    });

    test('should return true when appUsage > 95%', () => {
      RateLimitMonitor.setAppUsage({ call_count: 96, total_cputime: 95, total_time: 95 });
      expect(RateLimitMonitor.isNearingApiLimit()).toEqual(true);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 96, total_time: 95 });
      expect(RateLimitMonitor.isNearingApiLimit()).toEqual(true);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 95, total_time: 96 });
      expect(RateLimitMonitor.isNearingApiLimit()).toEqual(true);
    });
  });

  // test hasApiLimitReached
  describe('hasApiLimitReached', () => {
    test('should return false when appUsage is null', () => {
      expect(RateLimitMonitor.hasApiLimitReached()).toEqual(false);
    });

    test('should return false when appUsage <= 99%', () => {
      RateLimitMonitor.setAppUsage({ call_count: 99, total_cputime: 95, total_time: 95 });
      expect(RateLimitMonitor.hasApiLimitReached()).toEqual(false);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 99, total_time: 95 });
      expect(RateLimitMonitor.hasApiLimitReached()).toEqual(false);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 95, total_time: 99 });
      expect(RateLimitMonitor.hasApiLimitReached()).toEqual(false);
    });

    test('should return true when appUsage = 100%', () => {
      RateLimitMonitor.setAppUsage({ call_count: 100, total_cputime: 95, total_time: 95 });
      expect(RateLimitMonitor.hasApiLimitReached()).toEqual(true);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 100, total_time: 95 });
      expect(RateLimitMonitor.hasApiLimitReached()).toEqual(true);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 90, total_time: 100 });
      expect(RateLimitMonitor.hasApiLimitReached()).toEqual(true);
    });
  });

  // test getBackoff
  describe('getBackoff', () => {
    test('should return 0 second when appUsage is null', () => {
      expect(RateLimitMonitor.getBackoff()).toEqual(0);
    });

    test('should return 2 seconds when appUsage <= 95%', () => {
      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 90, total_time: 90 });
      expect(RateLimitMonitor.getBackoff()).toEqual(2000);

      RateLimitMonitor.setAppUsage({ call_count: 90, total_cputime: 95, total_time: 90 });
      expect(RateLimitMonitor.getBackoff()).toEqual(2000);

      RateLimitMonitor.setAppUsage({ call_count: 90, total_cputime: 90, total_time: 95 });
      expect(RateLimitMonitor.getBackoff()).toEqual(2000);
    });

    test('should return 4 seconds when 95% < appUsage < 100%', () => {
      RateLimitMonitor.setAppUsage({ call_count: 96, total_cputime: 95, total_time: 95 });
      expect(RateLimitMonitor.getBackoff()).toEqual(4000);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 96, total_time: 95 });
      expect(RateLimitMonitor.getBackoff()).toEqual(4000);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 95, total_time: 96 });
      expect(RateLimitMonitor.getBackoff()).toEqual(4000);
    });

    test('should return remaining seconds to the next hour when appUsage = 100%', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-03-26T22:42:00'));

      const eighteenMinutes = 18 * 60 * 1000;

      RateLimitMonitor.setAppUsage({ call_count: 100, total_cputime: 95, total_time: 95 });
      expect(RateLimitMonitor.getBackoff()).toEqual(eighteenMinutes);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 100, total_time: 95 });
      expect(RateLimitMonitor.getBackoff()).toEqual(eighteenMinutes);

      RateLimitMonitor.setAppUsage({ call_count: 95, total_cputime: 95, total_time: 100 });
      expect(RateLimitMonitor.getBackoff()).toEqual(eighteenMinutes);

      jest.useRealTimers();
    });
  });
});
