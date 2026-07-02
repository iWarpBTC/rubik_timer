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

## Keyboard

| Key | Action |
| --- | --- |
| Space (hold, then release) | Start timer (turns green when ready) |
| Space (while running) | Stop timer — the solve is stored automatically |
| Delete | Delete the selected solve |
| Ctrl+N | New scramble |
| Ctrl+F | Focus search |
| Esc | Cancel dialog |

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
  cube simulation for the net rendering, statistics, formatting, storage.
- `src/store/` — single reducer store (React context) persisted to Local
  Storage on every change.
- `src/hooks/useTimer.ts` — the space-bar timer state machine.
- `src/components/` — presentational components (scramble list, cube net,
  stats, solve history, dialogs, import/export).
