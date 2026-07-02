import { describe, expect, it } from 'vitest';
import type { Penalty } from '../types';
import { averageOfN, computeStats, effectiveMs, mean, median, stdDev } from './stats';

function attempt(timeMs: number, penalty: Penalty = 'none') {
  return { timeMs, penalty };
}

describe('effectiveMs', () => {
  it('returns raw time without penalty', () => {
    expect(effectiveMs(attempt(10000))).toBe(10000);
  });
  it('adds 2000ms for +2', () => {
    expect(effectiveMs(attempt(10000, 'plus2'))).toBe(12000);
  });
  it('returns null for DNF', () => {
    expect(effectiveMs(attempt(10000, 'dnf'))).toBeNull();
  });
});

describe('mean / median / stdDev', () => {
  it('handles empty input', () => {
    expect(mean([])).toBeNull();
    expect(median([])).toBeNull();
    expect(stdDev([])).toBeNull();
    expect(stdDev([5])).toBeNull();
  });
  it('computes mean', () => {
    expect(mean([1000, 2000, 3000])).toBe(2000);
  });
  it('computes median for odd and even counts', () => {
    expect(median([3000, 1000, 2000])).toBe(2000);
    expect(median([1000, 2000, 3000, 4000])).toBe(2500);
  });
  it('computes sample standard deviation', () => {
    expect(stdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2.138, 3);
  });
});

describe('averageOfN (WCA)', () => {
  it('returns null with fewer than n attempts', () => {
    expect(averageOfN([attempt(1000)], 5)).toBeNull();
  });

  it('trims best and worst', () => {
    const attempts = [10000, 11000, 12000, 13000, 50000].map((t) => attempt(t));
    expect(averageOfN(attempts, 5)).toBe(12000); // (11000+12000+13000)/3
  });

  it('counts a single DNF as the worst attempt', () => {
    const attempts = [
      attempt(10000),
      attempt(11000),
      attempt(12000),
      attempt(13000),
      attempt(9000, 'dnf'),
    ];
    expect(averageOfN(attempts, 5)).toBe(12000); // trims 10000 (best) and DNF (worst)
  });

  it('is DNF with two or more DNFs', () => {
    const attempts = [
      attempt(10000),
      attempt(11000),
      attempt(12000),
      attempt(13000, 'dnf'),
      attempt(9000, 'dnf'),
    ];
    expect(averageOfN(attempts, 5)).toBe('dnf');
  });

  it('applies +2 before averaging', () => {
    const attempts = [10000, 11000, 12000, 13000, 14000].map((t) => attempt(t));
    attempts[2] = attempt(12000, 'plus2'); // becomes 14000
    expect(averageOfN(attempts, 5)).toBeCloseTo((11000 + 13000 + 14000) / 3, 6);
  });

  it('uses only the last n attempts', () => {
    const old = [attempt(1000), attempt(1000)];
    const recent = [10000, 11000, 12000, 13000, 14000].map((t) => attempt(t));
    expect(averageOfN([...old, ...recent], 5)).toBe(12000);
  });
});

describe('computeStats', () => {
  it('handles no attempts', () => {
    const stats = computeStats([]);
    expect(stats.count).toBe(0);
    expect(stats.best).toBeNull();
    expect(stats.worst).toBeNull();
    expect(stats.mean).toBeNull();
    expect(stats.median).toBeNull();
    expect(stats.stdDev).toBeNull();
    expect(stats.ao5).toBeNull();
    expect(stats.ao12).toBeNull();
  });

  it('ignores DNFs for best/worst/mean but counts them in count', () => {
    const stats = computeStats([attempt(10000), attempt(20000), attempt(5000, 'dnf')]);
    expect(stats.count).toBe(3);
    expect(stats.best).toBe(10000);
    expect(stats.worst).toBe(20000);
    expect(stats.mean).toBe(15000);
  });

  it('includes +2 in best/worst', () => {
    const stats = computeStats([attempt(10000, 'plus2'), attempt(11000)]);
    expect(stats.best).toBe(11000);
    expect(stats.worst).toBe(12000);
  });

  it('all-DNF gives null aggregates', () => {
    const stats = computeStats([attempt(10000, 'dnf'), attempt(11000, 'dnf')]);
    expect(stats.count).toBe(2);
    expect(stats.best).toBeNull();
    expect(stats.mean).toBeNull();
  });
});
