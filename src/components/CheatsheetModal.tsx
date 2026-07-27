import { h } from 'preact';
import { X, Keyboard } from 'lucide-preact';
import { getDynamicCheatsheetShortcuts } from '../engine/cheatsheetData';
import styles from './CheatsheetModal.module.css';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetModal = ({ isOpen, onClose }: CheatsheetModalProps) => {
  if (!isOpen) return null;

  const shortcutGroups = getDynamicCheatsheetShortcuts();

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.modalHeader}>
          <div class={styles.headerTitleGroup}>
            <Keyboard size={18} class={styles.keyboardIcon} />
            <h2 class={styles.modalTitle}>Keyboard Shortcuts Cheatsheet</h2>
          </div>
          <button class={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div class={styles.modalContent}>
          {shortcutGroups.map(group => (
            <div key={group.category} class={styles.shortcutSection}>
              <h3 class={styles.categoryHeader}>{group.category}</h3>
              <div class={styles.shortcutGrid}>
                {group.items.map((item, idx) => (
                  <div key={idx} class={styles.shortcutRow}>
                    <div class={styles.keysBadgeContainer}>
                      {item.keys.map((k, kIdx) => (
                        <span key={kIdx} class={styles.keyBadge}>
                          {k}
                        </span>
                      ))}
                    </div>
                    <span class={styles.shortcutDesc}>{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
