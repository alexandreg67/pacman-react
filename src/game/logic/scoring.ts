import { Cell, SCORES, TIMERS } from '../types'
import type { GameState } from '../types'

export function consumeIfAny(state: GameState): GameState {
  const { x, y } = state.pacman
  const cell = state.grid[y][x]
  if (cell === Cell.Pellet) {
    // consume pellet
    const newGrid = state.grid.map((row, yy) =>
      row.map((c, xx) => (xx === x && yy === y ? Cell.Empty : c)),
    )
    return {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.pellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
    }
  }
  if (cell === Cell.PowerPellet) {
    const newGrid = state.grid.map((row, yy) =>
      row.map((c, xx) => (xx === x && yy === y ? Cell.Empty : c)),
    )
    return {
      ...state,
      grid: newGrid,
      score: state.score + SCORES.powerPellet,
      pelletsRemaining: Math.max(0, state.pelletsRemaining - 1),
      frightenedTicks: TIMERS.frightenedDurationTicks,
    }
  }
  return state
}
