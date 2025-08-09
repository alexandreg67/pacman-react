# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (TypeScript compilation + Vite build)
- `npm run preview` - Preview production build locally
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint linting
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

### Testing

- `npm run test` - Run tests in watch mode (Vitest)
- `npm run test:run` - Run tests once
- `npm run coverage` - Generate test coverage report
- Single test: `npm run test -- <test-file-pattern>`

### Requirements

- Node.js >= 22.0.0 < 23
- npm >= 10.8.2

## Architecture Overview

This is a Pacman game built with React + TypeScript + Vite, featuring a clean separation between game logic and UI rendering.

### Game Engine Architecture

**Core Game State (`src/game/state.ts`)**

- `GameState` type defines the complete game state including grid, player position, direction, score, etc.
- `initialState()` creates the starting game state with the classic map
- `step()` is the main game loop function that processes input and advances the game by one frame
- `tick()` handles time-based updates (timers, animations)

**Game Loop Pattern**

- React hook `useGame()` drives the game loop at ~11 FPS (90ms intervals)
- Input is buffered via `queuedDir` and applied when movement is valid
- Game logic is pure - no side effects in core game functions

**Grid System (`src/game/grid.ts`)**

- ASCII-based map parsing with legend: `#` = Wall, `.` = Pellet, `o` = Power Pellet, `P` = Pacman spawn
- `CLASSIC_MAP` contains a 28x31 Pacman-like maze
- `parseMap()` converts ASCII strings to typed `Grid` (Cell[][]) with spawn information

**Entity System**

- Pacman movement logic in `src/game/entities/pacman.ts`
- Uses `attemptMove()` for collision detection and position updates
- Direction queueing allows smooth cornering

**Game Logic Modules**

- `src/game/logic/collision.ts` - Wall collision detection
- `src/game/logic/scoring.ts` - Pellet consumption and scoring

### UI Architecture

**Board Rendering (`src/components/Board.tsx`)**

- Grid-based layout using CSS Grid
- Tile-by-tile rendering with calculated positioning
- Wall styling includes smart corner rounding based on neighboring walls
- Pacman positioned absolutely with CSS transforms for smooth movement

**State Management**

- Game state managed by `useGame()` hook (local React state)
- Separate Zustand store (`src/store/gameStore.ts`) exists but appears unused
- All game logic is in pure functions, making testing straightforward

**Styling**

- Tailwind CSS with DaisyUI component library
- Dark theme with blue/yellow color scheme
- Responsive design with tile-based sizing

### Key Design Patterns

1. **Pure Game Logic**: Core game functions are pure with no side effects
2. **State Immutability**: All state updates return new objects
3. **Input Buffering**: Queued direction system for responsive controls
4. **Separation of Concerns**: UI components only handle rendering, game logic is separate
5. **Type Safety**: Comprehensive TypeScript types for game entities and state

### Testing Strategy

- Unit tests with Vitest and Testing Library
- Movement tests in `src/game/__tests__/movement.test.ts`
- Playwright configured for E2E testing
- Test single files with: `npm run test -- movement.test.ts`
