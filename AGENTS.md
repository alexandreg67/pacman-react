# Repository Guidelines

## Project Structure & Module Organization

- Source in `src/` (React + TypeScript): `components/`, `game/{entities,logic,react,__tests__/}`, `hooks/`, `store/`, `systems/`, `types/`, `assets/`.
- Entry points: `index.html`, `src/main.tsx`, `src/App.tsx`. Built assets in `dist/`.
- Config: `vite.config.ts`, `eslint.config.js`, `tailwind.config.ts`, `vitest.config.ts`, `playwright.config.ts`.
- Scripts: `scripts/` contains performance/demo utilities. Static files in `public/`.

## Build, Test, and Development Commands

- `npm run dev`: start Vite dev server (default http://localhost:5173).
- `npm run build`: type-check and build to `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint` / `lint:fix`: run ESLint (auto-fix with `--fix`).
- `npm run format`: Prettier write across the repo.
- `npm run typecheck`: TypeScript project build checks.
- `npm test`: run Vitest in watch mode; `npm run test:run` for CI; `npm run coverage` for coverage.
- Optional: `npm run performance`, `performance:quick`, `demo`, `demo:report` for local analysis.
- Node: use Node 22.x (`nvm use` or `.node-version`).

## Coding Style & Naming Conventions

- Indent 2 spaces (`.editorconfig`), LF line endings.
- TypeScript + React 19. Components in PascalCase (e.g., `GameBoard.tsx`); hooks start with `use` (e.g., `useKeyboard.ts`).
- Linting: ESLint with React Hooks and Refresh plugins; Prettier for formatting. Avoid `console`/`debugger` in committed code (warn-level rules).

## Testing Guidelines

- Unit/integration: Vitest with JSDOM and `@testing-library/*`; setup in `src/setupTests.ts`.
- Test files: `*.test.ts(x)` near code or under `__tests__/` (see `src/game/__tests__/`).
- Run `npm run coverage` and aim for meaningful coverage on game logic and hooks.
- E2E (optional): Playwright looks for tests in `e2e/` and uses baseURL `http://localhost:5173`.

## Commit & Pull Request Guidelines

- Commits: Conventional Commits enforced via Commitlint (e.g., `feat: add ghost AI tweaks`).
- Pre-commit: Husky + lint-staged formats and lints staged files; commit message is validated.
- PRs: include a clear description, linked issues, screenshots for UI changes, and test updates. Keep changes focused and small.

## Security & Configuration Tips

- Copy `.env.example` to `.env` (or `.env.local`) and prefix runtime vars with `VITE_` (e.g., `VITE_API_BASE`). Never commit secrets.
