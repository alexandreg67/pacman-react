import React from 'react'
import type { GameMode } from '../../game/types'
import GameTimer from '../GameTimer'
import {
  ScoreDisplay,
  LevelDisplay,
  LivesDisplay,
  PelletsDisplay,
  PerformanceMonitor,
  useFPS,
} from '../stats/GameStatsComponents'

interface RightSidebarProps {
  // Stats de jeu
  score: number
  level: number
  lives: number
  pelletsRemaining: number

  // Timer (speedrun mode)
  selectedMode: GameMode
  gameStartTime: number
  isGameRunning: boolean

  // Performance (optionnel)
  showPerformanceMonitor?: boolean
}

const RightSidebar: React.FC<RightSidebarProps> = React.memo(
  ({
    score,
    level,
    lives,
    pelletsRemaining,
    selectedMode,
    gameStartTime,
    isGameRunning,
    showPerformanceMonitor = false,
  }) => {
    const fps = useFPS()
    const gameTime = gameStartTime > 0 ? Date.now() - gameStartTime : 0

    return (
      <div className="flex flex-col justify-center gap-6 w-full h-full py-4">
        {/* Timer pour le mode speedrun */}
        {selectedMode === 'speedrun' && (
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-5 border border-gray-600/80 shadow-lg">
            <div className="text-center">
              <div className="text-gray-300 text-sm font-mono mb-3 uppercase tracking-wider font-bold">
                ⏱️ TEMPS
              </div>
              <GameTimer
                startTime={gameStartTime}
                isRunning={isGameRunning}
                showMilliseconds={true}
                color="yellow"
              />
            </div>
          </div>
        )}

        {/* Statistiques principales */}
        <div className="space-y-4">
          <div className="text-center text-gray-300 text-sm font-mono mb-4 uppercase tracking-wider font-bold">
            📊 STATISTIQUES
          </div>

          <div className="space-y-3">
            <ScoreDisplay score={score} size="md" />
            <LevelDisplay level={level} size="sm" />
            <LivesDisplay lives={lives} size="sm" />
            <PelletsDisplay pelletsRemaining={pelletsRemaining} size="sm" />
          </div>
        </div>

        {/* Séparateur visuel */}
        <div className="border-t border-gray-700/50 mx-4"></div>

        {/* Indicateur de progression du niveau */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-4 border border-gray-600/80 shadow-lg">
          <div className="text-center text-gray-300 text-sm font-mono mb-3 uppercase tracking-wider font-bold">
            🎯 PROGRESSION
          </div>
          <div className="space-y-3">
            {/* Barre de progression des pellets */}
            <div className="w-full bg-gray-800/80 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-3 rounded-full transition-all duration-300 shadow-sm"
                style={{
                  width:
                    pelletsRemaining > 0
                      ? `${Math.max(5, ((240 - pelletsRemaining) / 240) * 100)}%`
                      : '100%',
                }}
              />
            </div>
            <div className="text-sm text-gray-300 text-center font-medium">
              {pelletsRemaining === 0 ? 'NIVEAU TERMINÉ!' : `${240 - pelletsRemaining}/240 pellets`}
            </div>
          </div>
        </div>

        {/* Performance Monitor (développement uniquement) */}
        {showPerformanceMonitor && (
          <>
            <div className="border-t border-gray-700/50 mx-4"></div>
            <PerformanceMonitor gameTime={gameTime} fps={fps} showInProduction={false} size="sm" />
          </>
        )}

        {/* Séparateur visuel */}
        <div className="border-t border-gray-700/50 mx-4"></div>

        {/* Informations du niveau */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-4 border border-gray-600/80 shadow-lg">
          <div className="text-center text-gray-300 text-sm font-mono mb-3 uppercase tracking-wider font-bold">
            ℹ️ NIVEAU
          </div>
          <div className="space-y-2 text-sm text-gray-300 text-center">
            <div>
              Mode:{' '}
              <span className="text-yellow-400 font-mono font-bold">
                {selectedMode.toUpperCase()}
              </span>
            </div>
            <div>
              Niveau: <span className="text-emerald-400 font-mono font-bold">{level}</span>
            </div>
            {lives === 0 && (
              <div className="text-red-400 font-bold animate-pulse mt-3 text-base">
                ⚠️ GAME OVER
              </div>
            )}
            {pelletsRemaining === 0 && lives > 0 && (
              <div className="text-emerald-400 font-bold animate-pulse mt-3 text-base">
                ✅ NIVEAU COMPLÉTÉ!
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },
)

RightSidebar.displayName = 'RightSidebar'

export default RightSidebar
