import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { Search, Globe, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-preact';
import { fuzzySearchEngine } from '../engine/fuzzySearch';
import { resolveDynamicUrl } from '../engine/dynamicEvaluator';
import { rankStorage } from '../engine/rankStorage';
import { LinkItem, SearchResult } from '../types/startpage';
import { LinkIcon } from './LinkIcon';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  initialQuery?: string;
  links: LinkItem[];
  onClose: () => void;
}

export const SearchModal = ({
  isOpen,
  initialQuery = '',
  links,
  onClose
}: SearchModalProps) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fuzzySearchEngine.setLinks(links);
  }, [links]);

  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        if (initialQuery) {
          inputRef.current?.setSelectionRange(initialQuery.length, initialQuery.length);
        }
      }, 50);
    }
  }, [isOpen, initialQuery]);

  if (!isOpen) return null;

  const parsedPrefix = fuzzySearchEngine.parseCommandPrefix(query);
  const searchResults: SearchResult[] = parsedPrefix.isPrefixCommand
    ? []
    : fuzzySearchEngine.search(query);

  const handleSelectLink = (link: LinkItem) => {
    rankStorage.recordUsage(link.id);
    const targetUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);
    onClose();
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const handleExecuteCommandPrefix = () => {
    if (parsedPrefix.redirectUrl) {
      onClose();
      window.location.href = parsedPrefix.redirectUrl;
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
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
      if (parsedPrefix.isPrefixCommand) {
        handleExecuteCommandPrefix();
      } else if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleSelectLink(searchResults[selectedIndex].item);
      } else if (query.trim()) {
        // Fallback Google search if no fuzzy match
        onClose();
        window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
      }
    }

    // Numerical shortcut key bindings Ctrl+1..9 or Alt+1..9
    if ((e.ctrlKey || e.altKey) && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const idx = parseInt(e.key, 10) - 1;
      if (searchResults[idx]) {
        handleSelectLink(searchResults[idx].item);
      }
    }
  };

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.inputWrapper}>
          <Search size={22} class={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            class={styles.searchInput}
            placeholder="Type link name, alias, or command (e.g. g meteo)..."
            value={query}
            onInput={e => {
              setQuery((e.target as HTMLInputElement).value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
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

        {/* Fuzzy Search Results List */}
        {!parsedPrefix.isPrefixCommand && searchResults.length > 0 && (
          <div class={styles.resultsList}>
            {searchResults.map((res, index) => {
              const item = res.item;
              const targetUrl = resolveDynamicUrl(item.url, item.dynamicUrlRule);
              const isSelected = index === selectedIndex;
              const shortcutBadge = index < 9 ? `Ctrl+${index + 1}` : null;

              return (
                <div
                  key={item.id}
                  class={`${styles.resultRow} ${isSelected ? styles.selected : ''}`}
                  onClick={() => handleSelectLink(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div class={styles.iconBox}>
                    <LinkIcon
                      url={targetUrl || 'https://example.com'}
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
                      {res.matchedAlias && (
                        <span class={styles.aliasMatched}>alias: {res.matchedAlias}</span>
                      )}
                    </div>
                    <span class={styles.resultUrl}>{targetUrl || 'Dynamic Link'}</span>
                  </div>

                  {shortcutBadge && (
                    <span class={styles.shortcutBadge}>{shortcutBadge}</span>
                  )}
                  {isSelected && <CornerDownLeft size={16} class={styles.enterHint} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty Search Query / Fallback Search Hint */}
        {!parsedPrefix.isPrefixCommand && query.trim() && searchResults.length === 0 && (
          <div
            class={`${styles.resultRow} ${styles.fallbackRow}`}
            onClick={() => {
              onClose();
              window.location.href = `https://www.google.com/search?q=${encodeURIComponent(query.trim())}`;
            }}
          >
            <Globe size={20} />
            <div class={styles.resultInfo}>
              <span class={styles.resultTitle}>
                Search Google for "<strong>{query.trim()}</strong>"
              </span>
            </div>
            <ArrowRight size={16} />
          </div>
        )}
      </div>
    </div>
  );
};
