import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  // Relative base so the single-file build works from file:// and any
  // sub-path static host (GitHub Pages project site included).
  base: './',
  plugins: [
    preact(),
    viteSingleFile(),
    // Bundle report next to the build output; never opened automatically.
    // dist/stats.html is git-ignored (see .gitignore).
    visualizer({ filename: 'dist/stats.html', gzipSize: true, open: false })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    target: 'es2022',
    // Post-audit single-file budget is 350KB: warn well before breaching it.
    chunkSizeWarningLimit: 300,
    cssCodeSplit: false,
    outDir: 'dist',
    minify: 'terser',
    terserOptions: {
      compress: {
        // Strip noise logs from prod but keep warn/error: diagnostic
        // warnings (e.g. [DataStore] corrupted-storage reports) must
        // survive in the shipped artifact.
        drop_console: ['log', 'debug', 'info'],
        drop_debugger: true,
        passes: 2
      }
    }
  }
});
