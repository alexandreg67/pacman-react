import type { Direction, GameState, Ghost } from '../types'
import { isWall } from '../logic/collision'
import { getCurrentGlobalMode } from '../logic/ghostModes'
import { getTargetTileForGhost } from '../logic/ghostAi'

type Delta = { dx: number; dy: number }

function dirToDelta(dir: Direction): Delta {
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

function opposite(dir: Direction): Direction {
  switch (dir) {
    case 'up':
      return 'down'
    case 'down':
      return 'up'
    case 'left':
      return 'right'
    case 'right':
      return 'left'
  }
}

function handleHorizontalWrapForGhost(
  state: GameState,
  nx: number,
  ny: number,
): { x: number; wrapped: boolean } {
  const w = state.grid[0]?.length ?? 0
  if (!state.tunnelRows.includes(ny)) return { x: nx, wrapped: false }
  if (nx < 0) {
    if (!isWall(state.grid, w - 1, ny)) return { x: w - 1, wrapped: true }
  } else if (nx >= w) {
    if (!isWall(state.grid, 0, ny)) return { x: 0, wrapped: true }
  }
  return { x: nx, wrapped: false }
}

function getPossibleDirections(state: GameState, ghost: Ghost): Direction[] {
  const dirs: Direction[] = ['up', 'left', 'down', 'right']
  const result: Direction[] = []
  const w = state.grid[0]?.length ?? 0
  const h = state.grid.length
  for (const dir of dirs) {
    const { dx, dy } = dirToDelta(dir)
    let nx = ghost.pos.x + dx
    const ny = ghost.pos.y + dy

    // horizontal wrap consideration
    const { x: wrappedX } = handleHorizontalWrapForGhost(state, nx, ny)
    nx = wrappedX

    // vertical bounds (no vertical wrap in classic)
    if (ny < 0 || ny >= h) continue
    if (nx < 0 || nx >= w) continue
    if (isWall(state.grid, nx, ny)) continue
    result.push(dir)
  }
  return result
}

function squaredDistance(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx
  const dy = ay - by
  return dx * dx + dy * dy
}

const TIE_BREAK: Direction[] = ['up', 'left', 'down', 'right']

function chooseDirectionToward(
  state: GameState,
  ghost: Ghost,
  targetX: number,
  targetY: number,
  options: Direction[],
): Direction | null {
  // Disallow immediate reverse unless no other choice
  const nonReverse = options.filter((d) => d !== opposite(ghost.dir))
  const candidates = nonReverse.length > 0 ? nonReverse : options

  if (candidates.length === 0) return null

  let best: Direction = candidates[0]
  let bestScore = Number.POSITIVE_INFINITY
  for (const dir of candidates) {
    const { dx, dy } = dirToDelta(dir)
    const nx = ghost.pos.x + dx
    const ny = ghost.pos.y + dy
    const { x: fx } = handleHorizontalWrapForGhost(state, nx, ny)
    const score = squaredDistance(fx, ny, targetX, targetY)
    if (
      score < bestScore ||
      (score === bestScore && TIE_BREAK.indexOf(dir) < TIE_BREAK.indexOf(best))
    ) {
      best = dir
      bestScore = score
    }
  }
  return best
}

export function stepGhosts(state: GameState): GameState {
  if (!state.ghosts || state.ghosts.length === 0) return state

  const updatedGhosts: Ghost[] = state.ghosts.map((ghost) => {
    // Phase 2: use per-ghost targeting based on modes
    const target = getTargetTileForGhost(state, ghost)
    const targetX = target.x
    const targetY = target.y
    const options = getPossibleDirections(state, ghost)
    const nextDir = chooseDirectionToward(state, ghost, targetX, targetY, options)
    if (!nextDir) return ghost

    const { dx, dy } = dirToDelta(nextDir)
    const rawX = ghost.pos.x + dx
    const rawY = ghost.pos.y + dy
    const { x: wrappedX, wrapped } = handleHorizontalWrapForGhost(state, rawX, rawY)
    const finalX = wrappedX
    const finalY = rawY
    if (isWall(state.grid, finalX, finalY)) return ghost
    const moved: Ghost = {
      ...ghost,
      pos: { x: finalX, y: finalY },
      dir: nextDir,
      justWrapped: wrapped,
    }
    // If eyes (eaten) reached house target, respawn
    if (ghost.mode === 'eaten') {
      const target = getTargetTileForGhost(state, ghost)
      if (finalX === target.x && finalY === target.y) {
        return {
          ...moved,
          mode: getCurrentGlobalMode(state),
          eyesOnly: false,
          inPen: true,
        }
      }
    }
    return moved
  })

  return { ...state, ghosts: updatedGhosts }
}
