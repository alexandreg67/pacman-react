# GEMINI Code Assistant Report: pacman-react

## 1. Project Overview

This project is a modern implementation of the classic Pacman game, built with a strong focus on performance and leveraging a modern web development stack.

- **Core Technologies**: React 19, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Testing**: Vitest, Playwright
- **Code Quality**: ESLint, Prettier, lint-staged, husky (for git hooks)

The architecture emphasizes a clear separation between the game logic (pure functions, state management) and the UI (React components). The game loop is highly optimized using `requestAnimationFrame` for smooth animations and efficient rendering. The codebase makes extensive use of React's performance optimization features, such as `React.memo`, `useCallback`, and `useMemo`, to minimize re-renders and ensure a fluid gameplay experience.

## 2. Building and Running

### Prerequisites

- Node.js >= 22.0.0 < 23
- npm >= 10.8.2

### Installation

```bash
npm install
```

### Key Scripts

- **Development**: Run a local development server with hot-reloading and performance monitoring.

  ```bash
  npm run dev
  ```

- **Building for Production**: Compile and minify the application for production.

  ```bash
  npm run build
  ```

- **Running Tests**: Execute the test suite using Vitest.

  ```bash
  npm run test
  ```

- **Linting and Formatting**:
  ```bash
  npm run lint     # Check for linting errors
  npm run format   # Format code with Prettier
  ```

## 3. Development Conventions

### Coding Style

- **TypeScript**: The project uses TypeScript for static typing, enhancing code quality and maintainability.
- **ESLint and Prettier**: A strict set of ESLint rules is enforced to maintain a consistent code style. Prettier is used for automatic code formatting. These are automatically run on pre-commit thanks to `husky` and `lint-staged`.
- **Component-Based Architecture**: The UI is built using a component-based architecture, with a clear separation of concerns.
- **Performance-First**: The codebase is written with performance in mind, with a focus on minimizing re-renders and optimizing the game loop.

### Testing

- **Unit and Integration Tests**: The project uses Vitest for unit and integration testing of components and game logic.
- **End-to-End Tests**: Playwright is set up for end-to-end testing, although no tests are implemented yet.

### State Management

- **Zustand**: The project uses Zustand for global state management. This is a lightweight and performant state management solution that integrates well with React hooks.
- **Local State**: For component-specific state, React's built-in `useState` and `useReducer` hooks are used.

### Git Workflow

- **Conventional Commits**: The project uses conventional commits to enforce a consistent commit message format. This is enforced by `commitlint` and `husky`.
- **Pre-commit Hooks**: Pre-commit hooks are set up with `husky` and `lint-staged` to run linting and formatting checks before each commit.
