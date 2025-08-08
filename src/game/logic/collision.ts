import { Cell, Grid } from '../types'

export function inBounds(grid: Grid, x: number, y: number): boolean {
  return y >= 0 && y < grid.length && x >= 0 && x < grid[0].length
}

export function isWall(grid: Grid, x: number, y: number): boolean {
  if (!inBounds(grid, x, y)) return true
  return grid[y][x] === Cell.Wall
}
