import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/preact';
import { useModals } from '../src/hooks/useModals';
import { useContextMenu } from '../src/hooks/useContextMenu';
import { useDragAndDrop } from '../src/hooks/useDragAndDrop';
import { useKeyboardShortcuts } from '../src/hooks/useKeyboardShortcuts';
import { useColumnScrollMasks } from '../src/hooks/useColumnScrollMasks';
import type { LinkItem } from '../src/types/startpage';

const sampleLink: LinkItem = {
  id: 'lnk',
  title: 'Sample',
  url: 'https://example.com',
  aliases: [],
  category: 'Dev'
};

describe('Custom Hooks', () => {
  it('useModals works', () => {
    let result: any;
    const TestComponent = () => {
      result = useModals();
      return null;
    };
    render(<TestComponent />);
    expect(result.activeModal).toBe(null);
    expect(result.isAnyModalOpen).toBe(false);
  });

  it('useContextMenu opens/closes with x/y/link payload', () => {
    let result: any;
    const TestComponent = () => {
      result = useContextMenu();
      return null;
    };
    render(<TestComponent />);
    expect(result.menu).toBe(null);

    act(() => result.openMenu(10, 20, sampleLink));
    expect(result.menu).toEqual({ x: 10, y: 20, link: sampleLink });

    act(() => result.closeMenu());
    expect(result.menu).toBe(null);
  });

  it('useDragAndDrop tracks dragged link state', () => {
    let result: any;
    const TestComponent = () => {
      result = useDragAndDrop([], '.linksList');
      return null;
    };
    render(<TestComponent />);
    expect(result.draggedLinkId).toBe(null);
    expect(result.draggedCategoryName).toBe(null);
    expect(result.dropPosition).toBe('below');
  });

  it('useColumnScrollMasks starts with empty masks', () => {
    let result: any;
    const TestComponent = () => {
      result = useColumnScrollMasks(0);
      return null;
    };
    render(<TestComponent />);
    expect(result.masks).toEqual({});
  });

  it('useColumnScrollMasks registerList is idempotent (no infinite re-render loop)', () => {
    let result: any;
    const el = document.createElement('div');
    const TestComponent = () => {
      result = useColumnScrollMasks(1);
      return null;
    };
    render(<TestComponent />);

    act(() => result.registerList('A', el));
    act(() => result.registerList('A', el)); // same element again: must be a no-op
    const masksAfterRegister = result.masks;

    act(() => result.registerList('A', null));
    act(() => result.registerList('A', null)); // unregister again: must be a no-op
    expect(result.masks).toBe(masksAfterRegister);
  });

  it('useKeyboardShortcuts works', () => {
    let result: any;
    const handlers = { onOpenSearch: vi.fn() };
    const TestComponent = () => {
      result = useKeyboardShortcuts(handlers);
      return null;
    };
    render(<TestComponent />);
    expect(result.showShortcuts).toBe(false);
  });
});
