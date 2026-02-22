import type { ReactNode } from 'react';
import type { AuthonUser } from '@authon/shared';
import { useAuthon } from './useAuthon';

interface ProtectProps {
  children: ReactNode;
  fallback?: ReactNode;
  condition?: (user: AuthonUser) => boolean;
}

export function Protect({ children, fallback = null, condition }: ProtectProps) {
  const { isSignedIn, isLoading, user } = useAuthon();

  if (isLoading) return null;
  if (!isSignedIn || !user) return <>{fallback}</>;
  if (condition && !condition(user)) return <>{fallback}</>;

  return <>{children}</>;
}
