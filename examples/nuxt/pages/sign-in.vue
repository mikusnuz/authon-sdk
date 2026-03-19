<template>
  <div class="page-centered">
    <div style="width: 100%; max-width: 500px">
      <div style="text-align: center; margin-bottom: 24px">
        <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px">
          Sign In
        </h1>
        <p style="color: var(--text-secondary); font-size: 14px">
          Sign in to your Authon account
        </p>
      </div>

      <div class="card">
        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px">
          <code style="color: var(--accent)">client.signInWithEmail(email, password)</code>
        </div>

        <div v-if="mfaRequired">
          <div style="text-align: center; margin-bottom: 24px">
            <div style="font-size: 32px; margin-bottom: 12px">🔑</div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px">
              Two-Factor Authentication
            </h2>
            <p style="color: var(--text-secondary); font-size: 14px">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div v-if="error" class="alert alert-error" style="margin-bottom: 16px">{{ error }}</div>

          <form @submit.prevent="handleMfaVerify" style="display: flex; flex-direction: column; gap: 16px">
            <div class="form-group">
              <label class="form-label">Verification Code</label>
              <input
                v-model="mfaCode"
                class="form-input"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="000000"
                autofocus
                style="text-align: center; font-size: 24px; letter-spacing: 0.2em"
              />
            </div>
            <button type="submit" class="btn btn-primary btn-full" :disabled="loading || mfaCode.length !== 6">
              <span v-if="loading" class="loading-spinner" />
              <span v-else>Verify</span>
            </button>
            <button
              type="button"
              class="btn btn-secondary btn-full"
              @click="() => { mfaRequired = false; mfaToken = ''; mfaCode = ''; error = '' }"
            >
              Back
            </button>
          </form>
        </div>

        <template v-else>
          <div v-if="error" class="alert alert-error" style="margin-bottom: 16px">{{ error }}</div>

          <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 16px">
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
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <div style="display: flex; justify-content: flex-end; margin-top: 4px">
                <NuxtLink to="/reset-password" style="font-size: 13px; color: var(--accent)">
                  Forgot password?
                </NuxtLink>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
              <span v-if="loading" class="loading-spinner" />
              <span v-else>Sign in</span>
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0">
            <div class="divider" style="flex: 1" />
            <span style="color: var(--text-tertiary); font-size: 13px">or continue with</span>
            <div class="divider" style="flex: 1" />
          </div>

          <div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px">
              <code style="color: var(--accent)">renderSocialButtons()</code>
              — all enabled providers
            </div>
            <div ref="socialContainer" />
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 14px; color: var(--text-secondary)">
            Don't have an account?
            <NuxtLink to="/sign-up" style="color: var(--accent); font-weight: 600">Sign up</NuxtLink>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AuthonMfaRequiredError } from '@authon/js'

const { $authon } = useNuxtApp()
const authon = $authon as any

const email = ref('')
const password = ref('')
const mfaCode = ref('')
const mfaToken = ref('')
const mfaRequired = ref(false)
const loading = ref(false)
const error = ref('')
const socialContainer = ref<HTMLElement>()

let socialCleanup: (() => void) | undefined

const handleSubmit = async () => {
  if (!authon?.client) return
  loading.value = true
  error.value = ''
  try {
    await authon.client.signInWithEmail(email.value, password.value)
    await navigateTo('/')
  } catch (err: any) {
    if (err instanceof AuthonMfaRequiredError) {
      mfaToken.value = err.mfaToken
      mfaRequired.value = true
    } else {
      error.value = err instanceof Error ? err.message : 'Sign in failed'
    }
  } finally {
    loading.value = false
  }
}

const handleMfaVerify = async () => {
  if (!authon?.client || !mfaToken.value) return
  loading.value = true
  error.value = ''
  try {
    await authon.client.verifyMfa(mfaToken.value, mfaCode.value)
    await navigateTo('/')
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'MFA verification failed'
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
    compact: true,
    onSuccess: () => navigateTo('/'),
    onError: (e: Error) => { error.value = e.message },
  })
})

onUnmounted(() => socialCleanup?.())
</script>
