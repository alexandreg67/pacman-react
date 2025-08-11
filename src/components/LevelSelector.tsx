import React, { useState } from 'react'
import type { GameMode } from '../game/types'
import { loadProgress } from '../game/storage/progress'
import { cn } from '../lib/utils'
import NeonText from './ui/NeonText'
import ArcadeButton from './ui/ArcadeButton'
import CRTScreen from './ui/CRTScreen'
import RetroCard from './ui/RetroCard'

interface LevelSelectorProps {
  mode: GameMode
  onLevelSelect: (level: number) => void
  onBack: () => void
}

interface LevelCardProps {
  level: number
  isUnlocked: boolean
  stars: number
  highScore: number
  bestTime?: number
  mode: GameMode
  onClick: () => void
}

const LevelCard: React.FC<LevelCardProps> = ({
  level,
  isUnlocked,
  stars,
  highScore,
  bestTime,
  mode,
  onClick,
}) => {
  const modeColors = {
    classic: 'cyan' as const,
    easy: 'green' as const,
    hard: 'orange' as const,
    speedrun: 'yellow' as const,
    survival: 'magenta' as const,
  }

  return (
    <RetroCard
      variant="hex"
      color={modeColors[mode]}
      interactive={isUnlocked}
      onClick={isUnlocked ? onClick : undefined}
      className={cn(
        'relative min-h-[120px] transition-all duration-300',
        isUnlocked ? 'hover:scale-110 cursor-pointer' : 'opacity-50 cursor-not-allowed grayscale',
      )}
    >
      <div className="flex flex-col items-center justify-center h-full p-4 relative z-10">
        {/* Numéro du niveau */}
        <NeonText size="2xl" color={modeColors[mode]} glow={isUnlocked} className="mb-2">
          {level}
        </NeonText>

        {isUnlocked ? (
          <>
            {/* Étoiles */}
            <div className="flex mb-2 space-x-1">
              {Array.from({ length: 3 }, (_, i) => (
                <span
                  key={i}
                  className={cn(
                    'text-lg transition-all duration-300',
                    i < stars ? 'text-yellow-400 animate-pulse' : 'text-gray-600',
                  )}
                >
                  ⭐
                </span>
              ))}
            </div>

            {/* Score */}
            {highScore > 0 && (
              <div className="text-xs text-gray-300 font-cyber text-center">
                {highScore.toLocaleString()}
              </div>
            )}

            {/* Temps (pour speedrun) */}
            {mode === 'speedrun' && bestTime && bestTime > 0 && (
              <div className="text-xs text-neon-yellow font-arcade">
                {(bestTime / 1000).toFixed(1)}s
              </div>
            )}
          </>
        ) : (
          <div className="text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="text-xs text-gray-500 font-arcade">VERROUILLÉ</div>
          </div>
        )}

        {/* Effet de déblocage */}
        {isUnlocked && stars === 3 && (
          <div className="absolute inset-0 hex-clip">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-yellow-200/30 to-yellow-400/20 animate-pulse" />
          </div>
        )}
      </div>
    </RetroCard>
  )
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ mode, onLevelSelect, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const levelsPerPage = 20

  // Charger la progression
  const progress = loadProgress()
  const unlockedLevels = progress.unlockedLevels[mode] || [1]
  const highScores = progress.highScores[mode] || {}
  const bestTimes = progress.bestTimes || {}
  const stars = progress.stars[mode] || {}

  // Générer une liste de niveaux (1-50 pour l'exemple)
  const allLevels = Array.from({ length: 50 }, (_, i) => i + 1)

  // Filtrer les niveaux selon le terme de recherche
  const filteredLevels = allLevels.filter((level) => level.toString().includes(searchTerm))

  // Pagination
  const totalPages = Math.ceil(filteredLevels.length / levelsPerPage)
  const startIndex = (currentPage - 1) * levelsPerPage
  const endIndex = startIndex + levelsPerPage
  const currentLevels = filteredLevels.slice(startIndex, endIndex)

  // Titres des modes
  const modeTitle = {
    classic: 'MODE CLASSIQUE',
    easy: 'MODE FACILE',
    hard: 'MODE DIFFICILE',
    speedrun: 'MODE SPEEDRUN',
    survival: 'MODE SURVIE',
  }

  return (
    <CRTScreen className="min-h-screen" scanlines curve>
      <div className="flex flex-col items-center justify-center min-h-screen bg-retro-dark floating-particles p-4">
        <div className="w-full max-w-6xl">
          {/* Header avec navigation */}
          <div className="flex justify-between items-center mb-8">
            <ArcadeButton variant="secondary" size="md" onClick={onBack} glow>
              ← RETOUR
            </ArcadeButton>
            <NeonText as="h1" size="3xl" color="cyan" glow pulse className="text-center">
              {modeTitle[mode]}
            </NeonText>
            <div className="w-24"></div> {/* Spacer pour centrer */}
          </div>

          {/* Statistiques du mode */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-retro-card border border-retro rounded-lg p-4 text-center">
              <NeonText size="lg" color="green" glow>
                {unlockedLevels.length}
              </NeonText>
              <p className="text-gray-400 font-arcade text-xs">DÉBLOQUÉS</p>
            </div>
            <div className="bg-retro-card border border-retro rounded-lg p-4 text-center">
              <NeonText size="lg" color="yellow" glow>
                {Object.values(stars).reduce((a, b) => a + b, 0)}
              </NeonText>
              <p className="text-gray-400 font-arcade text-xs">ÉTOILES</p>
            </div>
            <div className="bg-retro-card border border-retro rounded-lg p-4 text-center">
              <NeonText size="lg" color="magenta" glow>
                {Object.keys(highScores).length}
              </NeonText>
              <p className="text-gray-400 font-arcade text-xs">COMPLÉTÉS</p>
            </div>
            <div className="bg-retro-card border border-retro rounded-lg p-4 text-center">
              <NeonText size="lg" color="orange" glow>
                {Math.round(
                  (Object.values(stars).filter((s) => s === 3).length / allLevels.length) * 100,
                )}
                %
              </NeonText>
              <p className="text-gray-400 font-arcade text-xs">PARFAIT</p>
            </div>
          </div>

          {/* Barre de recherche futuriste */}
          <div className="mb-8 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="RECHERCHER UN NIVEAU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-4 bg-retro-card border-2 border-cyan-500 rounded-lg focus:border-neon-cyan focus:outline-none font-arcade text-white placeholder-gray-500 hover-neon transition-all duration-300"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cyan-400">
                🔍
              </div>
            </div>
          </div>

          {/* Grille des niveaux hexagonaux */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 mb-8">
            {currentLevels.map((level) => {
              const isUnlocked = unlockedLevels.includes(level)
              const highScore = highScores[level] || 0
              const bestTime = bestTimes[level] || 0
              const levelStars = stars[level] || 0

              return (
                <LevelCard
                  key={level}
                  level={level}
                  isUnlocked={isUnlocked}
                  stars={levelStars}
                  highScore={highScore}
                  bestTime={bestTime}
                  mode={mode}
                  onClick={() => onLevelSelect(level)}
                />
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-4 mb-8">
              <ArcadeButton
                variant="primary"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ←
              </ArcadeButton>

              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      'w-8 h-8 rounded-full font-arcade text-sm transition-all duration-300',
                      currentPage === page
                        ? 'bg-cyan-500 text-black font-bold'
                        : 'bg-retro-card text-cyan-400 hover:bg-cyan-500/20',
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <ArcadeButton
                variant="primary"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                →
              </ArcadeButton>
            </div>
          )}

          {/* Infos de pagination */}
          <div className="text-center">
            <p className="text-gray-400 font-cyber">
              Affichage {startIndex + 1}-{Math.min(endIndex, filteredLevels.length)} de{' '}
              {filteredLevels.length} niveaux
            </p>
            {searchTerm && (
              <p className="text-neon-yellow font-arcade text-sm mt-2">
                🔍 Recherche active : "{searchTerm}"
              </p>
            )}
          </div>
        </div>
      </div>
    </CRTScreen>
  )
}

export default LevelSelector
