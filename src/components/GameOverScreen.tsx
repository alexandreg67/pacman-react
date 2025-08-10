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
      className="absolute inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="game-over-title"
      aria-describedby="final-score"
    >
      <div
        className={`bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 ${isNewRecord ? 'border-yellow-400 shadow-yellow-400/20' : 'border-blue-500'} rounded-2xl p-8 text-center max-w-lg mx-4 shadow-2xl transition-all duration-500 ${showAnimation ? 'animate-in zoom-in-95 slide-in-from-bottom-4' : 'scale-95 opacity-0'}`}
      >
        {/* New Record Banner */}
        {isNewRecord && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-6 py-2 rounded-full font-bold text-sm animate-bounce shadow-lg">
            🏆 NEW RECORD! 🏆
          </div>
        )}

        {/* Game Over Title */}
        <div className="mb-6">
          <h1
            id="game-over-title"
            className="text-4xl md:text-5xl font-bold text-red-500 mb-3 tracking-wider animate-pulse"
          >
            GAME OVER
          </h1>
          <div className="w-32 h-1 bg-gradient-to-r from-red-500 to-red-400 mx-auto rounded-full"></div>
        </div>

        {/* Score Message */}
        <div className="mb-6">
          <p className="text-xl font-semibold text-green-400 mb-2">{getScoreMessage(score)}</p>
        </div>

        {/* Score Display */}
        <div className="mb-8">
          <p className="text-gray-300 text-lg mb-2">Final Score</p>
          <p
            id="final-score"
            className={`text-5xl md:text-6xl font-bold tabular-nums mb-4 ${isNewRecord ? 'text-yellow-400 animate-pulse' : 'text-yellow-400'}`}
          >
            {score.toLocaleString()}
          </p>

          {bestScore > 0 && !isNewRecord && (
            <p className="text-gray-400 text-sm">
              Best: <span className="text-yellow-300 font-bold">{bestScore.toLocaleString()}</span>
            </p>
          )}
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 mb-1">Level</p>
            <p className="text-blue-400 font-bold text-lg">{level}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-gray-400 mb-1">Time</p>
            <p className="text-blue-400 font-bold text-lg">{formatTime(timeElapsed)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-blue-500/25 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg group"
            aria-label="Start a new game"
            autoFocus
          >
            <span className="text-xl flex items-center justify-center gap-2">
              🎮 <span className="group-hover:animate-pulse">Play Again</span>
            </span>
          </button>

          <div className="text-gray-400 text-sm flex items-center justify-center gap-4">
            <p className="flex items-center gap-2">
              Press{' '}
              <kbd className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-600">
                Enter
              </kbd>{' '}
              or{' '}
              <kbd className="bg-gray-700 px-2 py-1 rounded text-xs border border-gray-600">
                Space
              </kbd>{' '}
              to restart
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

GameOverScreen.displayName = 'GameOverScreen'
