'use client'

import { useState } from 'react'
import type { PasskeyCredential } from '@authon/shared'
import { useAuthonPasskeys } from '@authon/nextjs'
import ErrorAlert from './ErrorAlert'

export default function PasskeyPanel() {
  const { registerPasskey, isLoading, error } = useAuthonPasskeys()
  const [registered, setRegistered] = useState<PasskeyCredential | null>(null)

  const register = async () => {
    const credential = await registerPasskey()
    if (credential) setRegistered(credential)
  }

  return (
    <div className="panel">
      <div className="panel-title">Passkeys</div>
      <p className="panel-desc">Add a passkey so you can sign in next time with Face ID, Touch ID or a security key.</p>
      <button className="btn btn-primary btn-sm" disabled={isLoading} onClick={register}>
        {isLoading ? 'Waiting for passkey...' : 'Register passkey'}
      </button>
      {registered && (
        <div className="alert alert-success">Passkey registered: {registered.name || registered.id}</div>
      )}
      <ErrorAlert error={error} />
    </div>
  )
}
