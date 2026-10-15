<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import type { AuthonStore } from '@authon/svelte'
  import type { EmbeddedWallet } from '@authon/js'
  import ErrorAlert from './ErrorAlert.svelte'

  export let authon: AuthonStore

  type Action = 'load' | 'sign' | 'protect' | 'restore' | null

  // @authon/svelte has no wallet store, so the panel uses the core client: authon.client.wallet.
  const client = authon.client
  let wallet: EmbeddedWallet | null = null
  let message = 'Hello from Authon'
  let signature: string | null = null
  let busy: Action = null
  let error: unknown = null
  const cleanups: Array<() => void> = []

  async function run(action: Action, fn: () => Promise<void>) {
    busy = action
    error = null
    try {
      await fn()
    } catch (err) {
      error = err
    } finally {
      busy = null
    }
  }

  function load() {
    // ensure() returns the wallet, creating it on first use (autoCreate also does this after sign-in).
    void run('load', async () => {
      wallet = await client.wallet.ensure()
    })
  }

  function sign() {
    void run('sign', async () => {
      signature = null
      signature = await client.wallet.signMessage(message)
    })
  }

  // protect() and restore() open a passkey prompt, so they must run straight from a click.
  function protect() {
    void run('protect', async () => {
      await client.wallet.protect()
      wallet = await client.wallet.get()
    })
  }

  function restore(resetOtherDevices: boolean) {
    void run('restore', async () => {
      await client.wallet.restore({ resetOtherDevices })
      wallet = await client.wallet.get()
    })
  }

  onMount(() => {
    cleanups.push(client.on('walletChanged', (next) => { wallet = next }))
    cleanups.push(client.on('walletError', (err) => { error = err }))
    load()
  })

  onDestroy(() => cleanups.forEach((off) => off()))
</script>

<div class="panel">
  <div class="panel-title">Wallet</div>
  <p class="panel-desc">An embedded EVM wallet created for this account. The project must have wallets turned on.</p>

  {#if busy === 'load' && !wallet}
    <p class="panel-desc">Loading wallet...</p>
  {/if}

  {#if wallet}
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">Address</span>
        <span class="info-value mono" title={wallet.address}>{wallet.address}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Passkey backup</span>
        <span class="info-badge {wallet.protected ? 'badge-green' : 'badge-yellow'}">
          {wallet.protected ? 'Protected' : 'Not protected'}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">This browser</span>
        <span class="info-badge {wallet.needsRestore ? 'badge-yellow' : 'badge-green'}">
          {wallet.needsRestore ? 'Needs restore' : 'Ready'}
        </span>
      </div>
      <div class="info-row">
        <span class="info-label">Devices</span>
        <span class="info-value">{wallet.devices.length}</span>
      </div>
    </div>

    {#if wallet.needsRestore}
      <div class="field-row">
        <button class="btn btn-primary btn-sm" disabled={busy !== null} on:click={() => restore(false)}>
          {busy === 'restore' ? 'Restoring...' : 'Restore wallet'}
        </button>
        <button class="btn btn-outline btn-sm" disabled={busy !== null} on:click={() => restore(true)}>
          Restore and reset other devices
        </button>
      </div>
    {/if}

    {#if !wallet.protected && !wallet.needsRestore}
      <button class="btn btn-primary btn-sm" disabled={busy !== null} on:click={protect}>
        {busy === 'protect' ? 'Protecting...' : 'Protect wallet'}
      </button>
    {/if}

    <div class="field-row">
      <input bind:value={message} class="field" />
      <button class="btn btn-outline btn-sm" disabled={busy !== null || !message} on:click={sign}>
        {busy === 'sign' ? 'Signing...' : 'Sign message'}
      </button>
    </div>
    {#if signature}
      <div class="output">{signature}</div>
    {/if}
  {/if}

  <ErrorAlert {error} />
  {#if !wallet && error !== null && busy === null}
    <button class="btn btn-outline btn-sm" on:click={load}>Try again</button>
  {/if}
</div>
