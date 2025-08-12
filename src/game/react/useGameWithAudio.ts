import { useEffect, useRef } from 'react'
import type { GameState } from '../types'
import { useGameAudio } from '../../audio/hooks/useAudio'

interface GameAudioEventHandlers {
  onPelletEaten?: () => void
  onPowerPelletEaten?: () => void
  onGhostEaten?: () => void
  onFruitEaten?: () => void
  onPacmanDeath?: () => void
  onExtraLife?: () => void
  onGameStart?: () => void
  onLevelComplete?: () => void
  onGhostsFrightened?: () => void
}

export function useGameAudioIntegration(
  gameState: GameState,
  handlers: GameAudioEventHandlers = {},
) {
  const audio = useGameAudio()
  const prevStateRef = useRef<GameState | null>(null)
  const intermissionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const prevState = prevStateRef.current
    if (!prevState || !audio.isInitialized) {
      prevStateRef.current = gameState
      return
    }

    // Game start detection
    if (!prevState.started && gameState.started) {
      audio.playStartMusic()
      handlers.onGameStart?.()
    }

    // Handle audio events from game state
    if (gameState.audioEvent) {
      switch (gameState.audioEvent) {
        case 'pellet':
          audio.playChomp()
          handlers.onPelletEaten?.()
          break
        case 'power-pellet':
          audio.playChomp()
          handlers.onPowerPelletEaten?.()
          break
        case 'fruit':
          audio.playEatingFruit()
          handlers.onFruitEaten?.()
          break
      }
    }

    // Detect score changes for other events (ghosts, extra life)
    const scoreIncrease = gameState.score - prevState.score

    // Ghost eaten (200, 400, 800, 1600 points in sequence)
    if ([200, 400, 800, 1600].includes(scoreIncrease)) {
      audio.playEatingGhost()
      handlers.onGhostEaten?.()
    }

    // Death detection (lives decreased)
    if (gameState.lives < prevState.lives) {
      audio.playDeath()
      handlers.onPacmanDeath?.()
    }

    // Extra life detection (lives increased while not at death)
    if (gameState.lives > prevState.lives && prevState.deathAnimationTicks === 0) {
      audio.playExtend()
      handlers.onExtraLife?.()
    }

    // Ghosts become frightened (power pellet effect)
    if (gameState.frightenedTicks > 0 && prevState.frightenedTicks === 0) {
      audio.playGhostTurnBlue()
      handlers.onGhostsFrightened?.()
    }

    // Level progression
    if (gameState.level > prevState.level) {
      // Clear any existing timeout first
      if (intermissionTimeoutRef.current) {
        clearTimeout(intermissionTimeoutRef.current)
      }

      // Stop all sounds and play intermission
      audio.playIntermissionMusic()
      handlers.onLevelComplete?.()

      // Auto-stop intermission after a delay
      intermissionTimeoutRef.current = setTimeout(() => {
        audio.stopIntermissionMusic()
        intermissionTimeoutRef.current = null
      }, 3000)
    }

    // Game over - stop all sounds
    if (gameState.gameStatus === 'game-over' && prevState.gameStatus !== 'game-over') {
      audio.stopIntermissionMusic()
      // Death sound is already played when lives decrease
    }

    // Update previous state
    prevStateRef.current = gameState
  }, [gameState, audio, handlers])

  // Handle ghost movement sounds based on ghost states
  useEffect(() => {
    if (!audio.isInitialized) return

    // Don't play ghost sounds if game hasn't started or isn't playing
    if (!gameState.started || gameState.gameStatus !== 'playing') {
      audio.stopGhostNormalMove()
      audio.stopGhostReturnHome()
      return
    }

    const hasEyesOnlyGhosts = gameState.ghosts.some((ghost) => ghost.eyesOnly)
    const hasFrightenedGhosts = gameState.frightenedTicks > 0
    const hasNormalGhosts = gameState.ghosts.some(
      (ghost) => !ghost.eyesOnly && gameState.frightenedTicks === 0,
    )

    // Manage ghost movement sounds only when game is active
    if (hasEyesOnlyGhosts && !audio.isPlaying('ghost-return-to-home')) {
      audio.stopGhostNormalMove()
      audio.playGhostReturnHome()
    } else if (hasFrightenedGhosts && !hasEyesOnlyGhosts) {
      audio.stopGhostNormalMove()
      audio.stopGhostReturnHome()
      // Frightened ghosts move silently in original Pacman
    } else if (hasNormalGhosts && !audio.isPlaying('ghost-normal-move')) {
      audio.stopGhostReturnHome()
      audio.playGhostNormalMove()
    } else if (!hasNormalGhosts && !hasEyesOnlyGhosts && !hasFrightenedGhosts) {
      // Stop all ghost sounds if no ghosts in active states
      audio.stopGhostNormalMove()
      audio.stopGhostReturnHome()
    }
  }, [gameState.ghosts, gameState.frightenedTicks, gameState.gameStatus, gameState.started, audio])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts
      if (intermissionTimeoutRef.current) {
        clearTimeout(intermissionTimeoutRef.current)
        intermissionTimeoutRef.current = null
      }

      if (audio.isInitialized) {
        audio.stopIntermissionMusic()
        audio.stopGhostNormalMove()
        audio.stopGhostReturnHome()
      }
    }
  }, [audio])

  return {
    ...audio,
    // Additional convenience methods could be added here
  }
}
