import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Accessibility & WCAG Features', () => {
  it('should include prefers-reduced-motion media query in global CSS', () => {
    const cssPath = path.resolve(__dirname, '../src/styles/global.css');
    const cssContent = fs.readFileSync(cssPath, 'utf-8');
    
    expect(cssContent).toContain('@media (prefers-reduced-motion: reduce)');
    expect(cssContent).toContain('animation-duration: 0.01ms !important');
    expect(cssContent).toContain('transition-duration: 0.01ms !important');
    expect(cssContent).toContain('scroll-behavior: auto !important');
  });
});
