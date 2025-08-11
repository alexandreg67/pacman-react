import React, { useState, useEffect } from 'react'
import { cn } from '../lib/utils'
import NeonText from './ui/NeonText'
import ArcadeButton from './ui/ArcadeButton'
import StarDisplay from './ui/StarDisplay'
import { calculateStarsFromGameState, getStarDescription } from '../game/logic/stars'
import type { GameMode, GameState } from '../game/types'
import useArcadeSounds from '../hooks/useArcadeSounds'

interface LevelCompleteModalProps {
  mode: GameMode
  level: number
  state: GameState
  timeElapsed: number
  onNextLevel: () => void
  onRetry: () => void
  onBackToMenu: () => void
  className?: string
}

const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  mode,
  level,
  state,
  timeElapsed,
  onNextLevel,
  onRetry,
  onBackToMenu,
  className,
}) => {
  const [showStars, setShowStars] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const { playVictoryMelody, playSuccessMelody } = useArcadeSounds()

  const stars = calculateStarsFromGameState(mode, level, state, timeElapsed)
  const starDescriptions = getStarDescription(mode, level)

  const timeInSeconds = Math.floor(timeElapsed / 1000)
  const minutes = Math.floor(timeInSeconds / 60)
  const seconds = timeInSeconds % 60
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`

  // Animations d'apparition
  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300)
    const timer2 = setTimeout(() => {
      setShowStars(true)
      // Jouer le son selon les étoiles
      if (stars === 3) {
        playVictoryMelody()
      } else if (stars >= 1) {
        playSuccessMelody()
      }
    }, 800)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [stars, playVictoryMelody, playSuccessMelody])

  // Messages selon les étoiles gagnées
  const getSuccessMessage = () => {
    switch (stars) {
      case 3:
        return 'PERFORMANCE PARFAITE !'
      case 2:
        return 'EXCELLENT TRAVAIL !'
      case 1:
        return 'NIVEAU TERMINÉ !'
      default:
        return 'ESSAYEZ ENCORE !'
    }
  }

  const getSuccessColor = () => {
    switch (stars) {
      case 3:
        return 'yellow'
      case 2:
        return 'green'
      case 1:
        return 'cyan'
      default:
        return 'orange'
    }
  }

  return (
    <div
      className={cn(
        'fixed inset-0 bg-black/80 flex items-center justify-center z-50',
        'backdrop-blur-sm',
        className,
      )}
    >
      <div className="bg-retro-dark border-2 border-cyan-500 rounded-lg p-8 max-w-lg w-full mx-4 relative overflow-hidden">
        {/* Effet de fond animé */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-yellow-500/10 animate-pulse" />

        <div className="relative z-10 text-center">
          {/* Titre de succès */}
          <div
            className={cn(
              'transform transition-all duration-700 ease-out',
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            <NeonText
              as="h2"
              size="2xl"
              color={
                getSuccessColor() as 'cyan' | 'magenta' | 'yellow' | 'green' | 'orange' | 'purple'
              }
              glow
              pulse
              className="mb-4"
            >
              {getSuccessMessage()}
            </NeonText>
          </div>

          {/* Informations du niveau */}
          <div
            className={cn(
              'transform transition-all duration-700 ease-out delay-300',
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            <div className="mb-6 space-y-2">
              <p className="text-gray-300 font-cyber">
                <span className="text-cyan-400">Mode:</span> {mode.toUpperCase()}
              </p>
              <p className="text-gray-300 font-cyber">
                <span className="text-cyan-400">Niveau:</span> {level}
              </p>
              <p className="text-gray-300 font-cyber">
                <span className="text-cyan-400">Score:</span> {state.score.toLocaleString()}
              </p>
              <p className="text-gray-300 font-cyber">
                <span className="text-cyan-400">Temps:</span> {timeString}
              </p>
            </div>
          </div>

          {/* Affichage des étoiles */}
          <div
            className={cn(
              'transform transition-all duration-700 ease-out delay-500',
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            <div className="mb-6">
              <p className="text-gray-400 font-arcade text-sm mb-4">ÉTOILES GAGNÉES</p>
              <div className="flex justify-center">
                <StarDisplay
                  stars={stars}
                  size="xl"
                  showAnimation={showStars}
                  onAnimationComplete={() => {
                    // Peut-être jouer un son ici
                  }}
                />
              </div>
            </div>
          </div>

          {/* Critères d'étoiles */}
          <div
            className={cn(
              'transform transition-all duration-700 ease-out delay-700',
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            <div className="mb-6 text-left bg-retro-card p-4 rounded-lg border border-gray-600">
              <h4 className="text-cyan-400 font-arcade text-sm mb-2">CRITÈRES D'ÉTOILES</h4>
              <div className="space-y-1 text-xs font-cyber">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-gray-300">{starDescriptions.star1}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⭐⭐</span>
                  <span className="text-gray-300">{starDescriptions.star2}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⭐⭐⭐</span>
                  <span className="text-gray-300">{starDescriptions.star3}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Boutons d'action */}
          <div
            className={cn(
              'transform transition-all duration-700 ease-out delay-1000',
              showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
            )}
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {level < 50 && (
                <ArcadeButton variant="primary" size="lg" glow pulse onClick={onNextLevel}>
                  NIVEAU SUIVANT →
                </ArcadeButton>
              )}

              <ArcadeButton variant="secondary" size="lg" glow onClick={onRetry}>
                🔄 REJOUER
              </ArcadeButton>

              <ArcadeButton variant="danger" size="lg" glow onClick={onBackToMenu}>
                ← MENU
              </ArcadeButton>
            </div>
          </div>

          {/* Message d'encouragement selon la performance */}
          {stars === 3 && (
            <div
              className={cn(
                'transform transition-all duration-700 ease-out delay-1200',
                showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
            >
              <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500 rounded-lg">
                <p className="text-yellow-300 font-arcade text-xs">
                  🏆 MAÎTRE PACMAN ! Performance exceptionnelle !
                </p>
              </div>
            </div>
          )}

          {stars === 2 && (
            <div
              className={cn(
                'transform transition-all duration-700 ease-out delay-1200',
                showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
            >
              <div className="mt-4 p-3 bg-green-500/20 border border-green-500 rounded-lg">
                <p className="text-green-300 font-arcade text-xs">
                  👍 Très bien joué ! Continuez comme ça !
                </p>
              </div>
            </div>
          )}

          {stars === 1 && (
            <div
              className={cn(
                'transform transition-all duration-700 ease-out delay-1200',
                showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
              )}
            >
              <div className="mt-4 p-3 bg-cyan-500/20 border border-cyan-500 rounded-lg">
                <p className="text-cyan-300 font-arcade text-xs">
                  💪 Bon travail ! Essayez d'améliorer votre score !
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Particules de célébration pour 3 étoiles */}
        {stars === 3 && showStars && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  'absolute text-yellow-400 animate-bounce',
                  `animation-delay-${((i % 6) + 1) * 200}`,
                )}
                style={{
                  left: `${10 + (i % 4) * 25}%`,
                  top: `${10 + Math.floor(i / 4) * 30}%`,
                }}
              >
                {i % 3 === 0 ? '✨' : i % 3 === 1 ? '⭐' : '🎉'}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LevelCompleteModal
