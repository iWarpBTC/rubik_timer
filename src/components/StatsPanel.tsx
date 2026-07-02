import { useMemo } from 'react';
import type { Solve } from '../types';
import { computeStats } from '../lib/stats';
import { formatAverage, formatStat } from '../lib/format';

/** `solves` must be in chronological order (oldest first). */
export function StatsPanel({ solves }: { solves: Solve[] }) {
  const stats = useMemo(() => computeStats(solves), [solves]);

  const items: Array<[string, string]> = [
    ['Solves', String(stats.count)],
    ['Best', formatStat(stats.best)],
    ['Worst', formatStat(stats.worst)],
    ['Average', formatStat(stats.mean)],
    ['Median', formatStat(stats.median)],
    ['Std Dev', formatStat(stats.stdDev)],
    ['Ao5', formatAverage(stats.ao5)],
    ['Ao12', formatAverage(stats.ao12)],
  ];

  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-2 text-center">
          <div className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</div>
          <div className="mt-0.5 font-mono text-sm text-neutral-100">{value}</div>
        </div>
      ))}
    </div>
  );
}
