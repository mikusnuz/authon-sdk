import type { ReactNode } from 'react';
import { useAuthon } from './useAuthon';

interface SignedOutProps {
  children: ReactNode;
}

export function SignedOut({ children }: SignedOutProps) {
  const { isSignedIn, isLoading } = useAuthon();
  if (isLoading || isSignedIn) return null;
  return <>{children}</>;
}
