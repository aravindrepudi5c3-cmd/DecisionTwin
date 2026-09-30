import React from 'react'
import { ArrowRight, Sparkles, Network, Code2, ShieldAlert } from 'lucide-react'

interface LandingStepProps {
  onGetStarted: () => void
  onDirectLogin: () => void
}

export const LandingStep: React.FC<LandingStepProps> = ({ onGetStarted, onDirectLogin }) => {
  return (
    <div className="dt-landing-hero dt-step-enter">
      <div className="dt-landing-pill">
        <Sparkles size={14} className="text-blue-400" />
        <span>Enterprise Decision Intelligence</span>
      </div>

      <h1 className="dt-landing-title">DecisionTwin</h1>

      <p className="dt-landing-tagline">
        Simulate Before You Decide
      </p>

      <p className="dt-landing-desc">
        Turn organizational and technical changes into predictable outcomes.
        Simulate workforce allocations, deadline risks, system dependencies, and blast radiuses before modifying your reality.
      </p>

      <div className="dt-landing-actions">
        <button
          type="button"
          className="dt-btn-primary"
          onClick={onGetStarted}
        >
          <span>Get Started</span>
          <ArrowRight size={18} />
        </button>

        <button
          type="button"
          className="dt-btn-secondary"
          onClick={onDirectLogin}
        >
          <span>Sign In to Existing Twin</span>
        </button>
      </div>

      <div className="dt-feature-grid">
        <div className="dt-feature-item">
          <div className="dt-feature-icon">
            <Network size={20} />
          </div>
          <div>
            <div className="dt-feature-title">Organizational Simulation</div>
            <div className="dt-feature-sub">Workforce, capacity & demand modeling</div>
          </div>
        </div>

        <div className="dt-feature-item">
          <div className="dt-feature-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
            <Code2 size={20} />
          </div>
          <div>
            <div className="dt-feature-title">Technical Change Impact</div>
            <div className="dt-feature-sub">Blast radius & dependency intelligence</div>
          </div>
        </div>

        <div className="dt-feature-item">
          <div className="dt-feature-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7' }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="dt-feature-title">Proactive Risk Mitigation</div>
            <div className="dt-feature-sub">Simulate scenarios before execution</div>
          </div>
        </div>
      </div>
    </div>
  )
}
