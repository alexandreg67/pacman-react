import type { GameMode, GameState } from '../types'

export interface StarCriteria {
  minScore: number
  maxTime?: number // en secondes (pour speedrun)
  perfectRun?: boolean // toutes les pellets sans mourir
  bonusObjectives?: string[]
}

/**
 * Calcule le nombre d'étoiles (1-3) basé sur la performance du joueur
 */
export function calculateStars(
  mode: GameMode,
  level: number,
  finalScore: number,
  timeElapsed: number, // en secondes
  deaths: number,
  pelletsCollected: number,
  totalPellets: number,
): number {
  const criteria = getStarCriteria(mode, level)
  let stars = 0

  // ⭐ Première étoile : Compléter le niveau
  if (pelletsCollected === totalPellets) {
    stars = 1
  }

  // ⭐⭐ Deuxième étoile : Critères de performance
  if (stars >= 1) {
    switch (mode) {
      case 'classic':
        if (finalScore >= criteria.minScore && deaths <= 1) {
          stars = 2
        }
        break

      case 'easy':
        if (finalScore >= criteria.minScore) {
          stars = 2
        }
        break

      case 'hard':
        if (finalScore >= criteria.minScore && deaths === 0) {
          stars = 2
        }
        break

      case 'speedrun':
        if (criteria.maxTime && timeElapsed <= criteria.maxTime) {
          stars = 2
        }
        break

      case 'survival':
        if (finalScore >= criteria.minScore) {
          stars = 2 // Dans survival, atteindre un bon score est déjà un exploit
        }
        break
    }
  }

  // ⭐⭐⭐ Troisième étoile : Performance parfaite
  if (stars >= 2) {
    switch (mode) {
      case 'classic':
        if (finalScore >= criteria.minScore * 1.5 && deaths === 0) {
          stars = 3
        }
        break

      case 'easy':
        if (finalScore >= criteria.minScore * 1.3 && deaths === 0) {
          stars = 3
        }
        break

      case 'hard':
        if (
          finalScore >= criteria.minScore * 1.2 &&
          deaths === 0 &&
          timeElapsed <= (criteria.maxTime || 300)
        ) {
          stars = 3
        }
        break

      case 'speedrun':
        if (criteria.maxTime && timeElapsed <= criteria.maxTime * 0.7 && deaths === 0) {
          stars = 3
        }
        break

      case 'survival':
        if (finalScore >= criteria.minScore * 2) {
          stars = 3 // Survival mode : survie exceptionnelle
        }
        break
    }
  }

  return Math.max(0, Math.min(3, stars))
}

/**
 * Obtient les critères d'étoiles pour un niveau et mode donnés
 */
export function getStarCriteria(mode: GameMode, level: number): StarCriteria {
  const baseScore = 1000 + level * 200 // Score de base augmente avec le niveau

  switch (mode) {
    case 'classic':
      return {
        minScore: baseScore,
        maxTime: 300, // 5 minutes
        perfectRun: false,
      }

    case 'easy':
      return {
        minScore: Math.floor(baseScore * 0.8), // 20% plus facile
        maxTime: 450, // 7.5 minutes
        perfectRun: false,
      }

    case 'hard':
      return {
        minScore: Math.floor(baseScore * 1.5), // 50% plus difficile
        maxTime: 240, // 4 minutes
        perfectRun: true,
      }

    case 'speedrun':
      return {
        minScore: Math.floor(baseScore * 0.9),
        maxTime: 180 - level * 5, // Temps diminue avec le niveau
        perfectRun: false,
      }

    case 'survival':
      return {
        minScore: baseScore * 2, // Score plus élevé car une seule vie
        maxTime: undefined,
        perfectRun: true,
      }

    default:
      return {
        minScore: baseScore,
        maxTime: 300,
      }
  }
}

/**
 * Obtient une description textuelle des critères pour un mode/niveau
 */
export function getStarDescription(
  mode: GameMode,
  level: number,
): {
  star1: string
  star2: string
  star3: string
} {
  const criteria = getStarCriteria(mode, level)

  const descriptions = {
    classic: {
      star1: 'Terminer le niveau',
      star2: `Score: ${criteria.minScore}+ avec max 1 mort`,
      star3: `Score: ${Math.floor(criteria.minScore * 1.5)}+ sans mourir`,
    },
    easy: {
      star1: 'Terminer le niveau',
      star2: `Score: ${criteria.minScore}+`,
      star3: `Score: ${Math.floor(criteria.minScore * 1.3)}+ sans mourir`,
    },
    hard: {
      star1: 'Terminer le niveau',
      star2: `Score: ${criteria.minScore}+ sans mourir`,
      star3: `Score: ${Math.floor(criteria.minScore * 1.2)}+ en moins de ${Math.floor((criteria.maxTime || 300) / 60)}min`,
    },
    speedrun: {
      star1: 'Terminer le niveau',
      star2: `Temps: ${criteria.maxTime}s ou moins`,
      star3: `Temps: ${Math.floor((criteria.maxTime || 180) * 0.7)}s sans mourir`,
    },
    survival: {
      star1: 'Terminer le niveau',
      star2: `Score: ${criteria.minScore}+`,
      star3: `Score: ${criteria.minScore * 2}+ (survie parfaite)`,
    },
  }

  return descriptions[mode] || descriptions.classic
}

/**
 * Calcule les étoiles pour un état de jeu terminé
 */
export function calculateStarsFromGameState(
  mode: GameMode,
  level: number,
  grid: GameState['grid'],
  pelletsRemaining: GameState['pelletsRemaining'],
  lives: GameState['lives'],
  score: GameState['score'],
  timeElapsed: number,
): number {
  const totalPellets = grid
    .flat()
    .filter((cell) => cell === 'Pellet' || cell === 'PowerPellet').length

  const collectedPellets = totalPellets - pelletsRemaining
  const deaths = 3 - lives // Estimation des morts (on commence avec 3 vies)

  return calculateStars(
    mode,
    level,
    score,
    Math.floor(timeElapsed / 1000),
    deaths,
    collectedPellets,
    totalPellets,
  )
}

/**
 * Vérifie si un niveau est débloqué selon les critères de progression
 */
export function isLevelUnlocked(
  _mode: GameMode, // Prefixed with _ to indicate intentionally unused
  level: number,
  starsEarned: Record<number, number>,
): boolean {
  if (level === 1) return true // Le premier niveau est toujours débloqué

  // Règle générale : débloquer si le niveau précédent a au moins 1 étoile
  const prevLevelStars = starsEarned[level - 1] || 0
  if (prevLevelStars >= 1) return true

  // Règle alternative : débloquer tous les 5 niveaux si total étoiles suffisant
  if (level % 5 === 1) {
    const totalStars = Object.values(starsEarned).reduce((sum, stars) => sum + stars, 0)
    const requiredStars = Math.floor(level / 5) * 10
    return totalStars >= requiredStars
  }

  return false
}

/**
 * Calcule le pourcentage de completion pour un mode
 */
export function calculateCompletionPercentage(
  starsEarned: Record<number, number>,
  maxLevel: number = 50,
): number {
  const maxStars = maxLevel * 3
  const earnedStars = Object.values(starsEarned).reduce((sum, stars) => sum + stars, 0)
  return Math.round((earnedStars / maxStars) * 100)
}
