import type { Authon } from '@authon/js'
import { AuthonMfaRequiredError } from '@authon/js'
import { renderSocialButtons } from '../components/social-buttons'

type View = 'custom' | 'modal'

let currentView: View = 'custom'

function getToggleHtml(view: View): string {
  return `
    <div style="display:flex;justify-content:center;margin-bottom:28px;">
      <div style="display:flex;background:var(--bg-0);border:1px solid var(--border);border-radius:10px;padding:4px;gap:4px;">
        <button id="toggle-custom" style="padding:8px 18px;border-radius:7px;border:none;background:${view === 'custom' ? 'var(--accent)' : 'transparent'};color:${view === 'custom' ? '#fff' : 'var(--text-tertiary)'};font-size:13px;font-weight:${view === 'custom' ? '600' : '500'};cursor:pointer;transition:all 0.15s;">Custom Form</button>
        <button id="toggle-modal" style="padding:8px 18px;border-radius:7px;border:none;background:${view === 'modal' ? 'var(--accent)' : 'transparent'};color:${view === 'modal' ? '#fff' : 'var(--text-tertiary)'};font-size:13px;font-weight:${view === 'modal' ? '600' : '500'};cursor:pointer;transition:all 0.15s;">Built-in Modal</button>
      </div>
    </div>
  `
}

function renderCustomForm(): string {
  return `
    <div class="card">
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <span style="font-size:12px;font-weight:600;color:var(--accent-2);background:rgba(79,70,229,0.12);padding:2px 8px;border-radius:5px;">Custom</span>
          <code style="font-size:12px;color:var(--text-secondary);">authon.signInWithEmail(email, password)</code>
        </div>
      </div>

      <div id="signin-error" class="alert alert-error" style="margin-bottom:16px;display:none;"></div>

      <form id="signin-form" style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label" for="signin-email">Email</label>
          <input id="signin-email" class="form-input" type="email" placeholder="you@example.com" autocomplete="email" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="signin-password">Password</label>
          <input id="signin-password" class="form-input" type="password" placeholder="••••••••" autocomplete="current-password" required />
          <div style="display:flex;justify-content:flex-end;margin-top:4px;">
            <a href="#reset-password" style="font-size:13px;color:var(--accent);">Forgot password?</a>
          </div>
        </div>
        <button type="submit" id="signin-submit" class="btn btn-primary btn-full">Sign in</button>
      </form>

      <div style="display:flex;align-items:center;gap:12px;margin:20px 0;">
        <div class="divider" style="flex:1;"></div>
        <span style="color:var(--text-tertiary);font-size:13px;">or continue with</span>
        <div class="divider" style="flex:1;"></div>
      </div>

      <div id="social-buttons-container"></div>

      <div style="margin-top:20px;text-align:center;font-size:14px;color:var(--text-secondary);">
        Don't have an account? <a href="#sign-up" style="color:var(--accent);font-weight:600;">Sign up</a>
      </div>
    </div>
  `
}

function renderMfaForm(): string {
  return `
    <div class="card">
      <div style="text-align:center;margin-bottom:24px;">
        <div style="font-size:32px;margin-bottom:12px;">🔑</div>
        <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Two-Factor Authentication</h2>
        <p style="color:var(--text-secondary);font-size:14px;">Enter the 6-digit code from your authenticator app</p>
      </div>

      <div id="mfa-error" class="alert alert-error" style="margin-bottom:16px;display:none;"></div>

      <form id="mfa-form" style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label">Verification Code</label>
          <input id="mfa-code" class="form-input" type="text" inputmode="numeric" maxlength="6" placeholder="000000" autofocus style="text-align:center;font-size:24px;letter-spacing:0.2em;" />
        </div>
        <button type="submit" id="mfa-submit" class="btn btn-primary btn-full" disabled>Verify</button>
        <button type="button" id="mfa-back" class="btn btn-secondary btn-full">Back</button>
      </form>
    </div>
  `
}

function renderModalView(authon: Authon, container: HTMLElement) {
  const inner = container.querySelector<HTMLElement>('#signin-content')!
  inner.innerHTML = `
    <div class="card" style="text-align:center;padding:40px;">
      <div style="font-size:40px;margin-bottom:16px;">🔐</div>
      <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Built-in Sign In Modal</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:28px;line-height:1.6;">
        Call <code style="color:var(--accent);">authon.openSignIn()</code> to open the<br/>built-in authentication modal.
      </p>
      <button id="open-signin-modal" class="btn btn-primary" style="font-size:15px;padding:12px 28px;border-radius:10px;margin-bottom:12px;">
        Open Sign In Modal
      </button>
      <br />
      <button id="open-signup-modal" class="btn btn-secondary" style="font-size:15px;padding:12px 28px;border-radius:10px;margin-top:8px;">
        Open Sign Up Modal
      </button>
    </div>
  `

  container.querySelector('#open-signin-modal')?.addEventListener('click', async () => {
    await authon.openSignIn()
  })
  container.querySelector('#open-signup-modal')?.addEventListener('click', async () => {
    await authon.openSignUp()
  })
}

export function renderSignIn(authon: Authon, container: HTMLElement) {
  container.innerHTML = `
    <div class="page-centered">
      <div style="width:100%;max-width:500px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Sign In Demo</h1>
          <p style="color:var(--text-secondary);font-size:14px;">Two approaches — toggle to compare</p>
        </div>
        ${getToggleHtml(currentView)}
        <div id="signin-content"></div>
      </div>
    </div>
  `

  const renderContent = () => {
    const content = container.querySelector<HTMLElement>('#signin-content')!
    if (currentView === 'modal') {
      renderModalView(authon, container)
      return
    }
    content.innerHTML = renderCustomForm()
    attachCustomFormEvents(authon, container)
  }

  renderContent()

  container.querySelector('#toggle-custom')?.addEventListener('click', () => {
    currentView = 'custom'
    const toggleSection = container.querySelector('[style*="margin-bottom:28px"]')
    if (toggleSection) toggleSection.outerHTML = getToggleHtml('custom')
    const newToggleSection = container.querySelector('[style*="margin-bottom:28px"]')
    newToggleSection?.querySelector('#toggle-custom')?.addEventListener('click', () => {})
    renderContent()
    attachToggleListeners(authon, container)
  })
  container.querySelector('#toggle-modal')?.addEventListener('click', () => {
    currentView = 'modal'
    renderModalView(authon, container)
    attachToggleListeners(authon, container)
  })
}

function attachToggleListeners(authon: Authon, container: HTMLElement) {
  container.querySelector('#toggle-custom')?.addEventListener('click', () => {
    currentView = 'custom'
    const content = container.querySelector<HTMLElement>('#signin-content')!
    content.innerHTML = renderCustomForm()
    updateToggleStyles(container, 'custom')
    attachCustomFormEvents(authon, container)
  })
  container.querySelector('#toggle-modal')?.addEventListener('click', () => {
    currentView = 'modal'
    updateToggleStyles(container, 'modal')
    renderModalView(authon, container)
  })
}

function updateToggleStyles(container: HTMLElement, active: View) {
  const customBtn = container.querySelector<HTMLButtonElement>('#toggle-custom')
  const modalBtn = container.querySelector<HTMLButtonElement>('#toggle-modal')
  if (customBtn) {
    customBtn.style.background = active === 'custom' ? 'var(--accent)' : 'transparent'
    customBtn.style.color = active === 'custom' ? '#fff' : 'var(--text-tertiary)'
    customBtn.style.fontWeight = active === 'custom' ? '600' : '500'
  }
  if (modalBtn) {
    modalBtn.style.background = active === 'modal' ? 'var(--accent)' : 'transparent'
    modalBtn.style.color = active === 'modal' ? '#fff' : 'var(--text-tertiary)'
    modalBtn.style.fontWeight = active === 'modal' ? '600' : '500'
  }
}

function attachCustomFormEvents(authon: Authon, container: HTMLElement) {
  const socialContainer = container.querySelector<HTMLElement>('#social-buttons-container')
  if (socialContainer) renderSocialButtons(socialContainer, authon)

  let pendingMfaToken: string | null = null

  const showError = (id: string, msg: string) => {
    const el = container.querySelector<HTMLElement>(`#${id}`)
    if (el) { el.textContent = msg; el.style.display = 'block' }
  }
  const hideError = (id: string) => {
    const el = container.querySelector<HTMLElement>(`#${id}`)
    if (el) el.style.display = 'none'
  }
  const setLoading = (btnId: string, loading: boolean, label: string) => {
    const btn = container.querySelector<HTMLButtonElement>(`#${btnId}`)
    if (!btn) return
    btn.disabled = loading
    btn.innerHTML = loading ? '<span class="loading-spinner"></span>' : label
  }

  const form = container.querySelector<HTMLFormElement>('#signin-form')
  form?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const email = (container.querySelector<HTMLInputElement>('#signin-email'))!.value
    const password = (container.querySelector<HTMLInputElement>('#signin-password'))!.value
    hideError('signin-error')
    setLoading('signin-submit', true, 'Sign in')
    try {
      await authon.signInWithEmail(email, password)
      window.location.hash = ''
    } catch (err) {
      if (err instanceof AuthonMfaRequiredError) {
        pendingMfaToken = err.mfaToken
        const content = container.querySelector<HTMLElement>('#signin-content')!
        content.innerHTML = renderMfaForm()
        attachMfaFormEvents(authon, container, pendingMfaToken)
      } else {
        showError('signin-error', err instanceof Error ? err.message : 'Sign in failed')
        setLoading('signin-submit', false, 'Sign in')
      }
    }
  })
}

function attachMfaFormEvents(authon: Authon, container: HTMLElement, mfaToken: string) {
  const codeInput = container.querySelector<HTMLInputElement>('#mfa-code')
  const submitBtn = container.querySelector<HTMLButtonElement>('#mfa-submit')

  codeInput?.addEventListener('input', () => {
    if (submitBtn) submitBtn.disabled = (codeInput.value.length !== 6)
  })

  container.querySelector('#mfa-back')?.addEventListener('click', () => {
    const content = container.querySelector<HTMLElement>('#signin-content')!
    content.innerHTML = renderCustomForm()
    attachCustomFormEvents(authon, container)
  })

  const mfaForm = container.querySelector<HTMLFormElement>('#mfa-form')
  mfaForm?.addEventListener('submit', async (e) => {
    e.preventDefault()
    const code = codeInput?.value ?? ''
    const errorEl = container.querySelector<HTMLElement>('#mfa-error')

    if (errorEl) errorEl.style.display = 'none'
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<span class="loading-spinner"></span>' }

    try {
      await authon.verifyMfa(mfaToken, code)
      window.location.hash = ''
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = err instanceof Error ? err.message : 'MFA verification failed'
        errorEl.style.display = 'block'
      }
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Verify' }
    }
  })
}
