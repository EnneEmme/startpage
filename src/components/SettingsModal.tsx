import { Icon } from './Icon';
import { ACCENT_COLORS } from '../engine';
import { themeConfigSignal, settingsActions } from '../stores';
import { Modal } from './Modals/Modal';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImportExport?: () => void;
}

export const SettingsModal = ({ isOpen, onClose, onOpenImportExport }: SettingsModalProps) => {
  if (!isOpen) return null;

  // Live config straight from the signal: no stale local copy, no manual sync.
  const config = themeConfigSignal.value;

  const handleSelectAccent = (colorId: string) => settingsActions.setAccentColor(colorId);
  const handleSelectDensity = (density: 'compact' | 'normal' | 'spaced') =>
    settingsActions.setGridDensity(density);
  const handleSelectFontSize = (size: 'small' | 'medium' | 'large' | 'xlarge') =>
    settingsActions.setFontSize(size);
  const handleSelectAliasVisibility = (visibility: 'smart' | 'always') =>
    settingsActions.setAliasVisibility(visibility);
  const handleSelectEngine = (engine: 'g' | 'ddg' | 'b' | 'yt' | 'gh') =>
    settingsActions.setDefaultSearchEngine(engine);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Personalization"
      subtitle="Visual theme, grid, fonts and preferences"
      icon={<Icon name="Sliders" size={18} class={styles.headerIcon} />}
      footer={
        <button type="button" class={styles.saveBtn} onClick={onClose}>
          Close
        </button>
      }
    >
      {/* Accent Color Theme Section */}
      <div class={styles.sectionGroup}>
        <div class={styles.sectionHeaderRow}>
          <label class={styles.sectionLabel} id="settings-accent-label">
            <Icon name="Palette" size={15} class={styles.sectionIcon} />
            Primary Accent Color
          </label>
          <span class={styles.sectionSubtext}>
            Applies the palette to buttons, selections and highlight effects
          </span>
        </div>

        <div class={styles.colorPaletteGrid} role="group" aria-labelledby="settings-accent-label">
          {ACCENT_COLORS.map(item => {
            const isSelected = config.accentColorId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                class={`${styles.colorChipBtn} ${isSelected ? styles.selectedColorChip : ''}`}
                style={{ background: item.primary }}
                onClick={() => handleSelectAccent(item.id)}
                title={`${item.name} palette`}
                aria-label={`${item.name} palette`}
              >
                {isSelected && <Icon name="Check" size={16} class={styles.checkMarkIcon} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid Density Section */}
      <div class={styles.sectionGroup}>
        <div class={styles.sectionHeaderRow}>
          <label class={styles.sectionLabel} id="settings-density-label">
            <Icon name="LayoutGrid" size={15} class={styles.sectionIcon} />
            Column Grid Density
          </label>
          <span class={styles.sectionSubtext}>
            {config.gridDensity === 'compact' &&
              '⚡ Ultra Compact (155px min - up to 7-9 columns per row)'}
            {config.gridDensity === 'normal' &&
              '✨ Default Normal (185px min - up to 5-6 columns per row)'}
            {config.gridDensity === 'spaced' &&
              '🖥️ Wide Spaced (230px min - wide view for large monitors)'}
          </span>
        </div>

        <div class={styles.segmentedControl} role="group" aria-labelledby="settings-density-label">
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.gridDensity === 'compact' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectDensity('compact')}
          >
            Compact
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.gridDensity === 'normal' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectDensity('normal')}
          >
            Normal (Default)
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.gridDensity === 'spaced' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectDensity('spaced')}
          >
            Spaced
          </button>
        </div>
      </div>

      {/* Font Size Section */}
      <div class={styles.sectionGroup}>
        <div class={styles.sectionHeaderRow}>
          <label class={styles.sectionLabel} id="settings-fontsize-label">
            <Icon name="Type" size={15} class={styles.sectionIcon} />
            Font Size
          </label>
          <span class={styles.sectionSubtext}>
            Adjusts the typographic scale of the whole interface
          </span>
        </div>

        <div class={styles.segmentedControl} role="group" aria-labelledby="settings-fontsize-label">
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.fontSize === 'small' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectFontSize('small')}
          >
            Small
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.fontSize === 'medium' || !config.fontSize ? styles.activeSegment : ''}`}
            onClick={() => handleSelectFontSize('medium')}
          >
            Medium
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.fontSize === 'large' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectFontSize('large')}
          >
            Large
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.fontSize === 'xlarge' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectFontSize('xlarge')}
          >
            XL
          </button>
        </div>
      </div>

      {/* Alias Badge Visibility Section */}
      <div class={styles.sectionGroup}>
        <div class={styles.sectionHeaderRow}>
          <label class={styles.sectionLabel} id="settings-alias-label">
            <Icon name="Eye" size={15} class={styles.sectionIcon} />
            Shortcut Badge Visibility (Aliases)
          </label>
          <span class={styles.sectionSubtext}>
            Choose whether to show alias badges only while holding Alt or keep them always visible
          </span>
        </div>

        <div class={styles.segmentedControl} role="group" aria-labelledby="settings-alias-label">
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.aliasVisibility === 'smart' || !config.aliasVisibility ? styles.activeSegment : ''}`}
            onClick={() => handleSelectAliasVisibility('smart')}
          >
            👁️ Smart (Hold Alt)
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.aliasVisibility === 'always' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectAliasVisibility('always')}
          >
            📌 Always Visible
          </button>
        </div>
      </div>

      {/* Default Search Engine Section */}
      <div class={styles.sectionGroup}>
        <div class={styles.sectionHeaderRow}>
          <label class={styles.sectionLabel} id="settings-engine-label">
            <Icon name="Search" size={15} class={styles.sectionIcon} />
            Default Search Engine
          </label>
          <span class={styles.sectionSubtext}>
            Used for general web searches from the search bar
          </span>
        </div>

        <div class={styles.segmentedControl} role="group" aria-labelledby="settings-engine-label">
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.defaultSearchEngine === 'g' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectEngine('g')}
          >
            Google (g)
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.defaultSearchEngine === 'ddg' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectEngine('ddg')}
          >
            DuckDuckGo (ddg)
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.defaultSearchEngine === 'b' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectEngine('b')}
          >
            Bing (b)
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.defaultSearchEngine === 'yt' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectEngine('yt')}
          >
            YouTube (yt)
          </button>
          <button
            type="button"
            class={`${styles.segmentBtn} ${config.defaultSearchEngine === 'gh' ? styles.activeSegment : ''}`}
            onClick={() => handleSelectEngine('gh')}
          >
            GitHub (gh)
          </button>
        </div>
      </div>

      {/* Touch-only gesture hint (no hover tooltips on coarse pointers) */}
      <p class={styles.touchHint} role="note">
        👆 Touch tip: long-press a link card to open its action menu (edit, move, remove).
      </p>

      {/* Backup & Import/Export Section */}
      <div class={styles.sectionGroup}>
        <div class={styles.sectionHeaderRow}>
          <label class={styles.sectionLabel} id="settings-backup-label">
            <Icon name="Download" size={15} class={styles.sectionIcon} />
            Backup & Data Sync
          </label>
          <span class={styles.sectionSubtext}>
            Export or import links and preferences in JSON format
          </span>
        </div>

        <div class={styles.backupBtnRow} role="group" aria-labelledby="settings-backup-label">
          <button
            type="button"
            class={styles.backupActionBtn}
            onClick={() => {
              onClose();
              if (onOpenImportExport) onOpenImportExport();
            }}
          >
            <Icon name="Download" size={15} />
            <span>Export / Import JSON Backup</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
