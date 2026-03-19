import { Link } from 'react-router-dom'
import { useAuthon, SignedIn, SignedOut, UserButton } from '@authon/react'

export default function Home() {
  const { user, signOut } = useAuthon()

  return (
    <div className="page">
      <SignedOut>
        <div className="hero">
          <div className="badge">@authon/react SDK</div>
          <h1>Authon React Example</h1>
          <p className="subtitle">
            Drop-in authentication components. Branding, OAuth providers,
            and MFA all configured from your Authon dashboard.
          </p>
          <div className="btn-group">
            <Link to="/sign-in" className="btn btn-primary">Sign In</Link>
            <Link to="/sign-up" className="btn btn-outline">Create Account</Link>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
              <div>
                <div className="feature-title">Email + Password</div>
                <div className="feature-desc">Secure sign-in with validation</div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <div className="feature-title">OAuth Providers</div>
                <div className="feature-desc">Google, GitHub, and more</div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <div className="feature-title">Dashboard Branding</div>
                <div className="feature-desc">Logo, colors, fonts from dashboard</div>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <div>
                <div className="feature-title">MFA Support</div>
                <div className="feature-desc">TOTP authenticator app</div>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>

      <SignedIn>
        <div className="signed-in-layout">
          <div className="topbar">
            <div className="topbar-brand">Authon Example</div>
            <div className="topbar-right">
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
          <div className="welcome-content">
            <div className="welcome-card">
              <div className="welcome-avatar">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar" />
                ) : (
                  <span>
                    {user?.displayName
                      ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                      : (user?.email?.[0] ?? '?').toUpperCase()}
                  </span>
                )}
              </div>
              <h2>Welcome back, {user?.displayName || user?.email?.split('@')[0]}</h2>
              <p className="welcome-email">{user?.email}</p>
              <div className="info-grid">
                <div className="info-row">
                  <span className="info-label">User ID</span>
                  <span className="info-value mono">{user?.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email verified</span>
                  <span className={`info-badge ${user?.emailVerified ? 'badge-green' : 'badge-yellow'}`}>
                    {user?.emailVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                {user?.displayName && (
                  <div className="info-row">
                    <span className="info-label">Display name</span>
                    <span className="info-value">{user.displayName}</span>
                  </div>
                )}
              </div>
              <button className="btn btn-outline btn-sm" onClick={signOut}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </SignedIn>
    </div>
  )
}
