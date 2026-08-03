import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/preact';
import { SettingsModal } from '../src/components/SettingsModal';
import { themeEngine, ACCENT_COLORS } from '../src/engine/themeEngine';
import { themeConfigSignal } from '../src/stores';

const DEFAULT_CONFIG = {
  accentColorId: 'silver',
  gridDensity: 'normal',
  fontSize: 'medium',
  aliasVisibility: 'smart',
  defaultSearchEngine: 'g'
} as const;

describe('SettingsModal', () => {
  beforeEach(() => {
    // Singleton reset: every test starts from the default theme config.
    themeEngine.updateConfig({ ...DEFAULT_CONFIG });
  });

  it('renders the dialog with grouped, labelled control sections (A3 contract)', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Settings & Personalization' });

    // Every settings group exposes role=group wired to a visible label id
    const groups = within(dialog).getAllByRole('group');
    expect(groups.length).toBeGreaterThanOrEqual(5);
    for (const group of groups) {
      const labelId = group.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();
      expect(dialog.querySelector(`#${labelId}`)).not.toBeNull();
    }
  });

  it('clicking an accent color chip updates the config and the selection marker', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    const emeraldLabel = `${ACCENT_COLORS.find(c => c.id === 'emerald')!.name} palette`;
    const silverLabel = `${ACCENT_COLORS.find(c => c.id === 'silver')!.name} palette`;

    // Default selection: silver shows the check marker, emerald does not
    expect(screen.getByRole('button', { name: silverLabel }).querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: emeraldLabel }).querySelector('svg')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: emeraldLabel }));

    expect(themeConfigSignal.value.accentColorId).toBe('emerald');
    // Selection marker moved to the clicked chip (Check icon is rendered only when selected)
    expect(screen.getByRole('button', { name: emeraldLabel }).querySelector('svg')).not.toBeNull();
    expect(screen.getByRole('button', { name: silverLabel }).querySelector('svg')).toBeNull();
  });

  it('clicking a grid density segment updates the config and root variables', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Spaced' }));

    expect(themeConfigSignal.value.gridDensity).toBe('spaced');
    expect(document.documentElement.style.getPropertyValue('--grid-col-min-width')).toBe('230px');
  });

  it('clicking a font size segment updates the config', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Large' }));

    expect(themeConfigSignal.value.fontSize).toBe('large');
    expect(document.documentElement.style.getPropertyValue('--font-size-link')).toBe('1.12rem');
  });

  it('the footer Close button calls onClose', () => {
    const onClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByText('Close'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when closed', () => {
    const { container } = render(<SettingsModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });
});
