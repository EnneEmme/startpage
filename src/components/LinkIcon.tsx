import { h } from 'preact';
import { useState } from 'preact/hooks';
import * as Icons from 'lucide-preact';
import { resolveIcon, getGoogleFaviconUrl } from '../engine/iconResolver';
import styles from './LinkIcon.module.css';

interface LinkIconProps {
  url: string;
  iconSpec?: string;
  title: string;
  size?: number;
}

export const LinkIcon = ({ url, iconSpec, title, size = 22 }: LinkIconProps) => {
  const resolved = resolveIcon(url, iconSpec);
  const [imgError, setImgError] = useState<boolean>(false);

  // If type is lucide, look up icon component dynamically from lucide-preact
  if (resolved.type === 'lucide') {
    const IconComponent = (Icons as Record<string, any>)[resolved.src] || Icons.Globe;
    return <IconComponent size={size} class={styles.lucideIcon} />;
  }

  // If custom URL or favicon image
  const imageSrc = imgError ? getGoogleFaviconUrl(url) : resolved.src;

  return (
    <img
      src={imageSrc}
      alt={`${title} icon`}
      width={size}
      height={size}
      loading="lazy"
      class={styles.faviconImg}
      onError={() => {
        if (!imgError) {
          setImgError(true);
        }
      }}
    />
  );
};
