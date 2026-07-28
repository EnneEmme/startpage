import { describe, it, expect, beforeEach } from 'vitest';
import { dataStore } from '../src/engine/dataStore';
import { themeEngine } from '../src/engine/themeEngine';
import { linksSignal, linksCount } from '../src/stores/appStore';
import { themeConfigSignal, currentAccentColor } from '../src/stores/settingsStore';

describe('Signals State Management', () => {
  beforeEach(() => {
    dataStore.resetToDefault();
  });

  it('appStore syncs with dataStore pub/sub', () => {
    const initialLinksCount = linksSignal.value.length;
    
    // Add link to datastore directly
    dataStore.addLink({
      id: 'test_link',
      title: 'Test',
      url: 'https://test.com',
      category: 'General'
    });

    expect(linksSignal.value.length).toBe(initialLinksCount + 1);
    expect(linksCount.value).toBe(initialLinksCount + 1);
    expect(linksSignal.value.find(l => l.id === 'test_link')).toBeDefined();
  });

  it('settingsStore syncs with themeEngine pub/sub', () => {
    themeEngine.setAccentColor('emerald');
    expect(themeConfigSignal.value.accentColorId).toBe('emerald');
    expect(currentAccentColor.value).toBe('emerald');
  });
});
