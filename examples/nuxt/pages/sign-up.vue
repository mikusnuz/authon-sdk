<template>
  <div class="page-centered">
    <div style="width: 100%; max-width: 500px">
      <div style="text-align: center; margin-bottom: 24px">
        <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px">
          Create Account
        </h1>
        <p style="color: var(--text-secondary); font-size: 14px">
          Sign up for a new Authon account
        </p>
      </div>

      <div class="card">
        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px">
          <code style="color: var(--accent)">client.signUpWithEmail(email, password, meta)</code>
        </div>

        <div v-if="error" class="alert alert-error" style="margin-bottom: 16px">{{ error }}</div>

        <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 16px">
          <div class="form-group">
            <label class="form-label" for="displayName">
              Display Name <span style="color: var(--text-tertiary)">(optional)</span>
            </label>
            <input
              id="displayName"
              v-model="displayName"
              class="form-input"
              type="text"
              placeholder="Your name"
              autocomplete="name"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              v-model="email"
              class="form-input"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              v-model="password"
              class="form-input"
              type="password"
              placeholder="Minimum 8 characters"
              autocomplete="new-password"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              class="form-input"
              type="password"
              placeholder="Repeat your password"
              autocomplete="new-password"
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            <span v-if="loading" class="loading-spinner" />
            <span v-else>Create account</span>
          </button>
        </form>

        <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0">
          <div class="divider" style="flex: 1" />
          <span style="color: var(--text-tertiary); font-size: 13px">or sign up with</span>
          <div class="divider" style="flex: 1" />
        </div>

        <div>
          <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px">
            <code style="color: var(--accent)">renderSocialButtons()</code>
            — full-width buttons
          </div>
          <div ref="socialContainer" />
        </div>

        <div style="margin-top: 20px; text-align: center; font-size: 14px; color: var(--text-secondary)">
          Already have an account?
          <NuxtLink to="/sign-in" style="color: var(--accent); font-weight: 600">Sign in</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $authon } = useNuxtApp()
const authon = $authon as any

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')
const loading = ref(false)
const error = ref('')
const socialContainer = ref<HTMLElement>()

let socialCleanup: (() => void) | undefined

const handleSubmit = async () => {
  if (!authon?.client) return

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  if (password.value.length < 8) {
    error.value = 'Password must be at least 8 characters'
    return
  }

  loading.value = true
  error.value = ''
  try {
    await authon.client.signUpWithEmail(email.value, password.value, {
      displayName: displayName.value || undefined,
    })
    await navigateTo('/')
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'Sign up failed'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!socialContainer.value || !authon?.client) return
  const { renderSocialButtons } = await import('@authon/nuxt')
  socialCleanup = renderSocialButtons({
    client: authon.client,
    container: socialContainer.value,
    onSuccess: () => navigateTo('/'),
    onError: (e: Error) => { error.value = e.message },
  })
})

onUnmounted(() => socialCleanup?.())
</script>
