import { formatMs } from '../lib/format';
import { useMediaQuery } from '../hooks/useMediaQuery';
import type { TimerPadHandlers, TimerPhase } from '../hooks/useTimer';

const PHASE_COLOR: Record<TimerPhase, string> = {
  idle: 'text-neutral-100',
  holding: 'text-red-500',
  ready: 'text-green-500',
  running: 'text-neutral-100',
};

function hint(phase: TimerPhase, touch: boolean): string {
  switch (phase) {
    case 'running':
      return touch ? 'Tap anywhere to stop' : 'Press Space or click anywhere to stop';
    case 'ready':
      return 'Release to start';
    case 'holding':
      return 'Keep holding…';
    case 'idle':
      return touch ? 'Touch and hold the timer, release to start' : 'Hold Space or click and hold the timer to start';
  }
}

export function TimerDisplay({
  phase,
  displayMs,
  padHandlers,
}: {
  phase: TimerPhase;
  displayMs: number;
  padHandlers: TimerPadHandlers;
}) {
  const touch = useMediaQuery('(pointer: coarse)');

  return (
    <div
      {...padHandlers}
      className={`flex cursor-pointer touch-none flex-col items-center rounded-xl py-8 select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] sm:py-6 ${
        phase === 'idle' ? 'transition-colors hover:bg-neutral-900/60' : ''
      }`}
    >
      <div className={`font-mono text-6xl font-bold tabular-nums sm:text-7xl ${PHASE_COLOR[phase]}`}>
        {formatMs(displayMs)}
      </div>
      <p className="mt-2 text-center text-xs text-neutral-500">{hint(phase, touch)}</p>
    </div>
  );
}
