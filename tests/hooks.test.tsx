import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/preact';
import { useModals } from '../src/hooks/useModals';
import { useContextMenu } from '../src/hooks/useContextMenu';
import { useDragAndDrop } from '../src/hooks/useDragAndDrop';
import { useSettings } from '../src/hooks/useSettings';
import { useKeyboardShortcuts } from '../src/hooks/useKeyboardShortcuts';
import { h } from 'preact';
import { useEffect } from 'preact/hooks';

describe('Custom Hooks', () => {
  it('useModals works', () => {
    let result: any;
    const TestComponent = () => {
      result = useModals();
      return null;
    };
    render(<TestComponent />);
    expect(result.searchOpen).toBe(false);
    expect(result.isAnyModalOpen).toBe(false);
  });

  it('useContextMenu works', () => {
    let result: any;
    const TestComponent = () => {
      result = useContextMenu();
      return null;
    };
    render(<TestComponent />);
    expect(result.contextMenuVisible).toBe(false);
    expect(result.contextMenuPos.x).toBe(0);
  });

  it('useDragAndDrop works', () => {
    let result: any;
    const TestComponent = () => {
      result = useDragAndDrop();
      return null;
    };
    render(<TestComponent />);
    expect(result.draggingCategory).toBe(null);
    expect(result.draggingLink).toBe(null);
  });

  it('useSettings works', () => {
    let result: any;
    const TestComponent = () => {
      result = useSettings();
      return null;
    };
    render(<TestComponent />);
    expect(result.links).toEqual([]);
    expect(result.categories).toEqual([]);
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
