import type { Axis, MoveShape } from '../lib/notation';

/**
 * Isometric cube (top, front and right faces visible) with the layers a move
 * turns highlighted and an arrow showing the direction of the turn.
 */

type Vec = [number, number, number];

const COS30 = Math.cos(Math.PI / 6);
const SCALE = 13;

function project([x, y, z]: Vec): [number, number] {
  return [(x - z) * COS30 * SCALE, (-y + (x + z) / 2) * SCALE];
}

/** The visible faces as (normal axis, two in-plane axes). */
const FACES: Array<{ normal: 0 | 1 | 2; u: 0 | 1 | 2; v: 0 | 1 | 2 }> = [
  { normal: 1, u: 0, v: 2 }, // U (y = 1.5)
  { normal: 2, u: 0, v: 1 }, // F (z = 1.5)
  { normal: 0, u: 2, v: 1 }, // R (x = 1.5)
];

const AXIS_INDEX: Record<Axis, 0 | 1 | 2> = { x: 0, y: 1, z: 2 };
const HALF = 0.43;

interface Sticker {
  points: string;
  cubie: Vec;
}

const STICKERS: Sticker[] = FACES.flatMap(({ normal, u, v }) => {
  const result: Sticker[] = [];
  for (const a of [-1, 0, 1]) {
    for (const b of [-1, 0, 1]) {
      const corner = (du: number, dv: number) => {
        const p: Vec = [0, 0, 0];
        p[normal] = 1.5;
        p[u] = a + du;
        p[v] = b + dv;
        return project(p).map((n) => n.toFixed(1)).join(',');
      };
      const cubie: Vec = [0, 0, 0];
      cubie[normal] = 1;
      cubie[u] = a;
      cubie[v] = b;
      result.push({
        points: [corner(-HALF, -HALF), corner(HALF, -HALF), corner(HALF, HALF), corner(-HALF, HALF)].join(' '),
        cubie,
      });
    }
  }
  return result;
});

/** Arrow over the visible faces for a +1 turn of the layer at coordinate `at`. */
function arrowPoints(axis: Axis, at: number): Vec[] {
  switch (axis) {
    // Like R: up the front face, then back across the top.
    case 'x':
      return [[at, -1.2, 1.5], [at, 1.5, 1.5], [at, 1.5, -1.2]];
    // Like U: along the right face to the front, then left across the front.
    case 'y':
      return [[1.5, at, -1.2], [1.5, at, 1.5], [-1.2, at, 1.5]];
    // Like F: right across the top, then down the right face.
    case 'z':
      return [[-1.2, 1.5, at], [1.5, 1.5, at], [1.5, -1.2, at]];
  }
}

/** The point `distance` away from `p`, moving towards `q`. */
function pointTowards(p: [number, number], q: [number, number], distance: number): [number, number] {
  const len = Math.hypot(q[0] - p[0], q[1] - p[1]);
  return [p[0] + ((q[0] - p[0]) / len) * distance, p[1] + ((q[1] - p[1]) / len) * distance];
}

/** Arrowhead pointing along from→tip, with its point `back` units short of the tip. */
function arrowHead(tip: [number, number], from: [number, number], back: number): string {
  const dx = tip[0] - from[0];
  const dy = tip[1] - from[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len;
  const uy = dy / len;
  const bx = tip[0] - ux * back;
  const by = tip[1] - uy * back;
  const size = 5;
  return [
    [bx, by],
    [bx - ux * size - uy * size * 0.8, by - uy * size + ux * size * 0.8],
    [bx - ux * size + uy * size * 0.8, by - uy * size - ux * size * 0.8],
  ]
    .map(([x, y]) => `${x!.toFixed(1)},${y!.toFixed(1)}`)
    .join(' ');
}

export function MoveDiagram({
  shape,
  variant,
  className,
}: {
  shape: MoveShape;
  variant: 'cw' | 'ccw' | 'half';
  className?: string;
}) {
  const axis = AXIS_INDEX[shape.axis];
  const at = shape.layers.length === 3 ? 0 : (shape.layers.find((l) => l !== 0) ?? 0);
  let points = arrowPoints(shape.axis, at).map(project);
  if ((shape.dir === -1) !== (variant === 'ccw')) points = [...points].reverse();
  const tip = points[points.length - 1]!;
  const beforeTip = points[points.length - 2]!;
  // End the shaft inside the arrowhead so its round cap doesn't poke out past the tip.
  const shaftEnd = pointTowards(tip, beforeTip, 3);
  const line = [...points.slice(0, -1), shaftEnd].map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const heads = variant === 'half' ? [0, 5] : [0];

  return (
    <svg viewBox="-38 -42 76 84" className={className} aria-hidden="true">
      {STICKERS.map(({ points: poly, cubie }, i) => (
        <polygon key={i} points={poly} fill={shape.layers.includes(cubie[axis]) ? '#3b82f6' : '#404040'} />
      ))}
      <polyline points={line} fill="none" stroke="#0a0a0a" strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
      {heads.map((back) => (
        <polygon key={`o${back}`} points={arrowHead(tip, beforeTip, back)} fill="#0a0a0a" stroke="#0a0a0a" strokeWidth={3} strokeLinejoin="round" />
      ))}
      <polyline points={line} fill="none" stroke="#fafafa" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {heads.map((back) => (
        <polygon key={back} points={arrowHead(tip, beforeTip, back)} fill="#fafafa" />
      ))}
    </svg>
  );
}
