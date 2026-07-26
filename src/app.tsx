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

  // Modals state
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [initialSearchChar, setInitialSearchChar] = useState<string>('');
  const [cheatsheetOpen, setCheatsheetOpen] = useState<boolean>(false);
  const [importExportOpen, setImportExportOpen] = useState<boolean>(false);
  const [visualEditOpen, setVisualEditOpen] = useState<boolean>(false);

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
      },
      onOpenCheatsheet: () => {
        setSearchOpen(false);
        setCheatsheetOpen(prev => !prev);
      }
    });

    keyboardManager.attach();
    return () => keyboardManager.detach();
  }, [cheatsheetOpen, importExportOpen, visualEditOpen]);

  const categoryNames = categories.map(c => c.name);

  return (
    <div id="app">
      <HeaderClock
        onOpenSearch={() => {
          setInitialSearchChar('');
          setSearchOpen(true);
        }}
        onOpenCheatsheet={() => setCheatsheetOpen(true)}
        onOpenVisualEdit={() => setVisualEditOpen(true)}
        onOpenImportExport={() => setImportExportOpen(true)}
      />

      <JumpBar
        categories={categoryNames}
        activeCategory={activeCategoryFilter}
        onSelectCategory={cat => setActiveCategoryFilter(cat)}
      />

      <main style={{ width: '100%' }}>
        <ColumnGrid
          categories={categories}
          activeCategoryFilter={activeCategoryFilter}
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
        onClose={() => setVisualEditOpen(false)}
        onConfigChanged={refreshData}
      />
    </div>
  );
};
