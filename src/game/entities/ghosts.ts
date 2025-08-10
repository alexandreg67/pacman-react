import type { Direction, GameState, Ghost } from '../types'
import { isWall } from '../logic/collision'
import { getCurrentGlobalMode } from '../logic/ghostModes'
import { getTargetTileForGhost } from '../logic/ghostAi'
import { shouldReleaseGhost } from '../logic/ghostHouse'
import { getGhostStride } from '../logic/ghostSpeed'
import { handlePacmanDeath } from '../state'

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

    // Decision strictly on tile centers: only choose turns when aligned on grid
    // Our positions are tile-based integers already; this ensures classic behavior
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

  let scoreDelta = 0
  let frightChain = state.frightChain
  const updatedGhosts: Ghost[] = state.ghosts.map((ghost) => {
    // Update ghost mode based on global frightened state
    let currentGhost = ghost
    if (state.frightenedTicks > 0 && ghost.mode !== 'eaten') {
      // Put ghost in frightened mode
      currentGhost = { ...ghost, mode: 'frightened' }
    } else if (state.frightenedTicks === 0 && ghost.mode === 'frightened') {
      // End frightened mode, return to global mode
      currentGhost = { ...ghost, mode: getCurrentGlobalMode(state) }
    }

    // Speed control: stride-based skipping
    const stride = getGhostStride(state, currentGhost)
    const shouldMoveThisTick = state.tickCount % stride === 0
    if (!shouldMoveThisTick) return currentGhost

    // Check collision with Pac-Man BEFORE movement
    if (currentGhost.pos.x === state.pacman.x && currentGhost.pos.y === state.pacman.y) {
      if (state.frightenedTicks > 0 && currentGhost.mode === 'frightened') {
        // Eat ghost (only if in frightened mode)
        const chainIdx = Math.min(frightChain, 3)
        const chainScores = [200, 400, 800, 1600]
        scoreDelta += chainScores[chainIdx]!
        frightChain += 1
        return {
          ...currentGhost,
          mode: 'eaten',
          eyesOnly: true,
        }
      } else if (currentGhost.mode !== 'eaten' && currentGhost.mode !== 'frightened') {
        // Protection temporaire après respawn
        if (state.respawnProtectionTicks > 0) {
          // Ne pas tuer Pacman, juste retourner le fantôme sans collision
          return currentGhost
        }

        // Ghost kills Pacman - handle death
        return {
          ...currentGhost,
          // Marquer ce fantôme comme ayant causé la mort pour traitement spécial
          killedPacman: true,
        } as Ghost & { killedPacman: boolean }
      }
    }
    // Release from pen if conditions met
    if (currentGhost.inPen && shouldReleaseGhost(state, currentGhost)) {
      // Kick ghost one tile upward toward the door when releasing if possible
      const door = getTargetTileForGhost(state, currentGhost)
      const dy = currentGhost.pos.y > door.y ? -1 : 0
      const nx = currentGhost.pos.x
      const ny = currentGhost.pos.y + dy
      if (!isWall(state.grid, nx, ny)) {
        currentGhost = {
          ...currentGhost,
          inPen: false,
          pos: { x: nx, y: ny },
          dir: dy < 0 ? 'up' : currentGhost.dir,
        }
      } else {
        currentGhost = { ...currentGhost, inPen: false }
      }
    }
    // Phase 2: use per-ghost targeting based on modes
    const target = getTargetTileForGhost(state, currentGhost)
    const targetX = target.x
    const targetY = target.y
    const options = getPossibleDirections(state, currentGhost)
    const nextDir = chooseDirectionToward(state, currentGhost, targetX, targetY, options)
    if (!nextDir) return currentGhost

    const { dx, dy } = dirToDelta(nextDir)
    const rawX = currentGhost.pos.x + dx
    const rawY = currentGhost.pos.y + dy
    const { x: wrappedX, wrapped } = handleHorizontalWrapForGhost(state, rawX, rawY)
    const finalX = wrappedX
    const finalY = rawY
    if (isWall(state.grid, finalX, finalY)) return currentGhost
    const moved: Ghost = {
      ...currentGhost,
      pos: { x: finalX, y: finalY },
      dir: nextDir,
      justWrapped: wrapped,
    }
    // If eyes (eaten) reached house target, respawn
    if (moved.mode === 'eaten') {
      const target = getTargetTileForGhost(state, moved)
      // Allow some tolerance for reaching the target (within 1 tile)
      const dx = Math.abs(finalX - target.x)
      const dy = Math.abs(finalY - target.y)
      if (dx <= 1 && dy <= 1) {
        return {
          ...moved,
          mode: getCurrentGlobalMode(state),
          eyesOnly: false,
          inPen: true,
          // Reset to a proper house position
          pos: { x: target.x, y: target.y },
        }
      }
    }
    // Collision with Pac-Man
    if (finalX === state.pacman.x && finalY === state.pacman.y) {
      if (state.frightenedTicks > 0 && moved.mode === 'frightened') {
        // Eat ghost (only if in frightened mode)
        const chainIdx = Math.min(frightChain, 3)
        const chainScores = [200, 400, 800, 1600]
        scoreDelta += chainScores[chainIdx]!
        frightChain += 1
        return {
          ...moved,
          mode: 'eaten',
          eyesOnly: true,
        }
      } else if (moved.mode !== 'eaten' && moved.mode !== 'frightened') {
        // Protection temporaire après respawn
        if (state.respawnProtectionTicks > 0) {
          // Ne pas tuer Pacman, juste retourner le fantôme sans collision
          return ghost // Fantôme reste à sa position précédente
        }

        // Ghost kills Pacman - handle death
        return {
          ...moved,
          // Marquer ce fantôme comme ayant causé la mort pour traitement spécial
          killedPacman: true,
        } as Ghost & { killedPacman: boolean }
      }
    }

    return moved
  })

  // Vérifier si un fantôme a tué Pacman
  const ghostKilledPacman = updatedGhosts.some(
    (ghost) =>
      'killedPacman' in ghost && (ghost as Ghost & { killedPacman?: boolean }).killedPacman,
  )

  if (ghostKilledPacman) {
    // Nettoyer la propriété killedPacman des fantômes
    const cleanedGhosts = updatedGhosts.map((ghost) => {
      if ('killedPacman' in ghost) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { killedPacman, ...cleanGhost } = ghost as Ghost & { killedPacman: boolean }
        return cleanGhost
      }
      return ghost
    })
    // Appliquer la mort de Pacman
    return handlePacmanDeath({
      ...state,
      ghosts: cleanedGhosts,
      score: state.score + scoreDelta,
      frightChain,
    })
  }

  if (scoreDelta !== 0 || frightChain !== state.frightChain) {
    return { ...state, ghosts: updatedGhosts, score: state.score + scoreDelta, frightChain }
  }
  return { ...state, ghosts: updatedGhosts }
}
