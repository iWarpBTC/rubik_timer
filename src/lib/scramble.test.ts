import { describe, expect, it } from 'vitest';
import { generateScramble } from './scramble';
import { isValidScramble } from './cube';

const AXIS: Record<string, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };

describe('generateScramble', () => {
  it('generates 20 valid WCA moves', () => {
    for (let i = 0; i < 200; i++) {
      const scramble = generateScramble();
      const moves = scramble.split(' ');
      expect(moves).toHaveLength(20);
      expect(isValidScramble(scramble)).toBe(true);
    }
  });

  it('never repeats a face consecutively or across its opposite', () => {
    for (let i = 0; i < 200; i++) {
      const faces = generateScramble()
        .split(' ')
        .map((m) => m[0]!);
      for (let j = 1; j < faces.length; j++) {
        expect(faces[j]).not.toBe(faces[j - 1]);
        if (j >= 2 && AXIS[faces[j]!] === AXIS[faces[j - 1]!]) {
          expect(faces[j]).not.toBe(faces[j - 2]);
        }
      }
    }
  });
});
