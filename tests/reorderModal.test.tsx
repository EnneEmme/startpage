import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { ReorderModal } from '../src/components/ReorderModal';
import { dataStore } from '../src/engine/dataStore';

describe('ReorderModal Component', () => {
  beforeEach(() => {
    dataStore.resetToDefault();
  });

  it('renders reorder modal with category names', () => {
    const categories = ['Social', 'School', 'Fun'];
    // Modal portals to document.body, so assert against baseElement
    const { baseElement } = render(
      <ReorderModal isOpen={true} categories={categories} onClose={() => {}} />,
    );

    expect(baseElement.textContent).toContain('Reorder Column Sections');
    expect(baseElement.textContent).toContain('Social');
    expect(baseElement.textContent).toContain('School');
    expect(baseElement.textContent).toContain('Fun');
  });

  it('reorders categories via the store action when moving a category up', () => {
    const categories = ['Social', 'School', 'Fun'];

    render(<ReorderModal isOpen={true} categories={categories} onClose={() => {}} />);

    // Click Move Up on 'School' (second item)
    const moveUpBtns = document.querySelectorAll('button[title="Move Up / Left"]');
    expect(moveUpBtns.length).toBeGreaterThan(1);
    fireEvent.click(moveUpBtns[1]!);
    expect(dataStore.getCategoryOrder()).toEqual(['School', 'Social', 'Fun']);
  });
});
