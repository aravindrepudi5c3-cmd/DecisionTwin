import React, { useState } from 'react'
import { AlertCircle, ArrowLeft, CheckCircle2, Mail } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

interface PasswordRecoveryFormProps {
  initialEmail?: string
  onBack: () => void
}

export function PasswordRecoveryForm({ initialEmail = '', onBack }: PasswordRecoveryFormProps) {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState(initialEmail)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [requestSent, setRequestSent] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage(null)

    if (!email.trim()) {
      setErrorMessage('Please enter your registered email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsSending(true)
    const success = await requestPasswordReset(email)
    setIsSending(false)

    if (success) {
      setRequestSent(true)
    } else {
      setErrorMessage('Unable to send the reset link. Please try again.')
    }
  }

  return (
    <section className="dt-recovery-panel" aria-labelledby="recovery-title">
      <div className="dt-auth-card-header">
        <h2 id="recovery-title" className="dt-auth-card-title">Forgot your password?</h2>
        <p className="dt-auth-card-desc">Enter your registered email address to receive a reset link.</p>
      </div>

      {errorMessage && (
        <div className="dt-alert dt-alert-error" role="alert">
          <AlertCircle size={17} aria-hidden="true" />
          <span>{errorMessage}</span>
        </div>
      )}

      {requestSent ? (
        <div className="dt-recovery-result" role="status" aria-live="polite">
          <CheckCircle2 size={20} aria-hidden="true" />
          <div>
            <strong>If an account exists for this email, a password reset link has been sent.</strong>
            <p>Check your spam or junk folder if you don't see the email.</p>
          </div>
        </div>
      ) : (
        <form className="dt-form" onSubmit={handleSubmit} noValidate>
          <div className="dt-form-group">
            <label className="dt-label" htmlFor="recovery-email">Email Address</label>
            <div className="dt-input-wrapper">
              <input
                id="recovery-email"
                type="email"
                className="dt-input"
                placeholder="name@organization.com"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <Mail size={17} className="dt-input-icon" aria-hidden="true" />
            </div>
          </div>

          <button type="submit" className="dt-submit-btn dt-recovery-submit" disabled={isSending}>
            {isSending ? <span className="dt-spinner" aria-label="Sending reset link" /> : 'Send Reset Link'}
          </button>
        </form>
      )}

      <button type="button" className="dt-recovery-back dt-link" onClick={onBack}>
        <ArrowLeft size={15} aria-hidden="true" />
        Back to Login
      </button>
    </section>
  )
}
