import { useEffect, useState } from 'preact/hooks';
import {  keyboardManager  } from '../engine';

interface KeyboardHandlers {
  onOpenSearch?: (char?: string) => void;
  onCloseModals?: () => void;
  onOpenCheatsheet?: () => void;
  onOpenVisualEdit?: () => void;
  onOpenSettings?: () => void;
  onToggleShortcutsView?: () => void;
  onSelectCategoryIndex?: (index: number) => void;
}

export function useKeyboardShortcuts(handlers: KeyboardHandlers, dependencies: any[] = []) {
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  useEffect(() => {
    keyboardManager.setHandlers({
      ...handlers,
      onToggleShortcutsView: () => {
        setShowShortcuts((prev) => !prev);
        if (handlers.onToggleShortcutsView) {
          handlers.onToggleShortcutsView();
        }
      },
    });

    keyboardManager.attach();
    return () => keyboardManager.detach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { showShortcuts, setShowShortcuts };
}
