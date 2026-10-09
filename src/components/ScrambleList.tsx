import { useMemo, useState, type RefObject } from 'react';
import type { Scramble, Solve } from '../types';
import { useDispatch, useStore } from '../store/StoreContext';
import { computeStats } from '../lib/stats';
import { formatStat } from '../lib/format';
import { createScramble } from '../lib/scramble';
import { useLanguage } from '../i18n/LanguageContext';
import type { Messages } from '../i18n/messages';
import { ConfirmDialog } from './ConfirmDialog';
import { ImportExport } from './ImportExport';

export type SortOrder = 'newest' | 'oldest' | 'best-average' | 'most-solves' | 'favorites-first';

const SORT_ORDERS: readonly SortOrder[] = ['newest', 'oldest', 'best-average', 'most-solves', 'favorites-first'];

interface ScrambleSummary {
  scramble: Scramble;
  count: number;
  best: number | null;
  mean: number | null;
}

function buildSummaries(scrambles: Scramble[], solves: Solve[]): ScrambleSummary[] {
  const byScramble = new Map<string, Solve[]>();
  for (const solve of solves) {
    const list = byScramble.get(solve.scrambleId);
    if (list) list.push(solve);
    else byScramble.set(solve.scrambleId, [solve]);
  }
  return scrambles.map((scramble) => {
    const stats = computeStats(byScramble.get(scramble.id) ?? []);
    return {
      scramble,
      count: stats.count,
      best: stats.best,
      mean: stats.mean,
    };
  });
}

function sortSummaries(summaries: ScrambleSummary[], order: SortOrder): ScrambleSummary[] {
  const sorted = [...summaries];
  switch (order) {
    case 'newest':
      sorted.sort((a, b) => b.scramble.createdAt - a.scramble.createdAt);
      break;
    case 'oldest':
      sorted.sort((a, b) => a.scramble.createdAt - b.scramble.createdAt);
      break;
    case 'best-average':
      sorted.sort((a, b) => (a.mean ?? Infinity) - (b.mean ?? Infinity));
      break;
    case 'most-solves':
      sorted.sort((a, b) => b.count - a.count);
      break;
    case 'favorites-first':
      sorted.sort(
        (a, b) =>
          Number(b.scramble.favorite) - Number(a.scramble.favorite) ||
          b.scramble.createdAt - a.scramble.createdAt,
      );
      break;
  }
  return sorted;
}

function displayName(summary: ScrambleSummary, t: Messages): string {
  return summary.scramble.title ?? t.scrambleName(summary.scramble.number);
}

function ScrambleListItem({
  summary,
  active,
  onDeleteRequest,
  onChosen,
}: {
  summary: ScrambleSummary;
  active: boolean;
  onDeleteRequest: (scramble: Scramble) => void;
  onChosen: () => void;
}) {
  const { t } = useLanguage();
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const { scramble } = summary;

  const commitRename = () => {
    const title = draftTitle.trim();
    dispatch({
      type: 'UPDATE_SCRAMBLE',
      id: scramble.id,
      patch: title.length > 0 ? { title } : { title: undefined },
    });
    setEditing(false);
  };

  return (
    <li>
      <div
        onClick={() => {
          dispatch({ type: 'SELECT_SCRAMBLE', id: scramble.id });
          onChosen();
        }}
        className={`group cursor-pointer border-l-2 px-3 py-2 ${
          active
            ? 'border-blue-500 bg-neutral-800/70'
            : 'border-transparent hover:bg-neutral-900'
        }`}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              dispatch({
                type: 'UPDATE_SCRAMBLE',
                id: scramble.id,
                patch: { favorite: !scramble.favorite },
              });
            }}
            aria-label={scramble.favorite ? t.list.removeFavorite : t.list.markFavorite}
            className={scramble.favorite ? 'text-yellow-400' : 'text-neutral-600 hover:text-neutral-400'}
          >
            {scramble.favorite ? '★' : '☆'}
          </button>

          {editing ? (
            <input
              type="text"
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename();
                if (e.key === 'Escape') setEditing(false);
              }}
              onClick={(e) => e.stopPropagation()}
              placeholder={t.scrambleName(summary.scramble.number)}
              className="min-w-0 flex-1 rounded border border-neutral-600 bg-neutral-950 px-1 py-0.5 text-base text-neutral-100 focus:outline-none sm:text-sm"
            />
          ) : (
            <span className="min-w-0 flex-1 truncate text-sm text-neutral-200">{displayName(summary, t)}</span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setDraftTitle(scramble.title ?? '');
              setEditing(true);
            }}
            aria-label={t.list.rename}
            className="invisible rounded px-1 text-xs text-neutral-500 group-focus-within:visible group-hover:visible hover:text-neutral-200 pointer-coarse:visible pointer-coarse:px-2 pointer-coarse:py-1"
          >
            ✎
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteRequest(scramble);
            }}
            aria-label={t.list.delete}
            className="invisible rounded px-1 text-xs text-neutral-500 group-focus-within:visible group-hover:visible hover:text-red-400 pointer-coarse:visible pointer-coarse:px-2 pointer-coarse:py-1"
          >
            ✕
          </button>
        </div>
        <div className="mt-1 flex gap-3 pl-6 font-mono text-xs text-neutral-500">
          <span>{t.solveCount(summary.count)}</span>
          <span>
            {t.list.best} {formatStat(summary.best)}
          </span>
          <span>
            {t.list.avg} {formatStat(summary.mean)}
          </span>
        </div>
      </div>
    </li>
  );
}

export function ScrambleList({
  searchRef,
  onDialogOpenChange,
  onScrambleChosen,
}: {
  searchRef: RefObject<HTMLInputElement | null>;
  onDialogOpenChange: (open: boolean) => void;
  /** Called after the user picks or creates a scramble (closes the list on phones). */
  onScrambleChosen: () => void;
}) {
  const { t } = useLanguage();
  const { scrambles, solves, activeScrambleId } = useStore();
  const dispatch = useDispatch();
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [deleteTarget, setDeleteTarget] = useState<Scramble | null>(null);

  const setDeleteTargetBoth = (target: Scramble | null) => {
    setDeleteTarget(target);
    onDialogOpenChange(target !== null);
  };

  const visible = useMemo(() => {
    const summaries = buildSummaries(scrambles, solves);
    const query = search.trim().toLowerCase();
    const filtered =
      query.length === 0
        ? summaries
        : summaries.filter(
            (s) =>
              s.scramble.scramble.toLowerCase().includes(query) ||
              displayName(s, t).toLowerCase().includes(query),
          );
    return sortSummaries(filtered, sortOrder);
  }, [scrambles, solves, search, sortOrder, t]);

  const handleNewScramble = () => {
    dispatch({ type: 'ADD_SCRAMBLE', scramble: createScramble() });
    onScrambleChosen();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-2 border-b border-neutral-800 p-3">
        <button
          type="button"
          onClick={handleNewScramble}
          className="w-full rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-500"
        >
          {t.list.newScramble}
        </button>
        <input
          ref={searchRef}
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
          }}
          placeholder={t.list.search}
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-base text-neutral-200 placeholder:text-neutral-600 focus:border-neutral-500 focus:outline-none sm:text-sm"
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          aria-label={t.list.sortLabel}
          className="w-full rounded-md border border-neutral-700 bg-neutral-950 px-2 py-1.5 text-base text-neutral-300 focus:border-neutral-500 focus:outline-none sm:text-sm"
        >
          {SORT_ORDERS.map((key) => (
            <option key={key} value={key}>
              {t.list.sort[key]}
            </option>
          ))}
        </select>
      </div>

      <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {visible.length === 0 ? (
          <li className="px-3 py-4 text-sm text-neutral-500">
            {scrambles.length === 0 ? t.list.empty : t.list.noMatch}
          </li>
        ) : (
          visible.map((summary) => (
            <ScrambleListItem
              key={summary.scramble.id}
              summary={summary}
              active={summary.scramble.id === activeScrambleId}
              onDeleteRequest={setDeleteTargetBoth}
              onChosen={onScrambleChosen}
            />
          ))
        )}
      </ul>

      <ImportExport onDialogOpenChange={onDialogOpenChange} />

      {deleteTarget !== null && (
        <ConfirmDialog
          title={t.list.deleteTitle}
          message={t.list.deleteMessage(
            deleteTarget.title ?? t.scrambleName(deleteTarget.number),
            solves.filter((s) => s.scrambleId === deleteTarget.id).length,
          )}
          confirmLabel={t.list.deleteConfirm}
          destructive
          onConfirm={() => {
            dispatch({ type: 'DELETE_SCRAMBLE', id: deleteTarget.id });
            setDeleteTargetBoth(null);
          }}
          onCancel={() => setDeleteTargetBoth(null)}
        />
      )}
    </div>
  );
}
