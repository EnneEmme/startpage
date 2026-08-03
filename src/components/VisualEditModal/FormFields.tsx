import { ICON_FALLBACK_URL } from '../../engine';
import { LinkIcon } from '../LinkIcon';
import type { IconEntry } from '../iconRegistry';
import { ICON_LIST } from '../iconRegistry';
import styles from './VisualEditModal.module.css';

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
        <label class={styles.label} for="vem-title">Link Title</label>
        <input
          id="vem-title"
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
          <label class={styles.label} for="vem-url">Website URL</label>
          <input
            id="vem-url"
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
            <label class={styles.label} for="vem-search-base-url">Site Base URL</label>
            <input
              id="vem-search-base-url"
              type="text"
              class={styles.input}
              placeholder="e.g. https://www.youtube.com"
              value={url}
              onInput={e => setUrl((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <div class={styles.fieldGroup}>
            <label class={styles.label} for="vem-search-template">Search Parameter (Query Template)</label>
            <input
              id="vem-search-template"
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
        <label class={styles.label} for="vem-aliases">Keyboard Shortcuts / Aliases (comma separated)</label>
        <input
          id="vem-aliases"
          type="text"
          class={styles.input}
          placeholder="e.g. g, gh, github, yt"
          value={aliases}
          onInput={e => setAliases((e.target as HTMLInputElement).value)}
        />
      </div>

      {/* Icon Picker Dropdown */}
      <div class={styles.fieldGroup}>
        <label class={styles.label} for="vem-icon">Custom Icon</label>
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
              id="vem-icon"
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
                  aria-label="Search Lucide icons"
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
                    <div class={styles.pickerEmpty}>
                      No Lucide icon found for "{iconSearchQuery}". You can also paste a direct image URL.
                    </div>
                  )
                ) : (
                  <div class={styles.pickerEmpty}>
                    🔍 Type in the field above to search <strong>{ICON_LIST.length} Lucide icons</strong> (e.g. <em>coffee, rocket, mail, shield, code, music</em>). Site icons are resolved automatically via favicon.
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
