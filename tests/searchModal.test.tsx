import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/preact';
import { SearchModal } from '../src/components/SearchModal';
import type { LinkItem } from '../src/types/startpage';

const mockLinks: LinkItem[] = [
  {
    id: 'link-1',
    title: 'GitHub',
    url: 'https://github.com',
    aliases: ['gh', 'git'],
    category: 'Dev',
  },
  {
    id: 'link-2',
    title: 'YouTube',
    url: 'https://youtube.com',
    aliases: ['yt'],
    category: 'Media',
  },
];

describe('SearchModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <SearchModal isOpen={false} links={mockLinks} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders input, results, and footer hints when open', () => {
    const { getByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    // Combobox has a stable accessible name: never select by placeholder copy
    const input = screen.getByRole('combobox', { name: 'Search links, aliases, or commands' });
    expect(input).not.toBeNull();
    expect(getByText('navigate')).not.toBeNull();
    expect(getByText('complete')).not.toBeNull();
    // Cross-platform shortcut hint (jsdom reports a non-Mac platform)
    expect(getByText('Ctrl+↵')).not.toBeNull();
  });

  it('filters results and triggers Tab completion', () => {
    const { getByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'Git' } });

    expect(getByText('GitHub')).not.toBeNull();

    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input.value).toBe('GitHub');
  });

  it('focuses the search input on open (single autofocus strategy via Modal)', () => {
    render(<SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />);
    expect(document.activeElement).toBe(screen.getByRole('combobox'));
  });

  it('triggers onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    render(
      <SearchModal isOpen={true} links={mockLinks} onClose={onClose} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows command palette badge for engine prefixes', () => {
    const { getAllByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = screen.getByRole('combobox');
    fireEvent.input(input, { target: { value: 'g test query' } });

    expect(getAllByText(/Google Search/i)[0]).not.toBeNull();
  });

  it('renders clear button when query is present and clears text on click', () => {
    render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'Test' } });

    // Accessible name comes from aria-label, not the tooltip
    const clearBtn = screen.getByRole('button', { name: 'Clear search' });
    expect(clearBtn).not.toBeNull();

    fireEvent.click(clearBtn);
    expect(input.value).toBe('');
  });

  it('switches to site search mode when Cmd+Enter is pressed on a result row', () => {
    const { getByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = screen.getByRole('combobox') as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'YouTube' } });

    expect(getByText('YouTube')).not.toBeNull();

    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });
    expect(input.value).toBe('yt ');
  });

  describe('ARIA combobox pattern', () => {
    afterEach(() => {
      // jsdom does not implement scrollIntoView: drop any test-installed stub
      delete (Element.prototype as unknown as Record<string, unknown>).scrollIntoView;
    });

    it('exposes the input as a combobox wired to the results listbox', () => {
      render(<SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />);

      const combobox = screen.getByRole('combobox');
      expect(combobox.getAttribute('aria-autocomplete')).toBe('list');
      expect(combobox.getAttribute('aria-controls')).toBe('search-results-listbox');
      // No query typed yet: popup collapsed, no active descendant
      expect(combobox.getAttribute('aria-expanded')).toBe('false');
      expect(combobox.getAttribute('aria-activedescendant')).toBeNull();
      // Placeholder is not the only name source
      expect(combobox.getAttribute('aria-label')).toBeTruthy();
    });

    it('renders results as listbox options with stable ids and selection state', () => {
      render(<SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />);
      const input = screen.getByRole('combobox') as HTMLInputElement;

      fireEvent.input(input, { target: { value: 'Git' } });

      const listbox = screen.getByRole('listbox');
      expect(listbox.id).toBe('search-results-listbox');
      expect(input.getAttribute('aria-expanded')).toBe('true');

      const options = within(listbox).getAllByRole('option');
      expect(options.length).toBe(1);
      expect(options[0]!.id).toBe('search-opt-link-1');
      expect(options[0]!.getAttribute('aria-selected')).toBe('true');
      expect(input.getAttribute('aria-activedescendant')).toBe('search-opt-link-1');
    });

    it('moves aria-activedescendant with ArrowDown/ArrowUp navigation', () => {
      render(<SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />);
      const input = screen.getByRole('combobox') as HTMLInputElement;

      fireEvent.input(input, { target: { value: 'u' } }); // matches GitHub + YouTube
      const options = screen.getAllByRole('option');
      expect(options.length).toBeGreaterThan(1);

      const selectedIdOf = () =>
        options.find(o => o.getAttribute('aria-selected') === 'true')?.id;

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(input.getAttribute('aria-activedescendant')).toBe(selectedIdOf());
      expect(input.getAttribute('aria-activedescendant')).toBe(options[1]!.id);

      fireEvent.keyDown(input, { key: 'ArrowUp' });
      expect(input.getAttribute('aria-activedescendant')).toBe(options[0]!.id);
    });

    it('announces the result count through a polite live region', () => {
      render(<SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />);
      const input = screen.getByRole('combobox') as HTMLInputElement;

      const status = screen.getByRole('status');
      expect(status.getAttribute('aria-live')).toBe('polite');
      expect(status.textContent).toBe('');

      fireEvent.input(input, { target: { value: 'Git' } });
      expect(status.textContent).toBe('1 result available.');

      fireEvent.input(input, { target: { value: 'zzz-no-match' } });
      expect(status.textContent).toBe('No results found.');
    });

    it('lets Tab propagate when there is no completion to apply', () => {
      render(<SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />);
      const input = screen.getByRole('combobox') as HTMLInputElement;

      // Observe defaultPrevented as seen right after the input's own handlers
      // (the dialog bubbles before document, where Modal's focus trap lives —
      // that trap may cancel Tab in jsdom regardless, so we must sample here).
      const dialog = screen.getByRole('dialog');
      let preventedAtDialog: boolean | null = null;
      dialog.addEventListener('keydown', e => { preventedAtDialog = e.defaultPrevented; });

      // No results: Tab must not be trapped (clear button stays reachable)
      fireEvent.input(input, { target: { value: 'zzz-no-match' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(preventedAtDialog).toBe(false);

      // Completion available: Tab applies it and is trapped
      fireEvent.input(input, { target: { value: 'Git' } });
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(preventedAtDialog).toBe(true);
      expect(input.value).toBe('GitHub');

      // Completion already applied (query === selected title): Tab propagates
      fireEvent.keyDown(input, { key: 'Tab' });
      expect(preventedAtDialog).toBe(false);
    });

    it('scrolls the active option into view on selection change (feature-detected)', () => {
      const scrollSpy = vi.fn();
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        value: scrollSpy,
        configurable: true,
        writable: true
      });

      render(<SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />);
      const input = screen.getByRole('combobox') as HTMLInputElement;

      fireEvent.input(input, { target: { value: 'u' } });
      scrollSpy.mockClear();

      fireEvent.keyDown(input, { key: 'ArrowDown' });
      expect(scrollSpy).toHaveBeenCalledWith({ block: 'nearest' });
    });

    it('pointer hover does not steal the keyboard selection; click opens the hovered row', () => {
      const onClose = vi.fn();
      render(<SearchModal isOpen={true} links={mockLinks} onClose={onClose} />);
      const input = screen.getByRole('combobox') as HTMLInputElement;

      fireEvent.input(input, { target: { value: 'u' } }); // GitHub + YouTube
      const options = screen.getAllByRole('option');
      expect(options[0]!.getAttribute('aria-selected')).toBe('true');

      // A static cursor resting over the list must not capture the selection
      fireEvent.mouseEnter(options[1]!);
      expect(options[0]!.getAttribute('aria-selected')).toBe('true');
      expect(options[1]!.getAttribute('aria-selected')).toBe('false');
      expect(input.getAttribute('aria-activedescendant')).toBe('search-opt-link-1');

      // Click still activates the row under the mouse
      fireEvent.click(options[1]!);
      expect(onClose).toHaveBeenCalled();
    });
  });
});
