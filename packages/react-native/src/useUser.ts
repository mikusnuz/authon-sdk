import { useAuthon } from './useAuthon';
import type { AuthonUser } from './types';

export function useUser(): {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: AuthonUser | null;
} {
  const { isLoaded, isSignedIn, user } = useAuthon();
  return { isLoaded, isSignedIn, user };
}
