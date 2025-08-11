import React from 'react'
import { cn } from '../../lib/utils'

interface RetroCardProps {
  children: React.ReactNode
  variant?: 'default' | 'hex' | 'glow' | 'floating'
  color?: 'cyan' | 'magenta' | 'yellow' | 'green' | 'orange' | 'purple'
  interactive?: boolean
  className?: string
  onClick?: () => void
}

const RetroCard: React.FC<RetroCardProps> = ({
  children,
  variant = 'default',
  color = 'cyan',
  interactive = false,
  className,
  onClick,
}) => {
  const baseStyles =
    'bg-retro-card border-2 border-retro relative overflow-hidden transition-all duration-300'

  const variants = {
    default: 'rounded-lg p-6',
    hex: 'hex-clip p-8 min-h-[200px] flex items-center justify-center',
    glow: 'rounded-xl p-6 neon-pulse',
    floating: 'rounded-lg p-6 floating-particles hover:shadow-2xl',
  }

  const colors = {
    cyan: 'border-cyan-500 hover:border-neon-cyan',
    magenta: 'border-pink-500 hover:border-neon-magenta',
    yellow: 'border-yellow-400 hover:border-neon-yellow',
    green: 'border-green-400 hover:border-neon-green',
    orange: 'border-orange-500 hover:border-neon-orange',
    purple: 'border-purple-500 hover:border-neon-purple',
  }

  const interactiveStyles = interactive ? 'cursor-pointer hover-lift hover-neon transform-gpu' : ''

  return (
    <div
      className={cn(baseStyles, variants[variant], colors[color], interactiveStyles, className)}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default RetroCard
