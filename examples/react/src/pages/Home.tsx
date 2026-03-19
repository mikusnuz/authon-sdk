import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, Protect, useUser } from '@authon/react'

const FEATURES = [
  {
    icon: '🔐',
    title: 'Email & Password Auth',
    desc: 'Full sign-in / sign-up flow with validation and error handling.',
  },
  {
    icon: '🌐',
    title: 'Social Login (10 providers)',
    desc: 'Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft.',
  },
  {
    icon: '🛡️',
    title: 'Built-in Components',
    desc: '<SignIn />, <SignUp />, <UserButton />, <UserProfile /> — drop-in ready.',
  },
  {
    icon: '🔑',
    title: 'Two-Factor Auth (MFA)',
    desc: 'TOTP authenticator app setup with QR code and backup codes.',
  },
  {
    icon: '📱',
    title: 'Session Management',
    desc: 'List all active sessions across devices, revoke any session.',
  },
  {
    icon: '👤',
    title: 'Profile Management',
    desc: 'Update display name, avatar URL, phone number via updateProfile().',
  },
  {
    icon: '🚦',
    title: 'Conditional Rendering',
    desc: '<SignedIn>, <SignedOut>, <Protect> — render UI based on auth state.',
  },
  {
    icon: '🪝',
    title: 'React Hooks',
    desc: 'useAuthon(), useUser(), useAuthonMfa(), useAuthonSessions().',
  },
]

export default function Home() {
  const { user } = useUser()

  return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: '60px 0 48px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          borderRadius: 99,
          background: 'var(--accent-light)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          fontSize: 13,
          color: 'var(--accent)',
          fontWeight: 600,
          marginBottom: 24,
        }}>
          <span>v0.3.0</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>Reference Implementation</span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: 20,
          background: 'linear-gradient(135deg, #f1f5f9 0%, #94a3b8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Authon React SDK
          <br />Example App
        </h1>

        <p style={{
          fontSize: 18,
          color: 'var(--text-secondary)',
          maxWidth: 560,
          margin: '0 auto 40px',
          lineHeight: 1.6,
        }}>
          Complete authentication flow demo using <code style={{ color: 'var(--accent)', background: 'var(--accent-light)', padding: '2px 8px', borderRadius: 5, fontSize: 15 }}>@authon/react</code>.
          Every feature of the SDK — demonstrated and ready to copy.
        </p>

        <SignedOut>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              to="/sign-in"
              className="btn btn-primary"
              style={{ fontSize: 15, padding: '12px 28px', borderRadius: 10 }}
            >
              Sign in
            </Link>
            <Link
              to="/sign-up"
              className="btn btn-secondary"
              style={{ fontSize: 15, padding: '12px 28px', borderRadius: 10 }}
            >
              Create account
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            padding: '14px 24px',
            borderRadius: 12,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            marginBottom: 20,
          }}>
            <div className="avatar">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" />
              ) : (
                (user?.displayName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()
              )}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Welcome back, {user?.displayName ?? user?.email?.split('@')[0]}!
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</div>
            </div>
          </div>
          <br />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/profile" className="btn btn-primary" style={{ fontSize: 15, padding: '12px 28px', borderRadius: 10 }}>
              View Profile
            </Link>
            <Link to="/mfa" className="btn btn-secondary" style={{ fontSize: 15, padding: '12px 28px', borderRadius: 10 }}>
              MFA Setup
            </Link>
            <Link to="/sessions" className="btn btn-secondary" style={{ fontSize: 15, padding: '12px 28px', borderRadius: 10 }}>
              Sessions
            </Link>
          </div>
        </SignedIn>

        <Protect
          condition={(u) => !!u?.emailVerified}
          fallback={
            <SignedIn>
              <p style={{ color: 'var(--warning)', fontSize: 13, marginTop: 16 }}>
                Your email is not verified.
              </p>
            </SignedIn>
          }
        >
          <SignedIn>
            <div style={{ marginTop: 16 }}>
              <span className="badge badge-success">Email verified</span>
            </div>
          </SignedIn>
        </Protect>
      </div>

      <div style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, textAlign: 'center' }}>
          Features Demonstrated
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Navigate to each page to see the feature in action
        </p>
        <div className="feature-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 48 }}>
        <div className="section-title">Quick Start</div>
        <pre style={{
          background: 'var(--bg-0)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '16px 20px',
          fontSize: 13,
          color: '#93c5fd',
          overflow: 'auto',
          lineHeight: 1.7,
          fontFamily: "'Courier New', monospace",
        }}>
{`import { AuthonProvider, SignIn, useAuthon } from '@authon/react'

function App() {
  return (
    <AuthonProvider publishableKey="your-project-id">
      <SignIn onSignIn={() => console.log('signed in!')} />
    </AuthonProvider>
  )
}`}
        </pre>
      </div>
    </div>
  )
}
