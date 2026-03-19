<script lang="ts">
  import '../app.css'
  import { browser } from '$app/environment'
  import { initAuthon } from '@authon/svelte'
  import { env } from '$env/dynamic/public'

  if (browser) {
    const publishableKey = env.PUBLIC_AUTHON_PROJECT_ID || ''
    if (!publishableKey) {
      console.error('PUBLIC_AUTHON_PROJECT_ID is required. Copy .env.example to .env and fill in your project ID.')
    } else {
      const apiUrl = env.PUBLIC_AUTHON_API_URL || undefined
      initAuthon(publishableKey, apiUrl ? { apiUrl } : undefined)
    }
  }
</script>

<slot />
