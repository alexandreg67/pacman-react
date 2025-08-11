import { describe, it, expect } from 'vitest'
import { getLevelConfig } from '../../game/logic/levels'

describe('Level Manager (spec scaffolding)', () => {
  it('has a placeholder config table', () => {
    expect(getLevelConfig(1)).toBeUndefined()
  })
})
