// promisified setTimeout
export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
/**
 * Calculate milliseconds remaining between now and the next hour
 * @returns milliseconds remainging
 */
export function msToNextHour(): number {
  return 3600000 - (new Date().getTime() % 3600000);
}
