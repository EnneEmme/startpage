/**
 * Global Keyboard Manager & Shortcuts Engine
 * Handles keystroke listeners, input field filtering, shortcuts cheatsheet triggers,
 * search auto-activation on typing, and Ctrl+1..9 selection.
 */

export interface KeyboardActionHandlers {
  onOpenSearch?: (initialChar?: string) => void;
  onCloseModals?: () => void;
  onOpenCheatsheet?: () => void;
  onSelectQuickResult?: (index: number) => void;
  onNavigateSearch?: (direction: 'up' | 'down' | 'enter') => void;
}

export class KeyboardManager {
  private handlers: KeyboardActionHandlers = {};
  private active: boolean = false;
  private searchActive: boolean = false;
  private modalActive: boolean = false;

  constructor(handlers?: KeyboardActionHandlers) {
    if (handlers) {
      this.handlers = handlers;
    }
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  public setHandlers(handlers: KeyboardActionHandlers): void {
    this.handlers = { ...this.handlers, ...handlers };
  }

  public setSearchActive(active: boolean): void {
    this.searchActive = active;
  }

  public setModalActive(active: boolean): void {
    this.modalActive = active;
  }

  public isTypingInInput(target: EventTarget | null): boolean {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tagName = target.tagName.toUpperCase();
    return (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      Boolean(target.isContentEditable)
    );
  }

  public handleKeyDown(e: KeyboardEvent): void {
    const isInput = this.isTypingInInput(e.target);

    // Escape always closes search & modals
    if (e.key === 'Escape') {
      e.preventDefault();
      this.handlers.onCloseModals?.();
      return;
    }

    // Interactive Cheatsheet trigger: '?' (Shift+/), F1, or Cmd+/ / Ctrl+/
    if (
      (!isInput && e.key === '?') ||
      e.key === 'F1' ||
      ((e.metaKey || e.ctrlKey) && e.key === '/')
    ) {
      e.preventDefault();
      this.handlers.onOpenCheatsheet?.();
      return;
    }

    // Ctrl+1 through Ctrl+9 or Alt+1 through Alt+9 quick selection
    if ((e.ctrlKey || e.altKey) && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const index = parseInt(e.key, 10) - 1;
      this.handlers.onSelectQuickResult?.(index);
      return;
    }

    // If typing inside an input field (e.g. search input)
    if (isInput) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.handlers.onNavigateSearch?.('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.handlers.onNavigateSearch?.('up');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.handlers.onNavigateSearch?.('enter');
      }
      return;
    }

    // Single key press outside input fields
    // Ignore modifier combinations (Ctrl, Alt, Meta)
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    // Single printable character (length == 1) auto-opens search
    if (e.key.length === 1 && e.key !== ' ') {
      this.handlers.onOpenSearch?.(e.key);
    }
  }

  public attach(): void {
    if (this.active) return;
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown);
      this.active = true;
    }
  }

  public detach(): void {
    if (!this.active) return;
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.active = false;
    }
  }
}

export const keyboardManager = new KeyboardManager();
