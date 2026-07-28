import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Check, Sliders, Palette, LayoutGrid, Type, Search, Download, Eye, Sparkles } from 'lucide-preact';
import {  themeEngine, ACCENT_COLORS, ThemeConfig  } from '../engine';
import { Modal } from './modals/Modal';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged?: () => void;
  onOpenImportExport?: () => void;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  onConfigChanged,
  onOpenImportExport
}: SettingsModalProps) => {
  // Rules of hooks: all hooks must run before any conditional return.
  const [config, setConfig] = useState<ThemeConfig>(themeEngine.getConfig());

  if (!isOpen) return null;

  const handleSelectAccent = (colorId: string) => {
    themeEngine.setAccentColor(colorId);
    setConfig(themeEngine.getConfig());
    if (onConfigChanged) onConfigChanged();
  };

  const handleSelectDensity = (density: 'compact' | 'normal' | 'spaced') => {
    themeEngine.setGridDensity(density);
    setConfig(themeEngine.getConfig());
    if (onConfigChanged) onConfigChanged();
  };

  const handleSelectFontSize = (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    themeEngine.setFontSize(size);
    setConfig(themeEngine.getConfig());
    if (onConfigChanged) onConfigChanged();
  };

  const handleSelectAliasVisibility = (visibility: 'smart' | 'always') => {
    themeEngine.setAliasVisibility(visibility);
    setConfig(themeEngine.getConfig());
    if (onConfigChanged) onConfigChanged();
  };

  const handleSelectEngine = (engine: 'g' | 'ddg' | 'b' | 'yt' | 'gh') => {
    themeEngine.setDefaultSearchEngine(engine);
    setConfig(themeEngine.getConfig());
    if (onConfigChanged) onConfigChanged();
  };

  const currentAccent = ACCENT_COLORS.find(c => c.id === config.accentColorId) || ACCENT_COLORS[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings & Personalization"
      subtitle="Visual theme, grid, fonts and preferences"
      icon={<Sliders size={18} class={styles.headerIcon} />}
      footer={
        <button type="button" class={styles.saveBtn} onClick={onClose}>
          Save & Close
        </button>
      }
    >
      {/* Accent Color Theme Section */}
          <div class={styles.sectionGroup}>
            <div class={styles.sectionHeaderRow}>
              <label class={styles.sectionLabel}>
                <Palette size={15} class={styles.sectionIcon} />
                Primary Accent Color
              </label>
              <span class={styles.sectionSubtext}>Applies the palette to buttons, selections and highlight effects</span>
            </div>

            <div class={styles.colorPaletteGrid}>
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
                  >
                    {isSelected && <Check size={16} class={styles.checkMarkIcon} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Density Section */}
          <div class={styles.sectionGroup}>
            <div class={styles.sectionHeaderRow}>
              <label class={styles.sectionLabel}>
                <LayoutGrid size={15} class={styles.sectionIcon} />
                Column Grid Density
              </label>
              <span class={styles.sectionSubtext}>
                {config.gridDensity === 'compact' && '⚡ Ultra Compact (155px min - up to 7-9 columns per row)'}
                {config.gridDensity === 'normal' && '✨ Default Normal (185px min - up to 5-6 columns per row)'}
                {config.gridDensity === 'spaced' && '🖥️ Wide Spaced (230px min - wide view for large monitors)'}
              </span>
            </div>

            <div class={styles.segmentedControl}>
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
              <label class={styles.sectionLabel}>
                <Type size={15} class={styles.sectionIcon} />
                Font Size
              </label>
              <span class={styles.sectionSubtext}>Adjusts the typographic scale of the whole interface</span>
            </div>

            <div class={styles.segmentedControl}>
              <button
                type="button"
                class={`${styles.segmentBtn} ${config.fontSize === 'small' ? styles.activeSegment : ''}`}
                onClick={() => handleSelectFontSize('small')}
              >
                Small
              </button>
              <button
                type="button"
                class={`${styles.segmentBtn} ${(config.fontSize === 'medium' || !config.fontSize) ? styles.activeSegment : ''}`}
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
              <label class={styles.sectionLabel}>
                <Eye size={15} class={styles.sectionIcon} />
                Shortcut Badge Visibility (Aliases)
              </label>
              <span class={styles.sectionSubtext}>
                Choose whether to show alias badges only while holding Alt or keep them always visible
              </span>
            </div>

            <div class={styles.segmentedControl}>
              <button
                type="button"
                class={`${styles.segmentBtn} ${(config.aliasVisibility === 'smart' || !config.aliasVisibility) ? styles.activeSegment : ''}`}
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
              <label class={styles.sectionLabel}>
                <Search size={15} class={styles.sectionIcon} />
                Default Search Engine
              </label>
              <span class={styles.sectionSubtext}>Used for general web searches from the search bar</span>
            </div>

            <div class={styles.segmentedControl}>
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

          {/* Backup & Import/Export Section */}
          <div class={styles.sectionGroup}>
            <div class={styles.sectionHeaderRow}>
              <label class={styles.sectionLabel}>
                <Download size={15} class={styles.sectionIcon} />
                Backup & Data Sync
              </label>
              <span class={styles.sectionSubtext}>Export or import links and preferences in JSON format</span>
            </div>

            <div class={styles.backupBtnRow}>
              <button
                type="button"
                class={styles.backupActionBtn}
                onClick={() => {
                  onClose();
                  if (onOpenImportExport) onOpenImportExport();
                }}
              >
                <Download size={15} />
                <span>Export / Import JSON Backup</span>
              </button>
            </div>
          </div>
    </Modal>
  );
};
