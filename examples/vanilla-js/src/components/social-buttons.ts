import { getProviderButtonConfig } from '@authon/js'
import type { OAuthProviderType } from '@authon/shared'
import type { Authon } from '@authon/js'

const ALL_PROVIDERS: OAuthProviderType[] = [
  'google', 'apple', 'kakao', 'naver', 'facebook',
  'github', 'discord', 'x', 'line', 'microsoft',
]

export function renderSocialButtons(container: HTMLElement, authon: Authon) {
  const buttons = ALL_PROVIDERS.map((provider) => {
    const cfg = getProviderButtonConfig(provider)
    return `
      <button
        class="social-btn"
        data-provider="${provider}"
        style="background:${cfg.bgColor};color:${cfg.textColor};"
      >
        ${cfg.iconSvg}
        <span>${cfg.label}</span>
      </button>
    `
  })

  container.innerHTML = `<div style="display:flex;flex-direction:column;gap:8px;">${buttons.join('')}</div>`

  container.querySelectorAll<HTMLButtonElement>('[data-provider]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const provider = btn.dataset.provider as OAuthProviderType
      try {
        btn.disabled = true
        btn.style.opacity = '0.6'
        await authon.signInWithOAuth(provider)
      } catch {
        btn.disabled = false
        btn.style.opacity = ''
      }
    })
  })
}
