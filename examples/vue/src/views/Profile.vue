<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useUser, useAuthon } from '@authon/vue'

type View = 'builtin' | 'custom'

const view = ref<View>('builtin')
const { user: userRef } = useUser()
const { client } = useAuthon()
const user = computed(() => userRef.value)

const displayName = ref(userRef.value?.displayName ?? '')
const avatarUrl = ref(userRef.value?.avatarUrl ?? '')
const phone = ref(userRef.value?.phone ?? '')
const loading = ref(false)
const error = ref('')
const success = ref('')

const initials = computed(() => {
  const u = userRef.value
  if (!u) return '?'
  if (u.displayName) {
    return u.displayName
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }
  return (u.email?.[0] ?? '?').toUpperCase()
})

const joinDate = computed(() => {
  if (!userRef.value?.createdAt) return null
  return new Date(userRef.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const handleSave = async () => {
  if (!client) return
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    await client.updateProfile({
      displayName: displayName.value || undefined,
      avatarUrl: avatarUrl.value || undefined,
      phone: phone.value || undefined,
    })
    success.value = 'Profile updated successfully'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page">
    <div style="margin-bottom: 24px;">
      <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
        Profile
      </h1>
      <p style="color: var(--text-secondary); font-size: 14px;">
        View and edit your account details
      </p>
    </div>

    <div style="display: flex; gap: 12px; margin-bottom: 28px;">
      <div class="toggle-bar">
        <button :class="['toggle-btn', view === 'builtin' ? 'active' : '']" @click="view = 'builtin'">
          Built-in UserProfile
        </button>
        <button :class="['toggle-btn', view === 'custom' ? 'active' : '']" @click="view = 'custom'">
          Custom UI
        </button>
      </div>
    </div>

    <!-- Built-in -->
    <div v-if="view === 'builtin'">
      <div class="card" style="margin-bottom: 20px; padding: 12px 16px; display: inline-block;">
        <code style="font-size: 12px; color: var(--text-secondary);">
          useUser() composable — reactive user data
        </code>
      </div>
      <div class="card">
        <div class="section-title">User Data (useUser)</div>
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
          <div class="avatar avatar-lg">
            <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="avatar" />
            <template v-else>{{ initials }}</template>
          </div>
          <div>
            <div style="font-weight: 700; font-size: 18px; color: var(--text-primary);">
              {{ user?.displayName ?? 'No display name' }}
            </div>
            <div style="color: var(--text-secondary); font-size: 14px;">{{ user?.email }}</div>
            <div style="margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap;">
              <span v-if="user?.emailVerified" class="badge badge-success">Email verified</span>
              <span v-else class="badge badge-muted">Not verified</span>
            </div>
          </div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="display: flex; gap: 8px; align-items: baseline;">
            <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">User ID</span>
            <span style="font-size: 13px; color: var(--text-secondary); font-family: 'Courier New', monospace; word-break: break-all;">
              {{ user?.id ?? '-' }}
            </span>
          </div>
          <div style="display: flex; gap: 8px; align-items: baseline;">
            <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">Email</span>
            <span style="font-size: 13px; color: var(--text-secondary);">{{ user?.email ?? '-' }}</span>
          </div>
          <div v-if="user?.phone" style="display: flex; gap: 8px; align-items: baseline;">
            <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">Phone</span>
            <span style="font-size: 13px; color: var(--text-secondary);">{{ user.phone }}</span>
          </div>
          <div v-if="joinDate" style="display: flex; gap: 8px; align-items: baseline;">
            <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">Joined</span>
            <span style="font-size: 13px; color: var(--text-secondary);">{{ joinDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom UI -->
    <div v-else style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
      <div>
        <div class="card" style="margin-bottom: 16px;">
          <div class="section-title">Account Info</div>
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px;">
            <div class="avatar avatar-lg">
              <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="avatar" />
              <template v-else>{{ initials }}</template>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 18px; color: var(--text-primary);">
                {{ user?.displayName ?? 'No display name' }}
              </div>
              <div style="color: var(--text-secondary); font-size: 14px;">{{ user?.email }}</div>
              <div style="margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap;">
                <span v-if="user?.emailVerified" class="badge badge-success">Email verified</span>
                <span v-else class="badge badge-muted">Not verified</span>
              </div>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; gap: 8px; align-items: baseline;">
              <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">User ID</span>
              <span style="font-size: 13px; color: var(--text-secondary); font-family: 'Courier New', monospace; word-break: break-all;">
                {{ user?.id ?? '-' }}
              </span>
            </div>
            <div style="display: flex; gap: 8px; align-items: baseline;">
              <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">Email</span>
              <span style="font-size: 13px; color: var(--text-secondary);">{{ user?.email ?? '-' }}</span>
            </div>
            <div v-if="user?.phone" style="display: flex; gap: 8px; align-items: baseline;">
              <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">Phone</span>
              <span style="font-size: 13px; color: var(--text-secondary);">{{ user.phone }}</span>
            </div>
            <div v-if="joinDate" style="display: flex; gap: 8px; align-items: baseline;">
              <span style="font-size: 13px; color: var(--text-tertiary); min-width: 70px;">Joined</span>
              <span style="font-size: 13px; color: var(--text-secondary);">{{ joinDate }}</span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Quick Actions</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <RouterLink to="/mfa" class="btn btn-secondary" style="justify-content: flex-start; gap: 10px;">
              <span>🔑</span>
              <span>Two-Factor Authentication</span>
            </RouterLink>
            <RouterLink to="/sessions" class="btn btn-secondary" style="justify-content: flex-start; gap: 10px;">
              <span>📱</span>
              <span>Active Sessions</span>
            </RouterLink>
            <RouterLink to="/delete-account" class="btn btn-danger" style="justify-content: flex-start; gap: 10px;">
              <span>⚠️</span>
              <span>Delete Account</span>
            </RouterLink>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title">Edit Profile</div>
        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px;">
          <code style="color: var(--accent);">client.updateProfile({ displayName, avatarUrl, phone })</code>
        </div>

        <div v-if="error" class="alert alert-error" style="margin-bottom: 16px;">{{ error }}</div>
        <div v-if="success" class="alert alert-success" style="margin-bottom: 16px;">{{ success }}</div>

        <form @submit.prevent="handleSave" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label" for="displayName">Display Name</label>
            <input
              id="displayName"
              class="form-input"
              type="text"
              placeholder="Your name"
              v-model="displayName"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email-display">Email</label>
            <input
              id="email-display"
              class="form-input"
              type="email"
              :value="user?.email ?? ''"
              disabled
            />
            <span class="form-error" style="color: var(--text-tertiary);">
              Email cannot be changed
            </span>
          </div>

          <div class="form-group">
            <label class="form-label" for="avatarUrl">Avatar URL</label>
            <input
              id="avatarUrl"
              class="form-input"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              v-model="avatarUrl"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">Phone</label>
            <input
              id="phone"
              class="form-input"
              type="tel"
              placeholder="+1 (555) 000-0000"
              v-model="phone"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="loading" style="align-self: flex-start; min-width: 140px;">
            <span v-if="loading" class="loading-spinner" />
            <span v-else>Save changes</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
