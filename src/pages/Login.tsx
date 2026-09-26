import { ShieldCheck } from 'lucide-react'

export function Login() {
  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="brand-lockup login-brand">
          <div className="brand-mark">D</div>
          <div>
            <strong>DecisionTwin</strong>
            <span>Decision intelligence</span>
          </div>
        </div>
        <ShieldCheck className="login-icon" size={32} strokeWidth={1.6} />
        <h1>Secure workspace access</h1>
        <p>Authentication will be connected through Supabase before workspace data is enabled.</p>
      </section>
    </main>
  )
}
