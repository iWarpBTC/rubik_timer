/** Move notation reference for the cheatsheet. */

import type { Localized } from '../i18n/lang';

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
  name: Localized;
  description: Localized;
  shape: MoveShape;
}

export interface NotationGroup {
  id: string;
  title: Localized;
  note: Localized;
  moves: NotationMove[];
}

export const NOTATION: readonly NotationGroup[] = [
  {
    id: 'faces',
    title: { en: 'Face turns', cs: 'Otočení stěn' },
    note: { en: 'One outer layer.', cs: 'Jedna vnější vrstva.' },
    moves: [
      {
        move: 'R',
        name: { en: 'Right', cs: 'Pravá' },
        description: { en: 'Right layer', cs: 'Pravá vrstva' },
        shape: { axis: 'x', layers: [1], dir: 1 },
      },
      {
        move: 'L',
        name: { en: 'Left', cs: 'Levá' },
        description: { en: 'Left layer', cs: 'Levá vrstva' },
        shape: { axis: 'x', layers: [-1], dir: -1 },
      },
      {
        move: 'U',
        name: { en: 'Up', cs: 'Horní' },
        description: { en: 'Top layer', cs: 'Horní vrstva' },
        shape: { axis: 'y', layers: [1], dir: 1 },
      },
      {
        move: 'D',
        name: { en: 'Down', cs: 'Dolní' },
        description: { en: 'Bottom layer', cs: 'Dolní vrstva' },
        shape: { axis: 'y', layers: [-1], dir: -1 },
      },
      {
        move: 'F',
        name: { en: 'Front', cs: 'Přední' },
        description: { en: 'Layer facing you', cs: 'Vrstva směrem k tobě' },
        shape: { axis: 'z', layers: [1], dir: 1 },
      },
      {
        move: 'B',
        name: { en: 'Back', cs: 'Zadní' },
        description: { en: 'Layer at the back', cs: 'Vrstva vzadu' },
        shape: { axis: 'z', layers: [-1], dir: -1 },
      },
    ],
  },
  {
    id: 'slices',
    title: { en: 'Slice moves', cs: 'Střední vrstvy' },
    note: { en: 'Only the middle layer.', cs: 'Jen prostřední vrstva.' },
    moves: [
      {
        move: 'M',
        name: { en: 'Middle', cs: 'Middle (střední)' },
        description: { en: 'Between L and R, turns like L', cs: 'Mezi L a R, točí se jako L' },
        shape: { axis: 'x', layers: [0], dir: -1 },
      },
      {
        move: 'E',
        name: { en: 'Equator', cs: 'Equator (rovník)' },
        description: { en: 'Between U and D, turns like D', cs: 'Mezi U a D, točí se jako D' },
        shape: { axis: 'y', layers: [0], dir: -1 },
      },
      {
        move: 'S',
        name: { en: 'Standing', cs: 'Standing (stojící)' },
        description: { en: 'Between F and B, turns like F', cs: 'Mezi F a B, točí se jako F' },
        shape: { axis: 'z', layers: [0], dir: 1 },
      },
    ],
  },
  {
    id: 'wide',
    title: { en: 'Wide moves', cs: 'Široké tahy' },
    note: {
      en: 'An outer layer together with the middle one. Also written Rw, Lw, Uw, …',
      cs: 'Vnější vrstva spolu s prostřední. Píše se také Rw, Lw, Uw, …',
    },
    moves: [
      {
        move: 'r',
        name: { en: 'Right wide', cs: 'Pravá široká' },
        description: { en: 'R and M together', cs: 'R a M dohromady' },
        shape: { axis: 'x', layers: [0, 1], dir: 1 },
      },
      {
        move: 'l',
        name: { en: 'Left wide', cs: 'Levá široká' },
        description: { en: 'L and M together', cs: 'L a M dohromady' },
        shape: { axis: 'x', layers: [-1, 0], dir: -1 },
      },
      {
        move: 'u',
        name: { en: 'Up wide', cs: 'Horní široká' },
        description: { en: 'U and E together', cs: 'U a E dohromady' },
        shape: { axis: 'y', layers: [0, 1], dir: 1 },
      },
      {
        move: 'd',
        name: { en: 'Down wide', cs: 'Dolní široká' },
        description: { en: 'D and E together', cs: 'D a E dohromady' },
        shape: { axis: 'y', layers: [-1, 0], dir: -1 },
      },
      {
        move: 'f',
        name: { en: 'Front wide', cs: 'Přední široká' },
        description: { en: 'F and S together', cs: 'F a S dohromady' },
        shape: { axis: 'z', layers: [0, 1], dir: 1 },
      },
      {
        move: 'b',
        name: { en: 'Back wide', cs: 'Zadní široká' },
        description: { en: 'B and S together', cs: 'B a S dohromady' },
        shape: { axis: 'z', layers: [-1, 0], dir: -1 },
      },
    ],
  },
  {
    id: 'rotations',
    title: { en: 'Cube rotations', cs: 'Otočení kostky' },
    note: {
      en: 'Turn the whole cube in your hands; nothing on the cube changes.',
      cs: 'Otočíš celou kostku v rukou; na kostce se nic nezmění.',
    },
    moves: [
      {
        move: 'x',
        name: { en: 'Rotate like R', cs: 'Otočení jako R' },
        description: { en: 'Front comes to the top', cs: 'Přední stěna přijde nahoru' },
        shape: { axis: 'x', layers: [-1, 0, 1], dir: 1 },
      },
      {
        move: 'y',
        name: { en: 'Rotate like U', cs: 'Otočení jako U' },
        description: { en: 'Right comes to the front', cs: 'Pravá stěna přijde dopředu' },
        shape: { axis: 'y', layers: [-1, 0, 1], dir: 1 },
      },
      {
        move: 'z',
        name: { en: 'Rotate like F', cs: 'Otočení jako F' },
        description: { en: 'Top goes to the right', cs: 'Horní stěna jde doprava' },
        shape: { axis: 'z', layers: [-1, 0, 1], dir: 1 },
      },
    ],
  },
];
