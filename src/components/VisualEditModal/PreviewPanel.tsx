import { Eye, Zap } from 'lucide-preact';
import { ICON_FALLBACK_URL } from '../../engine';
import { LinkIcon } from '../LinkIcon';
import styles from './VisualEditModal.module.css';

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
      <span>Link Card Preview</span>
    </div>

    <div class={styles.previewCardRow}>
      <div class={styles.previewIconContainer}>
        <LinkIcon
          url={url || ICON_FALLBACK_URL}
          iconSpec={icon || undefined}
          title={title || 'Link Preview'}
          size={18}
        />
      </div>

      <div class={styles.previewInfo}>
        <span class={styles.previewTitle}>
          {title || 'Link Title'}
          {activeTab === 'script' && <Zap size={11} class={styles.scriptBadge} />}
        </span>
      </div>

      {firstAlias && <span class={styles.previewAliasBadge}>{firstAlias}</span>}
    </div>
  </div>
);
