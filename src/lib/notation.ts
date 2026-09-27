/** Move notation reference for the cheatsheet. */

export type Axis = 'x' | 'y' | 'z';

/** Which layers a move turns and which way, for drawing it. */
export interface MoveShape {
  axis: Axis;
  /** Layer coordinates (-1, 0, 1) along the axis that turn. */
  layers: number[];
  /** +1 turns like R, U or F (clockwise seen from the right, top or front); -1 the opposite. */
  dir: 1 | -1;
}

export interface NotationMove {
  move: string;
  name: string;
  description: string;
  shape: MoveShape;
}

export interface NotationGroup {
  title: string;
  note: string;
  moves: NotationMove[];
}

export const NOTATION: readonly NotationGroup[] = [
  {
    title: 'Face turns',
    note: 'One outer layer.',
    moves: [
      { move: 'R', name: 'Right', description: 'Right layer', shape: { axis: 'x', layers: [1], dir: 1 } },
      { move: 'L', name: 'Left', description: 'Left layer', shape: { axis: 'x', layers: [-1], dir: -1 } },
      { move: 'U', name: 'Up', description: 'Top layer', shape: { axis: 'y', layers: [1], dir: 1 } },
      { move: 'D', name: 'Down', description: 'Bottom layer', shape: { axis: 'y', layers: [-1], dir: -1 } },
      { move: 'F', name: 'Front', description: 'Layer facing you', shape: { axis: 'z', layers: [1], dir: 1 } },
      { move: 'B', name: 'Back', description: 'Layer at the back', shape: { axis: 'z', layers: [-1], dir: -1 } },
    ],
  },
  {
    title: 'Slice moves',
    note: 'Only the middle layer.',
    moves: [
      { move: 'M', name: 'Middle', description: 'Between L and R, turns like L', shape: { axis: 'x', layers: [0], dir: -1 } },
      { move: 'E', name: 'Equator', description: 'Between U and D, turns like D', shape: { axis: 'y', layers: [0], dir: -1 } },
      { move: 'S', name: 'Standing', description: 'Between F and B, turns like F', shape: { axis: 'z', layers: [0], dir: 1 } },
    ],
  },
  {
    title: 'Wide moves',
    note: 'An outer layer together with the middle one. Also written Rw, Lw, Uw, …',
    moves: [
      { move: 'r', name: 'Right wide', description: 'R and M together', shape: { axis: 'x', layers: [0, 1], dir: 1 } },
      { move: 'l', name: 'Left wide', description: 'L and M together', shape: { axis: 'x', layers: [-1, 0], dir: -1 } },
      { move: 'u', name: 'Up wide', description: 'U and E together', shape: { axis: 'y', layers: [0, 1], dir: 1 } },
      { move: 'd', name: 'Down wide', description: 'D and E together', shape: { axis: 'y', layers: [-1, 0], dir: -1 } },
      { move: 'f', name: 'Front wide', description: 'F and S together', shape: { axis: 'z', layers: [0, 1], dir: 1 } },
      { move: 'b', name: 'Back wide', description: 'B and S together', shape: { axis: 'z', layers: [-1, 0], dir: -1 } },
    ],
  },
  {
    title: 'Cube rotations',
    note: 'Turn the whole cube in your hands; nothing on the cube changes.',
    moves: [
      { move: 'x', name: 'Rotate like R', description: 'Front comes to the top', shape: { axis: 'x', layers: [-1, 0, 1], dir: 1 } },
      { move: 'y', name: 'Rotate like U', description: 'Right comes to the front', shape: { axis: 'y', layers: [-1, 0, 1], dir: 1 } },
      { move: 'z', name: 'Rotate like F', description: 'Top goes to the right', shape: { axis: 'z', layers: [-1, 0, 1], dir: 1 } },
    ],
  },
];
