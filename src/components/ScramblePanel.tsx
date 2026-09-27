import type { TimerState } from '../hooks/useTimer';
import { useLanguage } from '../i18n/LanguageContext';
import { createScramble } from '../lib/scramble';
import { useActiveScramble, useDispatch, useScrambleNumbers, useSolvesFor } from '../store/StoreContext';
import { CubeNet } from './CubeNet';
import { SolveHistory } from './SolveHistory';
import { StatsPanel } from './StatsPanel';
import { TimerDisplay } from './TimerDisplay';

export function ScramblePanel({ timer }: { timer: TimerState }) {
  const { t } = useLanguage();
  const scramble = useActiveScramble();
  const solves = useSolvesFor(scramble?.id ?? null);
  const numbers = useScrambleNumbers();
  const dispatch = useDispatch();

  if (scramble === null) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
        <p className="text-sm text-neutral-500">{t.panel.noneSelected}</p>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADD_SCRAMBLE', scramble: createScramble() })}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          {t.list.newScramble}
        </button>
        <p className="hidden text-xs text-neutral-600 md:block">
          {t.panel.shortcut} <kbd className="rounded border border-neutral-700 px-1">Ctrl+N</kbd>
        </p>
      </div>
    );
  }

  const hideDetails = timer.phase === 'running' || timer.phase === 'ready';

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:space-y-6 sm:p-6">
      <header>
        <div className="text-xs uppercase tracking-wide text-neutral-500">
          {scramble.title ?? t.scrambleName(numbers.get(scramble.id) ?? '?')}
        </div>
        <p className="mt-2 font-mono text-lg leading-relaxed tracking-wide text-neutral-100 sm:text-2xl">
          {scramble.scramble}
        </p>
      </header>

      <TimerDisplay phase={timer.phase} displayMs={timer.displayMs} padHandlers={timer.padHandlers} />

      <div className={hideDetails ? 'invisible' : undefined}>
        <div className="flex justify-center">
          <CubeNet scramble={scramble.scramble} />
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-neutral-500">{t.panel.statistics}</h2>
            <StatsPanel solves={solves} />
          </section>

          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-neutral-500">{t.panel.notes}</h2>
            <textarea
              value={scramble.notes ?? ''}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_SCRAMBLE', id: scramble.id, patch: { notes: e.target.value } })
              }
              placeholder={t.panel.notesPlaceholder}
              rows={2}
              className="w-full resize-y rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-base text-neutral-300 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none sm:text-sm"
            />
          </section>

          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-neutral-500">{t.panel.history}</h2>
            <SolveHistory solves={solves} />
          </section>
        </div>
      </div>
    </div>
  );
}
