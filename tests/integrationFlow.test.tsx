import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { App } from '../src/app';
import { dataStore } from '../src/engine/dataStore';
import { rankStorage } from '../src/engine/rankStorage';

describe('App End-to-End Integration Flow', () => {
  beforeEach(() => {
    // localStorage reset lives in the global tests/setup.ts
    dataStore.resetToDefault();
    rankStorage.clear();
    window.scrollTo = vi.fn();
  });

  it('renders full App UI with ActionToolbar, JumpBar, and ColumnGrid', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('Mail');
    expect(container.textContent).toContain('YouTube');
    expect(container.textContent).toContain('All');
  });

  it('exposes a skip link to the main landmark plus a visually hidden h1', () => {
    const { container } = render(<App />);

    const skipLink = container.querySelector('a.skipLink[href="#main-grid"]');
    expect(skipLink).not.toBeNull();
    expect(skipLink!.textContent).toContain('Skip to content');

    expect(container.querySelector('main#main-grid')).not.toBeNull();
    expect(container.querySelector('h1.sr-only')!.textContent).toContain('Startpage');
  });

  it('filters columns when clicking category tab in JumpBar', () => {
    const { container, getAllByText } = render(<App />);
    const socialTab = getAllByText('Social')[0]!;
    fireEvent.click(socialTab);

    expect(container.textContent).toContain('Mail');
  });

  it('opens search overlay when clicking search button in header', () => {
    const { getAllByRole, getByRole } = render(<App />);
    // Header ActionToolbar is the first of the two toolbar instances;
    // selection is by accessible name (aria-label), not by title copy.
    const searchBtn = getAllByRole('button', { name: 'Fuzzy Search (Press any key)' })[0]!;
    fireEvent.click(searchBtn);

    const input = getByRole('combobox', { name: 'Search links, aliases, or commands' });
    expect(input).not.toBeNull();
  });

  it('opens keyboard cheatsheet modal when clicking help button', () => {
    const { baseElement, getAllByRole } = render(<App />);
    const helpBtn = getAllByRole('button', { name: 'Shortcuts Cheatsheet (? or F1)' })[0]!;
    fireEvent.click(helpBtn);

    // Modals portal to document.body (baseElement)
    expect(baseElement.textContent).toContain('Keyboard Shortcuts Cheatsheet');
  });

  it('opens visual edit modal and adds a new link successfully', () => {
    const { baseElement, getAllByRole, getByLabelText, getByText } = render(<App />);
    const editBtn = getAllByRole('button', { name: 'Add or Edit Links (Shift+N)' })[0]!;
    fireEvent.click(editBtn);

    expect(baseElement.textContent).toContain('Add New Link');

    // Fields expose real <label> elements: select by label, never by placeholder
    const titleInput = getByLabelText('Link Title');
    const urlInput = getByLabelText('Website URL');

    fireEvent.input(titleInput, { target: { value: 'My Test Link' } });
    fireEvent.input(urlInput, { target: { value: 'https://testlink.com' } });

    const submitBtn = getByText('Create Link');
    fireEvent.click(submitBtn);

    expect(dataStore.getLinks().some(l => l.title === 'My Test Link')).toBe(true);
  });
});
