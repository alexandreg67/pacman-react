import React, { useEffect, useCallback, useState, useRef } from 'react'

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
  const dialogRef = useRef<HTMLDivElement>(null)
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
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      ref={dialogRef}
      className="w-full h-full flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      aria-describedby="final-score"
    >
      <div
        className={`
          relative bg-black bg-opacity-90
          border-4 ${isNewRecord ? 'border-yellow-400 animate-glow-pulse' : 'border-cyan-400 animate-glow-pulse'}
          rounded-3xl p-8 md:p-10 text-center w-full max-w-2xl
          shadow-2xl transition-all duration-700 ease-out transform
          ${showAnimation ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
        style={{
          color: isNewRecord ? '#fbbf24' : '#22d3ee',
        }}
      >
        {/* Decorative corner elements */}
        <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-yellow-400 rounded-tl-lg"></div>
        <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-yellow-400 rounded-tr-lg"></div>
        <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-yellow-400 rounded-bl-lg"></div>
        <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-yellow-400 rounded-br-lg"></div>

        {/* Animated background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-3xl -z-10">
          <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-20"></div>
          <div className="absolute top-3/4 right-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-20 animation-delay-1000"></div>
          <div className="absolute top-1/2 left-3/4 w-4 h-4 bg-pink-400 rounded-full animate-ping opacity-10"></div>
        </div>
        {/* New Record Banner */}
        {isNewRecord && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full font-bold text-sm animate-bounce shadow-lg">
            🏆 NEW RECORD! 🏆
          </div>
        )}

        {/* Game Over Title */}
        <div className="mb-8">
          <div className="relative">
            <h1
              id="game-over-title"
              className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent mb-4 tracking-widest animate-pulse drop-shadow-2xl"
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
        <div className="mb-8">
          <p className="text-2xl font-bold text-green-400 mb-4 tracking-wide animate-pulse">
            {getScoreMessage(score)}
          </p>
        </div>

        {/* Score Display */}
        <div className="mb-10">
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-6 border-2 border-slate-600 shadow-inner">
            <p className="text-cyan-300 text-xl mb-3 font-semibold tracking-wide">FINAL SCORE</p>
            <div className="relative">
              <p
                id="final-score"
                className={`text-7xl md:text-8xl font-black tabular-nums mb-4 ${
                  isNewRecord
                    ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent animate-pulse'
                    : 'bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent'
                }`}
                style={{
                  textShadow: isNewRecord
                    ? '0 0 30px rgba(251, 191, 36, 0.6)'
                    : '0 0 30px rgba(34, 211, 238, 0.4)',
                }}
              >
                {score.toLocaleString()}
              </p>
              {isNewRecord && (
                <div className="absolute inset-0 text-7xl md:text-8xl font-black tabular-nums text-yellow-600/20 blur-sm animate-pulse">
                  {score.toLocaleString()}
                </div>
              )}
            </div>

            {bestScore > 0 && !isNewRecord && (
              <p className="text-slate-300 text-lg">
                Previous Best:{' '}
                <span className="text-yellow-300 font-bold text-xl">
                  {bestScore.toLocaleString()}
                </span>
              </p>
            )}
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-600 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <span className="text-3xl">🏆</span>
            </div>
            <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">Level Reached</p>
            <p className="text-cyan-400 font-black text-3xl">{level}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 border border-slate-600 shadow-lg transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-center mb-2">
              <span className="text-3xl">⏱️</span>
            </div>
            <p className="text-slate-400 text-sm mb-2 uppercase tracking-wider">Time Played</p>
            <p className="text-cyan-400 font-black text-3xl">{formatTime(timeElapsed)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-6">
          <button
            ref={restartButtonRef}
            onClick={onRestart}
            className="relative w-full bg-gradient-to-r from-yellow-500 via-pink-500 to-blue-600 hover:from-yellow-400 hover:via-pink-400 hover:to-blue-500 text-white font-black py-5 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_32px_8px_rgba(59,130,246,0.5)] focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-black shadow-xl group overflow-hidden border-2 border-white/20"
            aria-label="Start a new game"
            autoFocus
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-pink-500/20 to-blue-600/20 animate-pulse"></div>
            <div className="absolute inset-0 bg-[length:200%_100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <span className="relative z-10 text-2xl flex items-center justify-center gap-3 tracking-wide font-bold">
              🎮 <span className="group-hover:animate-bounce">PLAY AGAIN</span> 🎮
            </span>
          </button>

          <div className="flex items-center justify-center gap-6 text-slate-400 text-lg">
            <div className="flex items-center gap-2">
              <span>Press</span>
              <kbd className="bg-slate-700 px-3 py-2 rounded-lg text-cyan-300 border-2 border-slate-600 shadow-lg font-bold">
                ENTER
              </kbd>
              <span>or</span>
              <kbd className="bg-slate-700 px-3 py-2 rounded-lg text-cyan-300 border-2 border-slate-600 shadow-lg font-bold">
                SPACE
              </kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

GameOverScreen.displayName = 'GameOverScreen'
