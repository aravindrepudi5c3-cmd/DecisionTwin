import { useEffect, useState, type FormEvent } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { NetworkCanvas } from '../components/auth/NetworkCanvas.tsx'
import { useAuth } from '../hooks/useAuth.ts'
import { isSupabaseConfigured, supabase } from '../services/supabase.ts'
import '../components/auth/AuthExperience.css'

type RecoveryStatus = 'checking' | 'ready' | 'invalid' | 'success'

export function ResetPassword() {
  const { logout, updatePassword } = useAuth()
  const [recoveryStatus, setRecoveryStatus] = useState<RecoveryStatus>(
    supabase && isSupabaseConfigured ? 'checking' : 'invalid',
  )
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return

    let isMounted = true
    let recoveryEventSeen = false
    const hasRecoveryHash = new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery'
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        recoveryEventSeen = true
        setRecoveryStatus('ready')
      }
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return

      if (!error && data.session && (hasRecoveryHash || recoveryEventSeen)) {
        setRecoveryStatus('ready')
      } else {
        setRecoveryStatus('invalid')
      }
    }).catch(() => {
      if (isMounted) setRecoveryStatus('invalid')
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!newPassword) {
      setErrorMessage('Please enter a new password.')
      return
    }

    if (newPassword.length < 8) {
      setErrorMessage('Password does not meet the required security requirements.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsUpdating(true)
    const result = await updatePassword(newPassword)
    setIsUpdating(false)

    if (result.success) {
      await logout()
      setNewPassword('')
      setConfirmPassword('')
      setRecoveryStatus('success')
      return
    }

    if (result.reason === 'invalid-link') {
      setRecoveryStatus('invalid')
      return
    }

    if (result.reason === 'weak-password') {
      setErrorMessage('Password does not meet the required security requirements.')
      return
    }

    setErrorMessage('Unable to update your password. Please try again.')
  }

  return (
    <div className="dt-auth-root">
      <div className="dt-auth-grid-bg" />
      <div className="dt-glow-orb dt-glow-orb-primary" />
      <div className="dt-glow-orb dt-glow-orb-secondary" />
      <NetworkCanvas />

      <header className="dt-auth-topbar">
        <Link className="dt-brand-container" to="/" aria-label="DecisionTwin home">
          <div className="dt-brand-mark">D</div>
          <div className="dt-brand-meta">
            <span className="dt-brand-title">DecisionTwin</span>
            <span className="dt-brand-tagline-sub">Simulate Before You Decide</span>
          </div>
        </Link>
        <Link className="dt-back-btn" to="/login">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Back to Login</span>
        </Link>
      </header>

      <main className="dt-auth-content">
        <section className="dt-auth-card dt-glass-panel dt-step-enter" aria-labelledby="reset-password-title">
          <div className="dt-auth-card-header">
            <div className="dt-auth-role-tag dt-tag-manager">
              <Lock size={14} aria-hidden="true" />
              <span>Account Security</span>
            </div>
            <h1 id="reset-password-title" className="dt-auth-card-title">
              {recoveryStatus === 'success' ? 'Password Updated' : 'Reset Password'}
            </h1>
            {recoveryStatus === 'ready' && (
              <p className="dt-auth-card-desc">Choose a new password with at least 8 characters.</p>
            )}
          </div>

          {recoveryStatus === 'checking' && (
            <div className="dt-recovery-result" role="status">Validating your secure reset link...</div>
          )}

          {recoveryStatus === 'invalid' && (
            <div className="dt-alert dt-alert-error" role="alert">
              <AlertCircle size={17} aria-hidden="true" />
              <span>This password reset link is invalid or has expired. Please request a new one.</span>
            </div>
          )}

          {recoveryStatus === 'success' && (
            <div className="dt-recovery-result" role="status" aria-live="polite">
              <CheckCircle2 size={20} aria-hidden="true" />
              <strong>Your password has been updated successfully.</strong>
            </div>
          )}

          {recoveryStatus === 'ready' && (
            <>
              {errorMessage && (
                <div className="dt-alert dt-alert-error" role="alert">
                  <AlertCircle size={17} aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form className="dt-form" onSubmit={handleSubmit} noValidate>
                <div className="dt-form-group">
                  <label className="dt-label" htmlFor="new-password">New Password</label>
                  <div className="dt-input-wrapper">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      className="dt-input dt-input-with-action"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <Lock size={17} className="dt-input-icon" aria-hidden="true" />
                    <button
                      type="button"
                      className="dt-input-action-btn"
                      onClick={() => setShowNewPassword((visible) => !visible)}
                      aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="dt-form-group">
                  <label className="dt-label" htmlFor="confirm-new-password">Confirm New Password</label>
                  <div className="dt-input-wrapper">
                    <input
                      id="confirm-new-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="dt-input dt-input-with-action"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                    <Lock size={17} className="dt-input-icon" aria-hidden="true" />
                    <button
                      type="button"
                      className="dt-input-action-btn"
                      onClick={() => setShowConfirmPassword((visible) => !visible)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="dt-submit-btn dt-recovery-submit" disabled={isUpdating}>
                  {isUpdating ? <span className="dt-spinner" aria-label="Updating password" /> : 'Update Password'}
                </button>
              </form>
            </>
          )}

          {(recoveryStatus === 'invalid' || recoveryStatus === 'success') && (
            <Link className="dt-recovery-back dt-link" to="/login">
              <ArrowLeft size={15} aria-hidden="true" />
              Back to Login
            </Link>
          )}
        </section>
      </main>
    </div>
  )
}
