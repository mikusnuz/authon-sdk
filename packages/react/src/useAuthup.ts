import { useContext } from 'react';
import { AuthupContext } from './AuthupProvider';
import type { AuthupContextValue } from './AuthupProvider';

export function useAuthup(): AuthupContextValue {
  const ctx = useContext(AuthupContext);
  if (!ctx) {
    throw new Error('useAuthup must be used within an <AuthupProvider>');
  }
  return ctx;
}
