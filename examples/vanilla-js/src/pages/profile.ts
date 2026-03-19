import type { Authon } from '@authon/js'

export function renderProfile(authon: Authon, container: HTMLElement) {
  const user = authon.getUser()
  if (!user) { window.location.hash = 'sign-in'; return }

  const initials = user.displayName
    ? user.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user.email?.[0] ?? '?').toUpperCase()

  const joinDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  container.innerHTML = `
    <div class="page">
      <div style="margin-bottom:24px;">
        <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Profile</h1>
        <p style="color:var(--text-secondary);font-size:14px;">View and edit your account details</p>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start;" class="profile-grid">
        <div>
          <div class="card" style="margin-bottom:16px;">
            <div class="section-title">Account Info</div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
              <div class="avatar avatar-lg">
                ${user.avatarUrl ? `<img src="${user.avatarUrl}" alt="avatar" />` : initials}
              </div>
              <div>
                <div style="font-weight:700;font-size:18px;color:var(--text-primary);">${user.displayName ?? 'No display name'}</div>
                <div style="color:var(--text-secondary);font-size:14px;">${user.email}</div>
                <div style="margin-top:6px;display:flex;gap:6px;flex-wrap:wrap;">
                  ${user.emailVerified
                    ? '<span class="badge badge-success">Email verified</span>'
                    : '<span class="badge badge-muted">Not verified</span>'
                  }
                </div>
              </div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
              ${infoRow('User ID', user.id, true)}
              ${infoRow('Email', user.email ?? '-')}
              ${user.phone ? infoRow('Phone', user.phone) : ''}
              ${joinDate ? infoRow('Joined', joinDate) : ''}
            </div>
          </div>

          <div class="card">
            <div class="section-title">Quick Actions</div>
            <div style="display:flex;flex-direction:column;gap:8px;">
              <a href="#mfa" class="btn btn-secondary" style="justify-content:flex-start;gap:10px;">
                <span>🔑</span><span>Two-Factor Authentication</span>
              </a>
              <a href="#sessions" class="btn btn-secondary" style="justify-content:flex-start;gap:10px;">
                <span>📱</span><span>Active Sessions</span>
              </a>
              <a href="#delete-account" class="btn btn-danger" style="justify-content:flex-start;gap:10px;">
                <span>⚠️</span><span>Delete Account</span>
              </a>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Edit Profile</div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px;">
            <code style="color:var(--accent);">authon.updateProfile({ displayName, avatarUrl, phone })</code>
          </div>

          <div id="profile-error" class="alert alert-error" style="margin-bottom:16px;display:none;"></div>
          <div id="profile-success" class="alert alert-success" style="margin-bottom:16px;display:none;"></div>

          <form id="profile-form" style="display:flex;flex-direction:column;gap:16px;">
            <div class="form-group">
              <label class="form-label" for="profile-name">Display Name</label>
              <input id="profile-name" class="form-input" type="text" placeholder="Your name" value="${user.displayName ?? ''}" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" value="${user.email ?? ''}" disabled />
              <span class="form-error" style="color:var(--text-tertiary);">Email cannot be changed</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="profile-avatar">Avatar URL</label>
              <input id="profile-avatar" class="form-input" type="url" placeholder="https://example.com/avatar.jpg" value="${user.avatarUrl ?? ''}" />
            </div>
            <div class="form-group">
              <label class="form-label" for="profile-phone">Phone</label>
              <input id="profile-phone" class="form-input" type="tel" placeholder="+1 (555) 000-0000" value="${user.phone ?? ''}" />
            </div>
            <button type="submit" id="profile-submit" class="btn btn-primary" style="align-self:flex-start;min-width:140px;">Save changes</button>
          </form>
        </div>
      </div>
    </div>
  `

  container.querySelector<HTMLFormElement>('#profile-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const displayName = (container.querySelector<HTMLInputElement>('#profile-name'))!.value.trim()
    const avatarUrl = (container.querySelector<HTMLInputElement>('#profile-avatar'))!.value.trim()
    const phone = (container.querySelector<HTMLInputElement>('#profile-phone'))!.value.trim()
    const submitBtn = container.querySelector<HTMLButtonElement>('#profile-submit')!
    const errorEl = container.querySelector<HTMLElement>('#profile-error')!
    const successEl = container.querySelector<HTMLElement>('#profile-success')!

    errorEl.style.display = 'none'
    successEl.style.display = 'none'
    submitBtn.disabled = true
    submitBtn.innerHTML = '<span class="loading-spinner-accent"></span>'

    try {
      await authon.updateProfile({
        displayName: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
        phone: phone || undefined,
      })
      successEl.textContent = 'Profile updated successfully'
      successEl.style.display = 'block'
    } catch (err) {
      errorEl.textContent = err instanceof Error ? err.message : 'Failed to update profile'
      errorEl.style.display = 'block'
    } finally {
      submitBtn.disabled = false
      submitBtn.textContent = 'Save changes'
    }
  })
}

function infoRow(label: string, value: string, mono = false): string {
  return `
    <div class="info-row">
      <span class="info-row-label">${label}</span>
      <span class="info-row-value${mono ? ' info-row-value--mono' : ''}">${value}</span>
    </div>
  `
}
