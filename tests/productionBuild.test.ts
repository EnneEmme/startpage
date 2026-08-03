import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const distPath = path.resolve(__dirname, '../dist/index.html');

// Guardato da skipIf: su un checkout fresco dist/ non esiste e la suite
// resta verde. I test girano dopo una `bun run build` reale.
describe('Production Build', () => {
  it.skipIf(!fs.existsSync(distPath))(
    'should generate a single index.html file within size budget',
    () => {
      const stats = fs.statSync(distPath);

      // Budget di bundle post-audit: 350KB per la single-file build
      // (misura attuale ~268KB; chunkSizeWarningLimit in vite.config: 300).
      expect(stats.size).toBeLessThan(350 * 1024);
    },
  );

  it.skipIf(!fs.existsSync(distPath))(
    'should not reference the Google Fonts provider (B4 regression)',
    () => {
      const content = fs.readFileSync(distPath, 'utf-8');

      // Regressione B4: le font di sistema non devono mai essere sostituite
      // da un fetch runtime verso il provider Google Fonts.
      // (Il vecchio check `console.log(` era tautologico: terser con
      // drop_console ['log','debug','info'] + lint rendono il caso impossibile;
      // rimosso in favore di questa asserzione concreta.)
      expect(content).not.toContain('fonts.googleapis.com');
    },
  );
});
