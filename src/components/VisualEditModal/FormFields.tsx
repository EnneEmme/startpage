import { h, Fragment } from 'preact';
import { LinkIcon } from '../LinkIcon';
import styles from '../VisualEditModal.module.css';

interface FormFieldsProps {
  activeTab: 'web' | 'script' | 'search';
  title: string;
  setTitle: (val: string) => void;
  url: string;
  setUrl: (val: string) => void;
  searchTemplate: string;
  setSearchTemplate: (val: string) => void;
  aliases: string;
  setAliases: (val: string) => void;
  icon: string;
  setIcon: (val: string) => void;
  isIconDropdownOpen: boolean;
  setIsIconDropdownOpen: (val: boolean) => void;
  iconSearchQuery: string;
  setIconSearchQuery: (val: string) => void;
  filteredIcons: any[];
}

export const FormFields = ({
  activeTab, title, setTitle, url, setUrl, searchTemplate, setSearchTemplate,
  aliases, setAliases, icon, setIcon, isIconDropdownOpen, setIsIconDropdownOpen,
  iconSearchQuery, setIconSearchQuery, filteredIcons
}: FormFieldsProps) => {
  const iconQueryTrimmed = iconSearchQuery.trim().toLowerCase();

  return (
    <>
      {/* Title Input */}
      <div class={styles.fieldGroup}>
        <label class={styles.label}>Titolo del Link</label>
        <input
          type="text"
          class={styles.input}
          placeholder="e.g. GitHub, ChatGPT, Mail..."
          value={title}
          onInput={e => setTitle((e.target as HTMLInputElement).value)}
          required
        />
      </div>

      {/* Dynamic Field Based on Selected Mode */}
      {activeTab === 'web' && (
        <div class={styles.fieldGroup}>
          <label class={styles.label}>URL Sito Web</label>
          <input
            type="text"
            class={styles.input}
            placeholder="e.g. https://www.youtube.com"
            value={url}
            onInput={e => setUrl((e.target as HTMLInputElement).value)}
            required
          />
        </div>
      )}

      {activeTab === 'search' && (
        <>
          <div class={styles.fieldGroup}>
            <label class={styles.label}>URL Base del Sito</label>
            <input
              type="text"
              class={styles.input}
              placeholder="e.g. https://www.youtube.com"
              value={url}
              onInput={e => setUrl((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <div class={styles.fieldGroup}>
            <label class={styles.label}>Parametro di Ricerca (Search Query Template)</label>
            <input
              type="text"
              class={styles.input}
              placeholder="es. /results?search_query={q}  oppure  /search?q={q}"
              value={searchTemplate}
              onInput={e => setSearchTemplate((e.target as HTMLInputElement).value)}
              required
            />
            <span class={styles.helperText}>
              Inserisci il percorso con il segnaposto <code>{"{"}q{"}"}</code> (es. <code>/results?search_query={"{"}q{"}"}</code>).
            </span>
          </div>
        </>
      )}

      {/* Aliases */}
      <div class={styles.fieldGroup}>
        <label class={styles.label}>Scorciatoie / Alias da Tastiera (separati da virgola)</label>
        <input
          type="text"
          class={styles.input}
          placeholder="es. g, gh, github, yt"
          value={aliases}
          onInput={e => setAliases((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Icon Picker Dropdown */}
      <div class={styles.fieldGroup}>
        <label class={styles.label}>Icona Personalizzata</label>
        <div class={styles.iconDropdownWrapper}>
          <div class={styles.iconInputTriggerRow}>
            <div class={styles.iconLiveBadge}>
              <LinkIcon
                url={url || 'https://example.com'}
                iconSpec={icon || undefined}
                title={title || 'Preview'}
                size={20}
              />
            </div>
            <input
              type="text"
              class={styles.input}
              placeholder="Lucide, URL Immagine o Codice SVG <svg>..."
              value={icon}
              onInput={e => setIcon((e.target as HTMLInputElement).value)}
            />
            <button
              type="button"
              class={styles.iconPickerToggleBtn}
              onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
            >
              Scegli (1400+ Lucide) ▼
            </button>
          </div>

          {isIconDropdownOpen && (
            <div class={`${styles.iconDropdownMenu} fade-in`}>
              <div class={styles.iconSearchHeader}>
                <input
                  type="text"
                  class={styles.iconSearchInput}
                  placeholder="Cerca tra oltre 1400+ icone Lucide (es. Coffee, Github, Shield)..."
                  value={iconSearchQuery}
                  onInput={e => setIconSearchQuery((e.target as HTMLInputElement).value)}
                  autoFocus
                />
              </div>
              <div class={styles.iconDropdownGrid}>
                {iconQueryTrimmed ? (
                  filteredIcons.length > 0 ? (
                    filteredIcons.map(item => {
                      const IconComp = item.icon;
                      const isSelected = icon === item.spec;

                      return (
                        <button
                          key={item.spec}
                          type="button"
                          class={`${styles.iconDropdownItem} ${isSelected ? styles.selectedIconItem : ''}`}
                          onClick={() => {
                            setIcon(item.spec);
                            setIsIconDropdownOpen(false);
                          }}
                          title={item.name}
                        >
                          {IconComp && <IconComp size={15} />}
                          <span class={styles.iconItemName}>{item.name}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div style={{ gridColumn: '1 / -1', padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      Nessuna icona Lucide trovata per "{iconSearchQuery}". Puoi anche inserire un URL immagine diretto.
                    </div>
                  )
                ) : (
                  <div style={{ gridColumn: '1 / -1', padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.6' }}>
                    🔍 Digita nel campo in alto per cercare tra oltre <strong>1400+ icone Lucide</strong> (es. <em>coffee, github, mail, shield, code, music</em>)...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
