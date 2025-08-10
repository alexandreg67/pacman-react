import { describe, it, expect } from 'vitest'
import { initialState, step, handlePacmanDeath } from '../state'
import type { GameState } from '../types'

/**
 * Teste le scénario : mourir → respawn → bouger → mourir → respawn → bouger
 * et vérifie que la protection fonctionne à chaque respawn.
 */
describe('Respawn Protection - Multiple Deaths', () => {
  it('should allow Pacman to move after each respawn and apply protection', () => {
    let state: GameState = initialState()

    // Simule une première mort
    state = handlePacmanDeath(state)
    expect(state.lives).toBe(2)
    expect(state.respawnProtectionTicks).toBeGreaterThan(0)
    expect(state.deathAnimationTicks).toBeGreaterThan(0)

    // Simule les ticks pour finir l'animation de mort
    for (let i = 0; i < 20; i++) {
      state = step(state)
    }
    expect(state.deathAnimationTicks).toBe(0)
    expect(state.respawnProtectionTicks).toBeGreaterThan(0)
    expect(state.gameStatus).toBe('playing')

    // Pacman doit pouvoir bouger (input accepté)
    let s = step(state, 'right')
    expect(s.pacman.x).not.toBe(state.pacman.x)
    expect(s.respawnProtectionTicks).toBeGreaterThan(0)

    // Simule la fin de la protection (20 ticks d'animation + 60 ticks de protection)
    for (let i = 0; i < 60; i++) {
      s = step(s)
    }
    // Protection non terminée après 60 ticks (il reste 39)
    expect(s.respawnProtectionTicks).toBeGreaterThan(0)

    // On simule les ticks restants pour finir la protection
    for (let i = 0; i < 39; i++) {
      s = step(s)
    }
    expect(s.respawnProtectionTicks).toBe(0)

    // Simule une deuxième mort
    s = handlePacmanDeath(s)
    expect(s.lives).toBe(0)
    expect(s.respawnProtectionTicks).toBe(0)
    expect(s.deathAnimationTicks).toBeGreaterThan(0)

    // Fin de l'animation de mort
    for (let i = 0; i < 20; i++) {
      s = step(s)
    }
    expect(s.deathAnimationTicks).toBe(30)
  })
})
