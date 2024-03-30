import { describe, expect, test, jest } from '@jest/globals';
import { ApiLimitProcessor } from './ApiLimitProcessor';

describe('ApiLimitProcessor', () => {
  // test isNearingApiLimit
  describe('isNearingApiLimit', () => {
    test('should return false when appUsage is null', () => {
      expect(ApiLimitProcessor.isNearingApiLimit(null)).toEqual(false);
    });

    test('should return false when appUsage <= 95%', () => {
      expect(ApiLimitProcessor.isNearingApiLimit({ call_count: 95, total_cputime: 90, total_time: 90 })).toEqual(false);

      expect(ApiLimitProcessor.isNearingApiLimit({ call_count: 90, total_cputime: 95, total_time: 90 })).toEqual(false);

      expect(ApiLimitProcessor.isNearingApiLimit({ call_count: 90, total_cputime: 90, total_time: 95 })).toEqual(false);
    });

    test('should return true when appUsage > 95%', () => {
      expect(ApiLimitProcessor.isNearingApiLimit({ call_count: 96, total_cputime: 95, total_time: 95 })).toEqual(true);

      expect(ApiLimitProcessor.isNearingApiLimit({ call_count: 95, total_cputime: 96, total_time: 95 })).toEqual(true);

      expect(ApiLimitProcessor.isNearingApiLimit({ call_count: 95, total_cputime: 95, total_time: 96 })).toEqual(true);
    });
  });

  // test hasApiLimitReached
  describe('hasApiLimitReached', () => {
    test('should return false when appUsage is null', () => {
      expect(ApiLimitProcessor.hasApiLimitReached(null)).toEqual(false);
    });

    test('should return false when appUsage <= 99%', () => {
      expect(ApiLimitProcessor.hasApiLimitReached({ call_count: 99, total_cputime: 95, total_time: 95 })).toEqual(false);

      expect(ApiLimitProcessor.hasApiLimitReached({ call_count: 95, total_cputime: 99, total_time: 95 })).toEqual(false);

      expect(ApiLimitProcessor.hasApiLimitReached({ call_count: 95, total_cputime: 95, total_time: 99 })).toEqual(false);
    });

    test('should return true when appUsage = 100%', () => {
      expect(ApiLimitProcessor.hasApiLimitReached({ call_count: 100, total_cputime: 95, total_time: 95 })).toEqual(true);

      expect(ApiLimitProcessor.hasApiLimitReached({ call_count: 95, total_cputime: 100, total_time: 95 })).toEqual(true);

      expect(ApiLimitProcessor.hasApiLimitReached({ call_count: 95, total_cputime: 90, total_time: 100 })).toEqual(true);
    });
  });

  // test getBackoff
  describe('getBackoff', () => {
    test('should return 0 second when appUsage is null', () => {
      expect(ApiLimitProcessor.getBackoff(null)).toEqual(0);
    });

    test('should return 2 seconds when appUsage <= 95%', () => {
      expect(ApiLimitProcessor.getBackoff({ call_count: 95, total_cputime: 90, total_time: 90 })).toEqual(2000);

      expect(ApiLimitProcessor.getBackoff({ call_count: 90, total_cputime: 95, total_time: 90 })).toEqual(2000);

      expect(ApiLimitProcessor.getBackoff({ call_count: 90, total_cputime: 90, total_time: 95 })).toEqual(2000);
    });

    test('should return 4 seconds when 95% < appUsage < 100%', () => {
      expect(ApiLimitProcessor.getBackoff({ call_count: 96, total_cputime: 95, total_time: 95 })).toEqual(4000);

      expect(ApiLimitProcessor.getBackoff({ call_count: 95, total_cputime: 96, total_time: 95 })).toEqual(4000);

      expect(ApiLimitProcessor.getBackoff({ call_count: 95, total_cputime: 95, total_time: 96 })).toEqual(4000);
    });

    test('should return remaining seconds to the next hour when appUsage = 100%', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-03-26T22:42:00'));

      const eighteenMinutes = 18 * 60 * 1000;

      expect(ApiLimitProcessor.getBackoff({ call_count: 100, total_cputime: 95, total_time: 95 })).toEqual(eighteenMinutes);

      expect(ApiLimitProcessor.getBackoff({ call_count: 95, total_cputime: 100, total_time: 95 })).toEqual(eighteenMinutes);

      expect(ApiLimitProcessor.getBackoff({ call_count: 95, total_cputime: 95, total_time: 100 })).toEqual(eighteenMinutes);

      jest.useRealTimers();
    });
  });
});
