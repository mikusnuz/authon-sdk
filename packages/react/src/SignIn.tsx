import { useEffect, useRef } from 'react';
import { useAuthup } from './useAuthup';

interface SignInProps {
  mode?: 'popup' | 'embedded';
  redirectUrl?: string;
}

export function SignIn({ mode = 'popup' }: SignInProps) {
  const { client } = useAuthup();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'popup') {
      client?.openSignIn();
    }
  }, [client, mode]);

  if (mode === 'embedded') {
    return <div ref={containerRef} id="authup-signin-container" />;
  }

  return null;
}
