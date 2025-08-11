import type { GameMode } from '../types'

// Structure pour les données de progression
export interface ProgressData {
  // Niveaux déverrouillés par mode
  unlockedLevels: Record<GameMode, number[]>

  // Meilleurs scores par niveau
  highScores: Record<GameMode, Record<number, number>>

  // Temps records pour le speedrun mode
  bestTimes: Record<number, number> // niveau -> millisecondes

  // Étoiles de progression (1-3 étoiles par niveau)
  stars: Record<GameMode, Record<number, number>>

  // Dernier mode joué
  lastPlayedMode: GameMode | null

  // Dernier niveau joué
  lastPlayedLevel: number | null
}

// Clé configurable pour le localStorage
export const PROGRESS_STORAGE_KEY = 'pacman_progress'

// Valeurs par défaut
const DEFAULT_PROGRESS: ProgressData = {
  unlockedLevels: {
    classic: [1], // Niveau 1 déverrouillé par défaut
    easy: [1],
    hard: [1],
    speedrun: [1],
    survival: [1],
  },
  highScores: {
    classic: {},
    easy: {},
    hard: {},
    speedrun: {},
    survival: {},
  },
  bestTimes: {},
  stars: {
    classic: {},
    easy: {},
    hard: {},
    speedrun: {},
    survival: {},
  },
  lastPlayedMode: null,
  lastPlayedLevel: null,
}

// Charger la progression depuis le localStorage
export function loadProgress(): ProgressData {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY)
    if (data) {
      return { ...DEFAULT_PROGRESS, ...JSON.parse(data) }
    }
  } catch (error) {
    console.warn('Error loading progress:', error)
  }
  return DEFAULT_PROGRESS
}

// Sauvegarder la progression dans le localStorage
export function saveProgress(progress: ProgressData): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch (error) {
    console.warn('Error saving progress:', error)
  }
}

// Mettre à jour les meilleurs scores
export function updateHighScore(
  progress: ProgressData,
  mode: GameMode,
  level: number,
  score: number,
): ProgressData {
  const currentHighScore = progress.highScores[mode][level] || 0
  if (score > currentHighScore) {
    return {
      ...progress,
      highScores: {
        ...progress.highScores,
        [mode]: {
          ...progress.highScores[mode],
          [level]: score,
        },
      },
    }
  }
  return progress
}

// Mettre à jour le temps record
export function updateBestTime(progress: ProgressData, level: number, time: number): ProgressData {
  const currentBestTime = progress.bestTimes[level] || Infinity
  if (time < currentBestTime) {
    return {
      ...progress,
      bestTimes: {
        ...progress.bestTimes,
        [level]: time,
      },
    }
  }
  return progress
}

// Déverrouiller un niveau
export function unlockLevel(progress: ProgressData, mode: GameMode, level: number): ProgressData {
  const unlocked = progress.unlockedLevels[mode] || []
  if (!unlocked.includes(level)) {
    return {
      ...progress,
      unlockedLevels: {
        ...progress.unlockedLevels,
        [mode]: [...unlocked, level].sort((a, b) => a - b),
      },
    }
  }
  return progress
}
