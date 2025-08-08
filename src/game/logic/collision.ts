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
