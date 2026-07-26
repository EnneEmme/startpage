import { h } from 'preact';
import { X, ArrowUp, ArrowDown, Move } from 'lucide-preact';
import { dataStore } from '../engine/dataStore';
import styles from './ReorderModal.module.css';

interface ReorderModalProps {
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
  onConfigChanged: () => void;
}

export const ReorderModal = ({
  isOpen,
  categories,
  onClose,
  onConfigChanged
}: ReorderModalProps) => {
  if (!isOpen) return null;

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    dataStore.setCategoryOrder(newOrder);
    onConfigChanged();
  };

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.header}>
          <div class={styles.titleGroup}>
            <Move size={22} class={styles.titleIcon} />
            <h2>Reorder Column Sections</h2>
          </div>
          <button class={styles.closeBtn} onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div class={styles.contentBody}>
          <p class={styles.hintText}>Use the arrow buttons to arrange column sections in your preferred order:</p>
          
          <div class={styles.reorderList}>
            {categories.map((cat, idx) => (
              <div key={cat} class={styles.reorderRow}>
                <span class={styles.categoryName}>{cat}</span>
                <div class={styles.actionsGroup}>
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    class={styles.moveBtn}
                    title="Move Up / Left"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    class={styles.moveBtn}
                    title="Move Down / Right"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
