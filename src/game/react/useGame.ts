import { useCallback, useEffect, useRef, useState } from 'react'
import type { Direction, GameState } from '../types'
import { initialState, step } from '../state'
import { getPacmanStepMs } from '../logic/ghostSpeed'

// Vitesse fidèle à l'arcade
function getPacmanSpeedMs(state: GameState): number {
  return getPacmanStepMs(state)
}

const MAX_DELTA = 100 // Limite pour éviter les gros sauts

interface GameTiming {
  lastTime: number
  accumulator: number
  frameCount: number
  fps: number
  lastFpsUpdate: number
}

export function useGame() {
  const [state, setState] = useState<GameState>(() => initialState())
  const animationFrameRef = useRef<number>(0)
  const stateRef = useRef<GameState>(state) // Ref pour accès au state sans dependency
  const timingRef = useRef<GameTiming>({
    lastTime: 0,
    accumulator: 0,
    frameCount: 0,
    fps: 0,
    lastFpsUpdate: 0,
  })

  // Flag pour éviter les updates pendant les transitions
  const isRunningRef = useRef(true)

  // Synchroniser le state ref
  useEffect(() => {
    stateRef.current = state
  }, [state])

  // Game loop optimisé avec requestAnimationFrame
  const gameLoop = useCallback(
    (currentTime: number) => {
      if (!isRunningRef.current) return

      const timing = timingRef.current

      // Initialiser le timing si c'est le premier frame
      if (timing.lastTime === 0) {
        timing.lastTime = currentTime
      }

      // Calculer le delta time avec limitation
      const deltaTime = Math.min(currentTime - timing.lastTime, MAX_DELTA)
      timing.lastTime = currentTime
      timing.accumulator += deltaTime

      // Vitesse variable selon le niveau et la position
      const pacmanSpeedMs = getPacmanSpeedMs(stateRef.current)

      let stepsThisFrame = 0
      while (timing.accumulator >= pacmanSpeedMs && stepsThisFrame < 3) {
        setState((prevState) => step(prevState))
        timing.accumulator -= pacmanSpeedMs
        stepsThisFrame++
      }

      // Calcul du FPS pour debug (optionnel)
      timing.frameCount++
      if (currentTime - timing.lastFpsUpdate >= 1000) {
        timing.fps = timing.frameCount
        timing.frameCount = 0
        timing.lastFpsUpdate = currentTime

        // FPS calculé et disponible via le retour du hook en développement
      }

      // Programmer le prochain frame
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    },
    [], // Pas de dépendances - utilise stateRef pour éviter les re-créations
  )

  // Démarrer le game loop
  useEffect(() => {
    isRunningRef.current = true
    timingRef.current.lastTime = 0
    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      isRunningRef.current = false
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameLoop])

  // Buffer input avec debouncing pour éviter les inputs multiples
  const lastInputRef = useRef<{ direction: Direction; time: number } | null>(null)
  const INPUT_DEBOUNCE = 50 // 50ms de debounce

  const stepInput = useCallback((dir: Direction) => {
    const now = Date.now()

    // Debouncing des inputs
    if (
      lastInputRef.current &&
      lastInputRef.current.direction === dir &&
      now - lastInputRef.current.time < INPUT_DEBOUNCE
    ) {
      return
    }

    lastInputRef.current = { direction: dir, time: now }

    setState((prev) => step(prev, dir))
  }, [])

  // Reset optimisé avec nettoyage du timing
  const reset = useCallback(() => {
    // Réinitialiser le timing
    timingRef.current = {
      lastTime: 0,
      accumulator: 0,
      frameCount: 0,
      fps: 0,
      lastFpsUpdate: 0,
    }

    // Réinitialiser l'état du jeu
    setState(initialState())
  }, [])

  // Pause/Resume pour optimiser quand le jeu n'est pas visible
  const pause = useCallback(() => {
    isRunningRef.current = false
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const resume = useCallback(() => {
    if (!isRunningRef.current) {
      isRunningRef.current = true
      timingRef.current.lastTime = 0 // Reset timing pour éviter les gros deltas
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameLoop])

  // Gestion automatique pause/resume basée sur la visibilité
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pause()
      } else {
        resume()
      }
    }

    const handleFocus = () => resume()
    const handleBlur = () => pause()

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [pause, resume])

  return {
    state,
    stepInput,
    reset,
    pause,
    resume,
    // Exposer les métriques de performance en développement
    ...(process.env.NODE_ENV === 'development' && {
      fps: timingRef.current.fps,
      timing: timingRef.current,
    }),
  }
}
