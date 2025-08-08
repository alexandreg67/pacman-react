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

export function attemptMove(state: GameState, dir: Direction): GameState {
  const { dx, dy } = dirToDelta(dir)
  const nx = state.pacman.x + dx
  const ny = state.pacman.y + dy
  if (isWall(state.grid, nx, ny)) {
    // blocked; keep position, but update facing direction
    return { ...state, dir }
  }
  return { ...state, pacman: { x: nx, y: ny }, dir }
}
