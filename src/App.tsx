import { useEffect, useRef, useState } from 'react';
import { ScrambleList } from './components/ScrambleList';
import { ScramblePanel } from './components/ScramblePanel';
import { useTimer } from './hooks/useTimer';
import { generateScramble } from './lib/scramble';
import { newId } from './lib/id';
import { useDispatch, useStore } from './store/StoreContext';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

export function App() {
  const { activeScrambleId, selectedSolveId } = useStore();
  const dispatch = useDispatch();
  const searchRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const activeScrambleIdRef = useRef(activeScrambleId);
  activeScrambleIdRef.current = activeScrambleId;
  const selectedSolveIdRef = useRef(selectedSolveId);
  selectedSolveIdRef.current = selectedSolveId;

  const timer = useTimer(!dialogOpen && activeScrambleId !== null, (elapsedMs) => {
    const scrambleId = activeScrambleIdRef.current;
    if (scrambleId === null) return;
    dispatch({
      type: 'ADD_SOLVE',
      solve: {
        id: newId(),
        scrambleId,
        timeMs: elapsedMs,
        penalty: 'none',
        createdAt: Date.now(),
      },
    });
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        dispatch({
          type: 'ADD_SCRAMBLE',
          scramble: { id: newId(), scramble: generateScramble(), createdAt: Date.now(), favorite: false },
        });
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
        searchRef.current?.select();
        return;
      }
      if (e.key === 'Delete' && !isTypingTarget(e.target)) {
        const solveId = selectedSolveIdRef.current;
        if (solveId !== null) {
          e.preventDefault();
          dispatch({ type: 'DELETE_SOLVE', id: solveId });
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch]);

  return (
    <div className="flex h-screen bg-neutral-950 text-neutral-100">
      <aside className="w-80 shrink-0 border-r border-neutral-800">
        <ScrambleList searchRef={searchRef} onDialogOpenChange={setDialogOpen} />
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto">
        <ScramblePanel timer={timer} />
      </main>
    </div>
  );
}
