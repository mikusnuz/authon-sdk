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
  /** Gap between buttons (default: 10) */
  gap?: number;
  /** Props to pass through to each SocialButton */
  buttonProps?: Partial<Omit<SocialButtonProps, 'provider' | 'onPress' | 'loading' | 'disabled'>>;
}

export function SocialButtons({
  onSuccess,
  onError,
  style,
  gap = 10,
  buttonProps,
}: SocialButtonsProps) {
  const { providers, startOAuth, completeOAuth } = useAuthon();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  if (providers.length === 0) return null;

  const handlePress = async (provider: OAuthProviderType) => {
    setLoadingProvider(provider);
    try {
      const { url, state } = await startOAuth(provider);
      await Linking.openURL(url);
      await completeOAuth(state);
      onSuccess?.();
    } catch (e: any) {
      const error = e instanceof Error ? e : new Error(String(e));
      if (error.message !== 'OAuth timeout') {
        onError?.(error);
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View style={[styles.container, { gap }, style]}>
      {providers.map((provider) => (
        <SocialButton
          key={provider}
          provider={provider}
          onPress={handlePress}
          loading={loadingProvider === provider}
          disabled={!!loadingProvider}
          {...buttonProps}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
});
