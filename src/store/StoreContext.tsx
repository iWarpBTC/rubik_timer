import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { AppData, NewScramble, Scramble, Solve } from '../types';
import { loadActiveScrambleId, loadData, saveActiveScrambleId, saveData } from '../lib/storage';

export interface StoreState {
  scrambles: Scramble[];
  solves: Solve[];
  activeScrambleId: string | null;
  selectedSolveId: string | null;
}

export type Action =
  | { type: 'ADD_SCRAMBLE'; scramble: NewScramble }
  | { type: 'SELECT_SCRAMBLE'; id: string }
  | { type: 'UPDATE_SCRAMBLE'; id: string; patch: Partial<Pick<Scramble, 'title' | 'favorite' | 'notes'>> }
  | { type: 'DELETE_SCRAMBLE'; id: string }
  | { type: 'ADD_SOLVE'; solve: Solve }
  | { type: 'UPDATE_SOLVE'; id: string; patch: Partial<Pick<Solve, 'penalty' | 'notes'>> }
  | { type: 'DELETE_SOLVE'; id: string }
  | { type: 'SELECT_SOLVE'; id: string | null }
  | { type: 'IMPORT_DATA'; data: AppData };

function nextScrambleNumber(scrambles: Scramble[]): number {
  return scrambles.reduce((max, s) => Math.max(max, s.number), 0) + 1;
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'ADD_SCRAMBLE':
      return {
        ...state,
        scrambles: [...state.scrambles, { ...action.scramble, number: nextScrambleNumber(state.scrambles) }],
        activeScrambleId: action.scramble.id,
        selectedSolveId: null,
      };
    case 'SELECT_SCRAMBLE':
      return { ...state, activeScrambleId: action.id, selectedSolveId: null };
    case 'UPDATE_SCRAMBLE':
      return {
        ...state,
        scrambles: state.scrambles.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      };
    case 'DELETE_SCRAMBLE':
      return {
        ...state,
        scrambles: state.scrambles.filter((s) => s.id !== action.id),
        solves: state.solves.filter((s) => s.scrambleId !== action.id),
        activeScrambleId: state.activeScrambleId === action.id ? null : state.activeScrambleId,
        selectedSolveId: null,
      };
    case 'ADD_SOLVE':
      return { ...state, solves: [...state.solves, action.solve], selectedSolveId: action.solve.id };
    case 'UPDATE_SOLVE':
      return {
        ...state,
        solves: state.solves.map((s) => (s.id === action.id ? { ...s, ...action.patch } : s)),
      };
    case 'DELETE_SOLVE':
      return {
        ...state,
        solves: state.solves.filter((s) => s.id !== action.id),
        selectedSolveId: state.selectedSolveId === action.id ? null : state.selectedSolveId,
      };
    case 'SELECT_SOLVE':
      return { ...state, selectedSolveId: action.id };
    case 'IMPORT_DATA':
      return {
        scrambles: action.data.scrambles,
        solves: action.data.solves,
        activeScrambleId: action.data.scrambles.at(-1)?.id ?? null,
        selectedSolveId: null,
      };
  }
}

function initialState(): StoreState {
  const data = loadData();
  const storedActive = loadActiveScrambleId();
  const activeScrambleId =
    storedActive !== null && data.scrambles.some((s) => s.id === storedActive)
      ? storedActive
      : (data.scrambles.at(-1)?.id ?? null);
  return { ...data, activeScrambleId, selectedSolveId: null };
}

const StateContext = createContext<StoreState | null>(null);
const DispatchContext = createContext<Dispatch<Action> | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    saveData({ scrambles: state.scrambles, solves: state.solves });
  }, [state.scrambles, state.solves]);

  useEffect(() => {
    saveActiveScrambleId(state.activeScrambleId);
  }, [state.activeScrambleId]);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useStore(): StoreState {
  const state = useContext(StateContext);
  if (state === null) throw new Error('useStore must be used inside StoreProvider');
  return state;
}

export function useDispatch(): Dispatch<Action> {
  const dispatch = useContext(DispatchContext);
  if (dispatch === null) throw new Error('useDispatch must be used inside StoreProvider');
  return dispatch;
}

export function useActiveScramble(): Scramble | null {
  const { scrambles, activeScrambleId } = useStore();
  return useMemo(
    () => scrambles.find((s) => s.id === activeScrambleId) ?? null,
    [scrambles, activeScrambleId],
  );
}

/** Solves for one scramble, oldest first. */
export function useSolvesFor(scrambleId: string | null): Solve[] {
  const { solves } = useStore();
  return useMemo(
    () => (scrambleId === null ? [] : solves.filter((s) => s.scrambleId === scrambleId)),
    [solves, scrambleId],
  );
}
