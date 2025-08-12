import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { GameOverScreen } from './components/GameOverScreen'
import './App.css'
import { Board } from './components/Board'
import { useGame } from './game/react/useGame'
import { useGameAudioIntegration } from './game/react/useGameWithAudio'
import type { GameMode } from './game/types'
import MainMenu from './components/MainMenu'
import LevelSelector from './components/LevelSelector'
import LevelCompleteModal from './components/LevelCompleteModal'
import { loadProgress, saveProgress, updateHighScore } from './game/storage/progress'
import { calculateStarsFromGameState } from './game/logic/stars'
import { loadStats, updateStats, saveStats } from './game/storage/stats'
import LeftSidebar from './components/layout/LeftSidebar'
import RightSidebar from './components/layout/RightSidebar'
import { AudioControls } from './components/AudioControls'

// États de l'application
type AppScreen = 'main-menu' | 'level-selector' | 'game' | 'game-over'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main-menu')
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic')
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const { state, stepInput, reset, restart } = useGame(selectedMode)

  // Initialize audio system
  useGameAudioIntegration(state)

  // Charger la progression au démarrage
  useEffect(() => {
    const progress = loadProgress()
    // Vérifier s'il y a une partie sauvegardée
    if (progress.lastPlayedMode && progress.lastPlayedLevel) {
      // Pour l'instant, on reste sur le menu principal
      // Plus tard, on pourrait proposer de reprendre la partie
    }
  }, [])

  // Mémorisation des handlers d'événements
  const handleKeyDown = useCallback(
    (e: Event) => {
      const keyEvent = e as KeyboardEvent
      // Optimisation: éviter les re-rendus inutiles en vérifiant la touche avant
      switch (keyEvent.key) {
        case 'ArrowUp':
          keyEvent.preventDefault()
          stepInput('up')
          break
        case 'ArrowDown':
          keyEvent.preventDefault()
          stepInput('down')
          break
        case 'ArrowLeft':
          keyEvent.preventDefault()
          stepInput('left')
          break
        case 'ArrowRight':
          keyEvent.preventDefault()
          stepInput('right')
          break
        case 'r':
        case 'R':
          keyEvent.preventDefault()
          reset()
          break
        default:
          // Ignorer les autres touches
          return
      }
    },
    [stepInput, reset],
  )

  // Gestion optimisée des événements clavier
  useEffect(() => {
    // Pas de passive: false car on appelle preventDefault() conditionnellement
    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Mémorisation des props du Board pour éviter les re-rendus
  const boardProps = useMemo(
    () => ({
      state,
      tileSize: 28,
      onRestart: restart,
    }),
    [state, restart],
  )

  // Mémorisation des statistiques
  const gameStats = useMemo(
    () => ({
      score: state.score,
      lives: state.lives,
      pelletsRemaining: state.pelletsRemaining,
      level: state.level,
    }),
    [state.score, state.lives, state.pelletsRemaining, state.level],
  )

  // Vérification de completion de niveau
  const isLevelComplete = state.pelletsRemaining === 0

  // Sauvegarder la progression quand le niveau est terminé

  useEffect(() => {
    if (isLevelComplete && state.started && state.gameStartTime > 0) {
      const timeElapsed = Date.now() - state.gameStartTime
      const stars = calculateStarsFromGameState(
        selectedMode,
        selectedLevel,
        state.grid,
        state.pelletsRemaining,
        state.lives,
        state.score,
        timeElapsed,
      )

      // Mettre à jour la progression
      let progress = loadProgress()
      progress = updateHighScore(progress, selectedMode, selectedLevel, state.score)

      // Mettre à jour les étoiles
      if (!progress.stars[selectedMode]) {
        progress.stars[selectedMode] = {}
      }
      const currentStars = progress.stars[selectedMode][selectedLevel] || 0
      if (stars > currentStars) {
        progress.stars[selectedMode][selectedLevel] = stars
      }

      // Débloquer le niveau suivant
      if (stars >= 1 && selectedLevel < 50) {
        const nextLevel = selectedLevel + 1
        if (!progress.unlockedLevels[selectedMode].includes(nextLevel)) {
          progress.unlockedLevels[selectedMode].push(nextLevel)
          progress.unlockedLevels[selectedMode].sort((a, b) => a - b)
        }
      }

      saveProgress(progress)

      // Mettre à jour les statistiques
      const stats = loadStats()
      const updatedStats = updateStats(
        stats,
        selectedMode,
        state.score,
        timeElapsed,
        true, // isWin = true car niveau complété
      )
      saveStats(updatedStats)
    }
  }, [
    isLevelComplete,
    state.started,
    state.gameStartTime,
    state.pelletsRemaining,
    state.lives,
    state.score,
    state.grid, // state.grid est toujours nécessaire pour le calcul des pellets dans calculateStarsFromGameState
    selectedMode,
    selectedLevel,
    // NOTE: We intentionally avoid `state` object to prevent unnecessary re-renders
    // Only specific state properties above are tracked
  ])

  // Sauvegarder les statistiques en cas de game over
  useEffect(() => {
    if (state.gameStatus === 'game-over' && state.started && state.gameStartTime > 0) {
      const timeElapsed = Date.now() - state.gameStartTime

      // Mettre à jour les statistiques
      const stats = loadStats()
      const updatedStats = updateStats(
        stats,
        selectedMode,
        state.score,
        timeElapsed,
        false, // isWin = false car game over
      )
      saveStats(updatedStats)
    }
  }, [state.gameStatus, state.started, state.gameStartTime, state.score, selectedMode])

  // Handlers de navigation
  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode)
    setCurrentScreen('level-selector')
  }

  const handleSelectLevel = (level: number) => {
    setSelectedLevel(level)
    setCurrentScreen('game')
    // Sauvegarder le dernier mode/level joué
    const progress = loadProgress()
    progress.lastPlayedMode = selectedMode
    progress.lastPlayedLevel = level
    saveProgress(progress)
    // Réinitialiser le jeu pour le nouveau mode/niveau
    restart()
  }

  const handleBackToMenu = () => {
    setCurrentScreen('main-menu')
  }

  const handleBackToLevelSelector = () => {
    setCurrentScreen('level-selector')
  }

  const handleResumeGame = () => {
    // Charger la partie sauvegardée
    const progress = loadProgress()
    if (progress.lastPlayedMode && progress.lastPlayedLevel) {
      setSelectedMode(progress.lastPlayedMode)
      setSelectedLevel(progress.lastPlayedLevel)
      setCurrentScreen('game')
      restart()
    } else {
      setCurrentScreen('main-menu')
    }
  }

  // Rendu conditionnel selon l'écran actuel
  const renderScreen = () => {
    switch (currentScreen) {
      case 'main-menu':
        return (
          <MainMenu
            onSelectMode={handleSelectMode}
            onResumeGame={handleResumeGame}
            hasSavedGame={false} // À implémenter plus tard
          />
        )

      case 'level-selector':
        return (
          <LevelSelector
            mode={selectedMode}
            onLevelSelect={handleSelectLevel}
            onBack={handleBackToMenu}
          />
        )

      case 'game':
      case 'game-over':
        return (
          <div className="min-h-screen bg-black relative">
            {/* Layout Desktop avec sidebars - Affichage à partir de 1200px */}
            <div className="hidden min-[1200px]:grid min-[1200px]:grid-cols-[280px_1fr_280px] min-[1400px]:grid-cols-[320px_1fr_320px] gap-6 min-[1400px]:gap-8 p-4 min-[1400px]:p-6 h-screen max-w-[1800px] mx-auto">
              {/* Sidebar Gauche */}
              <LeftSidebar
                selectedMode={selectedMode}
                selectedLevel={selectedLevel}
                onBackToLevelSelector={handleBackToLevelSelector}
                onRestart={restart}
              />

              {/* Zone de jeu centrale */}
              <div className="flex flex-col items-center justify-center gap-6">
                <Board {...boardProps} />

                {/* Game completion overlay */}
                {isLevelComplete && (
                  <LevelCompleteModal
                    mode={selectedMode}
                    level={selectedLevel}
                    state={state}
                    timeElapsed={state.gameStartTime > 0 ? Date.now() - state.gameStartTime : 0}
                    onNextLevel={() => {
                      const nextLevel = selectedLevel + 1
                      if (nextLevel <= 50) {
                        setSelectedLevel(nextLevel)
                        restart()
                      }
                    }}
                    onRetry={restart}
                    onBackToMenu={handleBackToMenu}
                  />
                )}
              </div>

              {/* Sidebar Droite */}
              <RightSidebar
                score={gameStats.score}
                level={gameStats.level}
                lives={gameStats.lives}
                pelletsRemaining={gameStats.pelletsRemaining}
                selectedMode={selectedMode}
                gameStartTime={state.gameStartTime}
                isGameRunning={state.gameStatus === 'playing' && state.started}
                showPerformanceMonitor={process.env.NODE_ENV === 'development'}
              />
            </div>

            {/* Layout Mobile/Tablet (ancien layout) - En dessous de 1200px */}
            <div className="min-[1200px]:hidden flex flex-col items-center justify-center p-4 min-h-screen gap-6">
              {/* Header */}
              <div className="w-full text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold text-yellow-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.25)] font-mono tracking-wider">
                  PAC-MAN
                </h1>

                <div className="flex items-center justify-center gap-4 text-sm text-gray-400 font-mono">
                  <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
                    <div className="text-yellow-400 font-bold">{selectedMode.toUpperCase()}</div>
                    <div className="text-gray-300">NIVEAU {selectedLevel}</div>
                  </div>

                  {/* Timer pour speedrun sur mobile */}
                  {selectedMode === 'speedrun' && (
                    <div className="bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
                      <div className="text-gray-400 text-xs mb-1">TEMPS</div>
                      {/* Ici on peut ajouter le timer compact */}
                    </div>
                  )}
                </div>

                {/* Stats compactes */}
                <div className="flex flex-wrap justify-center gap-3">
                  <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-yellow-400 font-mono text-sm border border-gray-700">
                    🏆 {gameStats.score.toLocaleString()}
                  </div>
                  <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-emerald-400 font-mono text-sm border border-gray-700">
                    🎯 {gameStats.level}
                  </div>
                  <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-red-400 font-mono text-sm border border-gray-700">
                    ❤️ {gameStats.lives}
                  </div>
                  <div className="bg-gray-800/50 rounded-lg px-3 py-2 text-blue-400 font-mono text-sm border border-gray-700">
                    ⚪ {gameStats.pelletsRemaining}
                  </div>
                </div>
              </div>

              {/* Game Board */}
              <div className="relative">
                <Board {...boardProps} />

                {/* Game completion overlay */}
                {isLevelComplete && (
                  <LevelCompleteModal
                    mode={selectedMode}
                    level={selectedLevel}
                    state={state}
                    timeElapsed={state.gameStartTime > 0 ? Date.now() - state.gameStartTime : 0}
                    onNextLevel={() => {
                      const nextLevel = selectedLevel + 1
                      if (nextLevel <= 50) {
                        setSelectedLevel(nextLevel)
                        restart()
                      }
                    }}
                    onRetry={restart}
                    onBackToMenu={handleBackToMenu}
                  />
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <button
                    onClick={handleBackToLevelSelector}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono font-bold transition-colors duration-200"
                  >
                    ← QUITTER
                  </button>
                  <button
                    onClick={restart}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-mono font-bold transition-colors duration-200"
                  >
                    🔄 RESTART
                  </button>

                  {/* Audio Controls - Compact version for mobile */}
                  <AudioControls compact className="ml-2" />
                </div>

                {/* Instructions */}
                <div className="text-center text-gray-300 font-mono text-sm">
                  <p>Utilisez les flèches ←↑→↓ pour vous déplacer</p>
                  <p className="text-xs text-gray-500 mt-1">Appuyez sur R pour recommencer</p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <MainMenu
            onSelectMode={handleSelectMode}
            onResumeGame={handleResumeGame}
            hasSavedGame={false}
          />
        )
    }
  }

  return (
    <>
      {renderScreen()}
      {/* Game Over Screen rendu via portail - toujours disponible quand nécessaire */}
      {state.gameStatus === 'game-over' && (
        <GameOverScreen
          score={state.score}
          onRestart={restart}
          level={state.level}
          timeElapsed={
            state.gameStartTime > 0
              ? Math.floor((Date.now() - state.gameStartTime) / 1000)
              : undefined
          }
        />
      )}
    </>
  )
}

export default React.memo(App)
