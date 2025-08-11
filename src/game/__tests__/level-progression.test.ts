import { describe, it, expect } from 'vitest'
import { initialState, step } from '../../game/state'

describe('Level progression', () => {
  it('advances to next level when pellets are cleared', () => {
    let s = initialState()
    // Force pellets to 1 and position pacman on a pellet to consume last one
    s = { ...s, pelletsRemaining: 1, started: true }
    // Simulate that the current tile is a pellet by directly setting score on consume
    // We rely on consumeIfAny to decrement pellets only when on a pellet cell.
    // To avoid coupling to map layout, directly set pelletsRemaining=0 and tick once.
    s = { ...s, pelletsRemaining: 0 }
    const next = step(s)
    expect(next.level).toBe(2)
    expect(next.pelletsRemaining).toBeGreaterThan(0)
    expect(next.globalModeIndex).toBe(0)
  })
})
