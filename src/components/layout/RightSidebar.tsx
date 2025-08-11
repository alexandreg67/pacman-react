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
      <div className="flex flex-col gap-4 w-full h-full">
        {/* Timer pour le mode speedrun */}
        {selectedMode === 'speedrun' && (
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <div className="text-center">
              <div className="text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider">
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
        <div className="space-y-3">
          <div className="text-center text-gray-400 text-xs font-mono mb-3 uppercase tracking-wider">
            📊 STATISTIQUES
          </div>

          <ScoreDisplay score={score} size="md" />
          <LevelDisplay level={level} size="sm" />
          <LivesDisplay lives={lives} size="sm" />
          <PelletsDisplay pelletsRemaining={pelletsRemaining} size="sm" />
        </div>

        {/* Indicateur de progression du niveau */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
          <div className="text-center text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider">
            🎯 PROGRESSION
          </div>
          <div className="space-y-2">
            {/* Barre de progression des pellets */}
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width:
                    pelletsRemaining > 0
                      ? `${Math.max(5, ((240 - pelletsRemaining) / 240) * 100)}%`
                      : '100%',
                }}
              />
            </div>
            <div className="text-xs text-gray-500 text-center">
              {pelletsRemaining === 0 ? 'NIVEAU TERMINÉ!' : `${240 - pelletsRemaining}/240 pellets`}
            </div>
          </div>
        </div>

        {/* Performance Monitor (développement uniquement) */}
        {showPerformanceMonitor && (
          <PerformanceMonitor gameTime={gameTime} fps={fps} showInProduction={false} size="sm" />
        )}

        {/* Informations du niveau */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700 mt-auto">
          <div className="text-center text-gray-400 text-xs font-mono mb-2 uppercase tracking-wider">
            ℹ️ NIVEAU
          </div>
          <div className="space-y-1 text-xs text-gray-300 text-center">
            <div>
              Mode: <span className="text-yellow-400 font-mono">{selectedMode.toUpperCase()}</span>
            </div>
            <div>
              Niveau: <span className="text-emerald-400 font-mono">{level}</span>
            </div>
            {lives === 0 && (
              <div className="text-red-400 font-bold animate-pulse mt-2">⚠️ GAME OVER</div>
            )}
            {pelletsRemaining === 0 && lives > 0 && (
              <div className="text-emerald-400 font-bold animate-pulse mt-2">
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
