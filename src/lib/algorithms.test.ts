import { describe, expect, it } from 'vitest';
import type { Face } from './cube';
import { ALGORITHM_GROUPS, ALGORITHMS, type Algorithm } from './algorithms';
import { isLastLayerAlgorithm, lastLayerCase } from './lastLayer';

const POSITION_NAMES: Record<number, string> = { 0: 'BL', 1: 'B', 2: 'BR', 3: 'L', 5: 'R', 6: 'FL', 7: 'F', 8: 'FR' };

function byId(id: string): Algorithm {
  const algorithm = ALGORITHMS.find((a) => a.id === id);
  if (!algorithm) throw new Error(`Unknown algorithm: ${id}`);
  return algorithm;
}

/** Where the algorithm moves each top-layer piece, e.g. "BL>BR BR>FR FR>BL". */
function movesOf(id: string): string {
  return lastLayerCase(byId(id).alg)
    .moves.map(({ from, to }) => `${POSITION_NAMES[from]}>${POSITION_NAMES[to]}`)
    .join(' ');
}

/** Yellow (U-colored) stickers of the case: back|left|top|right|front, "Y" = yellow. */
function patternOf(id: string): string {
  const c = lastLayerCase(byId(id).alg);
  const yellow = (faces: Face[]) => faces.map((f) => (f === 'U' ? 'Y' : '.')).join('');
  return [c.back, c.left, c.top, c.right, c.front].map(yellow).join('|');
}

/** Direction of a 3-cycle of corners or edges, seen from above. */
function cycleDirection(id: string, kind: 'corners' | 'edges'): 'clockwise' | 'counterclockwise' {
  const moves = lastLayerCase(byId(id).alg).moves.filter((m) => (m.from % 2 === 0) === (kind === 'corners'));
  expect(moves).toHaveLength(3);
  const next = new Map(moves.map((m) => [m.from, m.to]));
  const a = moves[0]!.from;
  const b = next.get(a)!;
  const c = next.get(b)!;
  const at = (i: number) => [i % 3, Math.floor(i / 3)] as const;
  const [ax, ay] = at(a);
  const [bx, by] = at(b);
  const [cx, cy] = at(c);
  // Rows grow toward the front, so a positive cross product turns clockwise.
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax) > 0 ? 'clockwise' : 'counterclockwise';
}

describe('algorithm cheatsheet', () => {
  it('has unique ids and only known groups', () => {
    expect(new Set(ALGORITHMS.map((a) => a.id)).size).toBe(ALGORITHMS.length);
    const groups = new Set(ALGORITHM_GROUPS.map((g) => g.id));
    for (const algorithm of ALGORITHMS) expect(groups.has(algorithm.group)).toBe(true);
  });

  it('covers every PLL', () => {
    const pll = ALGORITHMS.filter((a) => a.group.startsWith('pll-')).map((a) => a.short);
    expect(pll.sort()).toEqual(
      ['Aa', 'Ab', 'E', 'F', 'Ga', 'Gb', 'Gc', 'Gd', 'H', 'Ja', 'Jb', 'Na', 'Nb', 'Ra', 'Rb', 'T', 'Ua', 'Ub', 'V', 'Y', 'Z'].sort(),
    );
  });

  it.each(ALGORITHMS.map((a) => [a.id, a.alg]))('%s leaves the first two layers intact', (_, alg) => {
    expect(isLastLayerAlgorithm(alg)).toBe(true);
  });
});

describe('OLL cases', () => {
  it.each([
    ['oll-line', '.Y.|Y.Y|..YYYY..Y|...|.Y.'],
    ['oll-l-shape', '...|...|YY.YY.Y..|YYY|.Y.'],
    ['oll-dot', '.YY|YYY|....Y....|.Y.|.YY'],
    ['oll-sune', 'Y..|...|.Y.YYYYY.|Y..|..Y'],
    ['oll-antisune', '..Y|...|YY.YYY.Y.|..Y|Y..'],
    ['oll-h', '...|Y.Y|.Y.YYY.Y.|Y.Y|...'],
    ['oll-pi', '..Y|Y.Y|.Y.YYY.Y.|...|..Y'],
    ['oll-u', '...|...|YYYYYY.Y.|...|Y.Y'],
    ['oll-t', 'Y..|...|.YYYYY.YY|...|Y..'],
    ['oll-l', '...|Y..|.YYYYYYY.|...|..Y'],
  ])('%s solves back|left|top|right|front = %s', (id, pattern) => {
    expect(patternOf(id)).toBe(pattern);
  });
});

describe('PLL cases', () => {
  it.each(ALGORITHMS.filter((a) => a.group.startsWith('pll-')).map((a) => a.id))(
    '%s keeps the top layer oriented',
    (id) => {
      expect(patternOf(id)).toBe('...|...|YYYYYYYYY|...|...');
    },
  );

  it.each([
    ['pll-aa', 'BL>BR BR>FR FR>BL'],
    ['pll-ab', 'BL>FR BR>BL FR>BR'],
    ['pll-e', 'BL>FL BR>FR FL>BL FR>BR'],
    ['pll-ua', 'L>F R>L F>R'],
    ['pll-ub', 'L>R R>F F>L'],
    ['pll-h', 'B>F L>R R>L F>B'],
    ['pll-z', 'B>R L>F R>B F>L'],
    ['pll-t', 'BR>FR L>R R>L FR>BR'],
    ['pll-f', 'B>F BR>FR F>B FR>BR'],
    ['pll-ja', 'B>R BR>FR R>B FR>BR'],
    ['pll-jb', 'BR>FR R>F F>R FR>BR'],
    ['pll-ra', 'B>L BR>FR L>B FR>BR'],
    ['pll-rb', 'BR>FR L>F F>L FR>BR'],
    ['pll-v', 'BL>FR B>R R>B FR>BL'],
    ['pll-y', 'BL>FR B>L L>B FR>BL'],
    ['pll-na', 'BR>FL L>R R>L FL>BR'],
    ['pll-nb', 'BL>FR L>R R>L FR>BL'],
    ['pll-ga', 'BL>BR B>L BR>FL L>R R>B FL>BL'],
    ['pll-gb', 'BL>FL B>F L>B FL>FR F>L FR>BL'],
    ['pll-gc', 'BL>FL L>R R>F FL>FR F>L FR>BL'],
    ['pll-gd', 'BL>BR B>L BR>FL L>F FL>BL F>B'],
  ])('%s moves %s', (id, moves) => {
    expect(movesOf(id)).toBe(moves);
  });

  it.each([
    ['pll-aa', 'corners', 'clockwise'],
    ['pll-ab', 'corners', 'counterclockwise'],
    ['pll-ua', 'edges', 'counterclockwise'],
    ['pll-ub', 'edges', 'clockwise'],
    ['pll-ga', 'corners', 'clockwise'],
    ['pll-ga', 'edges', 'counterclockwise'],
    ['pll-gb', 'corners', 'counterclockwise'],
    ['pll-gb', 'edges', 'clockwise'],
    ['pll-gc', 'corners', 'counterclockwise'],
    ['pll-gc', 'edges', 'clockwise'],
    ['pll-gd', 'corners', 'clockwise'],
    ['pll-gd', 'edges', 'counterclockwise'],
  ] as const)('%s cycles its %s %s', (id, kind, direction) => {
    expect(cycleDirection(id, kind)).toBe(direction);
  });
});

describe('originally supplied algorithms', () => {
  it('corner permutation needs the x rotation', () => {
    expect(isLastLayerAlgorithm("R' U R' D2 R U' R' D2 R2")).toBe(false);
    expect(byId('pll-aa').alg).toBe("x R' U R' D2 R U' R' D2 R2 x'");
  });

  it("Z-perm starting with U' leaves the top layer turned by U2", () => {
    const original = lastLayerCase("U' M' U' M2 U' M2 U' M' U2 M2").moves;
    // Every piece moves, i.e. the top layer still needs a half turn at the end.
    expect(original).toHaveLength(8);
    expect(lastLayerCase(byId('pll-z').alg).moves).toHaveLength(4);
  });
});
