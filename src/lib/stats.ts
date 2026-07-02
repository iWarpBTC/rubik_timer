import type { Penalty } from '../types';

export interface TimedAttempt {
  timeMs: number;
  penalty: Penalty;
}

/** Result time in ms with penalty applied, or null for a DNF. */
export function effectiveMs(attempt: TimedAttempt): number | null {
  if (attempt.penalty === 'dnf') return null;
  return attempt.penalty === 'plus2' ? attempt.timeMs + 2000 : attempt.timeMs;
}

/** An average result: a time, DNF (too many DNF solves), or null (not enough solves). */
export type AverageResult = number | 'dnf' | null;

export interface ScrambleStats {
  count: number;
  best: number | null;
  worst: number | null;
  mean: number | null;
  median: number | null;
  stdDev: number | null;
  ao5: AverageResult;
  ao12: AverageResult;
}

function validTimes(attempts: readonly TimedAttempt[]): number[] {
  return attempts.map(effectiveMs).filter((t): t is number => t !== null);
}

export function mean(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid]! : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Sample standard deviation; null with fewer than 2 values. */
export function stdDev(values: readonly number[]): number | null {
  if (values.length < 2) return null;
  const m = mean(values)!;
  const variance = values.reduce((acc, v) => acc + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/**
 * WCA trimmed average of the last n attempts (chronological input order):
 * drop the single best and single worst, average the rest. A DNF counts as
 * the worst attempt; two or more DNFs make the average itself a DNF.
 * Returns null when fewer than n attempts exist.
 */
export function averageOfN(attempts: readonly TimedAttempt[], n: number): AverageResult {
  if (attempts.length < n) return null;
  const window = attempts.slice(-n).map(effectiveMs);
  const dnfCount = window.filter((t) => t === null).length;
  if (dnfCount >= 2) return 'dnf';
  const sorted = [...window].sort((a, b) => (a ?? Infinity) - (b ?? Infinity));
  const kept = sorted.slice(1, n - 1) as number[];
  return mean(kept);
}

/** All statistics for one scramble's attempts, in chronological order. */
export function computeStats(attempts: readonly TimedAttempt[]): ScrambleStats {
  const times = validTimes(attempts);
  return {
    count: attempts.length,
    best: times.length > 0 ? Math.min(...times) : null,
    worst: times.length > 0 ? Math.max(...times) : null,
    mean: mean(times),
    median: median(times),
    stdDev: stdDev(times),
    ao5: averageOfN(attempts, 5),
    ao12: averageOfN(attempts, 12),
  };
}
