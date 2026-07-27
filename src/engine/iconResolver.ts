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

export const extractOrigin = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return '';
  }
};

export const BRAND_FAVICON_OVERRIDES: Record<string, string[]> = {
  'notebooklm.google.com': [
    'https://ssl.gstatic.com/docs/doclist/images/infinite_notebooklm_color_32dp.png'
  ],
  'aistudio.google.com': [
    'https://ssl.gstatic.com/ai/aistudio/favicon.png'
  ],
  'gemini.google.com': [
    'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a610345.svg'
  ]
};

export const getFaviconCandidates = (url: string, cacheBustTimestamp: number = 0): string[] => {
  const domain = extractDomain(url);
  const origin = extractOrigin(url);
  if (!domain) return [];

  const cbParam = cacheBustTimestamp > 0 ? `&_cb=${cacheBustTimestamp}` : '';
  const cbParamPath = cacheBustTimestamp > 0 ? `?_cb=${cacheBustTimestamp}` : '';

  const candidates: string[] = [];

  // 1. Check direct brand favicon overrides for special subdomains (NotebookLM, AI Studio, etc.)
  if (BRAND_FAVICON_OVERRIDES[domain]) {
    BRAND_FAVICON_OVERRIDES[domain].forEach(src => {
      candidates.push(src + cbParamPath);
    });
  }

  // 2. Standard multi-tier provider chain
  candidates.push(
    `https://www.google.com/s2/favicons?domain=${origin || domain}&sz=128${cbParam}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128${cbParam}`,
    `https://icon.horse/icon/${domain}${cbParamPath}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico${cbParamPath}`,
    `https://${domain}/favicon.ico${cbParamPath}`,
    `${origin}/favicon.ico${cbParamPath}`
  );

  return candidates;
};

export const formatSvgToDataUrl = (svgCode: string): string => {
  let cleanSvg = svgCode.trim();
  if (cleanSvg.startsWith('data:')) return cleanSvg;

  // Clean markdown link formatting (e.g. [http://www.w3.org/...](http://www.w3.org/...))
  cleanSvg = cleanSvg.replace(/\[https?:\/\/[^\]]+\]\((https?:\/\/[^)]+)\)/g, '$1');

  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(cleanSvg);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = typeof btoa === 'function' ? btoa(binary) : Buffer.from(cleanSvg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(cleanSvg)}`;
  }
};

export const resolveIcon = (url: string, iconSpec?: string): ResolvedIcon => {
  if (!iconSpec || iconSpec.trim() === '') {
    return {
      type: 'favicon',
      src: getFaviconUrl(url)
    };
  }

  const spec = iconSpec.trim();

  // If iconSpec is raw SVG XML code
  if (spec.startsWith('<svg') || spec.toLowerCase().includes('<svg')) {
    return {
      type: 'custom_url',
      src: formatSvgToDataUrl(spec)
    };
  }

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
