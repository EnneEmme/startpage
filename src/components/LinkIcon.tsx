import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as Icons from 'lucide-preact';
import { extractDomain, getGoogleFaviconUrl, getFaviconUrl } from '../engine/iconResolver';
import styles from './LinkIcon.module.css';

interface LinkIconProps {
  url: string;
  iconSpec?: string;
  title: string;
  size?: number;
}

export const LinkIcon = ({ url, iconSpec, title, size = 18 }: LinkIconProps) => {
  const [imgError, setImgError] = useState<boolean>(false);

  // If explicit Lucide icon name provided and not a standard url/favicon spec
  if (iconSpec && iconSpec in Icons && !iconSpec.startsWith('http')) {
    const IconComponent = (Icons as Record<string, any>)[iconSpec];
    if (IconComponent) {
      return <IconComponent size={size} class={styles.lucideIcon} />;
    }
  }

  // If explicit HTTP image URL provided
  if (iconSpec && (iconSpec.startsWith('http://') || iconSpec.startsWith('https://') || iconSpec.startsWith('data:'))) {
    return (
      <img
        src={iconSpec}
        alt={`${title} icon`}
        width={size}
        height={size}
        loading="lazy"
        class={styles.faviconImg}
      />
    );
  }

  // Default Favicon Resolver: Google Favicon API HD -> fallback icon.horse -> fallback generic icon
  const domain = extractDomain(url);
  const primarySrc = getGoogleFaviconUrl(url);
  const fallbackSrc = getFaviconUrl(url);

  if (!domain || imgError) {
    const DefaultGlobe = Icons.Globe;
    return <DefaultGlobe size={size} class={styles.lucideIcon} />;
  }

  return (
    <img
      src={primarySrc}
      alt={`${title} favicon`}
      width={size}
      height={size}
      loading="lazy"
      class={styles.faviconImg}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        if (target.src === primarySrc && fallbackSrc) {
          target.src = fallbackSrc;
        } else {
          setImgError(true);
        }
      }}
    />
  );
};
