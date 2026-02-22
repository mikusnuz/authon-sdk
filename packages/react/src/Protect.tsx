import type { ReactNode } from 'react';
import type { AuthupUser } from '@authup/shared';
import { useAuthup } from './useAuthup';

interface ProtectProps {
  children: ReactNode;
  fallback?: ReactNode;
  condition?: (user: AuthupUser) => boolean;
}

export function Protect({ children, fallback = null, condition }: ProtectProps) {
  const { isSignedIn, isLoading, user } = useAuthup();

  if (isLoading) return null;
  if (!isSignedIn || !user) return <>{fallback}</>;
  if (condition && !condition(user)) return <>{fallback}</>;

  return <>{children}</>;
}
