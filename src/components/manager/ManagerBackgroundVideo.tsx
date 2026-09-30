import React, { useEffect, useRef, useState } from 'react'
import './ManagerBackgroundVideo.css'

export interface ManagerBackgroundVideoProps {
  videoSrc?: string
  videoOpacity?: number
  overlayOpacity?: number
  className?: string
}

export const ManagerBackgroundVideo: React.FC<ManagerBackgroundVideoProps> = ({
  videoSrc = '/videos/manager-twin-background.mp4',
  videoOpacity = 0.28,
  overlayOpacity = 0.58,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Listen to prefers-reduced-motion media query
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Manage playback lifecycle safely
  useEffect(() => {
    const video = videoRef.current
    if (!video || prefersReducedMotion) return

    video.muted = true
    video.defaultMuted = true

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy or video not yet placed in public/videos
        // Fail silently and keep pristine futuristic fallback
        setHasError(true)
      })
    }
  }, [prefersReducedMotion, videoSrc])

  return (
    <div
      className={`manager-bg-video-root ${className}`}
      aria-hidden="true"
      data-testid="manager-background-video"
    >
      {/* Layer 1: Futuristic Digital Twin Fallback Canvas & Nodes */}
      <div className="manager-bg-fallback-mesh">
        <div className="manager-bg-ambient-orb manager-bg-ambient-orb--1" />
        <div className="manager-bg-ambient-orb manager-bg-ambient-orb--2" />
        <div className="manager-bg-ambient-orb manager-bg-ambient-orb--3" />
        <div className="manager-bg-digital-twin-grid" />
      </div>

      {/* Layer 1: Full-Screen Background Video */}
      {!prefersReducedMotion && (
        <video
          ref={videoRef}
          className="manager-bg-video-element"
          style={{
            opacity: isLoaded && !hasError ? videoOpacity : 0,
          }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => {
            setIsLoaded(true)
            setHasError(false)
          }}
          onError={() => {
            setHasError(true)
            setIsLoaded(false)
          }}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      )}

      {/* Layer 2: Dark Translucent Gradient Overlay */}
      <div
        className="manager-bg-overlay"
        style={{ opacity: overlayOpacity }}
      />
    </div>
  )
}
