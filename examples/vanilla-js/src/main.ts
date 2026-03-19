import './style.css'
import { Authon } from '@authon/js'
import { registerRoute, initRouter, navigate } from './router'
import { renderNav, attachNavEvents } from './components/nav'
import { renderHome } from './pages/home'
import { renderSignIn } from './pages/sign-in'
import { renderSignUp } from './pages/sign-up'
import { renderProfile } from './pages/profile'
import { renderResetPassword } from './pages/reset-password'
import { renderMfa } from './pages/mfa'
import { renderSessions } from './pages/sessions'
import { renderDeleteAccount } from './pages/delete-account'

const publishableKey = import.meta.env.VITE_AUTHON_PROJECT_ID ?? 'demo-key'
const apiUrl = import.meta.env.VITE_AUTHON_API_URL ?? 'https://api.authon.dev'

const authon = new Authon(publishableKey, { apiUrl })

const app = document.getElementById('app')!

function renderLayout(contentFn: (container: HTMLElement) => void) {
  app.innerHTML = renderNav(authon)
  const main = document.createElement('main')
  main.style.cssText = 'flex:1;display:flex;flex-direction:column;'
  app.appendChild(main)

  const footer = document.createElement('footer')
  footer.style.cssText = 'border-top:1px solid var(--border-subtle);padding:20px 24px;text-align:center;color:var(--text-tertiary);font-size:13px;'
  footer.innerHTML = `
    <div style="max-width:1100px;margin:0 auto;">
      Authon Vanilla JS Example &mdash;
      <a href="https://docs.authon.dev" target="_blank" rel="noopener noreferrer">Documentation</a>
      &middot;
      <a href="https://github.com/mikusnuz/authon-sdk" target="_blank" rel="noopener noreferrer">GitHub</a>
    </div>
  `
  app.appendChild(footer)

  attachNavEvents(authon)
  contentFn(main)
}

function isAuthenticated(): boolean {
  return authon.getUser() !== null
}

function requireAuth(renderFn: (container: HTMLElement) => void): () => void {
  return () => {
    if (!isAuthenticated()) {
      navigate('sign-in')
      return
    }
    renderLayout((container) => renderFn(container))
  }
}

registerRoute('', () => {
  renderLayout((container) => renderHome(authon, container))
})

registerRoute('sign-in', () => {
  if (isAuthenticated()) { navigate(''); return }
  renderLayout((container) => renderSignIn(authon, container))
})

registerRoute('sign-up', () => {
  if (isAuthenticated()) { navigate(''); return }
  renderLayout((container) => renderSignUp(authon, container))
})

registerRoute('profile', requireAuth((container) => renderProfile(authon, container)))
registerRoute('reset-password', () => {
  renderLayout((container) => renderResetPassword(authon, container))
})
registerRoute('mfa', requireAuth((container) => renderMfa(authon, container)))
registerRoute('sessions', requireAuth((container) => renderSessions(authon, container)))
registerRoute('delete-account', requireAuth((container) => renderDeleteAccount(authon, container)))

authon.on('signedIn', () => {
  const hash = window.location.hash.slice(1)
  if (hash === 'sign-in' || hash === 'sign-up') {
    navigate('')
  } else {
    renderLayout((container) => {
      const route = hash || ''
      if (route === 'profile') renderProfile(authon, container)
      else if (route === 'mfa') renderMfa(authon, container)
      else if (route === 'sessions') renderSessions(authon, container)
      else renderHome(authon, container)
    })
  }
})

authon.on('signedOut', () => {
  navigate('')
})

authon.on('error', (err) => {
  console.error('[Authon]', err)
})

initRouter(() => {
  renderLayout((container) => renderHome(authon, container))
})
