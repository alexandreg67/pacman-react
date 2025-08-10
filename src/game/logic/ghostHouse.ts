import type { GameState, Ghost } from '../types'
import { getReleaseThresholds } from './ghostSpeed'

// Phase 0: placeholders for pen and release logic
export function isGhostInPen(ghost: Ghost): boolean {
  return ghost.inPen
}

export function shouldReleaseGhost(state: GameState, ghost: Ghost): boolean {
  // Simplified release: blinky always out; others when some dots eaten
  if (ghost.id === 'blinky') return true
  const t = getReleaseThresholds(state.level)
  const limit = (ghost.id === 'inky' ? t.inky : ghost.id === 'clyde' ? t.clyde : t.pinky) ?? 0
  return state.dotsEaten >= limit
}

export function getHouseDoorTarget(state: GameState): { x: number; y: number } {
  // For the classic Pac-Man maze, the ghost house is typically around the center
  // Based on our grid, let's find the house center more accurately
  const h = state.grid.length
  const w = state.grid[0]?.length ?? 0

  // Look for the ghost house area - typically around the center of the maze
  // In the classic layout, this is around coordinates (13, 14)
  const houseCenterX = Math.floor(w / 2)
  const houseCenterY = Math.floor(h / 2)

  // For eaten ghosts, they should return to a specific position in the house
  // Let's use a fixed position that should work for the classic maze
  return { x: houseCenterX, y: houseCenterY }
}
