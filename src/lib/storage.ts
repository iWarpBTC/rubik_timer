import type { AppData, Penalty, Scramble, Solve } from '../types';
import type { Lang } from '../i18n/lang';
import { isValidScramble } from './cube';

const STORAGE_KEY = 'rubik-timer:data';
const ACTIVE_SCRAMBLE_KEY = 'rubik-timer:active-scramble';
const LIST_OPEN_KEY = 'rubik-timer:list-open';
const LANG_KEY = 'rubik-timer:lang';

export const EXPORT_FORMAT = 'rubik-timer';
export const EXPORT_VERSION = 1;

export interface ExportFile {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  scrambles: Scramble[];
  solves: Solve[];
}

export type ImportErrorCode = 'not-json' | 'not-export' | 'version' | 'invalid-data';

/** A rejected import; `code` identifies the reason so the UI can word it. */
export class ImportError extends Error {
  constructor(readonly code: ImportErrorCode) {
    super(code);
    this.name = 'ImportError';
  }
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
    throw new ImportError('invalid-data');
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

/** The language the user picked, or null if they never switched. */
export function loadLang(): Lang | null {
  const value = localStorage.getItem(LANG_KEY);
  return value === 'en' || value === 'cs' ? value : null;
}

export function saveLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang);
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

/** Parses an exported JSON file. Throws an `ImportError` when invalid. */
export function parseImport(json: string): AppData {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new ImportError('not-json');
  }
  if (!isRecord(value) || value.format !== EXPORT_FORMAT) {
    throw new ImportError('not-export');
  }
  if (value.version !== EXPORT_VERSION) {
    throw new ImportError('version');
  }
  return parseData(value);
}
