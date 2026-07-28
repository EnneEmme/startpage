import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Keyboard, Search, Sparkles, Command } from 'lucide-preact';
import {  getDynamicCheatsheetShortcuts  } from '../engine';
import { Modal } from './modals/Modal';
import styles from './CheatsheetModal.module.css';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetModal = ({ isOpen, onClose }: CheatsheetModalProps) => {
  // Rules of hooks: all hooks must run before any conditional return.
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;
  const shortcutGroups = getDynamicCheatsheetShortcuts();

  // Filter shortcuts by search query
  const filteredGroups = shortcutGroups.map(group => {
    const filteredItems = group.items.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchKey = item.keys.some(k => k.toLowerCase().includes(q));
      const matchCat = group.category.toLowerCase().includes(q);
      return matchDesc || matchKey || matchCat;
    });

    return {
      ...group,
      items: filteredItems
    };
  }).filter(group => group.items.length > 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts Cheatsheet"
      subtitle="Complete guide to keyboard shortcuts and quick commands"
      icon={<Keyboard size={18} class={styles.keyboardIcon} />}
      footer={
        <span class={styles.footerHint}>
          💡 Premi <kbd class={styles.miniKbd}>?</kbd> in qualsiasi momento per aprire/chiudere questa guida
        </span>
      }
    >
      {/* Search Bar */}
      <div class={styles.searchBarWrapper}>
        <Search size={15} class={styles.searchIcon} />
        <input
          type="text"
          class={styles.searchInput}
          placeholder="Filter shortcuts (e.g. Alt, numbers, search, delete)..."
          value={searchQuery}
          onInput={e => setSearchQuery((e.target as HTMLInputElement).value)}
          autoFocus
        />
        {searchQuery && (
          <button
            type="button"
            class={styles.clearSearchBtn}
            onClick={() => setSearchQuery('')}
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* Body Content */}
      <div class={styles.cheatsheetBody}>
          {filteredGroups.length > 0 ? (
            filteredGroups.map(group => (
              <div key={group.category} class={styles.shortcutSection}>
                <div class={styles.categoryHeaderRow}>
                  <Sparkles size={13} class={styles.categorySparkle} />
                  <h3 class={styles.categoryHeader}>{group.category}</h3>
                </div>
                <div class={styles.shortcutGrid}>
                  {group.items.map((item, idx) => (
                    <div key={idx} class={styles.shortcutCard}>
                      <span class={styles.shortcutDesc}>{item.description}</span>
                      <div class={styles.keysBadgeContainer}>
                        {item.keys.map((k, kIdx) => (
                          <kbd key={kIdx} class={styles.keyBadge}>
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div class={styles.noResultsState}>
              <Command size={32} class={styles.noResultsIcon} />
              <p>No shortcuts found for "{searchQuery}"</p>
            </div>
          )}
        </div>
    </Modal>
  );
};
