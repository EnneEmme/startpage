import { useState, useEffect } from 'preact/hooks';
import { Globe } from 'lucide-preact';
import { extractDomain, getFaviconCandidates, formatSvgToDataUrl, getCachedFaviconIndex, setCachedFaviconIndex } from '../engine';
import { getLucideIcon } from './iconRegistry';
import styles from './LinkIcon.module.css';

interface LinkIconProps {
  url: string;
  iconSpec?: string | undefined;
  title: string;
  size?: number;
}

export const LinkIcon = ({ url, iconSpec, title, size = 18 }: LinkIconProps) => {
  // Start dal provider che ha funzionato l'ultima volta per questo dominio
  const [candidateIndex, setCandidateIndex] = useState<number>(() => getCachedFaviconIndex(extractDomain(url)));
  const [cacheBustTime, setCacheBustTime] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setCandidateIndex(getCachedFaviconIndex(extractDomain(url)));
    setImgError(false);
    setCacheBustTime(0);
  }, [url, iconSpec]);

  // If explicit Lucide icon name provided and not a standard url/favicon/svg spec
  if (iconSpec && !iconSpec.startsWith('http') && !iconSpec.startsWith('data:') && !iconSpec.includes('<svg')) {
    const IconComponent = getLucideIcon(iconSpec);
    if (IconComponent) {
      return <IconComponent size={size} class={styles.lucideIcon} />;
    }
  }

  // If explicit HTTP image URL, base64 data URL, or raw SVG XML string provided
  if (iconSpec) {
    const trimmed = iconSpec.trim();
    const isRawSvg = trimmed.startsWith('<svg') || trimmed.toLowerCase().includes('<svg');
    const isCustomUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('/');

    if (isRawSvg || isCustomUrl) {
      const srcUrl = isRawSvg ? formatSvgToDataUrl(trimmed) : trimmed;

      return (
        <img
          src={srcUrl}
          alt={`${title} icon`}
          width={size}
          height={size}
          loading="lazy"
          referrerPolicy="no-referrer"
          class={styles.faviconImg}
          onError={() => setImgError(true)}
        />
      );
    }
  }

  // Bookmarklet/script: icona neutra, mai favicon di un dominio arbitrario
  if (url.toLowerCase().startsWith('javascript:')) {
    return <Globe size={size} class={styles.lucideIcon} />;
  }

  // Default Favicon Resolver: Multi-tier Candidates (Google HD -> icon.horse -> DuckDuckGo -> Direct)
  const domain = extractDomain(url);
  const candidates = getFaviconCandidates(url, cacheBustTime);

  // Retry is a nested interactive element inside link cards: it must never
  // trigger the parent anchor navigation.
  const handleRetry = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgError(false);
    setCandidateIndex(0);
    setCacheBustTime(Date.now());
  };

  const safeIndex = candidates.length > 0 ? Math.min(candidateIndex, candidates.length - 1) : 0;

  if (!domain || imgError || safeIndex >= candidates.length) {
    return (
      <button
        type="button"
        onClick={handleRetry}
        onKeyDown={e => e.stopPropagation()}
        title="Click to reload icon"
        aria-label="Reload icon"
        class={styles.retryButton}
      >
        <Globe size={size} class={styles.lucideIcon} />
      </button>
    );
  }

  const currentSrc = candidates[safeIndex];

  return (
    <img
      src={currentSrc}
      alt={`${title} favicon`}
      width={size}
      height={size}
      loading="lazy"
      referrerPolicy="no-referrer"
      class={styles.faviconImg}
      onLoad={() => setCachedFaviconIndex(domain, safeIndex)}
      onError={() => {
        if (candidateIndex + 1 < candidates.length) {
          setCandidateIndex(prev => prev + 1);
        } else if (cacheBustTime === 0) {
          // Force one fresh cache-busting attempt across all candidates
          setCandidateIndex(0);
          setCacheBustTime(Date.now());
        } else {
          setImgError(true);
        }
      }}
    />
  );
};
