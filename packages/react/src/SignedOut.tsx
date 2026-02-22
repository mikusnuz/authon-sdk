import type { ReactNode } from 'react';
import { useAuthup } from './useAuthup';

interface SignedOutProps {
  children: ReactNode;
}

export function SignedOut({ children }: SignedOutProps) {
  const { isSignedIn, isLoading } = useAuthup();
  if (isLoading || isSignedIn) return null;
  return <>{children}</>;
}
