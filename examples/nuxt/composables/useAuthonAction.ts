import { ref, shallowRef } from 'vue'

/** Tracks loading and error state for one Authon call at a time. */
export function useAuthonAction() {
  const isLoading = ref(false)
  const error = shallowRef<unknown>(null)

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    isLoading.value = true
    error.value = null
    try {
      return await fn()
    } catch (err) {
      error.value = err
      return null
    } finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, run }
}
