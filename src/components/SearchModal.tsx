import { memo } from 'preact/compat';
import { useState, useEffect, useRef, useMemo, useCallback } from 'preact/hooks';
import { Search, Globe, ArrowRight, CornerDownLeft, Sparkles, X } from 'lucide-preact';
import { fuzzySearchEngine, resolveDynamicUrl, executeLink, getEngineFallback, ICON_FALLBACK_URL } from '../engine';
import { themeConfigSignal } from '../stores';
import type { LinkItem, SearchResult } from '../types/startpage';
import { LinkIcon } from './LinkIcon';
import { Modal } from './Modals/Modal';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  links: LinkItem[];
  onClose: () => void;
}

const MAX_SEARCH_RESULTS = 10;

/** Cross-platform label for the Cmd/Ctrl+Enter shortcut */
const MODIFIER_ENTER_HINT =
  typeof navigator !== 'undefined' && /mac/i.test(navigator.platform) ? '⌘↵' : 'Ctrl+↵';

/** Stable ids keep aria-activedescendant valid across re-renders */
const optionId = (linkId: string) => `search-opt-${linkId}`;
const LISTBOX_ID = 'search-results-listbox';

interface SearchResultRowProps {
  result: SearchResult;
  selected: boolean;
  onSelect: (link: LinkItem) => void;
}

/** Memoized row: only re-renders when its own selection state/result changes */
const SearchResultRow = memo(({ result, selected, onSelect }: SearchResultRowProps) => {
  const item = result.item;
  const targetUrl = resolveDynamicUrl(item.url, item.dynamicUrlRule);

  return (
    <div
      id={optionId(item.id)}
      role="option"
      aria-selected={selected}
      class={`${styles.resultRow} ${selected ? styles.selected : ''}`}
      onClick={() => onSelect(item)}
    >
      <div class={styles.iconBox}>
        <LinkIcon
          url={targetUrl || ICON_FALLBACK_URL}
          iconSpec={item.icon}
          title={item.title}
          size={20}
        />
      </div>

      <div class={styles.resultInfo}>
        <div class={styles.titleLine}>
          <span class={styles.resultTitle}>{item.title}</span>
          {item.category && (
            <span class={styles.categoryBadge}>{item.category}</span>
          )}
          {result.matchedAlias && (
            <span class={styles.aliasMatched}>alias: {result.matchedAlias}</span>
          )}
        </div>
        <span class={styles.resultUrl}>{targetUrl || 'Dynamic Link'}</span>
      </div>

      {selected && <CornerDownLeft size={16} class={styles.enterHint} />}
    </div>
  );
});

export const SearchModal = ({
  isOpen,
  initialQuery = '',
  links,
  onClose
}: SearchModalProps) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const selectionTimerRef = useRef<number | null>(null);

  // No dangling timeout if the modal closes mid-flow
  useEffect(
    () => () => {
      if (selectionTimerRef.current !== null) {
        window.clearTimeout(selectionTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    fuzzySearchEngine.setLinks(links);
  }, [links]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery(initialQuery);
    setSelectedIndex(0);

    // Single autofocus strategy: Modal.tsx focuses the input via its
    // [autofocus] attribute — no manual focus() here. We only move the
    // caret to the end of a pre-filled query so typing continues naturally.
    if (initialQuery && inputRef.current) {
      inputRef.current.setSelectionRange(initialQuery.length, initialQuery.length);
    }
  }, [isOpen, initialQuery]);

  // Compute search only when query/links actually change (not on hover re-renders)
  const parsedPrefix = useMemo(
    () => fuzzySearchEngine.parseCommandPrefix(query),
    [query]
  );
  const searchResults: SearchResult[] = useMemo(
    () => (parsedPrefix.isPrefixCommand ? [] : fuzzySearchEngine.search(query).slice(0, MAX_SEARCH_RESULTS)),
    // links is the engine's data source (synced via effect above)
    [query, links, parsedPrefix.isPrefixCommand]
  );

  const handleSelectLink = useCallback((link: LinkItem) => {
    onClose();
    executeLink(link);
  }, [onClose]);

  // Note: pointer hover intentionally does NOT change selectedIndex — a static
  // cursor resting over the list would otherwise steal the keyboard selection
  // while typing (hover shows CSS affordance only; click explicitly opens).

  /** Fallback web search honoring the user's configured default engine */
  const getFallback = (rawQuery: string) =>
    getEngineFallback(themeConfigSignal.value.defaultSearchEngine || 'g', rawQuery.trim());

  // Keep the active option visible while navigating with ArrowUp/ArrowDown.
  // Feature-detected: jsdom does not implement scrollIntoView.
  useEffect(() => {
    if (!isOpen) return;
    const el = listRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, selectedIndex, searchResults]);

  if (!isOpen) return null;

  // ARIA combobox wiring: the input owns the popup listbox and points at the
  // active option via aria-activedescendant (focus stays on the input).
  const isListboxOpen = !parsedPrefix.isPrefixCommand && searchResults.length > 0;
  const selectedResult = searchResults[selectedIndex];
  const activeOptionId = isListboxOpen && selectedResult ? optionId(selectedResult.item.id) : undefined;
  const liveAnnouncement = parsedPrefix.isPrefixCommand
    ? ''
    : searchResults.length > 0
      ? `${searchResults.length} result${searchResults.length === 1 ? '' : 's'} available.`
      : (query.trim() ? 'No results found.' : '');

  const handleExecuteCommandPrefix = () => {
    if (parsedPrefix.redirectUrl) {
      onClose();
      window.location.href = parsedPrefix.redirectUrl;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      // Trap Tab only when a real completion can be applied; otherwise let it
      // propagate so the clear button stays reachable from the keyboard.
      const candidate = !parsedPrefix.isPrefixCommand ? searchResults[selectedIndex]?.item : undefined;
      if (candidate && candidate.title !== query) {
        e.preventDefault();
        setQuery(candidate.title);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex(prev => (prev + 1) % searchResults.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();

      // Cmd+Enter or Ctrl+Enter: switch to site query mode for the selected link card
      if ((e.metaKey || e.ctrlKey) && !parsedPrefix.isPrefixCommand && searchResults.length > 0 && searchResults[selectedIndex]) {
        const item = searchResults[selectedIndex].item;
        let prefixKey = item.aliases && item.aliases.length > 0 ? item.aliases[0] : '';
        if (!prefixKey) {
          const lowerUrl = (item.url || '').toLowerCase();
          if (lowerUrl.includes('youtube.com')) prefixKey = 'yt';
          else if (lowerUrl.includes('github.com')) prefixKey = 'gh';
          else if (lowerUrl.includes('google.com')) prefixKey = 'g';
          else if (lowerUrl.includes('wikipedia.org')) prefixKey = 'w';
          else if (lowerUrl.includes('duckduckgo.com')) prefixKey = 'ddg';
          else prefixKey = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        }

        const newQuery = `${prefixKey} `;
        setQuery(newQuery);
        setSelectedIndex(0);

        // The input already has focus (the keydown came from it): just move
        // the caret past the prefix once the new value is committed.
        if (selectionTimerRef.current !== null) {
          window.clearTimeout(selectionTimerRef.current);
        }
        selectionTimerRef.current = window.setTimeout(() => {
          selectionTimerRef.current = null;
          inputRef.current?.setSelectionRange(newQuery.length, newQuery.length);
        }, 10);
        return;
      }

      if (parsedPrefix.isPrefixCommand) {
        handleExecuteCommandPrefix();
      } else if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleSelectLink(searchResults[selectedIndex].item);
      } else if (query.trim()) {
        // Fallback web search on the configured default engine
        onClose();
        window.location.href = getFallback(query).url;
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      hideHeader={true}
      ariaLabel="Search links and commands"
      maxWidth="660px"
    >
      <div class={styles.searchModalInner}>
        {/* Polite live region: announces the result count as the query changes */}
        <div class={styles.srOnly} role="status" aria-live="polite">
          {liveAnnouncement}
        </div>
        <div class={styles.inputWrapper}>
          <Search size={20} class={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            name="search-query"
            role="combobox"
            aria-expanded={isListboxOpen}
            aria-controls={LISTBOX_ID}
            aria-activedescendant={activeOptionId}
            aria-autocomplete="list"
            aria-label="Search links, aliases, or commands"
            autoFocus={true}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellcheck={false}
            class={styles.searchInput}
            placeholder="Type link name, alias, or command (e.g. g meteo)..."
            value={query}
            onInput={e => {
              setQuery((e.target as HTMLInputElement).value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          {query.length > 0 && (
            <button
              type="button"
              class={styles.clearBtn}
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
                if (inputRef.current) inputRef.current.focus();
              }}
              title="Clear search"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          {parsedPrefix.isPrefixCommand && (
            <span class={styles.commandBadge}>
              <Sparkles size={14} />
              {parsedPrefix.engineName}
            </span>
          )}
        </div>

        {/* Command Palette Redirect Preview */}
        {parsedPrefix.isPrefixCommand && (
          <div
            class={`${styles.resultRow} ${styles.prefixRow}`}
            onClick={handleExecuteCommandPrefix}
          >
            <Globe size={20} class={styles.prefixIcon} />
            <div class={styles.resultInfo}>
              <span class={styles.resultTitle}>
                Search {parsedPrefix.engineName}: <strong>{parsedPrefix.query}</strong>
              </span>
              <span class={styles.resultUrl}>{parsedPrefix.redirectUrl}</span>
            </div>
            <CornerDownLeft size={16} class={styles.enterHint} />
          </div>
        )}

        {/* Fuzzy Search Results List (capped at MAX_SEARCH_RESULTS) */}
        {!parsedPrefix.isPrefixCommand && searchResults.length > 0 && (
          <div class={styles.resultsList} role="listbox" id={LISTBOX_ID} aria-label="Search results" ref={listRef}>
            {searchResults.map((res, index) => (
              <SearchResultRow
                key={res.item.id}
                result={res}
                selected={index === selectedIndex}
                onSelect={handleSelectLink}
              />
            ))}
          </div>
        )}

        {/* Empty Search Query / Fallback Search Hint */}
        {!parsedPrefix.isPrefixCommand && query.trim() && searchResults.length === 0 && (
          <div
            class={`${styles.resultRow} ${styles.fallbackRow}`}
            onClick={() => {
              onClose();
              window.location.href = getFallback(query).url;
            }}
          >
            <Globe size={20} />
            <div class={styles.resultInfo}>
              <span class={styles.resultTitle}>
                Search {getFallback(query).name} for "<strong>{query.trim()}</strong>"
              </span>
            </div>
            <ArrowRight size={16} />
          </div>
        )}

        {/* Minimalist Footer Keyboard Hints */}
        <div class={styles.footerHints}>
          <span class={styles.hintItem}>
            <kbd class={styles.hintKbd}>↑</kbd>
            <kbd class={styles.hintKbd}>↓</kbd> navigate
          </span>
          <span class={styles.hintItem}>
            <kbd class={styles.hintKbd}>Tab</kbd> complete
          </span>
          <span class={styles.hintItem}>
            <kbd class={styles.hintKbd}>↵</kbd> open
          </span>
          <span class={styles.hintItem}>
            <kbd class={styles.hintKbd}>{MODIFIER_ENTER_HINT}</kbd> search site
          </span>
          <span class={styles.hintItem}>
            <kbd class={styles.hintKbd}>Esc</kbd> dismiss
          </span>
        </div>
      </div>
    </Modal>
  );
};
