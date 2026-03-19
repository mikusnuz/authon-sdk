'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuthonSessions } from '@authon/nextjs'
import type { SessionInfo } from '@authon/shared'
import ProtectedPage from '../../components/ProtectedPage'

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseUserAgent(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera'
  return 'Unknown browser'
}

function getDeviceIcon(ua: string): string {
  if (ua.toLowerCase().includes('mobile') || ua.toLowerCase().includes('android') || ua.toLowerCase().includes('iphone')) {
    return '📱'
  }
  if (ua.toLowerCase().includes('tablet') || ua.toLowerCase().includes('ipad')) {
    return '📟'
  }
  return '💻'
}

export default function SessionsPage() {
  return (
    <ProtectedPage>
      <SessionsContent />
    </ProtectedPage>
  )
}

function SessionsContent() {
  const { listSessions, revokeSession, isLoading, error } = useAuthonSessions()
  const [sessions, setSessions] = useState<SessionInfo[]>([])
  const [fetching, setFetching] = useState(true)
  const [revoking, setRevoking] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  const load = useCallback(async () => {
    setFetching(true)
    const data = await listSessions()
    if (data) setSessions(data)
    setFetching(false)
  }, [listSessions])

  useEffect(() => {
    load()
  }, [load])

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId)
    setSuccessMsg('')
    const ok = await revokeSession(sessionId)
    if (ok) {
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      setSuccessMsg('Session revoked successfully.')
    }
    setRevoking(null)
  }

  if (fetching) {
    return (
      <div className="page-centered">
        <div className="loading-spinner-lg" />
      </div>
    )
  }

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)' }}>
            Active Sessions
          </h1>
          <button
            className="btn btn-secondary btn-sm"
            onClick={load}
            disabled={fetching || isLoading}
          >
            Refresh
          </button>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          Manage your active sessions using{' '}
          <code style={{ color: 'var(--accent)' }}>useAuthonSessions()</code>
          {' — '}
          <code style={{ color: 'var(--accent)' }}>listSessions()</code>,{' '}
          <code style={{ color: 'var(--accent)' }}>revokeSession(id)</code>
        </p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error.message}</div>}
      {successMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>{successMsg}</div>}

      <div className="card" style={{ marginBottom: 16, padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}
          </span>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>No active sessions found</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sessions.map((session, i) => (
            <SessionRow
              key={session.id}
              session={session}
              isCurrent={i === 0}
              revoking={revoking === session.id}
              onRevoke={() => handleRevoke(session.id)}
            />
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 24 }}>
        <div className="section-title">Security Tip</div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          If you notice any suspicious sessions, revoke them immediately and change your password.
          Sessions are automatically cleared after 30 days of inactivity.
        </p>
      </div>
    </div>
  )
}

interface SessionRowProps {
  session: SessionInfo
  isCurrent: boolean
  revoking: boolean
  onRevoke: () => void
}

function SessionRow({ session, isCurrent, revoking, onRevoke }: SessionRowProps) {
  const ua = session.userAgent ?? ''
  const browser = ua ? parseUserAgent(ua) : 'Unknown'
  const deviceIcon = ua ? getDeviceIcon(ua) : '💻'
  const shortUa = ua.length > 60 ? ua.slice(0, 60) + '…' : ua

  return (
    <div className="session-item">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: isCurrent ? 'var(--accent-light)' : 'rgba(100, 116, 139, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}>
          {deviceIcon}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
              {browser}
            </span>
            {isCurrent && (
              <span className="badge badge-success" style={{ fontSize: 11 }}>Current</span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shortUa || 'Unknown user agent'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', gap: 12 }}>
            {session.ipAddress && <span>IP: {session.ipAddress}</span>}
            {session.lastActiveAt && <span>Active {formatRelative(session.lastActiveAt)}</span>}
            {session.createdAt && <span>Signed in {formatDate(session.createdAt)}</span>}
          </div>
        </div>
      </div>

      {!isCurrent && (
        <button
          className="btn btn-danger btn-sm"
          onClick={onRevoke}
          disabled={revoking}
          style={{ flexShrink: 0 }}
        >
          {revoking ? <span className="loading-spinner" style={{ width: 14, height: 14 }} /> : 'Revoke'}
        </button>
      )}
    </div>
  )
}
