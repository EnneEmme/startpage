/**
 * Cheatsheet Data Module
 * Provides structured list of keyboard shortcuts for the Interactive Cheatsheet Modal,
 * dynamically enriched with user-created search engines.
 */

import { dataStore } from './dataStore';

export interface ShortcutGroup {
  category: string;
  items: {
    keys: string[];
    description: string;
  }[];
}

export const BASE_CHEATSHEET_SHORTCUTS: ShortcutGroup[] = [
  {
    category: 'Search & Navigation',
    items: [
      { keys: ['Any Key'], description: 'Start typing anywhere to activate fuzzy search' },
      { keys: ['Shift', 'N'], description: 'Open Add New Link modal' },
      { keys: ['Alt', 'or', 'Shift+Space'], description: 'Toggle Aliases & Category Number Shortcuts (1..9)' },
      { keys: ['1..9'], description: 'Instantly jump to category #1 through #9' },
      { keys: ['↑', '↓'], description: 'Navigate search result candidates' },
      { keys: ['Enter'], description: 'Open highlighted search result or URL' },
      { keys: ['Esc'], description: 'Close search overlay or active modal' }
    ]
  },
  {
    category: 'Command Palette Prefixes',
    items: [
      { keys: ['g', '<query>'], description: 'Search Google' },
      { keys: ['yt', '<query>'], description: 'Search YouTube' },
      { keys: ['gh', '<query>'], description: 'Search GitHub' },
      { keys: ['w', '<query>'], description: 'Search Wikipedia' },
      { keys: ['ddg', '<query>'], description: 'Search DuckDuckGo' }
    ]
  }
];

export function getDynamicCheatsheetShortcuts(): ShortcutGroup[] {
  const groups = JSON.parse(JSON.stringify(BASE_CHEATSHEET_SHORTCUTS)) as ShortcutGroup[];

  // Find custom user-created search engine links
  const customLinks = dataStore.getLinks().filter(l => Boolean(l.searchTemplate || l.searchPath));
  const commandGroup = groups.find(g => g.category === 'Command Palette Prefixes');

  if (commandGroup && customLinks.length > 0) {
    customLinks.forEach(link => {
      const alias = link.aliases && link.aliases.length > 0 ? link.aliases[0] : null;
      if (alias) {
        // avoid duplicate keys
        const exists = commandGroup.items.some(item => item.keys[0] === alias);
        if (!exists) {
          commandGroup.items.push({
            keys: [alias, '<query>'],
            description: `Search ${link.title}`
          });
        }
      }
    });
  }

  return groups;
}

export const CHEATSHEET_SHORTCUTS = BASE_CHEATSHEET_SHORTCUTS;
