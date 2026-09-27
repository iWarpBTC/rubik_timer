# Rubik Timer

A minimal, offline, single-user training timer for the 3x3x3 Rubik's Cube.
The primary entity is the **scramble**: each scramble is a permanent object
that can hold any number of solves, so you can practice the same scramble
repeatedly and compare statistics per scramble.

## Usage

```sh
npm install
npm run dev      # start the app
npm test         # run unit tests (stats, cube simulation, scramble generator)
npm run build    # typecheck + production build
```

## Keyboard, mouse and touch

| Input | Action |
| --- | --- |
| Space, or press and hold the timer (hold, then release) | Start timer (turns green when ready) |
| Space, or click / tap anywhere (while running) | Stop timer — the solve is stored automatically |
| Delete | Delete the selected solve |
| Ctrl+N | New scramble |
| Ctrl+F | Focus search |
| ? | Open the cheatsheet |
| Esc | Cancel dialog / close cheatsheet |

While a solve is running the page turns green and the screen is kept on
(Screen Wake Lock API; needs HTTPS or localhost, otherwise it is skipped).

The layout works on phones: the scramble list becomes a drawer (the
"Scrambles" button), and on wide screens it can be collapsed with the same
button in the top bar.

## Languages

The app is available in English and Czech. It starts in Czech when the
browser prefers Czech, otherwise in English; the EN / CZ button in the top
bar switches it, and the choice is remembered. UI strings live in
`src/i18n/messages.ts` (the Czech dictionary is type-checked against the
English one, so a missing translation fails the build); cheatsheet texts sit
next to their data in `src/lib/algorithms.ts` and `src/lib/notation.ts`.

## Cheatsheet

The "Cheatsheet" button (or `?`) opens a reference with two tabs:

- **Moves** — face turns, slice moves (M E S), wide moves and cube rotations,
  each drawn for the plain, prime (') and half (2) turn.
- **Algorithms** — 2-look OLL and all 21 PLLs, with a picture of the case
  each one solves. Star (☆) the ones you are learning and switch to
  "Favorites" to see only those; both are remembered in this browser. The pictures are computed from the algorithms by the cube
  simulation, and `src/lib/algorithms.test.ts` checks every algorithm keeps
  the first two layers intact and solves the case its name and description
  claim.

## Notes

- All data lives in browser Local Storage; every change is saved immediately.
- Export/Import uses a versioned JSON format (`format: "rubik-timer", version: 1`).
  Importing replaces all stored data after confirmation.
- Scrambles are random-move sequences (20 moves, WCA notation, no redundant
  consecutive faces). Swapping in a random-state generator later only requires
  replacing `src/lib/scramble.ts`.
- Averages follow WCA rules: Ao5/Ao12 drop best and worst, a DNF counts as
  worst, two DNFs make the average DNF. Best/worst/mean/median/stddev ignore
  DNF solves; +2 penalties are included as time + 2s.

## Architecture

- `src/lib/` — pure, unit-tested logic: scramble generation, facelet-level
  cube simulation (net rendering and the cheatsheet), statistics, formatting,
  storage, and the notation / algorithm data.
- `src/i18n/` — language detection, the language context and UI strings.
- `src/store/` — single reducer store (React context) persisted to Local
  Storage on every change.
- `src/hooks/useTimer.ts` — the timer state machine (space bar and pointer).
- `src/components/` — presentational components (scramble list, cube net,
  stats, solve history, dialogs, import/export, cheatsheet and its diagrams).
