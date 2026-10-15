import { useState } from 'react'
import { useAuthonPasskeys, useAuthonPasswordless } from '@authon/react'
import ErrorAlert from './ErrorAlert'

type Step = 'email' | 'code' | 'link-sent'

export default function PasswordlessPanel() {
  const passwordless = useAuthonPasswordless()
  const passkeys = useAuthonPasskeys()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<Step>('email')
  const busy = passwordless.isLoading || passkeys.isLoading

  const sendCode = async () => {
    if (await passwordless.sendEmailOtp(email)) setStep('code')
  }

  const sendLink = async () => {
    // The link opens this page; the SDK finishes the sign-in on load (autoHandleMagicLink).
    if (await passwordless.sendMagicLink(email)) setStep('link-sent')
  }

  const verifyCode = async () => {
    await passwordless.verifyPasswordless({ email, code })
  }

  const signInWithPasskey = async () => {
    await passkeys.authenticateWithPasskey(email || undefined)
  }

  const reset = () => {
    setStep('email')
    setCode('')
  }

  return (
    <div className="panel">
      <div className="panel-title">Sign in without a password</div>
      <p className="panel-desc">
        Get a one-time code or a magic link by email, or use a passkey saved on this device.
      </p>

      {step === 'email' && (
        <>
          <input
            className="field"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="field-row">
            <button className="btn btn-primary btn-sm" disabled={busy || !email} onClick={sendCode}>
              Email me a code
            </button>
            <button className="btn btn-outline btn-sm" disabled={busy || !email} onClick={sendLink}>
              Send magic link
            </button>
          </div>
        </>
      )}

      {step === 'code' && (
        <>
          <p className="panel-desc">Enter the code sent to {email}.</p>
          <div className="field-row">
            <input
              className="field"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value.trim())}
            />
            <button className="btn btn-primary btn-sm" disabled={busy || !code} onClick={verifyCode}>
              Verify code
            </button>
          </div>
          <button className="btn-link" onClick={reset}>Use a different email</button>
        </>
      )}

      {step === 'link-sent' && (
        <>
          <div className="alert alert-success">
            Magic link sent to {email}. Open it in this browser to finish signing in.
          </div>
          <button className="btn-link" onClick={reset}>Use a different email</button>
        </>
      )}

      <div className="panel-divider"><span>or</span></div>
      <button className="btn btn-outline btn-sm" disabled={busy} onClick={signInWithPasskey}>
        Sign in with passkey
      </button>

      <ErrorAlert error={passwordless.error ?? passkeys.error} />
    </div>
  )
}
