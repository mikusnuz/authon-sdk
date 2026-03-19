<template>
  <div class="page">
    <div style="margin-bottom: 24px">
      <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px">
        Profile
      </h1>
      <p style="color: var(--text-secondary); font-size: 14px">
        View and edit your account details
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start">
      <div>
        <div class="card" style="margin-bottom: 16px">
          <div class="section-title">Account Info</div>
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 20px">
            <div class="avatar avatar-lg">
              <img v-if="user?.avatarUrl" :src="user.avatarUrl" alt="avatar" />
              <span v-else>{{ initials }}</span>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 18px; color: var(--text-primary)">
                {{ user?.displayName ?? 'No display name' }}
              </div>
              <div style="color: var(--text-secondary); font-size: 14px">{{ user?.email }}</div>
              <div style="margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap">
                <span v-if="user?.emailVerified" class="badge badge-success">Email verified</span>
                <span v-else class="badge badge-muted">Not verified</span>
              </div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px">
            <InfoRow label="User ID" :value="user?.id ?? '-'" :mono="true" />
            <InfoRow label="Email" :value="user?.email ?? '-'" />
            <InfoRow v-if="user?.phone" label="Phone" :value="user.phone" />
            <InfoRow v-if="joinDate" label="Joined" :value="joinDate" />
          </div>
        </div>

        <div class="card">
          <div class="section-title">Quick Actions</div>
          <div style="display: flex; flex-direction: column; gap: 8px">
            <NuxtLink to="/mfa" class="btn btn-secondary" style="justify-content: flex-start; gap: 10px">
              <span>🔑</span>
              <span>Two-Factor Authentication</span>
            </NuxtLink>
            <NuxtLink to="/sessions" class="btn btn-secondary" style="justify-content: flex-start; gap: 10px">
              <span>📱</span>
              <span>Active Sessions</span>
            </NuxtLink>
            <NuxtLink to="/delete-account" class="btn btn-danger" style="justify-content: flex-start; gap: 10px">
              <span>⚠️</span>
              <span>Delete Account</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="section-title">Edit Profile</div>
        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px">
          <code style="color: var(--accent)">client.updateProfile({ displayName, avatarUrl, phone })</code>
        </div>

        <div v-if="error" class="alert alert-error" style="margin-bottom: 16px">{{ error }}</div>
        <div v-if="success" class="alert alert-success" style="margin-bottom: 16px">{{ success }}</div>

        <form @submit.prevent="handleSave" style="display: flex; flex-direction: column; gap: 16px">
          <div class="form-group">
            <label class="form-label" for="displayName">Display Name</label>
            <input
              id="displayName"
              v-model="formDisplayName"
              class="form-input"
              type="text"
              placeholder="Your name"
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
            <span class="form-error" style="color: var(--text-tertiary)">Email cannot be changed</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="avatarUrl">Avatar URL</label>
            <input
              id="avatarUrl"
              v-model="formAvatarUrl"
              class="form-input"
              type="url"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="phone">Phone</label>
            <input
              id="phone"
              v-model="formPhone"
              class="form-input"
              type="tel"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="saving" style="align-self: flex-start; min-width: 140px">
            <span v-if="saving" class="loading-spinner" />
            <span v-else>Save changes</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { $authon } = useNuxtApp()
const authon = $authon as any

const user = computed(() => authon?.user ?? null)

const formDisplayName = ref('')
const formAvatarUrl = ref('')
const formPhone = ref('')
const saving = ref(false)
const error = ref('')
const success = ref('')

const initials = computed(() => {
  if (!user.value) return '?'
  if (user.value.displayName) {
    return user.value.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }
  return (user.value.email?.[0] ?? '?').toUpperCase()
})

const joinDate = computed(() => {
  if (!user.value?.createdAt) return null
  return new Date(user.value.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

onMounted(() => {
  formDisplayName.value = user.value?.displayName ?? ''
  formAvatarUrl.value = user.value?.avatarUrl ?? ''
  formPhone.value = user.value?.phone ?? ''
})

const handleSave = async () => {
  if (!authon?.client) return
  saving.value = true
  error.value = ''
  success.value = ''
  try {
    await authon.client.updateProfile({
      displayName: formDisplayName.value || undefined,
      avatarUrl: formAvatarUrl.value || undefined,
      phone: formPhone.value || undefined,
    })
    success.value = 'Profile updated successfully'
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'Failed to update profile'
  } finally {
    saving.value = false
  }
}
</script>
