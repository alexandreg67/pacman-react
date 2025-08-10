import { describe, it, expect } from 'vitest'
import { initialState, step, handlePacmanDeath } from '../state'
import type { GameState } from '../types'

describe('Ghost-Pacman Collision and Death', () => {
  describe('handlePacmanDeath', () => {
    it('should decrement lives and trigger death animation when Pacman dies', () => {
      const state = initialState()
      const result = handlePacmanDeath(state)

      expect(result.lives).toBe(2) // 3 - 1
      expect(result.deathAnimationTicks).toBe(20)
      expect(result.gameStatus).toBe('playing') // Still playing with lives left
    })

    it('should trigger game over when no lives remaining', () => {
      const state = { ...initialState(), lives: 1 }
      const result = handlePacmanDeath(state)

      expect(result.lives).toBe(0)
      expect(result.gameStatus).toBe('game-over')
      expect(result.deathAnimationTicks).toBe(30)
    })

    it('should respawn Pacman at initial position after death', () => {
      const state = {
        ...initialState(),
        pacman: { x: 10, y: 10 }, // Position différente
        dir: 'right' as const,
      }
      const result = handlePacmanDeath(state)

      // Vérifier que Pacman est revenu à sa position initiale
      const initialPos = initialState().pacman
      expect(result.pacman).toEqual(initialPos)
      expect(result.dir).toBe('left')
    })

    it('should reset ghosts to initial positions after Pacman death', () => {
      const state = {
        ...initialState(),
        ghosts: initialState().ghosts.map((ghost) => ({
          ...ghost,
          pos: { x: 20, y: 20 }, // Position différente
          mode: 'chase' as const,
        })),
      }
      const result = handlePacmanDeath(state)

      // Vérifier que les fantômes sont revenus à leurs positions initiales
      const expectedPositions = [
        { x: 13, y: 11 }, // blinky
        { x: 13, y: 14 }, // pinky
        { x: 11, y: 14 }, // inky
        { x: 15, y: 14 }, // clyde
      ]
      result.ghosts.forEach((ghost, index) => {
        expect(ghost.pos.x).toBe(expectedPositions[index]!.x)
        expect(ghost.pos.y).toBe(expectedPositions[index]!.y)
        expect(ghost.mode).toBe('scatter')
      })
    })

    it('should reset frightened state after death', () => {
      const state = {
        ...initialState(),
        frightenedTicks: 30,
        frightChain: 2,
      }
      const result = handlePacmanDeath(state)

      expect(result.frightenedTicks).toBe(0)
      expect(result.frightChain).toBe(0)
    })
  })

  describe('Game Over State', () => {
    it('should not process movement when in game over', () => {
      const gameOverState: GameState = {
        ...initialState(),
        gameStatus: 'game-over',
      }

      const result = step(gameOverState, 'right')

      // Pacman ne devrait pas bouger
      expect(result.pacman).toEqual(gameOverState.pacman)
      expect(result.dir).toBe(gameOverState.dir)
    })

    it('should not process movement during death animation', () => {
      const deathState: GameState = {
        ...initialState(),
        deathAnimationTicks: 30,
      }

      const initialPacmanPos = deathState.pacman
      const result = step(deathState, 'right')

      // Pacman ne devrait pas bouger pendant l'animation de mort
      expect(result.pacman).toEqual(initialPacmanPos)
    })

    it('should resume game after death animation ends with lives remaining', () => {
      const state: GameState = {
        ...initialState(),
        deathAnimationTicks: 1, // Dernière frame d'animation
        lives: 2,
        gameStatus: 'playing',
      }

      const result = step(state)

      expect(result.deathAnimationTicks).toBe(0)
      expect(result.gameStatus).toBe('playing')
    })
  })

  describe('Collision Detection', () => {
    it('should directly apply handlePacmanDeath when called', () => {
      const state = initialState()
      const result = handlePacmanDeath(state)

      expect(result.lives).toBe(2)
      expect(result.deathAnimationTicks).toBeGreaterThan(0)
    })
  })
})
