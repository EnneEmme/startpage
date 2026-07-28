import { useEffect, useState } from 'preact/hooks';
import { keyboardManager } from '../engine';

interface KeyboardHandlers {
  onOpenSearch?: (char?: string) => void;
  onCloseModals?: () => void;
  onOpenCheatsheet?: () => void;
  onOpenVisualEdit?: () => void;
  onOpenSettings?: () => void;
  onToggleShortcutsView?: () => void;
  onSelectCategoryIndex?: (index: number) => void;
}

interface KeyboardFlags {
  modalActive?: boolean;
}

export function useKeyboardShortcuts(
  handlers: KeyboardHandlers,
  flags: KeyboardFlags = {},
  dependencies: any[] = []
) {
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const { modalActive = false } = flags;

  // Keep engine state flags in sync so it can gate shortcuts correctly
  useEffect(() => {
    keyboardManager.setModalActive(modalActive);
  }, [modalActive]);

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
