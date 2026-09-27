/**
 * Last-layer algorithm cheatsheet: 2-look OLL and all 21 PLLs.
 *
 * Every algorithm is checked by `algorithms.test.ts` against the cube
 * simulation: it must leave the first two layers intact, and it must solve
 * the case described here. A move in parentheses at the end is the final
 * adjustment of the top layer (AUF) needed to finish solved.
 */

export type AlgorithmGroupId = 'oll-edges' | 'oll-corners' | 'pll-corners' | 'pll-edges' | 'pll-both';

export interface AlgorithmGroup {
  id: AlgorithmGroupId;
  set: 'OLL' | 'PLL';
  title: string;
  note: string;
}

export interface Algorithm {
  id: string;
  group: AlgorithmGroupId;
  /** Standard name, e.g. "Aa-perm". */
  name: string;
  /** Shorthand used in speedcubing, e.g. "Aa" or "OLL 27". */
  short?: string;
  alg: string;
  description: string;
  /** Czech name, for the algorithms this cheatsheet started from. */
  czech?: string;
}

export const ALGORITHM_GROUPS: readonly AlgorithmGroup[] = [
  {
    id: 'oll-edges',
    set: 'OLL',
    title: 'OLL · orient edges',
    note: '2-look OLL, step 1: make a yellow cross on top.',
  },
  {
    id: 'oll-corners',
    set: 'OLL',
    title: 'OLL · orient corners',
    note: '2-look OLL, step 2: the cross is done, make the whole top yellow.',
  },
  {
    id: 'pll-corners',
    set: 'PLL',
    title: 'PLL · corners only',
    note: 'Edges are already solved relative to each other.',
  },
  {
    id: 'pll-edges',
    set: 'PLL',
    title: 'PLL · edges only',
    note: 'Corners are already solved; finish the cube.',
  },
  {
    id: 'pll-both',
    set: 'PLL',
    title: 'PLL · corners and edges',
    note: 'The rest of full PLL.',
  },
];

export const ALGORITHMS: readonly Algorithm[] = [
  // OLL, edges
  {
    id: 'oll-line',
    group: 'oll-edges',
    name: 'Line',
    alg: "F R U R' U' F'",
    description: 'Two opposite edges oriented. Hold the line horizontally.',
  },
  {
    id: 'oll-l-shape',
    group: 'oll-edges',
    name: 'L-shape',
    alg: "F U R U' R' F'",
    description: 'Two adjacent edges oriented. Hold the L at the back left.',
  },
  {
    id: 'oll-dot',
    group: 'oll-edges',
    name: 'Dot',
    alg: "F R U R' U' F' f R U R' U' f'",
    description: 'No edges oriented: the line algorithm followed by a wide one.',
  },

  // OLL, corners
  {
    id: 'oll-sune',
    group: 'oll-corners',
    name: 'Sune',
    short: 'OLL 27',
    alg: "R U R' U R U2 R'",
    description: 'One corner oriented, at front left; yellow on the front-right corner faces you.',
  },
  {
    id: 'oll-antisune',
    group: 'oll-corners',
    name: 'Antisune',
    short: 'OLL 26',
    alg: "R' U' R U' R' U2 R",
    description: 'One corner oriented, at back left; yellow on the front-left corner faces you.',
  },
  {
    id: 'oll-h',
    group: 'oll-corners',
    name: 'H (Double Sune)',
    short: 'OLL 21',
    alg: "R U R' U R U' R' U R U2 R'",
    description: 'No corners oriented, two pairs of headlights. Hold them left and right.',
  },
  {
    id: 'oll-pi',
    group: 'oll-corners',
    name: 'Pi (Bruno)',
    short: 'OLL 22',
    alg: "R U2 R2 U' R2 U' R2 U2 R",
    description: 'No corners oriented, one pair of headlights. Hold it on the left.',
  },
  {
    id: 'oll-u',
    group: 'oll-corners',
    name: 'U (Headlights)',
    short: 'OLL 23',
    alg: "R2 D R' U2 R D' R' U2 R'",
    description: 'Two back corners oriented, headlights facing you.',
  },
  {
    id: 'oll-t',
    group: 'oll-corners',
    name: 'T (Chameleon)',
    short: 'OLL 24',
    alg: "r U R' U' r' F R F'",
    description: 'Two right corners oriented; the left ones face front and back.',
  },
  {
    id: 'oll-l',
    group: 'oll-corners',
    name: 'L (Bowtie)',
    short: 'OLL 25',
    alg: "F' r U R' U' r' F R",
    description: 'Two diagonal corners oriented; yellow on the front-right corner faces you.',
  },

  // PLL, corners only
  {
    id: 'pll-aa',
    group: 'pll-corners',
    name: 'Aa-perm',
    short: 'Aa',
    alg: "x R' U R' D2 R U' R' D2 R2 x'",
    description: 'Cycles three corners clockwise; the front-left corner stays.',
    czech: 'Permutace rohů',
  },
  {
    id: 'pll-ab',
    group: 'pll-corners',
    name: 'Ab-perm',
    short: 'Ab',
    alg: "x R2 D2 R U R' D2 R U' R x'",
    description: 'Cycles three corners counterclockwise; the front-left corner stays.',
  },
  {
    id: 'pll-e',
    group: 'pll-corners',
    name: 'E-perm',
    short: 'E',
    alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    description: 'Swaps the corners in two pairs, front with back on each side.',
  },

  // PLL, edges only
  {
    id: 'pll-ua',
    group: 'pll-edges',
    name: 'Ua-perm',
    short: 'Ua',
    alg: "R U' R U R U R U' R' U' R2",
    description: 'Cycles three edges counterclockwise; the back edge stays.',
    czech: 'Permutace hran proti směru',
  },
  {
    id: 'pll-ub',
    group: 'pll-edges',
    name: 'Ub-perm',
    short: 'Ub',
    alg: "L' U L' U' L' U' L' U L U L2",
    description: 'Cycles three edges clockwise; the back edge stays.',
    czech: 'Permutace hran po směru',
  },
  {
    id: 'pll-h',
    group: 'pll-edges',
    name: 'H-perm',
    short: 'H',
    alg: "M2 U' M2 U2 M2 U' M2",
    description: 'Swaps opposite edges: front with back, left with right.',
    czech: 'Permutace hran – protější prohozené',
  },
  {
    id: 'pll-z',
    group: 'pll-edges',
    name: 'Z-perm',
    short: 'Z',
    alg: "U M' U' M2 U' M2 U' M' U2 M2",
    description: 'Swaps adjacent edges in two pairs: back with right, left with front.',
    czech: 'Permutace hran – sousední prohozené',
  },

  // PLL, corners and edges
  {
    id: 'pll-t',
    group: 'pll-both',
    name: 'T-perm',
    short: 'T',
    alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
    description: 'Swaps the two right corners, and the left and right edges.',
  },
  {
    id: 'pll-f',
    group: 'pll-both',
    name: 'F-perm',
    short: 'F',
    alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    description: 'Swaps the two right corners, and the front and back edges.',
  },
  {
    id: 'pll-ja',
    group: 'pll-both',
    name: 'Ja-perm',
    short: 'Ja',
    alg: "x R2 F R F' R U2 r' U r U2 x'",
    description: 'Swaps the two right corners, and the back and right edges.',
  },
  {
    id: 'pll-jb',
    group: 'pll-both',
    name: 'Jb-perm',
    short: 'Jb',
    alg: "R U R' F' R U R' U' R' F R2 U' R' (U')",
    description: 'Swaps the two right corners, and the right and front edges.',
  },
  {
    id: 'pll-ra',
    group: 'pll-both',
    name: 'Ra-perm',
    short: 'Ra',
    alg: "R U' R' U' R U R D R' U' R D' R' U2 R' (U')",
    description: 'Swaps the two right corners, and the back and left edges.',
  },
  {
    id: 'pll-rb',
    group: 'pll-both',
    name: 'Rb-perm',
    short: 'Rb',
    alg: "R2 F R U R U' R' F' R U2 R' U2 R (U)",
    description: 'Swaps the two right corners, and the left and front edges.',
  },
  {
    id: 'pll-v',
    group: 'pll-both',
    name: 'V-perm',
    short: 'V',
    alg: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2",
    description: 'Swaps diagonal corners (back left, front right), and the back and right edges.',
  },
  {
    id: 'pll-y',
    group: 'pll-both',
    name: 'Y-perm',
    short: 'Y',
    alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    description: 'Swaps diagonal corners (back left, front right), and the back and left edges.',
  },
  {
    id: 'pll-na',
    group: 'pll-both',
    name: 'Na-perm',
    short: 'Na',
    alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    description: 'Swaps diagonal corners (back right, front left), and the left and right edges.',
  },
  {
    id: 'pll-nb',
    group: 'pll-both',
    name: 'Nb-perm',
    short: 'Nb',
    alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    description: 'Swaps diagonal corners (back left, front right), and the left and right edges.',
  },
  {
    id: 'pll-ga',
    group: 'pll-both',
    name: 'Ga-perm',
    short: 'Ga',
    alg: "R2 U R' U R' U' R U' R2 U' D R' U R D' (U)",
    description: 'Corners cycle clockwise, edges counterclockwise; the front-right corner and front edge stay.',
  },
  {
    id: 'pll-gb',
    group: 'pll-both',
    name: 'Gb-perm',
    short: 'Gb',
    alg: "R' U' R U D' R2 U R' U R U' R U' R2 D (U')",
    description: 'Corners cycle counterclockwise, edges clockwise; the back-right corner and right edge stay.',
  },
  {
    id: 'pll-gc',
    group: 'pll-both',
    name: 'Gc-perm',
    short: 'Gc',
    alg: "R2 U' R U' R U R' U R2 U D' R U' R' D (U')",
    description: 'Corners cycle counterclockwise, edges clockwise; the back-right corner and back edge stay.',
  },
  {
    id: 'pll-gd',
    group: 'pll-both',
    name: 'Gd-perm',
    short: 'Gd',
    alg: "R U R' U' D R2 U' R U' R' U R' U R2 D' (U)",
    description: 'Corners cycle clockwise, edges counterclockwise; the front-right corner and right edge stay.',
  },
];
