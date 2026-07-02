import type { Penalty, Solve } from '../types';
import { useDispatch, useStore } from '../store/StoreContext';
import { formatDateTime, formatResult } from '../lib/format';

const PENALTY_OPTIONS: Array<{ value: Penalty; label: string }> = [
  { value: 'none', label: 'OK' },
  { value: 'plus2', label: '+2' },
  { value: 'dnf', label: 'DNF' },
];

function PenaltyPicker({ solve }: { solve: Solve }) {
  const dispatch = useDispatch();
  return (
    <div className="flex overflow-hidden rounded-md border border-neutral-700">
      {PENALTY_OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => dispatch({ type: 'UPDATE_SOLVE', id: solve.id, patch: { penalty: value } })}
          className={`px-2 py-0.5 text-xs ${
            solve.penalty === value
              ? 'bg-neutral-200 font-medium text-neutral-900'
              : 'text-neutral-400 hover:bg-neutral-800'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SolveRow({ solve, index, selected }: { solve: Solve; index: number; selected: boolean }) {
  const dispatch = useDispatch();

  return (
    <tr
      onClick={() => dispatch({ type: 'SELECT_SOLVE', id: solve.id })}
      className={`cursor-pointer border-t border-neutral-800 ${
        selected ? 'bg-neutral-800/70' : 'hover:bg-neutral-900'
      }`}
    >
      <td className="px-3 py-1.5 text-xs text-neutral-500">{index}</td>
      <td
        className={`px-3 py-1.5 font-mono text-sm ${
          solve.penalty === 'dnf' ? 'text-red-400' : 'text-neutral-100'
        }`}
      >
        {formatResult(solve.timeMs, solve.penalty)}
      </td>
      <td className="px-3 py-1.5">
        <PenaltyPicker solve={solve} />
      </td>
      <td className="px-3 py-1.5">
        <input
          type="text"
          value={solve.notes ?? ''}
          placeholder="notes"
          onChange={(e) =>
            dispatch({ type: 'UPDATE_SOLVE', id: solve.id, patch: { notes: e.target.value } })
          }
          className="w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-neutral-300 placeholder:text-neutral-600 hover:border-neutral-700 focus:border-neutral-600 focus:outline-none"
        />
      </td>
      <td className="whitespace-nowrap px-3 py-1.5 text-xs text-neutral-500">
        {formatDateTime(solve.createdAt)}
      </td>
      <td className="px-3 py-1.5 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dispatch({ type: 'DELETE_SOLVE', id: solve.id });
          }}
          aria-label="Delete solve"
          className="rounded px-1.5 py-0.5 text-neutral-500 hover:bg-neutral-800 hover:text-red-400"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

/** `solves` in chronological order; rendered newest first. */
export function SolveHistory({ solves }: { solves: Solve[] }) {
  const { selectedSolveId } = useStore();

  if (solves.length === 0) {
    return <p className="py-4 text-sm text-neutral-500">No solves yet. Hold Space to start the timer.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-md border border-neutral-800">
      <table className="w-full text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Time</th>
            <th className="px-3 py-2 font-medium">Penalty</th>
            <th className="px-3 py-2 font-medium">Notes</th>
            <th className="px-3 py-2 font-medium">Date</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {[...solves].reverse().map((solve, i) => (
            <SolveRow
              key={solve.id}
              solve={solve}
              index={solves.length - i}
              selected={solve.id === selectedSolveId}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
