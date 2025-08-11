import type { GameState } from '../types'
import { getScatterChaseSchedule, type ModeScheduleEntry } from './levels'

export type ModeScheduleEntry = { mode: 'scatter' | 'chase'; durationTicks: number | -1 }

// Approximate arcade schedule in seconds -> convert to ticks via ~80ms base step
// We'll work in "ticks" directly and treat values as engine ticks. You can refine later.
export function getModeSchedule(level: number): ModeScheduleEntry[] {
  // Prefer schedule from level config if provided
  const fromLevels = getScatterChaseSchedule(level)
  if (fromLevels && fromLevels.length) return fromLevels
  // Level 1: S7, C20, S7, C20, S5, C∞
  // Level 5+: S5, C20, S5, C20, S5, C∞
  const s1 = level < 5
  const scatterA = s1 ? 7 * 12 : 5 * 12
  const chaseA = 20 * 12
  const scatterB = s1 ? 7 * 12 : 5 * 12
  const chaseB = 20 * 12
  const scatterC = 5 * 12
  return [
    { mode: 'scatter', durationTicks: scatterA },
    { mode: 'chase', durationTicks: chaseA },
    { mode: 'scatter', durationTicks: scatterB },
    { mode: 'chase', durationTicks: chaseB },
    { mode: 'scatter', durationTicks: scatterC },
    { mode: 'chase', durationTicks: -1 }, // infinite
  ]
}

export function getCurrentGlobalMode(state: GameState): 'scatter' | 'chase' {
  const schedule = getModeSchedule(state.level)
  const idx = Math.max(0, Math.min(state.globalModeIndex, schedule.length - 1))
  return schedule[idx]!.mode
}

export function advanceGlobalModeTimer(state: GameState): {
  index: number
  ticksRemaining: number
} {
  const schedule = getModeSchedule(state.level)
  const idx = Math.max(0, Math.min(state.globalModeIndex, schedule.length - 1))
  const entry = schedule[idx]!
  if (entry.durationTicks === -1) {
    // Infinite chase
    return { index: idx, ticksRemaining: -1 }
  }
  const remaining =
    state.globalModeTicksRemaining <= 0 ? entry.durationTicks : state.globalModeTicksRemaining
  const nextRemaining = remaining - 1
  if (nextRemaining > 0) return { index: idx, ticksRemaining: nextRemaining }
  // Move to next entry
  const nextIdx = Math.min(idx + 1, schedule.length - 1)
  const nextEntry = schedule[nextIdx]!
  return { index: nextIdx, ticksRemaining: nextEntry.durationTicks }
}
