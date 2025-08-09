import React, { useCallback, useEffect, useMemo } from 'react'
import { ThemeToggle } from './components/ThemeToggle'
import './App.css'
import { Board } from './components/Board'
import { useGame } from './game/react/useGame'

// Mémorisation des styles statiques
const APP_STYLES = {
  container: 'min-h-screen bg-black flex flex-col items-center justify-center p-4',
  wrapper: 'relative z-10 flex flex-col items-center gap-6 max-w-4xl',
  header: 'text-center',
  title: 'text-4xl md:text-5xl font-bold text-yellow-400 mb-4 font-mono tracking-wider',
  stats:
    'flex flex-wrap items-center justify-center gap-6 text-lg font-mono text-white bg-blue-900/30 rounded-lg px-6 py-3',
  statItem: 'flex items-center gap-2',
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
  }: {
    score: number
    lives: number
    pelletsRemaining: number
  }) => (
    <div className={APP_STYLES.stats}>
      <div className={APP_STYLES.statItem}>
        <span className="text-yellow-300">SCORE:</span>
        <span className="text-white font-bold">{score.toLocaleString()}</span>
      </div>
      <div className={APP_STYLES.statItem}>
        <span className="text-red-300">LIVES:</span>
        <span className="text-white font-bold">{'♥'.repeat(lives)}</span>
      </div>
      <div className={APP_STYLES.statItem}>
        <span className="text-blue-300">PELLETS:</span>
        <span className="text-white font-bold">{pelletsRemaining}</span>
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
  const { state, stepInput, reset } = useGame()

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
    }),
    [state],
  )

  // Mémorisation des statistiques
  const gameStats = useMemo(
    () => ({
      score: state.score,
      lives: state.lives,
      pelletsRemaining: state.pelletsRemaining,
    }),
    [state.score, state.lives, state.pelletsRemaining],
  )

  // Vérification de completion de niveau
  const isLevelComplete = state.pelletsRemaining === 0

  return (
    <div className={APP_STYLES.container}>
      {/* Performance Monitor retiré */}

      <div className={APP_STYLES.wrapper}>
        {/* Header */}
        <header className={APP_STYLES.header}>
          <h1 className={APP_STYLES.title}>PAC-MAN</h1>
          <GameStats {...gameStats} />
        </header>

        {/* Game Board */}
        <main className={APP_STYLES.main}>
          <Board {...boardProps} />

          {/* Game completion overlay */}
          {isLevelComplete && <LevelCompleteOverlay score={state.score} onReset={reset} />}
        </main>

        {/* Controls */}
        <footer className={APP_STYLES.footer}>
          <div className={APP_STYLES.controls}>
            <ThemeToggle />
            <button onClick={reset} className={APP_STYLES.resetBtn}>
              RESET (R)
            </button>
          </div>
          <GameInstructions />
        </footer>
      </div>
    </div>
  )
}

export default React.memo(App)
