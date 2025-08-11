import React, { useEffect, useState } from 'react'
import { cn } from '../lib/utils'
import NeonText from './ui/NeonText'

interface GameTimerProps {
  startTime: number
  isRunning: boolean
  className?: string
  color?: 'cyan' | 'magenta' | 'yellow' | 'green' | 'orange' | 'purple'
  showMilliseconds?: boolean
}

const GameTimer: React.FC<GameTimerProps> = ({
  startTime,
  isRunning,
  className,
  color = 'yellow',
  showMilliseconds = false,
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now())

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(
      () => {
        setCurrentTime(Date.now())
      },
      showMilliseconds ? 10 : 100,
    ) // Update plus fréquemment pour les millisecondes

    return () => clearInterval(interval)
  }, [isRunning, showMilliseconds])

  const elapsedMs = isRunning ? currentTime - startTime : 0
  const totalSeconds = Math.floor(elapsedMs / 1000)
  const milliseconds = Math.floor((elapsedMs % 1000) / 10)

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const formatTime = () => {
    const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    if (showMilliseconds) {
      return `${timeStr}.${milliseconds.toString().padStart(2, '0')}`
    }
    return timeStr
  }

  // Couleur dynamique selon le temps
  const getTimerColor = () => {
    if (!isRunning) return color

    // Change de couleur selon la performance
    if (totalSeconds < 60) return 'green' // Sous 1 minute = vert
    if (totalSeconds < 180) return 'yellow' // Sous 3 minutes = jaune
    if (totalSeconds < 300) return 'orange' // Sous 5 minutes = orange
    return 'magenta' // Plus de 5 minutes = magenta
  }

  // Effet de pulsation pour les dernières secondes critiques
  const isPulsingTime = isRunning && totalSeconds > 300 // Après 5 minutes

  return (
    <div
      className={cn(
        'bg-retro-card border-2 border-retro rounded-lg p-4 relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-yellow-500/10 before:to-transparent',
        'before:animate-pulse',
        className,
      )}
    >
      {/* Indicateur de status */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-400 font-arcade">CHRONO</span>
        <div
          className={cn(
            'w-2 h-2 rounded-full transition-colors duration-300',
            isRunning ? 'bg-green-400 animate-ping' : 'bg-red-400',
          )}
        />
      </div>

      {/* Temps principal */}
      <div className="text-center">
        <NeonText
          size="2xl"
          color={getTimerColor()}
          glow
          pulse={isPulsingTime}
          flicker={isPulsingTime}
          className="font-mono tracking-wider"
        >
          {formatTime()}
        </NeonText>
      </div>

      {/* Bonus de vitesse (affiché si temps très rapide) */}
      {isRunning && totalSeconds < 30 && (
        <div className="mt-2 text-center">
          <div className="text-xs text-neon-green font-arcade animate-bounce">
            ⚡ SPEED BONUS! ⚡
          </div>
        </div>
      )}

      {/* Warning pour temps trop long */}
      {isRunning && totalSeconds > 600 && (
        <div className="mt-2 text-center">
          <div className="text-xs text-neon-orange font-arcade animate-pulse">
            ⚠️ TEMPS CRITIQUE ⚠️
          </div>
        </div>
      )}

      {/* Effet de background animé */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className={cn(
            'absolute inset-0 opacity-20 transition-opacity duration-1000',
            isRunning
              ? 'bg-gradient-to-r from-green-500/20 via-yellow-500/20 to-red-500/20'
              : 'bg-gray-500/10',
          )}
        />
      </div>

      {/* Particules de vitesse */}
      {isRunning && totalSeconds < 60 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-neon-green rounded-full animate-ping animation-delay-200" />
          <div className="absolute top-4 right-3 w-1 h-1 bg-neon-yellow rounded-full animate-ping animation-delay-400" />
          <div className="absolute bottom-3 left-4 w-1 h-1 bg-neon-cyan rounded-full animate-ping animation-delay-600" />
        </div>
      )}
    </div>
  )
}

export default GameTimer
