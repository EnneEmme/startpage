# Gemini AI Agent - Project Guidelines & Standards

This document specifies the operational rules, coding standards, git workflow, and documentation requirements that any AI assistant (including Antigravity / Gemini) MUST follow when making changes to this Startpage project.

---

## 1. Core Architecture & Tooling Principles

1. **Bun Tooling Mandate**:
   - MUST use `bun` exclusively for package installation, script execution, and testing (`bun ./node_modules/vitest/vitest.mjs run`).
   - NEVER use `npm` or `npx`.

2. **Serverless & Standalone Output**:
   - The final production build on the `main` branch MUST consist solely of static `index.html`, JavaScript, and CSS assets.
   - It MUST run directly when opened as a local file (`file:///...`) in a browser or hosted on static hosts like GitHub Pages.
   - No runtime server, node backend, or external dynamic servers are allowed for execution.

3. **Decoupled Data Architecture**:
   - Link configurations, categories, icons, and aliases MUST remain completely decoupled from the UI layer.
   - Any modifications to the UI layout or styling MUST NOT break the underlying data schema or local storage keys (`startpage_links`, `startpage_ranks`, `startpage_settings`).

4. **Clean Code & Extensibility**:
   - Use TypeScript strict mode.
   - Keep modules small, single-purpose, and fully documented.
   - Follow SOLID design principles.

---

## 2. Git & Documentation Workflow

1. **Branch Management**:
   - `main`: Contains ONLY production build artifacts (compiled static files ready to use). NO source files or markdown docs here (except `README.md` and `assets/` for screenshots).
   - `dev`: Active development branch containing source code, test suites, build configs, and developer documentation (`gemini.md`, `structure.md`, `plan.md`).
   - Feature branches: `feature/<feature-name>` branched off `dev`.

2. **Main Branch Squash Policy (CRITICAL)**:
   - The `index.html` on `main` is a **build artifact** (~1MB). Keeping old versions in git history is wasteful — the real source history lives on `dev`.
   - Before every push to `main`, the branch MUST be **squashed into a single commit** using an orphan branch technique:
     ```bash
     git checkout --orphan main-clean
     git checkout main -- .
     git add .gitignore README.md assets/ index.html
     git commit -m "release: vX.Y.Z — production build with README and screenshots"
     git branch -D main
     git branch -m main-clean main
     git reflog expire --expire=now --all && git gc --prune=now --aggressive
     git push origin main --force
     ```
   - This keeps the repo lightweight (the `dev` branch preserves the full development history).

3. **Main Branch Required Files**:
   - `index.html` — the production build (single self-contained file)
   - `README.md` — detailed project description with screenshots, feature table, keyboard shortcuts, architecture overview
   - `assets/` — screenshot images referenced by README.md
   - `.gitignore` — excludes node_modules, dist, .DS_Store, old_homepage, etc.

4. **Commit Policy**:
   - Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `style:`).
   - Every commit MUST include a clear, comprehensive description of what was changed and why.

5. **Mandatory Documentation Updates**:
   - Whenever files/folders are added, removed, or moved, `structure.md` MUST be updated in the same commit or step.
   - Whenever a task/feature is started or completed, `plan.md` MUST be updated immediately.

6. **GitHub Pages Deployment**:
   - The site is served via GitHub Pages from `main` branch, root directory (`/`).
   - After pushing to `main`, the site is automatically deployed to `https://<username>.github.io/startpage/`.

---

## 3. Automated Testing Requirements

- **Zero-Regression Policy**: Every new feature or refactor MUST be accompanied by unit or integration tests in Vitest.
- Before considering any task complete:
  1. Run `bun ./node_modules/vitest/vitest.mjs run` to ensure all tests pass.
  2. Test edge cases (missing icons, invalid URLs, empty search queries, local storage corruption, dynamic date boundaries).

---

## 4. UI & Performance Standards

- **Performance**: Instant load time (< 100ms), zero lag during typing in fuzzy search.
- **Lazy Loading**: Non-visible icons or heavy assets must use lazy loading or async fetch with fallback placeholders.
- **Design System**: Dark premium aesthetic, clean typography, smooth transitions, responsive grid layout.
