import type { Authon } from '@authon/js'
import type { SessionInfo } from '@authon/shared'

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function parseBrowser(ua: string): string {
  if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome'
  if (ua.includes('Firefox')) return 'Firefox'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari'
  if (ua.includes('Edg')) return 'Edge'
  if (ua.includes('OPR') || ua.includes('Opera')) return 'Opera'
  return 'Unknown browser'
}

function getDeviceIcon(ua: string): string {
  const l = ua.toLowerCase()
  if (l.includes('mobile') || l.includes('android') || l.includes('iphone')) return '📱'
  if (l.includes('tablet') || l.includes('ipad')) return '📟'
  return '💻'
}

function renderSessionItem(session: SessionInfo, isCurrent: boolean, revoking: boolean): string {
  const ua = session.userAgent ?? ''
  const browser = ua ? parseBrowser(ua) : 'Unknown'
  const icon = ua ? getDeviceIcon(ua) : '💻'
  const shortUa = ua.length > 60 ? ua.slice(0, 60) + '…' : ua

  return `
    <div class="session-item" data-session-id="${session.id}">
      <div style="display:flex;align-items:center;gap:12px;flex:1;min-width:0;">
        <div style="width:40px;height:40px;border-radius:50%;background:${isCurrent ? 'var(--accent-light)' : 'rgba(100,116,139,0.1)'};display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">
          ${icon}
        </div>
        <div style="min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px;">
            <span style="font-weight:600;font-size:14px;color:var(--text-primary);">${browser}</span>
            ${isCurrent ? '<span class="badge badge-success" style="font-size:11px;">Current</span>' : ''}
          </div>
          <div style="font-size:12px;color:var(--text-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            ${shortUa || 'Unknown user agent'}
          </div>
          <div style="font-size:12px;color:var(--text-tertiary);margin-top:2px;display:flex;gap:12px;">
            ${session.ipAddress ? `<span>IP: ${session.ipAddress}</span>` : ''}
            ${session.lastActiveAt ? `<span>Active ${formatRelative(session.lastActiveAt)}</span>` : ''}
            ${session.createdAt ? `<span>Signed in ${formatDate(session.createdAt)}</span>` : ''}
          </div>
        </div>
      </div>
      ${!isCurrent ? `
        <button
          class="btn btn-danger btn-sm revoke-btn"
          data-id="${session.id}"
          ${revoking ? 'disabled' : ''}
          style="flex-shrink:0;"
        >
          ${revoking ? '<span class="loading-spinner" style="width:14px;height:14px;"></span>' : 'Revoke'}
        </button>
      ` : ''}
    </div>
  `
}

export function renderSessions(authon: Authon, container: HTMLElement) {
  if (!authon.getUser()) { window.location.hash = 'sign-in'; return }

  let sessions: SessionInfo[] = []
  let fetching = true
  let revoking: string | null = null
  let successMsg = ''
  let errorMsg = ''

  const render = () => {
    const sessionListHtml = sessions.length === 0
      ? `<div class="card" style="text-align:center;padding:40px 20px;">
           <div style="font-size:40px;margin-bottom:12px;">📭</div>
           <div style="color:var(--text-secondary);font-size:15px;">No active sessions found</div>
         </div>`
      : `<div style="display:flex;flex-direction:column;gap:10px;">
           ${sessions.map((s, i) => renderSessionItem(s, i === 0, revoking === s.id)).join('')}
         </div>`

    container.innerHTML = `
      <div class="page" style="max-width:720px;">
        <div style="margin-bottom:24px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <h1 style="font-size:26px;font-weight:700;color:var(--text-primary);">Active Sessions</h1>
            <button id="sessions-refresh" class="btn btn-secondary btn-sm" ${fetching ? 'disabled' : ''}>Refresh</button>
          </div>
          <p style="color:var(--text-secondary);font-size:14px;">
            Manage your sessions using
            <code style="color:var(--accent);">authon.listSessions()</code>,
            <code style="color:var(--accent);">authon.revokeSession(id)</code>
          </p>
        </div>

        ${errorMsg ? `<div class="alert alert-error" style="margin-bottom:16px;">${errorMsg}</div>` : ''}
        ${successMsg ? `<div class="alert alert-success" style="margin-bottom:16px;">${successMsg}</div>` : ''}

        ${fetching
          ? `<div style="display:flex;justify-content:center;padding:60px;"><div class="loading-spinner-lg"></div></div>`
          : `
            <div class="card" style="margin-bottom:16px;padding:12px 16px;">
              <span style="font-size:13px;color:var(--text-secondary);">
                ${sessions.length} active ${sessions.length === 1 ? 'session' : 'sessions'}
              </span>
            </div>
            ${sessionListHtml}
            <div class="card" style="margin-top:24px;">
              <div class="section-title">Security Tip</div>
              <p style="font-size:14px;color:var(--text-secondary);line-height:1.6;">
                If you notice any suspicious sessions, revoke them immediately and change your password.
                Sessions are automatically cleared after 30 days of inactivity.
              </p>
            </div>
          `
        }
      </div>
    `

    container.querySelector('#sessions-refresh')?.addEventListener('click', loadSessions)

    container.querySelectorAll<HTMLButtonElement>('.revoke-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id!
        revoking = id
        successMsg = ''
        errorMsg = ''
        render()
        try {
          await authon.revokeSession(id)
          sessions = sessions.filter((s) => s.id !== id)
          successMsg = 'Session revoked successfully.'
        } catch (err) {
          errorMsg = err instanceof Error ? err.message : 'Failed to revoke session'
        } finally {
          revoking = null
          render()
        }
      })
    })
  }

  const loadSessions = async () => {
    fetching = true
    errorMsg = ''
    render()
    try {
      sessions = await authon.listSessions()
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : 'Failed to load sessions'
    } finally {
      fetching = false
      render()
    }
  }

  loadSessions()
}
