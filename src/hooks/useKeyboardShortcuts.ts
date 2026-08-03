import { useEffect, useRef, useState } from 'preact/hooks';
import { keyboardManager } from '../engine';

interface KeyboardHandlers {
  onOpenSearch?: (char?: string) => void;
  onOpenCheatsheet?: () => void;
  onOpenVisualEdit?: () => void;
  onOpenSettings?: () => void;
  onToggleShortcutsView?: () => void;
  onSelectCategoryIndex?: (index: number) => void;
}

interface KeyboardFlags {
  modalActive?: boolean;
}

/**
 * Attaches the global keyboardManager exactly once. Handlers flow through a
 * ref synced on every render: no detach/attach churn on modal toggles, no
 * stale closures and no manual dependency array to forget.
 */
export function useKeyboardShortcuts(handlers: KeyboardHandlers, flags: KeyboardFlags = {}) {
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  const handlersRef = useRef<KeyboardHandlers>(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    keyboardManager.setHandlers({
      onOpenSearch: char => handlersRef.current.onOpenSearch?.(char),
      onOpenCheatsheet: () => handlersRef.current.onOpenCheatsheet?.(),
      onOpenVisualEdit: () => handlersRef.current.onOpenVisualEdit?.(),
      onOpenSettings: () => handlersRef.current.onOpenSettings?.(),
      onSelectCategoryIndex: index => handlersRef.current.onSelectCategoryIndex?.(index),
      onToggleShortcutsView: () => {
        setShowShortcuts(prev => !prev);
        handlersRef.current.onToggleShortcutsView?.();
      },
    });

    keyboardManager.attach();
    return () => keyboardManager.detach();
  }, []);

  // Keep engine modal gate in sync so page shortcuts pause behind overlays
  useEffect(() => {
    keyboardManager.setModalActive(flags.modalActive ?? false);
  }, [flags.modalActive]);

  return { showShortcuts, setShowShortcuts };
}
