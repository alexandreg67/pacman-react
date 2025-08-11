import { describe, it, expect } from 'vitest'
import { initialState, step } from '../../game/state'
import { getFruitPosition, registerFruitSpawn } from '../../game/logic/fruits'

describe('Fruit collection and expiry', () => {
  it('collects fruit and adds score from LevelConfig', () => {
    let s = initialState()
    // Force a spawn
    s = registerFruitSpawn(s)
    const pos = getFruitPosition(s)
    // Move Pac-Man to the fruit tile
    s = { ...s, pacman: { x: pos.x, y: pos.y } }
    const next = step(s)
    // Score should increase (L1 fruit = 100)
    expect(next.score).toBeGreaterThanOrEqual(s.score + 100)
    // Fruit marked collected
    expect(next.fruits?.every((f) => f.collected)).toBe(true)
  })

  it('expires fruit after lifetime when not collected', () => {
    let s = initialState()
    s = registerFruitSpawn(s)
    // Advance ticks beyond lifetime
    s = { ...s, tickCount: s.tickCount + 130 }
    const next = step(s)
    // No fruits remain (expired)
    expect((next.fruits?.length ?? 0) === 0 || next.fruits?.every((f) => f.collected)).toBe(true)
  })
})
