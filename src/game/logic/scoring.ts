import { Cell, SCORES, TIMERS } from '../types'
import { getFrightenedDurationTicks } from './ghostSpeed'
import type { GameState } from '../types'

function updateGridAt(grid: Array<Array<Cell>>, x: number, y: number, newValue: Cell) {
  return grid.map((row, yy) => row.map((c, xx) => (xx === x && yy === y ? newValue : c)))
}

export function consumeIfAny(state: GameState): GameState {
  const { x, y } = state.pacman
  const cell = state.grid[y][x]
  if (cell === Cell.Pellet) {
    const newGrid = updateGridAt(state.grid, x, y, Cell.Empty)
    return {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.pellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
      dotsEaten: state.dotsEaten + 1,
    }
  }
  if (cell === Cell.PowerPellet) {
    const newGrid = updateGridAt(state.grid, x, y, Cell.Empty)
    return {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.powerPellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
      dotsEaten: state.dotsEaten + 1,
      frightenedTicks: getFrightenedDurationTicks(state.level) || TIMERS.frightenedDurationTicks,
    }
  }
  return state
}
