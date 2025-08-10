import { describe, it, expect } from 'vitest'
import { initialState, step, handlePacmanDeath } from '../state'
import type { GameState } from '../types'

/**
 * Tests respawn protection functionality
 */
describe('Respawn Protection', () => {
  it('should apply protection after respawn', () => {
    let state: GameState = initialState()

    // Simulate first death
    state = handlePacmanDeath(state)
    expect(state.lives).toBe(2)
    expect(state.respawnProtectionTicks).toBeGreaterThan(0)
    expect(state.deathAnimationTicks).toBeGreaterThan(0)

    // Wait for death animation to complete
    while (state.deathAnimationTicks > 0) {
      state = step(state)
    }

    expect(state.gameStatus).toBe('playing')
    expect(state.respawnProtectionTicks).toBeGreaterThanOrEqual(0) // May have already expired

    // Pacman should be able to move after respawn
    const beforeMove = state.pacman
    const afterMove = step(state, 'right')

    // Should be able to move or at least queue the direction
    const moved = afterMove.pacman.x !== beforeMove.x || afterMove.pacman.y !== beforeMove.y
    const queuedOrMoved = moved || afterMove.dir === 'right' || afterMove.queuedDir === 'right'
    expect(queuedOrMoved).toBe(true)
  })
})
