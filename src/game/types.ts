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
  // Future: tunnelCols: number[] pour le wrap vertical
}

export const SCORES = {
  pellet: 10,
  powerPellet: 50,
} as const

export const TIMERS = {
  frightenedDurationTicks: 40,
} as const
