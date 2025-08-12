import React from 'react'
import type { GameMode } from '../../game/types'
import ArcadeButton from '../ui/ArcadeButton'
import { ThemeToggle } from '../ThemeToggle'

interface LeftSidebarProps {
  selectedMode: GameMode
  selectedLevel: number
  onBackToLevelSelector: () => void
  onRestart: () => void
}

const GameInstructions = React.memo(() => (
  <div className="text-center text-gray-300 font-mono space-y-3">
    <div className="space-y-2">
      <p>
        <kbd className="px-3 py-2 bg-gray-700/80 rounded-md text-white border border-gray-500 text-sm font-bold shadow-md">
          ←↑→↓
        </kbd>
        <span className="block text-sm mt-2 text-gray-300 font-medium">Déplacer</span>
      </p>
      <p>
        <kbd className="px-3 py-2 bg-gray-700/80 rounded-md text-white border border-gray-500 text-sm font-bold shadow-md">
          R
        </kbd>
        <span className="block text-sm mt-2 text-gray-300 font-medium">Recommencer</span>
      </p>
    </div>
  </div>
))

GameInstructions.displayName = 'GameInstructions'

const LeftSidebar: React.FC<LeftSidebarProps> = React.memo(
  ({ selectedMode, selectedLevel, onBackToLevelSelector, onRestart }) => {
    return (
      <div className="flex flex-col justify-center gap-8 w-full h-full py-4">
        {/* Titre Principal */}
        <div className="text-center">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.25)] font-mono tracking-wider mb-4">
            PAC-MAN
          </h1>
          <div className="text-base font-mono bg-gray-800/60 rounded-lg px-4 py-3 border border-gray-600/80 shadow-lg">
            <div className="text-yellow-400 font-bold text-lg">{selectedMode.toUpperCase()}</div>
            <div className="text-gray-200 text-sm font-medium">NIVEAU {selectedLevel}</div>
          </div>
        </div>

        {/* Séparateur visuel */}
        <div className="border-t border-gray-700/50 mx-4"></div>

        {/* Instructions */}
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-lg p-5 border border-gray-600/80 shadow-lg">
          <div className="text-center text-gray-300 text-sm font-mono mb-3 uppercase tracking-wider font-bold">
            🎮 CONTRÔLES
          </div>
          <GameInstructions />
        </div>

        {/* Séparateur visuel */}
        <div className="border-t border-gray-700/50 mx-4"></div>

        {/* Contrôles */}
        <div className="space-y-4">
          <div className="text-center text-gray-300 text-sm font-mono mb-4 uppercase tracking-wider font-bold">
            ⚡ ACTIONS
          </div>
          <div className="flex flex-col gap-3">
            <ArcadeButton
              variant="secondary"
              size="sm"
              onClick={onRestart}
              glow
              className="w-full justify-center text-base font-bold"
            >
              🔄 RESTART
            </ArcadeButton>
            <ArcadeButton
              variant="danger"
              size="sm"
              onClick={onBackToLevelSelector}
              glow
              className="w-full justify-center text-base font-bold"
            >
              ← QUITTER
            </ArcadeButton>
          </div>
        </div>

        {/* Séparateur visuel */}
        <div className="border-t border-gray-700/50 mx-4"></div>

        {/* Theme Toggle */}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    )
  },
)

LeftSidebar.displayName = 'LeftSidebar'

export default LeftSidebar
