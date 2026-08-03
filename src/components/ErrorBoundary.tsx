import { Component } from 'preact';
import type { ComponentChildren, JSX } from 'preact';

interface ErrorBoundaryProps {
  children: ComponentChildren;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * App localStorage keys wiped by "Reset defaults" — mirrors the storage keys
 * owned by the engine modules (dataStore, themeEngine, rankStorage,
 * scriptConsent): user links/order, theme, usage ranks, script consents.
 */
const APP_STORAGE_KEYS = [
  'startpage_custom_links',
  'startpage_category_order',
  'startpage_theme_settings',
  'startpage_ranks',
  'startpage_script_consents'
] as const;

/* Inline styles on purpose: the boundary must still render when stylesheets
   or CSS modules are the reason the app crashed. Palette mirrors variables.css. */
const hostStyle: JSX.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  background: '#08080a',
  color: '#e2e8f0',
  fontFamily: 'system-ui, -apple-system, sans-serif'
};

const panelStyle: JSX.CSSProperties = {
  maxWidth: '26rem',
  width: '100%',
  padding: '2rem',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '16px'
};

const titleStyle: JSX.CSSProperties = { margin: '0 0 0.75rem', fontSize: '1.25rem' };

const messageStyle: JSX.CSSProperties = { margin: '0 0 1rem', fontSize: '0.9rem', lineHeight: 1.6, color: '#8b9bb0' };

const errorBoxStyle: JSX.CSSProperties = {
  margin: '0 0 1rem',
  padding: '0.6rem 0.75rem',
  fontSize: '0.75rem',
  textAlign: 'left',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  color: '#f87171',
  background: 'rgba(0, 0, 0, 0.4)',
  borderRadius: '8px',
  maxHeight: '9rem',
  overflow: 'auto'
};

const actionsStyle: JSX.CSSProperties = { display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' };

const baseButtonStyle: JSX.CSSProperties = {
  padding: '0.55rem 1.1rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#e2e8f0',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '8px',
  cursor: 'pointer'
};

const dangerButtonStyle: JSX.CSSProperties = {
  ...baseButtonStyle,
  color: '#f87171',
  background: 'rgba(248, 113, 113, 0.12)',
  border: '1px solid rgba(248, 113, 113, 0.4)'
};

/**
 * Render-error boundary (Preact class component — the only component type
 * supporting componentDidCatch). Catches any render/lifecycle exception in
 * the tree below and shows a dark fallback UI with two recovery paths:
 * reload the page, or wipe the app localStorage keys and reload (last resort
 * for corrupted persisted state, e.g. hostile hand-edited JSON).
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { error: null };

  public override componentDidCatch(error: Error): void {
    // Full error stays in the console for diagnostics; the UI shows the short message.
    console.error('[ErrorBoundary] Uncaught render error:', error);
    this.setState({ error });
  }

  private readonly handleReload = (): void => {
    try {
      window.location.reload();
    } catch (err) {
      console.warn('[ErrorBoundary] location.reload() unavailable:', err);
    }
  };

  private readonly handleResetDefaults = (): void => {
    try {
      APP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    } catch (err) {
      console.warn('[ErrorBoundary] Failed to clear app storage keys:', err);
    }
    this.handleReload();
  };

  public override render(): ComponentChildren {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div style={hostStyle}>
        <div style={panelStyle} role="alert">
          <h2 style={titleStyle}>Something went wrong</h2>
          <p style={messageStyle}>
            Startpage hit an unexpected error. Reload the page — if the problem keeps happening, reset all
            local data (links, theme, ranks, script consents) to factory defaults.
          </p>
          {error.message ? <pre style={errorBoxStyle}>{error.message}</pre> : null}
          <div style={actionsStyle}>
            <button type="button" style={baseButtonStyle} onClick={this.handleReload}>
              Reload
            </button>
            <button type="button" style={dangerButtonStyle} onClick={this.handleResetDefaults}>
              Reset defaults
            </button>
          </div>
        </div>
      </div>
    );
  }
}
