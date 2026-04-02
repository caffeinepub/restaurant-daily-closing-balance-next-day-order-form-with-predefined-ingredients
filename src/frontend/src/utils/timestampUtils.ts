/**
 * Safely converts a bigint or number timestamp to milliseconds.
 * Handles both:
 *   - ms timestamps stored as bigint (e.g. BigInt(Date.now()))
 *   - nanosecond timestamps from ICP Time.now() (divide by 1_000_000)
 *
 * Strategy: if the value is larger than year 3000 in ms (32503680000000),
 * assume it's nanoseconds and divide by 1_000_000.
 */
export function toMilliseconds(timestamp: bigint | number): number {
  const ns =
    typeof timestamp === "bigint" ? timestamp : BigInt(Math.round(timestamp));
  // If timestamp > year 3000 in ms expressed as bigint, it's nanoseconds
  const YEAR_3000_MS = BigInt(32503680000000);
  if (ns > YEAR_3000_MS) {
    // Nanoseconds → milliseconds
    return Number(ns / BigInt(1_000_000));
  }
  // Already milliseconds
  return Number(ns);
}

/**
 * Returns true if the timestamp is within the last 24 hours.
 */
export function isWithin24Hours(timestamp: bigint | number): boolean {
  const ms = toMilliseconds(timestamp);
  const elapsed = Date.now() - ms;
  return elapsed >= 0 && elapsed < 24 * 60 * 60 * 1000;
}
