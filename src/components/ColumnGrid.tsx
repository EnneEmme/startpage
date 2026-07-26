import { h } from 'preact';
import { CategoryGroup, LinkItem } from '../types/startpage';
import { resolveDynamicUrl } from '../engine/dynamicEvaluator';
import { rankStorage } from '../engine/rankStorage';
import { LinkIcon } from './LinkIcon';
import styles from './ColumnGrid.module.css';

interface ColumnGridProps {
  categories: CategoryGroup[];
  activeCategoryFilter: string | null;
  onLinkClick?: (link: LinkItem) => void;
}

export const ColumnGrid = ({
  categories,
  activeCategoryFilter,
  onLinkClick
}: ColumnGridProps) => {
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

  return (
    <div class={styles.gridContainer}>
      {filteredCategories.map(cat => (
        <div key={cat.name} class={styles.columnCard}>
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
                >
                  <div class={styles.iconContainer}>
                    <LinkIcon
                      url={displayUrl || 'https://example.com'}
                      iconSpec={link.icon}
                      title={link.title}
                      size={20}
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
      ))}
    </div>
  );
};
