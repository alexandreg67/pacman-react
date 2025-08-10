# Agent Development Guide

## Build/Lint/Test Commands

```bash
# Core development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Code quality
npm run typecheck        # TypeScript type checking
npm run lint             # ESLint linting
npm run lint:fix         # Auto-fix ESLint issues
npm run format           # Prettier formatting

# Testing
npm run test             # Run tests in watch mode
npm run test:run         # Run tests once
npm run test -- movement # Run specific test file
npm run coverage         # Test coverage report

# Performance
npm run performance      # Run performance tests
npm run performance:quick # Quick performance test
```

## Code Style Guidelines

### Formatting

- Single quotes for strings
- No semicolons
- Trailing commas in objects/arrays
- Print width: 100 characters
- Use Prettier for automatic formatting

### Imports

- Absolute imports preferred (e.g., `src/game/types`)
- Group imports: built-in, external, internal
- Import types with `import type` when possible
- No unused imports

### TypeScript

- Strict mode enabled
- Explicit typing preferred
- Use interfaces for object shapes
- Use types for unions/primitives
- No unused locals/parameters

### Naming Conventions

- PascalCase for components and types
- camelCase for variables/functions
- UPPER_SNAKE_CASE for constants
- Descriptive function/variable names

### React Patterns

- Use React.memo for performance optimization
- useMemo/useCallback for expensive calculations
- Pure functions for game logic
- Separate UI from business logic

### Error Handling

- No console.log in production code
- Use console.warn/error for debugging
- Handle edge cases in game logic
- Type-safe error boundaries

### Performance

- Target 16+ FPS for game loop
- Use requestAnimationFrame for game loop
- Memoize expensive calculations
- Limit DOM elements (<500)
- Cache wall styles and other repeated calculations
