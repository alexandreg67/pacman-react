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
  // For our specific CLASSIC_MAP, the house entrance is at row 9 (0-indexed)
  // and the entrance is in the middle of the map
  const w = state.grid[0]?.length ?? 0
  const houseDoorX = Math.floor(w / 2) // Should be around column 14 (center)
  const houseDoorY = 9 // Row where the entrance is open

  return { x: houseDoorX, y: houseDoorY }
}

export function getHouseCenterTarget(state: GameState): { x: number; y: number } {
  // The actual center of the ghost house for respawning
  const w = state.grid[0]?.length ?? 0
  const houseCenterX = Math.floor(w / 2)
  const houseCenterY = 14 // Middle of the house area

  return { x: houseCenterX, y: houseCenterY }
}
