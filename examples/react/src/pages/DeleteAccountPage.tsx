import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthon } from '@authon/react'

const CONFIRMATION_TEXT = 'DELETE'

export default function DeleteAccountPage() {
  const navigate = useNavigate()
  const { client, signOut } = useAuthon()
  const [confirmInput, setConfirmInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isConfirmed = confirmInput === CONFIRMATION_TEXT

  const handleDelete = async () => {
    if (!client || !isConfirmed) return
    setLoading(true)
    setError('')
    try {
      await signOut()
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      setLoading(false)
    }
  }

  return (
    <div className="page-centered">
      <div style={{ width: '100%', maxWidth: 480 }}>
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 24,
            }}>
              ⚠️
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              Delete Account
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>
              This action is <strong style={{ color: 'var(--danger)' }}>permanent and irreversible</strong>.
              All your data will be deleted immediately.
            </p>
          </div>

          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>This will permanently delete:</div>
            <ul style={{ paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
              <li>Your account and personal information</li>
              <li>All active sessions</li>
              <li>MFA configuration and backup codes</li>
              <li>Any linked social accounts</li>
            </ul>
          </div>

          {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label className="form-label" htmlFor="confirm">
              Type <strong style={{ color: 'var(--danger)', fontFamily: "'Courier New', monospace" }}>DELETE</strong> to confirm
            </label>
            <input
              id="confirm"
              className="form-input"
              type="text"
              placeholder="DELETE"
              value={confirmInput}
              onChange={e => setConfirmInput(e.target.value)}
              style={{
                borderColor: isConfirmed ? 'var(--danger)' : undefined,
                textAlign: 'center',
                fontFamily: "'Courier New', monospace",
                letterSpacing: '0.1em',
                fontSize: 16,
              }}
            />
          </div>

          <button
            className="btn btn-danger btn-full"
            onClick={handleDelete}
            disabled={!isConfirmed || loading}
            style={{ marginBottom: 12, opacity: isConfirmed ? 1 : 0.4 }}
          >
            {loading ? <span className="loading-spinner" /> : 'Permanently delete my account'}
          </button>

          <Link to="/profile" className="btn btn-secondary btn-full">
            Cancel — Keep my account
          </Link>
        </div>
      </div>
    </div>
  )
}
