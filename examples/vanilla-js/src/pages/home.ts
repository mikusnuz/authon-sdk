import type { Authon } from '@authon/js'

const FEATURES = [
  {
    icon: '🔐',
    title: 'Email & Password Auth',
    desc: 'Full sign-in / sign-up flow with validation and error handling.',
    hash: 'sign-in',
  },
  {
    icon: '🌐',
    title: 'Social Login (10 providers)',
    desc: 'Google, Apple, Kakao, Naver, Facebook, GitHub, Discord, X, LINE, Microsoft.',
    hash: 'sign-in',
  },
  {
    icon: '🔑',
    title: 'Built-in Modal',
    desc: 'authon.openSignIn() / openSignUp() — drop-in modal without custom UI.',
    hash: '',
  },
  {
    icon: '🛡️',
    title: 'Two-Factor Auth (MFA)',
    desc: 'TOTP authenticator app setup with QR code and backup codes.',
    hash: 'mfa',
  },
  {
    icon: '📱',
    title: 'Session Management',
    desc: 'List all active sessions across devices, revoke any session.',
    hash: 'sessions',
  },
  {
    icon: '👤',
    title: 'Profile Management',
    desc: 'Update display name, avatar URL, phone number via updateProfile().',
    hash: 'profile',
  },
  {
    icon: '🔒',
    title: 'Password Reset',
    desc: 'Send magic link via sendMagicLink(email) for password recovery.',
    hash: 'reset-password',
  },
  {
    icon: '🗑️',
    title: 'Account Deletion',
    desc: 'Permanent account deletion with confirmation flow.',
    hash: 'delete-account',
  },
]

export function renderHome(authon: Authon, container: HTMLElement) {
  const user = authon.getUser()

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '').toUpperCase()

  const heroActions = user
    ? `
      <div style="display:inline-flex;align-items:center;gap:12px;padding:14px 24px;border-radius:12px;background:var(--bg-card);border:1px solid var(--border);margin-bottom:20px;">
        <div class="avatar">
          ${user.avatarUrl ? `<img src="${user.avatarUrl}" alt="avatar" />` : (initials || '?')}
        </div>
        <div style="text-align:left;">
          <div style="font-weight:600;color:var(--text-primary);">Welcome back, ${user.displayName ?? user.email?.split('@')[0]}!</div>
          <div style="font-size:13px;color:var(--text-secondary);">${user.email}</div>
        </div>
      </div>
      <br />
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
        <a href="#profile" class="btn btn-primary" style="font-size:15px;padding:12px 28px;border-radius:10px;">View Profile</a>
        <a href="#mfa" class="btn btn-secondary" style="font-size:15px;padding:12px 28px;border-radius:10px;">MFA Setup</a>
        <a href="#sessions" class="btn btn-secondary" style="font-size:15px;padding:12px 28px;border-radius:10px;">Sessions</a>
      </div>
      ${user.emailVerified
        ? `<div style="margin-top:16px;"><span class="badge badge-success">Email verified</span></div>`
        : `<p style="color:var(--warning);font-size:13px;margin-top:16px;">Your email is not verified.</p>`
      }
    `
    : `
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:16px;">
        <a href="#sign-in" class="btn btn-primary" style="font-size:15px;padding:12px 28px;border-radius:10px;">Sign in</a>
        <a href="#sign-up" class="btn btn-secondary" style="font-size:15px;padding:12px 28px;border-radius:10px;">Create account</a>
      </div>
      <button id="home-open-modal-btn" class="btn btn-secondary" style="font-size:13px;padding:8px 20px;">
        Quick Sign In (built-in modal)
      </button>
    `

  const featureCards = FEATURES.map((f) => `
    <a href="#${f.hash}" class="feature-card" style="text-decoration:none;">
      <div class="feature-icon">${f.icon}</div>
      <div class="feature-title">${f.title}</div>
      <div class="feature-desc">${f.desc}</div>
    </a>
  `).join('')

  container.innerHTML = `
    <div class="page">
      <div style="text-align:center;padding:60px 0 48px;">
        <div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:99px;background:var(--accent-light);border:1px solid rgba(124,58,237,0.3);font-size:13px;color:var(--accent);font-weight:600;margin-bottom:24px;">
          <span>v0.3.0</span>
          <span style="opacity:0.5;">|</span>
          <span>Vanilla JS Example</span>
        </div>

        <h1 style="font-size:clamp(32px,5vw,56px);font-weight:800;line-height:1.15;letter-spacing:-0.03em;margin-bottom:20px;background:linear-gradient(135deg,#f1f5f9 0%,#94a3b8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">
          Authon JS SDK<br />Vanilla Example
        </h1>

        <p style="font-size:18px;color:var(--text-secondary);max-width:560px;margin:0 auto 40px;line-height:1.6;">
          Complete authentication demo using
          <code style="color:var(--accent);background:var(--accent-light);padding:2px 8px;border-radius:5px;font-size:15px;">@authon/js</code>
          — raw SDK, no framework.
        </p>

        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;">
          ${heroActions}
        </div>
      </div>

      <div style="margin-bottom:48px;">
        <h2 style="font-size:22px;font-weight:700;color:var(--text-primary);margin-bottom:8px;text-align:center;">Features Demonstrated</h2>
        <p style="text-align:center;color:var(--text-secondary);font-size:14px;margin-bottom:28px;">Click a card to see the feature in action</p>
        <div class="feature-grid">
          ${featureCards}
        </div>
      </div>

      <div class="card" style="margin-bottom:48px;">
        <div class="section-title">Quick Start</div>
        <pre style="background:var(--bg-0);border:1px solid var(--border);border-radius:8px;padding:16px 20px;font-size:13px;color:#93c5fd;overflow:auto;line-height:1.7;font-family:'Courier New',monospace;">import { Authon } from '@authon/js'

const authon = new Authon('your-publishable-key', {
  apiUrl: 'https://api.authon.dev'
})

// Email sign-in
await authon.signInWithEmail(email, password)

// OAuth (popup or redirect)
await authon.signInWithOAuth('google')

// Built-in modal
await authon.openSignIn()

// Listen to events
authon.on('signedIn', (user) => console.log('Signed in:', user))
authon.on('signedOut', () => console.log('Signed out'))</pre>
      </div>
    </div>
  `

  const modalBtn = container.querySelector<HTMLButtonElement>('#home-open-modal-btn')
  if (modalBtn) {
    modalBtn.addEventListener('click', async () => {
      await authon.openSignIn()
    })
  }
}
