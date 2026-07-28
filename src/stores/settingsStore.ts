import { signal } from '@preact/signals';
import { themeEngine } from '../engine';
import type { ThemeConfig } from '../engine/themeEngine';

export const themeConfigSignal = signal<ThemeConfig>(themeEngine.getConfig());

themeEngine.subscribe(() => {
  themeConfigSignal.value = themeEngine.getConfig();
});

/**
 * Single mutation path for theme/settings. themeEngine persists + applies
 * the theme inside each setter and keeps themeConfigSignal in sync.
 */
export const settingsActions = {
  setAccentColor: (colorId: string): void => themeEngine.setAccentColor(colorId),

  setGridDensity: (density: 'compact' | 'normal' | 'spaced'): void =>
    themeEngine.setGridDensity(density),

  setFontSize: (size: 'small' | 'medium' | 'large' | 'xlarge'): void =>
    themeEngine.setFontSize(size),

  setAliasVisibility: (visibility: 'smart' | 'always'): void =>
    themeEngine.setAliasVisibility(visibility),

  setDefaultSearchEngine: (engine: 'g' | 'ddg' | 'b' | 'yt' | 'gh'): void =>
    themeEngine.setDefaultSearchEngine(engine)
};
