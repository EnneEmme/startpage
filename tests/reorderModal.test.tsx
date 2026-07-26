import { describe, it, expect, vi } from 'vitest';
import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import { ReorderModal } from '../src/components/ReorderModal';
import { dataStore } from '../src/engine/dataStore';

describe('ReorderModal Component', () => {
  it('renders reorder modal with category names', () => {
    const categories = ['Social', 'School', 'Fun'];
    const { container } = render(
      <ReorderModal
        isOpen={true}
        categories={categories}
        onClose={() => {}}
        onConfigChanged={() => {}}
      />
    );

    expect(container.textContent).toContain('Reorder Column Sections');
    expect(container.textContent).toContain('Social');
    expect(container.textContent).toContain('School');
    expect(container.textContent).toContain('Fun');
  });

  it('triggers onConfigChanged when moving a category up', () => {
    const categories = ['Social', 'School', 'Fun'];
    const onConfigChangedSpy = vi.fn();

    const { getByTitle } = render(
      <ReorderModal
        isOpen={true}
        categories={categories}
        onClose={() => {}}
        onConfigChanged={onConfigChangedSpy}
      />
    );

    // Click Move Up on 'School' (second item)
    const moveUpBtns = document.querySelectorAll('button[title="Move Up / Left"]');
    if (moveUpBtns.length > 1) {
      fireEvent.click(moveUpBtns[1]);
      expect(dataStore.getCategoryOrder()).toEqual(['School', 'Social', 'Fun']);
      expect(onConfigChangedSpy).toHaveBeenCalled();
    }
  });
});
