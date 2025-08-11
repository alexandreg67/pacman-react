import type { GameMode, GameState } from '../types'
import { MODE_CONFIGS } from './config'

/**
 * Adapter l'état du jeu selon le mode sélectionné
 * @param state État actuel du jeu
 * @param mode Mode de jeu sélectionné
 * @returns État adapté au mode de jeu
 */
export function adaptGameStateForMode(state: GameState, mode: GameMode): GameState {
  const config = MODE_CONFIGS[mode]

  // Créer un nouvel état avec les modifications nécessaires
  const adaptedState: GameState = {
    ...state,
    // Adapter les paramètres selon le mode
    frightenedTicks: Math.min(state.frightenedTicks, config.powerPelletDuration),
    // Autres adaptations spécifiques aux modes peuvent être ajoutées ici
  }

  // Adaptations spécifiques par mode
  switch (mode) {
    case 'easy':
      // Réduire la vitesse des fantômes
      // Augmenter la durée des power pellets
      break

    case 'hard':
      // Augmenter la vitesse des fantômes
      // Réduire la durée des power pellets
      break

    case 'speedrun':
      // Ajouter un chronomètre
      break

    case 'survival':
      // Limiter à une seule vie (si ce n'est pas déjà le cas)
      // Augmenter progressivement la vitesse des fantômes
      break

    case 'classic':
    default:
      // Comportement par défaut
      break
  }

  return adaptedState
}

/**
 * Obtenir le modificateur de vitesse des fantômes pour un mode donné
 * @param mode Mode de jeu
 * @returns Modificateur de vitesse (1.0 = vitesse normale)
 */
export function getGhostSpeedModifier(mode: GameMode): number {
  return MODE_CONFIGS[mode].ghostSpeedModifier
}

/**
 * Obtenir la durée des power pellets pour un mode donné
 * @param mode Mode de jeu
 * @returns Durée en ticks
 */
export function getPowerPelletDuration(mode: GameMode): number {
  return MODE_CONFIGS[mode].powerPelletDuration
}

/**
 * Obtenir la durée du mode "Scatter" pour un mode donné
 * @param mode Mode de jeu
 * @returns Durée en secondes
 */
export function getScatterDuration(mode: GameMode): number {
  return MODE_CONFIGS[mode].scatterDuration
}

/**
 * Vérifier si le mode de jeu n'autorise qu'une seule vie
 * @param mode Mode de jeu
 * @returns true si une seule vie est autorisée
 */
export function isSingleLifeMode(mode: GameMode): boolean {
  return mode === 'survival'
}

/**
 * Adapter le nombre de vies selon le mode de jeu
 * @param mode Mode de jeu
 * @returns Nombre de vies
 */
export function getLivesForMode(mode: GameMode): number {
  return isSingleLifeMode(mode) ? 1 : 3
}
