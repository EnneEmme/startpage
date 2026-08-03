import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/preact';
import { dataStore } from '../src/engine/dataStore';
import {
  dragStore,
  draggedLinkIdSignal,
  draggedCategoryNameSignal,
  dragOverCategoryIdSignal,
  dragOverLinkIdSignal,
  dropPositionSignal,
  justDroppedLinkIdSignal
} from '../src/stores/dragStore';
import { useDragAndDrop, cancelDragAndDropTimers } from '../src/hooks/useDragAndDrop';

describe('Drag and Drop & Category Data Helpers', () => {
  beforeEach(() => {
    // localStorage is already reset by the global tests/setup.ts; here we only
    // reset the engine singleton state.
    dataStore.resetToDefault();
  });

  it('moves a link to a different category', () => {
    const initialLinks = dataStore.getLinks();
    const mailLink = initialLinks.find(l => l.id === 'mail');
    expect(mailLink?.category).toBe('Social');

    dataStore.moveLink('mail', 'Fun', 0);

    const updatedLinks = dataStore.getLinks();
    const updatedMail = updatedLinks.find(l => l.id === 'mail');
    expect(updatedMail?.category).toBe('Fun');
  });

  it('reorders columns via setCategoryOrder', () => {
    const initialCategories = dataStore.getCategories().map(c => c.name);
    const newOrder = [...initialCategories].reverse();

    dataStore.setCategoryOrder(newOrder);

    const sortedCategories = dataStore.getCategories().map(c => c.name);
    expect(sortedCategories).toEqual(newOrder);
  });

  it('registers new categories via addCategory (trim + idempotent)', () => {
    dataStore.addCategory('  NewCat  ');
    expect(dataStore.getCategoryOrder()).toContain('NewCat');

    const orderAfter = dataStore.getCategoryOrder();
    dataStore.addCategory('NewCat'); // duplicate: no-op
    dataStore.addCategory('   ');    // blank: no-op
    expect(dataStore.getCategoryOrder()).toEqual(orderAfter);
  });

  it('places links of a registered new category in categoryOrder position', () => {
    dataStore.addCategory('NewCat');
    dataStore.addLink({
      id: 'tmp-new-cat-link',
      title: 'Tmp',
      url: 'https://example.com',
      aliases: [],
      category: 'NewCat'
    });

    const catNames = dataStore.getCategories().map(c => c.name);
    expect(catNames[catNames.length - 1]).toBe('NewCat');

    dataStore.removeLink('tmp-new-cat-link');
  });
});

describe('dragStore signals (hover state outside component state)', () => {
  beforeEach(() => {
    dragStore.resetDragState();
    dragStore.setDragOverLink(null, 'below');
    dragStore.setJustDroppedLinkId(null);
    cancelDragAndDropTimers();
  });

  afterEach(() => {
    cancelDragAndDropTimers();
    vi.useRealTimers();
  });

  it('starts with neutral defaults', () => {
    expect(draggedLinkIdSignal.value).toBe(null);
    expect(draggedCategoryNameSignal.value).toBe(null);
    expect(dragOverCategoryIdSignal.value).toBe(null);
    expect(dragOverLinkIdSignal.value).toBe(null);
    expect(dropPositionSignal.value).toBe('below');
    expect(justDroppedLinkIdSignal.value).toBe(null);
  });

  it('guards writes: assigning an identical value does not notify subscribers', () => {
    let calls = 0;
    const unsubscribe = dragOverLinkIdSignal.subscribe(() => { calls++; });
    const afterSubscribe = calls; // subscribe() fires once immediately

    dragStore.setDragOverLink('youtube', 'below');
    expect(calls).toBe(afterSubscribe + 1);

    dragStore.setDragOverLink('youtube', 'below'); // identical: no-op
    expect(calls).toBe(afterSubscribe + 1);

    unsubscribe();
  });

  it('setDragOverLink updates target and position together', () => {
    dragStore.setDragOverLink('github', 'above');
    expect(dragOverLinkIdSignal.value).toBe('github');
    expect(dropPositionSignal.value).toBe('above');

    // Same target, other side: only the position changes
    let calls = 0;
    const unsubscribe = dragOverLinkIdSignal.subscribe(() => { calls++; });
    dragStore.setDragOverLink('github', 'below');
    expect(dropPositionSignal.value).toBe('below');
    expect(calls).toBe(1); // only the immediate subscribe() notification
    unsubscribe();
  });

  it('resetDragState clears every transient signal', () => {
    dragStore.setDraggedLinkId('mail');
    dragStore.setDraggedCategoryName('Social');
    dragStore.setDragOverCategory('Fun');
    dragStore.setDragOverLink('youtube', 'above');

    dragStore.resetDragState();

    expect(draggedLinkIdSignal.value).toBe(null);
    expect(draggedCategoryNameSignal.value).toBe(null);
    expect(dragOverCategoryIdSignal.value).toBe(null);
    expect(dragOverLinkIdSignal.value).toBe(null);
  });

  it('hook drop flow: moves the link, clears hover, auto-clears justDropped after 350ms', () => {
    vi.useFakeTimers();
    // localStorage is already reset by the global tests/setup.ts; here we only
    // reset the engine singleton state.
    dataStore.resetToDefault();

    let result: ReturnType<typeof useDragAndDrop> | undefined;
    const TestComponent = () => {
      result = useDragAndDrop(dataStore.getCategories(), '.linksList');
      return null;
    };
    render(<TestComponent />);
    if (!result) throw new Error('hook did not run');

    act(() => {
      dragStore.setDraggedLinkId('mail');
      dragStore.setDragOverCategory('Fun');
      dragStore.setDragOverLink('youtube', 'above');
    });

    const fakeEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as DragEvent;
    act(() => result!.handleDrop(fakeEvent, 'Fun', 0));

    expect(dataStore.getLinks().find(l => l.id === 'mail')?.category).toBe('Fun');
    expect(dragOverLinkIdSignal.value).toBe(null);
    expect(dragOverCategoryIdSignal.value).toBe(null);
    expect(draggedLinkIdSignal.value).toBe(null);
    expect(justDroppedLinkIdSignal.value).toBe('mail');

    act(() => { vi.advanceTimersByTime(400); });
    expect(justDroppedLinkIdSignal.value).toBe(null);
  });

  it('hook drop flow: a second drop resets the pending justDropped timer (no early clear)', () => {
    vi.useFakeTimers();
    // localStorage is already reset by the global tests/setup.ts; here we only
    // reset the engine singleton state.
    dataStore.resetToDefault();

    let result: ReturnType<typeof useDragAndDrop> | undefined;
    const TestComponent = () => {
      result = useDragAndDrop(dataStore.getCategories(), '.linksList');
      return null;
    };
    render(<TestComponent />);
    if (!result) throw new Error('hook did not run');

    const fakeEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as DragEvent;

    act(() => {
      dragStore.setDraggedLinkId('mail');
      result!.handleDrop(fakeEvent, 'Fun', 0);
    });
    act(() => { vi.advanceTimersByTime(200); }); // still within first 350ms window

    act(() => {
      dragStore.setDraggedLinkId('github');
      result!.handleDrop(fakeEvent, 'Fun', 0);
    });
    act(() => { vi.advanceTimersByTime(200); }); // 400ms after first drop, 200ms after second

    // First timer must have been replaced: the second drop is still highlighted
    expect(justDroppedLinkIdSignal.value).toBe('github');

    act(() => { vi.advanceTimersByTime(200); });
    expect(justDroppedLinkIdSignal.value).toBe(null);
  });

  it('cancelDragAndDropTimers prevents late justDropped reset after teardown', () => {
    vi.useFakeTimers();
    // localStorage is already reset by the global tests/setup.ts; here we only
    // reset the engine singleton state.
    dataStore.resetToDefault();

    let result: ReturnType<typeof useDragAndDrop> | undefined;
    const TestComponent = () => {
      result = useDragAndDrop(dataStore.getCategories(), '.linksList');
      return null;
    };
    const { unmount } = render(<TestComponent />);
    if (!result) throw new Error('hook did not run');

    const fakeEvent = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as DragEvent;
    act(() => {
      dragStore.setDraggedLinkId('mail');
      result!.handleDrop(fakeEvent, 'Fun', 0);
    });
    expect(justDroppedLinkIdSignal.value).toBe('mail');

    unmount();
    cancelDragAndDropTimers();

    // Without a cleanup the stale timer would wipe the animation state late;
    // here it must stay untouched by timer callbacks.
    act(() => { vi.advanceTimersByTime(1000); });
    expect(justDroppedLinkIdSignal.value).toBe('mail');
  });
});
