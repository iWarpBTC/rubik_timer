import { formatMs } from '../lib/format';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useLanguage } from '../i18n/LanguageContext';
import type { TimerPadHandlers, TimerPhase } from '../hooks/useTimer';

const PHASE_COLOR: Record<TimerPhase, string> = {
  idle: 'text-neutral-100',
  holding: 'text-red-500',
  ready: 'text-green-500',
  running: 'text-neutral-100',
};

export function TimerDisplay({
  phase,
  displayMs,
  padHandlers,
}: {
  phase: TimerPhase;
  displayMs: number;
  padHandlers: TimerPadHandlers;
}) {
  const { t } = useLanguage();
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
      <p className="mt-2 text-center text-xs text-neutral-500">{t.timerHint(phase, touch)}</p>
    </div>
  );
}
