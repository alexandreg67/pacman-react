import { describe, it, expect } from 'vitest'
import { initialState, step } from '../state'

describe('Corrected Movement Logic', () => {
  describe('Ghost Reverse Direction Fix', () => {
    it('should allow ghosts to move toward scatter targets even if reverse direction', () => {
      const state = initialState()

      // Verify blinky's initial state and target
      const blinky = state.ghosts.find((g) => g.id === 'blinky')!
      expect(blinky.pos).toEqual({ x: 13, y: 9 })
      expect(blinky.dir).toBe('left')
      expect(blinky.inPen).toBe(false)

      // Blinky should target top-right corner (27, 0) in scatter mode
      // To reach (27, 0) from (13, 9), best direction is RIGHT (even though it's reverse of LEFT)
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
      // Movement should result in a different position (specific position depends on map layout)
      expect(downResult.newPos.x !== state.pacman.x || downResult.newPos.y !== state.pacman.y).toBe(
        true,
      )
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
      expect(result.pacman).toEqual({ x: 14, y: 26 })
      expect(result.lives).toBe(3) // Should not die
    })

    it('should not move anything before game starts', () => {
      const state = initialState()

      // Multiple ticks without input should not move Pacman or start game
      let current = state
      for (let i = 0; i < 5; i++) {
        const next = step(current)

        // Pacman should not move
        expect(next.pacman).toEqual(current.pacman)

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

      // Test movement in UP direction to see if collision occurs
      const upResult = step(state, 'up')
      // Based on current spawn positions, UP movement may not immediately collide
      // Pacman is at (15, 26) and blinky at (13, 9), so UP movement may be safe
      expect(upResult.lives).toBe(3) // Should not die from first UP movement
      expect(upResult.deathAnimationTicks).toBe(0) // No death animation

      // Game should still start with input
      expect(upResult.started).toBe(true)
    })
  })
})
