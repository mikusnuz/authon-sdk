import { Authon } from '@authon/js'
import type { AuthonUser } from '@authon/shared'

const publishableKey = import.meta.env.VITE_AUTHON_PROJECT_ID as string
const apiUrl = import.meta.env.VITE_AUTHON_API_URL as string | undefined

if (!publishableKey) {
  throw new Error('VITE_AUTHON_PROJECT_ID is required. Copy .env.example to .env and fill in your project ID.')
}

const authon = new Authon(publishableKey, apiUrl ? { apiUrl } : undefined)

const signedOutEl = document.getElementById('signed-out')!
const signedInEl = document.getElementById('signed-in')!
const userNameEl = document.getElementById('user-name')!
const userEmailEl = document.getElementById('user-email')!
const userIdEl = document.getElementById('user-id')!
const userVerifiedEl = document.getElementById('user-verified')!
const userInitialsEl = document.getElementById('user-initials')!
const userAvatarEl = document.getElementById('user-avatar')!

document.getElementById('signin-btn')!.onclick = () => authon.openSignIn()
document.getElementById('signup-btn')!.onclick = () => authon.openSignUp()
document.getElementById('signout-btn')!.onclick = () => authon.signOut()

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
}

function showSignedOut() {
  signedOutEl.style.display = 'block'
  signedInEl.style.display = 'none'
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
