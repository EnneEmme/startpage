import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { themeEngine, ThemeEngine, ACCENT_COLORS } from '../src/engine/themeEngine';
import { themeConfigSignal } from '../src/stores';

const STORAGE_KEY = 'startpage_theme_settings';

const DEFAULT_CONFIG = {
  accentColorId: 'silver',
  gridDensity: 'normal',
  fontSize: 'medium',
  aliasVisibility: 'smart',
  defaultSearchEngine: 'g'
} as const;

const ROOT_PROPS = [
  '--accent-primary',
  '--accent-highlight',
  '--accent-glow',
  '--border-color-hover',
  '--grid-col-min-width',
  '--grid-gap',
  '--link-row-padding',
  '--font-size-base',
  '--font-size-link',
  '--font-size-header',
  '--font-size-badge',
  '--alias-badge-display-override',
  '--alias-badge-opacity-override'
];

describe('ThemeEngine', () => {
  beforeEach(() => {
    // Singleton reset: every test starts from the default config.
    // (localStorage is already pristine via the global tests/setup.ts.)
    themeEngine.updateConfig({ ...DEFAULT_CONFIG });
  });

  afterEach(() => {
    // Leave the jsdom root clean: custom properties must not leak into
    // unrelated component tests sharing this environment.
    const style = document.documentElement.style;
    ROOT_PROPS.forEach(prop => style.removeProperty(prop));
    themeEngine.updateConfig({ ...DEFAULT_CONFIG });
  });

  it('setAccentColor updates config, signal, CSS custom properties and storage', () => {
    themeEngine.setAccentColor('emerald');
    const emerald = ACCENT_COLORS.find(c => c.id === 'emerald')!;
    const rootStyle = document.documentElement.style;

    expect(themeEngine.getConfig().accentColorId).toBe('emerald');
    expect(themeConfigSignal.value.accentColorId).toBe('emerald');
    expect(rootStyle.getPropertyValue('--accent-primary')).toBe(emerald.primary);
    expect(rootStyle.getPropertyValue('--accent-highlight')).toBe(emerald.highlight);
    expect(rootStyle.getPropertyValue('--accent-glow')).toBe(emerald.glow);

    const persisted = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(persisted.accentColorId).toBe('emerald');
  });

  it('setAccentColor with an unknown id is a no-op (does not persist garbage)', () => {
    themeEngine.setAccentColor('does-not-exist');

    expect(themeEngine.getConfig().accentColorId).toBe('silver');
    expect(themeConfigSignal.value.accentColorId).toBe('silver');
    // The unknown id never reaches storage (beforeEach persisted defaults)
    expect(localStorage.getItem(STORAGE_KEY)).not.toContain('does-not-exist');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).accentColorId).toBe('silver');
  });

  it('setGridDensity applies the 3-tier scale to the root and persists', () => {
    themeEngine.setGridDensity('compact');

    expect(themeConfigSignal.value.gridDensity).toBe('compact');
    expect(document.documentElement.style.getPropertyValue('--grid-col-min-width')).toBe('155px');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).gridDensity).toBe('compact');

    themeEngine.setGridDensity('spaced');
    expect(document.documentElement.style.getPropertyValue('--grid-col-min-width')).toBe('230px');
    expect(themeConfigSignal.value.gridDensity).toBe('spaced');
  });

  it('setFontSize applies the configured font scale to the root', () => {
    themeEngine.setFontSize('large');

    expect(themeConfigSignal.value.fontSize).toBe('large');
    expect(document.documentElement.style.getPropertyValue('--font-size-link')).toBe('1.12rem');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).fontSize).toBe('large');
  });

  it('setDefaultSearchEngine updates config, signal and storage', () => {
    themeEngine.setDefaultSearchEngine('ddg');

    expect(themeEngine.getConfig().defaultSearchEngine).toBe('ddg');
    expect(themeConfigSignal.value.defaultSearchEngine).toBe('ddg');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).defaultSearchEngine).toBe('ddg');
  });

  it('loadConfig roundtrip: a fresh engine reads back persisted settings', () => {
    themeEngine.setAccentColor('violet');
    themeEngine.setGridDensity('spaced');
    themeEngine.setFontSize('xlarge');
    themeEngine.setDefaultSearchEngine('gh');

    const restored = new ThemeEngine().getConfig();
    expect(restored.accentColorId).toBe('violet');
    expect(restored.gridDensity).toBe('spaced');
    expect(restored.fontSize).toBe('xlarge');
    expect(restored.defaultSearchEngine).toBe('gh');
    // untouched fields keep their defaults
    expect(restored.aliasVisibility).toBe('smart');
  });

  it('corrupted stored JSON falls back to the default config', () => {
    localStorage.setItem(STORAGE_KEY, 'CORRUPTED_{{JSON');

    const restored = new ThemeEngine().getConfig();
    expect(restored).toEqual(DEFAULT_CONFIG);
  });

  it('partial stored config is merged over defaults', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accentColorId: 'amber' }));

    const restored = new ThemeEngine().getConfig();
    expect(restored.accentColorId).toBe('amber');
    expect(restored.gridDensity).toBe('normal');
    expect(restored.fontSize).toBe('medium');
    expect(restored.defaultSearchEngine).toBe('g');
  });
});
