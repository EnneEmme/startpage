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
    // localStorage reset lives in the global tests/setup.ts
    dataStore.resetToDefault();
    rankStorage.clear();
    silenceNavigation();
  });

  it('renders a card per link with its title and href', () => {
    const { getAllByText } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
    );

    // Default config contains two links titled 'Mail'; the Social one is first
    const anchor = getAllByText('Mail')[0]!.closest('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toContain('mail.google.com');
  });

  it('click: records usage rank and prevents native navigation', () => {
    const { getAllByText } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
    );

    const anchor = getAllByText('Mail')[0]!.closest('a') as HTMLAnchorElement;
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(rankStorage.getRankData()['mail']).toBeDefined();
  });

  it('cmd/ctrl+click opens in a new tab instead of navigating current page', () => {
    const { getAllByText } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
    );
    const anchor = getAllByText('Mail')[0]!.closest('a') as HTMLAnchorElement;

    fireEvent.click(anchor, { metaKey: true });
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('mail.google.com'),
      '_blank',
      'noopener,noreferrer',
    );
  });

  it('double-click on a column header shows the inline rename input', () => {
    const { getByText, getByDisplayValue, queryByDisplayValue } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
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

  it('double-click rename: Escape cancels without touching the dataStore', () => {
    const { getByText, getByDisplayValue, queryByDisplayValue } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
    );

    const header = getByText('Social').closest('div') as HTMLElement;
    fireEvent(header, createEvent.dblClick(header));

    const input = getByDisplayValue('Social');
    fireEvent.input(input, { target: { value: 'Discarded Name' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    // input unmounted, store unchanged
    expect(queryByDisplayValue('Discarded Name')).toBeNull();
    expect(dataStore.getCategories().some(c => c.name === 'Social')).toBe(true);
    expect(dataStore.getCategories().some(c => c.name === 'Discarded Name')).toBe(false);
  });

  it('right-click on a card opens the context menu for that link', () => {
    const { getAllByText, baseElement } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
    );

    const anchor = getAllByText('Mail')[0]!.closest('a') as HTMLAnchorElement;
    fireEvent.contextMenu(anchor);

    expect(baseElement.textContent).toContain('Edit Link');
    expect(baseElement.textContent).toContain('Remove Link');
  });

  it('empty column: renders "No links yet" and no CTA without onAddLink', () => {
    const { getByText, queryByRole } = render(
      <ColumnGrid categories={[{ name: 'EmptyCat', links: [] }]} showShortcuts={false} />,
    );

    expect(getByText('No links yet')).not.toBeNull();
    // Degrades gracefully: no add-link CTA unless the parent wires onAddLink
    expect(queryByRole('button', { name: 'Add the first link' })).toBeNull();
  });

  it('empty column: CTA calls onAddLink with the column category', () => {
    const onAddLink = vi.fn();
    const { getByRole } = render(
      <ColumnGrid
        categories={[{ name: 'EmptyCat', links: [] }]}
        showShortcuts={false}
        onAddLink={onAddLink}
      />,
    );

    fireEvent.click(getByRole('button', { name: 'Add the first link' }));
    expect(onAddLink).toHaveBeenCalledTimes(1);
    expect(onAddLink).toHaveBeenCalledWith('EmptyCat');
  });

  it('empty grid: renders page-level empty state and CTA calls onAddLink without a category', () => {
    const onAddLink = vi.fn();
    const { getByText, getByRole } = render(
      <ColumnGrid categories={[]} showShortcuts={false} onAddLink={onAddLink} />,
    );

    expect(getByText('No links yet')).not.toBeNull();
    fireEvent.click(getByRole('button', { name: 'Add the first link' }));
    expect(onAddLink).toHaveBeenCalledTimes(1);
    expect(onAddLink).toHaveBeenCalledWith();
  });

  it('empty grid without onAddLink renders no CTA', () => {
    const { getByText, queryByRole } = render(<ColumnGrid categories={[]} showShortcuts={false} />);

    expect(getByText('No links yet')).not.toBeNull();
    expect(queryByRole('button', { name: 'Add the first link' })).toBeNull();
  });

  it('Shift+F10 on a card dispatches the startpage:open-context-menu CustomEvent', () => {
    const { getAllByText } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
    );

    const received: CustomEvent[] = [];
    const listener = (e: Event) => received.push(e as CustomEvent);
    window.addEventListener('startpage:open-context-menu', listener);

    const anchor = getAllByText('Mail')[0]!.closest('a') as HTMLAnchorElement;
    fireEvent.keyDown(anchor, { key: 'F10', shiftKey: true });

    window.removeEventListener('startpage:open-context-menu', listener);

    expect(received).toHaveLength(1);
    expect(received[0]!.detail.linkId).toBe('mail');
    expect(typeof received[0]!.detail.clientX).toBe('number');
    expect(typeof received[0]!.detail.clientY).toBe('number');
  });

  it('ContextMenu key on a card dispatches the same CustomEvent, F10 without shift does not', () => {
    const { getAllByText } = render(
      <ColumnGrid categories={dataStore.getCategories()} showShortcuts={false} />,
    );

    const received: CustomEvent[] = [];
    const listener = (e: Event) => received.push(e as CustomEvent);
    window.addEventListener('startpage:open-context-menu', listener);

    const anchor = getAllByText('Mail')[0]!.closest('a') as HTMLAnchorElement;
    fireEvent.keyDown(anchor, { key: 'F10', shiftKey: false });
    expect(received).toHaveLength(0);

    fireEvent.keyDown(anchor, { key: 'ContextMenu' });
    expect(received).toHaveLength(1);
    expect(received[0]!.detail.linkId).toBe('mail');

    window.removeEventListener('startpage:open-context-menu', listener);
  });
});
