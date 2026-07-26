/**
 * Cheatsheet Data Module
 * Provides structured list of keyboard shortcuts for the Interactive Cheatsheet Modal.
 */

export interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
  }[];
}

export const CHEATSHEET_SHORTCUTS: ShortcutGroup[] = [
  {
    category: 'Search & Navigation',
    items: [
      { keys: ['Any Key'], description: 'Start typing anywhere to activate fuzzy search' },
      { keys: ['Ctrl', '1..9'], description: 'Instantly open result item #1 to #9' },
      { keys: ['↑', '↓'], description: 'Navigate search result candidates' },
      { keys: ['Enter'], description: 'Open highlighted search result or URL' },
      { keys: ['Esc'], description: 'Close search overlay or active modal' }
    ]
  },
  {
    category: 'Command Palette Prefixes',
    items: [
      { keys: ['g', '<query>'], description: 'Search Google (e.g. "g meteo")' },
      { keys: ['yt', '<query>'], description: 'Search YouTube (e.g. "yt lofi")' },
      { keys: ['gh', '<query>'], description: 'Search GitHub repositories' },
      { keys: ['w', '<query>'], description: 'Search Wikipedia' },
      { keys: ['ddg', '<query>'], description: 'Search DuckDuckGo' }
    ]
  },
  {
    category: 'Shortcuts & System',
    items: [
      { keys: ['?'], description: 'Toggle keyboard shortcuts cheatsheet' },
      { keys: ['F1'], description: 'Open cheatsheet modal' },
      { keys: ['Cmd', '/'], description: 'Toggle cheatsheet modal' }
    ]
  }
];
