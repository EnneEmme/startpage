import { h } from 'preact';
import { useState } from 'preact/hooks';
import { CategoryGroup, LinkItem } from '../types/startpage';
import { resolveDynamicUrl } from '../engine/dynamicEvaluator';
import { rankStorage } from '../engine/rankStorage';
import { dataStore } from '../engine/dataStore';
import { LinkIcon } from './LinkIcon';
import { ContextMenu } from './ContextMenu';
import styles from './ColumnGrid.module.css';

interface ColumnGridProps {
  categories: CategoryGroup[];
  activeCategoryFilter: string | null;
  onLinkClick?: (link: LinkItem) => void;
  onEditLink?: (link: LinkItem) => void;
  onConfigChanged?: () => void;
}

export const ColumnGrid = ({
  categories,
  activeCategoryFilter,
  onLinkClick,
  onEditLink,
  onConfigChanged
}: ColumnGridProps) => {
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    link: LinkItem;
  } | null>(null);

  const filteredCategories = activeCategoryFilter
    ? categories.filter(c => c.name === activeCategoryFilter)
    : categories;

  const handleLinkClick = (e: MouseEvent, link: LinkItem) => {
    // Record usage ranking
    rankStorage.recordUsage(link.id);

    if (onLinkClick) {
      onLinkClick(link);
    }

    // Determine target URL
    const targetUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const handleContextMenu = (e: MouseEvent, link: LinkItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuState({
      x: e.clientX,
      y: e.clientY,
      link
    });
  };

  const handleRemoveLink = (linkId: string) => {
    dataStore.removeLink(linkId);
    if (onConfigChanged) {
      onConfigChanged();
    }
  };

  return (
    <div class={styles.gridContainer}>
      {filteredCategories.map(cat => {
        const columnId = `column-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

        return (
          <div key={cat.name} id={columnId} class={styles.columnCard}>
            <div class={styles.columnHeader}>
              <h2 class={styles.columnTitle}>{cat.name}</h2>
              <span class={styles.linkCountBadge}>{cat.links.length}</span>
            </div>

            <div class={styles.linksList}>
              {cat.links.map(link => {
                const displayUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);
                const mainAlias = link.aliases && link.aliases.length > 0 ? link.aliases[0] : null;

                return (
                  <a
                    key={link.id}
                    href={displayUrl || '#'}
                    class={styles.linkRow}
                    onClick={e => handleLinkClick(e, link)}
                    onContextMenu={e => handleContextMenu(e, link)}
                  >
                    <div class={styles.iconContainer}>
                      <LinkIcon
                        url={displayUrl || 'https://example.com'}
                        iconSpec={link.icon}
                        title={link.title}
                        size={18}
                      />
                    </div>

                    <div class={styles.linkInfo}>
                      <span class={styles.linkTitle}>{link.title}</span>
                    </div>

                    {mainAlias && (
                      <span class={styles.aliasBadge}>{mainAlias}</span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        );
      })}

      {contextMenuState && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          link={contextMenuState.link}
          onClose={() => setContextMenuState(null)}
          onEdit={link => {
            if (onEditLink) onEditLink(link);
          }}
          onRemove={handleRemoveLink}
        />
      )}
    </div>
  );
};
