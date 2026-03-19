'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuthon } from '@authon/nextjs'

type Step = 'email' | 'sent'

export default function ResetPasswordPage() {
  const { client } = useAuthon()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return
    setLoading(true)
    setError('')
    try {
      await client.sendMagicLink(email)
      setStep('sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-centered">
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, maxWidth: 340, margin: '0 auto' }}>
            {step === 'email'
              ? "Enter your email and we'll send you a magic link to reset your password."
              : 'Check your inbox for the reset link.'}
          </p>
        </div>

        {step === 'email' ? (
          <div className="card">
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
              <code style={{ color: 'var(--accent)' }}>client.sendMagicLink(email)</code>
            </div>

            {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email"
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <span className="loading-spinner" /> : 'Send reset link'}
              </button>
            </form>

            <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
              <Link href="/sign-in" style={{ color: 'var(--text-secondary)' }}>
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Check your email
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              We sent a magic link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              Click the link to reset your password. The link expires in 15 minutes.
            </p>

            <div className="alert alert-warning" style={{ textAlign: 'left', marginBottom: 20 }}>
              <strong>Did not receive the email?</strong> Check your spam folder or try again.
            </div>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setStep('email'); setError(''); }}
              >
                Try again
              </button>
              <Link href="/sign-in" className="btn btn-primary">
                Back to sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
