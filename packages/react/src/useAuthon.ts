import { useContext } from 'react';
import { AuthonContext } from './AuthonProvider';
import type { AuthonContextValue } from './AuthonProvider';

export function useAuthon(): AuthonContextValue {
  const ctx = useContext(AuthonContext);
  if (!ctx) {
    throw new Error('useAuthon must be used within an <AuthonProvider>');
  }
  return ctx;
}
