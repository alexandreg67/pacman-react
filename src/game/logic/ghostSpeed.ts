import type { GameState, Ghost } from '../types'

// Returns how many ticks to skip between ghost moves (1 = every tick)
export function getGhostStride(state: GameState, ghost: Ghost): number {
  let stride = 2 // base: move every 2 ticks (slower than Pac-Man)
  const inTunnel = state.tunnelRows.includes(ghost.pos.y)
  if (inTunnel) stride += 1 // slower in tunnel
  if (state.frightenedTicks > 0 && ghost.mode !== 'eaten') stride += 1 // slower when frightened
  // Eaten (eyes) return quickly
  if (ghost.mode === 'eaten') stride = Math.max(1, stride - 1)
  return stride
}
