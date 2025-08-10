import { describe, it, expect } from 'vitest'
import { stepGhosts } from '../entities/ghosts'
import { Cell, type GameState } from '../types'
import { getGhostStride } from '../logic/ghostSpeed'
import { advanceGlobalModeTimer, getModeSchedule } from '../logic/ghostModes'

function gridEmpty(w: number, h: number): Cell[][] {
  return Array.from({ length: h }, () => Array.from({ length: w }, () => Cell.Empty))
}

function baseState(overrides: Partial<GameState> = {}): GameState {
  const grid = gridEmpty(7, 7)
  const base: GameState = {
    grid,
    pacman: { x: 3, y: 3 },
    dir: 'up',
    queuedDir: undefined,
    score: 0,
    lives: 3,
    pelletsRemaining: 100,
    frightenedTicks: 0,
    tickCount: 0,
    tunnelRows: [],
    gameStatus: 'playing',
    deathAnimationTicks: 0,
    started: false,
    ghosts: [],
    level: 1,
    globalModeIndex: 1, // chase
    globalModeTicksRemaining: getModeSchedule(1)[1]!.durationTicks,
    frightChain: 0,
    dotsEaten: 0,
    elroy: { phase: 0 },
  }
  return { ...base, ...overrides }
}

describe('ghosts: release and collisions', () => {
  it('releases pinky immediately and clyde after threshold (level 1)', () => {
    // Pinky release with 0 dotsEaten
    let state = baseState({
      ghosts: [
        {
          id: 'pinky',
          pos: { x: 3, y: 4 },
          dir: 'up',
          mode: 'scatter',
          inPen: true,
          dotCounter: 0,
          eyesOnly: false,
          frightenedFlash: false,
        },
      ],
    })
    state = stepGhosts(state)
    expect(state.ghosts[0]!.inPen).toBe(false)

    // Clyde release at 15 dots (level 1)
    state = baseState({
      dotsEaten: 15,
      ghosts: [
        {
          id: 'clyde',
          pos: { x: 3, y: 4 },
          dir: 'up',
          mode: 'scatter',
          inPen: true,
          dotCounter: 0,
          eyesOnly: false,
          frightenedFlash: false,
        },
      ],
    })
    state = stepGhosts(state)
    expect(state.ghosts[0]!.inPen).toBe(false)
  })

  it('frightened collision eats ghost, increments score and chain', () => {
    // Place ghost just below pacman so it moves up into pacman
    let state = baseState({
      frightenedTicks: 10,
      ghosts: [
        {
          id: 'blinky',
          pos: { x: 3, y: 4 },
          dir: 'up',
          mode: 'chase',
          inPen: false,
          dotCounter: 0,
          eyesOnly: false,
          frightenedFlash: false,
        },
      ],
    })
    const beforeScore = state.score
    state = stepGhosts(state)
    expect(state.ghosts[0]!.mode).toBe('eaten')
    expect(state.ghosts[0]!.eyesOnly).toBe(true)
    expect(state.score).toBe(beforeScore + 200)
    expect(state.frightChain).toBe(1)
  })
})

describe('ghosts: stride and modes', () => {
  it('stride is higher (slower) in tunnels and during frightened', () => {
    const s1 = baseState({ tunnelRows: [2] })
    const g = {
      id: 'pinky',
      pos: { x: 1, y: 1 },
      dir: 'left',
      mode: 'scatter',
      inPen: false,
      dotCounter: 0,
      eyesOnly: false,
      frightenedFlash: false,
    } as const
    const normal = getGhostStride(s1, { ...g })
    const inTunnel = getGhostStride(s1, { ...g, pos: { x: 1, y: 2 } })
    const frightened = getGhostStride({ ...s1, frightenedTicks: 5 }, { ...g })
    expect(inTunnel).toBeGreaterThanOrEqual(normal)
    expect(frightened).toBeGreaterThanOrEqual(normal)
  })

  it('global mode timer advances index when ticks deplete', () => {
    const sched = getModeSchedule(1)
    const state = baseState({ globalModeIndex: 0, globalModeTicksRemaining: 1 })
    const next = advanceGlobalModeTimer(state)
    expect(next.index).toBe(1)
    expect(next.ticksRemaining).toBe(sched[1]!.durationTicks)
  })
})
