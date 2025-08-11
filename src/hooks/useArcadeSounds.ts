import { useCallback, useRef } from 'react'

// Types de sons disponibles
export type SoundType =
  | 'beep'
  | 'select'
  | 'success'
  | 'error'
  | 'powerup'
  | 'complete'
  | 'star'
  | 'button'

interface AudioConfig {
  frequency: number
  duration: number
  type: OscillatorType
  volume?: number
}

// Configuration des sons rétro
const SOUND_CONFIGS: Record<SoundType, AudioConfig> = {
  beep: { frequency: 800, duration: 100, type: 'square', volume: 0.3 },
  select: { frequency: 600, duration: 150, type: 'square', volume: 0.4 },
  success: { frequency: 1200, duration: 200, type: 'sine', volume: 0.5 },
  error: { frequency: 200, duration: 300, type: 'sawtooth', volume: 0.4 },
  powerup: { frequency: 1000, duration: 250, type: 'sine', volume: 0.6 },
  complete: { frequency: 1500, duration: 300, type: 'sine', volume: 0.7 },
  star: { frequency: 2000, duration: 150, type: 'sine', volume: 0.5 },
  button: { frequency: 900, duration: 80, type: 'square', volume: 0.3 },
}

export function useArcadeSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const enabledRef = useRef(true)

  // Initialiser le contexte audio si nécessaire
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioContextRef.current = new AudioContextClass()
      } catch {
        console.warn('Web Audio API non supporté')
        return null
      }
    }
    return audioContextRef.current
  }, [])

  // Jouer un son simple
  const playSound = useCallback(
    (soundType: SoundType) => {
      if (!enabledRef.current) return

      const audioContext = getAudioContext()
      if (!audioContext) return

      try {
        const config = SOUND_CONFIGS[soundType]

        // Créer les nœuds audio
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        // Configuration
        oscillator.type = config.type
        oscillator.frequency.setValueAtTime(config.frequency, audioContext.currentTime)

        // Volume avec fade out
        gainNode.gain.setValueAtTime(config.volume || 0.5, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          audioContext.currentTime + config.duration / 1000,
        )

        // Connexions
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Lecture
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + config.duration / 1000)
      } catch {
        console.warn('Erreur lors de la lecture du son')
      }
    },
    [getAudioContext],
  )

  // Jouer une mélodie simple (pour les étoiles par exemple)
  const playMelody = useCallback(
    (notes: { frequency: number; duration: number }[]) => {
      if (!enabledRef.current) return

      const audioContext = getAudioContext()
      if (!audioContext) return

      let currentTime = audioContext.currentTime

      notes.forEach((note) => {
        try {
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.type = 'sine'
          oscillator.frequency.setValueAtTime(note.frequency, currentTime)

          gainNode.gain.setValueAtTime(0.4, currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + note.duration / 1000)

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.start(currentTime)
          oscillator.stop(currentTime + note.duration / 1000)

          currentTime += note.duration / 1000 + 0.05 // Petit gap entre les notes
        } catch {
          console.warn('Erreur lors de la lecture de la mélodie')
        }
      })
    },
    [getAudioContext],
  )

  // Mélodie de victoire (3 étoiles)
  const playVictoryMelody = useCallback(() => {
    playMelody([
      { frequency: 523, duration: 200 }, // Do
      { frequency: 659, duration: 200 }, // Mi
      { frequency: 784, duration: 200 }, // Sol
      { frequency: 1047, duration: 400 }, // Do aigu
    ])
  }, [playMelody])

  // Mélodie de succès (niveau terminé)
  const playSuccessMelody = useCallback(() => {
    playMelody([
      { frequency: 659, duration: 150 }, // Mi
      { frequency: 698, duration: 150 }, // Fa#
      { frequency: 784, duration: 300 }, // Sol
    ])
  }, [playMelody])

  // Activer/désactiver les sons
  const toggleSounds = useCallback(() => {
    enabledRef.current = !enabledRef.current
    return enabledRef.current
  }, [])

  const setSoundsEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled
  }, [])

  return {
    playSound,
    playMelody,
    playVictoryMelody,
    playSuccessMelody,
    toggleSounds,
    setSoundsEnabled,
    isEnabled: () => enabledRef.current,
  }
}

export default useArcadeSounds
