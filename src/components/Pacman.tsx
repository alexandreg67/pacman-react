import React from 'react'
import type { Direction } from '../game/types'

type Props = {
  size: number
  direction: Direction
  mouthOpen?: boolean
}

export const Pacman = React.memo(({ size, direction, mouthOpen = true }: Props) => {
  // CSS-based Pacman optimisé pour de meilleures performances
  const pacmanSize = Math.floor(size * 0.85) // Légèrement plus petit que la cellule

  // Calcul du triangle de bouche basé sur la direction - mémorisé
  const getMouthTriangle = React.useCallback(() => {
    const center = pacmanSize / 2
    const mouthSize = mouthOpen ? center * 0.6 : center * 0.2

    switch (direction) {
      case 'right':
        return `${center}px 0, ${center + mouthSize}px ${center}px, ${center}px ${pacmanSize}px`
      case 'left':
        return `${center}px 0, ${center - mouthSize}px ${center}px, ${center}px ${pacmanSize}px`
      case 'up':
        return `0 ${center}px, ${center}px ${center - mouthSize}px, ${pacmanSize}px ${center}px`
      case 'down':
        return `0 ${center}px, ${center}px ${center + mouthSize}px, ${pacmanSize}px ${center}px`
      default:
        return `${center}px 0, ${center + mouthSize}px ${center}px, ${center}px ${pacmanSize}px`
    }
  }, [direction, mouthOpen, pacmanSize])

  // Styles mémorisés pour éviter les recalculs
  const containerStyle = React.useMemo(
    () => ({
      width: size,
      height: size,
    }),
    [size],
  )

  const bodyStyle = React.useMemo(
    () => ({
      width: pacmanSize,
      height: pacmanSize,
      backgroundColor: '#FFD700',
      borderRadius: '50%',
      border: '1px solid #FFA500',
      position: 'relative' as const,
      boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
    }),
    [pacmanSize],
  )

  const mouthStyle = React.useMemo(
    () => ({
      position: 'absolute' as const,
      width: pacmanSize,
      height: pacmanSize,
      backgroundColor: '#000000',
      clipPath: `polygon(${getMouthTriangle()})`,
    }),
    [pacmanSize, getMouthTriangle],
  )

  const eyeStyle = React.useMemo(
    () => ({
      position: 'absolute' as const,
      width: Math.max(2, pacmanSize * 0.1),
      height: Math.max(2, pacmanSize * 0.1),
      backgroundColor: '#000',
      borderRadius: '50%',
      top: '25%',
      left: direction === 'left' ? '70%' : '30%',
    }),
    [pacmanSize, direction],
  )

  return (
    <div className="relative flex items-center justify-center" style={containerStyle}>
      {/* Corps principal de Pacman */}
      <div style={bodyStyle} />

      {/* Découpe de la bouche */}
      <div style={mouthStyle} />

      {/* Œil */}
      <div style={eyeStyle} />
    </div>
  )
})

Pacman.displayName = 'Pacman'
