import { h } from 'preact';
import { ArrowUp, Settings2 } from 'lucide-preact';
import styles from './JumpBar.module.css';

interface JumpBarProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  onOpenReorder: () => void;
}

export const JumpBar = ({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenReorder
}: JumpBarProps) => {
  const handleTabClick = (categoryName: string | null) => {
    onSelectCategory(categoryName);

    if (categoryName === null) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const columnId = `column-${categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    const targetEl = document.getElementById(columnId);

    if (targetEl) {
      const yOffset = -75; // Offset so sticky nav doesn't cover column title
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div class={styles.stickyHeaderWrapper}>
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
          onClick={onOpenReorder}
          title="Reorder Columns"
        >
          <Settings2 size={16} /> Reorder
        </button>
      </nav>
    </div>
  );
};
