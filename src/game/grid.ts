import { Cell, Grid, SpawnInfo } from './types'

// Demo map (small) — characters legend:
// # = Wall, . = Pellet, o = Power pellet, space = Empty, P = Pacman spawn
const DEMO_MAP = ['############', '#P..#......#', '#..##.##...#', '#....o.....#', '############']

export function parseMap(lines: string[]): { grid: Grid; spawn: SpawnInfo } {
  const grid: Grid = []
  let spawn: SpawnInfo | null = null
  for (let y = 0; y < lines.length; y++) {
    const row: Cell[] = []
    for (let x = 0; x < lines[y].length; x++) {
      const ch = lines[y][x]
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
