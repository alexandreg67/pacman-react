export type Vec = { x: number; y: number }
export type Direction = 'up' | 'down' | 'left' | 'right'

export enum Cell {
  Empty = 0,
  Wall = 1,
  Pellet = 2,
  PowerPellet = 3,
}

export type Grid = Cell[][]

export type SpawnInfo = {
  pacman: Vec
}

export type GameState = {
  grid: Grid
  pacman: Vec
  dir: Direction
  score: number
  lives: number
  pelletsRemaining: number
  frightenedTicks: number
}

export const SCORES = {
  pellet: 10,
  powerPellet: 50,
}

export const TIMERS = {
  frightenedDurationTicks: 40,
}
