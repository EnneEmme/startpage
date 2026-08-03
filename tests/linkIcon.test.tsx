import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/preact';
import { LinkIcon } from '../src/components/LinkIcon';

const URL = 'https://github.com';

/** Re-query the favicon <img> (preact updates it in place across state changes) */
const faviconImg = (container: HTMLElement) =>
  container.querySelector<HTMLImageElement>('img')!;

describe('LinkIcon', () => {
  it('walks the provider chain on img error (google -> icon.horse -> duckduckgo)', () => {
    const { container } = render(<LinkIcon url={URL} title="GitHub" />);

    expect(faviconImg(container).src).toContain('google.com/s2/favicons?domain=github.com');

    fireEvent.error(faviconImg(container));
    expect(faviconImg(container).src).toContain('icon.horse/icon/github.com');

    fireEvent.error(faviconImg(container));
    expect(faviconImg(container).src).toContain('icons.duckduckgo.com/ip3/github.com.ico');
  });

  it('makes one full cache-busting pass before falling back to the Globe retry button', () => {
    const { container, getByRole, queryByRole } = render(<LinkIcon url={URL} title="GitHub" />);

    // First pass over all 3 providers, then the chain restarts with a cache
    // buster appended; after the second full failure the fallback appears.
    fireEvent.error(faviconImg(container)); // google -> icon.horse
    fireEvent.error(faviconImg(container)); // icon.horse -> duckduckgo
    fireEvent.error(faviconImg(container)); // last provider: restart chain with cache bust
    expect(faviconImg(container).src).toContain('_cb=');
    expect(faviconImg(container).src).toContain('google.com/s2/favicons');
    expect(queryByRole('button', { name: 'Reload icon' })).toBeNull();

    fireEvent.error(faviconImg(container)); // google (cb) -> icon.horse (cb)
    fireEvent.error(faviconImg(container)); // icon.horse (cb) -> duckduckgo (cb)
    fireEvent.error(faviconImg(container)); // chain exhausted: Globe fallback
    expect(container.querySelector('img')).toBeNull();

    const retryBtn = getByRole('button', { name: 'Reload icon' });
    expect(retryBtn.querySelector('svg')).not.toBeNull();
  });

  it('the Reload icon button restarts the chain from the first provider with a cache buster', () => {
    const { container, getByRole } = render(<LinkIcon url={URL} title="GitHub" />);

    // exhaust the chain (same 6 failures as above)
    for (let i = 0; i < 6; i++) {
      fireEvent.error(faviconImg(container));
    }
    expect(container.querySelector('img')).toBeNull();

    fireEvent.click(getByRole('button', { name: 'Reload icon' }));

    const img = faviconImg(container);
    expect(img.src).toContain('google.com/s2/favicons?domain=github.com');
    expect(img.src).toContain('_cb=');
  });

  it('renders a Lucide iconSpec directly: no favicon img, no provider chain', () => {
    const { container } = render(<LinkIcon url={URL} iconSpec="Rocket" title="GitHub" />);

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders a custom URL iconSpec as-is (no provider chain)', () => {
    const custom = 'https://cdn.example.com/custom-icon.png';
    const { container } = render(<LinkIcon url={URL} iconSpec={custom} title="GitHub" />);

    const img = faviconImg(container);
    expect(img.src).toBe(custom);
    expect(img.alt).toBe('GitHub icon');
  });

  it('never resolves favicons for javascript: URLs (neutral Globe, no img)', () => {
    const { container } = render(
      <LinkIcon url="javascript:alert(1)" title="Snippet" />
    );

    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });
});
