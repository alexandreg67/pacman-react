import type { GameState, Ghost } from '../types'

// Phase 0: skeleton implementation. Returns a neutral target (current position)
export function getTargetTileForGhost(_state: GameState, ghost: Ghost): { x: number; y: number } {
  return { x: ghost.pos.x, y: ghost.pos.y }
}
