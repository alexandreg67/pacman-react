// Fruit spawning scaffolding; will be wired once level tables are populated
import type { GameState } from '../types'
import { getLevelConfig } from './levels'
export type FruitInstance = { spawnedAtPellets: number; spawnedAtTick: number; collected: boolean }

export type FruitConfig = {
  name: string
  score: number
  spawnThresholdsEaten: number[] // dotsEaten values at which fruit appears (twice per level)
}

export function getFruitConfigForLevel(level: number): FruitConfig | undefined {
  // Placeholder: will be populated from levels.ts once data is available
  void level
  return { name: 'cherry', score: 100, spawnThresholdsEaten: [70, 170] }
}

type FruitCapableState = GameState & { fruits?: FruitInstance[] }

export function shouldSpawnFruit(state: GameState): boolean {
  const cfg = getFruitConfigForLevel(state.level)
  if (!cfg) return false
  // When pelletsRemaining matches a configured threshold and not already spawned at that threshold
  const already = (state as FruitCapableState).fruits
  const spawnedAt = new Set(already?.map((f) => f.spawnedAtPellets) ?? [])
  // Convert dotsEaten threshold to pelletsRemaining marker for tracking purposes
  return cfg.spawnThresholdsEaten.some(
    (thr) => thr === state.dotsEaten && !spawnedAt.has(state.pelletsRemaining),
  )
}

export function registerFruitSpawn(state: GameState): GameState {
  const s = state as FruitCapableState
  const fruits: FruitInstance[] = s.fruits ?? []
  return {
    ...(s as GameState),
    fruits: [
      ...fruits,
      {
        spawnedAtPellets: state.pelletsRemaining,
        spawnedAtTick: state.tickCount,
        collected: false,
      },
    ],
  }
}

export function getFruitPosition(state: GameState): { x: number; y: number } {
  // Place fruit near the ghost house center, one row below
  const w = state.grid[0]?.length ?? 0
  const centerX = Math.floor(w / 2)
  // Heuristic: put fruit around the house center row + 1 (see CLASSIC_MAP)
  const y = Math.min(state.grid.length - 1, 15)
  return { x: centerX, y }
}

export function maybeCollectFruit(state: GameState): GameState {
  const s = state as FruitCapableState
  if (!s.fruits || s.fruits.length === 0) return state
  const pos = getFruitPosition(state)
  const onFruit = state.pacman.x === pos.x && state.pacman.y === pos.y
  if (!onFruit) return state
  const idx = s.fruits.findIndex((f) => !f.collected)
  if (idx === -1) return state
  // Score from LevelConfig (fallback 100)
  const cfg = getLevelConfig(state.level)
  const fruitScore = cfg?.scores.fruit ?? 100
  const updated = [...s.fruits]
  updated[idx] = { ...updated[idx]!, collected: true }
  return { ...state, fruits: updated, score: state.score + fruitScore }
}

const FRUIT_LIFETIME_TICKS = 120 // ~10s at 12 ticks/s

export function expireFruits(state: GameState): GameState {
  const s = state as FruitCapableState
  if (!s.fruits || s.fruits.length === 0) return state
  const filtered = s.fruits.filter(
    (f) =>
      f.collected ||
      ('spawnedAtTick' in f &&
        state.tickCount - (f as FruitInstance).spawnedAtTick <= FRUIT_LIFETIME_TICKS),
  )
  if (filtered.length === s.fruits.length) return state
  return { ...state, fruits: filtered }
}
