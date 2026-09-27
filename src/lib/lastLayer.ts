import { applyAlgorithmTo, invertAlgorithm, solvedCube, type Face } from './cube';

/**
 * Last-layer (top layer) views of an algorithm, for the OLL/PLL cheatsheet.
 *
 * Positions on the top face use the U sticker indices 0..8, row-major as
 * seen from above with the back row first: corners 0 2 6 8, edges 1 3 5 7.
 */

/** Top-face indices of the eight last-layer pieces. */
const PIECE_POSITIONS = [0, 1, 2, 3, 5, 6, 7, 8] as const;

/**
 * Side stickers of the top layer, in drawing order as seen from above:
 * back and front strips left to right, left and right strips back to front.
 */
export const SIDE_STRIPS = {
  back: [47, 46, 45],
  left: [36, 37, 38],
  right: [11, 10, 9],
  front: [18, 19, 20],
} as const;

const LAST_LAYER_STICKERS = new Set<number>([
  ...PIECE_POSITIONS,
  ...SIDE_STRIPS.back,
  ...SIDE_STRIPS.left,
  ...SIDE_STRIPS.right,
  ...SIDE_STRIPS.front,
]);

/** True when `alg` only rearranges the top layer: centers and first two layers end where they started. */
export function isLastLayerAlgorithm(alg: string): boolean {
  const solved = solvedCube();
  const after = applyAlgorithmTo(solvedCube(), alg);
  return after.every((face, i) => LAST_LAYER_STICKERS.has(i) || face === solved[i]);
}

export interface LastLayerCase {
  /** The nine top stickers of the case the algorithm solves. */
  top: Face[];
  back: Face[];
  left: Face[];
  right: Face[];
  front: Face[];
  /**
   * Pieces the algorithm moves across the top face: the piece at `from`
   * ends at `to`. Pieces whose top sticker leaves the top face are omitted.
   */
  moves: Array<{ from: number; to: number }>;
}

/** The case `alg` solves (a solved cube with the algorithm undone) and where it moves each piece. */
export function lastLayerCase(alg: string): LastLayerCase {
  const state = applyAlgorithmTo(solvedCube(), invertAlgorithm(alg));
  const pick = (indices: readonly number[]) => indices.map((i) => state[i]!);

  const tracked = applyAlgorithmTo(
    Array.from({ length: 54 }, (_, i) => i),
    alg,
  );
  const moves: LastLayerCase['moves'] = [];
  for (const from of PIECE_POSITIONS) {
    const to = tracked.indexOf(from);
    if (to !== from && to >= 0 && to < 9) moves.push({ from, to });
  }

  return {
    top: pick([0, 1, 2, 3, 4, 5, 6, 7, 8]),
    back: pick(SIDE_STRIPS.back),
    left: pick(SIDE_STRIPS.left),
    right: pick(SIDE_STRIPS.right),
    front: pick(SIDE_STRIPS.front),
    moves,
  };
}
