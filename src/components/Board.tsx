import { Cell } from '../game/types'
import type { GameState } from '../game/types'

type Props = {
  state: GameState
}

const TILE = 20

export function Board({ state }: Props) {
  const h = state.grid.length
  const w = state.grid[0]?.length ?? 0
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative"
        style={{
          width: w * TILE,
          height: h * TILE,
        }}
      >
        {/* tiles */}
        <div
          className="absolute top-0 left-0 grid"
          style={{ gridTemplateColumns: `repeat(${w}, ${TILE}px)` }}
        >
          {state.grid.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                style={{ width: TILE, height: TILE }}
                className={
                  cell === Cell.Wall
                    ? 'bg-blue-700'
                    : cell === Cell.Pellet
                      ? 'bg-transparent relative'
                      : cell === Cell.PowerPellet
                        ? 'bg-transparent relative'
                        : 'bg-transparent'
                }
              >
                {cell === Cell.Pellet && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
                  </div>
                )}
                {cell === Cell.PowerPellet && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  </div>
                )}
              </div>
            )),
          )}
        </div>
        {/* Pacman */}
        <div
          className="absolute transition-transform duration-75"
          style={{
            transform: `translate(${state.pacman.x * TILE}px, ${state.pacman.y * TILE}px)`,
            width: TILE,
            height: TILE,
          }}
          aria-label="pacman"
        >
          <div className="w-full h-full rounded-full bg-yellow-300 border border-yellow-500" />
        </div>
      </div>
      <div className="flex gap-4 text-sm">
        <span>Score: {state.score}</span>
        <span>Pellets: {state.pelletsRemaining}</span>
      </div>
    </div>
  )
}
