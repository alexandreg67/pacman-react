# Next Steps (Terminal-only)

This document is generated after an audit. Each item includes guarded commands. Execute only the relevant ones based on docs/AUDIT_SUMMARY.md.

## 1) Ensure Node version pinning

- If missing, add .nvmrc and .node-version targeting an LTS (e.g., 20):

```bash
echo 20 | tee .nvmrc >/dev/null
echo 20 | tee .node-version >/dev/null
```

## 2) Baseline linting and formatting

- If ESLint missing:

```bash
PM=$(node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));if(p.packageManager){console.log(p.packageManager.split('@')[0])}else if(fs.existsSync('pnpm-lock.yaml')){console.log('pnpm')}else if(fs.existsSync('yarn.lock')){console.log('yarn')}else{console.log('npm')}")
if [ "${PM}" = "pnpm" ]; then pnpm add -D eslint @eslint/js eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks; elif [ "${PM}" = "yarn" ]; then yarn add -D eslint @eslint/js eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks; else npm i -D eslint @eslint/js eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks; fi
printf "module.exports = { extends: ['eslint:recommended','plugin:react/recommended','plugin:react-hooks/recommended','prettier'], parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } }, settings: { react: { version: 'detect' } }, };\n" | tee .eslintrc.cjs >/dev/null
```

- If Prettier missing:

```bash
if [ "${PM}" = "pnpm" ]; then pnpm add -D prettier; elif [ "${PM}" = "yarn" ]; then yarn add -D prettier; else npm i -D prettier; fi
printf "{\n  \"singleQuote\": true,\n  \"trailingComma\": \"all\"\n}\n" | tee .prettierrc >/dev/null
```

## 3) TypeScript baseline

- If TypeScript missing:

```bash
if [ "${PM}" = "pnpm" ]; then pnpm add -D typescript @types/react @types/react-dom; elif [ "${PM}" = "yarn" ]; then yarn add -D typescript @types/react @types/react-dom; else npm i -D typescript @types/react @types/react-dom; fi
test -f tsconfig.json || printf "{\n  \"compilerOptions\": {\n    \"target\": \"ES2020\",\n    \"lib\": [\"ES2020\", \"DOM\"],\n    \"jsx\": \"react-jsx\",\n    \"module\": \"ESNext\",\n    \"moduleResolution\": \"Bundler\",\n    \"strict\": true,\n    \"baseUrl\": ".",\n    \"paths\": { \"@/*\": [\"src/*\"] }\n  },\n  \"include\": [\"src\", \"vite.config.ts\", \"vitest.config.ts\"]\n}\n" | tee tsconfig.json >/dev/null
```

## 4) Unit testing baseline

- Prefer Vitest and Testing Library for React:

```bash
if [ "${PM}" = "pnpm" ]; then pnpm add -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom; elif [ "${PM}" = "yarn" ]; then yarn add -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom; else npm i -D vitest jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom; fi
test -f vitest.config.ts || printf "import { defineConfig } from 'vitest/config'\nexport default defineConfig({ test: { environment: 'jsdom' } })\n" | tee vitest.config.ts >/dev/null
node -e "const fs=require('fs');const p=require('./package.json');p.scripts=p.scripts||{};p.scripts.test=p.scripts.test||'vitest --run';fs.writeFileSync('package.json',JSON.stringify(p,null,2));"
```

## 5) E2E testing baseline (Playwright)

- If missing and desired:

```bash
if [ "${PM}" = "pnpm" ]; then pnpm add -D playwright; elif [ "${PM}" = "yarn" ]; then yarn add -D playwright; else npm i -D playwright; fi
# Add playwright.config.ts per docs if needed
```

## 6) Pre-commit and commit message quality

- If Husky missing:

```bash
if [ "${PM}" = "pnpm" ]; then pnpm dlx husky init; elif [ "${PM}" = "yarn" ]; then npx husky-init; else npx husky-init; fi
if [ "${PM}" = "pnpm" ]; then pnpm add -D lint-staged @commitlint/config-conventional @commitlint/cli; elif [ "${PM}" = "yarn" ]; then yarn add -D lint-staged @commitlint/config-conventional @commitlint/cli; else npm i -D lint-staged @commitlint/config-conventional @commitlint/cli; fi
printf "module.exports = { extends: ['@commitlint/config-conventional'] };\n" | tee commitlint.config.cjs >/dev/null
mkdir -p .husky
printf "#!/usr/bin/env sh\n. \"\${0%/*}\"/_/husky.sh\n\nnpx lint-staged\n" | tee .husky/pre-commit >/dev/null && chmod +x .husky/pre-commit
printf "#!/usr/bin/env sh\n. \"\${0%/*}\"/_/husky.sh\n\nnpx --no-install commitlint --edit \"\$1\"\n" | tee .husky/commit-msg >/dev/null && chmod +x .husky/commit-msg
```

## 7) CI setup (GitHub Actions)

- If missing, add a basic workflow:

```bash
mkdir -p .github/workflows
printf "name: CI\non: [push, pull_request]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n          cache: npm\n      - run: corepack enable\n      - run: npm ci\n      - run: npm run -s lint || true\n      - run: npm run -s typecheck || true\n      - run: npm run -s test || true\n      - run: npm run -s build || true\n" | tee .github/workflows/ci.yml >/dev/null
```

## 8) Project hygiene

- Add .editorconfig if missing:

```bash
printf "root = true\n\n[*]\ncharset = utf-8\nend_of_line = lf\ninsert_final_newline = true\nindent_style = space\nindent_size = 2\n" | tee .editorconfig >/dev/null
```

- Add .env.example and reference in README:

```bash
test -f .env.example || printf "# Example environment variables\nVITE_API_BASE=\n" | tee .env.example >/dev/null
```

## 9) Pacman game milestones (terminal-driven work)

- Core engine (pure functions, unit-testable): grid representation, directions, movement with dt, wall collision, pellet and power-pellet consumption, score and lives, frightened mode timer.
- AI: simple ghost scatter/chase logic; random fallback.
- Rendering boundaries: ensure game state is decoupled from UI for testability.
- Test plan: unit tests for movement, collision, score updates; integration tests for state transitions.
- Suggested file structure:

```
src/game/types.ts
src/game/grid.ts
src/game/state.ts
src/game/entities/pacman.ts
src/game/entities/ghost.ts
src/game/logic/collision.ts
src/game/logic/scoring.ts
```

- Create stubs if missing (example for one file):

```bash
mkdir -p src/game/{entities,logic}
test -f src/game/types.ts || printf "export type Vec = { x: number; y: number };\nexport type Direction = 'up'|'down'|'left'|'right';\n" | tee src/game/types.ts >/dev/null
```

## 10) Commit plan

- Commit docs additions and stubs in small, focused commits.
