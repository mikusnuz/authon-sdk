<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthon } from '@authon/vue'

type Step = 'email' | 'sent'

const { client } = useAuthon()
const step = ref<Step>('email')
const email = ref('')
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  if (!client) return
  loading.value = true
  error.value = ''
  try {
    await client.sendMagicLink(email.value)
    step.value = 'sent'
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to send reset email'
  } finally {
    loading.value = false
  }
}

const retry = () => {
  step.value = 'email'
  error.value = ''
}
</script>

<template>
  <div class="page-centered">
    <div style="width: 100%; max-width: 440px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 40px; margin-bottom: 16px;">🔒</div>
        <h1 style="font-size: 26px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
          Reset Password
        </h1>
        <p style="color: var(--text-secondary); font-size: 14px; max-width: 340px; margin: 0 auto;">
          <template v-if="step === 'email'">
            Enter your email and we'll send you a magic link to reset your password.
          </template>
          <template v-else>
            Check your inbox for the reset link.
          </template>
        </p>
      </div>

      <!-- Email Step -->
      <div v-if="step === 'email'" class="card">
        <div style="font-size: 12px; color: var(--text-tertiary); margin-bottom: 16px;">
          <code style="color: var(--accent);">client.sendMagicLink(email)</code>
        </div>

        <div v-if="error" class="alert alert-error" style="margin-bottom: 16px;">{{ error }}</div>

        <form @submit.prevent="handleSubmit" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label" for="email">Email address</label>
            <input
              id="email"
              class="form-input"
              type="email"
              placeholder="you@example.com"
              v-model="email"
              autocomplete="email"
              autofocus
              required
            />
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            <span v-if="loading" class="loading-spinner" />
            <span v-else>Send reset link</span>
          </button>
        </form>

        <div style="margin-top: 20px; text-align: center; font-size: 14px;">
          <RouterLink to="/sign-in" style="color: var(--text-secondary);">Back to sign in</RouterLink>
        </div>
      </div>

      <!-- Sent Step -->
      <div v-else class="card" style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 16px;">✉️</div>
        <h2 style="font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
          Check your email
        </h2>
        <p style="color: var(--text-secondary); font-size: 14px; margin-bottom: 24px; line-height: 1.6;">
          We sent a magic link to <strong style="color: var(--text-primary);">{{ email }}</strong>.
          Click the link to reset your password. The link expires in 15 minutes.
        </p>

        <div class="alert alert-warning" style="text-align: left; margin-bottom: 20px;">
          <strong>Did not receive the email?</strong> Check your spam folder or try again.
        </div>

        <div style="display: flex; gap: 10px; justify-content: center;">
          <button class="btn btn-secondary" @click="retry">Try again</button>
          <RouterLink to="/sign-in" class="btn btn-primary">Back to sign in</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
