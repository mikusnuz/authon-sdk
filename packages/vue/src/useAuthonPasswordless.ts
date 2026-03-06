import { ref, inject } from 'vue';
import type { Ref } from 'vue';
import { AUTHON_KEY } from './plugin';
import type { AuthonState } from './plugin';

export interface UseAuthonPasswordlessReturn {
  sendMagicLink: (email: string) => Promise<boolean>;
  sendEmailOtp: (email: string) => Promise<boolean>;
  verifyPasswordless: (opts: { token?: string; email?: string; code?: string }) => Promise<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
}

export function useAuthonPasswordless(): UseAuthonPasswordlessReturn {
  const state = inject<AuthonState>(AUTHON_KEY);
  if (!state) {
    throw new Error('useAuthonPasswordless() must be called inside a component tree with createAuthon() installed');
  }
  const s = state;

  const isLoading = ref<boolean>(false);
  const error = ref<Error | null>(null);

  async function wrap<T>(fn: () => Promise<T>): Promise<T | null> {
    isLoading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function sendMagicLink(email: string): Promise<boolean> {
    const result = await wrap(() => s.client!.sendMagicLink(email));
    return result !== null;
  }

  async function sendEmailOtp(email: string): Promise<boolean> {
    const result = await wrap(() => s.client!.sendEmailOtp(email));
    return result !== null;
  }

  async function verifyPasswordless(opts: {
    token?: string;
    email?: string;
    code?: string;
  }): Promise<boolean> {
    const result = await wrap(() => s.client!.verifyPasswordless(opts));
    return result !== null;
  }

  return {
    sendMagicLink,
    sendEmailOtp,
    verifyPasswordless,
    isLoading,
    error,
  };
}
