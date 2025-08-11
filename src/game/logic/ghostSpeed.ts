import type { GameState, Ghost } from '../types'
import { getFrightenedDurationTicksFromLevels } from './levels'

type LevelConfig = {
  pacmanMs: number
  pacmanTunnelMs: number
  frightenedDurationTicks: number
  ghostStrideBase: number
  tunnelStrideDelta: number
  frightenedStrideDelta: number
  eatenStrideDelta: number
  elroyPhase1Pellets: number
  elroyPhase2Pellets: number
  elroyStrideBonus: number // negative makes Blinky faster (smaller stride)
}

function getLevelConfig(level: number): LevelConfig {
  if (level >= 5) {
    return {
      pacmanMs: 60,
      pacmanTunnelMs: 75,
      frightenedDurationTicks: 30,
      ghostStrideBase: 2,
      tunnelStrideDelta: 1,
      frightenedStrideDelta: 1,
      eatenStrideDelta: -1,
      elroyPhase1Pellets: 70,
      elroyPhase2Pellets: 30,
      elroyStrideBonus: -1,
    }
  }
  // Level 1-4
  return {
    pacmanMs: 80,
    pacmanTunnelMs: 90,
    frightenedDurationTicks: 40,
    ghostStrideBase: 2,
    tunnelStrideDelta: 1,
    frightenedStrideDelta: 1,
    eatenStrideDelta: -1,
    elroyPhase1Pellets: 60,
    elroyPhase2Pellets: 20,
    elroyStrideBonus: -1,
  }
}

export function getPacmanStepMs(state: GameState): number {
  const cfg = getLevelConfig(state.level)
  const inTunnel = state.tunnelRows.includes(state.pacman.y)
  return inTunnel ? cfg.pacmanTunnelMs : cfg.pacmanMs
}

export function getFrightenedDurationTicks(level: number): number {
  const fromLevels = getFrightenedDurationTicksFromLevels(level)
  if (typeof fromLevels === 'number') return fromLevels
  return getLevelConfig(level).frightenedDurationTicks
}

export function getElroyPhase(state: GameState): 0 | 1 | 2 {
  const cfg = getLevelConfig(state.level)
  if (state.pelletsRemaining <= cfg.elroyPhase2Pellets) return 2
  if (state.pelletsRemaining <= cfg.elroyPhase1Pellets) return 1
  return 0
}

// Returns how many ticks to skip between ghost moves (1 = every tick)
export function getGhostStride(state: GameState, ghost: Ghost): number {
  const cfg = getLevelConfig(state.level)
  let stride = cfg.ghostStrideBase
  const inTunnel = state.tunnelRows.includes(ghost.pos.y)
  if (inTunnel) stride += cfg.tunnelStrideDelta
  if (state.frightenedTicks > 0 && ghost.mode !== 'eaten') stride += cfg.frightenedStrideDelta
  if (ghost.mode === 'eaten') stride = Math.max(1, stride + cfg.eatenStrideDelta)
  if (ghost.id === 'blinky') {
    const phase = getElroyPhase(state)
    if (phase > 0) {
      stride = Math.max(1, stride + cfg.elroyStrideBonus * phase)
    }
  }
  return stride
}

export function getReleaseThresholds(level: number): {
  pinky: number
  inky: number
  clyde: number
} {
  if (level >= 5) {
    return { pinky: 0, inky: 20, clyde: 10 }
  }
  return { pinky: 0, inky: 30, clyde: 15 }
}
