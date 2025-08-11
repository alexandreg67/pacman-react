import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { __setLevels, __resetLevels } from '../../game/logic/levels'
import { initialState } from '../../game/state'
import { getElroyPhase, getGhostStride, getPacmanStepMs } from '../../game/logic/ghostSpeed'

describe('Elroy and Tunnel behavior via LevelConfig', () => {
  beforeEach(() => __resetLevels())
  afterEach(() => __resetLevels())

  it('applies Elroy phases and stride bonus from LevelConfig', () => {
    __setLevels([
      {
        id: 1,
        fruit: 'cherry',
        scores: { fruit: 100, ghostEatBase: 200 },
        frightenedMs: 0,
        scatterChase: [],
        speeds: {
          pacmanMs: 80,
          pacmanTunnelMs: 90,
          ghostStrideBase: 3,
          tunnelStrideDelta: 1,
          frightenedStrideDelta: 1,
          eatenStrideDelta: -1,
          elroyStrideBonus: -1,
        },
        dotRelease: {},
        elroy: { phase1: 60, phase2: 20 },
      },
    ])

    let s = initialState()
    s.level = 1
    s.pelletsRemaining = 100
    // Elroy phase 0
    expect(getElroyPhase(s)).toBe(0)
    const blinky = s.ghosts.find((g) => g.id === 'blinky')!
    expect(getGhostStride(s, blinky)).toBe(3)

    // Phase 1
    s = { ...s, pelletsRemaining: 60 }
    expect(getElroyPhase(s)).toBe(1)
    expect(getGhostStride(s, blinky)).toBe(2) // base 3 + (-1)*1 = 2

    // Phase 2
    s = { ...s, pelletsRemaining: 20 }
    expect(getElroyPhase(s)).toBe(2)
    expect(getGhostStride(s, blinky)).toBe(1) // base 3 + (-1)*2 = 1 (min 1)
  })

  it('uses pacmanTunnelMs when in a tunnel row', () => {
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
        dotRelease: {},
        elroy: { phase1: 60, phase2: 20 },
      },
    ])
    const s = initialState()
    s.level = 2
    // Force pacman into a tunnel row
    s.pacman.y = 5
    s.tunnelRows = [5]
    expect(getPacmanStepMs(s)).toBe(85)
  })
})
