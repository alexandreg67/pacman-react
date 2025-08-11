import type { GameMode } from '../types'

// Structure pour les statistiques par mode
export interface ModeStats {
  gamesPlayed: number
  gamesWon: number
  totalScore: number
  bestScore: number
  totalTimePlayed: number // en millisecondes
  averageScore: number
}

// Structure pour toutes les statistiques
export interface GameStats {
  // Statistiques par mode
  modeStats: Record<GameMode, ModeStats>

  // Statistiques globales
  totalGamesPlayed: number
  totalGamesWon: number
  totalTimePlayed: number // en millisecondes
  highestScore: number
}

// Clé pour le localStorage
const STATS_KEY = 'pacman_stats'

// Valeurs par défaut
const DEFAULT_STATS: GameStats = {
  modeStats: {
    classic: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      bestScore: 0,
      totalTimePlayed: 0,
      averageScore: 0,
    },
    easy: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      bestScore: 0,
      totalTimePlayed: 0,
      averageScore: 0,
    },
    hard: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      bestScore: 0,
      totalTimePlayed: 0,
      averageScore: 0,
    },
    speedrun: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      bestScore: 0,
      totalTimePlayed: 0,
      averageScore: 0,
    },
    survival: {
      gamesPlayed: 0,
      gamesWon: 0,
      totalScore: 0,
      bestScore: 0,
      totalTimePlayed: 0,
      averageScore: 0,
    },
  },
  totalGamesPlayed: 0,
  totalGamesWon: 0,
  totalTimePlayed: 0,
  highestScore: 0,
}

// Charger les statistiques depuis le localStorage
export function loadStats(): GameStats {
  try {
    const data = localStorage.getItem(STATS_KEY)
    if (data) {
      return { ...DEFAULT_STATS, ...JSON.parse(data) }
    }
  } catch (error) {
    console.warn('Erreur lors du chargement des statistiques:', error)
  }
  return DEFAULT_STATS
}

// Sauvegarder les statistiques dans le localStorage
export function saveStats(stats: GameStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (error) {
    console.warn('Erreur lors de la sauvegarde des statistiques:', error)
  }
}

// Mettre à jour les statistiques après une partie
export function updateStats(
  stats: GameStats,
  mode: GameMode,
  score: number,
  timePlayed: number,
  isWin: boolean,
): GameStats {
  const modeStat = stats.modeStats[mode]

  // Mettre à jour les statistiques du mode
  const updatedModeStats = {
    ...modeStat,
    gamesPlayed: modeStat.gamesPlayed + 1,
    gamesWon: modeStat.gamesWon + (isWin ? 1 : 0),
    totalScore: modeStat.totalScore + score,
    bestScore: Math.max(modeStat.bestScore, score),
    totalTimePlayed: modeStat.totalTimePlayed + timePlayed,
  }

  // Calculer la moyenne
  updatedModeStats.averageScore = updatedModeStats.totalScore / updatedModeStats.gamesPlayed

  // Mettre à jour les statistiques globales
  const updatedStats: GameStats = {
    ...stats,
    modeStats: {
      ...stats.modeStats,
      [mode]: updatedModeStats,
    },
    totalGamesPlayed: stats.totalGamesPlayed + 1,
    totalGamesWon: stats.totalGamesWon + (isWin ? 1 : 0),
    totalTimePlayed: stats.totalTimePlayed + timePlayed,
    highestScore: Math.max(stats.highestScore, score),
  }

  return updatedStats
}

// Obtenir les statistiques formatées pour l'affichage
export function getFormattedStats(stats: GameStats): Record<GameMode, string> {
  const formatted: Record<GameMode, string> = {
    classic: '',
    easy: '',
    hard: '',
    speedrun: '',
    survival: '',
  }

  for (const mode of Object.keys(stats.modeStats) as GameMode[]) {
    const modeStat = stats.modeStats[mode]
    const winRate =
      modeStat.gamesPlayed > 0 ? Math.round((modeStat.gamesWon / modeStat.gamesPlayed) * 100) : 0

    formatted[mode] =
      `Parties: ${modeStat.gamesPlayed} | Victoires: ${modeStat.gamesWon} (${winRate}%) | Meilleur score: ${modeStat.bestScore}`
  }

  return formatted
}
