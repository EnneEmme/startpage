import { h } from 'preact';
import { useState } from 'preact/hooks';
import { ArrowUp, ArrowLeft, ArrowRight, Settings2 } from 'lucide-preact';
import { dataStore } from '../engine/dataStore';
import styles from './JumpBar.module.css';

interface JumpBarProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onConfigChanged: () => void;
}

export const JumpBar = ({
  categories,
  activeCategory,
  onSelectCategory,
  onConfigChanged
}: JumpBarProps) => {
  const [reorderOpen, setReorderOpen] = useState<boolean>(false);

  const handleTabClick = (categoryName: string | null) => {
    onSelectCategory(categoryName);

    if (categoryName === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetEl = document.getElementById(`column-${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
    if (targetEl) {
      // Calculate offset so sticky jumpbar doesn't obscure the section header
      const yOffset = -90;
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleMoveCategory = (index: number, direction: 'left' | 'right') => {
    const currentOrder = categories.length > 0 ? [...categories] : [];
    const newIdx = direction === 'left' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= currentOrder.length) return;

    // Swap elements
    const temp = currentOrder[index];
    currentOrder[index] = currentOrder[newIdx];
    currentOrder[newIdx] = temp;

    dataStore.setCategoryOrder(currentOrder);
    onConfigChanged();
  };

  return (
    <nav class={styles.jumpBar} aria-label="Category Navigation">
      <button
        class={`${styles.tabBtn} ${activeCategory === null ? styles.active : ''}`}
        onClick={() => handleTabClick(null)}
        title="Scroll to Top"
      >
        <ArrowUp size={14} /> Top
      </button>

      {categories.map(cat => (
        <button
          key={cat}
          class={`${styles.tabBtn} ${activeCategory === cat ? styles.active : ''}`}
          onClick={() => handleTabClick(cat)}
        >
          {cat}
        </button>
      ))}

      <button
        class={styles.reorderBtn}
        onClick={() => setReorderOpen(prev => !prev)}
        title="Reorder Columns"
      >
        <Settings2 size={15} />
      </button>

      {/* Column Reordering Popup Modal */}
      {reorderOpen && (
        <div class={`${styles.reorderPopup} fade-in`}>
          <div class={styles.reorderHeader}>
            <span>Reorder Columns</span>
            <button class={styles.closePopupBtn} onClick={() => setReorderOpen(false)}>×</button>
          </div>
          <div class={styles.reorderList}>
            {categories.map((cat, idx) => (
              <div key={cat} class={styles.reorderRow}>
                <span class={styles.reorderName}>{cat}</span>
                <div class={styles.reorderControls}>
                  <button
                    disabled={idx === 0}
                    onClick={() => handleMoveCategory(idx, 'left')}
                    class={styles.moveBtn}
                    title="Move Left"
                  >
                    <ArrowLeft size={13} />
                  </button>
                  <button
                    disabled={idx === categories.length - 1}
                    onClick={() => handleMoveCategory(idx, 'right')}
                    class={styles.moveBtn}
                    title="Move Right"
                  >
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
