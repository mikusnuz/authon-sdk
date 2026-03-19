import type { Authon } from '@authon/js'

const CONFIRMATION_TEXT = 'DELETE'

export function renderDeleteAccount(authon: Authon, container: HTMLElement) {
  if (!authon.getUser()) { window.location.hash = 'sign-in'; return }

  container.innerHTML = `
    <div class="page-centered">
      <div style="width:100%;max-width:480px;">
        <div class="card">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:56px;height:56px;border-radius:50%;background:var(--danger-bg);border:1px solid rgba(239,68,68,0.3);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:24px;">
              ⚠️
            </div>
            <h1 style="font-size:22px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Delete Account</h1>
            <p style="color:var(--text-secondary);font-size:14px;line-height:1.6;">
              This action is <strong style="color:var(--danger);">permanent and irreversible</strong>.
              All your data will be deleted immediately.
            </p>
          </div>

          <div class="alert alert-error" style="margin-bottom:24px;">
            <div style="font-weight:600;margin-bottom:6px;">This will permanently delete:</div>
            <ul style="padding-left:18px;display:flex;flex-direction:column;gap:4px;margin-top:4px;">
              <li>Your account and personal information</li>
              <li>All active sessions</li>
              <li>MFA configuration and backup codes</li>
              <li>Any linked social accounts</li>
            </ul>
          </div>

          <div id="delete-error" class="alert alert-error" style="margin-bottom:16px;display:none;"></div>

          <div class="form-group" style="margin-bottom:20px;">
            <label class="form-label" for="delete-confirm">
              Type <strong style="color:var(--danger);font-family:'Courier New',monospace;">DELETE</strong> to confirm
            </label>
            <input
              id="delete-confirm"
              class="form-input"
              type="text"
              placeholder="DELETE"
              style="text-align:center;font-family:'Courier New',monospace;letter-spacing:0.1em;font-size:16px;"
            />
          </div>

          <button id="delete-submit" class="btn btn-danger btn-full" disabled style="margin-bottom:12px;opacity:0.4;">
            Permanently delete my account
          </button>
          <a href="#profile" class="btn btn-secondary btn-full">Cancel — Keep my account</a>
        </div>
      </div>
    </div>
  `

  const confirmInput = container.querySelector<HTMLInputElement>('#delete-confirm')!
  const submitBtn = container.querySelector<HTMLButtonElement>('#delete-submit')!
  const errorEl = container.querySelector<HTMLElement>('#delete-error')!

  confirmInput.addEventListener('input', () => {
    const confirmed = confirmInput.value === CONFIRMATION_TEXT
    submitBtn.disabled = !confirmed
    submitBtn.style.opacity = confirmed ? '1' : '0.4'
    if (confirmed) {
      submitBtn.style.borderColor = 'var(--danger)'
    }
  })

  submitBtn.addEventListener('click', async () => {
    if (confirmInput.value !== CONFIRMATION_TEXT) return
    errorEl.style.display = 'none'
    submitBtn.disabled = true
    submitBtn.innerHTML = '<span class="loading-spinner"></span>'
    try {
      await authon.signOut()
      window.location.hash = ''
    } catch (err) {
      errorEl.textContent = err instanceof Error ? err.message : 'Failed to delete account'
      errorEl.style.display = 'block'
      submitBtn.disabled = false
      submitBtn.textContent = 'Permanently delete my account'
    }
  })
}
