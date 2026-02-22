import { useAuthup } from './useAuthup';
import type { AuthupUser } from './types';

export function useUser(): {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AuthupUser | null;
} {
  const { isLoaded, isSignedIn, user } = useAuthup();
  return { isLoaded, isSignedIn, user };
}
