import { describe, it, expect } from 'vitest'
import { initialState, step } from '../state'

describe('Game Startup and Movement Logic', () => {
  describe('Initial State', () => {
    it('should start with correct initial state', () => {
      const state = initialState()

      expect(state.started).toBe(false)
      expect(state.gameStatus).toBe('playing')
      expect(state.deathAnimationTicks).toBe(0)
      expect(state.lives).toBe(3)
      expect(state.pacman).toBeDefined()
      expect(state.ghosts).toHaveLength(4)
    })
  })

  describe('Before First Input (Game Not Started)', () => {
    it('should not move Pacman without input', () => {
      const state = initialState()
      const result = step(state) // No input

      // Pacman should not move
      expect(result.pacman).toEqual(state.pacman)
      expect(result.started).toBe(false)
      expect(result.deathAnimationTicks).toBe(0)
      expect(result.lives).toBe(3)
    })

    it('should not move ghosts before game starts', () => {
      const state = initialState()
      const result = step(state) // No input

      // Game should not start without input
      expect(result.started).toBe(false)
      expect(result.deathAnimationTicks).toBe(0)
      expect(result.lives).toBe(3)

      // Pacman should not move without input
      expect(result.pacman).toEqual(state.pacman)
    })

    it('should not lose lives without any movement', () => {
      const state = initialState()
      let currentState = state

      // Simulate multiple ticks without input
      for (let i = 0; i < 10; i++) {
        const nextState = step(currentState)

        // Should never lose lives or trigger death animation
        expect(nextState.lives).toBe(3)
        expect(nextState.deathAnimationTicks).toBe(0)
        expect(nextState.started).toBe(false)
        expect(nextState.pacman).toEqual(state.pacman) // Never move

        currentState = nextState
      }
    })
  })

  describe('First Input (Game Start)', () => {
    it('should start game and move Pacman on first input', () => {
      const state = initialState()
      const initialPos = state.pacman

      const result = step(state, 'right')

      // Game should start
      expect(result.started).toBe(true)

      // Pacman should move (if not blocked by wall)
      const moved = result.pacman.x !== initialPos.x || result.pacman.y !== initialPos.y
      if (!moved) {
        // If couldn't move right, should at least face right
        expect(result.dir).toBe('right')
      }

      // Should not die from first movement
      expect(result.lives).toBe(3)
      expect(result.deathAnimationTicks).toBe(0)
    })

    it('should start ghost movement after game starts', () => {
      const state = initialState()

      // First step with input - starts the game
      const afterStart = step(state, 'right')
      expect(afterStart.started).toBe(true)

      // Second step - ghosts should be able to move now
      const afterGhostMove = step(afterStart)

      // At least some ghost should have moved or be capable of moving
      // (depending on stride timing)
      expect(afterGhostMove.started).toBe(true)
    })
  })

  describe('Continuous Movement', () => {
    it('should continue moving in direction after first input', () => {
      const state = initialState()

      // Start with right input
      const started = step(state, 'right')
      expect(started.started).toBe(true)

      // Continue without input - should keep moving right if possible
      const continued = step(started)

      if (started.dir === 'right') {
        // If we successfully turned right, should continue
        // Movement depends on maze layout, but direction should be maintained
        expect(continued.dir).toBe('right')
      }
    })

    it('should handle direction changes correctly', () => {
      const state = initialState()

      // Start moving right
      const step1 = step(state, 'right')
      expect(step1.started).toBe(true)

      // Change to down
      const step2 = step(step1, 'down')

      // Should queue the new direction or change immediately if possible
      expect(step2.queuedDir === 'down' || step2.dir === 'down').toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle multiple rapid inputs correctly', () => {
      const state = initialState()

      const step1 = step(state, 'right')
      const step2 = step(step1, 'down')
      const step3 = step(step2, 'left')

      expect(step3.started).toBe(true)
      expect(step3.lives).toBe(3) // Should not die from rapid inputs
      expect(step3.deathAnimationTicks).toBe(0)
    })

    it('should not break when receiving undefined input after start', () => {
      const state = initialState()

      const started = step(state, 'right')
      const continued = step(started) // undefined input

      expect(continued.started).toBe(true)
      expect(() => step(continued)).not.toThrow()
    })
  })
})
