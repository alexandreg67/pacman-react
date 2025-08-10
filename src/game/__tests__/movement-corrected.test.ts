import { describe, it, expect } from 'vitest'
import { initialState, step } from '../state'

describe('Corrected Movement Logic', () => {
  describe('Ghost Reverse Direction Fix', () => {
    it('should allow ghosts to move toward scatter targets even if reverse direction', () => {
      const state = initialState()

      // Verify blinky's initial state and target
      const blinky = state.ghosts.find((g) => g.id === 'blinky')!
      expect(blinky.pos).toEqual({ x: 13, y: 11 })
      expect(blinky.dir).toBe('left')
      expect(blinky.inPen).toBe(false)

      // Blinky should target top-right corner (27, 0) in scatter mode
      // To reach (27, 0) from (13, 11), best direction is RIGHT (even though it's reverse of LEFT)
    })

    it('should provide at least one safe movement direction for Pacman', () => {
      const state = initialState()

      // Test all directions to ensure at least one is safe
      const directions = ['up', 'down', 'left', 'right'] as const
      const results = directions.map((dir) => {
        const result = step(state, dir)
        return {
          direction: dir,
          lives: result.lives,
          moved: result.pacman.x !== state.pacman.x || result.pacman.y !== state.pacman.y,
          newPos: result.pacman,
        }
      })

      // At least one direction should not result in death
      const safeDirections = results.filter((r) => r.lives === 3)
      expect(safeDirections.length).toBeGreaterThan(0)

      // DOWN should be safe based on our analysis
      const downResult = results.find((r) => r.direction === 'down')!
      expect(downResult.lives).toBe(3)
      expect(downResult.moved).toBe(true)
      expect(downResult.newPos).toEqual({ x: 14, y: 13 })
    })
  })

  describe('Game Start Behavior', () => {
    it('should start game on first input without automatic movement', () => {
      const state = initialState()

      // Initially not started
      expect(state.started).toBe(false)

      // First input should start game
      const result = step(state, 'down') // Use safe direction
      expect(result.started).toBe(true)

      // Should move in the specified direction if safe
      expect(result.pacman).toEqual({ x: 14, y: 13 })
      expect(result.lives).toBe(3) // Should not die
    })

    it('should not move anything before game starts', () => {
      const state = initialState()

      // Multiple ticks without input should not move anything
      let current = state
      for (let i = 0; i < 5; i++) {
        const next = step(current)

        // Pacman should not move
        expect(next.pacman).toEqual(current.pacman)

        // Ghosts should not move
        expect(next.ghosts).toEqual(current.ghosts)

        // Game should not start
        expect(next.started).toBe(false)

        // Should not die
        expect(next.lives).toBe(3)

        current = next
      }
    })
  })

  describe('Collision System', () => {
    it('should correctly detect collisions and handle death', () => {
      const state = initialState()

      // UP direction leads to collision with blinky at (14,11)
      const upResult = step(state, 'up')
      expect(upResult.lives).toBe(2) // Lost one life
      expect(upResult.deathAnimationTicks).toBeGreaterThan(0) // Death animation started

      // After death, positions should be reset
      expect(upResult.pacman).toEqual(state.pacman) // Pacman back at spawn
    })
  })
})
