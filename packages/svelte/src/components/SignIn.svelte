<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { Authon } from '@authon/js';
  import type { AuthonUser } from '@authon/shared';

  export let publishableKey: string;
  export let apiUrl: string = 'https://api.authon.dev';
  export let theme: 'light' | 'dark' | 'auto' = 'auto';
  export let locale: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ signIn: { user: AuthonUser } }>();

  let container: HTMLDivElement;
  let authonInstance: Authon | null = null;
  let unsubscribe: (() => void) | null = null;
  const containerId = `authon-signin-${Math.random().toString(36).slice(2, 8)}`;

  onMount(() => {
    container.id = containerId;
    authonInstance = new Authon(publishableKey, {
      mode: 'embedded',
      containerId,
      apiUrl,
      theme,
      locale,
    });
    unsubscribe = authonInstance.on('signedIn', (user) => {
      dispatch('signIn', { user: user as AuthonUser });
    });
    authonInstance.openSignIn();
  });

  onDestroy(() => {
    unsubscribe?.();
    authonInstance?.destroy();
  });
</script>

<div bind:this={container}></div>
