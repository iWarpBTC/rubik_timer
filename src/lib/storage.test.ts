import { describe, expect, it } from 'vitest';
import { EXPORT_FORMAT, EXPORT_VERSION, parseImport } from './storage';

const SEQUENCE = "R U R' U'";

function exportJson(scrambles: object[]): string {
  return JSON.stringify({ format: EXPORT_FORMAT, version: EXPORT_VERSION, scrambles, solves: [] });
}

describe('parseImport scramble numbers', () => {
  it('keeps stored numbers, including gaps left by deleted scrambles', () => {
    const data = parseImport(
      exportJson([
        { id: 'a', scramble: SEQUENCE, createdAt: 1, number: 1 },
        { id: 'c', scramble: SEQUENCE, createdAt: 3, number: 3 },
      ]),
    );
    expect(data.scrambles.map((s) => s.number)).toEqual([1, 3]);
  });

  it('numbers scrambles saved without numbers by creation order', () => {
    const data = parseImport(
      exportJson([
        { id: 'b', scramble: SEQUENCE, createdAt: 2 },
        { id: 'a', scramble: SEQUENCE, createdAt: 1 },
      ]),
    );
    expect(data.scrambles.map((s) => [s.id, s.number])).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
  });

  it('numbers unnumbered scrambles after the highest number in use', () => {
    const data = parseImport(
      exportJson([
        { id: 'a', scramble: SEQUENCE, createdAt: 1 },
        { id: 'b', scramble: SEQUENCE, createdAt: 2, number: 5 },
      ]),
    );
    expect(data.scrambles.map((s) => s.number)).toEqual([6, 5]);
  });
});
