'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthonMfa } from '@authon/nextjs'
import type { MfaStatus } from '@authon/shared'
import ProtectedPage from '../../components/ProtectedPage'

type SetupStep = 'idle' | 'qr' | 'verify' | 'done'

export default function MfaPage() {
  return (
    <ProtectedPage>
      <MfaContent />
    </ProtectedPage>
  )
}

function MfaContent() {
  const { setupMfa, verifyMfaSetup, disableMfa, getMfaStatus, regenerateBackupCodes, isLoading, error } = useAuthonMfa()
  const [status, setStatus] = useState<MfaStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [setupStep, setSetupStep] = useState<SetupStep>('idle')
  const [qrData, setQrData] = useState<{ secret: string; qrCodeSvg: string; backupCodes: string[] } | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [showDisable, setShowDisable] = useState(false)
  const [regenCode, setRegenCode] = useState('')
  const [showRegen, setShowRegen] = useState(false)
  const [newBackupCodes, setNewBackupCodes] = useState<string[] | null>(null)
  const [localError, setLocalError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadStatus = useCallback(async () => {
    setStatusLoading(true)
    const s = await getMfaStatus()
    setStatus(s)
    setStatusLoading(false)
  }, [getMfaStatus])

  useEffect(() => {
    loadStatus()
  }, [loadStatus])

  const handleSetupStart = async () => {
    setLocalError('')
    const data = await setupMfa()
    if (!data) {
      setLocalError(error?.message ?? 'Failed to start MFA setup')
      return
    }
    setQrData({ secret: data.secret, qrCodeSvg: data.qrCodeSvg, backupCodes: data.backupCodes })
    setSetupStep('qr')
  }

  const handleVerifySetup = async () => {
    setLocalError('')
    const ok = await verifyMfaSetup(verifyCode)
    if (!ok) {
      setLocalError(error?.message ?? 'Invalid code. Please try again.')
      return
    }
    setSetupStep('done')
    setSuccessMsg('MFA enabled successfully!')
    await loadStatus()
  }

  const handleDisable = async () => {
    setLocalError('')
    const ok = await disableMfa(disableCode)
    if (!ok) {
      setLocalError(error?.message ?? 'Invalid code')
      return
    }
    setShowDisable(false)
    setDisableCode('')
    setSuccessMsg('MFA has been disabled.')
    await loadStatus()
  }

  const handleRegenerate = async () => {
    setLocalError('')
    const codes = await regenerateBackupCodes(regenCode)
    if (!codes) {
      setLocalError(error?.message ?? 'Failed to regenerate backup codes')
      return
    }
    setNewBackupCodes(codes)
    setShowRegen(false)
    setRegenCode('')
    setSuccessMsg('Backup codes regenerated.')
  }

  if (statusLoading) {
    return (
      <div className="page-centered">
        <div className="loading-spinner-lg" />
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Two-Factor Authentication
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Add an extra layer of security using <code style={{ color: 'var(--accent)' }}>useAuthonMfa()</code>
        </p>
      </div>

      {(localError || error) && (
        <div className="alert alert-error" style={{ marginBottom: 16 }}>
          {localError || error?.message}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: 16 }}>
          {successMsg}
        </div>
      )}

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Authenticator App</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              {status?.enabled
                ? `Active — ${status.backupCodesRemaining} backup codes remaining`
                : 'Not configured'}
            </div>
          </div>
          <span className={`badge ${status?.enabled ? 'badge-success' : 'badge-muted'}`}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: status?.enabled ? 'var(--success)' : 'var(--text-tertiary)', display: 'inline-block' }} />
            {status?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {!status?.enabled && setupStep === 'idle' && (
          <button
            className="btn btn-primary"
            onClick={handleSetupStart}
            disabled={isLoading}
          >
            {isLoading ? <span className="loading-spinner" /> : 'Set up authenticator app'}
          </button>
        )}

        {setupStep === 'qr' && qrData && (
          <div>
            <div className="alert alert-warning" style={{ marginBottom: 20 }}>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </div>

            <div className="qr-container" style={{ marginBottom: 20 }}>
              <div dangerouslySetInnerHTML={{ __html: qrData.qrCodeSvg }} />
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center' }}>
                Or enter manually:
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  marginTop: 6,
                  wordBreak: 'break-all',
                  padding: '8px 12px',
                  background: 'var(--bg-card)',
                  borderRadius: 6,
                  border: '1px solid var(--border)',
                }}>
                  {qrData.secret}
                </div>
              </div>
            </div>

            {qrData.backupCodes.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  Backup Codes — Save these now
                </div>
                <div className="alert alert-warning" style={{ marginBottom: 12, fontSize: 12 }}>
                  Store backup codes safely. Each code can only be used once.
                </div>
                <div className="backup-codes-grid">
                  {qrData.backupCodes.map(code => (
                    <div key={code} className="backup-code">{code}</div>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-secondary btn-full"
              style={{ marginBottom: 12 }}
              onClick={() => setSetupStep('verify')}
            >
              I&apos;ve scanned the QR code — Next
            </button>
          </div>
        )}

        {setupStep === 'verify' && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
              Enter the 6-digit code from your authenticator app
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <input
                  className="form-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={verifyCode}
                  onChange={e => setVerifyCode(e.target.value)}
                  style={{ textAlign: 'center', fontSize: 20, letterSpacing: '0.2em' }}
                  autoFocus
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={handleVerifySetup}
                disabled={isLoading || verifyCode.length !== 6}
                style={{ flexShrink: 0 }}
              >
                {isLoading ? <span className="loading-spinner" /> : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}

        {setupStep === 'done' && status?.enabled && (
          <div className="alert alert-success">
            MFA is now active on your account!
          </div>
        )}

        {status?.enabled && setupStep === 'idle' && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setShowRegen(true); setShowDisable(false); }}
            >
              Regenerate backup codes
            </button>
            <button
              className="btn btn-danger btn-sm"
              onClick={() => { setShowDisable(true); setShowRegen(false); }}
            >
              Disable MFA
            </button>
          </div>
        )}
      </div>

      {showDisable && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Disable MFA
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Enter your current TOTP code to confirm.{' '}
            <code style={{ color: 'var(--accent)' }}>disableMfa(code)</code>
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={disableCode}
                onChange={e => setDisableCode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.15em' }}
              />
            </div>
            <button
              className="btn btn-danger"
              onClick={handleDisable}
              disabled={isLoading || disableCode.length !== 6}
            >
              {isLoading ? <span className="loading-spinner" /> : 'Disable'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setShowDisable(false); setDisableCode(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showRegen && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Regenerate Backup Codes
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
            Enter your TOTP code to generate new backup codes.{' '}
            <code style={{ color: 'var(--accent)' }}>regenerateBackupCodes(code)</code>
          </p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={regenCode}
                onChange={e => setRegenCode(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '0.15em' }}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleRegenerate}
              disabled={isLoading || regenCode.length !== 6}
            >
              {isLoading ? <span className="loading-spinner" /> : 'Regenerate'}
            </button>
            <button className="btn btn-secondary" onClick={() => { setShowRegen(false); setRegenCode(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {newBackupCodes && (
        <div className="card">
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            New Backup Codes
          </div>
          <div className="alert alert-warning" style={{ marginBottom: 12, fontSize: 12 }}>
            Previous backup codes have been invalidated. Save these new codes safely.
          </div>
          <div className="backup-codes-grid">
            {newBackupCodes.map(code => (
              <div key={code} className="backup-code">{code}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
