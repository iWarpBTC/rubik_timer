import { describe, expect, it } from 'vitest';
import { applyScramble, isValidScramble, solvedCube } from './cube';

describe('cube', () => {
  it('starts solved', () => {
    const state = solvedCube();
    expect(state).toHaveLength(54);
    expect(state.slice(0, 9).every((f) => f === 'U')).toBe(true);
    expect(state.slice(45, 54).every((f) => f === 'B')).toBe(true);
  });

  it.each(['U', 'R', 'F', 'D', 'L', 'B'])('%s applied four times is identity', (face) => {
    expect(applyScramble(`${face} ${face} ${face} ${face}`)).toEqual(solvedCube());
  });

  it.each(['U', 'R', 'F', 'D', 'L', 'B'])("%s2 equals %s %s and %s' undoes %s", (face) => {
    expect(applyScramble(`${face}2`)).toEqual(applyScramble(`${face} ${face}`));
    expect(applyScramble(`${face} ${face}'`)).toEqual(solvedCube());
  });

  it('sexy move six times is identity', () => {
    expect(applyScramble("R U R' U' ".repeat(6))).toEqual(solvedCube());
  });

  it('R turn moves the expected stickers', () => {
    const state = applyScramble('R');
    // F right column (18+2, 18+5, 18+8) now shows D color.
    expect([state[20], state[23], state[26]]).toEqual(['D', 'D', 'D']);
    // U right column shows F color.
    expect([state[2], state[5], state[8]]).toEqual(['F', 'F', 'F']);
    // B left column (as drawn on the net) shows U color, reversed.
    expect([state[45], state[48], state[51]]).toEqual(['U', 'U', 'U']);
    // D right column shows B color.
    expect([state[29], state[32], state[35]]).toEqual(['B', 'B', 'B']);
    // Face centers never move.
    expect(state[4]).toBe('U');
    expect(state[13]).toBe('R');
  });

  it('T-perm-like sequence preserves sticker counts', () => {
    const state = applyScramble("R U R' U' R' F R2 U' R' U' R U R' F'");
    for (const face of ['U', 'R', 'F', 'D', 'L', 'B']) {
      expect(state.filter((f) => f === face)).toHaveLength(9);
    }
  });

  it('validates scramble notation', () => {
    expect(isValidScramble("R U2 F' D L2 B")).toBe(true);
    expect(isValidScramble('')).toBe(false);
    expect(isValidScramble('R X')).toBe(false);
    expect(isValidScramble("R2'")).toBe(false);
  });
});
