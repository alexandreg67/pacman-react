import React from 'react'
import type { Direction, Ghost as GhostType } from '../game/types'

type Props = {
  size: number
  id: GhostType['id']
  direction: Direction
  mode: GhostType['mode']
  eyesOnly?: boolean
  frightened?: boolean
  flash?: boolean
}

function getGhostColor(id: GhostType['id']): string {
  switch (id) {
    case 'blinky':
      return '#ff0000'
    case 'pinky':
      return '#ffb8ff'
    case 'inky':
      return '#00ffff'
    case 'clyde':
      return '#ffa500'
  }
}

function getPupilOffset(direction: Direction): { x: number; y: number } {
  switch (direction) {
    case 'up':
      return { x: 0, y: -2 }
    case 'down':
      return { x: 0, y: 2 }
    case 'left':
      return { x: -2, y: 0 }
    case 'right':
      return { x: 2, y: 0 }
  }
}

export const Ghost = React.memo(
  ({ size, id, direction, mode, eyesOnly = false, frightened = false, flash = false }: Props) => {
    const bodyColor = frightened ? (flash ? '#ffffff' : '#1f51ff') : getGhostColor(id)

    const eyeSize = Math.max(4, Math.floor(size * 0.28))
    const pupilSize = Math.max(2, Math.floor(eyeSize * 0.45))
    const offsetX = Math.floor(size * 0.18)
    const offsetY = Math.floor(size * 0.26)
    const spacing = Math.max(2, Math.floor(size * 0.16))
    const pupilOffset = getPupilOffset(direction)

    return (
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
        }}
        aria-label={`ghost-${id}-${mode}`}
      >
        {!eyesOnly && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: bodyColor,
              borderRadius: `${Math.floor(size * 0.5)}px ${Math.floor(size * 0.5)}px ${Math.floor(size * 0.15)}px ${Math.floor(size * 0.15)}px`,
              boxShadow: frightened
                ? '0 0 6px rgba(30, 144, 255, 0.6)'
                : '0 2px 4px rgba(0,0,0,0.25)',
            }}
          />
        )}
        {/* Eyes */}
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: offsetX,
            width: eyeSize,
            height: eyeSize,
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: Math.floor((eyeSize - pupilSize) / 2) + pupilOffset.y,
              left: Math.floor((eyeSize - pupilSize) / 2) + pupilOffset.x,
              width: pupilSize,
              height: pupilSize,
              backgroundColor: frightened && !eyesOnly ? '#000066' : '#0000ff',
              borderRadius: '9999px',
            }}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            top: offsetY,
            left: offsetX + eyeSize + spacing,
            width: eyeSize,
            height: eyeSize,
            backgroundColor: '#ffffff',
            borderRadius: '9999px',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: Math.floor((eyeSize - pupilSize) / 2) + pupilOffset.y,
              left: Math.floor((eyeSize - pupilSize) / 2) + pupilOffset.x,
              width: pupilSize,
              height: pupilSize,
              backgroundColor: frightened && !eyesOnly ? '#000066' : '#0000ff',
              borderRadius: '9999px',
            }}
          />
        </div>
      </div>
    )
  },
)

Ghost.displayName = 'Ghost'
