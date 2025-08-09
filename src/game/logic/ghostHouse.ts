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
