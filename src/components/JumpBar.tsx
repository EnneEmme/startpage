import { h } from 'preact';
import styles from './JumpBar.module.css';

interface JumpBarProps {
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

export const JumpBar = ({
  categories,
  activeCategory,
  onSelectCategory
}: JumpBarProps) => {
  return (
    <nav class={styles.jumpBar} aria-label="Category Navigation">
      <button
        class={`${styles.tabBtn} ${activeCategory === null ? styles.active : ''}`}
        onClick={() => onSelectCategory(null)}
      >
        All Links
      </button>
      {categories.map(cat => (
        <button
          key={cat}
          class={`${styles.tabBtn} ${activeCategory === cat ? styles.active : ''}`}
          onClick={() => onSelectCategory(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  );
};
