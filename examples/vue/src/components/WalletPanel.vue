<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, toRaw } from 'vue'
import { useAuthon } from '@authon/vue'
import type { EmbeddedWallet } from '@authon/js'
import ErrorAlert from './ErrorAlert.vue'

type Action = 'load' | 'sign' | 'protect' | 'restore' | null

// @authon/vue has no wallet composable, so the panel uses the core client: client.wallet.
// toRaw() keeps the client out of Vue's reactive proxy.
const authon = useAuthon()
const client = authon.client ? toRaw(authon.client) : null

const wallet = shallowRef<EmbeddedWallet | null>(null)
const message = ref('Hello from Authon')
const signature = ref<string | null>(null)
const busy = ref<Action>(null)
const error = shallowRef<unknown>(null)
const cleanups: Array<() => void> = []

async function run(action: Action, fn: () => Promise<void>) {
  busy.value = action
  error.value = null
  try {
    await fn()
  } catch (err) {
    error.value = err
  } finally {
    busy.value = null
  }
}

function load() {
  if (!client) return
  // ensure() returns the wallet, creating it on first use (autoCreate also does this after sign-in).
  void run('load', async () => {
    wallet.value = await client.wallet.ensure()
  })
}

function sign() {
  if (!client) return
  void run('sign', async () => {
    signature.value = null
    signature.value = await client.wallet.signMessage(message.value)
  })
}

// protect() and restore() open a passkey prompt, so they must run straight from a click.
function protect() {
  if (!client) return
  void run('protect', async () => {
    await client.wallet.protect()
    wallet.value = await client.wallet.get()
  })
}

function restore(resetOtherDevices: boolean) {
  if (!client) return
  void run('restore', async () => {
    await client.wallet.restore({ resetOtherDevices })
    wallet.value = await client.wallet.get()
  })
}

onMounted(() => {
  if (!client) return
  cleanups.push(client.on('walletChanged', (next) => { wallet.value = next }))
  cleanups.push(client.on('walletError', (err) => { error.value = err }))
  load()
})

onUnmounted(() => cleanups.forEach((off) => off()))
</script>

<template>
  <div v-if="client" class="panel">
    <div class="panel-title">Wallet</div>
    <p class="panel-desc">An embedded EVM wallet created for this account. The project must have wallets turned on.</p>

    <p v-if="busy === 'load' && !wallet" class="panel-desc">Loading wallet...</p>

    <template v-if="wallet">
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Address</span>
          <span class="info-value mono" :title="wallet.address">{{ wallet.address }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Passkey backup</span>
          <span :class="['info-badge', wallet.protected ? 'badge-green' : 'badge-yellow']">
            {{ wallet.protected ? 'Protected' : 'Not protected' }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">This browser</span>
          <span :class="['info-badge', wallet.needsRestore ? 'badge-yellow' : 'badge-green']">
            {{ wallet.needsRestore ? 'Needs restore' : 'Ready' }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Devices</span>
          <span class="info-value">{{ wallet.devices.length }}</span>
        </div>
      </div>

      <div v-if="wallet.needsRestore" class="field-row">
        <button class="btn btn-primary btn-sm" :disabled="busy !== null" @click="restore(false)">
          {{ busy === 'restore' ? 'Restoring...' : 'Restore wallet' }}
        </button>
        <button class="btn btn-outline btn-sm" :disabled="busy !== null" @click="restore(true)">
          Restore and reset other devices
        </button>
      </div>

      <button v-if="!wallet.protected && !wallet.needsRestore" class="btn btn-primary btn-sm" :disabled="busy !== null" @click="protect">
        {{ busy === 'protect' ? 'Protecting...' : 'Protect wallet' }}
      </button>

      <div class="field-row">
        <input v-model="message" class="field" />
        <button class="btn btn-outline btn-sm" :disabled="busy !== null || !message" @click="sign">
          {{ busy === 'sign' ? 'Signing...' : 'Sign message' }}
        </button>
      </div>
      <div v-if="signature" class="output">{{ signature }}</div>
    </template>

    <ErrorAlert :error="error" />
    <button v-if="!wallet && error !== null && busy === null" class="btn btn-outline btn-sm" @click="load">Try again</button>
  </div>
</template>
