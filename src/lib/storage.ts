import type { AppData, Penalty, Scramble, Solve } from '../types';
import { isValidScramble } from './cube';

const STORAGE_KEY = 'rubik-timer:data';
const ACTIVE_SCRAMBLE_KEY = 'rubik-timer:active-scramble';
const LIST_OPEN_KEY = 'rubik-timer:list-open';

export const EXPORT_FORMAT = 'rubik-timer';
export const EXPORT_VERSION = 1;

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  scrambles: Scramble[];
  solves: Solve[];
}

const PENALTIES: readonly Penalty[] = ['none', 'plus2', 'dnf'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseScramble(value: unknown): Scramble | null {
  if (!isRecord(value)) return null;
  const { id, scramble, createdAt, favorite, title, notes } = value;
  if (typeof id !== 'string' || id.length === 0) return null;
  if (typeof scramble !== 'string' || !isValidScramble(scramble)) return null;
  if (typeof createdAt !== 'number') return null;
  const result: Scramble = {
    id,
    scramble,
    createdAt,
    favorite: favorite === true,
  };
  if (typeof title === 'string' && title.length > 0) result.title = title;
  if (typeof notes === 'string' && notes.length > 0) result.notes = notes;
  return result;
}

function parseSolve(value: unknown, scrambleIds: ReadonlySet<string>): Solve | null {
  if (!isRecord(value)) return null;
  const { id, scrambleId, timeMs, penalty, createdAt, notes } = value;
  if (typeof id !== 'string' || id.length === 0) return null;
  if (typeof scrambleId !== 'string' || !scrambleIds.has(scrambleId)) return null;
  if (typeof timeMs !== 'number' || !Number.isFinite(timeMs) || timeMs < 0) return null;
  if (typeof penalty !== 'string' || !PENALTIES.includes(penalty as Penalty)) return null;
  if (typeof createdAt !== 'number') return null;
  const result: Solve = {
    id,
    scrambleId,
    timeMs,
    penalty: penalty as Penalty,
    createdAt,
  };
  if (typeof notes === 'string' && notes.length > 0) result.notes = notes;
  return result;
}

function parseData(value: unknown): AppData {
  if (!isRecord(value) || !Array.isArray(value.scrambles) || !Array.isArray(value.solves)) {
    throw new Error('Invalid data: expected "scrambles" and "solves" arrays.');
  }
  const scrambles = value.scrambles
    .map(parseScramble)
    .filter((s): s is Scramble => s !== null)
    .sort((a, b) => a.createdAt - b.createdAt);
  const ids = new Set(scrambles.map((s) => s.id));
  const solves = value.solves
    .map((s) => parseSolve(s, ids))
    .filter((s): s is Solve => s !== null)
    .sort((a, b) => a.createdAt - b.createdAt);
  return { scrambles, solves };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { scrambles: [], solves: [] };
    return parseData(JSON.parse(raw));
  } catch {
    return { scrambles: [], solves: [] };
  }
}

export function saveData(data: AppData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadActiveScrambleId(): string | null {
  return localStorage.getItem(ACTIVE_SCRAMBLE_KEY);
}

export function saveActiveScrambleId(id: string | null): void {
  if (id === null) localStorage.removeItem(ACTIVE_SCRAMBLE_KEY);
  else localStorage.setItem(ACTIVE_SCRAMBLE_KEY, id);
}

/** Whether the scramble list is shown on wide screens; defaults to shown. */
export function loadListOpen(): boolean {
  return localStorage.getItem(LIST_OPEN_KEY) !== 'false';
}

export function saveListOpen(open: boolean): void {
  localStorage.setItem(LIST_OPEN_KEY, String(open));
}

export function serializeExport(data: AppData): string {
  const file: ExportFile = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    scrambles: data.scrambles,
    solves: data.solves,
  };
  return JSON.stringify(file, null, 2);
}

/** Parses an exported JSON file. Throws with a readable message when invalid. */
export function parseImport(json: string): AppData {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('Not a valid JSON file.');
  }
  if (!isRecord(value) || value.format !== EXPORT_FORMAT) {
    throw new Error('Not a rubik-timer export file.');
  }
  if (value.version !== EXPORT_VERSION) {
    throw new Error(`Unsupported export version: ${String(value.version)}.`);
  }
  return parseData(value);
}
