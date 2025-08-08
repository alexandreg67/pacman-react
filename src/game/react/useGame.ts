import { useCallback, useEffect, useRef, useState } from 'react'
import type { Direction, GameState } from '../types'
import { initialState, step } from '../state'

// Configuration optimisée du game loop
const TARGET_FPS = 16 // ~16 FPS pour une meilleure fluidité
const FRAME_TIME = 1000 / TARGET_FPS // 62.5ms par frame
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
  const timingRef = useRef<GameTiming>({
    lastTime: 0,
    accumulator: 0,
    frameCount: 0,
    fps: 0,
    lastFpsUpdate: 0,
  })

  // Flag pour éviter les updates pendant les transitions
  const isRunningRef = useRef(true)

  // Game loop optimisé avec requestAnimationFrame
  const gameLoop = useCallback((currentTime: number) => {
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

    // Mise à jour de la logique de jeu à intervalles fixes
    let stepsThisFrame = 0
    while (timing.accumulator >= FRAME_TIME && stepsThisFrame < 3) {
      setState((prevState) => step(prevState))
      timing.accumulator -= FRAME_TIME
      stepsThisFrame++
    }

    // Calcul du FPS pour debug (optionnel)
    timing.frameCount++
    if (currentTime - timing.lastFpsUpdate >= 1000) {
      timing.fps = timing.frameCount
      timing.frameCount = 0
      timing.lastFpsUpdate = currentTime

      // Debug FPS en développement
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.debug(`Game FPS: ${timing.fps}`)
      }
    }

    // Programmer le prochain frame
    animationFrameRef.current = requestAnimationFrame(gameLoop)
  }, [])

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
