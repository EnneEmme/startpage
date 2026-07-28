import { signal } from '@preact/signals';
import { themeEngine } from '../engine';
import type { ThemeConfig } from '../engine/themeEngine';

export const themeConfigSignal = signal<ThemeConfig>(themeEngine.getConfig());

themeEngine.subscribe(() => {
  themeConfigSignal.value = themeEngine.getConfig();
});
