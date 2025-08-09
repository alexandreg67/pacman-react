import type { GameState, Ghost } from '../types'
import { Cell } from '../types'
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
  // Heuristic: use median X of ghosts currently in pen, then scan upward to first non-wall
  const inPen = state.ghosts.filter((g) => g.inPen)
  const h = state.grid.length
  const w = state.grid[0]?.length ?? 0
  const defaultPos = { x: Math.floor(w / 2), y: Math.floor(h / 2) }
  if (inPen.length === 0) return defaultPos
  const sortedX = [...inPen.map((g) => g.pos.x)].sort((a, b) => a - b)
  const medianX = sortedX[Math.floor(sortedX.length / 2)] ?? defaultPos.x
  const minY = Math.min(...inPen.map((g) => g.pos.y))
  for (let y = minY - 1; y >= 0; y--) {
    if (state.grid[y]?.[medianX] && state.grid[y]![medianX] !== Cell.Wall) {
      return { x: medianX, y }
    }
  }
  return defaultPos
}
