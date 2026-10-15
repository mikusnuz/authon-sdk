<script setup lang="ts">
import { ref } from 'vue'
import { useAuthon } from '@authon/nuxt/composables'
import { useAuthonAction } from '~/composables/useAuthonAction'
import ErrorAlert from './ErrorAlert.vue'

// The passkey and passwordless composables of @authon/nuxt are not exposed through
// '@authon/nuxt/composables', so this panel calls the core client (useAuthon().client) directly.
const authon = useAuthon()
const { isLoading: busy, error, run } = useAuthonAction()

const email = ref('')
const code = ref('')
const step = ref<'email' | 'code' | 'link-sent'>('email')

async function sendCode() {
  const client = authon.client
  if (!client) return
  const sent = await run(async () => { await client.sendEmailOtp(email.value); return true })
  if (sent) step.value = 'code'
}

async function sendLink() {
  const client = authon.client
  if (!client) return
  // The link opens this page; the SDK finishes the sign-in on load (autoHandleMagicLink).
  const sent = await run(async () => { await client.sendMagicLink(email.value); return true })
  if (sent) step.value = 'link-sent'
}

async function verifyCode() {
  const client = authon.client
  if (!client) return
  await run(() => client.verifyPasswordless({ email: email.value, code: code.value.trim() }))
}

async function signInWithPasskey() {
  const client = authon.client
  if (!client) return
  await run(() => client.authenticateWithPasskey(email.value || undefined))
}

function reset() {
  step.value = 'email'
  code.value = ''
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">Sign in without a password</div>
    <p class="panel-desc">Get a one-time code or a magic link by email, or use a passkey saved on this device.</p>

    <template v-if="step === 'email'">
      <input v-model="email" class="field" type="email" placeholder="you@example.com" />
      <div class="field-row">
        <button class="btn btn-primary btn-sm" :disabled="busy || !email" @click="sendCode">Email me a code</button>
        <button class="btn btn-outline btn-sm" :disabled="busy || !email" @click="sendLink">Send magic link</button>
      </div>
    </template>

    <template v-else-if="step === 'code'">
      <p class="panel-desc">Enter the code sent to {{ email }}.</p>
      <div class="field-row">
        <input v-model="code" class="field" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" />
        <button class="btn btn-primary btn-sm" :disabled="busy || !code" @click="verifyCode">Verify code</button>
      </div>
      <button class="btn-link" @click="reset">Use a different email</button>
    </template>

    <template v-else>
      <div class="alert alert-success">Magic link sent to {{ email }}. Open it in this browser to finish signing in.</div>
      <button class="btn-link" @click="reset">Use a different email</button>
    </template>

    <div class="panel-divider"><span>or</span></div>
    <button class="btn btn-outline btn-sm" :disabled="busy" @click="signInWithPasskey">Sign in with passkey</button>

    <ErrorAlert :error="error" />
  </div>
</template>
