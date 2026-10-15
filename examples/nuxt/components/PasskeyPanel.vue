<script setup lang="ts">
import { ref } from 'vue'
import type { PasskeyCredential } from '@authon/shared'
import { useAuthon } from '@authon/nuxt/composables'
import { useAuthonAction } from '~/composables/useAuthonAction'
import ErrorAlert from './ErrorAlert.vue'

const authon = useAuthon()
const { isLoading, error, run } = useAuthonAction()
const registered = ref<PasskeyCredential | null>(null)

async function register() {
  const client = authon.client
  if (!client) return
  const credential = await run(() => client.registerPasskey())
  if (credential) registered.value = credential
}
</script>

<template>
  <div class="panel">
    <div class="panel-title">Passkeys</div>
    <p class="panel-desc">Add a passkey so you can sign in next time with Face ID, Touch ID or a security key.</p>
    <button class="btn btn-primary btn-sm" :disabled="isLoading" @click="register">
      {{ isLoading ? 'Waiting for passkey...' : 'Register passkey' }}
    </button>
    <div v-if="registered" class="alert alert-success">Passkey registered: {{ registered.name || registered.id }}</div>
    <ErrorAlert :error="error" />
  </div>
</template>
