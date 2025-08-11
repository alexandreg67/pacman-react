import React, { useMemo } from 'react'
import { Z_INDEX } from '../constants/zIndex'
import { Cell } from '../game/types'
import type { GameState, Direction } from '../game/types'
import { Pacman } from './Pacman'
import { getFruitPosition } from '../game/logic/fruits'
import { Ghost } from './Ghost'

type Props = {
  state: GameState
  tileSize?: number
}

interface WallNeighbors {
  top: boolean
  topRight: boolean
  right: boolean
  bottomRight: boolean
  bottom: boolean
  bottomLeft: boolean
  left: boolean
  topLeft: boolean
}

interface WallStyle {
  borderRadius: string
  width: number
  height: number
  marginTop: string
  marginRight: string
  marginBottom: string
  marginLeft: string
}

// Cache pour les styles de murs - réutilisé entre les rendus
const wallStyleCache = new Map<string, WallStyle>()
const WALL_STYLE_CACHE_MAX_SIZE = 1000

// Fonction pour nettoyer le cache si nécessaire
function cleanCacheIfNeeded() {
  if (wallStyleCache.size > WALL_STYLE_CACHE_MAX_SIZE) {
    // Garder seulement les 500 dernières entrées (stratégie LRU simplifiée)
    const entries = Array.from(wallStyleCache.entries())
    wallStyleCache.clear()
    entries.slice(-500).forEach(([key, value]) => {
      wallStyleCache.set(key, value)
    })
  }
}

function getWallNeighbors(grid: Cell[][], x: number, y: number): WallNeighbors {
  const h = grid.length
  const w = grid[0]?.length ?? 0
  // Helper pour vérifier les limites
  const safe = (yy: number, xx: number) =>
    yy >= 0 && yy < h && xx >= 0 && xx < w ? grid[yy][xx] === Cell.Wall : false
  return {
    top: safe(y - 1, x),
    topRight: safe(y - 1, x + 1),
    right: safe(y, x + 1),
    bottomRight: safe(y + 1, x + 1),
    bottom: safe(y + 1, x),
    bottomLeft: safe(y + 1, x - 1),
    left: safe(y, x - 1),
    topLeft: safe(y - 1, x - 1),
  }
}

function generateWallStyle(neighbors: WallNeighbors, tileSize: number): WallStyle {
  // Créer une clé de cache basée sur les voisins et la taille
  const cacheKey = `${Object.values(neighbors)
    .map((b) => (b ? '1' : '0'))
    .join('')}-${tileSize}`

  if (wallStyleCache.has(cacheKey)) {
    return wallStyleCache.get(cacheKey)!
  }

  const { top, right, bottom, left, topLeft, topRight, bottomLeft, bottomRight } = neighbors

  // Calcul des rayons de bordure pour les coins organiques
  const cornerSize = Math.max(2, Math.floor(tileSize * 0.12))

  // Arrondir seulement les coins externes
  const topLeftRadius =
    (!top && !left) || (!top && !topLeft) || (!left && !topLeft) ? cornerSize : 0
  const topRightRadius =
    (!top && !right) || (!top && !topRight) || (!right && !topRight) ? cornerSize : 0
  const bottomLeftRadius =
    (!bottom && !left) || (!bottom && !bottomLeft) || (!left && !bottomLeft) ? cornerSize : 0
  const bottomRightRadius =
    (!bottom && !right) || (!bottom && !bottomRight) || (!right && !bottomRight) ? cornerSize : 0

  const style: WallStyle = {
    borderRadius: `${topLeftRadius}px ${topRightRadius}px ${bottomRightRadius}px ${bottomLeftRadius}px`,
    width: tileSize + (right ? 1 : 0),
    height: tileSize + (bottom ? 1 : 0),
    marginTop: top ? '-1px' : '0',
    marginRight: right ? '-1px' : '0',
    marginBottom: bottom ? '-1px' : '0',
    marginLeft: left ? '-1px' : '0',
  }

  // Mettre en cache le style calculé avec gestion de la limite
  cleanCacheIfNeeded()
  wallStyleCache.set(cacheKey, style)
  return style
}

// Composant Wall mémorisé pour éviter les re-rendus inutiles
const Wall = React.memo(
  ({ x, y, grid, tileSize }: { x: number; y: number; grid: Cell[][]; tileSize: number }) => {
    const neighbors = useMemo(() => getWallNeighbors(grid, x, y), [grid, x, y])
    const style = useMemo(() => generateWallStyle(neighbors, tileSize), [neighbors, tileSize])

    return <div className="wall-segment" style={style} />
  },
)

// Composant Path mémorisé
const PathCell = React.memo(({ cell, tileSize }: { cell: Cell; tileSize: number }) => (
  <div className="path-segment" style={{ width: tileSize, height: tileSize, position: 'relative' }}>
    {cell === Cell.Pellet && <div className="pellet-dot" />}
    {cell === Cell.PowerPellet && <div className="power-pellet" />}
    {cell === Cell.GhostDoor && (
      <div
        className="ghost-door"
        style={{
          width: '80%',
          height: '3px',
          backgroundColor: '#ffffff',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '2px',
          boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
        }}
      />
    )}
  </div>
))

// Composant Pacman mémorisé avec position
const PacmanRenderer = React.memo(
  ({
    x,
    y,
    direction,
    tickCount,
    tileSize,
    justWrapped = false,
    isProtected = false,
  }: {
    x: number
    y: number
    direction: Direction
    tickCount: number
    tileSize: number
    justWrapped?: boolean
    isProtected?: boolean
  }) => (
    <div
      className="absolute pacman-container"
      style={{
        transform: `translate(${x * tileSize}px, ${y * tileSize}px)`,
        width: tileSize,
        height: tileSize,
        zIndex: Z_INDEX.PACMAN,
        transition: justWrapped ? 'none' : 'transform 60ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      }}
      aria-label="pacman"
    >
      <Pacman
        size={tileSize}
        direction={direction}
        mouthOpen={Math.floor(tickCount / 4) % 2 === 0}
        isProtected={isProtected}
        tickCount={tickCount}
      />
    </div>
  ),
)

export const Board = React.memo(({ state, tileSize = 28 }: Props) => {
  const h = state.grid.length
  const w = state.grid[0]?.length ?? 0

  // Mémoriser les cellules du grid pour éviter les recalculs
  const gridCells = useMemo(() => {
    return state.grid.flatMap((row, y) =>
      row.map((cell, x) => ({
        key: `${x}-${y}`,
        x,
        y,
        cell,
      })),
    )
  }, [state.grid])

  // Mémoriser la position Pacman pour éviter les re-rendus du container
  const pacmanPosition = useMemo(
    () => ({
      x: state.pacman.x,
      y: state.pacman.y,
      direction: state.dir,
      tickCount: state.tickCount,
      justWrapped: state.justWrapped || false,
      isProtected: state.respawnProtectionTicks > 0,
    }),
    [
      state.pacman.x,
      state.pacman.y,
      state.dir,
      state.tickCount,
      state.justWrapped,
      state.respawnProtectionTicks,
    ],
  )

  // Mémoriser l'éclairage ambiant
  const ambientLighting = useMemo(
    () => ({
      background: `
      radial-gradient(ellipse 120px 60px at ${pacmanPosition.x * tileSize + tileSize / 2}px ${pacmanPosition.y * tileSize + tileSize / 2}px,
        rgba(255, 215, 0, 0.03) 0%,
        transparent 70%
      )
    `,
    }),
    [pacmanPosition.x, pacmanPosition.y, tileSize],
  )

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative border-2 border-blue-800 rounded-lg shadow-xl overflow-hidden maze-container"
        style={{
          width: w * tileSize,
          height: h * tileSize,
          backgroundColor: '#000000',
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)',
        }}
      >
        {/* Grid de jeu optimisé */}
        <div
          className="absolute top-0 left-0 grid"
          style={{
            gridTemplateColumns: `repeat(${w}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${h}, ${tileSize}px)`,
            gap: 0,
          }}
        >
          {gridCells.map(({ key, x, y, cell }) => {
            if (cell === Cell.Wall) {
              return <Wall key={key} x={x} y={y} grid={state.grid} tileSize={tileSize} />
            }
            return <PathCell key={key} cell={cell} tileSize={tileSize} />
          })}
        </div>

        {/* Pacman avec positionnement optimisé */}
        <PacmanRenderer
          x={pacmanPosition.x}
          y={pacmanPosition.y}
          direction={pacmanPosition.direction}
          tickCount={pacmanPosition.tickCount}
          tileSize={tileSize}
          justWrapped={pacmanPosition.justWrapped}
          isProtected={pacmanPosition.isProtected}
        />

        {/* Fruit (if spawned and not collected) */}
        {state.fruits?.some((f) => !f.collected) && (
          <div
            className="absolute"
            style={{
              transform: `translate(${getFruitPosition(state).x * tileSize}px, ${
                getFruitPosition(state).y * tileSize
              }px)`,
              width: tileSize,
              height: tileSize,
              zIndex: Z_INDEX.FRUIT,
            }}
            aria-label="fruit"
          >
            <div
              style={{
                width: tileSize * 0.7,
                height: tileSize * 0.7,
                backgroundColor: '#ff2d55',
                borderRadius: '50% 50% 40% 40%',
                margin: tileSize * 0.15,
                boxShadow: '0 0 6px rgba(255,45,85,0.9)',
              }}
            />
          </div>
        )}

        {/* Ghosts (Phase 4 rendering) */}
        {state.ghosts?.map((g) => (
          <div
            key={`ghost-${g.id}`}
            className="absolute"
            style={{
              transform: `translate(${g.pos.x * tileSize}px, ${g.pos.y * tileSize}px)`,
              width: tileSize,
              height: tileSize,
              zIndex: Z_INDEX.GHOSTS,
              transition: g.justWrapped ? 'none' : 'transform 60ms cubic-bezier(0.4, 0.0, 0.2, 1)',
            }}
            aria-label={`ghost-${g.id}`}
          >
            <Ghost
              size={tileSize}
              id={g.id}
              direction={g.dir}
              mode={g.mode}
              eyesOnly={g.eyesOnly}
              frightened={state.frightenedTicks > 0 && g.mode !== 'eaten'}
              flash={state.frightenedTicks > 0 && state.frightenedTicks < 10}
            />
          </div>
        ))}

        {/* Éclairage ambiant simplifié */}
        <div className="absolute inset-0 pointer-events-none" style={ambientLighting} />

        {/* Note: Game Over modal moved to App.tsx for proper viewport centering */}
      </div>

      {/* Bottom HUD intentionally removed; single HUD is rendered in App header */}
    </div>
  )
})

Board.displayName = 'Board'
