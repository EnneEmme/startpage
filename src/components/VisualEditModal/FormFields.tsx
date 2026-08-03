import { ICON_FALLBACK_URL } from '../../engine';
import { LinkIcon } from '../LinkIcon';
import type { IconEntry } from '../iconRegistry';
import { ICON_LIST } from '../iconRegistry';
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
  filteredIcons: IconEntry[];
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
        <label class={styles.label}>Link Title</label>
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
          <label class={styles.label}>Website URL</label>
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
            <label class={styles.label}>Site Base URL</label>
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
            <label class={styles.label}>Search Parameter (Query Template)</label>
            <input
              type="text"
              class={styles.input}
              placeholder="e.g. /results?search_query={q}  or  /search?q={q}"
              value={searchTemplate}
              onInput={e => setSearchTemplate((e.target as HTMLInputElement).value)}
              required
            />
            <span class={styles.helperText}>
              Enter the path with the <code>{"{"}q{"}"}</code> (e.g. <code>/results?search_query={"{"}q{"}"}</code>).
            </span>
          </div>
        </>
      )}

      {/* Aliases */}
      <div class={styles.fieldGroup}>
        <label class={styles.label}>Keyboard Shortcuts / Aliases (comma separated)</label>
        <input
          type="text"
          class={styles.input}
          placeholder="e.g. g, gh, github, yt"
          value={aliases}
          onInput={e => setAliases((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Icon Picker Dropdown */}
      <div class={styles.fieldGroup}>
        <label class={styles.label}>Custom Icon</label>
        <div class={styles.iconDropdownWrapper}>
          <div class={styles.iconInputTriggerRow}>
            <div class={styles.iconLiveBadge}>
              <LinkIcon
                url={url || ICON_FALLBACK_URL}
                iconSpec={icon || undefined}
                title={title || 'Preview'}
                size={20}
              />
            </div>
            <input
              type="text"
              class={styles.input}
              placeholder="Lucide, Image URL or SVG Code <svg>..."
              value={icon}
              onInput={e => setIcon((e.target as HTMLInputElement).value)}
            />
            <button
              type="button"
              class={styles.iconPickerToggleBtn}
              onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
              aria-expanded={isIconDropdownOpen}
              aria-haspopup="listbox"
            >
              Pick ({ICON_LIST.length} Lucide) ▼
            </button>
          </div>

          {isIconDropdownOpen && (
            <div class={`${styles.iconDropdownMenu} fade-in`}>
              <div class={styles.iconSearchHeader}>
                <input
                  type="text"
                  class={styles.iconSearchInput}
                  placeholder={`Search ${ICON_LIST.length} Lucide icons (e.g. Coffee, Rocket, Shield)...`}
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
                      No Lucide icon found for "{iconSearchQuery}". You can also paste a direct image URL.
                    </div>
                  )
                ) : (
                  <div style={{ gridColumn: '1 / -1', padding: '1.25rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.6' }}>
                    🔍 Type in the field above to search <strong>{ICON_LIST.length} icone Lucide</strong> (e.g. <em>coffee, rocket, mail, shield, code, music</em>). Site icons are resolved automatically via favicon.
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
