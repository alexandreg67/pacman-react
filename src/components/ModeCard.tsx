import React from 'react'
import type { GameMode } from '../game/types'
import { cn } from '../lib/utils'
import NeonText from './ui/NeonText'
import RetroCard from './ui/RetroCard'
import useArcadeSounds from '../hooks/useArcadeSounds'

interface ModeCardProps {
  mode: GameMode
  title: string
  description: string
  icon: React.ReactNode
  difficulty?: 'facile' | 'normal' | 'difficile' | 'extrême'
  onSelect: () => void
  className?: string
}

const ModeCard: React.FC<ModeCardProps> = ({
  mode,
  title,
  description,
  icon,
  difficulty = 'normal',
  onSelect,
  className,
}) => {
  const { playSound } = useArcadeSounds()

  const handleSelect = () => {
    playSound('select')
    onSelect()
  }
  // Configuration des couleurs par mode
  const modeConfig = {
    classic: {
      color: 'cyan' as const,
      gradient: 'from-cyan-500/20 to-blue-600/20',
      border: 'border-cyan-500',
      glow: 'hover:shadow-cyan-500/50',
    },
    easy: {
      color: 'green' as const,
      gradient: 'from-green-500/20 to-emerald-600/20',
      border: 'border-green-500',
      glow: 'hover:shadow-green-500/50',
    },
    hard: {
      color: 'orange' as const,
      gradient: 'from-orange-500/20 to-red-600/20',
      border: 'border-orange-500',
      glow: 'hover:shadow-orange-500/50',
    },
    speedrun: {
      color: 'yellow' as const,
      gradient: 'from-yellow-500/20 to-amber-600/20',
      border: 'border-yellow-500',
      glow: 'hover:shadow-yellow-500/50',
    },
    survival: {
      color: 'magenta' as const,
      gradient: 'from-pink-500/20 to-purple-600/20',
      border: 'border-pink-500',
      glow: 'hover:shadow-pink-500/50',
    },
  }

  // Configuration des badges de difficulté
  const difficultyConfig = {
    facile: { label: 'FACILE', color: 'text-green-400', bg: 'bg-green-500/20' },
    normal: { label: 'NORMAL', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    difficile: { label: 'DIFFICILE', color: 'text-orange-400', bg: 'bg-orange-500/20' },
    extrême: { label: 'EXTRÊME', color: 'text-red-400', bg: 'bg-red-500/20' },
  }

  const config = modeConfig[mode]
  const diffConfig = difficultyConfig[difficulty]

  return (
    <RetroCard
      variant="hex"
      color={config.color}
      interactive
      onClick={handleSelect}
      className={cn(
        'group relative min-h-[280px] w-full max-w-[250px] mx-auto',
        'bg-gradient-to-br',
        config.gradient,
        'hover:scale-110 transition-all duration-500 ease-out',
        'hover:shadow-2xl',
        config.glow,
        'before:absolute before:inset-0 before:hex-clip',
        'before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent',
        'before:translate-x-[-100%] before:transition-transform before:duration-700',
        'hover:before:translate-x-[100%]',
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center h-full relative z-10 p-6">
        {/* Icône du mode */}
        <div className="mb-4 text-6xl group-hover:animate-bounce transition-all duration-300">
          {icon}
        </div>

        {/* Titre du mode */}
        <NeonText
          as="h3"
          size="lg"
          color={config.color}
          glow
          className="mb-3 text-center group-hover:scale-110 transition-transform duration-300"
        >
          {title}
        </NeonText>

        {/* Badge de difficulté */}
        <div
          className={cn(
            'px-3 py-1 rounded-full text-xs font-arcade mb-3 border',
            diffConfig.bg,
            diffConfig.color,
            `border-current`,
          )}
        >
          {diffConfig.label}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-center text-sm font-cyber leading-relaxed">
          {description}
        </p>

        {/* Effet de bordure LED */}
        <div className="absolute inset-0 hex-clip">
          <div
            className={cn(
              'absolute inset-0 border-2 hex-clip opacity-0 group-hover:opacity-100',
              'transition-opacity duration-500',
              config.border,
              'animate-pulse',
            )}
          />
        </div>

        {/* Particules flottantes */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div
            className="absolute top-4 left-4 w-1 h-1 bg-current rounded-full animate-ping"
            style={{ color: `var(--neon-${config.color})` }}
          />
          <div
            className="absolute top-8 right-6 w-1 h-1 bg-current rounded-full animate-ping animation-delay-200"
            style={{ color: `var(--neon-${config.color})` }}
          />
          <div
            className="absolute bottom-6 left-8 w-1 h-1 bg-current rounded-full animate-ping animation-delay-400"
            style={{ color: `var(--neon-${config.color})` }}
          />
          <div
            className="absolute bottom-4 right-4 w-1 h-1 bg-current rounded-full animate-ping animation-delay-600"
            style={{ color: `var(--neon-${config.color})` }}
          />
        </div>
      </div>

      {/* Effet de profondeur 3D */}
      <div className="absolute inset-0 hex-clip bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />
    </RetroCard>
  )
}

export default ModeCard
