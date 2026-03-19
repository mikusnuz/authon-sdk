import type { Authon } from '@authon/js'
import { renderSocialButtons } from '../components/social-buttons'

export function renderSignUp(authon: Authon, container: HTMLElement) {
  container.innerHTML = `
    <div class="page-centered">
      <div style="width:100%;max-width:500px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Create Account</h1>
          <p style="color:var(--text-secondary);font-size:14px;">Sign up with email or social provider</p>
        </div>

        <div class="card">
          <div style="margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:12px;font-weight:600;color:var(--accent-2);background:rgba(79,70,229,0.12);padding:2px 8px;border-radius:5px;">Custom</span>
              <code style="font-size:12px;color:var(--text-secondary);">authon.signUpWithEmail(email, password, meta)</code>
            </div>
          </div>

          <div id="signup-error" class="alert alert-error" style="margin-bottom:16px;display:none;"></div>

          <form id="signup-form" style="display:flex;flex-direction:column;gap:16px;">
            <div class="form-group">
              <label class="form-label" for="signup-name">Display Name <span style="color:var(--text-tertiary);">(optional)</span></label>
              <input id="signup-name" class="form-input" type="text" placeholder="Your name" autocomplete="name" />
            </div>
            <div class="form-group">
              <label class="form-label" for="signup-email">Email</label>
              <input id="signup-email" class="form-input" type="email" placeholder="you@example.com" autocomplete="email" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="signup-password">Password</label>
              <input id="signup-password" class="form-input" type="password" placeholder="Minimum 8 characters" autocomplete="new-password" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="signup-confirm">Confirm Password</label>
              <input id="signup-confirm" class="form-input" type="password" placeholder="Repeat your password" autocomplete="new-password" required />
            </div>
            <button type="submit" id="signup-submit" class="btn btn-primary btn-full">Create account</button>
          </form>

          <div style="display:flex;align-items:center;gap:12px;margin:20px 0;">
            <div class="divider" style="flex:1;"></div>
            <span style="color:var(--text-tertiary);font-size:13px;">or sign up with</span>
            <div class="divider" style="flex:1;"></div>
          </div>

          <div id="social-buttons-container"></div>

          <div style="margin-top:20px;text-align:center;font-size:14px;color:var(--text-secondary);">
            Already have an account? <a href="#sign-in" style="color:var(--accent);font-weight:600;">Sign in</a>
          </div>
        </div>
      </div>
    </div>
  `

  const socialContainer = container.querySelector<HTMLElement>('#social-buttons-container')
  if (socialContainer) renderSocialButtons(socialContainer, authon)

  const showError = (msg: string) => {
    const el = container.querySelector<HTMLElement>('#signup-error')
    if (el) { el.textContent = msg; el.style.display = 'block' }
  }
  const hideError = () => {
    const el = container.querySelector<HTMLElement>('#signup-error')
    if (el) el.style.display = 'none'
  }

  container.querySelector<HTMLFormElement>('#signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const name = (container.querySelector<HTMLInputElement>('#signup-name'))!.value.trim()
    const email = (container.querySelector<HTMLInputElement>('#signup-email'))!.value
    const password = (container.querySelector<HTMLInputElement>('#signup-password'))!.value
    const confirm = (container.querySelector<HTMLInputElement>('#signup-confirm'))!.value
    const submitBtn = container.querySelector<HTMLButtonElement>('#signup-submit')!

    hideError()

    if (password !== confirm) { showError('Passwords do not match'); return }
    if (password.length < 8) { showError('Password must be at least 8 characters'); return }

    submitBtn.disabled = true
    submitBtn.innerHTML = '<span class="loading-spinner"></span>'

    try {
      await authon.signUpWithEmail(email, password, { displayName: name || undefined })
      window.location.hash = ''
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Sign up failed')
      submitBtn.disabled = false
      submitBtn.textContent = 'Create account'
    }
  })
}
