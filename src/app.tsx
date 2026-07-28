import { useState } from 'preact/hooks';
import {
  ActionToolbar,
  JumpBar,
  ColumnGrid,
  SearchModal,
  CheatsheetModal,
  ImportExportModal,
  VisualEditModal,
  SettingsModal,
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
    isAnyModalOpen,
    isModalOpen,
    openModal,
    closeModal,
    openVisualEdit,
    toggleModalExclusive,
    initialSearchChar,
    setInitialSearchChar,
    editTargetLink
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

  const handleOpenSearch = (char: string = '') => {
    setInitialSearchChar(char);
    openModal('search');
  };

  const { showShortcuts } = useKeyboardShortcuts({
    onOpenSearch: (char?: string) => handleOpenSearch(char || ''),
    onOpenCheatsheet: () => toggleModalExclusive('cheatsheet'),
    onOpenVisualEdit: () => openVisualEdit(null),
    onOpenSettings: () => toggleModalExclusive('settings'),
    onSelectCategoryIndex: (index: number) => {
      const target = categoriesSignal.value[index];
      if (target) {
        handleSelectCategory(target.name);
      }
    }
  }, {
    modalActive: isAnyModalOpen
  });

  const handleEditLinkFromContext = (link: LinkItem) => {
    openVisualEdit(link);
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

        <ActionToolbar
          variant="header"
          onOpenSearch={() => handleOpenSearch()}
          onOpenCheatsheet={() => openModal('cheatsheet')}
          onOpenVisualEdit={() => openVisualEdit(null)}
          onOpenSettings={() => openModal('settings')}
        />
      </header>

      <main style={{ width: '100%' }}>
        <ColumnGrid
          categories={categories}
          highlightedCategory={highlightedCategory}
          showShortcuts={showShortcuts}
          onEditLink={handleEditLinkFromContext}
          onOpenReorder={() => openModal('reorder')}
        />
      </main>

      {/* Standalone Bottom Navigation Bar for Mobile & Tablet (< 1024px) */}
      <ActionToolbar
        variant="bottomNav"
        onOpenSearch={() => handleOpenSearch()}
        onOpenCheatsheet={() => openModal('cheatsheet')}
        onOpenVisualEdit={() => openVisualEdit(null)}
        onOpenSettings={() => openModal('settings')}
      />

      {/* Modals */}
      <SearchModal
        isOpen={isModalOpen('search')}
        initialQuery={initialSearchChar}
        links={links}
        onClose={closeModal}
      />

      <CheatsheetModal
        isOpen={isModalOpen('cheatsheet')}
        onClose={closeModal}
      />

      <ImportExportModal
        isOpen={isModalOpen('importExport')}
        onClose={closeModal}
      />

      <VisualEditModal
        isOpen={isModalOpen('visualEdit')}
        initialEditLink={editTargetLink}
        onClose={closeModal}
      />

      <SettingsModal
        isOpen={isModalOpen('settings')}
        onClose={closeModal}
        onOpenImportExport={() => openModal('importExport')}
      />

      <ReorderModal
        isOpen={isModalOpen('reorder')}
        categories={categoryNames}
        onClose={closeModal}
      />

      {/* Global feedback overlays */}
      <Toast />
      <ConfirmDialog />
    </>
  );
};
