import { useEffect, useRef } from 'react'

interface Node {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  baseAlpha: number
  pulse: number
  pulseSpeed: number
  layer: number // 0 = background, 1 = mid, 2 = foreground
}

interface Pulse {
  sourceIdx: number
  targetIdx: number
  progress: number
  speed: number
}

export function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    let mouseX = -1000
    let mouseY = -1000

    const nodes: Node[] = []
    const pulses: Pulse[] = []
    const nodeCount = Math.min(65, Math.floor((window.innerWidth * window.innerHeight) / 22000))
    const maxDistance = 160

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.scale(dpr, dpr)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouseX = -1000
      mouseY = -1000
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    // Initialize nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.2,
        baseAlpha: Math.random() * 0.45 + 0.35,
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        layer: Math.floor(Math.random() * 3),
      })
    }

    // Spawn pulses occasionally
    const spawnPulse = () => {
      if (nodes.length < 2 || pulses.length > 12) return
      const s = Math.floor(Math.random() * nodes.length)
      // find nearest neighbor
      let nearestIdx = -1
      let minDist = maxDistance
      for (let j = 0; j < nodes.length; j++) {
        if (s === j) continue
        const dx = nodes[s].x - nodes[j].x
        const dy = nodes[s].y - nodes[j].y
        const dist = Math.hypot(dx, dy)
        if (dist < minDist) {
          minDist = dist
          nearestIdx = j
        }
      }
      if (nearestIdx !== -1) {
        pulses.push({
          sourceIdx: s,
          targetIdx: nearestIdx,
          progress: 0,
          speed: 0.008 + Math.random() * 0.012,
        })
      }
    }

    let frameCount = 0

    const render = () => {
      frameCount++
      ctx.clearRect(0, 0, width, height)

      // Draw subtle background ambient radial gradients
      const grad1 = ctx.createRadialGradient(width * 0.25, height * 0.2, 50, width * 0.25, height * 0.2, width * 0.5)
      grad1.addColorStop(0, 'rgba(77, 107, 254, 0.09)')
      grad1.addColorStop(1, 'rgba(77, 107, 254, 0)')
      ctx.fillStyle = grad1
      ctx.fillRect(0, 0, width, height)

      const grad2 = ctx.createRadialGradient(width * 0.75, height * 0.8, 80, width * 0.75, height * 0.8, width * 0.5)
      grad2.addColorStop(0, 'rgba(168, 85, 247, 0.08)')
      grad2.addColorStop(1, 'rgba(168, 85, 247, 0)')
      ctx.fillStyle = grad2
      ctx.fillRect(0, 0, width, height)

      // Update & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]

        node.x += node.vx
        node.y += node.vy
        node.pulse += node.pulseSpeed

        // Wrap around bounds
        if (node.x < 0) node.x = width
        if (node.x > width) node.x = 0
        if (node.y < 0) node.y = height
        if (node.y > height) node.y = 0

        // Mouse gentle repulsion / pull
        const mdx = node.x - mouseX
        const mdy = node.y - mouseY
        const mDist = Math.hypot(mdx, mdy)
        if (mDist < 140 && mDist > 0) {
          const force = (140 - mDist) / 140
          node.x += (mdx / mDist) * force * 0.8
          node.y += (mdy / mDist) * force * 0.8
        }

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j]
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.hypot(dx, dy)

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.18
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)

            // Gradient link between nodes
            const strokeGrad = ctx.createLinearGradient(node.x, node.y, other.x, other.y)
            strokeGrad.addColorStop(0, `rgba(99, 132, 255, ${alpha})`)
            strokeGrad.addColorStop(1, `rgba(168, 120, 255, ${alpha * 0.85})`)
            ctx.strokeStyle = strokeGrad
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }

        // Node glow & circle
        const currentAlpha = node.baseAlpha + Math.sin(node.pulse) * 0.15
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.layer === 2
          ? `rgba(168, 140, 255, ${Math.min(1, currentAlpha + 0.15)})`
          : `rgba(110, 160, 255, ${currentAlpha})`
        ctx.fill()

        // Subtle glow halo on foreground nodes
        if (node.layer === 2) {
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.radius * 3.2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(100, 150, 255, ${currentAlpha * 0.18})`
          ctx.fill()
        }
      }

      // Update & render pulses (decision simulation packets)
      if (frameCount % 45 === 0) {
        spawnPulse()
      }

      for (let k = pulses.length - 1; k >= 0; k--) {
        const pulse = pulses[k]
        pulse.progress += pulse.speed

        if (pulse.progress >= 1) {
          pulses.splice(k, 1)
          continue
        }

        const source = nodes[pulse.sourceIdx]
        const target = nodes[pulse.targetIdx]
        if (!source || !target) {
          pulses.splice(k, 1)
          continue
        }

        const px = source.x + (target.x - source.x) * pulse.progress
        const py = source.y + (target.y - source.y) * pulse.progress

        ctx.beginPath()
        ctx.arc(px, py, 2.2, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
        ctx.shadowColor = 'rgba(120, 180, 255, 0.9)'
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="dt-network-canvas"
      aria-hidden="true"
    />
  )
}
