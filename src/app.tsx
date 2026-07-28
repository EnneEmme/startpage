import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { 
  HeaderClock, 
  JumpBar, 
  ColumnGrid, 
  SearchModal, 
  CheatsheetModal, 
  ImportExportModal, 
  VisualEditModal, 
  SettingsModal, 
  MobileBottomNav 
} from './components';
import { LinkItem } from './types/startpage';
import { dataStore } from './engine';

// Custom Hooks
import { useModals, useSettings, useKeyboardShortcuts } from './hooks';

export const App = () => {
  const { links, categories, refreshData } = useSettings();
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);

  const {
    searchOpen, setSearchOpen,
    initialSearchChar, setInitialSearchChar,
    cheatsheetOpen, setCheatsheetOpen,
    importExportOpen, setImportExportOpen,
    visualEditOpen, setVisualEditOpen,
    settingsOpen, setSettingsOpen,
    editTargetLink, setEditTargetLink,
    isAnyModalOpen,
    closeAllModals
  } = useModals();

  const handleSelectCategory = (catName: string | null) => {
    setActiveCategoryFilter(catName);
    if (catName) {
      setHighlightedCategory(catName);
      setTimeout(() => setHighlightedCategory(null), 1400);

      const columnId = `column-${catName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const targetEl = document.getElementById(columnId);
      if (targetEl) {
        const yOffset = -85;
        const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    } else {
      setHighlightedCategory(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setSearchOpen(false);
      setCheatsheetOpen((prev) => !prev);
    },
    onOpenVisualEdit: () => {
      setEditTargetLink(null);
      setVisualEditOpen(true);
    },
    onOpenSettings: () => {
      setSearchOpen(false);
      setSettingsOpen((prev) => !prev);
    },
    onSelectCategoryIndex: (index: number) => {
      const currentCats = dataStore.getCategories();
      if (index >= 0 && index < currentCats.length) {
        handleSelectCategory(currentCats[index].name);
      }
    }
  }, [cheatsheetOpen, importExportOpen, visualEditOpen, settingsOpen]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleEditLinkFromContext = (link: LinkItem) => {
    setEditTargetLink(link);
    setVisualEditOpen(true);
  };

  const categoryNames = categories.map(c => c.name);

  return (
    <div id="app">
      {/* Unified Header */}
      <header class="unifiedHeader">
        <JumpBar
          categories={categoryNames}
          activeCategory={activeCategoryFilter}
          showShortcuts={showShortcuts}
          onSelectCategory={handleSelectCategory}
        />

        <HeaderClock
          onOpenSearch={() => {
            setInitialSearchChar('');
            setSearchOpen(true);
          }}
          onOpenCheatsheet={() => setCheatsheetOpen(true)}
          onOpenVisualEdit={() => {
            setEditTargetLink(null);
            setVisualEditOpen(true);
          }}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </header>

      <main style={{ width: '100%', pointerEvents: isAnyModalOpen ? 'none' : 'auto' }}>
        <ColumnGrid
          categories={categories}
          highlightedCategory={highlightedCategory}
          showShortcuts={showShortcuts}
          onEditLink={handleEditLinkFromContext}
          onConfigChanged={refreshData}
        />
      </main>

      {/* Standalone Bottom Navigation Bar for Mobile & Tablet (< 1024px) */}
      <MobileBottomNav
        onOpenSearch={() => {
          setInitialSearchChar('');
          setSearchOpen(true);
        }}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
        onOpenVisualEdit={() => {
          setEditTargetLink(null);
          setVisualEditOpen(true);
        }}
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
        onConfigChanged={refreshData}
      />

      <VisualEditModal
        isOpen={visualEditOpen}
        initialEditLink={editTargetLink}
        onClose={() => {
          setVisualEditOpen(false);
          setEditTargetLink(null);
        }}
        onConfigChanged={refreshData}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onConfigChanged={refreshData}
        onOpenImportExport={() => setImportExportOpen(true)}
      />
    </div>
  );
};
