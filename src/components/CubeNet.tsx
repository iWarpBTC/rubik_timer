import { useMemo } from 'react';
import { applyScramble, type CubeState, type Face } from '../lib/cube';

const STICKER_COLORS: Record<Face, string> = {
  U: '#f1f5f9', // white
  D: '#facc15', // yellow
  F: '#22c55e', // green
  B: '#3b82f6', // blue
  R: '#ef4444', // red
  L: '#f97316', // orange
};

/** Top-left grid cell (col, row) of each face on the unfolded net. */
const FACE_ORIGIN: Record<Face, [number, number]> = {
  U: [3, 0],
  L: [0, 3],
  F: [3, 3],
  R: [6, 3],
  B: [9, 3],
  D: [3, 6],
};

const CELL = 20;
const FACE_ORDER: readonly Face[] = ['U', 'R', 'F', 'D', 'L', 'B'];

export function CubeNet({ scramble }: { scramble: string }) {
  const state: CubeState = useMemo(() => applyScramble(scramble), [scramble]);

  return (
    <svg
      viewBox={`0 0 ${12 * CELL} ${9 * CELL}`}
      className="h-auto w-full max-w-sm"
      role="img"
      aria-label="Scrambled cube net"
    >
      {FACE_ORDER.map((face, faceIndex) => {
        const [col, row] = FACE_ORIGIN[face];
        return Array.from({ length: 9 }, (_, i) => {
          const color = state[faceIndex * 9 + i]!;
          const x = (col + (i % 3)) * CELL;
          const y = (row + Math.floor(i / 3)) * CELL;
          return (
            <rect
              key={`${face}${i}`}
              x={x + 1}
              y={y + 1}
              width={CELL - 2}
              height={CELL - 2}
              rx={2}
              fill={STICKER_COLORS[color]}
            />
          );
        });
      })}
    </svg>
  );
}
