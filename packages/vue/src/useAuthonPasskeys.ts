import { ref, inject } from 'vue';
import type { Ref } from 'vue';
import type { PasskeyCredential } from '@authon/shared';
import { AUTHON_KEY } from './plugin';
import type { AuthonState } from './plugin';

export interface UseAuthonPasskeysReturn {
  registerPasskey: (name?: string) => Promise<PasskeyCredential | null>;
  authenticateWithPasskey: (email?: string) => Promise<boolean>;
  listPasskeys: () => Promise<PasskeyCredential[] | null>;
  renamePasskey: (id: string, name: string) => Promise<PasskeyCredential | null>;
  revokePasskey: (id: string) => Promise<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
}

export function useAuthonPasskeys(): UseAuthonPasskeysReturn {
  const state = inject<AuthonState>(AUTHON_KEY);
  if (!state) {
    throw new Error('useAuthonPasskeys() must be called inside a component tree with createAuthon() installed');
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

  async function registerPasskey(name?: string): Promise<PasskeyCredential | null> {
    return wrap(() => s.client!.registerPasskey(name));
  }

  async function authenticateWithPasskey(email?: string): Promise<boolean> {
    const result = await wrap(() => s.client!.authenticateWithPasskey(email));
    return result !== null;
  }

  async function listPasskeys(): Promise<PasskeyCredential[] | null> {
    return wrap(() => s.client!.listPasskeys());
  }

  async function renamePasskey(id: string, name: string): Promise<PasskeyCredential | null> {
    return wrap(() => s.client!.renamePasskey(id, name));
  }

  async function revokePasskey(id: string): Promise<boolean> {
    const result = await wrap(() => s.client!.revokePasskey(id));
    return result !== null;
  }

  return {
    registerPasskey,
    authenticateWithPasskey,
    listPasskeys,
    renamePasskey,
    revokePasskey,
    isLoading,
    error,
  };
}
