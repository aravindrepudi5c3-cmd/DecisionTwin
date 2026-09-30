import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import type { UserRole } from '../types/auth'
import { NetworkCanvas } from '../components/auth/NetworkCanvas'
import { LandingStep } from '../components/auth/LandingStep'
import { RoleSelectionStep } from '../components/auth/RoleSelectionStep'
import { ManagerAuthStep } from '../components/auth/ManagerAuthStep'
import { DeveloperAuthStep } from '../components/auth/DeveloperAuthStep'
import '../components/auth/AuthExperience.css'

type AuthView = 'landing' | 'role-select' | 'manager-auth' | 'developer-auth'

export function Login() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { managerUser, developerUser, isSupabaseConnected } = useAuth()

  // Derive active view and mode directly from URL searchParams
  const roleParam = searchParams.get('role')
  const stepParam = searchParams.get('step')
  const tabParam = (searchParams.get('tab') as 'login' | 'signup') || 'login'

  const currentView: AuthView =
    roleParam === 'manager'
      ? 'manager-auth'
      : roleParam === 'developer'
      ? 'developer-auth'
      : stepParam === 'roles'
      ? 'role-select'
      : 'landing'

  const [authMode] = useState<'login' | 'signup'>(tabParam)

  const handleGoToRoleSelect = () => {
    setSearchParams({ step: 'roles' })
  }

  const handleSelectRole = (role: UserRole) => {
    if (role === 'manager' && managerUser) {
      navigate('/dashboard')
      return
    }
    if (role === 'developer' && developerUser) {
      navigate('/developer-dashboard')
      return
    }
    setSearchParams({ role })
  }

  const handleBack = () => {
    if (currentView === 'manager-auth' || currentView === 'developer-auth') {
      setSearchParams({ step: 'roles' })
    } else if (currentView === 'role-select') {
      setSearchParams({})
    }
  }

  const handleAuthSuccess = (role: UserRole) => {
    if (role === 'manager') {
      navigate('/dashboard')
    } else {
      navigate('/developer-dashboard')
    }
  }

  return (
    <div className="dt-auth-root">
      {/* Background visual components */}
      <div className="dt-auth-grid-bg" />
      <div className="dt-glow-orb dt-glow-orb-primary" />
      <div className="dt-glow-orb dt-glow-orb-secondary" />
      <NetworkCanvas />

      {/* Top Bar Navigation */}
      <header className="dt-auth-topbar">
        <button
          type="button"
          className="dt-brand-container"
          onClick={() => setSearchParams({})}
          title="DecisionTwin Home"
        >
          <div className="dt-brand-mark">D</div>
          <div className="dt-brand-meta">
            <span className="dt-brand-title">DecisionTwin</span>
            <span className="dt-brand-tagline-sub">Simulate Before You Decide</span>
          </div>
        </button>

        <div className="dt-topbar-actions">
          {/* Back button on non-landing views */}
          {currentView !== 'landing' && (
            <button
              type="button"
              className="dt-back-btn"
              onClick={handleBack}
              aria-label="Go back"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          )}

          {/* Supabase backend indicator */}
          <div className="dt-connection-badge">
            <span className={`dt-badge-dot ${isSupabaseConnected ? '' : 'dt-badge-dot-amber'}`} />
            <span>{isSupabaseConnected ? 'Supabase Connected' : 'Preview Demo Mode'}</span>
          </div>
        </div>
      </header>

      {/* Main Multi-Step Content Area */}
      <main className="dt-auth-content">
        {currentView === 'landing' && (
          <LandingStep
            onGetStarted={handleGoToRoleSelect}
            onDirectLogin={handleGoToRoleSelect}
          />
        )}

        {currentView === 'role-select' && (
          <RoleSelectionStep
            onSelectRole={handleSelectRole}
          />
        )}

        {currentView === 'manager-auth' && (
          <ManagerAuthStep
            initialMode={authMode}
            onSuccess={() => handleAuthSuccess('manager')}
          />
        )}

        {currentView === 'developer-auth' && (
          <DeveloperAuthStep
            initialMode={authMode}
            onSuccess={() => handleAuthSuccess('developer')}
          />
        )}
      </main>
    </div>
  )
}

export default Login
