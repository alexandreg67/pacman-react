import { useCallback, useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  renderCount: number
  memoryUsage?: number
  isLaggy: boolean
  averageFPS: number
}

interface PerformanceConfig {
  trackFPS?: boolean
  trackMemory?: boolean
  trackRenders?: boolean
  fpsTarget?: number
  lagThreshold?: number
  updateInterval?: number
}

const DEFAULT_CONFIG: Required<PerformanceConfig> = {
  trackFPS: true,
  trackMemory: true,
  trackRenders: true,
  fpsTarget: 16,
  lagThreshold: 10,
  updateInterval: 1000,
}

export function usePerformance(config: PerformanceConfig = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    frameTime: 0,
    renderCount: 0,
    isLaggy: false,
    averageFPS: 0,
  })

  // Refs pour le tracking
  const frameCountRef = useRef(0)
  const lastTimeRef = useRef(0)
  const renderCountRef = useRef(0)
  const fpsHistoryRef = useRef<number[]>([])
  const animationFrameRef = useRef<number>(0)

  // Compter les renders
  useEffect(() => {
    if (finalConfig.trackRenders) {
      renderCountRef.current++
    }
  })

  // Mesurer les performances
  const measurePerformance = useCallback(
    (currentTime: number) => {
      if (!finalConfig.trackFPS) return

      frameCountRef.current++

      if (currentTime - lastTimeRef.current >= finalConfig.updateInterval) {
        const timeElapsed = currentTime - lastTimeRef.current
        const fps = Math.round((frameCountRef.current * 1000) / timeElapsed)
        const frameTime = Math.round(timeElapsed / frameCountRef.current)

        // Historique des FPS pour moyenne mobile
        fpsHistoryRef.current.push(fps)
        if (fpsHistoryRef.current.length > 10) {
          fpsHistoryRef.current.shift()
        }

        const averageFPS = Math.round(
          fpsHistoryRef.current.reduce((a, b) => a + b, 0) / fpsHistoryRef.current.length,
        )

        // Détection de lag
        const isLaggy = fps < finalConfig.lagThreshold

        // Mesure mémoire si disponible
        let memoryUsage: number | undefined
        if (finalConfig.trackMemory && 'memory' in performance) {
          const memory = (performance as { memory: { usedJSHeapSize: number } }).memory
          memoryUsage = Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100
        }

        setMetrics({
          fps,
          frameTime,
          renderCount: renderCountRef.current,
          memoryUsage,
          isLaggy,
          averageFPS,
        })

        frameCountRef.current = 0
        lastTimeRef.current = currentTime
      }

      animationFrameRef.current = requestAnimationFrame(measurePerformance)
    },
    [finalConfig],
  )

  // Démarrer/arrêter le monitoring
  useEffect(() => {
    if (finalConfig.trackFPS) {
      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(measurePerformance)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [measurePerformance, finalConfig.trackFPS])

  // Fonction pour logger les performances
  const logMetrics = useCallback(() => {
    console.group('🎮 Performance Metrics')
    console.log(`FPS: ${metrics.fps} (Average: ${metrics.averageFPS})`)
    console.log(`Frame Time: ${metrics.frameTime}ms`)
    console.log(`Renders: ${metrics.renderCount}`)
    if (metrics.memoryUsage) {
      console.log(`Memory: ${metrics.memoryUsage}MB`)
    }
    console.log(`Status: ${metrics.isLaggy ? '🐌 Laggy' : '⚡ Smooth'}`)
    console.groupEnd()
  }, [metrics])

  // Fonction pour obtenir le score de performance
  const getPerformanceScore = useCallback(() => {
    const fpsScore = Math.min(100, (metrics.averageFPS / finalConfig.fpsTarget) * 100)
    const frameTimeScore = Math.max(0, 100 - (metrics.frameTime / 100) * 100)
    const lagScore = metrics.isLaggy ? 0 : 100

    return Math.round((fpsScore + frameTimeScore + lagScore) / 3)
  }, [metrics, finalConfig.fpsTarget])

  // Fonction pour reset les métriques
  const resetMetrics = useCallback(() => {
    frameCountRef.current = 0
    renderCountRef.current = 0
    fpsHistoryRef.current = []
    lastTimeRef.current = performance.now()

    setMetrics({
      fps: 0,
      frameTime: 0,
      renderCount: 0,
      isLaggy: false,
      averageFPS: 0,
    })
  }, [])

  return {
    metrics,
    logMetrics,
    getPerformanceScore,
    resetMetrics,
    isPerformanceGood: metrics.averageFPS >= finalConfig.fpsTarget * 0.8,
    isPerformancePoor: metrics.averageFPS < finalConfig.fpsTarget * 0.5,
  }
}

// Hook simplifié pour juste surveiller les FPS
export function useFPS(target = 16) {
  const { metrics } = usePerformance({
    trackFPS: true,
    trackMemory: false,
    trackRenders: false,
    fpsTarget: target,
  })

  return {
    fps: metrics.fps,
    averageFPS: metrics.averageFPS,
    isSmooth: metrics.averageFPS >= target * 0.8,
  }
}

// Hook pour détecter les problèmes de performance
export function usePerformanceWatcher(onLagDetected?: () => void) {
  const { metrics } = usePerformance({ lagThreshold: 8 })

  useEffect(() => {
    if (metrics.isLaggy && onLagDetected) {
      onLagDetected()
    }
  }, [metrics.isLaggy, onLagDetected])

  return {
    isLaggy: metrics.isLaggy,
    fps: metrics.fps,
    frameTime: metrics.frameTime,
  }
}
