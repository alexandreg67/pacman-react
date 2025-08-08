import { describe, it, expect } from 'vitest'
import { initialState, step } from '../state'
import { TIMERS, Cell } from '../types'

describe('Pacman movement and consumption', () => {
  it('moves into a pellet, increases score and decreases pelletsRemaining', () => {
    let s = initialState()

    // Find a pellet with an open neighbor on its left so Pacman can move right into it
    let placed = false
    for (let y = 0; y < s.grid.length && !placed; y++) {
      for (let x = 1; x < s.grid[0].length && !placed; x++) {
        if (s.grid[y][x] === Cell.Pellet && s.grid[y][x - 1] !== Cell.Wall) {
          s = { ...s, pacman: { x: x - 1, y } }
          const before = { ...s.pacman }
          const pelletsBefore = s.pelletsRemaining
          s = step(s, 'right')
          expect(s.pacman.x).toBe(before.x + 1)
          expect(s.score).toBe(10)
          expect(s.pelletsRemaining).toBeLessThan(pelletsBefore)
          placed = true
        }
      }
    }
    expect(placed).toBe(true)
  })

  it('does not move through walls', () => {
    let s = initialState()

    // Place Pacman immediately to the right of a wall and attempt to move left
    let placed = false
    for (let y = 0; y < s.grid.length && !placed; y++) {
      for (let x = 0; x < s.grid[0].length - 1 && !placed; x++) {
        if (s.grid[y][x] === Cell.Wall && s.grid[y][x + 1] === Cell.Empty) {
          s = { ...s, pacman: { x: x + 1, y } }
          const before = { ...s.pacman }
          s = step(s, 'left')
          expect(s.pacman).toEqual(before)
          expect(s.score).toBe(0)
          placed = true
        }
      }
    }
    expect(placed).toBe(true)
  })

  it('power pellet grants more score and enables frightened mode', () => {
    // Move Pacman adjacent to a power pellet and then step onto it
    let s = initialState()

    // Find a power pellet cell
    let target: { x: number; y: number } | null = null
    for (let y = 0; y < s.grid.length; y++) {
      for (let x = 0; x < s.grid[0].length; x++) {
        if (s.grid[y][x] === Cell.PowerPellet) {
          target = { x, y }
          break
        }
      }
      if (target) break
    }
    expect(Boolean(target)).toBe(true)

    if (!target) return

    // Pick an open neighbor next to target to place Pacman
    const neighbors: Array<{ x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' }> = [
      { x: target.x - 1, y: target.y, dir: 'right' },
      { x: target.x + 1, y: target.y, dir: 'left' },
      { x: target.x, y: target.y - 1, dir: 'down' },
      { x: target.x, y: target.y + 1, dir: 'up' },
    ]

    let placed = false
    for (const n of neighbors) {
      const cell = s.grid[n.y]?.[n.x]
      if (cell && cell !== Cell.Wall) {
        s = { ...s, pacman: { x: n.x, y: n.y } }
        const preScore = s.score
        s = step(s, n.dir)
        // consumed if score jumped by 50 and frightened set
        if (s.score === preScore + 50) {
          expect(s.frightenedTicks).toBeGreaterThan(0)
          expect(s.frightenedTicks).toBeLessThanOrEqual(TIMERS.frightenedDurationTicks)
          placed = true
          break
        }
      }
    }

    expect(placed).toBe(true)
  })
})
