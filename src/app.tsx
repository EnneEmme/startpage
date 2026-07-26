import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { dataStore } from './engine/dataStore';
import { keyboardManager } from './engine/keyboardManager';
import { HeaderClock } from './components/HeaderClock';
import { JumpBar } from './components/JumpBar';
import { ColumnGrid } from './components/ColumnGrid';
import { SearchModal } from './components/SearchModal';
import { CheatsheetModal } from './components/CheatsheetModal';
import { ImportExportModal } from './components/ImportExportModal';
import { VisualEditModal } from './components/VisualEditModal';
import { LinkItem, CategoryGroup } from './types/startpage';

export const App = () => {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);

  // Modals state
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [initialSearchChar, setInitialSearchChar] = useState<string>('');
  const [cheatsheetOpen, setCheatsheetOpen] = useState<boolean>(false);
  const [importExportOpen, setImportExportOpen] = useState<boolean>(false);
  const [visualEditOpen, setVisualEditOpen] = useState<boolean>(false);
  const [editTargetLink, setEditTargetLink] = useState<LinkItem | null>(null);

  const refreshData = () => {
    setLinks(dataStore.getLinks());
    setCategories(dataStore.getCategories());
  };

  useEffect(() => {
    refreshData();

    // Attach global keyboard shortcuts handlers
    keyboardManager.setHandlers({
      onOpenSearch: (char?: string) => {
        if (!cheatsheetOpen && !importExportOpen && !visualEditOpen) {
          setInitialSearchChar(char || '');
          setSearchOpen(true);
        }
      },
      onCloseModals: () => {
        setSearchOpen(false);
        setCheatsheetOpen(false);
        setImportExportOpen(false);
        setVisualEditOpen(false);
        setEditTargetLink(null);
      },
      onOpenCheatsheet: () => {
        setSearchOpen(false);
        setCheatsheetOpen(prev => !prev);
      }
    });

    keyboardManager.attach();
    return () => keyboardManager.detach();
  }, [cheatsheetOpen, importExportOpen, visualEditOpen]);

  const handleSelectCategory = (catName: string | null) => {
    setActiveCategoryFilter(catName);
    if (catName) {
      setHighlightedCategory(catName);
      // Auto-clear highlight after pulse animation finishes
      setTimeout(() => setHighlightedCategory(null), 1400);
    } else {
      setHighlightedCategory(null);
    }
  };

  const handleEditLinkFromContext = (link: LinkItem) => {
    setEditTargetLink(link);
    setVisualEditOpen(true);
  };

  const categoryNames = categories.map(c => c.name);

  return (
    <div id="app">
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
      />

      <JumpBar
        categories={categoryNames}
        activeCategory={activeCategoryFilter}
        onSelectCategory={handleSelectCategory}
      />

      <main style={{ width: '100%' }}>
        <ColumnGrid
          categories={categories}
          highlightedCategory={highlightedCategory}
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
    </div>
  );
};
