import { useState, useEffect } from 'preact/hooks';
import { ChevronDown } from 'lucide-preact';
import type { LinkItem, CategoryGroup } from '../types/startpage';
import { executeLink, scrollBehavior } from '../engine';
import { appActions, linksSignal, showToast } from '../stores';
import { useDragAndDrop, useContextMenu, useColumnScrollMasks } from '../hooks';
import { CategoryColumn } from './CategoryColumn';
import { ContextMenu } from './ContextMenu';
import styles from './ColumnGrid.module.css';

interface ColumnGridProps {
  categories: CategoryGroup[];
  showShortcuts: boolean;
  highlightedCategory?: string | null;
  onEditLink?: (link: LinkItem) => void;
  onOpenReorder?: () => void;
}

export const ColumnGrid = ({
  categories,
  showShortcuts,
  highlightedCategory,
  onEditLink,
  onOpenReorder
}: ColumnGridProps) => {
  const drag = useDragAndDrop(categories, `.${styles.linksList}`);
  const contextMenu = useContextMenu();
  const { masks, registerList, handleListScroll } = useColumnScrollMasks(categories.length);

  // Page scroll state for the floating bottom chevron indicator
  const [hasPageScrollDown, setHasPageScrollDown] = useState<boolean>(false);

  useEffect(() => {
    const checkPageScroll = () => {
      const totalHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const currentScroll = window.scrollY || document.documentElement.scrollTop;

      // Show indicator if content extends > 80px below fold and user hasn't scrolled near bottom
      const isUnscrolledPage = currentScroll < 120;
      const hasMorePageContent = totalHeight > viewportHeight + 80;

      setHasPageScrollDown(prev => {
        const next = isUnscrolledPage && hasMorePageContent;
        return prev === next ? prev : next;
      });
    };

    checkPageScroll();
    window.addEventListener('scroll', checkPageScroll, { passive: true });
    window.addEventListener('resize', checkPageScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkPageScroll);
      window.removeEventListener('resize', checkPageScroll);
    };
  }, []);

  // Scroll smooth to bottom of page when clicking floating chevron indicator
  const scrollToNextPageRow = () => {
    window.scrollTo({
      top: window.innerHeight - 100,
      behavior: scrollBehavior()
    });
  };

  const handleCardClick = (e: MouseEvent, link: LinkItem) => {
    // Swallow the synthetic click fired right after a long-press gesture
    if (contextMenu.shouldSwallowClick()) {
      e.preventDefault();
      return;
    }
    // executeLink owns all navigation (scripts included): always prevent the
    // native anchor navigation to avoid double navigation. Cmd/Ctrl+click
    // opens in a new tab via window.open (native new-tab default is prevented).
    e.preventDefault();
    executeLink(link, e.metaKey || e.ctrlKey ? '_blank' : '_self');
  };

  const handleRemoveLink = (linkId: string) => {
    // Capture the item + its in-category position so removal can be undone
    const allLinks = linksSignal.value;
    const removedLink = allLinks.find(l => l.id === linkId);
    const categoryIndex = removedLink
      ? allLinks.filter(l => l.category === removedLink.category).findIndex(l => l.id === linkId)
      : -1;

    appActions.removeLink(linkId);

    if (removedLink) {
      showToast(`"${removedLink.title}" removed`, {
        actionLabel: 'Undo',
        onAction: () => {
          appActions.restoreLink(removedLink, categoryIndex);
        }
      });
    }
  };

  return (
    <div class={styles.gridContainer}>
      {categories.map(cat => (
        <CategoryColumn
          key={cat.name}
          cat={cat}
          highlighted={highlightedCategory === cat.name}
          showShortcuts={showShortcuts}
          drag={drag}
          mask={masks[cat.name]}
          registerList={registerList}
          onListScroll={handleListScroll}
          onCardContextMenu={contextMenu.handleLinkContextMenu}
          onCardTouchStart={contextMenu.handleLinkTouchStart}
          onCardTouchEnd={contextMenu.cancelLongPress}
          onCardClick={handleCardClick}
        />
      ))}

      {/* Page-Wide Floating Minimalist Down Indicator Cue (Bottom Center) */}
      <button
        type="button"
        class={`${styles.pageScrollDownIndicator} ${hasPageScrollDown ? styles.visiblePageIndicator : ''}`}
        onClick={scrollToNextPageRow}
        title="Scroll down to view remaining columns"
        aria-label="Scroll down to view remaining columns"
      >
        <ChevronDown size={20} />
      </button>

      {/* Context Menu */}
      {contextMenu.menu && (
        <ContextMenu
          x={contextMenu.menu.x}
          y={contextMenu.menu.y}
          link={contextMenu.menu.link}
          onClose={contextMenu.closeMenu}
          onEdit={link => {
            if (onEditLink) onEditLink(link);
          }}
          onRemove={handleRemoveLink}
          onReorderColumns={onOpenReorder}
        />
      )}
    </div>
  );
};
