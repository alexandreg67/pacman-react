import { Cell } from './types'
import type { Grid, SpawnInfo } from './types'

// Demo map (small) — characters legend:
// # = Wall, . = Pellet, o = Power pellet, space = Empty, P = Pacman spawn
// Classic-like 28x31 maze (simplified ASCII). Legend:
// # wall, . pellet, o power pellet, P spawn, space = empty
// Note: This is a stylistic approximation, not a verbatim ROM map.
export const CLASSIC_MAP: string[] = [
  '############################',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o####.#####.##.#####.####o#',
  '#.####.#####.##.#####.####.#',
  '#..........................#',
  '#.####.##.########.##.####.#',
  '#.####.##.########.##.####.#',
  '#......##....##....##......#',
  '######.##### ## #####.######',
  '     #.##### ## #####.#     ',
  '     #.##          ##.#     ',
  '     #.## ######## ##.#     ',
  '######.## #      # ##.######',
  '      .   #      #   .      ',
  '######.## #      # ##.######',
  '     #.## ######## ##.#     ',
  '     #.##          ##.#     ',
  '     #.## ######## ##.#     ',
  '######.## ######## ##.######',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#o..##................##..o#',
  '###.##.##.########.##.##.###',
  '#......##....##....##......#',
  '#.##########.##.##########.#',
  '#..............P...........#',
  '############################',
]

const DEMO_MAP = ['############', '#P..#......#', '#..##.##...#', '#....o.....#', '############']

export function parseMap(lines: string[]): { grid: Grid; spawn: SpawnInfo } {
  const grid: Grid = []
  let spawn: SpawnInfo | null = null
  for (let y = 0; y < lines.length; y++) {
    const row: Cell[] = []
    for (let x = 0; x < (lines[y]?.length ?? 0); x++) {
      const ch = lines[y]![x]!
      switch (ch) {
        case '#':
          row.push(Cell.Wall)
          break
        case '.':
          row.push(Cell.Pellet)
          break
        case 'o':
          row.push(Cell.PowerPellet)
          break
        case 'P':
          row.push(Cell.Empty)
          spawn = { pacman: { x, y } }
          break
        default:
          row.push(Cell.Empty)
      }
    }
    grid.push(row)
  }
  if (!spawn) {
    throw new Error('No Pacman spawn (P) found in map')
  }
  return { grid, spawn }
}

export function demoGrid(): { grid: Grid; spawn: SpawnInfo } {
  return parseMap(DEMO_MAP)
}

/**
 * Analyse une grille pour identifier les lignes où la première ou la dernière case
 * n'est pas un mur (Cell.Wall). Ces lignes correspondent aux tunnels horizontaux.
 * @param grid La grille à analyser
 * @returns Un tableau des indices des lignes contenant des tunnels
 */
export function computeTunnelRows(grid: Grid): number[] {
  const tunnelRows: number[] = []

  for (let y = 0; y < grid.length; y++) {
    const row = grid[y]
    if (!row || row.length === 0) continue

    const firstCell = row[0]
    const lastCell = row[row.length - 1]

    // Si la première ou la dernière case n'est pas un mur, c'est une ligne de tunnel
    if (firstCell !== Cell.Wall || lastCell !== Cell.Wall) {
      tunnelRows.push(y)
    }
  }

  return tunnelRows
}

/**
 * Analyse une grille pour identifier les colonnes où la première ou la dernière case
 * n'est pas un mur (Cell.Wall). Ces colonnes correspondent aux tunnels verticaux.
 * REMARQUE: Cette fonction est prête pour une future extension mais n'est pas
 * utilisée dans le gameplay classique Pac-Man.
 * @param grid La grille à analyser
 * @returns Un tableau des indices des colonnes contenant des tunnels
 */
export function computeTunnelCols(grid: Grid): number[] {
  const tunnelCols: number[] = []

  if (grid.length === 0) return tunnelCols
  const width = grid[0]?.length ?? 0

  for (let x = 0; x < width; x++) {
    const firstCell = grid[0]?.[x]
    const lastCell = grid[grid.length - 1]?.[x]

    // Si la première ou la dernière case n'est pas un mur, c'est une colonne de tunnel
    if (firstCell !== Cell.Wall || lastCell !== Cell.Wall) {
      tunnelCols.push(x)
    }
  }

  return tunnelCols
}
