import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Globe } from 'lucide-preact';
import {  extractDomain, getFaviconCandidates, formatSvgToDataUrl  } from '../engine';
import { getLucideIcon } from './iconRegistry';
import styles from './LinkIcon.module.css';

interface LinkIconProps {
  url: string;
  iconSpec?: string;
  title: string;
  size?: number;
}

export const LinkIcon = ({ url, iconSpec, title, size = 18 }: LinkIconProps) => {
  const [candidateIndex, setCandidateIndex] = useState<number>(0);
  const [cacheBustTime, setCacheBustTime] = useState<number>(0);
  const [imgError, setImgError] = useState<boolean>(false);

  useEffect(() => {
    setCandidateIndex(0);
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
          class={styles.faviconImg}
          onError={() => setImgError(true)}
        />
      );
    }
  }

  // Default Favicon Resolver: Multi-tier Candidates (Google HD -> icon.horse -> DuckDuckGo -> Direct)
  const resolvedUrl = url.toLowerCase().startsWith('javascript:')
    ? 'https://gestioneorari.didattica.unimib.it'
    : url;

  const domain = extractDomain(resolvedUrl);
  const candidates = getFaviconCandidates(resolvedUrl, cacheBustTime);

  // Retry is a nested interactive element inside link cards: it must never
  // trigger the parent anchor navigation.
  const handleRetry = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImgError(false);
    setCandidateIndex(0);
    setCacheBustTime(Date.now());
  };

  if (!domain || imgError || candidateIndex >= candidates.length) {
    return (
      <button
        type="button"
        onClick={handleRetry}
        onKeyDown={e => e.stopPropagation()}
        title="Click to reload icon"
        aria-label="Reload icon"
        style={{ display: 'inline-flex', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
      >
        <Globe size={size} class={styles.lucideIcon} />
      </button>
    );
  }

  const currentSrc = candidates[candidateIndex];

  return (
    <img
      src={currentSrc}
      alt={`${title} favicon`}
      width={size}
      height={size}
      loading="lazy"
      class={styles.faviconImg}
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
