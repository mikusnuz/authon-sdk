import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuthon, SocialButtons as AuthonSocialButtons } from '@authon/react-native';
import type { OAuthProviderType } from '@authon/react-native';

interface SocialButtonsProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  compact?: boolean;
}

export function SocialButtons({ onSuccess, onError, compact = false }: SocialButtonsProps) {
  const { startOAuth, completeOAuth, providers } = useAuthon();
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuth = async (provider: OAuthProviderType) => {
    setLoadingProvider(provider);
    try {
      const { url, state } = await startOAuth(provider);
      const result = await WebBrowser.openAuthSessionAsync(url);
      if (result.type !== 'success') {
        throw new Error('OAuth cancelled');
      }
      await completeOAuth(state);
      onSuccess?.();
    } catch (e) {
      const error = e instanceof Error ? e : new Error(String(e));
      onError?.(error);
    } finally {
      setLoadingProvider(null);
    }
  };

  if (providers.length === 0) return null;

  return (
    <View style={compact ? styles.compactContainer : styles.container}>
      <AuthonSocialButtons
        onSuccess={onSuccess}
        onError={onError}
        compact={compact}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  compactContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
});
