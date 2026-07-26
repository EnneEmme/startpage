import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardManager } from '../src/engine/keyboardManager';

describe('KeyboardManager Engine', () => {
  let keyboardManager: KeyboardManager;
  const mockHandlers = {
    onOpenSearch: vi.fn(),
    onCloseModals: vi.fn(),
    onOpenCheatsheet: vi.fn(),
    onSelectQuickResult: vi.fn(),
    onNavigateSearch: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    keyboardManager = new KeyboardManager(mockHandlers);
  });

  it('detects if event target is an input field', () => {
    const inputEl = document.createElement('input');
    const divEl = document.createElement('div');

    expect(keyboardManager.isTypingInInput(inputEl)).toBe(true);
    expect(keyboardManager.isTypingInInput(divEl)).toBe(false);
  });

  it('triggers onCloseModals when Escape key is pressed', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    keyboardManager.handleKeyDown(event);
    expect(mockHandlers.onCloseModals).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenCheatsheet when ?, F1, or Ctrl+/ is pressed', () => {
    const questionEvent = new KeyboardEvent('keydown', { key: '?' });
    keyboardManager.handleKeyDown(questionEvent);
    expect(mockHandlers.onOpenCheatsheet).toHaveBeenCalledTimes(1);

    const f1Event = new KeyboardEvent('keydown', { key: 'F1' });
    keyboardManager.handleKeyDown(f1Event);
    expect(mockHandlers.onOpenCheatsheet).toHaveBeenCalledTimes(2);

    const ctrlSlashEvent = new KeyboardEvent('keydown', { key: '/', ctrlKey: true });
    keyboardManager.handleKeyDown(ctrlSlashEvent);
    expect(mockHandlers.onOpenCheatsheet).toHaveBeenCalledTimes(3);
  });

  it('triggers onSelectQuickResult for Ctrl+1 through Ctrl+9', () => {
    const ctrl1Event = new KeyboardEvent('keydown', { key: '1', ctrlKey: true });
    keyboardManager.handleKeyDown(ctrl1Event);
    expect(mockHandlers.onSelectQuickResult).toHaveBeenCalledWith(0);

    const ctrl3Event = new KeyboardEvent('keydown', { key: '3', ctrlKey: true });
    keyboardManager.handleKeyDown(ctrl3Event);
    expect(mockHandlers.onSelectQuickResult).toHaveBeenCalledWith(2);
  });

  it('triggers onOpenSearch with typed character when outside input', () => {
    const charEvent = new KeyboardEvent('keydown', { key: 'g' });
    keyboardManager.handleKeyDown(charEvent);
    expect(mockHandlers.onOpenSearch).toHaveBeenCalledWith('g');
  });

  it('handles navigation keys (ArrowUp, ArrowDown, Enter) when inside input', () => {
    const inputEl = document.createElement('input');
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    Object.defineProperty(downEvent, 'target', { value: inputEl });

    keyboardManager.handleKeyDown(downEvent);
    expect(mockHandlers.onNavigateSearch).toHaveBeenCalledWith('down');
  });
});
