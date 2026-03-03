import { useState, useEffect } from 'react';
import type { OAuthProviderType } from '@authon/shared';
import { useAuthon } from './useAuthon';
import { SocialButton } from './SocialButton';
import type { SocialButtonProps } from './SocialButton';

export interface SocialButtonsProps {
  /** Called after successful OAuth sign-in */
  onSuccess?: () => void;
  /** Called on OAuth error */
  onError?: (error: Error) => void;
  /** Container className */
  className?: string;
  /** Container style */
  style?: React.CSSProperties;
  /** Gap between buttons in px (default: 10, compact default: 12) */
  gap?: number;
  /** Compact mode — icon-only square buttons in a row (default: false) */
  compact?: boolean;
  /** Custom labels per provider. e.g. { google: 'Google로 로그인' } */
  labels?: Partial<Record<OAuthProviderType, string>>;
  /** Props to pass through to each SocialButton */
  buttonProps?: Partial<Omit<SocialButtonProps, 'provider' | 'onClick' | 'loading' | 'disabled' | 'compact' | 'label'>>;
}

export function SocialButtons({
  onSuccess,
  onError,
  className,
  style: userStyle,
  gap,
  compact = false,
  labels,
  buttonProps,
}: SocialButtonsProps) {
  const { client } = useAuthon();
  const [providers, setProviders] = useState<OAuthProviderType[]>([]);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  useEffect(() => {
    if (!client) return;
    client.getProviders().then((p: OAuthProviderType[]) => setProviders(p));
  }, [client]);

  if (providers.length === 0) return null;

  const resolvedGap = gap ?? (compact ? 12 : 10);

  const handleClick = async (provider: OAuthProviderType) => {
    if (!client) return;
    setLoadingProvider(provider);
    try {
      await client.signInWithOAuth(provider);
      onSuccess?.();
    } catch (e: any) {
      const error = e instanceof Error ? e : new Error(String(e));
      onError?.(error);
    } finally {
      setLoadingProvider(null);
    }
  };

  const containerStyle: React.CSSProperties = compact
    ? { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: resolvedGap, ...userStyle }
    : { display: 'flex', flexDirection: 'column', gap: resolvedGap, ...userStyle };

  return (
    <div className={className} style={containerStyle}>
      {providers.map((provider) => (
        <SocialButton
          key={provider}
          provider={provider}
          onClick={handleClick}
          loading={loadingProvider === provider}
          disabled={!!loadingProvider}
          compact={compact}
          label={labels?.[provider]}
          {...buttonProps}
        />
      ))}
    </div>
  );
}
