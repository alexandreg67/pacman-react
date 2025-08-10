export type Vec = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'

export const Cell = {
  Empty: 'Empty',
  Wall: 'Wall',
  Pellet: 'Pellet',
  PowerPellet: 'PowerPellet',
} as const
export type Cell = (typeof Cell)[keyof typeof Cell]

export type Grid = Cell[][]

export type SpawnInfo = {
  pacman: Vec
}

// Ghost system types (Phase 0)
export type GhostId = 'blinky' | 'pinky' | 'inky' | 'clyde'
export type GhostMode = 'scatter' | 'chase' | 'frightened' | 'eaten'

export type Ghost = {
  id: GhostId
  pos: Vec
  dir: Direction
  mode: GhostMode
  inPen: boolean
  dotCounter: number
  eyesOnly: boolean
  frightenedFlash: boolean
  justWrapped?: boolean
}

export type GameStatus = 'playing' | 'game-over' | 'paused'

export type GameState = {
  grid: Grid
  pacman: Vec
  dir: Direction
  queuedDir?: Direction
  score: number
  lives: number
  pelletsRemaining: number
  frightenedTicks: number
  tickCount: number
  tunnelRows: number[]
  justWrapped?: boolean // Indique qu'un wrap vient d'avoir lieu (pour optimisations UI)
  gameStatus: GameStatus
  deathAnimationTicks: number // Durée animation de mort
  // Future: tunnelCols: number[] pour le wrap vertical
  // Ghost system (added in Phase 0; not yet used for gameplay)
  ghosts: Ghost[]
  level: number
  globalModeIndex: number
  globalModeTicksRemaining: number
  frightChain: number
  dotsEaten: number
  elroy: { phase: 0 | 1 | 2 }
}

export const SCORES = {
  pellet: 10,
  powerPellet: 50,
} as const

export const TIMERS = {
  frightenedDurationTicks: 40,
} as const
