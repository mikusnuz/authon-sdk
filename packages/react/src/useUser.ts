import type { AuthonUser } from '@authon/shared';
import { useAuthon } from './useAuthon';

export function useUser(): { user: AuthonUser | null; isLoading: boolean } {
  const { user, isLoading } = useAuthon();
  return { user, isLoading };
}
