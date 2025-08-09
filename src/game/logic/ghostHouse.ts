import type { GameState, Ghost } from '../types'

// Phase 0: placeholders for pen and release logic
export function isGhostInPen(ghost: Ghost): boolean {
  return ghost.inPen
}

export function shouldReleaseGhost(state: GameState, ghost: Ghost): boolean {
  // Touch params to satisfy lint while remaining Phase 0 no-op
  void state
  void ghost
  return false
}

export function getHouseDoorTarget(state: GameState): { x: number; y: number } {
  const h = state.grid.length
  const w = state.grid[0]?.length ?? 0
  // Approximate center as door; can be refined to actual door cell later
  return { x: Math.floor(w / 2), y: Math.floor(h / 2) }
}
