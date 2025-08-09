import { CLASSIC_MAP, parseMap, computeTunnelRows } from './grid'
import type { Direction, GameState } from './types'
import { Cell } from './types'
import { attemptMove } from './entities/pacman'
import { consumeIfAny } from './logic/scoring'
import { stepGhosts } from './entities/ghosts'
import { advanceGlobalModeTimer, getModeSchedule } from './logic/ghostModes'

export function initialState(): GameState {
  // Load the classic-like map by default
  const { grid, spawn } = parseMap(CLASSIC_MAP)
  const pellets = grid
    .map((row) => row.filter((c) => c === Cell.Pellet || c === Cell.PowerPellet).length)
    .reduce((a, b) => a + b, 0)

  // Détection dynamique des tunnels horizontaux
  // Analyse automatiquement la grille pour identifier les lignes où le wrap est possible
  // Remplace les anciennes constantes hardcodées par un algorithme adaptatif
  const tunnelRows = computeTunnelRows(grid)
  return {
    grid,
    pacman: { ...spawn.pacman },
    dir: 'left',
    queuedDir: undefined,
    score: 0,
    lives: 3,
    pelletsRemaining: pellets,
    frightenedTicks: 0,
    tickCount: 0,
    tunnelRows,
    // Ghost system (Phase 0 defaults)
    ghosts: [],
    level: 1,
    globalModeIndex: 0,
    globalModeTicksRemaining: getModeSchedule(1)[0]!.durationTicks,
    frightChain: 0,
    dotsEaten: 0,
    elroy: { phase: 0 },
  }
}

export function tick(state: GameState): GameState {
  // Global mode timer
  const { index, ticksRemaining } = advanceGlobalModeTimer(state)
  // Decay frightened timer if active
  const frightenedTicks = Math.max(0, state.frightenedTicks - 1)
  return {
    ...state,
    frightenedTicks,
    globalModeIndex: index,
    globalModeTicksRemaining: ticksRemaining,
    tickCount: state.tickCount + 1,
  }
}

export function step(state: GameState, inputDir?: Direction): GameState {
  let next: GameState = state

  // Réinitialiser justWrapped du step précédent
  next = { ...next, justWrapped: false }

  // Buffer desired direction
  if (typeof inputDir !== 'undefined') {
    next = { ...next, queuedDir: inputDir }
  }

  // Try to move: prefer queuedDir, else current dir
  const desired: Direction | undefined = next.queuedDir ?? next.dir
  if (desired) {
    const moved = attemptMove(next, desired)
    next = moved

    // If we successfully moved in queuedDir, clear the queue
    if (next.dir === next.queuedDir) {
      next = { ...next, queuedDir: undefined }
    }
  }

  next = consumeIfAny(next)
  // Phase 1: process ghosts movement (no-op if none)
  next = stepGhosts(next)
  next = tick(next)
  return next
}
