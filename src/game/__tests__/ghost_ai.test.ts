import { describe, it, expect } from 'vitest'
import { getTargetTileForGhost } from '../logic/ghostAi'
import { Cell, type GameState } from '../types'

function makeState(overrides: Partial<GameState> = {}): GameState {
  const grid = [
    [Cell.Wall, Cell.Wall, Cell.Wall, Cell.Wall, Cell.Wall],
    [Cell.Wall, Cell.Empty, Cell.Empty, Cell.Empty, Cell.Wall],
    [Cell.Wall, Cell.Empty, Cell.Empty, Cell.Empty, Cell.Wall],
    [Cell.Wall, Cell.Empty, Cell.Empty, Cell.Empty, Cell.Wall],
    [Cell.Wall, Cell.Wall, Cell.Wall, Cell.Wall, Cell.Wall],
  ]
  const base: GameState = {
    grid,
    pacman: { x: 2, y: 2 },
    dir: 'up',
    queuedDir: undefined,
    score: 0,
    lives: 3,
    pelletsRemaining: 10,
    frightenedTicks: 0,
    tickCount: 0,
    tunnelRows: [],
    gameStatus: 'playing',
    deathAnimationTicks: 0,
    started: false,
    respawnProtectionTicks: 0,
    ghosts: [],
    level: 1,
    globalModeIndex: 1, // chase
    globalModeTicksRemaining: 999,
    frightChain: 0,
    dotsEaten: 0,
    elroy: { phase: 0 },
  }
  return { ...base, ...overrides }
}

describe('ghost AI fidelity', () => {
  it('pinky up-left bug: targets x-4 when facing up', () => {
    const state = makeState({
      dir: 'up',
      ghosts: [
        {
          id: 'pinky',
          pos: { x: 2, y: 2 },
          dir: 'left',
          mode: 'chase',
          inPen: false,
          dotCounter: 0,
          eyesOnly: false,
          frightenedFlash: false,
        },
      ],
    })
    const target = getTargetTileForGhost(state, state.ghosts[0]!)
    expect(target.y).toBe(state.pacman.y - 4) // dy from dir ahead (4 up)
    expect(target.x).toBe(state.pacman.x - 4) // bug: x-4 when facing up
  })

  it('inky vector: pivot 2 ahead, vector from blinky doubled', () => {
    const state = makeState({
      dir: 'right',
      pacman: { x: 2, y: 2 },
      ghosts: [
        {
          id: 'inky',
          pos: { x: 1, y: 1 },
          dir: 'left',
          mode: 'chase',
          inPen: false,
          dotCounter: 0,
          eyesOnly: false,
          frightenedFlash: false,
        },
        {
          id: 'blinky',
          pos: { x: 0, y: 2 },
          dir: 'left',
          mode: 'chase',
          inPen: false,
          dotCounter: 0,
          eyesOnly: false,
          frightenedFlash: false,
        },
      ],
    })
    const pivot = { x: state.pacman.x + 2, y: state.pacman.y }
    const vx = pivot.x - state.ghosts[1]!.pos.x
    const vy = pivot.y - state.ghosts[1]!.pos.y
    const expected = { x: pivot.x + vx, y: pivot.y + vy }
    const target = getTargetTileForGhost(state, state.ghosts[0]!)
    expect(target).toEqual(expected)
  })
})
