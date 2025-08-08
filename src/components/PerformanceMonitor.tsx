import React, { useEffect, useRef, useState } from 'react'

interface PerformanceMetrics {
  fps: number
  frameTime: number
  renderCount: number
  memoryUsage?: number
  domElements: number
  isVisible: boolean
}

interface Props {
  enabled?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  updateInterval?: number
}

export const PerformanceMonitor = React.memo(
  ({ enabled = false, position = 'top-right', updateInterval = 1000 }: Props) => {
    const [metrics, setMetrics] = useState<PerformanceMetrics>({
      fps: 0,
      frameTime: 0,
      renderCount: 0,
      domElements: 0,
      isVisible: false,
    })

    const frameCountRef = useRef(0)
    const lastTimeRef = useRef(0)
    const renderCountRef = useRef(0)
    const animationFrameRef = useRef<number>(0)

    // Compter les rendus
    useEffect(() => {
      renderCountRef.current++
    })

    // Mesurer les performances
    useEffect(() => {
      if (!enabled) return

      const measureFPS = (currentTime: number) => {
        frameCountRef.current++

        if (currentTime - lastTimeRef.current >= updateInterval) {
          const fps = Math.round(
            (frameCountRef.current * 1000) / (currentTime - lastTimeRef.current),
          )
          const frameTime = Math.round((currentTime - lastTimeRef.current) / frameCountRef.current)
          const domElements = document.querySelectorAll('*').length

          // Mesure mémoire si disponible
          let memoryUsage: number | undefined
          if ('memory' in performance) {
            const memory = (performance as { memory: { usedJSHeapSize: number } }).memory
            memoryUsage = Math.round((memory.usedJSHeapSize / 1024 / 1024) * 100) / 100
          }

          setMetrics({
            fps,
            frameTime,
            renderCount: renderCountRef.current,
            domElements,
            memoryUsage,
            isVisible: !document.hidden,
          })

          frameCountRef.current = 0
          lastTimeRef.current = currentTime
        }

        animationFrameRef.current = requestAnimationFrame(measureFPS)
      }

      lastTimeRef.current = performance.now()
      animationFrameRef.current = requestAnimationFrame(measureFPS)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }, [enabled, updateInterval])

    if (!enabled) return null

    const positionClasses = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
    }

    const getFPSColor = (fps: number) => {
      if (fps >= 55) return 'text-green-400'
      if (fps >= 30) return 'text-yellow-400'
      return 'text-red-400'
    }

    const getFrameTimeColor = (frameTime: number) => {
      if (frameTime <= 16) return 'text-green-400' // 60 FPS
      if (frameTime <= 33) return 'text-yellow-400' // 30 FPS
      return 'text-red-400'
    }

    return (
      <div
        className={`fixed ${positionClasses[position]} z-50 bg-black/90 text-white p-3 rounded-lg border border-gray-700 font-mono text-xs min-w-[180px]`}
        style={{
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
        }}
      >
        <div className="space-y-1">
          <div className="text-blue-400 font-bold mb-2">Performance Monitor</div>

          <div className="flex justify-between">
            <span>FPS:</span>
            <span className={getFPSColor(metrics.fps)}>{metrics.fps}</span>
          </div>

          <div className="flex justify-between">
            <span>Frame Time:</span>
            <span className={getFrameTimeColor(metrics.frameTime)}>{metrics.frameTime}ms</span>
          </div>

          <div className="flex justify-between">
            <span>Renders:</span>
            <span className="text-cyan-400">{metrics.renderCount}</span>
          </div>

          <div className="flex justify-between">
            <span>DOM Nodes:</span>
            <span className="text-purple-400">{metrics.domElements}</span>
          </div>

          {metrics.memoryUsage && (
            <div className="flex justify-between">
              <span>Memory:</span>
              <span className="text-orange-400">{metrics.memoryUsage}MB</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>Visible:</span>
            <span className={metrics.isVisible ? 'text-green-400' : 'text-red-400'}>
              {metrics.isVisible ? 'Yes' : 'No'}
            </span>
          </div>
        </div>

        {/* Performance indicators */}
        <div className="mt-2 pt-2 border-t border-gray-700">
          <div className="flex space-x-1">
            <div
              className={`w-2 h-2 rounded-full ${metrics.fps >= 55 ? 'bg-green-400' : metrics.fps >= 30 ? 'bg-yellow-400' : 'bg-red-400'}`}
              title="FPS Status"
            />
            <div
              className={`w-2 h-2 rounded-full ${metrics.frameTime <= 16 ? 'bg-green-400' : metrics.frameTime <= 33 ? 'bg-yellow-400' : 'bg-red-400'}`}
              title="Frame Time Status"
            />
            <div
              className={`w-2 h-2 rounded-full ${metrics.domElements < 500 ? 'bg-green-400' : metrics.domElements < 1000 ? 'bg-yellow-400' : 'bg-red-400'}`}
              title="DOM Complexity Status"
            />
          </div>
        </div>
      </div>
    )
  },
)

PerformanceMonitor.displayName = 'PerformanceMonitor'
