import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Keyboard, Search, Sparkles, Command } from 'lucide-preact';
import { getDynamicCheatsheetShortcuts } from '../engine/cheatsheetData';
import styles from './CheatsheetModal.module.css';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetModal = ({ isOpen, onClose }: CheatsheetModalProps) => {
  if (!isOpen) return null;

  const [searchQuery, setSearchQuery] = useState<string>('');
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
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div class={styles.modalHeader}>
          <div class={styles.headerTitleGroup}>
            <div class={styles.headerIconBadge}>
              <Keyboard size={18} class={styles.keyboardIcon} />
            </div>
            <div>
              <h2 class={styles.modalTitle}>Keyboard Shortcuts Cheatsheet</h2>
              <span class={styles.modalSubtitle}>Guida completa alle scorciatoie da tastiera e comandi rapidi</span>
            </div>
          </div>
          <button class={styles.closeBtn} onClick={onClose} type="button" title="Chiudi (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div class={styles.searchBarWrapper}>
          <Search size={15} class={styles.searchIcon} />
          <input
            type="text"
            class={styles.searchInput}
            placeholder="Filtra scorciatoie (es. Alt, numeri, cerca, elimina)..."
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
        <div class={styles.modalContent}>
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
              <p>Nessuna scorciatoia trovata per "{searchQuery}"</p>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div class={styles.modalFooter}>
          <span class={styles.footerHint}>
            💡 Premi <kbd class={styles.miniKbd}>?</kbd> in qualsiasi momento per aprire/chiudere questa guida
          </span>
        </div>
      </div>
    </div>
  );
};
