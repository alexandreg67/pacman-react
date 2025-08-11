import { CLASSIC_MAP, parseMap, computeTunnelRows } from '../grid'
import type { GameState } from '../types'
import { getModeSchedule } from './ghostModes'
import { INITIAL_GHOST_POSITIONS } from './ghostHouse'

function rebuildMazeState() {
  const { grid, spawn } = parseMap(CLASSIC_MAP)
  const pellets = grid
    .map((row) => row.filter((c) => c === 'Pellet' || c === 'PowerPellet').length)
    .reduce((a, b) => a + b, 0)
  const tunnelRows = computeTunnelRows(grid)
  return { grid, spawn, pellets, tunnelRows }
}

export function shouldAdvanceLevel(state: GameState): boolean {
  return state.pelletsRemaining <= 0 && state.gameStatus === 'playing'
}

export function advanceLevel(state: GameState): GameState {
  const nextLevel = state.level + 1
  const { grid, spawn, pellets, tunnelRows } = rebuildMazeState()
  const schedule = getModeSchedule(nextLevel)
  return {
    ...state,
    grid,
    pacman: { ...spawn.pacman },
    dir: 'left',
    queuedDir: undefined,
    pelletsRemaining: pellets,
    frightenedTicks: 0,
    frightChain: 0,
    dotsEaten: 0,
    started: false,
    tunnelRows,
    level: nextLevel,
    globalModeIndex: 0,
    globalModeTicksRemaining: schedule[0]?.durationTicks ?? -1,
    // Reset ghosts to initial positions for the new level
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
        justWrapped: false,
        dotCounter: 0,
      }
    }),
  }
}
