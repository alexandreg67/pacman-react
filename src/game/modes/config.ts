import type { GameMode, GameConfig } from '../types'

// Configuration par défaut pour chaque mode de jeu
export const MODE_CONFIGS: Record<GameMode, GameConfig> = {
  classic: {
    mode: 'classic',
    ghostSpeedModifier: 1.0,
    powerPelletDuration: 40, // ticks
    scatterDuration: 7, // seconds
  },
  easy: {
    mode: 'easy',
    ghostSpeedModifier: 0.7, // 30% plus lent
    powerPelletDuration: 60, // +50% de durée
    scatterDuration: 10, // + temps en mode "Scatter"
  },
  hard: {
    mode: 'hard',
    ghostSpeedModifier: 1.3, // 30% plus rapide
    powerPelletDuration: 24, // -40% de durée
    scatterDuration: 5, // - temps en mode "Scatter"
  },
  speedrun: {
    mode: 'speedrun',
    ghostSpeedModifier: 1.1,
    powerPelletDuration: 35,
    scatterDuration: 6,
  },
  survival: {
    mode: 'survival',
    ghostSpeedModifier: 1.0, // Augmente progressivement
    powerPelletDuration: 40,
    scatterDuration: 7,
  },
}
