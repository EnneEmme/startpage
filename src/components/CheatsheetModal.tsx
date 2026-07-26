import { h } from 'preact';
import { X, Keyboard, HelpCircle } from 'lucide-preact';
import { CHEATSHEET_SHORTCUTS } from '../engine/cheatsheetData';
import styles from './CheatsheetModal.module.css';

interface CheatsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheatsheetModal = ({ isOpen, onClose }: CheatsheetModalProps) => {
  if (!isOpen) return null;

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.header}>
          <div class={styles.titleGroup}>
            <Keyboard size={24} class={styles.titleIcon} />
            <h2>Keyboard Shortcuts Cheatsheet</h2>
          </div>
          <button class={styles.closeBtn} onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div class={styles.contentBody}>
          {CHEATSHEET_SHORTCUTS.map(group => (
            <div key={group.category} class={styles.groupSection}>
              <h3 class={styles.groupTitle}>{group.category}</h3>
              <div class={styles.shortcutsGrid}>
                {group.items.map((item, i) => (
                  <div key={i} class={styles.shortcutRow}>
                    <div class={styles.keysGroup}>
                      {item.keys.map((k, kIdx) => (
                        <kbd key={kIdx} class={styles.kbdKey}>
                          {k}
                        </kbd>
                      ))}
                    </div>
                    <span class={styles.description}>{item.description}</span>
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
