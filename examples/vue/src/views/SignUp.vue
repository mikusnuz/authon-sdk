<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthon, AuthonSocialButtons } from '@authon/vue'

type View = 'builtin' | 'custom'

const router = useRouter()
const { client, openSignUp } = useAuthon()

const view = ref<View>('builtin')

// Builtin
const builtinLoading = ref(false)
const handleBuiltinSignUp = async () => {
  builtinLoading.value = true
  try {
    await openSignUp()
    router.push('/')
  } finally {
    builtinLoading.value = false
  }
}

// Custom form
const displayName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!client) return

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
    await client.signUpWithEmail(email.value, password.value, {
      displayName: displayName.value || undefined,
    })
    router.push('/')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Sign up failed'
  } finally {
    loading.value = false
  }
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
          Sign Up Demo
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
                openSignUp() — SDK managed popup/redirect
              </code>
            </div>
          </div>
          <div class="card" style="text-align: center; padding: 40px 32px;">
            <div style="font-size: 40px; margin-bottom: 16px;">✨</div>
            <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px;">
              Click below to open the Authon built-in sign-up flow
            </p>
            <button class="btn btn-primary" style="font-size: 15px; padding: 12px 28px;" @click="handleBuiltinSignUp" :disabled="builtinLoading">
              <span v-if="builtinLoading" class="loading-spinner" />
              <span v-else>Open Sign Up</span>
            </button>
            <div style="margin-top: 20px; font-size: 13px; color: var(--text-tertiary);">
              Uses <code style="color: var(--accent);">useAuthon().openSignUp()</code>
            </div>
          </div>
        </div>
      </template>

      <!-- Custom Form -->
      <template v-else>
        <div class="card">
          <div style="margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
              <span style="font-size: 12px; font-weight: 600; color: var(--accent-2); background: rgba(79, 70, 229, 0.12); padding: 2px 8px; border-radius: 5px;">
                Custom
              </span>
              <code style="font-size: 12px; color: var(--text-secondary);">
                client.signUpWithEmail(email, password, meta)
              </code>
            </div>
          </div>

          <div v-if="error" class="alert alert-error" style="margin-bottom: 16px;">{{ error }}</div>

          <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 16px;">
            <div class="form-group">
              <label class="form-label" for="displayName">
                Display Name
                <span style="color: var(--text-tertiary);">(optional)</span>
              </label>
              <input
                id="displayName"
                class="form-input"
                type="text"
                placeholder="Your name"
                v-model="displayName"
                autocomplete="name"
              />
            </div>

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
                placeholder="Minimum 8 characters"
                v-model="password"
                autocomplete="new-password"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                class="form-input"
                type="password"
                placeholder="Repeat your password"
                v-model="confirmPassword"
                autocomplete="new-password"
                required
              />
            </div>

            <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
              <span v-if="loading" class="loading-spinner" />
              <span v-else>Create account</span>
            </button>
          </form>

          <div style="display: flex; align-items: center; gap: 12px; margin: 20px 0;">
            <div class="divider" style="flex: 1;" />
            <span style="color: var(--text-tertiary); font-size: 13px;">or sign up with</span>
            <div class="divider" style="flex: 1;" />
          </div>

          <div>
            <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 10px;">
              <code style="color: var(--accent);">&lt;AuthonSocialButtons /&gt;</code>
              — full-width buttons
            </div>
            <AuthonSocialButtons
              :on-success="handleSocialSuccess"
              :on-error="handleSocialError"
            />
          </div>

          <div style="margin-top: 20px; text-align: center; font-size: 14px; color: var(--text-secondary);">
            Already have an account?
            <RouterLink to="/sign-in" style="color: var(--accent); font-weight: 600;">Sign in</RouterLink>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
