<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthon, AuthonSocialButtons } from '@authon/vue'
import { AuthonMfaRequiredError } from '@authon/js'

type View = 'builtin' | 'custom'

const router = useRouter()
const { client, openSignIn } = useAuthon()

const view = ref<View>('builtin')

// Builtin
const builtinLoading = ref(false)
const handleBuiltinSignIn = async () => {
  builtinLoading.value = true
  try {
    await openSignIn()
    router.push('/')
  } finally {
    builtinLoading.value = false
  }
}

// Custom form
const email = ref('')
const password = ref('')
const mfaCode = ref('')
const mfaRequired = ref(false)
const mfaToken = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!client) return
  loading.value = true
  error.value = ''
  try {
    await client.signInWithEmail(email.value, password.value)
    router.push('/')
  } catch (err) {
    if (err instanceof AuthonMfaRequiredError) {
      mfaRequired.value = true
      mfaToken.value = err.mfaToken
    } else {
      error.value = err instanceof Error ? err.message : 'Sign in failed'
    }
  } finally {
    loading.value = false
  }
}

const handleMfaVerify = async () => {
  if (!client) return
  loading.value = true
  error.value = ''
  try {
    await client.verifyMfa(mfaToken.value, mfaCode.value)
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'MFA verification failed'
  } finally {
    loading.value = false
  }
}

const resetMfa = () => {
  mfaRequired.value = false
  mfaCode.value = ''
  error.value = ''
}

const handleSocialError = (e: Error) => {
  error.value = e.message
}

const handleSocialSuccess = () => {
  router.push('/')
}
</script>

<template>
  <div class="page-centered">
    <div style="width: 100%; max-width: 500px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
          Sign In Demo
        </h1>
        <p style="color: var(--text-secondary); font-size: 14px;">
          Two approaches — toggle to compare
        </p>
      </div>

      <div style="display: flex; justify-content: center; margin-bottom: 28px;">
        <div class="toggle-bar">
          <button :class="['toggle-btn', view === 'builtin' ? 'active' : '']" @click="view = 'builtin'">
            Built-in Component
          </button>
          <button :class="['toggle-btn', view === 'custom' ? 'active' : '']" @click="view = 'custom'">
            Custom Form
          </button>
        </div>
      </div>

      <!-- Built-in -->
      <template v-if="view === 'builtin'">
        <div>
          <div class="card" style="margin-bottom: 16px; padding: 12px 16px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--accent); background: var(--accent-light); padding: 2px 8px; border-radius: 5px;">
                Built-in
              </span>
              <code style="font-size: 12px; color: var(--text-secondary);">
                openSignIn() — SDK managed popup/redirect
              </code>
            </div>
          </div>
          <div class="card" style="text-align: center; padding: 40px 32px;">
            <div style="font-size: 40px; margin-bottom: 16px;">🔐</div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">
              Click below to open the Authon built-in sign-in flow
            </p>
            <button class="btn btn-primary" style="font-size: 15px; padding: 12px 28px;" @click="handleBuiltinSignIn" :disabled="builtinLoading">
              <span v-if="builtinLoading" class="loading-spinner" />
              <span v-else>Open Sign In</span>
            </button>
            <div style="margin-top: 20px; font-size: 13px; color: var(--text-tertiary);">
              Uses <code style="color: var(--accent);">useAuthon().openSignIn()</code>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom Form -->
      <template v-else>
        <!-- MFA Step -->
        <div v-if="mfaRequired" class="card">
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 32px; margin-bottom: 12px;">🔑</div>
            <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
              Two-Factor Authentication
            </h2>
            <p style="color: var(--text-secondary); font-size: 14px;">
              Enter the 6-digit code from your authenticator app
            </p>
          </div>

          <div v-if="error" class="alert alert-error" style="margin-bottom: 16px;">{{ error }}</div>

          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-group">
              <label class="form-label">Verification Code</label>
              <input
                class="form-input"
                type="text"
                inputmode="numeric"
                :maxlength="6"
                placeholder="000000"
                v-model="mfaCode"
                autofocus
                style="text-align: center; font-size: 24px; letter-spacing: 0.2em;"
              />
            </div>
            <button
              class="btn btn-primary btn-full"
              :disabled="loading || mfaCode.length !== 6"
              @click="handleMfaVerify"
            >
              <span v-if="loading" class="loading-spinner" />
              <span v-else>Verify</span>
            </button>
            <button class="btn btn-secondary btn-full" @click="resetMfa">Back</button>
          </div>
        </div>

        <!-- Sign In Form -->
        <div v-else class="card">
          <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--accent-2); background: rgba(79, 70, 229, 0.12); padding: 2px 8px; border-radius: 5px;">
                Custom
              </span>
              <code style="font-size: 12px; color: var(--text-secondary);">
                client.signInWithEmail(email, password)
              </code>
            </div>
          </div>

          <div v-if="error" class="alert alert-error" style="margin-bottom: 16px;">{{ error }}</div>

          <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-group">
              <label class="form-label" for="email">Email</label>
              <input
                id="email"
                class="form-input"
                type="email"
                placeholder="you@example.com"
                v-model="email"
                autocomplete="email"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <input
                id="password"
                class="form-input"
                type="password"
                placeholder="••••••••"
                v-model="password"
                autocomplete="current-password"
                required
              />
              <div style="display: flex; justify-content: flex-end; margin-top: 4px;">
                <RouterLink to="/reset-password" style="font-size: 13px; color: var(--accent);">
                  Forgot password?
                </RouterLink>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
              <span v-if="loading" class="loading-spinner" />
              <span v-else>Sign in</span>
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
            <div class="divider" style="flex: 1;" />
            <span style="color: var(--text-tertiary); font-size: 13px;">or continue with</span>
            <div class="divider" style="flex: 1;" />
          </div>

          <div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px;">
              <code style="color: var(--accent);">&lt;AuthonSocialButtons compact /&gt;</code>
              — all enabled providers
            </div>
            <AuthonSocialButtons
              :compact="true"
              :on-success="handleSocialSuccess"
              :on-error="handleSocialError"
            />
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 14px; color: var(--text-secondary);">
            Don't have an account?
            <RouterLink to="/sign-up" style="color: var(--accent); font-weight: 600;">Sign up</RouterLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
