import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { ActionToolbar } from '../src/components/ActionToolbar';
import { JumpBar } from '../src/components/JumpBar';

describe('UI Components Unit Tests', () => {
  it('renders ActionToolbar header tool buttons', () => {
    const { getAllByRole } = render(
      <ActionToolbar
        variant="header"
        onOpenSearch={vi.fn()}
        onOpenCheatsheet={vi.fn()}
        onOpenVisualEdit={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );
    // Selezione per ruolo + nome accessibile (aria-label), non per title:
    // i bottoni restano trovabili anche se cambia il copy dei tooltip.
    expect(getAllByRole('button', { name: 'Fuzzy Search (Press any key)' })[0]).not.toBeNull();
    expect(getAllByRole('button', { name: 'Shortcuts Cheatsheet (? or F1)' })[0]).not.toBeNull();
  });

  it('clicking the settings tool button calls onOpenSettings', () => {
    const onOpenSettings = vi.fn();
    const { getByRole } = render(
      <ActionToolbar
        variant="header"
        onOpenSearch={vi.fn()}
        onOpenCheatsheet={vi.fn()}
        onOpenVisualEdit={vi.fn()}
        onOpenSettings={onOpenSettings}
      />,
    );

    fireEvent.click(getByRole('button', { name: 'Settings & Themes' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('space does NOT activate a toolbar button (Enter still does)', () => {
    const onOpenSettings = vi.fn();
    const { getByRole } = render(
      <ActionToolbar
        variant="header"
        onOpenSearch={vi.fn()}
        onOpenCheatsheet={vi.fn()}
        onOpenVisualEdit={vi.fn()}
        onOpenSettings={onOpenSettings}
      />,
    );
    const settingsBtn = getByRole('button', { name: 'Settings & Themes' });

    // Space is swallowed (preventDefault): an accidental scroll never opens
    // the modal and the button never flashes an active/selected state.
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    settingsBtn.dispatchEvent(spaceEvent);
    expect(spaceEvent.defaultPrevented).toBe(true);
    expect(onOpenSettings).not.toHaveBeenCalled();

    // Enter is preserved as the deliberate activation key (not prevented)
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    settingsBtn.dispatchEvent(enterEvent);
    expect(enterEvent.defaultPrevented).toBe(false);
  });

  it('renders JumpBar categories and triggers click handler', () => {
    const onSelect = vi.fn();
    const categories = ['Social', 'Dev', 'AI'];
    const { getByText } = render(
      <JumpBar categories={categories} activeCategory="Social" onSelectCategory={onSelect} />,
    );

    expect(getByText('All')).not.toBeNull();
    expect(getByText('Social')).not.toBeNull();
  });
});
