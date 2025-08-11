import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'
import useArcadeSounds from '../../hooks/useArcadeSounds'

interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'neon'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  glow?: boolean
  pulse?: boolean
  children: React.ReactNode
}

const ArcadeButton = forwardRef<HTMLButtonElement, ArcadeButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      glow = false,
      pulse = false,
      children,
      onClick,
      ...props
    },
    ref,
  ) => {
    const { playSound } = useArcadeSounds()

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      playSound('button')
      onClick?.(e)
    }
    const baseStyles =
      'arcade-button font-arcade uppercase tracking-wider transition-all duration-300 hover-lift active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      primary: 'text-neon-cyan border-cyan-500 hover-neon hover:bg-cyan-500/10',
      secondary: 'text-neon-magenta border-pink-500 hover:border-neon-magenta hover:bg-pink-500/10',
      danger: 'text-neon-orange border-orange-500 hover:border-neon-orange hover:bg-orange-500/10',
      neon: 'text-neon-yellow border-yellow-400 hover:border-neon-yellow hover:bg-yellow-400/10',
    }

    const sizes = {
      sm: 'px-4 py-2 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      xl: 'px-12 py-6 text-lg',
    }

    const glowClass = glow ? 'neon-glow' : ''
    const pulseClass = pulse ? 'neon-pulse' : ''

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], glowClass, pulseClass, className)}
        onClick={handleClick}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  },
)

ArcadeButton.displayName = 'ArcadeButton'

export default ArcadeButton
