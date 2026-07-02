import { formatMs } from '../lib/format';
import type { TimerPhase } from '../hooks/useTimer';

const PHASE_COLOR: Record<TimerPhase, string> = {
  idle: 'text-neutral-100',
  holding: 'text-red-500',
  ready: 'text-green-500',
  running: 'text-neutral-100',
};

export function TimerDisplay({ phase, displayMs }: { phase: TimerPhase; displayMs: number }) {
  return (
    <div className="flex flex-col items-center py-6">
      <div className={`font-mono text-7xl font-bold tabular-nums ${PHASE_COLOR[phase]}`}>
        {formatMs(displayMs)}
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        {phase === 'running'
          ? 'Press Space to stop'
          : phase === 'ready'
            ? 'Release Space to start'
            : phase === 'holding'
              ? 'Keep holding…'
              : 'Hold Space to start'}
      </p>
    </div>
  );
}
