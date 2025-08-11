import React, { useEffect, useRef, useState } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface InteractiveParticlesProps {
  enabled?: boolean
  density?: number
  colors?: string[]
  className?: string
}

const InteractiveParticles: React.FC<InteractiveParticlesProps> = ({
  enabled = true,
  density = 3,
  colors = ['#00ffff', '#ff00ff', '#ffff00', '#39ff14'],
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | undefined>(undefined)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let particleId = 0

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticle = (x: number, y: number) => {
      const particle: Particle = {
        id: particleId++,
        x,
        y,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 60,
        maxLife: 60,
        color: colors.length > 0 ? colors[Math.floor(Math.random() * colors.length)] : '#ffffff',
        size: Math.random() * 3 + 1,
      }
      particlesRef.current.push(particle)
    }

    const updateParticles = () => {
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life--
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vx *= 0.98 // Friction
        particle.vy *= 0.98
        return particle.life > 0
      })
    }

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        const alpha = particle.life / particle.maxLife
        ctx.save()
        ctx.globalAlpha = alpha
        ctx.fillStyle = particle.color
        ctx.shadowColor = particle.color
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }

      // Créer des particules occasionnellement lors du mouvement
      if (Math.random() < 0.1 * density) {
        createParticle(e.clientX, e.clientY)
      }
    }

    const handleClick = (e: MouseEvent) => {
      // Explosion de particules au clic
      for (let i = 0; i < 10 * density; i++) {
        createParticle(e.clientX, e.clientY)
      }
    }

    const animate = () => {
      updateParticles()
      drawParticles()
      animationRef.current = requestAnimationFrame(animate)
    }

    // Setup
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    setIsVisible(true)
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      setIsVisible(false)
    }
  }, [enabled, density, colors])

  if (!enabled || !isVisible) return null

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ background: 'transparent' }}
    />
  )
}

export default InteractiveParticles
