<script lang="ts">
  import type { AuthonStore } from '@authon/svelte'
  import ErrorAlert from './ErrorAlert.svelte'

  export let authon: AuthonStore

  let email = ''
  let code = ''
  let step: 'email' | 'code' | 'link-sent' = 'email'
  let busy = false
  let error: unknown = null

  async function run(fn: () => Promise<unknown>): Promise<boolean> {
    busy = true
    error = null
    try {
      await fn()
      return true
    } catch (err) {
      error = err
      return false
    } finally {
      busy = false
    }
  }

  async function sendCode() {
    if (await run(() => authon.passwordlessSendCode(email, 'otp'))) step = 'code'
  }

  async function sendLink() {
    // The link opens this page; the SDK finishes the sign-in on load (autoHandleMagicLink).
    if (await run(() => authon.passwordlessSendCode(email, 'magic-link'))) step = 'link-sent'
  }

  async function verifyCode() {
    await run(() => authon.passwordlessVerifyCode(email, code.trim()))
  }

  async function signInWithPasskey() {
    await run(() => authon.passkeyAuthenticate(email || undefined))
  }

  function reset() {
    step = 'email'
    code = ''
  }
</script>

<div class="panel">
  <div class="panel-title">Sign in without a password</div>
  <p class="panel-desc">Get a one-time code or a magic link by email, or use a passkey saved on this device.</p>

  {#if step === 'email'}
    <input bind:value={email} class="field" type="email" placeholder="you@example.com" />
    <div class="field-row">
      <button class="btn btn-primary btn-sm" disabled={busy || !email} on:click={sendCode}>Email me a code</button>
      <button class="btn btn-outline btn-sm" disabled={busy || !email} on:click={sendLink}>Send magic link</button>
    </div>
  {:else if step === 'code'}
    <p class="panel-desc">Enter the code sent to {email}.</p>
    <div class="field-row">
      <input bind:value={code} class="field" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" />
      <button class="btn btn-primary btn-sm" disabled={busy || !code} on:click={verifyCode}>Verify code</button>
    </div>
    <button class="btn-link" on:click={reset}>Use a different email</button>
  {:else}
    <div class="alert alert-success">Magic link sent to {email}. Open it in this browser to finish signing in.</div>
    <button class="btn-link" on:click={reset}>Use a different email</button>
  {/if}

  <div class="panel-divider"><span>or</span></div>
  <button class="btn btn-outline btn-sm" disabled={busy} on:click={signInWithPasskey}>Sign in with passkey</button>

  <ErrorAlert {error} />
</div>
