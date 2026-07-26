/**
 * Multi-Tiered Icon Resolver Engine
 * Supports Domain Favicon Auto-fetching, Lucide icon names, and Custom Image URLs.
 */

export interface ResolvedIcon {
  type: 'favicon' | 'lucide' | 'custom_url';
  src: string;
}

export const extractDomain = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return '';
  }
};

export const getFaviconUrl = (url: string): string => {
  const domain = extractDomain(url);
  if (!domain) return '';
  // Uses icon.horse high-quality favicon service with fallback to Google favicon
  return `https://icon.horse/icon/${domain}`;
};

export const getGoogleFaviconUrl = (url: string): string => {
  const domain = extractDomain(url);
  if (!domain) return '';
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
};

export const resolveIcon = (url: string, iconSpec?: string): ResolvedIcon => {
  if (!iconSpec || iconSpec.trim() === '') {
    return {
      type: 'favicon',
      src: getFaviconUrl(url)
    };
  }

  const spec = iconSpec.trim();

  // If iconSpec is a direct HTTP/HTTPS URL or base64 image or local path
  if (spec.startsWith('http://') || spec.startsWith('https://') || spec.startsWith('data:') || spec.startsWith('/')) {
    return {
      type: 'custom_url',
      src: spec
    };
  }

  // Otherwise treat as Lucide / named icon identifier
  return {
    type: 'lucide',
    src: spec
  };
};
