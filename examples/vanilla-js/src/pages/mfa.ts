import type { Authon } from '@authon/js'
import type { MfaStatus } from '@authon/shared'

type SetupStep = 'idle' | 'qr' | 'verify' | 'done'

export function renderMfa(authon: Authon, container: HTMLElement) {
  if (!authon.getUser()) { window.location.hash = 'sign-in'; return }

  container.innerHTML = `
    <div class="page-centered">
      <div class="loading-spinner-lg"></div>
    </div>
  `

  let status: MfaStatus | null = null
  let setupStep: SetupStep = 'idle'
  let qrData: { secret: string; qrCodeSvg: string; backupCodes: string[] } | null = null
  let newBackupCodes: string[] | null = null
  let errorMsg = ''
  let successMsg = ''
  let showDisable = false
  let showRegen = false

  const render = () => {
    container.innerHTML = `
      <div class="page" style="max-width:640px;">
        <div style="margin-bottom:24px;">
          <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);margin-bottom:8px;">Two-Factor Authentication</h1>
          <p style="color:var(--text-secondary);font-size:14px;">
            Add an extra layer of security using <code style="color:var(--accent);">authon.setupMfa()</code>
          </p>
        </div>

        ${errorMsg ? `<div class="alert alert-error" style="margin-bottom:16px;">${errorMsg}</div>` : ''}
        ${successMsg ? `<div class="alert alert-success" style="margin-bottom:16px;">${successMsg}</div>` : ''}

        <div class="card" style="margin-bottom:20px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
            <div>
              <div style="font-size:16px;font-weight:600;color:var(--text-primary);">Authenticator App</div>
              <div style="font-size:13px;color:var(--text-secondary);margin-top:2px;">
                ${status?.enabled
                  ? `Active — ${status.backupCodesRemaining} backup codes remaining`
                  : 'Not configured'
                }
              </div>
            </div>
            <span class="badge ${status?.enabled ? 'badge-success' : 'badge-muted'}">
              <span style="width:6px;height:6px;border-radius:50%;background:${status?.enabled ? 'var(--success)' : 'var(--text-tertiary)'};display:inline-block;"></span>
              ${status?.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          ${renderSetupStep()}

          ${status?.enabled && setupStep === 'idle' ? `
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button id="btn-regen" class="btn btn-secondary btn-sm">Regenerate backup codes</button>
              <button id="btn-disable" class="btn btn-danger btn-sm">Disable MFA</button>
            </div>
          ` : ''}
        </div>

        ${showDisable ? renderDisableSection() : ''}
        ${showRegen ? renderRegenSection() : ''}
        ${newBackupCodes ? renderNewBackupCodes() : ''}
      </div>
    `

    attachEvents()
  }

  const renderSetupStep = (): string => {
    if (!status?.enabled && setupStep === 'idle') {
      return `<button id="btn-setup" class="btn btn-primary">Set up authenticator app</button>`
    }

    if (setupStep === 'qr' && qrData) {
      const backupCodesHtml = qrData.backupCodes.length > 0 ? `
        <div style="margin-bottom:20px;">
          <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">Backup Codes — Save these now</div>
          <div class="alert alert-warning" style="margin-bottom:12px;font-size:12px;">Store backup codes safely. Each code can only be used once.</div>
          <div class="backup-codes-grid">${qrData.backupCodes.map(c => `<div class="backup-code">${c}</div>`).join('')}</div>
        </div>
      ` : ''

      return `
        <div class="alert alert-warning" style="margin-bottom:20px;">Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</div>
        <div class="qr-container" style="margin-bottom:20px;">
          ${qrData.qrCodeSvg}
          <div style="font-size:13px;color:var(--text-secondary);text-align:center;">
            Or enter manually:
            <div style="font-family:'Courier New',monospace;font-size:14px;color:var(--text-primary);margin-top:6px;word-break:break-all;padding:8px 12px;background:var(--bg-card);border-radius:6px;border:1px solid var(--border);">
              ${qrData.secret}
            </div>
          </div>
        </div>
        ${backupCodesHtml}
        <button id="btn-next" class="btn btn-secondary btn-full" style="margin-bottom:12px;">I've scanned the QR code — Next</button>
      `
    }

    if (setupStep === 'verify') {
      return `
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">Enter the 6-digit code from your authenticator app</div>
        <div style="display:flex;gap:10px;align-items:flex-end;">
          <div class="form-group" style="flex:1;">
            <input id="mfa-verify-code" class="form-input" type="text" inputmode="numeric" maxlength="6" placeholder="000000" autofocus style="text-align:center;font-size:20px;letter-spacing:0.2em;" />
          </div>
          <button id="btn-verify-setup" class="btn btn-primary" disabled style="flex-shrink:0;">Verify & Enable</button>
        </div>
      `
    }

    if (setupStep === 'done' && status?.enabled) {
      return `<div class="alert alert-success">MFA is now active on your account!</div>`
    }

    return ''
  }

  const renderDisableSection = () => `
    <div class="card" style="margin-bottom:20px;">
      <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">Disable MFA</div>
      <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">
        Enter your current TOTP code to confirm. <code style="color:var(--accent);">authon.disableMfa(code)</code>
      </p>
      <div style="display:flex;gap:10px;align-items:flex-end;">
        <div class="form-group" style="flex:1;">
          <input id="disable-code" class="form-input" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="text-align:center;letter-spacing:0.15em;" />
        </div>
        <button id="btn-confirm-disable" class="btn btn-danger" disabled>Disable</button>
        <button id="btn-cancel-disable" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  `

  const renderRegenSection = () => `
    <div class="card" style="margin-bottom:20px;">
      <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:12px;">Regenerate Backup Codes</div>
      <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px;">
        Enter your TOTP code to generate new backup codes. <code style="color:var(--accent);">authon.regenerateBackupCodes(code)</code>
      </p>
      <div style="display:flex;gap:10px;align-items:flex-end;">
        <div class="form-group" style="flex:1;">
          <input id="regen-code" class="form-input" type="text" inputmode="numeric" maxlength="6" placeholder="000000" style="text-align:center;letter-spacing:0.15em;" />
        </div>
        <button id="btn-confirm-regen" class="btn btn-primary" disabled>Regenerate</button>
        <button id="btn-cancel-regen" class="btn btn-secondary">Cancel</button>
      </div>
    </div>
  `

  const renderNewBackupCodes = () => `
    <div class="card">
      <div style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">New Backup Codes</div>
      <div class="alert alert-warning" style="margin-bottom:12px;font-size:12px;">Previous backup codes have been invalidated. Save these new codes safely.</div>
      <div class="backup-codes-grid">${newBackupCodes!.map(c => `<div class="backup-code">${c}</div>`).join('')}</div>
    </div>
  `

  const setError = (msg: string) => { errorMsg = msg; successMsg = ''; render() }
  const setSuccess = (msg: string) => { successMsg = msg; errorMsg = ''; render() }

  const attachEvents = () => {
    container.querySelector('#btn-setup')?.addEventListener('click', async () => {
      errorMsg = ''; successMsg = ''
      try {
        const data = await authon.setupMfa()
        qrData = { secret: data.secret, qrCodeSvg: data.qrCodeSvg, backupCodes: data.backupCodes }
        setupStep = 'qr'
        render()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to start MFA setup')
      }
    })

    container.querySelector('#btn-next')?.addEventListener('click', () => {
      setupStep = 'verify'
      render()
    })

    const verifyCodeInput = container.querySelector<HTMLInputElement>('#mfa-verify-code')
    const verifyBtn = container.querySelector<HTMLButtonElement>('#btn-verify-setup')
    verifyCodeInput?.addEventListener('input', () => {
      if (verifyBtn) verifyBtn.disabled = verifyCodeInput.value.length !== 6
    })

    container.querySelector('#btn-verify-setup')?.addEventListener('click', async () => {
      const code = (container.querySelector<HTMLInputElement>('#mfa-verify-code'))?.value ?? ''
      if (verifyBtn) { verifyBtn.disabled = true; verifyBtn.innerHTML = '<span class="loading-spinner"></span>' }
      try {
        await authon.verifyMfaSetup(code)
        status = await authon.getMfaStatus()
        setupStep = 'done'
        setSuccess('MFA enabled successfully!')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid code. Please try again.')
      }
    })

    container.querySelector('#btn-disable')?.addEventListener('click', () => {
      showDisable = true; showRegen = false; render()
    })
    container.querySelector('#btn-regen')?.addEventListener('click', () => {
      showRegen = true; showDisable = false; render()
    })

    const disableCodeInput = container.querySelector<HTMLInputElement>('#disable-code')
    const disableBtn = container.querySelector<HTMLButtonElement>('#btn-confirm-disable')
    disableCodeInput?.addEventListener('input', () => {
      if (disableBtn) disableBtn.disabled = disableCodeInput.value.length !== 6
    })
    container.querySelector('#btn-confirm-disable')?.addEventListener('click', async () => {
      const code = disableCodeInput?.value ?? ''
      if (disableBtn) { disableBtn.disabled = true; disableBtn.innerHTML = '<span class="loading-spinner"></span>' }
      try {
        await authon.disableMfa(code)
        status = await authon.getMfaStatus()
        showDisable = false
        setSuccess('MFA has been disabled.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Invalid code')
      }
    })
    container.querySelector('#btn-cancel-disable')?.addEventListener('click', () => {
      showDisable = false; render()
    })

    const regenCodeInput = container.querySelector<HTMLInputElement>('#regen-code')
    const regenBtn = container.querySelector<HTMLButtonElement>('#btn-confirm-regen')
    regenCodeInput?.addEventListener('input', () => {
      if (regenBtn) regenBtn.disabled = regenCodeInput.value.length !== 6
    })
    container.querySelector('#btn-confirm-regen')?.addEventListener('click', async () => {
      const code = regenCodeInput?.value ?? ''
      if (regenBtn) { regenBtn.disabled = true; regenBtn.innerHTML = '<span class="loading-spinner"></span>' }
      try {
        newBackupCodes = await authon.regenerateBackupCodes(code)
        showRegen = false
        setSuccess('Backup codes regenerated.')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to regenerate backup codes')
      }
    })
    container.querySelector('#btn-cancel-regen')?.addEventListener('click', () => {
      showRegen = false; render()
    })
  }

  authon.getMfaStatus()
    .then((s) => { status = s; render() })
    .catch(() => { render() })
}
