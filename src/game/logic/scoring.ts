import { Cell, SCORES, TIMERS } from '../types'
import { getFrightenedDurationTicks } from './ghostSpeed'
import type { GameState } from '../types'
import { registerFruitSpawn, shouldSpawnFruit, maybeCollectFruit } from './fruits'
import { getLevelConfig } from './levels'

function checkFruitCollection(beforeState: GameState, afterState: GameState): boolean {
  // Check if fruit collection occurred by comparing score increase
  // and validating that no other scoring events happened
  const scoreDifference = afterState.score - beforeState.score

  // If no score change, no fruit was collected
  if (scoreDifference <= 0) return false

  // Generate fruit score range from level configurations to maintain consistency
  // This approach is more reliable than hardcoded values and stays in sync with game data
  const fruitScoreRange = new Set<number>()

  // Collect all possible fruit scores from level configurations
  for (let level = 1; level <= 50; level++) {
    const config = getLevelConfig(level)
    if (config?.scores.fruit) {
      fruitScoreRange.add(config.scores.fruit)
    }
  }

  // Fallback to known range if no configs found
  if (fruitScoreRange.size === 0) {
    return [100, 300, 500, 700, 1000, 2000, 5000].includes(scoreDifference)
  }

  return fruitScoreRange.has(scoreDifference)
}

function updateGridAt(grid: Array<Array<Cell>>, x: number, y: number, newValue: Cell) {
  return grid.map((row, yy) => row.map((c, xx) => (xx === x && yy === y ? newValue : c)))
}

export function consumeIfAny(state: GameState): GameState {
  const { x, y } = state.pacman
  const cell = state.grid[y][x]
  if (cell === Cell.Pellet) {
    const newGrid = updateGridAt(state.grid, x, y, Cell.Empty)
    let next: GameState = {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.pellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
      dotsEaten: state.dotsEaten + 1,
    }
    if (shouldSpawnFruit(next)) {
      next = registerFruitSpawn(next)
    }
    return maybeCollectFruit(next)
  }
  if (cell === Cell.PowerPellet) {
    const newGrid = updateGridAt(state.grid, x, y, Cell.Empty)
    let next: GameState = {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.powerPellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
      dotsEaten: state.dotsEaten + 1,
      frightenedTicks: getFrightenedDurationTicks(state.level) || TIMERS.frightenedDurationTicks,
    }
    if (shouldSpawnFruit(next)) {
      next = registerFruitSpawn(next)
    }
    return maybeCollectFruit(next)
  }
  // Try to collect fruit even on empty tiles
  return maybeCollectFruit(state)
}

export function consumeIfAnyWithAudio(state: GameState): {
  newState: GameState
  consumed: 'pellet' | 'power-pellet' | 'fruit' | null
} {
  const { x, y } = state.pacman
  const cell = state.grid[y][x]

  let nextState: GameState = state
  let consumed: 'pellet' | 'power-pellet' | null = null
  let beforeFruitCollection: GameState

  if (cell === Cell.Pellet) {
    const newGrid = updateGridAt(state.grid, x, y, Cell.Empty)
    nextState = {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.pellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
      dotsEaten: state.dotsEaten + 1,
    }
    if (shouldSpawnFruit(nextState)) {
      nextState = registerFruitSpawn(nextState)
    }
    consumed = 'pellet'
    beforeFruitCollection = nextState
  } else if (cell === Cell.PowerPellet) {
    const newGrid = updateGridAt(state.grid, x, y, Cell.Empty)
    nextState = {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.powerPellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
      dotsEaten: state.dotsEaten + 1,
      frightenedTicks: getFrightenedDurationTicks(state.level) || TIMERS.frightenedDurationTicks,
    }
    if (shouldSpawnFruit(nextState)) {
      nextState = registerFruitSpawn(nextState)
    }
    consumed = 'power-pellet'
    beforeFruitCollection = nextState
  } else {
    // No pellet consumed, but still try to collect fruit
    beforeFruitCollection = state
  }

  // Single fruit collection check for all cases
  const finalState = maybeCollectFruit(nextState)
  const fruitCollected = checkFruitCollection(beforeFruitCollection, finalState)

  return {
    newState: finalState,
    consumed: fruitCollected ? 'fruit' : consumed,
  }
}
