import { describe, it, expect } from 'vitest'
import { initialState, step } from '../state'
import { TIMERS, Cell } from '../types'

describe('Pacman movement and consumption', () => {
  it('moves into a pellet, increases score and decreases pelletsRemaining', () => {
    let s = initialState()
    // The demo map places Pacman near pellets to the right
    const before = { ...s.pacman }
    s = step(s, 'right')
    expect(s.pacman.x).toBe(before.x + 1)
    expect(s.score).toBe(10)
    expect(s.pelletsRemaining).toBeGreaterThan(0)
  })

  it('does not move through walls', () => {
    let s = initialState()
    // Move left into a wall (spawn sits next to a wall in demo)
    const before = { ...s.pacman }
    s = step(s, 'left')
    expect(s.pacman).toEqual(before)
    // Score unchanged
    expect(s.score).toBe(0)
  })

  it('power pellet grants more score and enables frightened mode', () => {
    // Move Pacman adjacent to a power pellet and then step onto it
    let s = initialState()

    // Find a power pellet cell
    let target: { x: number; y: number } | null = null
    for (let y = 0; y < s.grid.length; y++) {
      for (let x = 0; x < s.grid[0].length; x++) {
        if (s.grid[y][x] === 'PowerPellet') {
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
      if (s.grid[n.y]?.[n.x] && s.grid[n.y][n.x] !== Cell.Wall) {
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
