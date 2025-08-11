import React, { useEffect, useState } from 'react'
import { cn } from '../../lib/utils'
import useArcadeSounds from '../../hooks/useArcadeSounds'

interface StarDisplayProps {
  stars: number
  maxStars?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  showAnimation?: boolean
  className?: string
  onAnimationComplete?: () => void
}

const StarDisplay: React.FC<StarDisplayProps> = ({
  stars,
  maxStars = 3,
  size = 'md',
  animate = false,
  showAnimation = false,
  className,
  onAnimationComplete,
}) => {
  const [animatedStars, setAnimatedStars] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const { playSound } = useArcadeSounds()

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }

  useEffect(() => {
    if (showAnimation && stars > 0) {
      setIsAnimating(true)
      setAnimatedStars(0)

      // Animation progressive des étoiles
      const animateNextStar = (starIndex: number) => {
        if (starIndex < stars) {
          setTimeout(() => {
            setAnimatedStars(starIndex + 1)
            playSound('star') // Son pour chaque étoile
            animateNextStar(starIndex + 1)
          }, 300) // 300ms entre chaque étoile
        } else {
          setIsAnimating(false)
          onAnimationComplete?.()
        }
      }

      animateNextStar(0)
    } else {
      setAnimatedStars(stars)
    }
  }, [showAnimation, stars, onAnimationComplete, playSound])

  const displayStars = animate || showAnimation ? animatedStars : stars

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1
        const isEarned = starIndex <= displayStars
        const isAnimatingCurrent = isAnimating && starIndex === animatedStars + 1

        return (
          <div
            key={i}
            className={cn(
              'relative transition-all duration-300',
              sizeClasses[size],
              isEarned ? 'text-yellow-400' : 'text-gray-600',
              isAnimatingCurrent && 'animate-bounce',
            )}
          >
            {/* Étoile principale */}
            <span
              className={cn(
                'transition-all duration-500',
                isEarned && 'drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]',
                isAnimatingCurrent && 'animate-pulse scale-125',
              )}
            >
              ⭐
            </span>

            {/* Effet de brillance */}
            {isEarned && (
              <div className="absolute inset-0 animate-ping">
                <span className="text-yellow-300 opacity-50">✨</span>
              </div>
            )}

            {/* Particules d'explosion lors de l'animation */}
            {isAnimatingCurrent && (
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-1 -left-1 animate-ping">
                  <span className="text-xs text-yellow-200">✨</span>
                </div>
                <div className="absolute -top-1 -right-1 animate-ping animation-delay-200">
                  <span className="text-xs text-yellow-300">⭐</span>
                </div>
                <div className="absolute -bottom-1 -left-1 animate-ping animation-delay-400">
                  <span className="text-xs text-yellow-400">💫</span>
                </div>
                <div className="absolute -bottom-1 -right-1 animate-ping animation-delay-600">
                  <span className="text-xs text-yellow-200">✨</span>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default StarDisplay
