import type { AuthupUser } from '@authup/shared';
import { useAuthup } from './useAuthup';

export function useUser(): { user: AuthupUser | null; isLoading: boolean } {
  const { user, isLoading } = useAuthup();
  return { user, isLoading };
}
