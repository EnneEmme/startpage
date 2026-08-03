import { Icon } from './Icon';
import { appActions } from '../stores';
import { Modal } from './Modals/Modal';
import styles from './ReorderModal.module.css';

interface ReorderModalProps {
  isOpen: boolean;
  categories: string[];
  onClose: () => void;
}

export const ReorderModal = ({ isOpen, categories, onClose }: ReorderModalProps) => {
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...categories];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newOrder.length) return;

    const current = newOrder[index];
    const target = newOrder[targetIdx];
    if (current === undefined || target === undefined) return;
    newOrder[index] = target;
    newOrder[targetIdx] = current;

    appActions.setCategoryOrder(newOrder);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reorder Column Sections"
      icon={<Icon name="Move" size={22} class={styles.titleIcon} />}
      maxWidth="500px"
    >
      <div class={styles.contentBody}>
        <p class={styles.hintText}>
          Use the arrow buttons to arrange column sections in your preferred order:
        </p>

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
                  aria-label={`Move ${cat} up`}
                >
                  <Icon name="ArrowUp" size={16} />
                </button>
                <button
                  disabled={idx === categories.length - 1}
                  onClick={() => handleMove(idx, 'down')}
                  class={styles.moveBtn}
                  title="Move Down / Right"
                  aria-label={`Move ${cat} down`}
                >
                  <Icon name="ArrowDown" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};
