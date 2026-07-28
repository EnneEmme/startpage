import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
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
    const { getByPlaceholderText, getByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = getByPlaceholderText(/Type link name/i);
    expect(input).not.toBeNull();
    expect(getByText('navigate')).not.toBeNull();
    expect(getByText('complete')).not.toBeNull();
  });

  it('filters results and triggers Tab completion', () => {
    const { getByPlaceholderText, getByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = getByPlaceholderText(/Type link name/i) as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'Git' } });

    expect(getByText('GitHub')).not.toBeNull();

    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input.value).toBe('GitHub');
  });

  it('triggers onClose when Escape is pressed', () => {
    const onClose = vi.fn();
    const { getByPlaceholderText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={onClose} />
    );

    const input = getByPlaceholderText(/Type link name/i);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows command palette badge for engine prefixes', () => {
    const { getByPlaceholderText, getAllByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = getByPlaceholderText(/Type link name/i);
    fireEvent.input(input, { target: { value: 'g test query' } });

    expect(getAllByText(/Google Search/i)[0]).not.toBeNull();
  });

  it('renders clear button when query is present and clears text on click', () => {
    const { getByPlaceholderText, getByTitle } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = getByPlaceholderText(/Type link name/i) as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'Test' } });

    const clearBtn = getByTitle('Clear search');
    expect(clearBtn).not.toBeNull();

    fireEvent.click(clearBtn);
    expect(input.value).toBe('');
  });

  it('switches to site search mode when Cmd+Enter is pressed on a result row', () => {
    const { getByPlaceholderText, getByText } = render(
      <SearchModal isOpen={true} links={mockLinks} onClose={vi.fn()} />
    );

    const input = getByPlaceholderText(/Type link name/i) as HTMLInputElement;
    fireEvent.input(input, { target: { value: 'YouTube' } });

    expect(getByText('YouTube')).not.toBeNull();

    fireEvent.keyDown(input, { key: 'Enter', metaKey: true });
    expect(input.value).toBe('yt ');
  });
});
