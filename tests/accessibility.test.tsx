import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Accessibility & WCAG Features', () => {
  it('should include prefers-reduced-motion media query in global CSS', () => {
    const cssPath = path.resolve(__dirname, '../src/styles/global.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain(' animation-duration: 0.01ms !important');
    expect(cssContent).toContain('transition-duration: 0.01ms !important');
    expect(cssContent).toContain('scroll-behavior: auto !important');
  });

  it('base Modal has a compact full-height layout for short landscape viewports', () => {
    const cssPath = path.resolve(__dirname, '../src/components/modals/Modal.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    expect(cssContent).toContain('@media (max-height: 480px)');
    expect(cssContent).toContain('100dvh');
    // layering must stay on design tokens, no magic numbers
    expect(cssContent).toContain('z-index: var(--z-overlay)');
  });

  it('SettingsModal exposes a touch-only long-press hint (hover: none)', () => {
    const cssPath = path.resolve(__dirname, '../src/components/SettingsModal.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    const tsxPath = path.resolve(__dirname, '../src/components/SettingsModal.tsx');
    const tsxContent = fs.readFileSync(tsxPath, 'utf-8');

    expect(cssContent).toContain('@media (hover: none)');
    expect(cssContent).toContain('.touchHint');
    expect(tsxContent).toContain('long-press');
  });

  it('index.html ships a <noscript> notice and an English lang attribute', () => {
    const htmlPath = path.resolve(__dirname, '../index.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');

    expect(htmlContent).toContain('<html lang="en">');
    expect(htmlContent).toContain('<noscript>');
  });

  it('JumpBar fade masks do not cover the focus ring of edge pills', () => {
    const cssPath = path.resolve(__dirname, '../src/components/JumpBar.module.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');

    // the mask is dropped while the bar holds keyboard focus…
    expect(cssContent).toContain('.jumpBar:focus-within');
    expect(cssContent).toContain('mask-image: none');
    // …and scroll-padding keeps pills away from the fade zone
    expect(cssContent).toContain('scroll-padding-inline');
  });
});
