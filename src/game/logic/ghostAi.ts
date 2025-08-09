import type { Direction, GameState, Ghost } from '../types'
import { getCurrentGlobalMode } from './ghostModes'
import { getHouseDoorTarget } from './ghostHouse'

function dirToDelta(dir: Direction): { dx: number; dy: number } {
  switch (dir) {
    case 'up':
      return { dx: 0, dy: -1 }
    case 'down':
      return { dx: 0, dy: 1 }
    case 'left':
      return { dx: -1, dy: 0 }
    case 'right':
      return { dx: 1, dy: 0 }
  }
}

function scatterCornerFor(id: Ghost['id'], grid: GameState['grid']): { x: number; y: number } {
  const h = grid.length
  const w = grid[0]?.length ?? 0
  switch (id) {
    case 'blinky':
      return { x: w - 1, y: 0 }
    case 'pinky':
      return { x: 0, y: 0 }
    case 'inky':
      return { x: w - 1, y: h - 1 }
    case 'clyde':
      return { x: 0, y: h - 1 }
  }
}

export function getTargetTileForGhost(state: GameState, ghost: Ghost): { x: number; y: number } {
  // If still in pen, target the door to exit
  if (ghost.inPen && ghost.mode !== 'eaten') {
    return getHouseDoorTarget(state)
  }
  // Mode eaten returns to house center (approx: map center). Refined in Phase 3.
  if (ghost.mode === 'eaten') {
    return getHouseDoorTarget(state)
  }

  const globalMode = getCurrentGlobalMode(state)
  if (globalMode === 'scatter') {
    return scatterCornerFor(ghost.id, state.grid)
  }

  if (ghost.mode === 'frightened') {
    // Frightened: pick a nearby random drift target (simple approximation)
    // Deterministic pseudo-random based on tickCount and ghost id
    const seed = (state.tickCount * 131 + ghost.id.length * 17) % 7
    const dx = [-2, -1, 0, 1, 2][seed % 5]
    const dy = [-2, -1, 0, 1, 2][(seed + 3) % 5]
    return {
      x: Math.max(0, Math.min((state.grid[0]?.length ?? 1) - 1, ghost.pos.x + dx)),
      y: Math.max(0, Math.min(state.grid.length - 1, ghost.pos.y + dy)),
    }
  }

  // Chase: per-ghost targeting
  switch (ghost.id) {
    case 'blinky': {
      return { x: state.pacman.x, y: state.pacman.y }
    }
    case 'pinky': {
      const ahead = 4
      const { dx, dy } = dirToDelta(state.dir)
      // Pinky bug: when facing up, classic targets up-left by 4 (x-4)
      const bugDx = state.dir === 'up' ? -4 : 0
      return {
        x: state.pacman.x + dx * ahead + bugDx,
        y: state.pacman.y + dy * ahead,
      }
    }
    case 'inky': {
      // Inky targets: 2 tiles ahead of Pac-Man, then vector from Blinky to that pivot doubled
      const { dx, dy } = dirToDelta(state.dir)
      const pivotX = state.pacman.x + dx * 2
      const pivotY = state.pacman.y + dy * 2
      const blinky = state.ghosts?.find((g) => g.id === 'blinky')
      if (!blinky) return { x: pivotX, y: pivotY }
      const vectorX = pivotX - blinky.pos.x
      const vectorY = pivotY - blinky.pos.y
      return { x: pivotX + vectorX, y: pivotY + vectorY }
    }
    case 'clyde': {
      const dx = state.pacman.x - ghost.pos.x
      const dy = state.pacman.y - ghost.pos.y
      const dist2 = dx * dx + dy * dy
      if (dist2 >= 8 * 8) return { x: state.pacman.x, y: state.pacman.y }
      return scatterCornerFor('clyde', state.grid)
    }
  }
}
