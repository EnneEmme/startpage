/**
 * Global Keyboard Manager & Shortcuts Engine
 * Handles keystroke listeners, input field filtering, shortcuts cheatsheet triggers,
 * search auto-activation on typing, shortcut view toggle mode, link creation shortcut (Shift+N),
 * and numerical category selection (Shift+1..9).
 */

export interface KeyboardActionHandlers {
  onOpenSearch?: (initialChar?: string) => void;
  onCloseModals?: () => void;
  onOpenCheatsheet?: () => void;
  onOpenVisualEdit?: () => void;
  onOpenSettings?: () => void;
  onSelectQuickResult?: (index: number) => void;
  onNavigateSearch?: (direction: 'up' | 'down' | 'enter') => void;
  onToggleShortcutsView?: () => void;
  onSelectCategoryIndex?: (index: number) => void;
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

    // Toggle Shortcuts View mode: 'Alt' key tap, or 'Shift+Space'
    // (checked before the modifier guard since the Alt keydown itself may carry altKey)
    if (!isInput && (e.key === 'Alt' || (e.shiftKey && e.key === ' '))) {
      e.preventDefault();
      this.handlers.onToggleShortcutsView?.();
      return;
    }

    // Explicit modifier combo kept: Cmd+/ / Ctrl+/ opens cheatsheet
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      this.handlers.onOpenCheatsheet?.();
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

    // From here on: bare keys only. Any Ctrl/Meta/Alt combination belongs to
    // the browser (Ctrl+1-9 tab switch, Ctrl+L, Ctrl+C, ...) and is never intercepted.
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // Interactive Cheatsheet trigger: '?' (Shift+/) or F1
    if (e.key === '?' || e.key === 'F1') {
      e.preventDefault();
      this.handlers.onOpenCheatsheet?.();
      return;
    }

    // Shortcut to open Settings Modal: ',' (comma) key
    if (e.key === ',') {
      e.preventDefault();
      this.handlers.onOpenSettings?.();
      return;
    }

    // Shortcut to Create New Link: Shift+N (plain 'n' must stay free for type-to-search)
    if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
      e.preventDefault();
      this.handlers.onOpenVisualEdit?.();
      return;
    }

    // Category Quick-Select Badges: Shift+digit (plain digits are now
    // type-to-search characters, so queries like "3d" must be possible).
    // e.code ('Digit1'..'Digit9') is layout-independent (Shift+2 is '"' on IT, '@' on US).
    if (e.shiftKey && /^Digit[1-9]$/.test(e.code)) {
      e.preventDefault();
      const idx = parseInt(e.code.slice(5), 10) - 1;
      this.handlers.onSelectCategoryIndex?.(idx);
      this.handlers.onSelectQuickResult?.(idx);
      return;
    }

    // Single printable character auto-opens search ('n', digits, '/' included).
    // preventDefault blocks Firefox quick-find on '/' and any other native
    // single-key browser behavior for intercepted characters.
    if (e.key.length === 1 && e.key !== ' ' && e.key !== ',') {
      e.preventDefault();
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
