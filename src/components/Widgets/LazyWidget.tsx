import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import styles from './LazyWidget.module.css';

interface LazyWidgetProps {
  title: string;
  loadFn: () => Promise<{ default: (props: any) => h.JSX.Element }>;
  widgetProps?: Record<string, any>;
}

export const LazyWidget = ({ title, loadFn, widgetProps = {} }: LazyWidgetProps) => {
  const [Component, setComponent] = useState<((props: any) => h.JSX.Element) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    // Non-blocking asynchronous lazy loading via IdleCallback / deferred promise
    const loadWidget = async () => {
      try {
        const mod = await loadFn();
        setComponent(() => mod.default);
      } catch (err) {
        console.error(`Failed to lazy load widget [${title}]:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(() => loadWidget());
    } else {
      setTimeout(loadWidget, 100);
    }
  }, [loadFn, title]);

  if (error) return null;

  return (
    <div class={styles.widgetCard}>
      {loading ? (
        <div class={styles.skeletonLoader}>
          <span class={styles.skeletonTitle}>Loading {title}...</span>
        </div>
      ) : Component ? (
        <Component {...widgetProps} />
      ) : null}
    </div>
  );
};
