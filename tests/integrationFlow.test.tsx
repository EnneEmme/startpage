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

  it('renders full App UI with ActionToolbar, JumpBar, and ColumnGrid', () => {
    const { container } = render(<App />);
    expect(container.textContent).toContain('Mail');
    expect(container.textContent).toContain('YouTube');
    expect(container.textContent).toContain('All');
  });

  it('filters columns when clicking category tab in JumpBar', () => {
    const { container, getAllByText } = render(<App />);
    const socialTab = getAllByText('Social')[0];
    fireEvent.click(socialTab);

    expect(container.textContent).toContain('Mail');
  });

  it('opens search overlay when clicking search button in header', () => {
    const { getAllByTitle, getByPlaceholderText } = render(<App />);
    const searchBtn = getAllByTitle('Fuzzy Search (Press any key)')[0];
    fireEvent.click(searchBtn);

    const input = getByPlaceholderText('Type link name, alias, or command (e.g. g meteo)...');
    expect(input).not.toBeNull();
  });

  it('opens keyboard cheatsheet modal when clicking help button', () => {
    const { baseElement, getAllByTitle } = render(<App />);
    const helpBtn = getAllByTitle('Shortcuts Cheatsheet (? or F1)')[0];
    fireEvent.click(helpBtn);

    // Modals portal to document.body (baseElement)
    expect(baseElement.textContent).toContain('Keyboard Shortcuts Cheatsheet');
  });

  it('opens visual edit modal and adds a new link successfully', () => {
    const { baseElement, getAllByTitle, getByPlaceholderText, getByText } = render(<App />);
    const editBtn = getAllByTitle('Add or Edit Links (Shift+N)')[0];
    fireEvent.click(editBtn);

    expect(baseElement.textContent).toContain('Add New Link');

    const titleInput = getByPlaceholderText(/e.g. GitHub/i);
    const urlInput = getByPlaceholderText('e.g. https://www.youtube.com');

    fireEvent.input(titleInput, { target: { value: 'My Test Link' } });
    fireEvent.input(urlInput, { target: { value: 'https://testlink.com' } });

    const submitBtn = getByText('Create Link');
    fireEvent.click(submitBtn);

    expect(dataStore.getLinks().some(l => l.title === 'My Test Link')).toBe(true);
  });
});
