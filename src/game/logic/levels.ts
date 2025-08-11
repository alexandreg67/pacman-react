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

// Populate with defaults matching current engine fallbacks to ensure identical behavior.
// Tick duration is ~80ms, so we express durations in ms such that ms/TICK_MS equals the fallback tick counts.
const S = (seconds: number) => Math.round(seconds * 12 /* ticks/sec */ * 80 /* ms/tick */)

export const LEVELS: LevelConfig[] = [
  // Levels 1-4: schedule S7,C20,S7,C20,S5,C∞; frightened 40 ticks
  ...[1, 2, 3, 4].map(
    (id) =>
      ({
        id,
        fruit: id === 1 ? 'cherry' : id === 2 ? 'strawberry' : id <= 4 ? 'orange' : 'fruit',
        scores: { fruit: 0, ghostEatBase: 200 },
        frightenedMs: S(40 / 12),
        scatterChase: [
          { mode: 'scatter', ms: S(7) },
          { mode: 'chase', ms: S(20) },
          { mode: 'scatter', ms: S(7) },
          { mode: 'chase', ms: S(20) },
          { mode: 'scatter', ms: S(5) },
          { mode: 'chase', ms: 'infinite' },
        ],
        speeds: {
          pacmanMs: 80,
          pacmanTunnelMs: 90,
          ghostStrideBase: 2,
          tunnelStrideDelta: 1,
          frightenedStrideDelta: 1,
          eatenStrideDelta: -1,
          elroyStrideBonus: -1,
        },
        dotRelease: { pinky: 0, inky: 30, clyde: 15 },
        elroy: { phase1: 60, phase2: 20 },
      }) as LevelConfig,
  ),
  // Levels 5+: schedule S5,C20,S5,C20,S5,C∞; frightened 30 ticks
  ...[5, 6, 7, 8, 9, 10].map(
    (id) =>
      ({
        id,
        fruit: id <= 6 ? 'apple' : id <= 8 ? 'melon' : id <= 10 ? 'galaxian' : 'fruit',
        scores: { fruit: 0, ghostEatBase: 200 },
        frightenedMs: S(30 / 12),
        scatterChase: [
          { mode: 'scatter', ms: S(5) },
          { mode: 'chase', ms: S(20) },
          { mode: 'scatter', ms: S(5) },
          { mode: 'chase', ms: S(20) },
          { mode: 'scatter', ms: S(5) },
          { mode: 'chase', ms: 'infinite' },
        ],
        speeds: {
          pacmanMs: 60,
          pacmanTunnelMs: 75,
          ghostStrideBase: 2,
          tunnelStrideDelta: 1,
          frightenedStrideDelta: 1,
          eatenStrideDelta: -1,
          elroyStrideBonus: -1,
        },
        dotRelease: { pinky: 0, inky: 20, clyde: 10 },
        elroy: { phase1: 70, phase2: 30 },
      }) as LevelConfig,
  ),
]

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
