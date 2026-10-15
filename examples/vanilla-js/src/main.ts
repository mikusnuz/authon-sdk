import { Authon } from '@authon/js'
import type { EmbeddedWallet } from '@authon/js'
import type { AuthonUser } from '@authon/shared'
import { describeAuthonError } from './authonErrors'

const publishableKey = import.meta.env.VITE_AUTHON_PUBLISHABLE_KEY as string
const apiUrl = import.meta.env.VITE_AUTHON_API_URL as string | undefined

if (!publishableKey) {
  throw new Error('VITE_AUTHON_PUBLISHABLE_KEY is required. Copy .env.example to .env and add your publishable key.')
}

const authon = new Authon(publishableKey, {
  ...(apiUrl ? { apiUrl } : {}),
  // Create the embedded wallet in the background after sign-in (needs wallets turned on for the project).
  wallet: { autoCreate: true },
})

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

const signedOutEl = $('signed-out')
const signedInEl = $('signed-in')
const userNameEl = $('user-name')
const userEmailEl = $('user-email')
const userIdEl = $('user-id')
const userVerifiedEl = $('user-verified')
const userInitialsEl = $('user-initials')
const userAvatarEl = $('user-avatar')

$('signin-btn').onclick = () => authon.openSignIn()
$('signup-btn').onclick = () => authon.openSignUp()
$('signout-btn').onclick = () => authon.signOut()

function show(el: HTMLElement, visible: boolean) {
  el.style.display = visible ? '' : 'none'
}

function renderError(target: HTMLElement, err: unknown) {
  target.replaceChildren()
  if (!err) return
  const { code, message, hint } = describeAuthonError(err)
  const box = document.createElement('div')
  box.className = 'alert alert-error'
  box.setAttribute('role', 'alert')
  const codeEl = document.createElement('span')
  codeEl.className = 'alert-code'
  codeEl.textContent = code
  box.append(codeEl, message)
  if (hint) {
    const hintEl = document.createElement('span')
    hintEl.className = 'alert-hint'
    hintEl.textContent = hint
    box.append(hintEl)
  }
  target.append(box)
}

/** Disables the buttons while a call runs and shows its error in `errorEl`. */
async function run(buttons: HTMLButtonElement[], errorEl: HTMLElement, fn: () => Promise<void>): Promise<boolean> {
  buttons.forEach((b) => { b.disabled = true })
  renderError(errorEl, null)
  try {
    await fn()
    return true
  } catch (err) {
    renderError(errorEl, err)
    return false
  } finally {
    buttons.forEach((b) => { b.disabled = false })
  }
}

// ── Passwordless + passkey sign-in ──

const plEmail = $<HTMLInputElement>('pl-email')
const plCode = $<HTMLInputElement>('pl-code')
const plError = $('pl-error')
const plButtons = ['pl-send-code', 'pl-send-link', 'pl-verify', 'pl-passkey'].map((id) => $<HTMLButtonElement>(id))

function setPasswordlessStep(step: 'email' | 'code' | 'link-sent') {
  show($('pl-email-step'), step === 'email')
  show($('pl-code-step'), step === 'code')
  show($('pl-link-step'), step === 'link-sent')
  $('pl-code-email').textContent = plEmail.value
  $('pl-link-email').textContent = plEmail.value
}

$('pl-send-code').onclick = async () => {
  if (await run(plButtons, plError, () => authon.sendEmailOtp(plEmail.value))) setPasswordlessStep('code')
}

$('pl-send-link').onclick = async () => {
  // The link opens this page; the SDK finishes the sign-in on load (autoHandleMagicLink).
  if (await run(plButtons, plError, () => authon.sendMagicLink(plEmail.value))) setPasswordlessStep('link-sent')
}

$('pl-verify').onclick = () =>
  run(plButtons, plError, async () => {
    await authon.verifyPasswordless({ email: plEmail.value, code: plCode.value.trim() })
  })

$('pl-passkey').onclick = () =>
  run(plButtons, plError, async () => {
    await authon.authenticateWithPasskey(plEmail.value || undefined)
  })

document.querySelectorAll<HTMLButtonElement>('.pl-reset').forEach((btn) => {
  btn.onclick = () => {
    plCode.value = ''
    setPasswordlessStep('email')
  }
})

// ── Passkey registration ──

const pkRegister = $<HTMLButtonElement>('pk-register')
const pkResult = $('pk-result')

pkRegister.onclick = () =>
  run([pkRegister], pkResult, async () => {
    const credential = await authon.registerPasskey()
    const ok = document.createElement('div')
    ok.className = 'alert alert-success'
    ok.textContent = `Passkey registered: ${credential.name || credential.id}`
    pkResult.replaceChildren(ok)
  })

// ── Embedded wallet ──

const wlError = $('wl-error')
const wlRetry = $<HTMLButtonElement>('wl-retry')
const wlSignature = $('wl-signature')
const wlButtons = ['wl-sign', 'wl-protect', 'wl-restore', 'wl-restore-reset'].map((id) => $<HTMLButtonElement>(id))
let currentWallet: EmbeddedWallet | null = null

function renderWallet(wallet: EmbeddedWallet | null) {
  currentWallet = wallet
  show($('wl-body'), !!wallet)
  if (!wallet) return
  show(wlRetry, false)
  const address = $('wl-address')
  address.textContent = wallet.address
  address.title = wallet.address
  const prot = $('wl-protected')
  prot.textContent = wallet.protected ? 'Protected' : 'Not protected'
  prot.className = `info-badge ${wallet.protected ? 'badge-green' : 'badge-yellow'}`
  const state = $('wl-restore-state')
  state.textContent = wallet.needsRestore ? 'Needs restore' : 'Ready'
  state.className = `info-badge ${wallet.needsRestore ? 'badge-yellow' : 'badge-green'}`
  $('wl-devices').textContent = String(wallet.devices.length)
  show($('wl-restore-row'), wallet.needsRestore)
  show($('wl-protect'), !wallet.protected && !wallet.needsRestore)
}

async function loadWallet() {
  show($('wl-loading'), true)
  show(wlRetry, false)
  // ensure() returns the wallet, creating it on first use (autoCreate also does this after sign-in).
  const ok = await run([wlRetry], wlError, async () => renderWallet(await authon.wallet.ensure()))
  show($('wl-loading'), false)
  show(wlRetry, !ok && !currentWallet)
}

wlRetry.onclick = () => void loadWallet()

$('wl-sign').onclick = () =>
  run(wlButtons, wlError, async () => {
    show(wlSignature, false)
    wlSignature.textContent = await authon.wallet.signMessage($<HTMLInputElement>('wl-message').value)
    show(wlSignature, true)
  })

// protect() and restore() open a passkey prompt, so they must run straight from a click.
$('wl-protect').onclick = () =>
  run(wlButtons, wlError, async () => {
    await authon.wallet.protect()
    renderWallet(await authon.wallet.get())
  })

const restore = (resetOtherDevices: boolean) =>
  run(wlButtons, wlError, async () => {
    await authon.wallet.restore({ resetOtherDevices })
    renderWallet(await authon.wallet.get())
  })

$('wl-restore').onclick = () => restore(false)
$('wl-restore-reset').onclick = () => restore(true)

authon.on('walletChanged', (wallet) => renderWallet(wallet))
authon.on('walletError', (err) => renderError(wlError, err))

// ── Signed-in / signed-out view ──

function getInitials(user: AuthonUser): string {
  if (user.displayName) {
    return user.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (user.email?.[0] ?? '?').toUpperCase()
}

function showSignedIn(user: AuthonUser) {
  signedOutEl.style.display = 'none'
  signedInEl.style.display = 'block'

  userNameEl.textContent = user.displayName || user.email?.split('@')[0] || ''
  userEmailEl.textContent = user.email || ''
  userIdEl.textContent = user.id

  if (user.emailVerified) {
    userVerifiedEl.textContent = 'Verified'
    userVerifiedEl.className = 'info-badge badge-green'
  } else {
    userVerifiedEl.textContent = 'Unverified'
    userVerifiedEl.className = 'info-badge badge-yellow'
  }

  if (user.avatarUrl) {
    userAvatarEl.innerHTML = `<img src="${user.avatarUrl}" alt="avatar" style="width:100%;height:100%;object-fit:cover;" />`
  } else {
    userInitialsEl.textContent = getInitials(user)
    userAvatarEl.innerHTML = `<span>${getInitials(user)}</span>`
  }

  void loadWallet()
}

function showSignedOut() {
  signedOutEl.style.display = 'block'
  signedInEl.style.display = 'none'
  renderWallet(null)
  renderError(wlError, null)
  pkResult.replaceChildren()
  wlSignature.textContent = ''
  show(wlSignature, false)
  setPasswordlessStep('email')
}

authon.on('signedIn', (user) => {
  showSignedIn(user as AuthonUser)
})

authon.on('signedOut', () => {
  showSignedOut()
})

const currentUser = authon.getUser()
if (currentUser) {
  showSignedIn(currentUser)
}
