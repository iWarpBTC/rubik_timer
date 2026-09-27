/**
 * Minimal 3x3x3 facelet-level cube simulation.
 *
 * Sticker indexing follows the standard (Kociemba) facelet order:
 * U = 0..8, R = 9..17, F = 18..26, D = 27..35, L = 36..44, B = 45..53.
 * Within a face, stickers are row-major as seen when looking straight at
 * the face on the unfolded net (U above F; L F R B in a row; D below F).
 *
 * Scrambles use plain WCA face turns; algorithms may also use slice moves,
 * wide moves and cube rotations (see `applyAlgorithmTo`).
 */

export type Face = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export const FACES: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

/** cube[i] = which face's color is currently at sticker position i. */
export type CubeState = Face[];

export function solvedCube(): CubeState {
  const state: Face[] = [];
  for (const face of FACES) {
    for (let i = 0; i < 9; i++) state.push(face);
  }
  return state;
}

/**
 * Each move is five 4-cycles of sticker positions (a,b,c,d): the sticker at
 * a moves to b, b to c, c to d, d to a. The first two cycles rotate the
 * face itself clockwise; the other three carry the adjacent side stickers.
 */
const MOVE_CYCLES: Record<Face, number[][]> = {
  U: [
    [0, 2, 8, 6],
    [1, 5, 7, 3],
    [18, 36, 45, 9],
    [19, 37, 46, 10],
    [20, 38, 47, 11],
  ],
  D: [
    [27, 29, 35, 33],
    [28, 32, 34, 30],
    [24, 15, 51, 42],
    [25, 16, 52, 43],
    [26, 17, 53, 44],
  ],
  R: [
    [9, 11, 17, 15],
    [10, 14, 16, 12],
    [20, 2, 51, 29],
    [23, 5, 48, 32],
    [26, 8, 45, 35],
  ],
  L: [
    [36, 38, 44, 42],
    [37, 41, 43, 39],
    [0, 18, 27, 53],
    [3, 21, 30, 50],
    [6, 24, 33, 47],
  ],
  F: [
    [18, 20, 26, 24],
    [19, 23, 25, 21],
    [6, 9, 29, 44],
    [7, 12, 28, 41],
    [8, 15, 27, 38],
  ],
  B: [
    [45, 47, 53, 51],
    [46, 50, 52, 48],
    [0, 42, 35, 11],
    [1, 39, 34, 14],
    [2, 36, 33, 17],
  ],
};

/** Middle slices, as four-cycles like above: M turns like L, E like D, S like F. */
type Slice = 'M' | 'E' | 'S';
type Layer = Face | Slice;

const SLICE_CYCLES: Record<Slice, number[][]> = {
  M: [
    [1, 19, 28, 52],
    [4, 22, 31, 49],
    [7, 25, 34, 46],
  ],
  E: [
    [21, 12, 48, 39],
    [22, 13, 49, 40],
    [23, 14, 50, 41],
  ],
  S: [
    [3, 10, 32, 43],
    [4, 13, 31, 40],
    [5, 16, 30, 37],
  ],
};

const LAYER_CYCLES: Record<Layer, number[][]> = { ...MOVE_CYCLES, ...SLICE_CYCLES };

function applyTurn<T>(state: T[], layer: Layer, times: number): void {
  for (let t = 0; t < times; t++) {
    for (const [a, b, c, d] of LAYER_CYCLES[layer].map((cy) => cy as [number, number, number, number])) {
      const saved = state[d]!;
      state[d] = state[c]!;
      state[c] = state[b]!;
      state[b] = state[a]!;
      state[a] = saved;
    }
  }
}

const MOVE_RE = /^([URFDLB])(2|')?$/;

export function isValidScramble(scramble: string): boolean {
  const tokens = scramble.trim().split(/\s+/).filter(Boolean);
  return tokens.length > 0 && tokens.every((t) => MOVE_RE.test(t));
}

/** Applies a WCA-notation scramble ("R U2 F' ...") to a solved cube. */
export function applyScramble(scramble: string): CubeState {
  const state = solvedCube();
  for (const token of scramble.trim().split(/\s+/).filter(Boolean)) {
    const match = MOVE_RE.exec(token);
    if (!match) throw new Error(`Invalid move: ${token}`);
    const face = match[1] as Face;
    const times = match[2] === '2' ? 2 : match[2] === "'" ? 3 : 1;
    applyTurn(state, face, times);
  }
  return state;
}

/** Wide moves and whole-cube rotations as clockwise quarter turns of single layers. */
const COMPOSITE_MOVES: Record<string, Array<[Layer, number]>> = {
  r: [['R', 1], ['M', 3]],
  l: [['L', 1], ['M', 1]],
  u: [['U', 1], ['E', 3]],
  d: [['D', 1], ['E', 1]],
  f: [['F', 1], ['S', 1]],
  b: [['B', 1], ['S', 3]],
  x: [['R', 1], ['M', 3], ['L', 3]],
  y: [['U', 1], ['E', 3], ['D', 3]],
  z: [['F', 1], ['S', 1], ['B', 3]],
};

const ALG_MOVE_RE = /^([URFDLBMESxyz]|[urfdlb]|[URFDLB]w)(2'?|')?$/;

/** Quarter turns (1, 2 or 3) of one move token, e.g. 3 for "R'". */
function tokenTimes(suffix: string | undefined): number {
  if (suffix === undefined) return 1;
  return suffix.startsWith('2') ? 2 : 3;
}

function tokenize(alg: string): string[] {
  return alg.replace(/[()]/g, ' ').trim().split(/\s+/).filter(Boolean);
}

/**
 * Applies an algorithm in extended notation to `state` in place: face turns,
 * slice moves (M E S), wide moves (r or Rw) and cube rotations (x y z).
 * Parentheses are ignored. Works on any sticker array, so callers can track
 * individual stickers by applying it to [0, 1, ..., 53].
 */
export function applyAlgorithmTo<T>(state: T[], alg: string): T[] {
  for (const token of tokenize(alg)) {
    const match = ALG_MOVE_RE.exec(token);
    if (!match) throw new Error(`Invalid move: ${token}`);
    const base = match[1]!.endsWith('w') ? match[1]![0]!.toLowerCase() : match[1]!;
    const times = tokenTimes(match[2]);
    const turns = COMPOSITE_MOVES[base] ?? [[base as Layer, 1]];
    for (const [layer, quarter] of turns) applyTurn(state, layer, (quarter * times) % 4);
  }
  return state;
}

/** Applies an algorithm in extended notation to a solved cube. */
export function applyAlgorithm(alg: string): CubeState {
  return applyAlgorithmTo(solvedCube(), alg);
}

/** The algorithm that undoes `alg`: reversed order, each move inverted. */
export function invertAlgorithm(alg: string): string {
  return tokenize(alg)
    .reverse()
    .map((token) => {
      const match = ALG_MOVE_RE.exec(token);
      if (!match) throw new Error(`Invalid move: ${token}`);
      const times = tokenTimes(match[2]);
      return match[1]! + (times === 2 ? '2' : times === 1 ? "'" : '');
    })
    .join(' ');
}
