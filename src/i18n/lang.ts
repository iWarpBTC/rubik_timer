export type Lang = 'en' | 'cs';

export const LANGS: readonly Lang[] = ['en', 'cs'];

/** Text in every supported language. */
export type Localized = Record<Lang, string>;

/** Text that reads the same in every language, e.g. "Aa-perm". */
export function same(text: string): Localized {
  return { en: text, cs: text };
}

/** Czech for Czech-speaking browsers, English otherwise. */
export function detectLang(languages: readonly string[]): Lang {
  return languages.some((l) => l.toLowerCase().startsWith('cs')) ? 'cs' : 'en';
}
