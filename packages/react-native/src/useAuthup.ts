import { useContext } from 'react';
import { AuthupContext, type AuthupContextValue } from './AuthupProvider';

export function useAuthup(): AuthupContextValue {
  const context = useContext(AuthupContext);
  if (!context) {
    throw new Error('useAuthup must be used within an <AuthupProvider>');
  }
  return context;
}
