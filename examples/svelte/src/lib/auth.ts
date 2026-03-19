import { goto } from '$app/navigation'
import { base } from '$app/paths'
import { get } from 'svelte/store'
import type { AuthonStore } from '@authon/svelte'

export function requireAuth(store: AuthonStore): boolean {
  const signedIn = get(store.isSignedIn)
  if (!signedIn) {
    goto(`${base}/sign-in`)
    return false
  }
  return true
}
