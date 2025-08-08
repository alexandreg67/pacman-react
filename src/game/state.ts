import { demoGrid } from './grid'
import { Direction, GameState, Cell } from './types'
import { attemptMove } from './entities/pacman'
import { consumeIfAny } from './logic/scoring'

export function initialState(): GameState {
  const { grid, spawn } = demoGrid()
  const pellets = grid
    .map((row) => row.filter((c) => c === Cell.Pellet || c === Cell.PowerPellet).length)
    .reduce((a, b) => a + b, 0)
  return {
    grid,
    pacman: { ...spawn.pacman },
    dir: 'left',
    score: 0,
    lives: 3,
    pelletsRemaining: pellets,
    frightenedTicks: 0,
  }
}

export function tick(state: GameState): GameState {
  // Decay frightened timer if active
  const frightenedTicks = Math.max(0, state.frightenedTicks - 1)
  return { ...state, frightenedTicks }
}

export function step(state: GameState, inputDir?: Direction): GameState {
  let next = state
  if (typeof inputDir !== 'undefined') {
    next = attemptMove(next, inputDir)
  }
  next = consumeIfAny(next)
  next = tick(next)
  return next
}
