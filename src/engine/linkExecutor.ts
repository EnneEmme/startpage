/**
 * Link Execution & Bookmarklet Script Engine
 * Handles opening standard URLs, dynamic Unimib course/exam links, and executing custom JavaScript bookmarklets.
 */

import { LinkItem } from '../types/startpage';
import { resolveDynamicUrl } from './dynamicEvaluator';
import { rankStorage } from './rankStorage';

/**
 * Determines whether a link item is a custom JavaScript script or bookmarklet.
 */
export const isBookmarkletOrScript = (link: LinkItem): boolean => {
  if (link.isScript) return true;
  const rawUrl = (link.url || '').trim().toLowerCase();
  return rawUrl.startsWith('javascript:');
};

/**
 * Extracts executable JavaScript code from a LinkItem.
 */
export const extractScriptCode = (link: LinkItem): string => {
  if (link.scriptContent && link.scriptContent.trim()) {
    return link.scriptContent.trim();
  }
  const rawUrl = (link.url || '').trim();
  if (rawUrl.toLowerCase().startsWith('javascript:')) {
    const rawSnippet = rawUrl.substring(11).trim();
    try {
      return decodeURIComponent(rawSnippet);
    } catch {
      return rawSnippet;
    }
  }
  return rawUrl;
};

/**
 * Central Link Executor:
 * Resolves dynamic URLs (Unimib orari/esami & dates), records usage ranking,
 * and either executes JS bookmarklets or navigates to standard web URLs.
 */
export const executeLink = (link: LinkItem, targetWindow: '_blank' | '_self' = '_self'): void => {
  if (!link) return;

  // Record usage click
  rankStorage.recordUsage(link.id);

  // 1. Resolve dynamic URL (handles unimib_orari, unimib_esami, {{DD-MM-YYYY}}, {{YYYY-MM-DD}})
  const targetUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);

  // 2. Check if script or bookmarklet
  if (isBookmarkletOrScript(link) || (targetUrl && targetUrl.trim().toLowerCase().startsWith('javascript:'))) {
    const code = extractScriptCode(link);
    try {
      // Execute custom JS snippet safely in active browser context
      const scriptFn = new Function(code);
      scriptFn();
    } catch (err) {
      console.error('[LinkExecutor] Script execution error:', err);
      try {
        window.location.href = `javascript:${encodeURI(code)}`;
      } catch (fallbackErr) {
        console.error('[LinkExecutor] Fallback script execution error:', fallbackErr);
      }
    }
    return;
  }

  // 3. Standard / Dynamic Web URL navigation
  if (targetUrl) {
    if (targetWindow === '_blank') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
    }
  }
};
