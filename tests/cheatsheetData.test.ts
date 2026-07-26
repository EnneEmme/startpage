import { describe, it, expect } from 'vitest';
import { CHEATSHEET_SHORTCUTS } from '../src/engine/cheatsheetData';

describe('CHEATSHEET_SHORTCUTS Data', () => {
  it('contains non-empty shortcut categories and items', () => {
    expect(CHEATSHEET_SHORTCUTS.length).toBeGreaterThan(0);
    CHEATSHEET_SHORTCUTS.forEach(group => {
      expect(group.category).toBeTruthy();
      expect(group.items.length).toBeGreaterThan(0);
    });
  });
});
