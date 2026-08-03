/**
 * Script Consent Engine
 * Persisted, per-script user consent for executing custom JavaScript
 * bookmarklets / script links.
 *
 * Trust model: a custom script link may run only after an explicit user
 * confirmation, and the consent is bound to a lightweight hash of the
 * persisted script body — ANY edit to the script invalidates the consent and
 * triggers a fresh confirmation.
 *
 * Storage: localStorage `startpage_script_consents` → JSON map `{linkId: hash}`.
 * Hash: DJB2 + script length (zero dependencies). This is a tamper-evident
 * tripwire against accidental or backup-driven edits, NOT a defense against
 * an attacker with localStorage write access (who could rewrite this map
 * anyway) — hence no SHA-256, by design.
 */

import type { LinkItem } from '../types/startpage';

const CONSENTS_STORAGE_KEY = 'startpage_script_consents';

/**
 * Identity of the executable script as persisted: `scriptContent` wins (the
 * url is just a `javascript:` stub in that case), otherwise the raw url
 * (bookmarklet form). Hashed as stored (no URI decoding): any persisted edit
 * flips the hash, failing safe towards re-asking.
 */
const scriptIdentity = (link: LinkItem): string => {
  const content = link.scriptContent?.trim();
  return content || (link.url || '').trim();
};

/** DJB2 (32-bit) + length, base36-encoded. Deterministic and dependency-free. */
export const hashScriptIdentity = (code: string): string => {
  let hash = 5381;
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) + hash + code.charCodeAt(i)) | 0;
  }
  return `djb2:${(hash >>> 0).toString(36)}:${code.length}`;
};

const readConsents = (): Record<string, string> => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CONSENTS_STORAGE_KEY) || '{}');
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed as Record<string, string>
      : {};
  } catch (err) {
    console.warn('[ScriptConsent] Failed to read stored consents, starting empty:', err);
    return {};
  }
};

const writeConsents = (consents: Record<string, string>): void => {
  try {
    localStorage.setItem(CONSENTS_STORAGE_KEY, JSON.stringify(consents));
  } catch (err) {
    /* storage full/private mode: consent stays in-memory-less, re-asked next time */
    console.warn('[ScriptConsent] Failed to persist consents:', err);
  }
};

/** True when the user already confirmed THIS exact script body for this link. */
export const hasConsent = (link: LinkItem): boolean => {
  if (!link?.id) return false;
  return readConsents()[link.id] === hashScriptIdentity(scriptIdentity(link));
};

/** Persist consent for THIS exact script body; any later edit invalidates it. */
export const grantConsent = (link: LinkItem): void => {
  if (!link?.id) return;
  const consents = readConsents();
  consents[link.id] = hashScriptIdentity(scriptIdentity(link));
  writeConsents(consents);
};

/** Drop every stored consent (e.g. a security reset). */
export const clearConsents = (): void => {
  try {
    localStorage.removeItem(CONSENTS_STORAGE_KEY);
  } catch (err) {
    /* best-effort */
    console.warn('[ScriptConsent] Failed to clear stored consents:', err);
  }
};
