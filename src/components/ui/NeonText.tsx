import React from 'react'
import { cn } from '../../lib/utils'

interface NeonTextProps {
  children: React.ReactNode
  color?: 'cyan' | 'magenta' | 'yellow' | 'green' | 'orange' | 'purple'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  glow?: boolean
  flicker?: boolean
  pulse?: boolean
  className?: string
  as?: React.ElementType
}

const NeonText: React.FC<NeonTextProps> = ({
  children,
  color = 'cyan',
  size = 'md',
  glow = true,
  flicker = false,
  pulse = false,
  className,
  as: Component = 'span',
}) => {
  const colors = {
    cyan: 'text-neon-cyan',
    magenta: 'text-neon-magenta',
    yellow: 'text-neon-yellow',
    green: 'text-neon-green',
    orange: 'text-neon-orange',
    purple: 'text-neon-purple',
  }

  const sizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
  }

  const baseStyles = 'font-arcade font-bold uppercase tracking-wider'
  const colorClass = colors[color]
  const sizeClass = sizes[size]
  const glowClass = glow ? 'neon-glow' : ''
  const flickerClass = flicker ? 'neon-flicker' : ''
  const pulseClass = pulse ? 'neon-pulse' : ''

  return (
    <Component
      className={cn(
        baseStyles,
        colorClass,
        sizeClass,
        glowClass,
        flickerClass,
        pulseClass,
        className,
      )}
    >
      {children}
    </Component>
  )
}

export default NeonText
