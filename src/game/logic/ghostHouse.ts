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
  const h = state.grid.length
  const w = state.grid[0]?.length ?? 0
  // Approximate center as door; can be refined to actual door cell later
  return { x: Math.floor(w / 2), y: Math.floor(h / 2) }
}
