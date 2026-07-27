import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Check, Sliders, Palette, LayoutGrid, Type, Search, Download, Eye, Sparkles } from 'lucide-preact';
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
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div class={styles.modalHeader}>
          <div class={styles.headerTitleGroup}>
            <div class={styles.headerIconBadge}>
              <Sliders size={18} class={styles.headerIcon} />
            </div>
            <div>
              <h2 class={styles.modalTitle}>Impostazioni & Personalizzazione</h2>
              <span class={styles.modalSubtitle}>Tema visivo, griglia, caratteri e preferenze</span>
            </div>
          </div>
          <button class={styles.closeBtn} onClick={onClose} type="button" title="Chiudi (Esc)">
            <X size={18} />
          </button>
        </div>

        <div class={styles.modalContent}>
          {/* Accent Color Theme Section */}
          <div class={styles.sectionGroup}>
            <div class={styles.sectionHeaderRow}>
              <label class={styles.sectionLabel}>
                <Palette size={15} class={styles.sectionIcon} />
                Colore d'Accento Primario
              </label>
              <span class={styles.sectionSubtext}>Applica la palette a pulsanti, selezioni ed evidenziatori</span>
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
                Densità Griglia Colonne
              </label>
              <span class={styles.sectionSubtext}>
                {config.gridDensity === 'compact' && '⚡ Ultra Compatta (155px min - fino a 7-9 colonne per riga)'}
                {config.gridDensity === 'normal' && '✨ Normale Predefinita (185px min - fino a 5-6 colonne per riga)'}
                {config.gridDensity === 'spaced' && '🖥️ Ampia Spaziata (230px min - vista larga per monitor grandi)'}
              </span>
            </div>

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

          {/* Font Size Section */}
          <div class={styles.sectionGroup}>
            <div class={styles.sectionHeaderRow}>
              <label class={styles.sectionLabel}>
                <Type size={15} class={styles.sectionIcon} />
                Dimensione Testo
              </label>
              <span class={styles.sectionSubtext}>Regola la scala tipografica dell'intera interfaccia</span>
            </div>

            <div class={styles.segmentedControl}>
              <button
                type="button"
                class={`${styles.segmentBtn} ${config.fontSize === 'small' ? styles.activeSegment : ''}`}
                onClick={() => handleSelectFontSize('small')}
              >
                Piccolo
              </button>
              <button
                type="button"
                class={`${styles.segmentBtn} ${(config.fontSize === 'medium' || !config.fontSize) ? styles.activeSegment : ''}`}
                onClick={() => handleSelectFontSize('medium')}
              >
                Medio
              </button>
              <button
                type="button"
                class={`${styles.segmentBtn} ${config.fontSize === 'large' ? styles.activeSegment : ''}`}
                onClick={() => handleSelectFontSize('large')}
              >
                Grande
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
                Visibilità Badge Scorciatoie (Alias)
              </label>
              <span class={styles.sectionSubtext}>
                Scegli se mostrare i badge alias solo alla pressione del tasto Alt o mantenerli sempre visibili
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
                📌 Sempre Visibili
              </button>
            </div>
          </div>

          {/* Default Search Engine Section */}
          <div class={styles.sectionGroup}>
            <div class={styles.sectionHeaderRow}>
              <label class={styles.sectionLabel}>
                <Search size={15} class={styles.sectionIcon} />
                Motore di Ricerca Predefinito
              </label>
              <span class={styles.sectionSubtext}>Utilizzato per ricerche web generali da barra centrale</span>
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
                Backup & Sincronizzazione Dati
              </label>
              <span class={styles.sectionSubtext}>Esporta o importa link e preferenze in formato JSON</span>
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
