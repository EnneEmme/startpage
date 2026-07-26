import { describe, it, expect, beforeEach, vi } from 'vitest';
import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import { App } from '../src/app';
import { dataStore } from '../src/engine/dataStore';
import { rankStorage } from '../src/engine/rankStorage';

describe('App End-to-End Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    dataStore.resetToDefault();
    rankStorage.clear();
    window.scrollTo = vi.fn();
  });

  it('renders full App UI with HeaderClock, JumpBar, and ColumnGrid', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('Mail');
    expect(container.textContent).toContain('YouTube');
    expect(container.textContent).toContain('Top');
  });

  it('filters columns when clicking category tab in JumpBar', () => {
    const { container, getAllByText } = render(<App />);
    const socialTab = getAllByText('Social')[0];
    fireEvent.click(socialTab);

    expect(container.textContent).toContain('Mail');
  });

  it('opens search overlay when clicking search button in header', () => {
    const { getByTitle, getByPlaceholderText } = render(<App />);
    const searchBtn = getByTitle('Fuzzy Search (Press any key)');
    fireEvent.click(searchBtn);

    const input = getByPlaceholderText('Type link name, alias, or command (e.g. g meteo)...');
    expect(input).not.toBeNull();
  });

  it('opens keyboard cheatsheet modal when clicking help button', () => {
    const { container, getByTitle } = render(<App />);
    const helpBtn = getByTitle('Shortcuts Cheatsheet (? or F1)');
    fireEvent.click(helpBtn);

    expect(container.textContent).toContain('Keyboard Shortcuts Cheatsheet');
  });

  it('opens visual edit modal and adds a new link successfully', () => {
    const { container, getByTitle, getByPlaceholderText, getByText } = render(<App />);
    const editBtn = getByTitle('Add or Edit Links');
    fireEvent.click(editBtn);

    expect(container.textContent).toContain('Add New Link');

    const titleInput = getByPlaceholderText('e.g. GitHub, ChatGPT, Mail...');
    const urlInput = getByPlaceholderText('https://example.com');

    fireEvent.input(titleInput, { target: { value: 'My Test Link' } });
    fireEvent.input(urlInput, { target: { value: 'https://testlink.com' } });

    const submitBtn = getByText('Create Link');
    fireEvent.click(submitBtn);

    expect(dataStore.getLinks().some(l => l.title === 'My Test Link')).toBe(true);
  });
});
