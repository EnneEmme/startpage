import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/preact';
import { App } from '../src/app';
import { dataStore } from '../src/engine/dataStore';
import { rankStorage } from '../src/engine/rankStorage';

// Accessibility, behavioral edition: zero fs.readFileSync on CSS/TSX/HTML.
// We assert only what a keyboard / screen-reader user actually perceives in
// the rendered tree. The old disk-string checks (media queries, dvh, touch
// hints, noscript, CSS masks) were coupled to formatting and are gone: CSS
// media features like prefers-reduced-motion / prefers-color-scheme are not
// observable in jsdom and have no behavioral substitute here.
describe('Accessibility (behavioral)', () => {
  beforeEach(() => {
    dataStore.resetToDefault();
    rankStorage.clear();
    window.scrollTo = vi.fn();
  });

  it('exposes a skip link whose href target actually exists', () => {
    const { container } = render(<App />);

    const skipLink = container.querySelector<HTMLAnchorElement>('a.skipLink');
    expect(skipLink).not.toBeNull();
    expect(skipLink!.getAttribute('href')).toBe('#main-grid');

    // The anchor target must resolve inside the same document
    const target = container.querySelector('#main-grid');
    expect(target).not.toBeNull();
    expect(target!.tagName).toBe('MAIN');
  });

  it('renders exactly one visually-hidden top-level <h1>', () => {
    const { container } = render(<App />);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]!.classList.contains('sr-only')).toBe(true);
    expect(h1s[0]!.textContent!.trim().length).toBeGreaterThan(0);
  });

  it('opens the search modal as a labelled dialog with a combobox input', () => {
    render(<App />);

    // Header ActionToolbar (the first of the two toolbar instances)
    fireEvent.click(screen.getAllByRole('button', { name: 'Fuzzy Search (Press any key)' })[0]!);

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    // No visible title (hideHeader): the dialog must carry an accessible name
    expect(dialog.getAttribute('aria-label')).toBe('Search links and commands');

    // The input is an ARIA combobox wired to its listbox, and focus landed on it
    const combobox = screen.getByRole('combobox', { name: 'Search links, aliases, or commands' });
    expect(combobox.getAttribute('aria-controls')).toBe('search-results-listbox');
    expect(document.activeElement).toBe(combobox);
  });

  it('Escape closes the search dialog', () => {
    render(<App />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Fuzzy Search (Press any key)' })[0]!);
    expect(screen.queryByRole('dialog')).not.toBeNull();

    fireEvent.keyDown(screen.getByRole('combobox'), { key: 'Escape' });

    expect(screen.queryByRole('dialog')).toBeNull();
    // Dialog teardown must not leave the page scroll locked
    expect(document.body.style.overflow).toBe('');
  });
});
