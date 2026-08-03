// ESLint flat config — startpage (Preact + TS + Vite single-file).
// Scope: correctness/safety only. ALL formatting/style is owned by Prettier
// (see .prettierrc); eslint-config-prettier is kept last as a safety net that
// disables any formatting rule that might come from a plugin preset.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    // Build artifacts and coverage output are never linted.
    ignores: ['dist/**', 'coverage/**', 'stats.html', 'node_modules/**']
  },
  js.configs.recommended,
  // TS "recommended" (sintattico, NON typeChecked: projectService/type-checking
  // sarebbe troppo lento/fragile per questa codebase single-file).
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.browser
      }
    },
    rules: {
      // no-unused-vars base va disattivata: la variante TS gestisce
      // correttamente type-only imports, enum e segnali Preact.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      // I catch vuoti sono un pattern intenzionale di quarantena storage
      // (JSON.parse/localStorage non devono mai far crashare l'app):
      // vedi src/engine/dataStore.ts e rankStorage.ts.
      'no-empty': ['error', { allowEmptyCatch: true }]
    }
  },
  {
    files: ['tests/**/*.{ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
        ...globals.node
      }
    }
  },
  {
    // Owner: branch parallelo sec/audit-p6-security (test engine). Il cast
    // `as any` su globalThis e' intenzionale qui; la pulizia del file e' di
    // competenza dell'altro agente. Override scopata al solo file.
    files: ['tests/linkExecutor.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off'
    }
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node
      }
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    }
  },
  // Deve restare l'ultimo: spegne eventuali regole di formatting dei preset.
  prettier
);
