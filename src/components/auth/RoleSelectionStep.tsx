import React from 'react'
import {
  Users,
  Code2,
  ArrowRight,
  Check,
  GitBranch,
  Activity,
} from 'lucide-react'
import type { UserRole } from '../../types/auth'

interface RoleSelectionStepProps {
  onSelectRole: (role: UserRole) => void
}

export const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({ onSelectRole }) => {
  return (
    <div className="dt-role-section dt-step-enter">
      <div className="dt-role-header">
        <h2 className="dt-role-title">Choose Your DecisionTwin</h2>
        <p className="dt-role-subtitle">
          Select your simulation environment to experience tailored predictive decision intelligence.
        </p>
      </div>

      <div className="dt-cards-container">
        {/* Manager Twin Card */}
        <div
          className="dt-role-card dt-glass-panel dt-card-manager"
          onClick={() => onSelectRole('manager')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectRole('manager')
            }
          }}
        >
          <div className="dt-card-badge-row">
            <span className="dt-card-badge">Organizational Simulation</span>
            <div className="flex items-center gap-1 text-blue-400 text-xs font-mono">
              <Activity size={13} className="animate-pulse" />
              <span>LIVE READY</span>
            </div>
          </div>

          <div className="dt-card-icon-box">
            <Users size={30} strokeWidth={1.9} />
          </div>

          <h3 className="dt-card-title">Manager</h3>

          <p className="dt-card-desc">
            Simulate workforce, demand, capacity, deadlines and organizational decisions before implementing them.
          </p>

          <div className="dt-card-features-heading">Core Capabilities</div>
          <ul className="dt-card-features-list">
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Workforce Simulation</span>
            </li>
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Capacity Analysis</span>
            </li>
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Demand Forecasting</span>
            </li>
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Risk Detection</span>
            </li>
          </ul>

          <button
            type="button"
            className="dt-card-cta-btn"
            onClick={(e) => {
              e.stopPropagation()
              onSelectRole('manager')
            }}
          >
            <span>Continue as Manager</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Developer Twin Card */}
        <div
          className="dt-role-card dt-glass-panel dt-card-developer"
          onClick={() => onSelectRole('developer')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onSelectRole('developer')
            }
          }}
        >
          <div className="dt-card-badge-row">
            <span className="dt-card-badge">Codebase & Technical Architecture</span>
            <div className="flex items-center gap-1 text-purple-400 text-xs font-mono">
              <GitBranch size={13} className="animate-pulse" />
              <span>CI/CD CONNECTED</span>
            </div>
          </div>

          <div className="dt-card-icon-box">
            <Code2 size={30} strokeWidth={1.9} />
          </div>

          <h3 className="dt-card-title">Developer</h3>

          <p className="dt-card-desc">
            Analyze software changes, dependencies, affected components and technical risks before modifying your system.
          </p>

          <div className="dt-card-features-heading">Core Capabilities</div>
          <ul className="dt-card-features-list">
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Change Impact Analysis</span>
            </li>
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Dependency Analysis</span>
            </li>
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Codebase Intelligence</span>
            </li>
            <li className="dt-feature-row">
              <span className="dt-feature-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <span>Test Recommendations</span>
            </li>
          </ul>

          <button
            type="button"
            className="dt-card-cta-btn"
            onClick={(e) => {
              e.stopPropagation()
              onSelectRole('developer')
            }}
          >
            <span>Continue as Developer</span>
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}
