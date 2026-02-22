import type { ReactNode } from 'react';
import { useAuthon } from './useAuthon';

interface SignedInProps {
  children: ReactNode;
}

export function SignedIn({ children }: SignedInProps) {
  const { isSignedIn, isLoading } = useAuthon();
  if (isLoading || !isSignedIn) return null;
  return <>{children}</>;
}
