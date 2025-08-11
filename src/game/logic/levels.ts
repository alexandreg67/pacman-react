// Levels configuration placeholder. Fill with arcade-accurate data from docs/levels-spec.md
export type ScatterChasePhase = { mode: 'scatter' | 'chase'; ms: number | 'infinite' }

export interface LevelConfig {
  id: number
  fruit: string
  scores: { fruit: number; ghostEatBase: number }
  frightenedMs: number
  scatterChase: ScatterChasePhase[]
  speeds: { pacman: number; ghost: number; frightened: number; tunnel: number }
  dotRelease: { pinky?: number; inky?: number; clyde?: number }
  elroy: { threshold: number; speed: number }
}

export const LEVELS: LevelConfig[] = []

export function getLevelConfig(level: number): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === level)
}

// Internal assumption: 1 engine tick ~ 80ms (see ghostModes.ts comment)
const TICK_MS = 80

export type ModeScheduleEntry = { mode: 'scatter' | 'chase'; durationTicks: number | -1 }

export function getScatterChaseSchedule(level: number): ModeScheduleEntry[] | undefined {
  const cfg = getLevelConfig(level)
  if (!cfg || !cfg.scatterChase?.length) return undefined
  return cfg.scatterChase.map((phase) => ({
    mode: phase.mode,
    durationTicks: phase.ms === 'infinite' ? -1 : Math.max(1, Math.round(phase.ms / TICK_MS)),
  }))
}

export function getFrightenedDurationTicksFromLevels(level: number): number | undefined {
  const cfg = getLevelConfig(level)
  if (!cfg) return undefined
  return Math.max(0, Math.round(cfg.frightenedMs / TICK_MS))
}
