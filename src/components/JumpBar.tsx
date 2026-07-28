import { useState, useRef, useEffect } from 'preact/hooks';
import styles from './JumpBar.module.css';

interface JumpBarProps {
  categories: string[];
  activeCategory: string | null;
  showShortcuts?: boolean;
  onSelectCategory: (category: string | null) => void;
}

export const JumpBar = ({
  categories,
  activeCategory,
  showShortcuts = false,
  onSelectCategory
}: JumpBarProps) => {
  const jumpBarRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  const checkScrollState = () => {
    if (!jumpBarRef.current) return;
    const el = jumpBarRef.current;
    const canScrollLeft = el.scrollLeft > 5;
    const canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 8;
    setScrollState({ canScrollLeft, canScrollRight });
  };

  useEffect(() => {
    checkScrollState();
    window.addEventListener('resize', checkScrollState);
    return () => window.removeEventListener('resize', checkScrollState);
  }, [categories]);

  const handleScroll = () => {
    checkScrollState();
  };

  // Scrolling is owned by the parent (App -> scrollToCategory): notify only,
  // otherwise the page would perform the same smooth scroll twice per click.
  const handleTabClick = (categoryName: string | null) => {
    onSelectCategory(categoryName);
  };

  // CSS-module classes are typed string|undefined by noUncheckedIndexedAccess;
  // the class names exist, and Preact's class prop tolerates undefined.
  let fadeClass: string | undefined = '';
  if (scrollState.canScrollLeft && scrollState.canScrollRight) {
    fadeClass = styles.fadeBoth;
  } else if (scrollState.canScrollLeft && !scrollState.canScrollRight) {
    fadeClass = styles.fadeLeft;
  } else if (!scrollState.canScrollLeft && scrollState.canScrollRight) {
    fadeClass = styles.fadeRight;
  }

  return (
    <nav
      ref={jumpBarRef}
      class={`${styles.jumpBar} ${fadeClass}`}
      onScroll={handleScroll}
      aria-label="Category Navigation"
    >
      <button
        class={`${styles.tabBtn} ${activeCategory === null ? styles.active : ''}`}
        onClick={() => handleTabClick(null)}
      >
        All
      </button>

      {categories.map((cat, idx) => (
        <button
          key={cat}
          class={`${styles.tabBtn} ${activeCategory === cat ? styles.active : ''}`}
          onClick={() => handleTabClick(cat)}
        >
          {showShortcuts && idx < 9 && (
            <span class={styles.shortcutNumberBadge}>{idx + 1}</span>
          )}
          <span>{cat}</span>
        </button>
      ))}
    </nav>
  );
};
