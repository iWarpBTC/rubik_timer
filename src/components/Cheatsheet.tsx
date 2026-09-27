import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ALGORITHM_GROUPS, ALGORITHMS, TRIGGERS, type Algorithm } from '../lib/algorithms';
import { useLanguage } from '../i18n/LanguageContext';
import { NOTATION, type NotationMove } from '../lib/notation';
import { LastLayerDiagram } from './LastLayerDiagram';
import { MoveDiagram } from './MoveDiagram';

export type CheatsheetTab = 'moves' | 'algorithms';

const TABS: readonly CheatsheetTab[] = ['moves', 'algorithms'];

function MoveCard({ move, name, description, shape }: NotationMove) {
  const { l } = useLanguage();
  const variants = [
    { label: move, variant: 'cw', caption: '↻ 90°' },
    { label: `${move}'`, variant: 'ccw', caption: '↺ 90°' },
    { label: `${move}2`, variant: 'half', caption: '180°' },
  ] as const;

  return (
    <li className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3 sm:block">
      <div className="w-24 shrink-0 sm:w-auto">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:gap-2">
          <span className="font-mono text-lg font-bold text-neutral-100">{move}</span>
          <span className="text-sm text-neutral-300">{l(name)}</span>
        </div>
        <p className="text-xs text-neutral-500">{l(description)}</p>
      </div>
      <div className="grid flex-1 grid-cols-3 gap-1 sm:mt-2">
        {variants.map(({ label, variant, caption }) => (
          <figure key={variant} className="flex flex-col items-center">
            <MoveDiagram shape={shape} variant={variant} className="h-14 w-14 sm:h-18 sm:w-18" />
            <figcaption className="mt-1 text-center">
              <span className="font-mono text-sm text-neutral-100">{label}</span>
              <span className="block text-[10px] text-neutral-500">{caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </li>
  );
}

function MovesTab() {
  const { t, l } = useLanguage();
  const intro = t.cheatsheet.movesIntro;
  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-400">
        {intro.before}
        <strong className="font-medium text-neutral-200">{intro.clockwise}</strong>
        {intro.middle}
        <span className="font-mono text-neutral-200">R'</span>
        {intro.prime}
        <span className="font-mono text-neutral-200">2</span>
        {intro.after}
      </p>
      {NOTATION.map((group) => (
        <section key={group.id}>
          <h3 className="text-xs uppercase tracking-wide text-neutral-500">{l(group.title)}</h3>
          <p className="mb-2 text-xs text-neutral-600">{l(group.note)}</p>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {group.moves.map((move) => (
              <MoveCard key={move.move} {...move} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function AlgorithmCard({ algorithm, kind }: { algorithm: Algorithm; kind: 'OLL' | 'PLL' }) {
  const { t, l, lang } = useLanguage();
  return (
    <li className="flex gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-3">
      <LastLayerDiagram
        alg={algorithm.alg}
        kind={kind}
        label={t.cheatsheet.caseLabel}
        className="h-20 w-20 shrink-0"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-medium text-neutral-100">{l(algorithm.name)}</span>
          {algorithm.short !== undefined && (
            <span className="rounded bg-neutral-800 px-1.5 font-mono text-[11px] text-neutral-400">
              {algorithm.short}
            </span>
          )}
        </div>
        {lang === 'cs' && algorithm.czech !== undefined && (
          <div className="text-xs italic text-neutral-500">
            {algorithm.czech}
          </div>
        )}
        <p className="mt-1.5 font-mono text-sm leading-relaxed text-neutral-100">{algorithm.alg}</p>
        <p className="mt-1 text-xs text-neutral-400">{l(algorithm.description)}</p>
      </div>
    </li>
  );
}

function AlgorithmsTab() {
  const { t, l } = useLanguage();
  return (
    <div className="space-y-6">
      <p className="text-sm text-neutral-400">{t.cheatsheet.algorithmsIntro}</p>
      <section>
        <h3 className="text-xs uppercase tracking-wide text-neutral-500">{t.cheatsheet.triggers}</h3>
        <p className="mb-2 text-xs text-neutral-600">{t.cheatsheet.triggersNote}</p>
        <ul className="grid gap-2 md:grid-cols-3">
          {TRIGGERS.map((trigger) => (
            <li key={trigger.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3">
              <div className="font-medium text-neutral-100">{l(trigger.name)}</div>
              <p className="mt-1 font-mono text-sm text-neutral-100">{trigger.alg}</p>
              <p className="mt-1 text-xs text-neutral-400">{l(trigger.description)}</p>
            </li>
          ))}
        </ul>
      </section>
      {ALGORITHM_GROUPS.map((group) => (
        <section key={group.id}>
          <h3 className="text-xs uppercase tracking-wide text-neutral-500">{l(group.title)}</h3>
          <p className="mb-2 text-xs text-neutral-600">{l(group.note)}</p>
          <ul className="grid gap-2 md:grid-cols-2">
            {ALGORITHMS.filter((a) => a.group === group.id).map((algorithm) => (
              <AlgorithmCard key={algorithm.id} algorithm={algorithm} kind={group.set} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

export function Cheatsheet({
  tab,
  onTabChange,
  onClose,
}: {
  tab: CheatsheetTab;
  onTabChange: (tab: CheatsheetTab) => void;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex justify-center bg-black/60 sm:items-center sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t.cheatsheet.title}
        className="flex h-full w-full flex-col bg-neutral-950 sm:max-w-5xl sm:rounded-lg sm:border sm:border-neutral-800 sm:shadow-xl"
      >
        <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
          <h2 className="mr-2 hidden text-sm font-semibold text-neutral-100 sm:block">{t.cheatsheet.title}</h2>
          <div role="tablist" aria-label={t.cheatsheet.sections} className="flex rounded-md border border-neutral-800 p-0.5">
            {TABS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => onTabChange(id)}
                className={`rounded px-3 py-1 text-sm ${
                  tab === id ? 'bg-neutral-800 text-neutral-100' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {t.cheatsheet[id]}
              </button>
            ))}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.cheatsheet.close}
            className="ml-auto rounded-md px-2.5 py-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
          >
            ✕
          </button>
        </div>
        <div key={tab} role="tabpanel" className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
          {tab === 'moves' ? <MovesTab /> : <AlgorithmsTab />}
        </div>
      </div>
    </div>,
    document.body,
  );
}
