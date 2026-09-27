import { describe, expect, it } from 'vitest';
import { applyAlgorithmTo, FACES, type Face } from './cube';
import { NOTATION, type MoveShape } from './notation';

/** A sticker in the given layer, on a face the turn carries it off of. */
function probe(axis: MoveShape['axis'], layer: number): number {
  switch (axis) {
    case 'x':
      return 18 + 3 + (layer + 1); // F face, middle row
    case 'y':
      return 18 + (1 - layer) * 3 + 1; // F face, middle column
    case 'z':
      return (layer + 1) * 3 + 1; // U face, middle column
  }
}

/** Where a +1 / -1 turn sends the probe sticker (R/U/F-like turns: F→U, F→L, U→R). */
const DESTINATION: Record<MoveShape['axis'], Record<1 | -1, Face>> = {
  x: { 1: 'U', [-1]: 'D' },
  y: { 1: 'L', [-1]: 'R' },
  z: { 1: 'R', [-1]: 'L' },
};

describe('notation reference', () => {
  const moves = NOTATION.flatMap((g) => g.moves);

  it.each(moves.map((m) => [m.move, m]))('%s is drawn with the layers and direction it really turns', (_, { move, shape }) => {
    const tracked = applyAlgorithmTo(
      Array.from({ length: 54 }, (_, i) => i),
      move,
    );
    for (const layer of [-1, 0, 1]) {
      const sticker = probe(shape.axis, layer);
      const face = FACES[Math.floor(tracked.indexOf(sticker) / 9)];
      if (shape.layers.includes(layer)) expect(face).toBe(DESTINATION[shape.axis][shape.dir]);
      else expect(tracked.indexOf(sticker)).toBe(sticker);
    }
  });
});
