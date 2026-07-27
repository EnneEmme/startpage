import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Check, Sliders, Palette, LayoutGrid, Search, Download } from 'lucide-preact';
import { themeEngine, ACCENT_COLORS, ThemeConfig } from '../engine/themeEngine';
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
  if (!isOpen) return null;

  const [config, setConfig] = useState<ThemeConfig>(themeEngine.getConfig());

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

  const handleSelectEngine = (engine: 'g' | 'ddg' | 'b' | 'yt' | 'gh') => {
    themeEngine.setDefaultSearchEngine(engine);
    setConfig(themeEngine.getConfig());
    if (onConfigChanged) onConfigChanged();
  };

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.modalHeader}>
          <div class={styles.headerTitleGroup}>
            <Sliders size={18} class={styles.headerIcon} />
            <h2 class={styles.modalTitle}>Impostazioni & Tema</h2>
          </div>
          <button class={styles.closeBtn} onClick={onClose} type="button">
            <X size={18} />
          </button>
        </div>

        <div class={styles.modalContent}>
          {/* Accent Color Theme Section */}
          <div class={styles.sectionGroup}>
            <label class={styles.sectionLabel}>
              <Palette size={15} class={styles.sectionIcon} />
              Colore d'Accento Primario
            </label>
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
                    title={item.name}
                  >
                    {isSelected && <Check size={16} class={styles.checkMarkIcon} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grid Density Section */}
          <div class={styles.sectionGroup}>
            <label class={styles.sectionLabel}>
              <LayoutGrid size={15} class={styles.sectionIcon} />
              Densità Griglia Colonne
            </label>
            <div class={styles.segmentedControl}>
              <button
                type="button"
                class={`${styles.segmentBtn} ${config.gridDensity === 'compact' ? styles.activeSegment : ''}`}
                onClick={() => handleSelectDensity('compact')}
              >
                Compatta
              </button>
              <button
                type="button"
                class={`${styles.segmentBtn} ${config.gridDensity === 'normal' ? styles.activeSegment : ''}`}
                onClick={() => handleSelectDensity('normal')}
              >
                Normale (Default)
              </button>
              <button
                type="button"
                class={`${styles.segmentBtn} ${config.gridDensity === 'spaced' ? styles.activeSegment : ''}`}
                onClick={() => handleSelectDensity('spaced')}
              >
                Ampia
              </button>
            </div>
          </div>

          {/* Default Search Engine Section */}
          <div class={styles.sectionGroup}>
            <label class={styles.sectionLabel}>
              <Search size={15} class={styles.sectionIcon} />
              Motore di Ricerca Predefinito
            </label>
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
            <label class={styles.sectionLabel}>
              <Download size={15} class={styles.sectionIcon} />
              Backup & Sincronizzazione Dati
            </label>
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
                <span>Esporta / Importa Backup JSON</span>
              </button>
            </div>
          </div>
        </div>

        <div class={styles.modalFooter}>
          <button type="button" class={styles.saveBtn} onClick={onClose}>
            Salva e Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
