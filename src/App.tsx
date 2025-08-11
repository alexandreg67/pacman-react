import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeToggle } from './components/ThemeToggle'
import { GameOverScreen } from './components/GameOverScreen'
import './App.css'
import { Board } from './components/Board'
import { useGame } from './game/react/useGame'
import hudStyles from './components/Hud.module.css'
import type { GameMode } from './game/types'
import MainMenu from './components/MainMenu'
import LevelSelector from './components/LevelSelector'
import GameTimer from './components/GameTimer'
import ArcadeButton from './components/ui/ArcadeButton'
import LevelCompleteModal from './components/LevelCompleteModal'
import { loadProgress, saveProgress, updateHighScore } from './game/storage/progress'
import { calculateStarsFromGameState } from './game/logic/stars'
import { loadStats, updateStats, saveStats } from './game/storage/stats'

// États de l'application
type AppScreen = 'main-menu' | 'level-selector' | 'game' | 'game-over'

// Mémorisation des styles statiques
const APP_STYLES = {
  container: 'min-h-screen bg-black flex flex-col items-center justify-center p-4',
  wrapper: 'relative z-10 flex flex-col items-center gap-6 max-w-5xl w-full',
  header: 'w-full flex flex-col items-center gap-3',
  title:
    'text-4xl md:text-5xl font-extrabold text-yellow-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.25)] font-mono tracking-wider',
  main: 'relative',
  overlay: 'absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg',
  overlayContent: 'text-center text-white',
  overlayTitle: 'text-4xl font-bold text-yellow-400 mb-4',
  overlayScore: 'text-xl mb-4',
  playAgainBtn:
    'px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-colors duration-200',
  footer: 'flex flex-col items-center gap-4',
  controls: 'flex items-center gap-4',
  resetBtn:
    'px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-mono font-bold transition-colors duration-200',
  instructions: 'text-center text-gray-300 font-mono text-sm',
  kbd: 'px-2 py-1 bg-gray-800 rounded text-white border border-gray-600',
  kbdSmall: 'px-1 bg-gray-800 rounded text-white border border-gray-600',
  instructionLine: 'mt-1 text-xs text-gray-500',
} as const

// Composant de statistiques mémorisé
const GameStats = React.memo(
  ({
    score,
    lives,
    pelletsRemaining,
    level,
  }: {
    score: number
    lives: number
    pelletsRemaining: number
    level: number
  }) => (
    <div className={hudStyles.hudContainer}>
      <div className={hudStyles.statItem} aria-label="score">
        <span className={hudStyles.statLabel}>Score</span>
        <span className={`${hudStyles.statValue} ${hudStyles.scoreValue}`}>
          {score.toLocaleString()}
        </span>
      </div>
      <div className={hudStyles.statItem} aria-label="level">
        <span className={hudStyles.statLabel}>Level</span>
        <span className={`${hudStyles.statValue} ${hudStyles.levelValue}`}>{level}</span>
      </div>
      <div className={hudStyles.statItem} aria-label="lives">
        <span className={hudStyles.statLabel}>Lives</span>
        <span className={`${hudStyles.statValue} ${hudStyles.livesContainer}`}>
          {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
            <span key={i} role="img" aria-label={`life-${i + 1}`}>
              ❤️
            </span>
          ))}
          {lives === 0 && <span className={hudStyles.gameOver}>GAME OVER</span>}
        </span>
      </div>
      <div className={hudStyles.statItem} aria-label="pellets">
        <span className={hudStyles.statLabel}>Pellets</span>
        <span className={`${hudStyles.statValue} ${hudStyles.pelletsValue}`}>
          {pelletsRemaining}
        </span>
      </div>
    </div>
  ),
)

GameStats.displayName = 'GameStats'

// Composant de completion de niveau mémorisé
const LevelCompleteOverlay = React.memo(
  ({ score, onReset }: { score: number; onReset: () => void }) => (
    <div className={APP_STYLES.overlay}>
      <div className={APP_STYLES.overlayContent}>
        <h2 className={APP_STYLES.overlayTitle}>LEVEL COMPLETE!</h2>
        <p className={APP_STYLES.overlayScore}>Final Score: {score.toLocaleString()}</p>
        <button onClick={onReset} className={APP_STYLES.playAgainBtn}>
          Play Again
        </button>
      </div>
    </div>
  ),
)

LevelCompleteOverlay.displayName = 'LevelCompleteOverlay'

// Composant d'instructions mémorisé
const GameInstructions = React.memo(() => (
  <div className={APP_STYLES.instructions}>
    <p>
      Use <kbd className={APP_STYLES.kbd}>←↑→↓</kbd> arrow keys to move
    </p>
    <p className={APP_STYLES.instructionLine}>
      Press <kbd className={APP_STYLES.kbdSmall}>R</kbd> to restart
    </p>
  </div>
))

GameInstructions.displayName = 'GameInstructions'

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('main-menu')
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic')
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const { state, stepInput, reset, restart } = useGame(selectedMode)

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
      const stars = calculateStarsFromGameState(selectedMode, selectedLevel, state, timeElapsed)

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
    state.score,
    selectedMode,
    selectedLevel,
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
          <div className={APP_STYLES.container}>
            <div className={APP_STYLES.wrapper}>
              {/* Header */}
              <header className={APP_STYLES.header}>
                <div className="flex justify-between items-center w-full mb-4">
                  <div className="flex items-center space-x-4">
                    <h1 className={APP_STYLES.title}>PAC-MAN</h1>
                    <div className="text-sm text-gray-400 font-arcade">
                      {selectedMode.toUpperCase()} - NIVEAU {selectedLevel}
                    </div>
                  </div>

                  {/* Timer pour le mode speedrun */}
                  {selectedMode === 'speedrun' && (
                    <div className="flex-shrink-0">
                      <GameTimer
                        startTime={state.gameStartTime}
                        isRunning={state.gameStatus === 'playing' && state.started}
                        showMilliseconds={true}
                        color="yellow"
                      />
                    </div>
                  )}
                </div>
                <GameStats {...gameStats} />
              </header>

              {/* Game Board */}
              <main className={APP_STYLES.main}>
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
              </main>

              {/* Controls */}
              <footer className={APP_STYLES.footer}>
                <div className={APP_STYLES.controls}>
                  <ThemeToggle />
                  <ArcadeButton variant="danger" size="sm" onClick={handleBackToLevelSelector} glow>
                    ← QUITTER
                  </ArcadeButton>
                  <ArcadeButton variant="secondary" size="sm" onClick={restart} glow>
                    🔄 RESTART
                  </ArcadeButton>
                </div>
                <GameInstructions />
              </footer>
            </div>

            {/* Game Over Screen */}
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

  return renderScreen()
}

export default React.memo(App)
