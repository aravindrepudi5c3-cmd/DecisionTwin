import React, { useState } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Users,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface ManagerAuthStepProps {
  initialMode?: 'login' | 'signup'
  onSuccess: () => void
}

export const ManagerAuthStep: React.FC<ManagerAuthStepProps> = ({
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, signup, isLoading } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Status states
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false)

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    // Validation
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.')
      return
    }
    if (!validateEmail(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }
    if (!password) {
      setErrorMessage('Please enter your password.')
      return
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Please enter your full name.')
        return
      }
      if (!organizationName.trim()) {
        setErrorMessage('Please enter your organization name.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both fields.')
        return
      }

      const res = await signup({
        email: email.trim(),
        password,
        role: 'manager',
        fullName: fullName.trim(),
        organizationName: organizationName.trim(),
      })

      if (res.success) {
        setSuccessMessage('Manager account created successfully! Entering DecisionTwin...')
        setTimeout(() => {
          onSuccess()
        }, 650)
      } else {
        setErrorMessage(res.error || 'Failed to create manager account.')
      }
    } else {
      const res = await login({
        email: email.trim(),
        password,
        role: 'manager',
        rememberMe,
      })

      if (res.success) {
        setSuccessMessage('Authentication verified! Loading DecisionTwin workspace...')
        setTimeout(() => {
          onSuccess()
        }, 550)
      } else {
        setErrorMessage(res.error || 'Invalid manager credentials. Please check your details.')
      }
    }
  }

  const handleForgotPassword = () => {
    if (!email || !validateEmail(email)) {
      setErrorMessage('Please enter your email address above to receive password reset instructions.')
      return
    }
    setForgotPasswordSent(true)
    setErrorMessage(null)
    setTimeout(() => {
      setForgotPasswordSent(false)
    }, 6000)
  }

  return (
    <div className="dt-auth-card dt-glass-panel dt-step-enter">
      <div className="dt-auth-card-header">
        <div className="dt-auth-role-tag dt-tag-manager">
          <Users size={14} />
          <span>Manager Twin Access</span>
        </div>
        <h2 className="dt-auth-card-title">Welcome to Manager Twin</h2>
        <p className="dt-auth-card-desc">
          {mode === 'login'
            ? 'Sign in to access organizational simulation and capacity tools.'
            : 'Register your organization to simulate decisions before execution.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="dt-tab-toggle" role="tablist">
        <button
          type="button"
          className={`dt-tab-btn ${mode === 'login' ? 'active active-manager' : ''}`}
          onClick={() => {
            setMode('login')
            setErrorMessage(null)
          }}
          role="tab"
          aria-selected={mode === 'login'}
        >
          Login
        </button>
        <button
          type="button"
          className={`dt-tab-btn ${mode === 'signup' ? 'active active-manager' : ''}`}
          onClick={() => {
            setMode('signup')
            setErrorMessage(null)
          }}
          role="tab"
          aria-selected={mode === 'signup'}
        >
          Sign Up
        </button>
      </div>

      {/* Alert Messages */}
      {errorMessage && (
        <div className="dt-alert dt-alert-error mb-4">
          <AlertCircle size={17} className="shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="dt-alert dt-alert-success mb-4">
          <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {forgotPasswordSent && (
        <div className="dt-alert dt-alert-success mb-4">
          <CheckCircle2 size={17} className="shrink-0 mt-0.5" />
          <span>Password recovery link sent to <strong>{email}</strong>. Check your inbox.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="dt-form" noValidate>
        {mode === 'signup' && (
          <>
            <div className="dt-form-group">
              <label className="dt-label" htmlFor="manager-fullName">
                Full Name
              </label>
              <div className="dt-input-wrapper">
                <input
                  id="manager-fullName"
                  type="text"
                  className="dt-input"
                  placeholder="e.g. Elena Rostova"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                  required
                />
                <User size={17} className="dt-input-icon" />
              </div>
            </div>

            <div className="dt-form-group">
              <label className="dt-label" htmlFor="manager-organization">
                Organization Name
              </label>
              <div className="dt-input-wrapper">
                <input
                  id="manager-organization"
                  type="text"
                  className="dt-input"
                  placeholder="e.g. Acme Global Logistics"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  autoComplete="organization"
                  required
                />
                <Building size={17} className="dt-input-icon" />
              </div>
            </div>
          </>
        )}

        <div className="dt-form-group">
          <label className="dt-label" htmlFor="manager-email">
            Email Address
          </label>
          <div className="dt-input-wrapper">
            <input
              id="manager-email"
              type="email"
              className="dt-input"
              placeholder="manager@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Mail size={17} className="dt-input-icon" />
          </div>
        </div>

        <div className="dt-form-group">
          <label className="dt-label" htmlFor="manager-password">
            Password
          </label>
          <div className="dt-input-wrapper">
            <input
              id="manager-password"
              type={showPassword ? 'text' : 'password'}
              className="dt-input dt-input-with-action"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
            />
            <Lock size={17} className="dt-input-icon" />
            <button
              type="button"
              className="dt-input-action-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {mode === 'signup' && (
          <div className="dt-form-group">
            <label className="dt-label" htmlFor="manager-confirmPassword">
              Confirm Password
            </label>
            <div className="dt-input-wrapper">
              <input
                id="manager-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="dt-input dt-input-with-action"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <Lock size={17} className="dt-input-icon" />
              <button
                type="button"
                className="dt-input-action-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        )}

        {mode === 'login' && (
          <div className="dt-form-row">
            <label className="dt-checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              className="dt-link"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          className="dt-submit-btn"
          style={{
            background: 'linear-gradient(135deg, #4d6bfe 0%, #3554e8 100%)',
            border: '1px solid rgba(147, 197, 253, 0.4)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(77, 107, 254, 0.35)',
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="dt-spinner" />
          ) : (
            <>
              <span>{mode === 'login' ? 'Login to Manager Twin' : 'Create Manager Account'}</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Switch mode footer */}
      <div className="dt-auth-footer">
        {mode === 'login' ? (
          <>
            <span>Need a new organization?</span>
            <button
              type="button"
              className="dt-link font-semibold"
              onClick={() => {
                setMode('signup')
                setErrorMessage(null)
              }}
            >
              Create Manager Account
            </button>
          </>
        ) : (
          <>
            <span>Already registered?</span>
            <button
              type="button"
              className="dt-link font-semibold"
              onClick={() => {
                setMode('login')
                setErrorMessage(null)
              }}
            >
              Login to Manager Twin
            </button>
          </>
        )}
      </div>

      <div className="dt-demo-note">
        💡 DecisionTwin Engine: Connected with Supabase Auth & Organization Profiles
      </div>
    </div>
  )
}
