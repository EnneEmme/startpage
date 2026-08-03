/**
 * Link Execution & Bookmarklet Script Engine
 * Handles opening standard URLs, dynamic Unimib course/exam links, and executing custom JavaScript bookmarklets.
 *
 * Security: custom scripts run ONLY via `new Function` (never through a
 * `javascript:` URL navigation fallback) and, when a UI confirm handler is
 * registered, only after an explicit per-script-hash user consent
 * (see scriptConsent.ts).
 */

import type { LinkItem } from '../types/startpage';
import { resolveDynamicUrl } from './dynamicEvaluator';
import { rankStorage } from './rankStorage';
import { grantConsent, hasConsent } from './scriptConsent';

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
    } catch (err) {
      console.warn('[LinkExecutor] Malformed URI encoding in bookmarklet, using raw snippet:', err);
      return rawSnippet;
    }
  }
  return rawUrl;
};

/**
 * UI-layer confirm gate for custom scripts (Promise-based, e.g. the themed
 * ConfirmDialog). Registered once at app bootstrap (main.tsx). When absent
 * (pure-engine contexts, e.g. unit tests) scripts execute directly: the
 * consent gate is a UI concern by design, not an engine invariant
 * (the engine API stays synchronous and UI-free).
 */
export type ScriptConfirmHandler = (link: LinkItem) => Promise<boolean>;
let scriptConfirmHandler: ScriptConfirmHandler | null = null;
export const setScriptConfirmHandler = (handler: ScriptConfirmHandler | null): void => {
  scriptConfirmHandler = handler;
};

/**
 * Runs the snippet exactly once. Returns false on error — there is NO
 * `javascript:` URL navigation fallback (it would bypass the consent gate
 * and double-execute code paths).
 */
const runScriptCode = (code: string): boolean => {
  try {
    const scriptFn = new Function(code);
    scriptFn();
    return true;
  } catch (err) {
    console.error('[LinkExecutor] Script execution error:', err);
    return false;
  }
};

/**
 * Central Link Executor:
 * Resolves dynamic URLs (Unimib orari/esami & dates), records usage ranking,
 * and either executes JS bookmarklets or navigates to standard web URLs.
 *
 * Returns `true` when the click was fully handled (navigation performed,
 * script executed, or script-consent flow started) so the caller must
 * `preventDefault()` on the anchor to avoid double navigation.
 * Returns `false` when there was nothing to do.
 */
export const executeLink = (link: LinkItem, targetWindow: '_blank' | '_self' = '_self'): boolean => {
  if (!link) return false;

  // Record usage click
  rankStorage.recordUsage(link.id);

  // 1. Resolve dynamic URL (handles unimib_orari, unimib_esami, {{DD-MM-YYYY}}, {{YYYY-MM-DD}})
  const targetUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);

  // 2. Check if script or bookmarklet
  if (isBookmarkletOrScript(link) || (targetUrl && targetUrl.trim().toLowerCase().startsWith('javascript:'))) {
    const code = extractScriptCode(link);

    // Consent gate: without a persisted per-script-hash consent, ask through
    // the registered UI handler. Fire-and-forget: the synchronous signature
    // is preserved (callers rely on the boolean return) and execution
    // resumes on approval, after persisting the consent.
    if (!hasConsent(link) && scriptConfirmHandler) {
      Promise.resolve(scriptConfirmHandler(link))
        .then(ok => {
          if (ok) {
            grantConsent(link);
            runScriptCode(code);
          }
        })
        .catch(err => console.error('[LinkExecutor] Script confirm handler error:', err));
      return true;
    }

    return runScriptCode(code);
  }

  // 3. Standard / Dynamic Web URL navigation
  if (targetUrl) {
    if (targetWindow === '_blank') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = targetUrl;
    }
    return true;
  }

  return false;
};
