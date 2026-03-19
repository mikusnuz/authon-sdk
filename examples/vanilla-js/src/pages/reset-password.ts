import type { Authon } from '@authon/js'

type Step = 'email' | 'sent'

export function renderResetPassword(authon: Authon, container: HTMLElement) {
  let step: Step = 'email'
  let submittedEmail = ''

  const render = () => {
    container.innerHTML = `
      <div class="page-centered">
        <div style="width:100%;max-width:440px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:40px;margin-bottom:16px;">🔒</div>
            <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Reset Password</h1>
            <p style="color:var(--text-secondary);font-size:14px;max-width:340px;margin:0 auto;">
              ${step === 'email'
                ? "Enter your email and we'll send you a magic link to reset your password."
                : 'Check your inbox for the reset link.'
              }
            </p>
          </div>

          ${step === 'email' ? renderEmailStep() : renderSentStep(submittedEmail)}
        </div>
      </div>
    `

    if (step === 'email') {
      attachEmailStepEvents()
    } else {
      container.querySelector('#reset-try-again')?.addEventListener('click', () => {
        step = 'email'
        render()
      })
    }
  }

  const renderEmailStep = () => `
    <div class="card">
      <div style="font-size:12px;color:var(--text-tertiary);margin-bottom:16px;">
        <code style="color:var(--accent);">authon.sendMagicLink(email)</code>
      </div>

      <div id="reset-error" class="alert alert-error" style="margin-bottom:16px;display:none;"></div>

      <form id="reset-form" style="display:flex;flex-direction:column;gap:16px;">
        <div class="form-group">
          <label class="form-label" for="reset-email">Email address</label>
          <input id="reset-email" class="form-input" type="email" placeholder="you@example.com" autocomplete="email" autofocus required />
        </div>
        <button type="submit" id="reset-submit" class="btn btn-primary btn-full">Send reset link</button>
      </form>

      <div style="margin-top:20px;text-align:center;font-size:14px;">
        <a href="#sign-in" style="color:var(--text-secondary);">Back to sign in</a>
      </div>
    </div>
  `

  const renderSentStep = (email: string) => `
    <div class="card" style="text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">✉️</div>
      <h2 style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Check your email</h2>
      <p style="color:var(--text-secondary);font-size:14px;margin-bottom:24px;line-height:1.6;">
        We sent a magic link to <strong style="color:var(--text-primary);">${email}</strong>.
        Click the link to reset your password. The link expires in 15 minutes.
      </p>

      <div class="alert alert-warning" style="text-align:left;margin-bottom:20px;">
        <strong>Did not receive the email?</strong> Check your spam folder or try again.
      </div>

      <div style="display:flex;gap:10px;justify-content:center;">
        <button id="reset-try-again" class="btn btn-secondary">Try again</button>
        <a href="#sign-in" class="btn btn-primary">Back to sign in</a>
      </div>
    </div>
  `

  const attachEmailStepEvents = () => {
    container.querySelector<HTMLFormElement>('#reset-form')?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const email = (container.querySelector<HTMLInputElement>('#reset-email'))!.value
      const submitBtn = container.querySelector<HTMLButtonElement>('#reset-submit')!
      const errorEl = container.querySelector<HTMLElement>('#reset-error')!

      errorEl.style.display = 'none'
      submitBtn.disabled = true
      submitBtn.innerHTML = '<span class="loading-spinner"></span>'

      try {
        await authon.sendMagicLink(email)
        submittedEmail = email
        step = 'sent'
        render()
      } catch (err) {
        errorEl.textContent = err instanceof Error ? err.message : 'Failed to send reset email'
        errorEl.style.display = 'block'
        submitBtn.disabled = false
        submitBtn.textContent = 'Send reset link'
      }
    })
  }

  render()
}
