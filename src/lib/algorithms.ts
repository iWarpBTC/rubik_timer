/**
 * Last-layer algorithm cheatsheet: 2-look OLL and all 21 PLLs.
 *
 * Every algorithm is checked by `algorithms.test.ts` against the cube
 * simulation: it must leave the first two layers intact, and it must solve
 * the case described here. A move in parentheses at the end is the final
 * adjustment of the top layer (AUF) needed to finish solved.
 */

import { same, type Localized } from '../i18n/lang';

export type AlgorithmGroupId = 'oll-edges' | 'oll-corners' | 'pll-corners' | 'pll-edges' | 'pll-both';

export interface AlgorithmGroup {
  id: AlgorithmGroupId;
  set: 'OLL' | 'PLL';
  title: Localized;
  note: Localized;
}

export interface Algorithm {
  id: string;
  group: AlgorithmGroupId;
  /** Standard name, e.g. "Aa-perm". */
  name: Localized;
  /** Shorthand used in speedcubing, e.g. "Aa" or "OLL 27". */
  short?: string;
  alg: string;
  description: Localized;
  /** The Czech name the algorithm was first catalogued under; shown in the Czech version. */
  czech?: string;
}

export const ALGORITHM_GROUPS: readonly AlgorithmGroup[] = [
  {
    id: 'oll-edges',
    set: 'OLL',
    title: { en: 'OLL · orient edges', cs: 'OLL · orientace hran' },
    note: {
      en: '2-look OLL, step 1: make a yellow cross on top.',
      cs: '2-look OLL, krok 1: udělej nahoře žlutý kříž.',
    },
  },
  {
    id: 'oll-corners',
    set: 'OLL',
    title: { en: 'OLL · orient corners', cs: 'OLL · orientace rohů' },
    note: {
      en: '2-look OLL, step 2: the cross is done, make the whole top yellow.',
      cs: '2-look OLL, krok 2: kříž je hotový, dobarvi celý vršek na žluto.',
    },
  },
  {
    id: 'pll-corners',
    set: 'PLL',
    title: { en: 'PLL · corners only', cs: 'PLL · jen rohy' },
    note: {
      en: 'Edges are already solved relative to each other.',
      cs: 'Hrany už jsou vůči sobě na správných místech.',
    },
  },
  {
    id: 'pll-edges',
    set: 'PLL',
    title: { en: 'PLL · edges only', cs: 'PLL · jen hrany' },
    note: { en: 'Corners are already solved; finish the cube.', cs: 'Rohy už jsou hotové; dokonči kostku.' },
  },
  {
    id: 'pll-both',
    set: 'PLL',
    title: { en: 'PLL · corners and edges', cs: 'PLL · rohy i hrany' },
    note: { en: 'The rest of full PLL.', cs: 'Zbytek úplného PLL.' },
  },
];

export interface Trigger {
  id: string;
  name: Localized;
  alg: string;
  description: Localized;
}

/**
 * Short move sequences that algorithms are built from. They are not
 * last-layer algorithms on their own: done once they disturb the first two
 * layers; done six times in a row they return the cube to where it started.
 */
export const TRIGGERS: readonly Trigger[] = [
  {
    id: 'sexy',
    name: same('Sexy move'),
    alg: "R U R' U'",
    description: {
      en: 'The most common trigger; the core of the Line OLL and the start of the T-perm.',
      cs: 'Nejčastější trigger; jádro OLL „čára“ a začátek T-perm.',
    },
  },
  {
    id: 'reverse-sexy',
    name: { en: 'Reverse sexy move', cs: 'Obrácený sexy move' },
    alg: "U R U' R'",
    description: {
      en: 'The sexy move in reverse order; the core of the L-shape OLL.',
      cs: 'Sexy move v opačném pořadí; jádro OLL „písmeno L“.',
    },
  },
  {
    id: 'sledgehammer',
    name: same('Sledgehammer'),
    alg: "R' F R F'",
    description: {
      en: "Common in F2L; the T (Chameleon) OLL ends with it, using a wide r' first.",
      cs: "Častý v F2L; OLL T (chameleon) jím končí, jen se širokým r' na začátku.",
    },
  },
];

export const ALGORITHMS: readonly Algorithm[] = [
  // OLL, edges
  {
    id: 'oll-line',
    group: 'oll-edges',
    name: { en: 'Line', cs: 'Čára' },
    alg: "F R U R' U' F'",
    description: {
      en: 'Two opposite edges oriented. Hold the line horizontally.',
      cs: 'Dvě protější hrany orientované. Drž čáru vodorovně.',
    },
  },
  {
    id: 'oll-l-shape',
    group: 'oll-edges',
    name: { en: 'L-shape', cs: 'Písmeno L' },
    alg: "F U R U' R' F'",
    description: {
      en: 'Two adjacent edges oriented. Hold the L at the back left.',
      cs: 'Dvě sousední hrany orientované. Drž L vzadu vlevo.',
    },
  },
  {
    id: 'oll-dot',
    group: 'oll-edges',
    name: { en: 'Dot', cs: 'Tečka' },
    alg: "F R U R' U' F' f R U R' U' f'",
    description: {
      en: 'No edges oriented: the line algorithm followed by a wide one.',
      cs: 'Žádná hrana orientovaná: algoritmus pro čáru a po něm jeho široká varianta.',
    },
  },

  // OLL, corners
  {
    id: 'oll-sune',
    group: 'oll-corners',
    name: same('Sune'),
    short: 'OLL 27',
    alg: "R U R' U R U2 R'",
    description: {
      en: 'One corner oriented, at front left; yellow on the front-right corner faces you.',
      cs: 'Jeden roh orientovaný, vpředu vlevo; žlutá na pravém předním rohu míří k tobě.',
    },
  },
  {
    id: 'oll-antisune',
    group: 'oll-corners',
    name: same('Antisune'),
    short: 'OLL 26',
    alg: "R' U' R U' R' U2 R",
    description: {
      en: 'One corner oriented, at back left; yellow on the front-left corner faces you.',
      cs: 'Jeden roh orientovaný, vzadu vlevo; žlutá na levém předním rohu míří k tobě.',
    },
  },
  {
    id: 'oll-h',
    group: 'oll-corners',
    name: same('H (Double Sune)'),
    short: 'OLL 21',
    alg: "R U R' U R U' R' U R U2 R'",
    description: {
      en: 'No corners oriented, two pairs of headlights. Hold them left and right.',
      cs: 'Žádný roh orientovaný, dva páry „světel“. Drž je vlevo a vpravo.',
    },
  },
  {
    id: 'oll-pi',
    group: 'oll-corners',
    name: same('Pi (Bruno)'),
    short: 'OLL 22',
    alg: "R U2 R2 U' R2 U' R2 U2 R",
    description: {
      en: 'No corners oriented, one pair of headlights. Hold it on the left.',
      cs: 'Žádný roh orientovaný, jeden pár „světel“. Drž ho vlevo.',
    },
  },
  {
    id: 'oll-u',
    group: 'oll-corners',
    name: { en: 'U (Headlights)', cs: 'U (světla)' },
    short: 'OLL 23',
    alg: "R2 D R' U2 R D' R' U2 R'",
    description: {
      en: 'Two back corners oriented, headlights facing you.',
      cs: 'Oba zadní rohy orientované, „světla“ míří k tobě.',
    },
  },
  {
    id: 'oll-t',
    group: 'oll-corners',
    name: { en: 'T (Chameleon)', cs: 'T (chameleon)' },
    short: 'OLL 24',
    alg: "r U R' U' r' F R F'",
    description: {
      en: 'Two right corners oriented; the left ones face front and back.',
      cs: 'Oba pravé rohy orientované; levé míří dopředu a dozadu.',
    },
  },
  {
    id: 'oll-l',
    group: 'oll-corners',
    name: { en: 'L (Bowtie)', cs: 'L (motýlek)' },
    short: 'OLL 25',
    alg: "F' r U R' U' r' F R",
    description: {
      en: 'Two diagonal corners oriented; yellow on the front-right corner faces you.',
      cs: 'Dva úhlopříčné rohy orientované; žlutá na pravém předním rohu míří k tobě.',
    },
  },

  // PLL, corners only
  {
    id: 'pll-aa',
    group: 'pll-corners',
    name: same('Aa-perm'),
    short: 'Aa',
    alg: "x R' U R' D2 R U' R' D2 R2 x'",
    description: {
      en: 'Cycles three corners clockwise; the front-left corner stays.',
      cs: 'Cyklí tři rohy po směru hodinových ručiček; levý přední roh zůstává.',
    },
    czech: 'Permutace rohů',
  },
  {
    id: 'pll-ab',
    group: 'pll-corners',
    name: same('Ab-perm'),
    short: 'Ab',
    alg: "x R2 D2 R U R' D2 R U' R x'",
    description: {
      en: 'Cycles three corners counterclockwise; the front-left corner stays.',
      cs: 'Cyklí tři rohy proti směru hodinových ručiček; levý přední roh zůstává.',
    },
  },
  {
    id: 'pll-e',
    group: 'pll-corners',
    name: same('E-perm'),
    short: 'E',
    alg: "x' R U' R' D R U R' D' R U R' D R U' R' D' x",
    description: {
      en: 'Swaps the corners in two pairs, front with back on each side.',
      cs: 'Prohodí rohy ve dvou párech, na každé straně přední se zadním.',
    },
  },

  // PLL, edges only
  {
    id: 'pll-ua',
    group: 'pll-edges',
    name: same('Ua-perm'),
    short: 'Ua',
    alg: "R U' R U R U R U' R' U' R2",
    description: {
      en: 'Cycles three edges counterclockwise; the back edge stays.',
      cs: 'Cyklí tři hrany proti směru hodinových ručiček; zadní hrana zůstává.',
    },
    czech: 'Permutace hran proti směru',
  },
  {
    id: 'pll-ub',
    group: 'pll-edges',
    name: same('Ub-perm'),
    short: 'Ub',
    alg: "L' U L' U' L' U' L' U L U L2",
    description: {
      en: 'Cycles three edges clockwise; the back edge stays.',
      cs: 'Cyklí tři hrany po směru hodinových ručiček; zadní hrana zůstává.',
    },
    czech: 'Permutace hran po směru',
  },
  {
    id: 'pll-h',
    group: 'pll-edges',
    name: same('H-perm'),
    short: 'H',
    alg: "M2 U' M2 U2 M2 U' M2",
    description: {
      en: 'Swaps opposite edges: front with back, left with right.',
      cs: 'Prohodí protější hrany: přední se zadní, levou s pravou.',
    },
    czech: 'Permutace hran – protější prohozené',
  },
  {
    id: 'pll-z',
    group: 'pll-edges',
    name: same('Z-perm'),
    short: 'Z',
    alg: "U M' U' M2 U' M2 U' M' U2 M2",
    description: {
      en: 'Swaps adjacent edges in two pairs: back with right, left with front.',
      cs: 'Prohodí sousední hrany ve dvou párech: zadní s pravou, levou s přední.',
    },
    czech: 'Permutace hran – sousední prohozené',
  },

  // PLL, corners and edges
  {
    id: 'pll-t',
    group: 'pll-both',
    name: same('T-perm'),
    short: 'T',
    alg: "R U R' U' R' F R2 U' R' U' R U R' F'",
    description: {
      en: 'Swaps the two right corners, and the left and right edges.',
      cs: 'Prohodí oba pravé rohy a levou hranu s pravou.',
    },
  },
  {
    id: 'pll-f',
    group: 'pll-both',
    name: same('F-perm'),
    short: 'F',
    alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
    description: {
      en: 'Swaps the two right corners, and the front and back edges.',
      cs: 'Prohodí oba pravé rohy a přední hranu se zadní.',
    },
  },
  {
    id: 'pll-ja',
    group: 'pll-both',
    name: same('Ja-perm'),
    short: 'Ja',
    alg: "x R2 F R F' R U2 r' U r U2 x'",
    description: {
      en: 'Swaps the two right corners, and the back and right edges.',
      cs: 'Prohodí oba pravé rohy a zadní hranu s pravou.',
    },
  },
  {
    id: 'pll-jb',
    group: 'pll-both',
    name: same('Jb-perm'),
    short: 'Jb',
    alg: "R U R' F' R U R' U' R' F R2 U' R' (U')",
    description: {
      en: 'Swaps the two right corners, and the right and front edges.',
      cs: 'Prohodí oba pravé rohy a pravou hranu s přední.',
    },
  },
  {
    id: 'pll-ra',
    group: 'pll-both',
    name: same('Ra-perm'),
    short: 'Ra',
    alg: "R U' R' U' R U R D R' U' R D' R' U2 R' (U')",
    description: {
      en: 'Swaps the two right corners, and the back and left edges.',
      cs: 'Prohodí oba pravé rohy a zadní hranu s levou.',
    },
  },
  {
    id: 'pll-rb',
    group: 'pll-both',
    name: same('Rb-perm'),
    short: 'Rb',
    alg: "R2 F R U R U' R' F' R U2 R' U2 R (U)",
    description: {
      en: 'Swaps the two right corners, and the left and front edges.',
      cs: 'Prohodí oba pravé rohy a levou hranu s přední.',
    },
  },
  {
    id: 'pll-v',
    group: 'pll-both',
    name: same('V-perm'),
    short: 'V',
    alg: "R' U R' U' R D' R' D R' U D' R2 U' R2 D R2",
    description: {
      en: 'Swaps diagonal corners (back left, front right), and the back and right edges.',
      cs: 'Prohodí úhlopříčné rohy (vzadu vlevo, vpředu vpravo) a zadní hranu s pravou.',
    },
  },
  {
    id: 'pll-y',
    group: 'pll-both',
    name: same('Y-perm'),
    short: 'Y',
    alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
    description: {
      en: 'Swaps diagonal corners (back left, front right), and the back and left edges.',
      cs: 'Prohodí úhlopříčné rohy (vzadu vlevo, vpředu vpravo) a zadní hranu s levou.',
    },
  },
  {
    id: 'pll-na',
    group: 'pll-both',
    name: same('Na-perm'),
    short: 'Na',
    alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'",
    description: {
      en: 'Swaps diagonal corners (back right, front left), and the left and right edges.',
      cs: 'Prohodí úhlopříčné rohy (vzadu vpravo, vpředu vlevo) a levou hranu s pravou.',
    },
  },
  {
    id: 'pll-nb',
    group: 'pll-both',
    name: same('Nb-perm'),
    short: 'Nb',
    alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R",
    description: {
      en: 'Swaps diagonal corners (back left, front right), and the left and right edges.',
      cs: 'Prohodí úhlopříčné rohy (vzadu vlevo, vpředu vpravo) a levou hranu s pravou.',
    },
  },
  {
    id: 'pll-ga',
    group: 'pll-both',
    name: same('Ga-perm'),
    short: 'Ga',
    alg: "R2 U R' U R' U' R U' R2 U' D R' U R D' (U)",
    description: {
      en: 'Corners cycle clockwise, edges counterclockwise; the front-right corner and front edge stay.',
      cs: 'Rohy cyklí po směru, hrany proti směru hodinových ručiček; pravý přední roh a přední hrana zůstávají.',
    },
  },
  {
    id: 'pll-gb',
    group: 'pll-both',
    name: same('Gb-perm'),
    short: 'Gb',
    alg: "R' U' R U D' R2 U R' U R U' R U' R2 D (U')",
    description: {
      en: 'Corners cycle counterclockwise, edges clockwise; the back-right corner and right edge stay.',
      cs: 'Rohy cyklí proti směru, hrany po směru hodinových ručiček; pravý zadní roh a pravá hrana zůstávají.',
    },
  },
  {
    id: 'pll-gc',
    group: 'pll-both',
    name: same('Gc-perm'),
    short: 'Gc',
    alg: "R2 U' R U' R U R' U R2 U D' R U' R' D (U')",
    description: {
      en: 'Corners cycle counterclockwise, edges clockwise; the back-right corner and back edge stay.',
      cs: 'Rohy cyklí proti směru, hrany po směru hodinových ručiček; pravý zadní roh a zadní hrana zůstávají.',
    },
  },
  {
    id: 'pll-gd',
    group: 'pll-both',
    name: same('Gd-perm'),
    short: 'Gd',
    alg: "R U R' U' D R2 U' R U' R' U R' U R2 D' (U)",
    description: {
      en: 'Corners cycle clockwise, edges counterclockwise; the front-right corner and right edge stay.',
      cs: 'Rohy cyklí po směru, hrany proti směru hodinových ručiček; pravý přední roh a pravá hrana zůstávají.',
    },
  },
];
