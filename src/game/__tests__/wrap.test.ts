import { describe, it, expect } from 'vitest'
import { computeTunnelRows, computeTunnelCols } from '../grid'
import { Cell } from '../types'
import type { Grid } from '../types'
import { initialState, step } from '../state'

describe('Wrap logic tests', () => {
  it('correctly identifies horizontal tunnel rows', () => {
    const testGrid: Grid = [
      [Cell.Wall, Cell.Wall, Cell.Wall, Cell.Wall], // Ligne 0: pas de tunnel
      [Cell.Empty, Cell.Pellet, Cell.Pellet, Cell.Wall], // Ligne 1: tunnel (gauche ouverte)
      [Cell.Wall, Cell.Pellet, Cell.Pellet, Cell.Empty], // Ligne 2: tunnel (droite ouverte)
      [Cell.Empty, Cell.Pellet, Cell.Pellet, Cell.Empty], // Ligne 3: tunnel (les deux côtés ouverts)
      [Cell.Wall, Cell.Pellet, Cell.Pellet, Cell.Wall], // Ligne 4: pas de tunnel
    ]

    const tunnelRows = computeTunnelRows(testGrid)
    expect(tunnelRows).toEqual([1, 2, 3])
  })

  it('correctly identifies vertical tunnel columns (for future extension)', () => {
    const testGrid: Grid = [
      [Cell.Wall, Cell.Empty, Cell.Wall, Cell.Empty], // Col 0: fermée, Col 1: ouverte, Col 2: fermée, Col 3: ouverte
      [Cell.Pellet, Cell.Pellet, Cell.Pellet, Cell.Pellet],
      [Cell.Pellet, Cell.Pellet, Cell.Pellet, Cell.Pellet],
      [Cell.Wall, Cell.Wall, Cell.Wall, Cell.Empty], // Col 0: fermée, Col 1: fermée, Col 2: fermée, Col 3: ouverte
    ]

    const tunnelCols = computeTunnelCols(testGrid)
    expect(tunnelCols).toEqual([1, 3]) // Colonnes 1 et 3 sont des tunnels verticaux
  })

  it('handles empty grid gracefully', () => {
    const emptyGrid: Grid = []
    expect(computeTunnelRows(emptyGrid)).toEqual([])
    expect(computeTunnelCols(emptyGrid)).toEqual([])
  })

  it('handles grid with no tunnels', () => {
    const solidGrid: Grid = [
      [Cell.Wall, Cell.Wall, Cell.Wall],
      [Cell.Wall, Cell.Pellet, Cell.Wall],
      [Cell.Wall, Cell.Wall, Cell.Wall],
    ]

    expect(computeTunnelRows(solidGrid)).toEqual([])
    expect(computeTunnelCols(solidGrid)).toEqual([])
  })

  it('handles grid with all tunnels', () => {
    const openGrid: Grid = [
      [Cell.Empty, Cell.Empty, Cell.Empty],
      [Cell.Empty, Cell.Pellet, Cell.Empty],
      [Cell.Empty, Cell.Empty, Cell.Empty],
    ]

    expect(computeTunnelRows(openGrid)).toEqual([0, 1, 2])
    expect(computeTunnelCols(openGrid)).toEqual([0, 1, 2])
  })
})

describe('Pac-Man tunnel movement tests', () => {
  it('wraps from left edge to right edge on dynamically detected tunnel row', () => {
    let state = initialState()
    const width = state.grid[0]?.length ?? 0

    // Sélectionner dynamiquement la première ligne de tunnel disponible
    const tunnelRow = state.tunnelRows[0]
    expect(tunnelRow).toBeDefined()
    expect(state.tunnelRows).toContain(tunnelRow)

    // Positionner Pac-Man au bord gauche de cette ligne de tunnel
    state = { ...state, pacman: { x: 0, y: tunnelRow }, dir: 'left' }

    // Appeler step pour tenter de se déplacer vers la gauche (wrap attendu)
    const newState = step(state, 'left')

    // Vérifier qu'il se retrouve au bord droit de la même ligne
    expect(newState.pacman.x).toBe(width - 1)
    expect(newState.pacman.y).toBe(tunnelRow)
  })

  it('wraps from right edge to left edge on dynamically detected tunnel row', () => {
    let state = initialState()
    const width = state.grid[0]?.length ?? 0

    // Sélectionner dynamiquement la première ligne de tunnel disponible
    const tunnelRow = state.tunnelRows[0]
    expect(tunnelRow).toBeDefined()
    expect(state.tunnelRows).toContain(tunnelRow)

    // Positionner Pac-Man au bord droit de cette ligne de tunnel
    state = { ...state, pacman: { x: width - 1, y: tunnelRow }, dir: 'right' }

    // Appeler step pour tenter de se déplacer vers la droite (wrap attendu)
    const newState = step(state, 'right')

    // Vérifier qu'il se retrouve au bord gauche de la même ligne
    expect(newState.pacman.x).toBe(0)
    expect(newState.pacman.y).toBe(tunnelRow)
  })

  it('does not wrap on non-tunnel row', () => {
    let state = initialState()
    const width = state.grid[0]?.length ?? 0

    // Trouver une ligne qui n'est PAS un tunnel
    let nonTunnelRow = -1
    for (let y = 0; y < state.grid.length; y++) {
      if (!state.tunnelRows.includes(y)) {
        // Vérifier que cette ligne a des espaces pour placer Pac-Man
        const row = state.grid[y]
        if (row && row.length > 2 && row[1] !== Cell.Wall) {
          nonTunnelRow = y
          break
        }
      }
    }

    // S'assurer qu'on a trouvé une ligne non-tunnel utilisable
    expect(nonTunnelRow).toBeGreaterThanOrEqual(0)
    expect(state.tunnelRows).not.toContain(nonTunnelRow)

    // Positionner Pac-Man au bord gauche de cette ligne
    state = { ...state, pacman: { x: 1, y: nonTunnelRow }, dir: 'left' }

    // Appeler step pour tenter de se déplacer vers la gauche
    const newState = step(state, 'left')

    // Vérifier qu'aucun wrap ne s'est produit
    // Soit il reste à la même position (bloqué par un mur)
    // Soit il se déplace d'une case vers la gauche mais ne wrap pas
    expect(newState.pacman.x).toBeLessThanOrEqual(1)
    expect(newState.pacman.x).not.toBe(width - 1) // Pas de wrap
    expect(newState.pacman.y).toBe(nonTunnelRow)
  })
})
