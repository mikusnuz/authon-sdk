import { useEffect, useRef } from 'react';
import { useAuthon } from './useAuthon';

interface SignInProps {
  mode?: 'popup' | 'embedded';
  redirectUrl?: string;
}

export function SignIn({ mode = 'popup' }: SignInProps) {
  const { client } = useAuthon();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mode === 'popup') {
      client?.openSignIn();
    }
  }, [client, mode]);

  if (mode === 'embedded') {
    return <div ref={containerRef} id="authon-signin-container" />;
  }

  return null;
}
