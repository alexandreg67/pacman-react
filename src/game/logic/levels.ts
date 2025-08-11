// Levels configuration placeholder. Fill with arcade-accurate data from docs/levels-spec.md
export type ScatterChasePhase = { mode: 'scatter' | 'chase'; ms: number | 'infinite' }

export interface LevelConfig {
  id: number
  fruit: string
  scores: { fruit: number; ghostEatBase: number }
  frightenedMs: number
  scatterChase: ScatterChasePhase[]
  speeds: {
    pacmanMs: number
    pacmanTunnelMs: number
    ghostStrideBase: number
    tunnelStrideDelta: number
    frightenedStrideDelta: number
    eatenStrideDelta: number
    elroyStrideBonus: number
  }
  dotRelease: { pinky?: number; inky?: number; clyde?: number }
  elroy: { phase1: number; phase2: number }
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

// Test helpers to inject level data without hardcoding tables yet
export function __setLevels(levels: LevelConfig[]): void {
  LEVELS.splice(0, LEVELS.length, ...levels)
}

export function __resetLevels(): void {
  LEVELS.splice(0, LEVELS.length)
}

export function getReleaseThresholdsFromLevels(
  level: number,
): { pinky?: number; inky?: number; clyde?: number } | undefined {
  const cfg = getLevelConfig(level)
  return cfg?.dotRelease
}

export function getElroyFromLevels(
  level: number,
): { phase1: number; phase2: number; strideBonus: number } | undefined {
  const cfg = getLevelConfig(level)
  if (!cfg) return undefined
  return {
    phase1: cfg.elroy.phase1,
    phase2: cfg.elroy.phase2,
    strideBonus: cfg.speeds.elroyStrideBonus,
  }
}

export function getSpeedsFromLevels(level: number):
  | {
      pacmanMs: number
      pacmanTunnelMs: number
      ghostStrideBase: number
      tunnelStrideDelta: number
      frightenedStrideDelta: number
      eatenStrideDelta: number
      elroyStrideBonus: number
    }
  | undefined {
  const cfg = getLevelConfig(level)
  return cfg?.speeds
}
