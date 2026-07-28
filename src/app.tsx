import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  HeaderClock,
  JumpBar,
  ColumnGrid,
  SearchModal,
  CheatsheetModal,
  ImportExportModal,
  VisualEditModal,
  SettingsModal,
  MobileBottomNav,
  ReorderModal,
  Toast,
  ConfirmDialog
} from './components';
import type { LinkItem } from './types/startpage';
import { scrollToCategory, scrollToTop } from './engine';
import { linksSignal, categoriesSignal } from './stores';

// Custom Hooks
import { useModals, useKeyboardShortcuts } from './hooks';

export const App = () => {
  // Single source of truth: signals synced with dataStore/themeEngine.
  // Mutations happen via appActions/settingsActions, never via engine calls.
  const links = linksSignal.value;
  const categories = categoriesSignal.value;
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);

  const {
    searchOpen, setSearchOpen,
    initialSearchChar, setInitialSearchChar,
    cheatsheetOpen, setCheatsheetOpen,
    importExportOpen, setImportExportOpen,
    visualEditOpen, setVisualEditOpen,
    settingsOpen, setSettingsOpen,
    reorderOpen, setReorderOpen,
    editTargetLink, setEditTargetLink,
    isAnyModalOpen,
    closeAllModals
  } = useModals();

  const handleSelectCategory = (catName: string | null) => {
    setActiveCategoryFilter(catName);
    if (catName) {
      setHighlightedCategory(catName);
      setTimeout(() => setHighlightedCategory(null), 1400);
      scrollToCategory(catName);
    } else {
      setHighlightedCategory(null);
      scrollToTop();
    }
  };

  const { showShortcuts } = useKeyboardShortcuts({
    onOpenSearch: (char?: string) => {
      if (!cheatsheetOpen && !importExportOpen && !visualEditOpen && !settingsOpen) {
        setInitialSearchChar(char || '');
        setSearchOpen(true);
      }
    },
    onCloseModals: closeAllModals,
    onOpenCheatsheet: () => {
      // Never stack a modal over another one: toggle only when nothing else is open
      if (searchOpen || importExportOpen || visualEditOpen || settingsOpen) return;
      setCheatsheetOpen((prev) => !prev);
    },
    onOpenVisualEdit: () => {
      if (searchOpen || cheatsheetOpen || importExportOpen || visualEditOpen || settingsOpen) return;
      setEditTargetLink(null);
      setVisualEditOpen(true);
    },
    onOpenSettings: () => {
      if (searchOpen || cheatsheetOpen || importExportOpen || visualEditOpen) return;
      setSettingsOpen((prev) => !prev);
    },
    onSelectCategoryIndex: (index: number) => {
      if (searchOpen || cheatsheetOpen || importExportOpen || visualEditOpen || settingsOpen) return;
      const currentCats = categoriesSignal.value;
      const target = currentCats[index];
      if (target) {
        handleSelectCategory(target.name);
      }
    }
  }, {
    modalActive: isAnyModalOpen
  }, [searchOpen, cheatsheetOpen, importExportOpen, visualEditOpen, settingsOpen]);

  const handleEditLinkFromContext = (link: LinkItem) => {
    setEditTargetLink(link);
    setVisualEditOpen(true);
  };

  const handleOpenAddLink = () => {
    setEditTargetLink(null);
    setVisualEditOpen(true);
  };

  const handleOpenSearch = () => {
    setInitialSearchChar('');
    setSearchOpen(true);
  };

  const categoryNames = categories.map(c => c.name);

  return (
    <>
      {/* Unified Header */}
      <header class="unifiedHeader">
        <JumpBar
          categories={categoryNames}
          activeCategory={activeCategoryFilter}
          showShortcuts={showShortcuts}
          onSelectCategory={handleSelectCategory}
        />

        <HeaderClock
          onOpenSearch={handleOpenSearch}
          onOpenCheatsheet={() => setCheatsheetOpen(true)}
          onOpenVisualEdit={handleOpenAddLink}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </header>

      <main style={{ width: '100%', pointerEvents: isAnyModalOpen ? 'none' : 'auto' }}>
        <ColumnGrid
          categories={categories}
          highlightedCategory={highlightedCategory}
          showShortcuts={showShortcuts}
          onEditLink={handleEditLinkFromContext}
          onOpenReorder={() => setReorderOpen(true)}
        />
      </main>

      {/* Standalone Bottom Navigation Bar for Mobile & Tablet (< 1024px) */}
      <MobileBottomNav
        onOpenSearch={handleOpenSearch}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
        onOpenVisualEdit={handleOpenAddLink}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Modals */}
      <SearchModal
        isOpen={searchOpen}
        initialQuery={initialSearchChar}
        links={links}
        onClose={() => setSearchOpen(false)}
      />

      <CheatsheetModal
        isOpen={cheatsheetOpen}
        onClose={() => setCheatsheetOpen(false)}
      />

      <ImportExportModal
        isOpen={importExportOpen}
        onClose={() => setImportExportOpen(false)}
      />

      <VisualEditModal
        isOpen={visualEditOpen}
        initialEditLink={editTargetLink}
        onClose={() => {
          setVisualEditOpen(false);
          setEditTargetLink(null);
        }}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenImportExport={() => setImportExportOpen(true)}
      />

      <ReorderModal
        isOpen={reorderOpen}
        categories={categoryNames}
        onClose={() => setReorderOpen(false)}
      />

      {/* Global feedback overlays */}
      <Toast />
      <ConfirmDialog />
    </>
  );
};
