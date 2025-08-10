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
    gameStatus: 'playing',
    deathAnimationTicks: 0,
    started: false,
    respawnProtectionTicks: 0, // Ajout de la propriété manquante
    // Ghost system (Phase 0 defaults)
    ghosts: [
      {
        id: 'blinky',
        pos: { x: 13, y: 11 },
        dir: 'left',
        mode: 'scatter',
        inPen: false,
        dotCounter: 0,
        eyesOnly: false,
        frightenedFlash: false,
      },
      {
        id: 'pinky',
        pos: { x: 13, y: 14 },
        dir: 'up',
        mode: 'scatter',
        inPen: true,
        dotCounter: 0,
        eyesOnly: false,
        frightenedFlash: false,
      },
      {
        id: 'inky',
        pos: { x: 11, y: 14 },
        dir: 'up',
        mode: 'scatter',
        inPen: true,
        dotCounter: 0,
        eyesOnly: false,
        frightenedFlash: false,
      },
      {
        id: 'clyde',
        pos: { x: 15, y: 14 },
        dir: 'up',
        mode: 'scatter',
        inPen: true,
        dotCounter: 0,
        eyesOnly: false,
        frightenedFlash: false,
      },
    ],
    level: 1,
    globalModeIndex: 0,
    globalModeTicksRemaining: getModeSchedule(1)[0]!.durationTicks,
    frightChain: 0,
    dotsEaten: 0,
    elroy: { phase: 0 },
  }
}

export function handlePacmanDeath(state: GameState): GameState {
  const newLives = state.lives - 1

  if (newLives <= 0) {
    return {
      ...state,
      lives: 0,
      gameStatus: 'game-over',
      deathAnimationTicks: 30, // Animation plus courte pour game over
    }
  }

  // Respawn: remettre Pacman à sa position initiale et réinitialiser les fantômes
  const { spawn } = parseMap(CLASSIC_MAP)
  return {
    ...state,
    lives: newLives,
    pacman: { ...spawn.pacman },
    dir: 'left',
    queuedDir: undefined,
    deathAnimationTicks: 20, // Animation plus courte (1.5-2 secondes)
    frightenedTicks: 0,
    frightChain: 0,
    started: true, // IMPORTANT: Garder le jeu démarré après respawn
    respawnProtectionTicks: 60, // 2 secondes d'invincibilité post-respawn (à ajuster)
    // Remettre les fantômes à leurs positions initiales
    ghosts: state.ghosts.map((ghost, index) => {
      const initialPositions = [
        { x: 13, y: 11, inPen: false }, // blinky
        { x: 13, y: 14, inPen: true }, // pinky
        { x: 11, y: 14, inPen: true }, // inky
        { x: 15, y: 14, inPen: true }, // clyde
      ]
      return {
        ...ghost,
        pos: initialPositions[index]!,
        dir: index === 0 ? 'left' : 'up',
        mode: 'scatter',
        inPen: initialPositions[index]!.inPen,
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
    next = { ...next, started: true }
  }

  // Try to move: prefer queuedDir, else current dir only if game has started
  const desired: Direction | undefined = next.queuedDir ?? (next.started ? next.dir : undefined)
  if (desired) {
    const moved = attemptMove(next, desired)
    next = moved

    // If we successfully moved in queuedDir, clear the queue
    if (next.dir === next.queuedDir) {
      next = { ...next, queuedDir: undefined }
    }
  }

  next = consumeIfAny(next)
  // Reset fright chain when not frightened
  if (next.frightenedTicks === 0 && next.frightChain !== 0) {
    next = { ...next, frightChain: 0 }
  }
  // Phase 1: process ghosts movement (no-op if none)
  next = stepGhosts(next)
  next = tick(next)
  return next
}
