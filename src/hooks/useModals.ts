import { useState, useEffect } from 'preact/hooks';
import type { LinkItem } from '../types/startpage';

export function useModals() {
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [initialSearchChar, setInitialSearchChar] = useState<string>('');
  const [cheatsheetOpen, setCheatsheetOpen] = useState<boolean>(false);
  const [importExportOpen, setImportExportOpen] = useState<boolean>(false);
  const [visualEditOpen, setVisualEditOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [reorderOpen, setReorderOpen] = useState<boolean>(false);
  const [editTargetLink, setEditTargetLink] = useState<LinkItem | null>(null);

  const isAnyModalOpen =
    searchOpen ||
    cheatsheetOpen ||
    importExportOpen ||
    visualEditOpen ||
    settingsOpen ||
    reorderOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isAnyModalOpen]);

  const closeAllModals = () => {
    setSearchOpen(false);
    setCheatsheetOpen(false);
    setImportExportOpen(false);
    setVisualEditOpen(false);
    setSettingsOpen(false);
    setReorderOpen(false);
    setEditTargetLink(null);
  };

  return {
    searchOpen,
    setSearchOpen,
    initialSearchChar,
    setInitialSearchChar,
    cheatsheetOpen,
    setCheatsheetOpen,
    importExportOpen,
    setImportExportOpen,
    visualEditOpen,
    setVisualEditOpen,
    settingsOpen,
    setSettingsOpen,
    reorderOpen,
    setReorderOpen,
    editTargetLink,
    setEditTargetLink,
    isAnyModalOpen,
    closeAllModals,
  };
}
