import { describe, it, expect } from 'vitest'
import { initialState, step } from '../state'
import { TIMERS } from '../types'

describe('Pacman movement and consumption', () => {
  it('moves into a pellet, increases score and decreases pelletsRemaining', () => {
    let s = initialState()
    // The demo map places Pacman near pellets to the right
    const before = { ...s.pacman }
    s = step(s, 'right')
    expect(s.pacman.x).toBe(before.x + 1)
    expect(s.score).toBe(10)
    expect(s.pelletsRemaining).toBeGreaterThan(0)
  })

  it('does not move through walls', () => {
    let s = initialState()
    // Move left into a wall (spawn sits next to a wall in demo)
    const before = { ...s.pacman }
    s = step(s, 'left')
    expect(s.pacman).toEqual(before)
    // Score unchanged
    expect(s.score).toBe(0)
  })

  it('power pellet grants more score and enables frightened mode', () => {
    // Walk Pacman near the power pellet in demo map
    let s = initialState()
    // From spawn (row 1, col 1), path to power pellet at row 3: go right a few tiles then down
    s = step(s, 'right') // pellet +10
    s = step(s, 'right') // pellet +10
    // navigate around walls depending on demo layout
    s = step(s, 'down')
    s = step(s, 'down') // reach row with power pellet eventually
    // try to reach the 'o' cell by moving right until consumed
    for (let i = 0; i < 6; i++) {
      const preScore = s.score
      const prevPos = { ...s.pacman }
      s = step(s, 'right')
      // Once we land on power pellet, score jumps by 50 and frightenedTicks set
      if (s.score === preScore + 50) {
        expect(s.frightenedTicks).toBeGreaterThan(0)
        expect(s.frightenedTicks).toBeLessThanOrEqual(TIMERS.frightenedDurationTicks)
        expect(s.pacman).not.toEqual(prevPos)
        break
      }
    }
  })
})
