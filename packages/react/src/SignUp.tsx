import { useEffect } from 'react';
import { useAuthon } from './useAuthon';

interface SignUpProps {
  mode?: 'popup' | 'embedded';
}

export function SignUp({ mode = 'popup' }: SignUpProps) {
  const { client } = useAuthon();

  useEffect(() => {
    if (mode === 'popup') {
      client?.openSignUp();
    }
  }, [client, mode]);

  if (mode === 'embedded') {
    return <div id="authon-signup-container" />;
  }

  return null;
}
