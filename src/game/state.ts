import { CLASSIC_MAP, parseMap, computeTunnelRows } from './grid'
import type { Direction, GameState } from './types'
import { Cell } from './types'
import { attemptMove } from './entities/pacman'
import { consumeIfAnyWithAudio } from './logic/scoring'
import { stepGhosts } from './entities/ghosts'
import { advanceGlobalModeTimer, getModeSchedule } from './logic/ghostModes'
import { INITIAL_GHOST_POSITIONS } from './logic/ghostHouse'
import { expireFruits } from './logic/fruits'
import { shouldAdvanceLevel, advanceLevel } from './logic/levelManager'

export function initialState(
  mode: 'classic' | 'easy' | 'hard' | 'speedrun' | 'survival' = 'classic',
): GameState {
  // Load the classic-like map by default
  const { grid, spawn } = parseMap(CLASSIC_MAP)
  const pellets = grid
    .map((row) => row.filter((c) => c === Cell.Pellet || c === Cell.PowerPellet).length)
    .reduce((a, b) => a + b, 0)

  // Détection dynamique des tunnels horizontaux
  // Analyse automatiquement la grille pour identifier les lignes où le wrap est possible
  // Remplace les anciennes constantes hardcodées par un algorithme adaptatif
  const tunnelRows = computeTunnelRows(grid)

  // Nombre de vies selon le mode
  const lives = mode === 'survival' ? 1 : 3

  return {
    grid,
    pacman: { ...spawn.pacman },
    dir: 'left',
    queuedDir: undefined,
    score: 0,
    lives,
    pelletsRemaining: pellets,
    frightenedTicks: 0,
    tickCount: 0,
    tunnelRows,
    gameStatus: 'playing',
    deathAnimationTicks: 0,
    started: false,
    gameStartTime: 0,
    respawnProtectionTicks: 0, // Add missing property
    // Ghost system (Phase 0 defaults)
    ghosts: INITIAL_GHOST_POSITIONS.map((pos, index) => {
      const ghostIds = ['blinky', 'pinky', 'inky', 'clyde'] as const
      return {
        id: ghostIds[index]!,
        pos: { x: pos.x, y: pos.y },
        dir: index === 0 ? 'left' : 'up',
        mode: 'scatter',
        inPen: pos.inPen,
        dotCounter: 0,
        eyesOnly: false,
        frightenedFlash: false,
      }
    }),
    level: 1,
    globalModeIndex: 0,
    globalModeTicksRemaining: getModeSchedule(1)[0]!.durationTicks,
    frightChain: 0,
    dotsEaten: 0,
    elroy: { phase: 0 },
    audioEvent: null,
  }
}

export function handlePacmanDeath(state: GameState): GameState {
  const newLives = state.lives - 1

  if (newLives <= 0) {
    return {
      ...state,
      lives: 0,
      gameStatus: 'game-over',
      deathAnimationTicks: 30, // Shorter animation for game over
    }
  }

  // Respawn: reset Pacman to initial position and reinitialize ghosts
  const { spawn } = parseMap(CLASSIC_MAP)
  return {
    ...state,
    lives: newLives,
    pacman: { ...spawn.pacman },
    dir: 'left',
    queuedDir: undefined,
    deathAnimationTicks: 20, // Shorter animation (1.5-2 seconds)
    frightenedTicks: 0,
    frightChain: 0,
    started: true, // IMPORTANT: Keep game started after respawn
    respawnProtectionTicks: 60, // 2 seconds of post-respawn invincibility (adjustable)
    // Reset ghosts to their initial positions
    ghosts: state.ghosts.map((ghost, index) => {
      const initialPos = INITIAL_GHOST_POSITIONS[index]!
      return {
        ...ghost,
        pos: { x: initialPos.x, y: initialPos.y },
        dir: index === 0 ? 'left' : 'up',
        mode: 'scatter',
        inPen: initialPos.inPen,
        eyesOnly: false,
        frightenedFlash: false,
      }
    }),
  }
}

export function tick(state: GameState): GameState {
  // Si on est en game over, ne pas continuer le jeu
  if (state.gameStatus === 'game-over') {
    return state
  }

  // Décrémenter l'animation de mort
  const deathAnimationTicks = Math.max(0, state.deathAnimationTicks - 1)

  // Décrémenter la protection post-respawn
  const respawnProtectionTicks = state.respawnProtectionTicks
    ? Math.max(0, state.respawnProtectionTicks - 1)
    : 0

  // Si l'animation de mort est terminée et qu'on a encore des vies, reprendre le jeu
  let gameStatus = state.gameStatus
  if (state.deathAnimationTicks > 0 && deathAnimationTicks === 0 && state.lives > 0) {
    gameStatus = 'playing'
  }

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
    deathAnimationTicks,
    gameStatus,
    respawnProtectionTicks,
  }
}

export function step(state: GameState, inputDir?: Direction): GameState {
  let next: GameState = state

  // Si on est en game over, ne traiter que le tick
  if (state.gameStatus === 'game-over') {
    return tick(next)
  }

  // Si on est en animation de mort, permettre le buffer d'input mais pas le mouvement
  if (state.deathAnimationTicks > 0) {
    // Buffer l'input pour après l'animation
    if (typeof inputDir !== 'undefined') {
      next = { ...next, queuedDir: inputDir }
    }
    return tick(next)
  }

  // Réinitialiser justWrapped du step précédent
  next = { ...next, justWrapped: false }

  // Buffer desired direction
  if (typeof inputDir !== 'undefined') {
    next = { ...next, queuedDir: inputDir }
  }

  // Marquer le jeu comme commencé si on reçoit un input
  if (inputDir && !next.started) {
    next = { ...next, started: true, gameStartTime: Date.now() }
  }

  // Try to move: prefer queuedDir, else current dir only if game has started
  const desired: Direction | undefined = next.queuedDir ?? (next.started ? next.dir : undefined)
  let shouldConsume = false

  if (desired) {
    const moved = attemptMove(next, desired)
    next = moved
    shouldConsume = true

    // If we successfully moved in queuedDir, clear the queue
    if (next.dir === next.queuedDir) {
      next = { ...next, queuedDir: undefined }
    }
  }

  // In classic Pacman, Pacman can consume pellets when:
  // 1. He successfully moves to a new position
  // 2. He tries to move but can't (hitting a wall) - he "chomps" in place
  // 3. The game has started and he's on a pellet (continuous chomping)
  if (shouldConsume) {
    const consumption = consumeIfAnyWithAudio(next)
    next = {
      ...consumption.newState,
      audioEvent: consumption.consumed,
    }
  } else {
    // Clear audio event when no consumption
    next = { ...next, audioEvent: null }
  }
  // Reset fright chain when not frightened
  if (next.frightenedTicks === 0 && next.frightChain !== 0) {
    next = { ...next, frightChain: 0 }
  }
  // If level cleared, advance to next level before moving ghosts/timers
  if (shouldAdvanceLevel(next)) {
    next = advanceLevel(next)
  }
  // Phase 1: process ghosts movement (no-op if none)
  next = stepGhosts(next)
  next = tick(next)
  // Phase 3: expire fruits after ticking
  next = expireFruits(next)
  return next
}
