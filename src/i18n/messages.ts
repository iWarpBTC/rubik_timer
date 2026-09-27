import type { TimerPhase } from '../hooks/useTimer';
import type { SortOrder } from '../components/ScrambleList';
import type { ImportErrorCode } from '../lib/storage';
import type { Lang } from './lang';

const en = {
  langName: 'English',
  switchLanguage: 'Přepnout do češtiny',

  scrambleName: (n: number | string) => `Scramble #${n}`,
  solveCount: (n: number) => `${n} ${n === 1 ? 'solve' : 'solves'}`,

  toolbar: {
    scrambles: 'Scrambles',
    showList: 'Show scramble list',
    hideList: 'Hide scramble list',
    new: 'New',
    cheatsheet: 'Cheatsheet',
    cheatsheetTitle: 'Moves and algorithms (?)',
  },

  list: {
    newScramble: 'New Scramble',
    search: 'Search title or moves…',
    sortLabel: 'Sort scrambles',
    sort: {
      newest: 'Newest',
      oldest: 'Oldest',
      'best-average': 'Best average',
      'most-solves': 'Most solves',
      'favorites-first': 'Favorites first',
    } satisfies Record<SortOrder, string>,
    empty: 'No scrambles yet.',
    noMatch: 'No scrambles match the search.',
    best: 'best',
    avg: 'avg',
    markFavorite: 'Mark favorite',
    removeFavorite: 'Remove favorite',
    rename: 'Rename scramble',
    delete: 'Delete scramble',
    deleteTitle: 'Delete scramble?',
    deleteMessage: (name: string, solves: number) =>
      `This deletes "${name}" and all ${solves} of its solves. This cannot be undone.`,
    deleteConfirm: 'Delete',
  },

  importExport: {
    export: 'Export JSON',
    import: 'Import JSON',
    title: 'Import data?',
    message: (scrambles: number, solves: number, newScrambles: number, newSolves: number) =>
      `This replaces everything currently stored (${scrambles} scrambles, ${solves} solves) with the imported file (${newScrambles} scrambles, ${newSolves} solves).`,
    confirm: 'Import',
    errors: {
      'not-json': 'Not a valid JSON file.',
      'not-export': 'Not a rubik-timer export file.',
      version: 'Unsupported export version.',
      'invalid-data': 'Invalid data: expected "scrambles" and "solves" arrays.',
    } satisfies Record<ImportErrorCode, string>,
    failed: 'Import failed.',
  },

  dialog: { cancel: 'Cancel' },

  panel: {
    noneSelected: 'No scramble selected. Pick one from the list, or start a new one.',
    shortcut: 'Shortcut:',
    netLabel: 'Scrambled cube net',
    statistics: 'Statistics',
    notes: 'Notes',
    notesPlaceholder: 'Notes about this scramble…',
    history: 'Solve history',
  },

  stats: {
    solves: 'Solves',
    best: 'Best',
    worst: 'Worst',
    average: 'Average',
    median: 'Median',
    stdDev: 'Std Dev',
    ao5: 'Ao5',
    ao12: 'Ao12',
  },

  history: {
    empty: 'No solves yet.',
    time: 'Time',
    penalty: 'Penalty',
    notes: 'Notes',
    date: 'Date',
    notesPlaceholder: 'notes',
    delete: 'Delete solve',
  },

  timerHint: (phase: TimerPhase, touch: boolean): string => {
    switch (phase) {
      case 'running':
        return touch ? 'Tap anywhere to stop' : 'Press Space or click anywhere to stop';
      case 'ready':
        return 'Release to start';
      case 'holding':
        return 'Keep holding…';
      case 'idle':
        return touch ? 'Touch and hold the timer, release to start' : 'Hold Space or click and hold the timer to start';
    }
  },

  cheatsheet: {
    title: 'Cheatsheet',
    sections: 'Cheatsheet sections',
    close: 'Close cheatsheet',
    moves: 'Moves',
    algorithms: 'Algorithms',
    movesIntro: {
      before: 'A letter turns that layer 90° ',
      clockwise: 'clockwise',
      middle: ', as seen looking straight at that face. An apostrophe (',
      prime: ', “R prime”) turns it counterclockwise, a ',
      after: ' turns it twice (180°). Blue marks the layers that move.',
    },
    algorithmsIntro:
      'Pictures show the top layer from above (front at the bottom), yellow on top and green in front. Hold the cube like the picture, then do the algorithm; arrows show where pieces go. A move in parentheses at the end is the final turn of the top layer.',
    triggers: 'Triggers',
    triggersNote:
      'Short sequences the algorithms below are built from. Done six times in a row, each returns the cube to where it started.',
    caseLabel: 'Top layer of the case',
    filterLabel: 'Which algorithms to show',
    showAll: 'All',
    showFavorites: 'Favorites',
    markFavorite: 'Mark as favorite',
    removeFavorite: 'Remove from favorites',
    noFavorites: 'No favorites yet. Tap the ☆ on an algorithm to add it here.',
  },
};

export type Messages = typeof en;

const cs: Messages = {
  langName: 'Čeština',
  switchLanguage: 'Switch to English',

  scrambleName: (n) => `Zamíchání #${n}`,
  solveCount: (n) => `${n} složení`,

  toolbar: {
    scrambles: 'Zamíchání',
    showList: 'Zobrazit seznam zamíchání',
    hideList: 'Skrýt seznam zamíchání',
    new: 'Nové',
    cheatsheet: 'Tahák',
    cheatsheetTitle: 'Tahy a algoritmy (?)',
  },

  list: {
    newScramble: 'Nové zamíchání',
    search: 'Hledat název nebo tahy…',
    sortLabel: 'Řazení zamíchání',
    sort: {
      newest: 'Nejnovější',
      oldest: 'Nejstarší',
      'best-average': 'Nejlepší průměr',
      'most-solves': 'Nejvíc složení',
      'favorites-first': 'Oblíbená nahoře',
    },
    empty: 'Zatím žádná zamíchání.',
    noMatch: 'Hledání neodpovídá žádné zamíchání.',
    best: 'nejl.',
    avg: 'prům.',
    markFavorite: 'Označit jako oblíbené',
    removeFavorite: 'Odebrat z oblíbených',
    rename: 'Přejmenovat zamíchání',
    delete: 'Smazat zamíchání',
    deleteTitle: 'Smazat zamíchání?',
    deleteMessage: (name, solves) =>
      `Smaže se „${name}“ a všech ${solves} jeho složení. Tuto akci nelze vrátit.`,
    deleteConfirm: 'Smazat',
  },

  importExport: {
    export: 'Export JSON',
    import: 'Import JSON',
    title: 'Importovat data?',
    message: (scrambles, solves, newScrambles, newSolves) =>
      `Vše, co je teď uložené (zamíchání: ${scrambles}, složení: ${solves}), se nahradí importovaným souborem (zamíchání: ${newScrambles}, složení: ${newSolves}).`,
    confirm: 'Importovat',
    errors: {
      'not-json': 'Soubor není platný JSON.',
      'not-export': 'Soubor není export z rubik-timer.',
      version: 'Nepodporovaná verze exportu.',
      'invalid-data': 'Neplatná data: chybí pole „scrambles“ a „solves“.',
    },
    failed: 'Import se nezdařil.',
  },

  dialog: { cancel: 'Zrušit' },

  panel: {
    noneSelected: 'Není vybrané žádné zamíchání. Vyber ho ze seznamu nebo začni nové.',
    shortcut: 'Zkratka:',
    netLabel: 'Síť zamíchané kostky',
    statistics: 'Statistiky',
    notes: 'Poznámky',
    notesPlaceholder: 'Poznámky k tomuto zamíchání…',
    history: 'Historie složení',
  },

  stats: {
    solves: 'Složení',
    best: 'Nejlepší',
    worst: 'Nejhorší',
    average: 'Průměr',
    median: 'Medián',
    stdDev: 'Sm. odch.',
    ao5: 'Ao5',
    ao12: 'Ao12',
  },

  history: {
    empty: 'Zatím žádná složení.',
    time: 'Čas',
    penalty: 'Penalizace',
    notes: 'Poznámky',
    date: 'Datum',
    notesPlaceholder: 'poznámka',
    delete: 'Smazat složení',
  },

  timerHint: (phase, touch) => {
    switch (phase) {
      case 'running':
        return touch ? 'Klepni kamkoli pro zastavení' : 'Zastav mezerníkem nebo kliknutím kamkoli';
      case 'ready':
        return 'Pusť pro start';
      case 'holding':
        return 'Drž dál…';
      case 'idle':
        return touch ? 'Podrž prst na časovači a pusť pro start' : 'Podrž mezerník nebo tlačítko myši na časovači a pusť pro start';
    }
  },

  cheatsheet: {
    title: 'Tahák',
    sections: 'Části taháku',
    close: 'Zavřít tahák',
    moves: 'Tahy',
    algorithms: 'Algoritmy',
    movesIntro: {
      before: 'Písmeno otočí danou vrstvu o 90° ',
      clockwise: 'po směru hodinových ručiček',
      middle: ', když se na tu stěnu díváš zepředu. Apostrof (',
      prime: ', „R s čárkou“) ji otočí proti směru, ',
      after: ' dvakrát (o 180°). Modře jsou vrstvy, které se pohnou.',
    },
    algorithmsIntro:
      'Obrázky ukazují horní vrstvu shora (přední strana dole), žlutá nahoře a zelená vpředu. Drž kostku jako na obrázku a proveď algoritmus; šipky ukazují, kam se kostičky přesunou. Tah v závorce na konci je závěrečné otočení horní vrstvy.',
    triggers: 'Triggery',
    triggersNote:
      'Krátké sekvence, ze kterých jsou algoritmy níže složené. Když kterýkoli zopakuješ šestkrát za sebou, kostka se vrátí do původního stavu.',
    caseLabel: 'Horní vrstva případu',
    filterLabel: 'Které algoritmy zobrazit',
    showAll: 'Všechny',
    showFavorites: 'Oblíbené',
    markFavorite: 'Označit jako oblíbený',
    removeFavorite: 'Odebrat z oblíbených',
    noFavorites: 'Zatím žádné oblíbené. Klepni na ☆ u algoritmu a přidáš ho sem.',
  },
};

export const MESSAGES: Record<Lang, Messages> = { en, cs };
