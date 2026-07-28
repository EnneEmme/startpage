import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import { h } from 'preact';
import { SettingsModal } from '../src/components/SettingsModal';
import { CheatsheetModal } from '../src/components/CheatsheetModal';
import { VisualEditModal } from '../src/components/VisualEditModal';

/**
 * Regression tests for the rules-of-hooks violation (audit P0):
 * the modals are permanently mounted by app.tsx with an isOpen flag,
 * so `if (!isOpen) return null` placed before hooks shifted hook slots
 * between openings. These tests exercise open/close/open cycles.
 */
describe('Modal hooks guards (isOpen toggle)', () => {
  it('SettingsModal survives close → open cycles without hook corruption', () => {
    const onClose = vi.fn();
    const { rerender, container } = render(<SettingsModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Impostazioni & Personalizzazione')).toBeTruthy();

    rerender(<SettingsModal isOpen={false} onClose={onClose} />);
    expect(container.innerHTML).toBe('');

    rerender(<SettingsModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Impostazioni & Personalizzazione')).toBeTruthy();
    expect(screen.getByText(/Densità Griglia/)).toBeTruthy();

    rerender(<SettingsModal isOpen={false} onClose={onClose} />);
    rerender(<SettingsModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Impostazioni & Personalizzazione')).toBeTruthy();
  });

  it('CheatsheetModal survives close → open cycles without hook corruption', () => {
    const onClose = vi.fn();
    const { rerender, container } = render(<CheatsheetModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Keyboard Shortcuts Cheatsheet')).toBeTruthy();

    rerender(<CheatsheetModal isOpen={false} onClose={onClose} />);
    expect(container.innerHTML).toBe('');

    rerender(<CheatsheetModal isOpen={true} onClose={onClose} />);
    expect(screen.getByPlaceholderText(/Filtra scorciatoie/)).toBeTruthy();
  });

  it('VisualEditModal survives close → open cycles and resets add-link form', () => {
    const onClose = vi.fn();
    const { rerender, container } = render(<VisualEditModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Add New Link')).toBeTruthy();

    rerender(<VisualEditModal isOpen={false} onClose={onClose} />);
    expect(container.innerHTML).toBe('');

    rerender(<VisualEditModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Add New Link')).toBeTruthy();
    expect(screen.getByText('URL Sito Web')).toBeTruthy();
  });
});
