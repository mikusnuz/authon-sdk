<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthon } from '@authon/vue'
import type { SessionInfo } from '@authon/shared'

const { client } = useAuthon()

const sessions = ref<SessionInfo[]>([])
const fetching = ref(true)
const revoking = ref<string | null>(null)
const error = ref('')
const successMsg = ref('')

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function parseUserAgent(ua: string): string {
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

const load = async () => {
  if (!client) return
  fetching.value = true
  error.value = ''
  try {
    const data = await client.listSessions()
    sessions.value = (data ?? []) as SessionInfo[]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load sessions'
  } finally {
    fetching.value = false
  }
}

onMounted(load)

const handleRevoke = async (sessionId: string) => {
  if (!client) return
  revoking.value = sessionId
  successMsg.value = ''
  try {
    await client.revokeSession(sessionId)
    sessions.value = sessions.value.filter((s) => s.id !== sessionId)
    successMsg.value = 'Session revoked successfully.'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to revoke session'
  } finally {
    revoking.value = null
  }
}
</script>

<template>
  <div class="page-centered" v-if="fetching">
    <div class="loading-spinner-lg" />
  </div>

  <div v-else class="page" style="max-width: 720px;">
    <div style="margin-bottom: 24px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary);">
          Active Sessions
        </h1>
        <button class="btn btn-secondary btn-sm" @click="load" :disabled="fetching">
          Refresh
        </button>
      </div>
      <p style="color: var(--text-secondary); font-size: 14px;">
        Manage your active sessions using
        <code style="color: var(--accent);">client.listSessions()</code>,
        <code style="color: var(--accent);">client.revokeSession(id)</code>
      </p>
    </div>

    <div v-if="error" class="alert alert-error" style="margin-bottom: 16px;">{{ error }}</div>
    <div v-if="successMsg" class="alert alert-success" style="margin-bottom: 16px;">{{ successMsg }}</div>

    <div class="card" style="margin-bottom: 16px; padding: 12px 16px;">
      <span style="font-size: 13px; color: var(--text-secondary);">
        {{ sessions.length }} active {{ sessions.length === 1 ? 'session' : 'sessions' }}
      </span>
    </div>

    <div v-if="sessions.length === 0" class="card" style="text-align: center; padding: 40px 20px;">
      <div style="font-size: 40px; margin-bottom: 12px;">📭</div>
      <div style="color: var(--text-secondary); font-size: 15px;">No active sessions found</div>
    </div>

    <div v-else style="display: flex; flex-direction: column; gap: 10px;">
      <div
        v-for="(session, i) in sessions"
        :key="session.id"
        class="session-item"
      >
        <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
          <div
            :style="{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: i === 0 ? 'var(--accent-light)' : 'rgba(100, 116, 139, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              flexShrink: 0,
            }"
          >
            {{ session.userAgent ? getDeviceIcon(session.userAgent) : '💻' }}
          </div>
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 2px;">
              <span style="font-weight: 600; font-size: 14px; color: var(--text-primary);">
                {{ session.userAgent ? parseUserAgent(session.userAgent) : 'Unknown' }}
              </span>
              <span v-if="i === 0" class="badge badge-success" style="font-size: 11px;">Current</span>
            </div>
            <div style="font-size: 12px; color: var(--text-tertiary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              {{ session.userAgent ? (session.userAgent.length > 60 ? session.userAgent.slice(0, 60) + '…' : session.userAgent) : 'Unknown user agent' }}
            </div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 2px; display: flex; gap: 12px;">
              <span v-if="session.ipAddress">IP: {{ session.ipAddress }}</span>
              <span v-if="session.lastActiveAt">Active {{ formatRelative(session.lastActiveAt) }}</span>
              <span v-if="session.createdAt">Signed in {{ formatDate(session.createdAt) }}</span>
            </div>
          </div>
        </div>

        <button
          v-if="i !== 0"
          class="btn btn-danger btn-sm"
          @click="handleRevoke(session.id)"
          :disabled="revoking === session.id"
          style="flex-shrink: 0;"
        >
          <span v-if="revoking === session.id" class="loading-spinner" style="width: 14px; height: 14px;" />
          <span v-else>Revoke</span>
        </button>
      </div>
    </div>

    <div class="card" style="margin-top: 24px;">
      <div class="section-title">Security Tip</div>
      <p style="font-size: 14px; color: var(--text-secondary); line-height: 1.6;">
        If you notice any suspicious sessions, revoke them immediately and change your password.
        Sessions are automatically cleared after 30 days of inactivity.
      </p>
    </div>
  </div>
</template>
