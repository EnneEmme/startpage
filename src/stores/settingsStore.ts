import { signal, computed } from '@preact/signals';
import { themeEngine, ThemeConfig } from '../engine/themeEngine';

export const themeConfigSignal = signal<ThemeConfig>(themeEngine.getConfig());

export const currentAccentColor = computed(() => themeConfigSignal.value.accentColorId);

themeEngine.subscribe(() => {
  themeConfigSignal.value = themeEngine.getConfig();
});
