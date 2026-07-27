import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import * as Icons from 'lucide-preact';
import { extractDomain, getFaviconCandidates, formatSvgToDataUrl } from '../engine/iconResolver';
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
  if (iconSpec && iconSpec in Icons && !iconSpec.startsWith('http') && !iconSpec.includes('<svg')) {
    const IconComponent = (Icons as Record<string, any>)[iconSpec];
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

  const handleRetry = () => {
    setImgError(false);
    setCandidateIndex(0);
    setCacheBustTime(Date.now());
  };

  if (!domain || imgError || candidateIndex >= candidates.length) {
    const DefaultGlobe = Icons.Globe;
    return (
      <span onClick={handleRetry} title="Clicca per ricaricare icona" style={{ display: 'inline-flex', cursor: 'pointer' }}>
        <DefaultGlobe size={size} class={styles.lucideIcon} />
      </span>
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
