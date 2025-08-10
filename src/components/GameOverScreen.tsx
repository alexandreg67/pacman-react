import React, { useEffect, useCallback, useState } from 'react'

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

  const formatTime = (seconds?: number): string => {
    if (!seconds) return 'N/A'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-labelledby="game-over-title"
      aria-describedby="final-score"
    >
      <div
        className={`
          relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900
          border-4 ${isNewRecord ? 'border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border-cyan-400 shadow-lg shadow-cyan-400/30'}
          rounded-3xl p-10 text-center w-full max-w-2xl
          shadow-2xl transition-all duration-700 ease-out
          ${
            showAnimation
              ? 'scale-100 opacity-100 transform translate-y-0'
              : 'scale-75 opacity-0 transform translate-y-8'
          }
          before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-600/10 before:via-purple-600/10 before:to-pink-600/10 before:rounded-3xl before:-z-10
        `}
      >
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
            onClick={onRestart}
            className="relative w-full bg-gradient-to-r from-green-500 via-green-600 to-green-700 hover:from-green-400 hover:via-green-500 hover:to-green-600 text-white font-black py-5 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/30 focus:outline-none focus:ring-4 focus:ring-green-300 shadow-xl group overflow-hidden"
            aria-label="Start a new game"
            autoFocus
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-green-600/20 animate-pulse"></div>
            <span className="relative z-10 text-2xl flex items-center justify-center gap-3 tracking-wide">
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
