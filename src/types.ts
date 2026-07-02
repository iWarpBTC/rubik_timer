export type Penalty = 'none' | 'plus2' | 'dnf';

export interface Scramble {
  id: string;
  scramble: string;
  createdAt: number;
  favorite: boolean;
  /** Optional user-given name; falls back to "Scramble #n" in the UI. */
  title?: string;
  notes?: string;
}

export interface Solve {
  id: string;
  scrambleId: string;
  timeMs: number;
  penalty: Penalty;
  createdAt: number;
  notes?: string;
}

export interface AppData {
  scrambles: Scramble[];
  solves: Solve[];
}
