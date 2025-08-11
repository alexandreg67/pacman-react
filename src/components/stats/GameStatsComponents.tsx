import React from 'react'

// Composant de base pour les stats individuelles
interface StatItemProps {
  label: string
  value: React.ReactNode
  color: 'gold' | 'emerald' | 'red' | 'blue' | 'purple'
  icon?: string
  size?: 'sm' | 'md' | 'lg'
}

const StatItem: React.FC<StatItemProps> = React.memo(
  ({ label, value, color, icon, size = 'md' }) => {
    const colorClasses = {
      gold: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
      emerald: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
      red: 'text-red-400 border-red-400/30 bg-red-400/10',
      blue: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
      purple: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    }

    const sizeClasses = {
      sm: 'text-sm p-2',
      md: 'text-base p-3',
      lg: 'text-lg p-4',
    }

    return (
      <div
        className={`
      rounded-lg border backdrop-blur-sm transition-all duration-200 hover:scale-105
      ${colorClasses[color]} ${sizeClasses[size]}
    `}
      >
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-gray-400 mb-1 font-mono">
            {icon && <span>{icon}</span>}
            <span className="uppercase tracking-wider">{label}</span>
          </div>
          <div className="font-bold font-mono">{value}</div>
        </div>
      </div>
    )
  },
)

StatItem.displayName = 'StatItem'

// Composant Score
export const ScoreDisplay: React.FC<{ score: number; size?: 'sm' | 'md' | 'lg' }> = React.memo(
  ({ score, size = 'md' }) => (
    <StatItem label="Score" value={score.toLocaleString()} color="gold" icon="🏆" size={size} />
  ),
)

ScoreDisplay.displayName = 'ScoreDisplay'

// Composant Level
export const LevelDisplay: React.FC<{ level: number; size?: 'sm' | 'md' | 'lg' }> = React.memo(
  ({ level, size = 'md' }) => (
    <StatItem label="Niveau" value={level} color="emerald" icon="🎯" size={size} />
  ),
)

LevelDisplay.displayName = 'LevelDisplay'

// Composant Lives
export const LivesDisplay: React.FC<{ lives: number; size?: 'sm' | 'md' | 'lg' }> = React.memo(
  ({ lives, size = 'md' }) => {
    const livesContent =
      lives > 0 ? (
        <div className="flex justify-center gap-1">
          {Array.from({ length: Math.min(lives, 5) }).map((_, i) => (
            <span key={i} className="text-red-400">
              ❤️
            </span>
          ))}
          {lives > 5 && <span className="text-sm ml-1">+{lives - 5}</span>}
        </div>
      ) : (
        <span className="text-red-500 font-bold text-xs">GAME OVER</span>
      )

    return <StatItem label="Vies" value={livesContent} color="red" icon="💖" size={size} />
  },
)

LivesDisplay.displayName = 'LivesDisplay'

// Composant Pellets
export const PelletsDisplay: React.FC<{ pelletsRemaining: number; size?: 'sm' | 'md' | 'lg' }> =
  React.memo(({ pelletsRemaining, size = 'md' }) => (
    <StatItem label="Pellets" value={pelletsRemaining} color="blue" icon="⚪" size={size} />
  ))

PelletsDisplay.displayName = 'PelletsDisplay'

// Composant Performance Monitor
export const PerformanceMonitor: React.FC<{
  gameTime?: number
  fps?: number
  showInProduction?: boolean
  size?: 'sm' | 'md' | 'lg'
}> = React.memo(({ gameTime, fps, showInProduction = false, size = 'sm' }) => {
  // Masquer en production sauf si explicitement demandé
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null
  }

  const performanceData = (
    <div className="space-y-1 text-xs">
      {gameTime && <div>Temps: {(gameTime / 1000).toFixed(1)}s</div>}
      {fps && <div>FPS: {Math.round(fps)}</div>}
    </div>
  )

  return <StatItem label="Perf" value={performanceData} color="purple" icon="📊" size={size} />
})

PerformanceMonitor.displayName = 'PerformanceMonitor'

// Hook personnalisé pour calculer les FPS (optionnel)
export const useFPS = () => {
  const [fps, setFPS] = React.useState(0)
  const frameCount = React.useRef(0)
  const lastTime = React.useRef(performance.now())

  React.useEffect(() => {
    let animationId: number

    const updateFPS = () => {
      frameCount.current++
      const currentTime = performance.now()

      if (currentTime - lastTime.current >= 1000) {
        setFPS(frameCount.current)
        frameCount.current = 0
        lastTime.current = currentTime
      }

      animationId = requestAnimationFrame(updateFPS)
    }

    animationId = requestAnimationFrame(updateFPS)

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return fps
}
