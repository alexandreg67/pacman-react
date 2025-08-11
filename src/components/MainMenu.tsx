import React, { useState } from 'react'
import type { GameMode } from '../game/types'
import { loadStats, getFormattedStats } from '../game/storage/stats'
import ModeCard from './ModeCard'
import NeonText from './ui/NeonText'
import ArcadeButton from './ui/ArcadeButton'
import CRTScreen from './ui/CRTScreen'
import InteractiveParticles from './ui/InteractiveParticles'

interface MainMenuProps {
  onSelectMode: (mode: GameMode) => void
  onResumeGame: () => void
  hasSavedGame: boolean
}

const MainMenu: React.FC<MainMenuProps> = ({ onSelectMode, onResumeGame, hasSavedGame }) => {
  const [showStats, setShowStats] = useState(false)
  const [stats, setStats] = useState<ReturnType<typeof getFormattedStats> | null>(null)

  // Configuration des modes avec icônes et niveaux de difficulté
  const modes: {
    id: GameMode
    title: string
    description: string
    icon: string
    difficulty: 'facile' | 'normal' | 'difficile' | 'extrême'
  }[] = [
    {
      id: 'classic',
      title: 'CLASSIC',
      description: 'Le vrai Pacman arcade avec les règles originales des années 80',
      icon: '👻',
      difficulty: 'normal',
    },
    {
      id: 'easy',
      title: 'EASY',
      description: 'Parfait pour débuter : fantômes lents et power pellets durables',
      icon: '🛡️',
      difficulty: 'facile',
    },
    {
      id: 'hard',
      title: 'HARD',
      description: 'Challenge ultime : IA améliorée et vitesse maximale',
      icon: '⚡',
      difficulty: 'difficile',
    },
    {
      id: 'speedrun',
      title: 'SPEEDRUN',
      description: 'Course contre la montre avec bonus de vitesse',
      icon: '⏱️',
      difficulty: 'difficile',
    },
    {
      id: 'survival',
      title: 'SURVIVAL',
      description: 'Une seule vie, difficulté progressive, survie maximum',
      icon: '💀',
      difficulty: 'extrême',
    },
  ]

  const handleShowStats = () => {
    const loadedStats = loadStats()
    setStats(getFormattedStats(loadedStats))
    setShowStats(true)
  }

  const handleHideStats = () => {
    setShowStats(false)
    setStats(null)
  }

  if (showStats && stats) {
    return (
      <CRTScreen className="min-h-screen p-4" scanlines curve>
        <div className="flex flex-col items-center justify-center min-h-screen floating-particles">
          <div className="w-full max-w-4xl">
            <div className="flex justify-between items-center mb-8">
              <NeonText as="h1" size="4xl" color="yellow" glow pulse>
                STATISTIQUES
              </NeonText>
              <ArcadeButton variant="secondary" size="md" onClick={handleHideStats} glow>
                ← RETOUR
              </ArcadeButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(stats).map(([mode, statText]) => (
                <div
                  key={mode}
                  className="bg-retro-card border-2 border-retro rounded-lg p-6 hover-lift"
                >
                  <NeonText as="h2" size="xl" color="cyan" glow className="mb-4">
                    {mode === 'classic' && 'CLASSIQUE'}
                    {mode === 'easy' && 'FACILE'}
                    {mode === 'hard' && 'DIFFICILE'}
                    {mode === 'speedrun' && 'CHRONO'}
                    {mode === 'survival' && 'SURVIE'}
                  </NeonText>
                  <p className="text-gray-300 font-cyber">{statText}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-400 font-cyber text-sm">
                ⚡ Les statistiques sont sauvegardées localement dans votre navigateur ⚡
              </p>
            </div>
          </div>
        </div>
      </CRTScreen>
    )
  }

  return (
    <>
      <InteractiveParticles
        enabled={!showStats}
        density={2}
        colors={['#00ffff', '#ff00ff', '#ffff00', '#39ff14', '#ff6600']}
      />
      <CRTScreen className="min-h-screen" scanlines curve>
        <div className="flex flex-col items-center justify-center min-h-screen bg-retro-dark floating-particles p-4">
          {/* Logo principal animé */}
          <div className="text-center mb-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-3xl" />
            <NeonText as="h1" size="4xl" color="yellow" glow pulse className="relative z-10 mb-4">
              🟡 PACMAN RETRO 🟡
            </NeonText>
            <div className="retro-gradient h-2 w-48 mx-auto rounded-full" />
            <div className="flex justify-center items-center mt-4 space-x-4">
              <span className="text-neon-cyan text-2xl animate-bounce">👻</span>
              <span className="text-neon-magenta text-2xl animate-bounce animation-delay-200">
                👻
              </span>
              <span className="text-neon-orange text-2xl animate-bounce animation-delay-400">
                👻
              </span>
              <span className="text-neon-green text-2xl animate-bounce animation-delay-600">
                👻
              </span>
            </div>
          </div>

          {/* Bouton Continuer (si partie sauvegardée) */}
          {hasSavedGame && (
            <div className="mb-8">
              <ArcadeButton variant="neon" size="xl" glow pulse onClick={onResumeGame}>
                ▶ CONTINUER LA PARTIE
              </ArcadeButton>
            </div>
          )}

          {/* Grille des modes de jeu */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl mb-12">
            {modes.map((mode) => (
              <ModeCard
                key={mode.id}
                mode={mode.id}
                title={mode.title}
                description={mode.description}
                icon={mode.icon}
                difficulty={mode.difficulty}
                onSelect={() => onSelectMode(mode.id)}
              />
            ))}
          </div>

          {/* Menu secondaire */}
          <div className="flex flex-wrap justify-center gap-4">
            <ArcadeButton variant="secondary" size="md" glow onClick={handleShowStats}>
              📊 STATISTIQUES
            </ArcadeButton>
            <ArcadeButton variant="secondary" size="md" glow disabled>
              ⚙️ PARAMÈTRES
            </ArcadeButton>
            <ArcadeButton variant="danger" size="md" glow disabled>
              🏆 CLASSEMENTS
            </ArcadeButton>
          </div>

          {/* Copyright rétro */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 font-arcade text-xs">
              © 2024 PACMAN RETRO - ARCADE STYLE GAMING
            </p>
          </div>
        </div>
      </CRTScreen>
    </>
  )
}

export default MainMenu
