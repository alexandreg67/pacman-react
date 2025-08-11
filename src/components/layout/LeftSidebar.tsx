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
  <div className="text-center text-gray-300 font-mono text-sm space-y-2">
    <p className="text-gray-400 text-xs mb-3">CONTRÔLES</p>
    <div className="space-y-1">
      <p>
        <kbd className="px-2 py-1 bg-gray-800 rounded text-white border border-gray-600 text-xs">
          ←↑→↓
        </kbd>
        <span className="block text-xs mt-1 text-gray-500">Déplacer</span>
      </p>
      <p>
        <kbd className="px-2 py-1 bg-gray-800 rounded text-white border border-gray-600 text-xs">
          R
        </kbd>
        <span className="block text-xs mt-1 text-gray-500">Recommencer</span>
      </p>
    </div>
  </div>
))

GameInstructions.displayName = 'GameInstructions'

const LeftSidebar: React.FC<LeftSidebarProps> = React.memo(
  ({ selectedMode, selectedLevel, onBackToLevelSelector, onRestart }) => {
    return (
      <div className="flex flex-col gap-6 w-full h-full">
        {/* Titre Principal */}
        <div className="text-center">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-yellow-300 drop-shadow-[0_2px_8px_rgba(234,179,8,0.25)] font-mono tracking-wider mb-2">
            PAC-MAN
          </h1>
          <div className="text-sm text-gray-400 font-mono bg-gray-800/50 rounded-lg px-3 py-2 border border-gray-700">
            <div className="text-yellow-400 font-bold">{selectedMode.toUpperCase()}</div>
            <div className="text-gray-300">NIVEAU {selectedLevel}</div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
          <GameInstructions />
        </div>

        {/* Contrôles */}
        <div className="space-y-3">
          <div className="text-center text-gray-400 text-xs font-mono mb-3">ACTIONS</div>
          <div className="flex flex-col gap-2">
            <ArcadeButton
              variant="secondary"
              size="sm"
              onClick={onRestart}
              glow
              className="w-full justify-center"
            >
              🔄 RESTART
            </ArcadeButton>
            <ArcadeButton
              variant="danger"
              size="sm"
              onClick={onBackToLevelSelector}
              glow
              className="w-full justify-center"
            >
              ← QUITTER
            </ArcadeButton>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="flex justify-center mt-auto">
          <ThemeToggle />
        </div>
      </div>
    )
  },
)

LeftSidebar.displayName = 'LeftSidebar'

export default LeftSidebar
