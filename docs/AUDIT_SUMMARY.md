# Audit Summary

Date: ven. 08 août 2025 14:42:02 CEST

## Tooling

Node: v20.19.4
Package manager: npm (10.8.2)

## Config files

Config files presence:
present: tsconfig.json
present: vite.config.ts
missing: vite.config.js
missing: jest.config.ts
missing: jest.config.js
present: vitest.config.ts
missing: cypress.config.ts
missing: cypress.config.js
present: playwright.config.ts
present: .eslintrc.cjs
missing: .eslintrc.js
missing: .eslintrc.json
present: .prettierrc
missing: .prettierrc.json
missing: .prettierrc.cjs
present: .editorconfig
present: commit-msg
present: pre-commit
present: workflows
missing: Dockerfile
missing: docker-compose.yml
present: .env.example
present: .nvmrc
present: .node-version
missing: CODE_OF_CONDUCT.md
missing: CONTRIBUTING.md
missing: LICENSE

## Scripts present

dev
build
preview
lint
lint:fix
format
typecheck
test
test:run
coverage
prepare
lint-staged

## Lint/Test/Build outcomes (see logs in audit/)

- Lint: PASS (exit 0). See audit/lint.log
- Typecheck: PASS (exit 0). See audit/typecheck.log
- Tests: PASS (exit 0). See audit/test.log
- Build: PASS (exit 0). See audit/build.log

## Notes and suggestions

- ESLint present and lint passing.
- Prettier config present.
- TypeScript present and typecheck passing.
- Vitest present; tests passing.
- Playwright config present; consider adding an e2e script and a smoke test.
- CI workflow exists; ensure coverage for dev/main split if desired.
- Consider adding CODE_OF_CONDUCT.md, CONTRIBUTING.md, and LICENSE.
