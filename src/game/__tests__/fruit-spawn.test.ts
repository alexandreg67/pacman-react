import { describe, it, expect } from 'vitest'
import { initialState } from '../../game/state'
import { Cell } from '../../game/types'
import { consumeIfAny } from '../../game/logic/scoring'
import type { FruitInstance } from '../../game/logic/fruits'

describe('Fruit spawning (scaffolding)', () => {
  it('spawns a fruit when reaching 70 dots eaten', () => {
    let s = initialState()
    // Place a pellet under Pac-Man to ensure consumption
    s.grid[s.pacman.y][s.pacman.x] = Cell.Pellet
    // Prepare counters to just before threshold
    s = { ...s, dotsEaten: 69, pelletsRemaining: s.pelletsRemaining + 1 } // +1 to offset the manual pellet under Pac-Man
    const next = consumeIfAny(s)
    const fruits = (next as unknown as { fruits?: FruitInstance[] }).fruits
    expect(fruits?.length ?? 0).toBe(1)
  })

  it('spawns a second fruit when reaching 170 dots eaten', () => {
    let s = initialState()
    // Simulate first fruit already spawned at 70
    // Setup so that next consumption reaches 170
    s.grid[s.pacman.y][s.pacman.x] = Cell.Pellet
    s = {
      ...s,
      dotsEaten: 169,
      pelletsRemaining: s.pelletsRemaining + 1,
      // @ts-expect-error augmenting with fruits until type extended
      fruits: [{ spawnedAtPellets: s.pelletsRemaining + 1, collected: false, spawnedAtTick: 0 }],
    }
    const next = consumeIfAny(s)
    const fruits = (next as unknown as { fruits?: FruitInstance[] }).fruits
    expect(fruits?.length ?? 0).toBe(2)
  })
})
