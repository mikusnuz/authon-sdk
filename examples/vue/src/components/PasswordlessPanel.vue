<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthonPasskeys, useAuthonPasswordless } from '@authon/vue'
import ErrorAlert from './ErrorAlert.vue'

const passwordless = useAuthonPasswordless()
const passkeys = useAuthonPasskeys()
const passwordlessError = passwordless.error
const passkeyError = passkeys.error

const email = ref('')
const code = ref('')
const step = ref<'email' | 'code' | 'link-sent'>('email')
const busy = computed(() => passwordless.isLoading.value || passkeys.isLoading.value)

async function sendCode() {
  if (await passwordless.sendEmailOtp(email.value)) step.value = 'code'
}

async function sendLink() {
  // The link opens this page; the SDK finishes the sign-in on load (autoHandleMagicLink).
  if (await passwordless.sendMagicLink(email.value)) step.value = 'link-sent'
}

async function verifyCode() {
  await passwordless.verifyPasswordless({ email: email.value, code: code.value.trim() })
}

async function signInWithPasskey() {
  await passkeys.authenticateWithPasskey(email.value || undefined)
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

    <ErrorAlert :error="passwordlessError ?? passkeyError" />
  </div>
</template>
