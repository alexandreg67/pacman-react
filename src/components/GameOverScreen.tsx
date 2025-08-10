import React from 'react'

type Props = {
  score: number
  onRestart: () => void
}

export const GameOverScreen = React.memo(({ score, onRestart }: Props) => {
  return (
    <div
      className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      role="dialog"
      aria-labelledby="game-over-title"
      aria-describedby="final-score"
    >
      <div className="bg-gray-900 border-4 border-blue-500 rounded-2xl p-8 text-center max-w-md mx-4 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="mb-6">
          <h1 id="game-over-title" className="text-4xl font-bold text-red-500 mb-2 tracking-wider">
            GAME OVER
          </h1>
          <div className="w-24 h-1 bg-red-500 mx-auto rounded"></div>
        </div>

        <div className="mb-8">
          <p className="text-gray-300 text-lg mb-2">Final Score</p>
          <p id="final-score" className="text-5xl font-bold text-yellow-400 tabular-nums">
            {score.toLocaleString()}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={onRestart}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
            aria-label="Start a new game"
            autoFocus
          >
            <span className="text-xl">🎮 Play Again</span>
          </button>

          <div className="text-gray-400 text-sm">
            <p>
              Press <kbd className="bg-gray-700 px-2 py-1 rounded text-xs">Enter</kbd> to restart
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

GameOverScreen.displayName = 'GameOverScreen'
