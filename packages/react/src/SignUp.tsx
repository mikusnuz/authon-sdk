import { useEffect } from 'react';
import { useAuthup } from './useAuthup';

interface SignUpProps {
  mode?: 'popup' | 'embedded';
}

export function SignUp({ mode = 'popup' }: SignUpProps) {
  const { client } = useAuthup();

  useEffect(() => {
    if (mode === 'popup') {
      client?.openSignUp();
    }
  }, [client, mode]);

  if (mode === 'embedded') {
    return <div id="authup-signup-container" />;
  }

  return null;
}
