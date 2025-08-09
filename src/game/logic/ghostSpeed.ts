import type { GameState, Ghost } from '../types'

// Phase 0: simple placeholder returning Pac-Man step timing as baseline
export function getGhostStepMs(state: GameState, ghost: Ghost): number {
  // Touch params to satisfy lint while remaining no-op
  void state
  void ghost
  // Will be replaced with per-level/mode/tunnel tables
  return 80
}
