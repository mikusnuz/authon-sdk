import { useContext } from 'react';
import { AuthonContext, type AuthonContextValue } from './AuthonProvider';

export function useAuthon(): AuthonContextValue {
  const context = useContext(AuthonContext);
  if (!context) {
    throw new Error('useAuthon must be used within an <AuthonProvider>');
  }
  return context;
}
