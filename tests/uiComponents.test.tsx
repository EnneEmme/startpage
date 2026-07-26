import { describe, it, expect } from 'vitest';
import { h } from 'preact';
import { render } from '@testing-library/preact';
import { HeaderClock } from '../src/components/HeaderClock';
import { JumpBar } from '../src/components/JumpBar';
import { ColumnGrid } from '../src/components/ColumnGrid';

describe('UI Components Rendering', () => {
  it('renders HeaderClock component with quick actions', () => {
    const { container } = render(
      <HeaderClock
        onOpenSearch={() => {}}
        onOpenCheatsheet={() => {}}
        onOpenVisualEdit={() => {}}
        onOpenImportExport={() => {}}
      />
    );
    expect(container.textContent).toContain('Search or type a shortcut');
  });

  it('renders JumpBar category tabs', () => {
    const categories = ['Social', 'Fun', 'LLMs'];
    const { container } = render(
      <JumpBar
        categories={categories}
        activeCategory={null}
        onSelectCategory={() => {}}
      />
    );
    expect(container.textContent).toContain('Top');
    expect(container.textContent).toContain('Social');
    expect(container.textContent).toContain('LLMs');
  });

  it('renders ColumnGrid with category links', () => {
    const sampleCategories = [
      {
        name: 'Dev',
        links: [
          { id: 'gh', title: 'GitHub', url: 'https://github.com', aliases: ['gh'], category: 'Dev' }
        ]
      }
    ];

    const { container } = render(
      <ColumnGrid
        categories={sampleCategories}
      />
    );
    expect(container.textContent).toContain('Dev');
    expect(container.textContent).toContain('GitHub');
  });
});
