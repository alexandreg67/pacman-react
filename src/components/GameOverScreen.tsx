import React, { useEffect, useCallback, useState, useRef } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  score: number
  onRestart: () => void
  level?: number
  timeElapsed?: number
}

const getScoreMessage = (score: number): string => {
  if (score >= 50000) return '🏆 LEGENDARY PERFORMANCE!'
  if (score >= 25000) return '⭐ EXCELLENT GAME!'
  if (score >= 10000) return '👏 GREAT JOB!'
  if (score >= 5000) return '👍 NICE WORK!'
  return '💪 KEEP TRYING!'
}

const getBestScore = (): number => {
  try {
    return parseInt(localStorage.getItem('pacman-best-score') || '0', 10)
  } catch {
    return 0
  }
}

const setBestScore = (score: number): void => {
  try {
    localStorage.setItem('pacman-best-score', score.toString())
  } catch {
    // Ignore localStorage errors
  }
}

export const GameOverScreen = React.memo(({ score, onRestart, level = 1, timeElapsed }: Props) => {
  const [isNewRecord, setIsNewRecord] = useState(false)
  const [bestScore, setBestScoreState] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  const restartButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const currentBest = getBestScore()
    setBestScoreState(currentBest)

    if (score > currentBest) {
      setIsNewRecord(true)
      setBestScore(score)
      setBestScoreState(score)
    }

    // Trigger entrance animation
    const timer = setTimeout(() => setShowAnimation(true), 100)
    return () => clearTimeout(timer)
  }, [score])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onRestart()
      }
    },
    [onRestart],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Focus trap and focus management
  useEffect(() => {
    // Focus the restart button after animation
    const focusTimer = setTimeout(() => {
      restartButtonRef.current?.focus()
    }, 500)

    // Handle Tab key for focus trap
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        // Only focusable element is the restart button, so just prevent Tab from going elsewhere
        event.preventDefault()
        restartButtonRef.current?.focus()
      }
      if (event.key === 'Escape') {
        // Escape key also restarts the game
        event.preventDefault()
        onRestart()
      }
    }

    document.addEventListener('keydown', handleTabKey)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleTabKey)
    }
  }, [onRestart])

  const formatTime = (seconds?: number): string => {
    if (seconds == null) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      aria-describedby="final-score"
      className={`
          fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50
          transition-opacity duration-300
          ${showAnimation ? 'opacity-100' : 'opacity-0'}
      `}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        margin: 0,
        padding: '1rem',
        zIndex: 9999,
      }}
    >
      <div
        className={`
          relative game-over-modal
          p-6 md:p-8 text-center max-w-lg
          transition-all duration-500 ease-out transform
          ${showAnimation ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
      >
        {/* Coins pixelisés */}
        <div className="pixel-corner pixel-corner-tl absolute"></div>
        <div className="pixel-corner pixel-corner-tr absolute"></div>
        <div className="pixel-corner pixel-corner-bl absolute"></div>
        <div className="pixel-corner pixel-corner-br absolute"></div>

        {/* New Record Banner */}
        {isNewRecord && (
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 font-bold text-sm retro-pulse">
            🏆 NEW RECORD! 🏆
          </div>
        )}

        {/* Game Over Title */}
        <div className="mb-8">
          <div className="relative">
            <h1
              id="game-over-title"
              className="game-over-title text-6xl md:text-7xl font-extrabold mb-4 tracking-widest retro-pulse drop-shadow-2xl"
              style={{ textShadow: '0 0 20px rgba(239, 68, 68, 0.5)' }}
            >
              GAME OVER
            </h1>
            <div className="absolute inset-0 text-6xl md:text-7xl font-extrabold text-red-900/20 blur-sm -z-10 tracking-widest">
              GAME OVER
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 mb-4">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-red-500 to-red-400 rounded-full animate-pulse"></div>
            <div className="text-red-400 text-2xl animate-bounce">💀</div>
            <div className="w-16 h-1 bg-gradient-to-l from-transparent via-red-500 to-red-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* Score Message */}
        <div className="mb-6">
          <p className="text-xl font-bold text-green-400 mb-4 pixel-border inline-block px-4 py-2">
            {getScoreMessage(score)}
          </p>
        </div>

        {/* Score Display */}
        <div className="mb-8">
          <div className="retro-stats-card rounded-lg p-4 mb-6">
            <p className="text-cyan-300 text-lg mb-2 font-semibold">FINAL SCORE</p>
            <p
              id="final-score"
              className={`game-over-score text-6xl md:text-7xl font-black tabular-nums mb-2 retro-pulse`}
            >
              {score.toLocaleString()}
            </p>
            {bestScore > 0 && !isNewRecord && (
              <p className="text-slate-300 text-base">
                Previous Best:{' '}
                <span className="text-yellow-300 font-bold">{bestScore.toLocaleString()}</span>
              </p>
            )}
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="retro-stats-card rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-slate-400 text-xs mb-1 uppercase">Level Reached</p>
            <p className="text-cyan-400 font-black text-2xl">{level}</p>
          </div>
          <div className="retro-stats-card rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-slate-400 text-xs mb-1 uppercase">Time Played</p>
            <p className="text-cyan-400 font-black text-2xl">{formatTime(timeElapsed)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-6">
          <button
            ref={restartButtonRef}
            onClick={onRestart}
            className="pixel-button w-full py-4 text-xl mb-6"
            aria-label="Start a new game"
            autoFocus
          >
            PLAY AGAIN
          </button>

          <div className="flex items-center justify-center gap-4 text-slate-300 text-sm">
            <div className="flex items-center gap-2">
              <span>Press</span>
              <kbd className="bg-slate-800 px-2 py-1 text-cyan-300 border border-cyan-300 font-mono">
                ENTER
              </kbd>
              <span>or</span>
              <kbd className="bg-slate-800 px-2 py-1 text-cyan-300 border border-cyan-300 font-mono">
                SPACE
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
})

GameOverScreen.displayName = 'GameOverScreen'
