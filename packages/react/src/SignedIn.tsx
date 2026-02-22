import type { ReactNode } from 'react';
import { useAuthup } from './useAuthup';

interface SignedInProps {
  children: ReactNode;
}

export function SignedIn({ children }: SignedInProps) {
  const { isSignedIn, isLoading } = useAuthup();
  if (isLoading || !isSignedIn) return null;
  return <>{children}</>;
}
