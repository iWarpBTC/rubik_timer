import type { TimerState } from '../hooks/useTimer';
import { useActiveScramble, useDispatch, useScrambleNumbers, useSolvesFor } from '../store/StoreContext';
import { CubeNet } from './CubeNet';
import { SolveHistory } from './SolveHistory';
import { StatsPanel } from './StatsPanel';
import { TimerDisplay } from './TimerDisplay';

export function ScramblePanel({ timer }: { timer: TimerState }) {
  const scramble = useActiveScramble();
  const solves = useSolvesFor(scramble?.id ?? null);
  const numbers = useScrambleNumbers();
  const dispatch = useDispatch();

  if (scramble === null) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-neutral-500">
          Select a scramble on the left, or press <kbd className="rounded border border-neutral-700 px-1">Ctrl+N</kbd> for a new one.
        </p>
      </div>
    );
  }

  const hideDetails = timer.phase === 'running' || timer.phase === 'ready';

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <div className="text-xs uppercase tracking-wide text-neutral-500">
          {scramble.title ?? `Scramble #${numbers.get(scramble.id) ?? '?'}`}
        </div>
        <p className="mt-2 font-mono text-2xl leading-relaxed tracking-wide text-neutral-100">
          {scramble.scramble}
        </p>
      </header>

      <TimerDisplay phase={timer.phase} displayMs={timer.displayMs} />

      <div className={hideDetails ? 'invisible' : undefined}>
        <div className="flex justify-center">
          <CubeNet scramble={scramble.scramble} />
        </div>

        <div className="mt-6 space-y-6">
          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Statistics</h2>
            <StatsPanel solves={solves} />
          </section>

          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Notes</h2>
            <textarea
              value={scramble.notes ?? ''}
              onChange={(e) =>
                dispatch({ type: 'UPDATE_SCRAMBLE', id: scramble.id, patch: { notes: e.target.value } })
              }
              placeholder="Notes about this scramble…"
              rows={2}
              className="w-full resize-y rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-300 placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
            />
          </section>

          <section>
            <h2 className="mb-2 text-xs uppercase tracking-wide text-neutral-500">Solve history</h2>
            <SolveHistory solves={solves} />
          </section>
        </div>
      </div>
    </div>
  );
}
