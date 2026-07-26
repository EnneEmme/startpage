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
   - `main`: Contains ONLY production build artifacts (compiled static files ready to use). NO source files or markdown docs here.
   - `dev`: Active development branch containing source code, test suites, build configs, and developer documentation (`gemini.md`, `structure.md`, `plan.md`).
   - Feature branches: `feature/<feature-name>` branched off `dev`.

2. **Commit Policy**:
   - Use Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `style:`).
   - Every commit MUST include a clear, comprehensive description of what was changed and why.

3. **Mandatory Documentation Updates**:
   - Whenever files/folders are added, removed, or moved, `structure.md` MUST be updated in the same commit or step.
   - Whenever a task/feature is started or completed, `plan.md` MUST be updated immediately.

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
