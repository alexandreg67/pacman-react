import type { Direction, GameState } from '../types'
import { isWall } from '../logic/collision'

export function dirToDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case 'up':
      return { dx: 0, dy: -1 }
    case 'down':
      return { dx: 0, dy: 1 }
    case 'left':
      return { dx: -1, dy: 0 }
    case 'right':
      return { dx: 1, dy: 0 }
  }
}

/**
 * Try to move in the input direction. If blocked by a wall, attempt to
 * continue moving in the current direction (classic buffered turning behavior).
 */
export function attemptMove(state: GameState, inputDir: Direction): GameState {
  // First, try the input direction (requested turn)
  const tryDir = (dir: Direction): GameState | null => {
    const { dx, dy } = dirToDelta(dir)
    const nx = state.pacman.x + dx
    const ny = state.pacman.y + dy
    if (isWall(state.grid, nx, ny)) return null
    return { ...state, pacman: { x: nx, y: ny }, dir }
  }

  const turned = tryDir(inputDir)
  if (turned) return turned

  // If turn blocked, try to continue in current direction
  const continued = tryDir(state.dir)
  if (continued) return continued

  // Completely blocked; update facing to input even if not moving (so UI rotates)
  return { ...state, dir: inputDir }
}
