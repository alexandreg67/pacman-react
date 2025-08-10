import type { GameState, Ghost } from '../types'
import { getReleaseThresholds } from './ghostSpeed'

// Constantes pour la maison des fantômes
export const HOUSE_BOUNDS = {
  TOP: 12,
  BOTTOM: 16,
  LEFT: 10,
  RIGHT: 17,
} as const

export const HOUSE_DOOR_Y = 9
export const HOUSE_CENTER_Y = 14

// Positions initiales des fantômes
export const INITIAL_GHOST_POSITIONS = [
  { x: 13, y: 9, inPen: false }, // blinky
  { x: 13, y: 14, inPen: true }, // pinky
  { x: 11, y: 14, inPen: true }, // inky
  { x: 15, y: 14, inPen: true }, // clyde
] as const

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
  // For our specific CLASSIC_MAP, the house entrance is at row HOUSE_DOOR_Y (0-indexed)
  // and the entrance is in the middle of the map
  const w = state.grid[0]?.length ?? 0
  const houseDoorX = Math.floor(w / 2) // Should be around column 14 (center)

  return { x: houseDoorX, y: HOUSE_DOOR_Y }
}

export function getHouseCenterTarget(state: GameState): { x: number; y: number } {
  // The actual center of the ghost house for respawning
  const w = state.grid[0]?.length ?? 0
  const houseCenterX = Math.floor(w / 2)

  return { x: houseCenterX, y: HOUSE_CENTER_Y }
}
