import React from 'react'
import { cn } from '../../lib/utils'

interface CRTScreenProps {
  children: React.ReactNode
  scanlines?: boolean
  curve?: boolean
  className?: string
}

const CRTScreen: React.FC<CRTScreenProps> = ({
  children,
  scanlines = true,
  curve = true,
  className,
}) => {
  const baseStyles = 'bg-retro-dark relative'
  const scanlineClass = scanlines ? 'crt-scanlines' : ''
  const curveClass = curve ? 'crt-curve' : ''

  return <div className={cn(baseStyles, scanlineClass, curveClass, className)}>{children}</div>
}

export default CRTScreen
