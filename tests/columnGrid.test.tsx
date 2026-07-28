import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { createEvent } from '@testing-library/dom';
import { ColumnGrid } from '../src/components/ColumnGrid';
import { dataStore } from '../src/engine/dataStore';
import { rankStorage } from '../src/engine/rankStorage';

// executeLink navigates via window.location.href / window.open — silence jsdom
const silenceNavigation = () => {
  vi.spyOn(window, 'open').mockImplementation(() => null);
};

describe('ColumnGrid Component', () => {
  beforeEach(() => {
    localStorage.clear();
    dataStore.resetToDefault();
    rankStorage.clear();
    silenceNavigation();
  });

  it('renders a card per link with its title and href', () => {
    const { getAllByText } = render(<ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />);

    // Default config contains two links titled 'Mail'; the Social one is first
    const anchor = getAllByText('Mail')[0].closest('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toContain('mail.google.com');
  });

  it('click: records usage rank and prevents native navigation', () => {
    const { getAllByText } = render(<ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />);

    const anchor = getAllByText('Mail')[0].closest('a') as HTMLAnchorElement;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(rankStorage.getRankData()['mail']).toBeDefined();
  });

  it('cmd/ctrl+click opens in a new tab instead of navigating current page', () => {
    const { getAllByText } = render(<ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />);
    const anchor = getAllByText('Mail')[0].closest('a') as HTMLAnchorElement;

    fireEvent.click(anchor, { metaKey: true });
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('mail.google.com'), '_blank', 'noopener,noreferrer');
  });

  it('double-click on a column header shows the inline rename input', () => {
    const { getByText, getByDisplayValue, queryByDisplayValue } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />
    );

    const header = getByText('Social').closest('div') as HTMLElement;
    fireEvent(header, createEvent.dblClick(header));

    const input = getByDisplayValue('Social');
    expect(input).not.toBeNull();

    fireEvent.input(input, { target: { value: 'Social Networks' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(dataStore.getCategories().some(c => c.name === 'Social Networks')).toBe(true);
    expect(queryByDisplayValue('Social Networks')).toBeNull();
  });

  it('right-click on a card opens the context menu for that link', () => {
    const { getAllByText, baseElement } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />
    );

    const anchor = getAllByText('Mail')[0].closest('a') as HTMLAnchorElement;
    fireEvent.contextMenu(anchor);

    expect(baseElement.textContent).toContain('Edit Link');
    expect(baseElement.textContent).toContain('Remove Link');
  });
});
