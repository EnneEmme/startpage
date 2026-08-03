import { describe, it, expect, beforeEach } from 'vitest';
import { dataStore } from '../src/engine/dataStore';
import { themeEngine } from '../src/engine/themeEngine';
import { linksSignal } from '../src/stores/appStore';
import { themeConfigSignal } from '../src/stores/settingsStore';
import type { LinkItem } from '../src/types/startpage';

const makeLink = (overrides: Partial<LinkItem>): LinkItem => ({
  id: 'link',
  title: 'Link',
  url: 'https://example.com',
  category: 'General',
  aliases: [],
  ...overrides,
});

describe('Signals State Management', () => {
  beforeEach(() => {
    dataStore.resetToDefault();
  });

  it('appStore syncs with dataStore pub/sub', () => {
    const initialLinksCount = linksSignal.value.length;

    // Add link to datastore directly
    dataStore.addLink(
      makeLink({
        id: 'test_link',
        title: 'Test',
        url: 'https://test.com',
      }),
    );

    expect(linksSignal.value.length).toBe(initialLinksCount + 1);
    expect(linksSignal.value.find(l => l.id === 'test_link')).toBeDefined();
  });

  it('settingsStore syncs with themeEngine pub/sub', () => {
    themeEngine.setAccentColor('emerald');
    expect(themeConfigSignal.value.accentColorId).toBe('emerald');
  });
});
