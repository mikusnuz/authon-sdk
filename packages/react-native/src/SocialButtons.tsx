import React, { useState } from 'react';
import { View, StyleSheet, Linking, type ViewStyle } from 'react-native';
import type { OAuthProviderType } from '@authon/shared';
import { useAuthon } from './useAuthon';
import { SocialButton, type SocialButtonProps } from './SocialButton';

export interface SocialButtonsProps {
  /** Called after successful OAuth sign-in */
  onSuccess?: () => void;
  /** Called on OAuth error */
  onError?: (error: Error) => void;
  /** Container style */
  style?: ViewStyle;
  /** Gap between buttons (default: 10, compact default: 12) */
  gap?: number;
  /** Compact mode — icon-only square buttons in a row (default: false) */
  compact?: boolean;
  /** Custom labels per provider. e.g. { google: 'Google로 로그인' } */
  labels?: Partial<Record<OAuthProviderType, string>>;
  /** Props to pass through to each SocialButton */
  buttonProps?: Partial<Omit<SocialButtonProps, 'provider' | 'onPress' | 'loading' | 'disabled' | 'compact' | 'label'>>;
}

export function SocialButtons({
  onSuccess,
  onError,
  style,
  gap,
  compact = false,
  labels,
  buttonProps,
}: SocialButtonsProps) {
  const { providers, startOAuth, completeOAuth } = useAuthon();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  if (providers.length === 0) return null;

  const resolvedGap = gap ?? (compact ? 12 : 10);

  const handlePress = async (provider: OAuthProviderType) => {
    setLoadingProvider(provider);
    try {
      const { url, state } = await startOAuth(provider);
      await Linking.openURL(url);
      await completeOAuth(state);
      onSuccess?.();
    } catch (e: any) {
      const error = e instanceof Error ? e : new Error(String(e));
      onError?.(error);
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View
      style={[
        compact ? styles.compactContainer : styles.container,
        { gap: resolvedGap },
        style,
      ]}
    >
      {providers.map((provider) => (
        <SocialButton
          key={provider}
          provider={provider}
          onPress={handlePress}
          loading={loadingProvider === provider}
          disabled={!!loadingProvider}
          compact={compact}
          label={labels?.[provider]}
          {...buttonProps}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  compactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
});
