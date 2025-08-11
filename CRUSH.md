# Pacman React - CRUSH Configuration

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test -- <pattern>` - Run specific test file
- `npm run coverage` - Generate test coverage report

## Code Style Guidelines

- TypeScript with strict mode enabled
- React 19 with functional components and hooks
- Prettier formatting: single quotes, no semicolons, trailing commas
- ESLint rules: no-console (warn), no-debugger (warn)
- Import organization: React/React libraries first, then external, then internal
- Naming conventions: PascalCase for components, camelCase for variables/functions
- Error handling: Use try/catch for async operations
- Game logic: Pure functions, immutable state updates
- UI components: Use Tailwind CSS and DaisyUI
- Testing: Vitest with Testing Library for unit tests

## Testing

- Unit tests in `src/**/__tests__` directories
- Test files use `.test.ts` or `.test.tsx` extension
- Run single test: `npm run test -- <test-file-name>`

## Build System

- Vite for bundling
- TypeScript project references with tsconfig.app.json and tsconfig.node.json
- Output directory: `dist/`
