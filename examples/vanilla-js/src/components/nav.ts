import type { Authon } from '@authon/js'

export function renderNav(authon: Authon): string {
  const user = authon.getUser()

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? '').toUpperCase()

  const authLinks = user
    ? `
      <a href="#profile" style="padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:var(--text-secondary);transition:color 0.15s;">Profile</a>
      <a href="#mfa" style="padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:var(--text-secondary);transition:color 0.15s;">MFA</a>
      <a href="#sessions" style="padding:6px 14px;border-radius:7px;font-size:13px;font-weight:500;color:var(--text-secondary);transition:color 0.15s;">Sessions</a>
      <div class="avatar" style="width:36px;height:36px;font-size:15px;cursor:pointer;" onclick="window.location.hash='profile'">
        ${user.avatarUrl ? `<img src="${user.avatarUrl}" alt="avatar" />` : initials || '?'}
      </div>
      <button id="nav-signout-btn" class="btn btn-secondary btn-sm">Sign out</button>
    `
    : `
      <a href="#sign-in" style="padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;color:var(--text-secondary);border:1px solid var(--border);">Sign in</a>
      <a href="#sign-up" style="padding:7px 16px;border-radius:8px;font-size:13px;font-weight:600;color:#fff;background:var(--accent);">Sign up</a>
    `

  return `
    <nav style="height:64px;background:rgba(10,15,30,0.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;padding:0 24px;position:sticky;top:0;z-index:100;">
      <div style="max-width:1100px;margin:0 auto;width:100%;display:flex;align-items:center;justify-content:space-between;">
        <a href="#" style="display:flex;align-items:center;gap:10px;text-decoration:none;">
          <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#7c3aed,#4f46e5);display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;font-weight:800;">A</div>
          <span style="font-weight:700;font-size:16px;color:var(--text-primary);">Authon<span style="color:var(--accent);margin-left:4px;font-size:13px;font-weight:500;">Vanilla JS</span></span>
        </a>
        <div style="display:flex;align-items:center;gap:8px;">
          ${authLinks}
        </div>
      </div>
    </nav>
  `
}

export function attachNavEvents(authon: Authon) {
  const btn = document.getElementById('nav-signout-btn')
  if (btn) {
    btn.addEventListener('click', async () => {
      await authon.signOut()
      window.location.hash = ''
    })
  }
}
