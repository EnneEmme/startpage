import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/preact';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

/** Child component that unconditionally fails during render. */
const ThrowingChild = (): never => {
  throw new Error('boom-render');
};

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>healthy tree</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('healthy tree')).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows the dark fallback UI with Reload and Reset defaults when a child throws', () => {
    // Preact re-logs the caught error; keep the test output clean.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('alert')).not.toBeNull();
    expect(screen.getByText('Something went wrong')).not.toBeNull();
    expect(screen.getByText('boom-render')).not.toBeNull(); // short error message surfaced
    expect(screen.getByRole('button', { name: 'Reload' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Reset defaults' })).not.toBeNull();
  });

  it('Reset defaults wipes all app localStorage keys before reloading', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const APP_KEYS = [
      'startpage_custom_links',
      'startpage_category_order',
      'startpage_theme_settings',
      'startpage_ranks',
      'startpage_script_consents',
    ];
    APP_KEYS.forEach(key => localStorage.setItem(key, '{"seed":1}'));
    const unrelatedKey = 'unrelated_site_data';
    localStorage.setItem(unrelatedKey, 'keep-me');

    render(
      <ErrorBoundary>
        <ThrowingChild />
      </ErrorBoundary>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reset defaults' }));

    APP_KEYS.forEach(key => expect(localStorage.getItem(key)).toBeNull());
    // The reset is scoped to the app keys only (no localStorage.clear())
    expect(localStorage.getItem(unrelatedKey)).toBe('keep-me');
  });
});
