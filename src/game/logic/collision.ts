import { Cell } from '../types'
import type { Grid } from '../types'

export function inBounds(grid: Grid, x: number, y: number): boolean {
  if (grid.length === 0) return false
  const row0 = grid[0]
  if (!row0) return false
  return y >= 0 && y < grid.length && x >= 0 && x < row0.length
}

export function isWall(grid: Grid, x: number, y: number): boolean {
  if (!inBounds(grid, x, y)) return true
  return grid[y][x] === Cell.Wall
}

/**
 * Vérifie si Pac-Man peut passer dans une cellule
 * (les murs et les portes des fantômes bloquent Pac-Man)
 */
export function isPacmanBlocked(grid: Grid, x: number, y: number): boolean {
  if (!inBounds(grid, x, y)) return true
  const cell = grid[y][x]
  return cell === Cell.Wall || cell === Cell.GhostDoor
}

/**
 * Vérifie si un fantôme peut passer dans une cellule
 * (seuls les murs bloquent les fantômes, sauf en mode eaten)
 */
export function isGhostBlocked(grid: Grid, x: number, y: number, isEaten: boolean): boolean {
  if (!inBounds(grid, x, y)) return true
  // Les fantômes en mode "eaten" (yeux) peuvent passer partout
  if (isEaten) return false
  return grid[y][x] === Cell.Wall
}
