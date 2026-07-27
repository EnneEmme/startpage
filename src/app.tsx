import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { dataStore } from './engine/dataStore';
import { keyboardManager } from './engine/keyboardManager';
import { themeEngine } from './engine/themeEngine';
import { HeaderClock } from './components/HeaderClock';
import { JumpBar } from './components/JumpBar';
import { ColumnGrid } from './components/ColumnGrid';
import { SearchModal } from './components/SearchModal';
import { CheatsheetModal } from './components/CheatsheetModal';
import { ImportExportModal } from './components/ImportExportModal';
import { VisualEditModal } from './components/VisualEditModal';
import { SettingsModal } from './components/SettingsModal';
import { LinkItem, CategoryGroup } from './types/startpage';

export const App = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);

  // Modals state
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [initialSearchChar, setInitialSearchChar] = useState<string>('');
  const [cheatsheetOpen, setCheatsheetOpen] = useState<boolean>(false);
  const [importExportOpen, setImportExportOpen] = useState<boolean>(false);
  const [visualEditOpen, setVisualEditOpen] = useState<boolean>(false);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [editTargetLink, setEditTargetLink] = useState<LinkItem | null>(null);

  const isAnyModalOpen = searchOpen || cheatsheetOpen || importExportOpen || visualEditOpen || settingsOpen;

  // Lock body scrolling and interaction when any modal is open
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

  const refreshData = () => {
    setLinks(dataStore.getLinks());
    setCategories(dataStore.getCategories());
    themeEngine.applyTheme(themeEngine.getConfig());
  };

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

  useEffect(() => {
    refreshData();

    // Attach global keyboard shortcuts handlers
    keyboardManager.setHandlers({
      onOpenSearch: (char?: string) => {
        if (!cheatsheetOpen && !importExportOpen && !visualEditOpen && !settingsOpen) {
          setInitialSearchChar(char || '');
          setSearchOpen(true);
        }
      },
      onCloseModals: () => {
        setSearchOpen(false);
        setCheatsheetOpen(false);
        setImportExportOpen(false);
        setVisualEditOpen(false);
        setSettingsOpen(false);
        setEditTargetLink(null);
      },
      onOpenCheatsheet: () => {
        setSearchOpen(false);
        setCheatsheetOpen(prev => !prev);
      },
      onToggleShortcutsView: () => {
        setShowShortcuts(prev => !prev);
      },
      onSelectCategoryIndex: (index: number) => {
        const currentCats = dataStore.getCategories();
        if (index >= 0 && index < currentCats.length) {
          handleSelectCategory(currentCats[index].name);
        }
      }
    });

    keyboardManager.attach();
    return () => keyboardManager.detach();
  }, [cheatsheetOpen, importExportOpen, visualEditOpen, settingsOpen]);

  const handleEditLinkFromContext = (link: LinkItem) => {
    setEditTargetLink(link);
    setVisualEditOpen(true);
  };

  const categoryNames = categories.map(c => c.name);

  return (
    <div id="app">
      {/* Unified Non-Overlapping Header */}
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
          onOpenImportExport={() => setImportExportOpen(true)}
          onOpenSettings={() => setSettingsOpen(true)}
          showShortcuts={showShortcuts}
          onToggleShortcuts={() => setShowShortcuts(prev => !prev)}
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
      />
    </div>
  );
};
