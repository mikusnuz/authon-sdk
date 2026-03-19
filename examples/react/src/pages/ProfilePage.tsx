import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser, useAuthon, UserProfile } from '@authon/react'

type View = 'builtin' | 'custom'

export default function ProfilePage() {
  const [view, setView] = useState<View>('builtin')

  return (
    <div className="page">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
          View and edit your account details
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
        <div className="toggle-bar">
          <button
            className={`toggle-btn${view === 'builtin' ? ' active' : ''}`}
            onClick={() => setView('builtin')}
          >
            Built-in UserProfile
          </button>
          <button
            className={`toggle-btn${view === 'custom' ? ' active' : ''}`}
            onClick={() => setView('custom')}
          >
            Custom UI
          </button>
        </div>
      </div>

      {view === 'builtin' ? <BuiltinProfile /> : <CustomProfile />}
    </div>
  )
}

function BuiltinProfile() {
  return (
    <div>
      <div className="card" style={{ marginBottom: 20, padding: '12px 16px', display: 'inline-block' }}>
        <code style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {'<UserProfile />'}
        </code>
      </div>
      <UserProfile />
    </div>
  )
}

function CustomProfile() {
  const { user } = useUser()
  const { client } = useAuthon()

  const [displayName, setDisplayName] = useState(user?.displayName ?? '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '?').toUpperCase()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!client) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await client.updateProfile({
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        phone: phone || undefined,
      })
      setSuccess('Profile updated successfully')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
      <div>
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="section-title">Account Info</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div className={`avatar avatar-lg`}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" />
              ) : (
                initials
              )}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>
                {user?.displayName ?? 'No display name'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</div>
              <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {user?.emailVerified ? (
                  <span className="badge badge-success">Email verified</span>
                ) : (
                  <span className="badge badge-muted">Not verified</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow label="User ID" value={user?.id ?? '-'} mono />
            <InfoRow label="Email" value={user?.email ?? '-'} />
            {user?.phone && <InfoRow label="Phone" value={user.phone} />}
            {joinDate && <InfoRow label="Joined" value={joinDate} />}
          </div>
        </div>

        <div className="card">
          <div className="section-title">Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/mfa" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }}>
              <span>🔑</span>
              <span>Two-Factor Authentication</span>
            </Link>
            <Link to="/sessions" className="btn btn-secondary" style={{ justifyContent: 'flex-start', gap: 10 }}>
              <span>📱</span>
              <span>Active Sessions</span>
            </Link>
            <Link to="/delete-account" className="btn btn-danger" style={{ justifyContent: 'flex-start', gap: 10 }}>
              <span>⚠️</span>
              <span>Delete Account</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Edit Profile</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
          <code style={{ color: 'var(--accent)' }}>client.updateProfile(&#123; displayName, avatarUrl, phone &#125;)</code>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="displayName">Display Name</label>
            <input
              id="displayName"
              className="form-input"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email-display">Email</label>
            <input
              id="email-display"
              className="form-input"
              type="email"
              value={user?.email ?? ''}
              disabled
            />
            <span className="form-error" style={{ color: 'var(--text-tertiary)' }}>
              Email cannot be changed
            </span>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="avatarUrl">Avatar URL</label>
            <input
              id="avatarUrl"
              className="form-input"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              value={avatarUrl}
              onChange={e => setAvatarUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              className="form-input"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ alignSelf: 'flex-start', minWidth: 140 }}>
            {loading ? <span className="loading-spinner" /> : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

interface InfoRowProps {
  label: string
  value: string
  mono?: boolean
}

function InfoRow({ label, value, mono }: InfoRowProps) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
      <span style={{ fontSize: 13, color: 'var(--text-tertiary)', minWidth: 70 }}>{label}</span>
      <span style={{
        fontSize: 13,
        color: 'var(--text-secondary)',
        fontFamily: mono ? "'Courier New', monospace" : 'inherit',
        wordBreak: 'break-all',
      }}>
        {value}
      </span>
    </div>
  )
}
