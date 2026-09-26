import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CinematicIntro.css'

const statusItems = [
  'DATA CONNECTED ✓',
  'SIMULATION ENGINE READY ✓',
  'AI ANALYTICS READY ✓',
]

export function CinematicIntro() {
  const navigate = useNavigate()
  const [phase, setPhase] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setPhase(1), 500),
      window.setTimeout(() => setPhase(2), 1000),
      window.setTimeout(() => setPhase(3), 1300),
      window.setTimeout(() => setPhase(4), 1600),
      window.setTimeout(() => setPhase(5), 2000),
      window.setTimeout(() => setPhase(6), 2100),
      window.setTimeout(() => setPhase(7), 2300),
      window.setTimeout(() => setPhase(8), 2800),
      window.setTimeout(() => setPhase(9), 3300),
      window.setTimeout(() => setPhase(10), 3700),
    ]

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  const titleVisible = phase >= 7
  const taglineVisible = phase >= 9
  const ctaVisible = phase >= 10

  const handleStartJourney = () => {
    if (isTransitioning) return

    setIsTransitioning(true)
    window.setTimeout(() => navigate('/dashboard'), 650)
  }

  return (
    <main className={`cinematic-intro${isTransitioning ? ' is-transitioning' : ''}`}>
      <video
        className="cinematic-intro__video"
        autoPlay
        muted
        playsInline
        preload="metadata"
        src="/videos/decisiontwin-intro.mp4"
      />

      <div className="cinematic-intro__overlay" aria-hidden="true" />
      <div className="cinematic-intro__scan" aria-hidden="true" />

      <header className="cinematic-intro__topbar">
        <div className="cinematic-intro__brand" aria-label="DecisionTwin brand">
          <span className="cinematic-intro__brand-mark">D</span>
          <span className="cinematic-intro__brand-name">DecisionTwin</span>
        </div>

        <nav className="cinematic-intro__nav" aria-label="Intro navigation">
          <button type="button" className="cinematic-intro__nav-link" onClick={() => navigate('/login')}>
            LOGIN
          </button>
          <button type="button" className="cinematic-intro__nav-link cinematic-intro__nav-link--primary" onClick={() => navigate('/login')}>
            SIGN UP
          </button>
        </nav>
      </header>

      <div className="cinematic-intro__content">
        <div className={`cinematic-intro__system${phase >= 1 ? ' is-visible' : ''}`}>
          <div className={`cinematic-intro__system-label${phase >= 2 ? ' is-visible' : ''}`}>
            DECISION INTELLIGENCE SYSTEM
          </div>
          <div className={`cinematic-intro__initializing${phase >= 3 ? ' is-visible' : ''}`}>
            INITIALIZING...
          </div>
          <div className={`cinematic-intro__status${phase >= 5 ? ' is-visible' : ''}`}>
            {statusItems.map((label) => (
              <span key={label} className="cinematic-intro__status-item">
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className={`cinematic-intro__hero${titleVisible ? ' is-visible' : ''}`}>
          <h1 className="cinematic-intro__title">DecisionTwin</h1>
          <p className={`cinematic-intro__tagline${taglineVisible ? ' is-visible' : ''}`}>
            Take the decision before you take the risk.
          </p>
          <button
            type="button"
            className={`cinematic-intro__cta${ctaVisible ? ' is-visible' : ''}`}
            onClick={handleStartJourney}
          >
            START JOURNEY <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </main>
  )
}
