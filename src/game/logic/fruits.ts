// Fruit spawning scaffolding; will be wired once level tables are populated
import type { GameState } from '../types'
export type FruitInstance = { spawnedAtPellets: number; collected: boolean }

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
    fruits: [...fruits, { spawnedAtPellets: state.pelletsRemaining, collected: false }],
  }
}
