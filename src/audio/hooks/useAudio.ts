import { useCallback, useEffect, useRef, useState } from 'react'
import { audioManager } from '../manager'
import type { SoundId, AudioSettings } from '../sounds'

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>(audioManager.getSettings())
  const [isInitialized, setIsInitialized] = useState(false)
  const initializationRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    const initialize = async () => {
      if (!initializationRef.current) {
        initializationRef.current = audioManager.initialize()
      }

      try {
        await initializationRef.current
        setIsInitialized(true)
        setSettings(audioManager.getSettings())
      } catch (error) {
        console.warn('Audio initialization failed in useAudio:', error)
      }
    }

    initialize()
  }, [])

  const play = useCallback(
    async (
      soundId: SoundId,
      options?: { volume?: number; loop?: boolean; stopPrevious?: boolean },
    ) => {
      if (!isInitialized) return
      await audioManager.play(soundId, options)
    },
    [isInitialized],
  )

  const stop = useCallback((soundId: SoundId) => {
    audioManager.stop(soundId)
  }, [])

  const stopAll = useCallback(() => {
    audioManager.stopAll()
  }, [])

  const pause = useCallback((soundId: SoundId) => {
    audioManager.pause(soundId)
  }, [])

  const pauseAll = useCallback(() => {
    audioManager.pauseAll()
  }, [])

  const resume = useCallback((soundId: SoundId) => {
    audioManager.resume(soundId)
  }, [])

  const resumeAll = useCallback(() => {
    audioManager.resumeAll()
  }, [])

  const isPlaying = useCallback((soundId: SoundId) => {
    return audioManager.isPlaying(soundId)
  }, [])

  const updateSettings = useCallback((newSettings: Partial<AudioSettings>) => {
    audioManager.setSettings(newSettings)
    setSettings(audioManager.getSettings())
  }, [])

  const toggleMute = useCallback(() => {
    updateSettings({ muted: !settings.muted })
  }, [settings.muted, updateSettings])

  const setMasterVolume = useCallback(
    (volume: number) => {
      updateSettings({ masterVolume: Math.max(0, Math.min(1, volume)) })
    },
    [updateSettings],
  )

  const setSfxVolume = useCallback(
    (volume: number) => {
      updateSettings({ sfxVolume: Math.max(0, Math.min(1, volume)) })
    },
    [updateSettings],
  )

  const setMusicVolume = useCallback(
    (volume: number) => {
      updateSettings({ musicVolume: Math.max(0, Math.min(1, volume)) })
    },
    [updateSettings],
  )

  return {
    // Audio controls
    play,
    stop,
    stopAll,
    pause,
    pauseAll,
    resume,
    resumeAll,
    isPlaying,

    // Settings
    settings,
    updateSettings,
    toggleMute,
    setMasterVolume,
    setSfxVolume,
    setMusicVolume,

    // State
    isInitialized,
  }
}

export function useGameAudio() {
  const { play, stop, isPlaying, isInitialized } = useAudio()

  const playChomp = useCallback(() => {
    play('chomp', { stopPrevious: true, loop: false })
  }, [play])

  const playDeath = useCallback(() => {
    play('death')
  }, [play])

  const playEatingGhost = useCallback(() => {
    play('eating-ghost')
  }, [play])

  const playEatingFruit = useCallback(() => {
    play('eating-fruit')
  }, [play])

  const playExtend = useCallback(() => {
    play('extend')
  }, [play])

  const playGhostTurnBlue = useCallback(() => {
    play('ghost-turn-to-blue')
  }, [play])

  const playStartMusic = useCallback(() => {
    play('start-music')
  }, [play])

  const playIntermissionMusic = useCallback(() => {
    play('coffee-break-music', { loop: true })
  }, [play])

  const stopIntermissionMusic = useCallback(() => {
    stop('coffee-break-music')
  }, [stop])

  const playGhostMove = useCallback(
    (variant: 1 | 2 | 3 | 4 = 1) => {
      const soundId = `ghost-spurt-move-${variant}` as const
      play(soundId, { loop: true })
    },
    [play],
  )

  const stopGhostMove = useCallback(
    (variant: 1 | 2 | 3 | 4 = 1) => {
      const soundId = `ghost-spurt-move-${variant}` as const
      stop(soundId)
    },
    [stop],
  )

  const playGhostNormalMove = useCallback(() => {
    play('ghost-normal-move', { loop: true })
  }, [play])

  const stopGhostNormalMove = useCallback(() => {
    stop('ghost-normal-move')
  }, [stop])

  const playGhostReturnHome = useCallback(() => {
    play('ghost-return-to-home', { loop: true })
  }, [play])

  const stopGhostReturnHome = useCallback(() => {
    stop('ghost-return-to-home')
  }, [stop])

  return {
    // Game-specific sound effects
    playChomp,
    playDeath,
    playEatingGhost,
    playEatingFruit,
    playExtend,
    playGhostTurnBlue,
    playStartMusic,
    playIntermissionMusic,
    stopIntermissionMusic,
    playGhostMove,
    stopGhostMove,
    playGhostNormalMove,
    stopGhostNormalMove,
    playGhostReturnHome,
    stopGhostReturnHome,

    // Utilities
    isPlaying,
    isInitialized,
  }
}
