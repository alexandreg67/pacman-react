import { describe, it, expect } from 'vitest'
import { getLevelConfig } from '../../game/logic/levels'

describe('Level Manager (spec scaffolding)', () => {
  it('exposes a LevelConfig for level 1', () => {
    expect(getLevelConfig(1)).toBeTruthy()
  })
})
