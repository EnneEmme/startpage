import { h } from 'preact';
import { Eye, Zap } from 'lucide-preact';
import { LinkIcon } from '../LinkIcon';
import styles from '../VisualEditModal.module.css';

interface PreviewPanelProps {
  title: string;
  url: string;
  icon: string;
  firstAlias: string;
  activeTab: 'web' | 'script' | 'search';
}

export const PreviewPanel = ({ title, url, icon, firstAlias, activeTab }: PreviewPanelProps) => (
  <div class={styles.previewBox}>
    <div class={styles.previewHeader}>
      <Eye size={14} class={styles.previewIcon} />
      <span>Anteprima Card Link</span>
    </div>

    <div class={styles.previewCardRow}>
      <div class={styles.previewIconContainer}>
        <LinkIcon
          url={url || 'https://example.com'}
          iconSpec={icon || undefined}
          title={title || 'Anteprima Link'}
          size={18}
        />
      </div>

      <div class={styles.previewInfo}>
        <span class={styles.previewTitle}>
          {title || 'Titolo del Link'}
          {activeTab === 'script' && <Zap size={11} style={{ marginLeft: '4px', color: '#f59e0b', display: 'inline-block' }} />}
        </span>
      </div>

      {firstAlias && (
        <span class={styles.previewAliasBadge}>
          {firstAlias}
        </span>
      )}
    </div>
  </div>
);
