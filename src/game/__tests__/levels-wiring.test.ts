import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { getModeSchedule } from '../../game/logic/ghostModes'
import {
  getFrightenedDurationTicks,
  getReleaseThresholds,
  getPacmanStepMs,
} from '../../game/logic/ghostSpeed'
import { initialState } from '../../game/state'
import { __setLevels, __resetLevels } from '../../game/logic/levels'

describe('LevelConfig wiring', () => {
  beforeEach(() => {
    __resetLevels()
  })
  afterEach(() => {
    __resetLevels()
  })

  it('uses LevelConfig scatter/chase schedule if provided (ms→ticks)', () => {
    // 80ms per tick; 800ms -> 10 ticks
    __setLevels([
      {
        id: 1,
        fruit: 'cherry',
        scores: { fruit: 100, ghostEatBase: 200 },
        frightenedMs: 0,
        scatterChase: [
          { mode: 'scatter', ms: 800 },
          { mode: 'chase', ms: 1600 },
          { mode: 'scatter', ms: 800 },
          { mode: 'chase', ms: 'infinite' },
        ],
        speeds: {
          pacmanMs: 80,
          pacmanTunnelMs: 90,
          ghostStrideBase: 2,
          tunnelStrideDelta: 1,
          frightenedStrideDelta: 1,
          eatenStrideDelta: -1,
          elroyStrideBonus: -1,
        },
        dotRelease: {},
        elroy: { phase1: 60, phase2: 20 },
      },
    ])
    const schedule = getModeSchedule(1)
    expect(schedule[0]?.mode).toBe('scatter')
    expect(schedule[0]?.durationTicks).toBe(10)
    expect(schedule[1]?.mode).toBe('chase')
    expect(schedule[1]?.durationTicks).toBe(20)
    expect(schedule[3]?.durationTicks).toBe(-1)
  })

  it('uses LevelConfig frightened duration if provided (ms→ticks)', () => {
    __setLevels([
      {
        id: 1,
        fruit: 'cherry',
        scores: { fruit: 100, ghostEatBase: 200 },
        frightenedMs: 4000, // 4s → 50 ticks
        scatterChase: [],
        speeds: {
          pacmanMs: 80,
          pacmanTunnelMs: 90,
          ghostStrideBase: 2,
          tunnelStrideDelta: 1,
          frightenedStrideDelta: 1,
          eatenStrideDelta: -1,
          elroyStrideBonus: -1,
        },
        dotRelease: {},
        elroy: { phase1: 60, phase2: 20 },
      },
    ])
    expect(getFrightenedDurationTicks(1)).toBe(50)
  })

  it('uses LevelConfig release thresholds and pacmanMs if provided', () => {
    __setLevels([
      {
        id: 2,
        fruit: 'strawberry',
        scores: { fruit: 300, ghostEatBase: 200 },
        frightenedMs: 0,
        scatterChase: [],
        speeds: {
          pacmanMs: 70,
          pacmanTunnelMs: 85,
          ghostStrideBase: 2,
          tunnelStrideDelta: 1,
          frightenedStrideDelta: 1,
          eatenStrideDelta: -1,
          elroyStrideBonus: -1,
        },
        dotRelease: { inky: 99, clyde: 42 },
        elroy: { phase1: 60, phase2: 20 },
      },
    ])
    expect(getReleaseThresholds(2)).toEqual({ pinky: 0, inky: 99, clyde: 42 })
    const s = initialState()
    s.level = 2
    // Force non-tunnel row for pacman
    s.pacman.y = 0
    s.tunnelRows = []
    expect(getPacmanStepMs(s)).toBe(70)
  })
})
