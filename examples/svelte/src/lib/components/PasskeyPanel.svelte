<script lang="ts">
  import type { AuthonStore } from '@authon/svelte'
  import type { PasskeyCredential } from '@authon/shared'
  import ErrorAlert from './ErrorAlert.svelte'

  export let authon: AuthonStore

  let busy = false
  let error: unknown = null
  let registered: PasskeyCredential | null = null

  async function register() {
    busy = true
    error = null
    try {
      registered = await authon.passkeyRegister()
    } catch (err) {
      error = err
    } finally {
      busy = false
    }
  }
</script>

<div class="panel">
  <div class="panel-title">Passkeys</div>
  <p class="panel-desc">Add a passkey so you can sign in next time with Face ID, Touch ID or a security key.</p>
  <button class="btn btn-primary btn-sm" disabled={busy} on:click={register}>
    {busy ? 'Waiting for passkey...' : 'Register passkey'}
  </button>
  {#if registered}
    <div class="alert alert-success">Passkey registered: {registered.name || registered.id}</div>
  {/if}
  <ErrorAlert {error} />
</div>
