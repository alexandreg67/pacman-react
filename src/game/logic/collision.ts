import { Cell } from '../types'
import type { Grid } from '../types'
import { HOUSE_BOUNDS } from './ghostHouse'

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
export function isGhostBlocked(
  grid: Grid,
  x: number,
  y: number,
  isEaten: boolean,
  ghostX?: number,
  ghostY?: number,
): boolean {
  if (!inBounds(grid, x, y)) return true
  const cell = grid[y][x]
  // Les fantômes en mode "eaten" (yeux) peuvent passer partout
  if (isEaten) return cell === Cell.Wall

  // Pour les GhostDoor : permettre aux fantômes de sortir de la maison mais pas d'y entrer
  if (cell === Cell.GhostDoor) {
    // Vérifier si le fantôme est dans la zone de la maison
    // Si oui, il peut passer la porte pour sortir
    // Si non, il ne peut pas passer la porte pour entrer
    if (ghostX !== undefined && ghostY !== undefined) {
      const isInsideHouse =
        ghostY >= HOUSE_BOUNDS.TOP &&
        ghostY <= HOUSE_BOUNDS.BOTTOM &&
        ghostX >= HOUSE_BOUNDS.LEFT &&
        ghostX <= HOUSE_BOUNDS.RIGHT
      return !isInsideHouse
    }
    // Si on n'a pas les coordonnées, bloquer par sécurité
    return true
  }

  return cell === Cell.Wall
}
