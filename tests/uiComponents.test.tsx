import { describe, it, expect, vi } from 'vitest';
import { h } from 'preact';
import { render } from '@testing-library/preact';
import { HeaderClock } from '../src/components/HeaderClock';
import { JumpBar } from '../src/components/JumpBar';

describe('UI Components Unit Tests', () => {
  it('renders HeaderClock tool buttons', () => {
    const { getAllByTitle } = render(
      <HeaderClock
        onOpenSearch={vi.fn()}
        onOpenCheatsheet={vi.fn()}
        onOpenVisualEdit={vi.fn()}
        onOpenSettings={vi.fn()}
      />
    );
    expect(getAllByTitle('Fuzzy Search (Press any key)')[0]).not.toBeNull();
    expect(getAllByTitle('Shortcuts Cheatsheet (? or F1)')[0]).not.toBeNull();
  });

  it('renders JumpBar categories and triggers click handler', () => {
    const onSelect = vi.fn();
    const categories = ['Social', 'Dev', 'AI'];
    const { getByText } = render(
      <JumpBar categories={categories} activeCategory="Social" onSelectCategory={onSelect} />
    );

    expect(getByText('All')).not.toBeNull();
    expect(getByText('Social')).not.toBeNull();
  });
});
