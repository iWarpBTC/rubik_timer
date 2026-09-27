import { describe, expect, it } from 'vitest';
import { ALGORITHM_GROUPS, ALGORITHMS, TRIGGERS } from '../lib/algorithms';
import { NOTATION } from '../lib/notation';
import { detectLang, LANGS, type Localized } from './lang';

describe('detectLang', () => {
  it('picks Czech for Czech browsers and English otherwise', () => {
    expect(detectLang(['cs-CZ', 'en'])).toBe('cs');
    expect(detectLang(['en-US', 'cs'])).toBe('cs');
    expect(detectLang(['de-DE', 'en'])).toBe('en');
    expect(detectLang([])).toBe('en');
  });
});

describe('cheatsheet data', () => {
  const texts: Array<[string, Localized]> = [
    ...ALGORITHM_GROUPS.flatMap((g): Array<[string, Localized]> => [[`${g.id} title`, g.title], [`${g.id} note`, g.note]]),
    ...ALGORITHMS.flatMap((a): Array<[string, Localized]> => [[`${a.id} name`, a.name], [`${a.id} description`, a.description]]),
    ...TRIGGERS.flatMap((t): Array<[string, Localized]> => [[`${t.id} name`, t.name], [`${t.id} description`, t.description]]),
    ...NOTATION.flatMap((g) => [
      [`${g.id} title`, g.title] as [string, Localized],
      ...g.moves.map((m): [string, Localized] => [`${m.move} description`, m.description]),
    ]),
  ];

  it.each(texts)('%s is filled in every language', (_, text) => {
    for (const lang of LANGS) expect(text[lang].trim()).not.toBe('');
  });

  it('translates every description', () => {
    for (const a of ALGORITHMS) expect(a.description.cs).not.toBe(a.description.en);
    for (const m of NOTATION.flatMap((g) => g.moves)) expect(m.description.cs).not.toBe(m.description.en);
  });
});
