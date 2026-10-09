export type Penalty = 'none' | 'plus2' | 'dnf';

export interface Scramble {
  id: string;
  scramble: string;
  createdAt: number;
  /** Display number in "Scramble #n"; assigned once and kept when other scrambles are deleted. */
  number: number;
  favorite: boolean;
  /** Optional user-given name; falls back to "Scramble #n" in the UI. */
  title?: string;
  notes?: string;
}

/** A scramble before the store has given it its number. */
export type NewScramble = Omit<Scramble, 'number'>;

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
