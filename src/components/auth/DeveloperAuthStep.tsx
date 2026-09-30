import React, { useState } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  GitBranch,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Code2,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

function GithubIcon({ size = 17, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  )
}


interface DeveloperAuthStepProps {
  initialMode?: 'login' | 'signup'
  onSuccess: () => void
}

export const DeveloperAuthStep: React.FC<DeveloperAuthStepProps> = ({
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
  const [githubUsername, setGithubUsername] = useState('')
  const [repositoryUrl, setRepositoryUrl] = useState('')
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
      setErrorMessage('Please enter a valid developer email address.')
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
        setErrorMessage('Please enter your full name or developer handle.')
        return
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match. Please verify both fields.')
        return
      }

      const res = await signup({
        email: email.trim(),
        password,
        role: 'developer',
        fullName: fullName.trim(),
        githubUsername: githubUsername.trim() || undefined,
        repositoryUrl: repositoryUrl.trim() || undefined,
      })

      if (res.success) {
        setSuccessMessage('Developer Twin account configured! Loading technical workspace...')
        setTimeout(() => {
          onSuccess()
        }, 650)
      } else {
        setErrorMessage(res.error || 'Failed to create developer account.')
      }
    } else {
      const res = await login({
        email: email.trim(),
        password,
        role: 'developer',
        rememberMe,
      })

      if (res.success) {
        setSuccessMessage('Developer authenticated! Initializing codebase intelligence...')
        setTimeout(() => {
          onSuccess()
        }, 550)
      } else {
        setErrorMessage(res.error || 'Invalid developer credentials. Please check your details.')
      }
    }
  }

  const handleForgotPassword = () => {
    if (!email || !validateEmail(email)) {
      setErrorMessage('Please enter your email address above to receive reset instructions.')
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
        <div className="dt-auth-role-tag dt-tag-developer">
          <Code2 size={14} />
          <span>Developer Twin Access</span>
        </div>
        <h2 className="dt-auth-card-title">Welcome to Developer Twin</h2>
        <p className="dt-auth-card-desc">
          {mode === 'login'
            ? 'Sign in to analyze code changes, dependencies, and technical blast radiuses.'
            : 'Register to link repositories and simulate code impacts before pushing.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="dt-tab-toggle" role="tablist">
        <button
          type="button"
          className={`dt-tab-btn ${mode === 'login' ? 'active active-developer' : ''}`}
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
          className={`dt-tab-btn ${mode === 'signup' ? 'active active-developer' : ''}`}
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
          <span>Recovery link dispatched to <strong>{email}</strong>. Check your inbox.</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="dt-form" noValidate>
        {mode === 'signup' && (
          <div className="dt-form-group">
            <label className="dt-label" htmlFor="dev-fullName">
              Full Name / Handle
            </label>
            <div className="dt-input-wrapper">
              <input
                id="dev-fullName"
                type="text"
                className="dt-input"
                placeholder="e.g. Alex Chen"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
              />
              <User size={17} className="dt-input-icon" />
            </div>
          </div>
        )}

        <div className="dt-form-group">
          <label className="dt-label" htmlFor="dev-email">
            Developer Email
          </label>
          <div className="dt-input-wrapper">
            <input
              id="dev-email"
              type="email"
              className="dt-input"
              placeholder="developer@company.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <Mail size={17} className="dt-input-icon" />
          </div>
        </div>

        <div className="dt-form-group">
          <label className="dt-label" htmlFor="dev-password">
            Password
          </label>
          <div className="dt-input-wrapper">
            <input
              id="dev-password"
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
          <>
            <div className="dt-form-group">
              <label className="dt-label" htmlFor="dev-confirmPassword">
                Confirm Password
              </label>
              <div className="dt-input-wrapper">
                <input
                  id="dev-confirmPassword"
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

            <div className="dt-form-group">
              <label className="dt-label" htmlFor="dev-github">
                <span>GitHub Username</span>
                <span className="dt-optional-badge">Optional</span>
              </label>
              <div className="dt-input-wrapper">
                <input
                  id="dev-github"
                  type="text"
                  className="dt-input"
                  placeholder="e.g. alex-chen-dev"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  autoComplete="username"
                />
                <GithubIcon size={17} className="dt-input-icon" />
              </div>
            </div>

            <div className="dt-form-group">
              <label className="dt-label" htmlFor="dev-repo">
                <span>Primary Repository URL</span>
                <span className="dt-optional-badge">Optional</span>
              </label>
              <div className="dt-input-wrapper">
                <input
                  id="dev-repo"
                  type="url"
                  className="dt-input"
                  placeholder="https://github.com/organization/repo"
                  value={repositoryUrl}
                  onChange={(e) => setRepositoryUrl(e.target.value)}
                />
                <GitBranch size={17} className="dt-input-icon" />
              </div>
            </div>
          </>
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
            background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
            border: '1px solid rgba(216, 180, 254, 0.4)',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(168, 85, 247, 0.35)',
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="dt-spinner" />
          ) : (
            <>
              <span>{mode === 'login' ? 'Login to Developer Twin' : 'Create Developer Account'}</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      {/* Switch mode footer */}
      <div className="dt-auth-footer">
        {mode === 'login' ? (
          <>
            <span>New to Developer Twin?</span>
            <button
              type="button"
              className="dt-link font-semibold"
              onClick={() => {
                setMode('signup')
                setErrorMessage(null)
              }}
            >
              Create Developer Account
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
              Login to Developer Twin
            </button>
          </>
        )}
      </div>

      <div className="dt-demo-note">
        💡 Technical Intelligence Engine: Connects with Supabase Auth & Codebase Schemas
      </div>
    </div>
  )
}
