import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { PROVIDER_COLORS, PROVIDER_DISPLAY_NAMES, type OAuthProviderType } from '@authon/shared';
import { ProviderIcon } from './icons';

export interface SocialButtonProps {
  provider: OAuthProviderType;
  onPress: (provider: OAuthProviderType) => void;
  loading?: boolean;
  disabled?: boolean;
  /** Override button label. Default: "Continue with {Provider}" */
  label?: string;
  /** Compact mode — icon-only square button (default: false) */
  compact?: boolean;
  /** Override button style */
  style?: ViewStyle;
  /** Override label text style */
  labelStyle?: TextStyle;
  /** Icon size (default: 20, compact default: 24) */
  iconSize?: number;
  /** Border radius (default: 10) */
  borderRadius?: number;
  /** Button height (default: 48) */
  height?: number;
  /** Button size for compact mode (default: 48) */
  size?: number;
}

export function SocialButton({
  provider,
  onPress,
  loading = false,
  disabled = false,
  label,
  compact = false,
  style,
  labelStyle,
  iconSize,
  borderRadius = 10,
  height = 48,
  size = 48,
}: SocialButtonProps) {
  const colors = PROVIDER_COLORS[provider] || { bg: '#333', text: '#fff' };
  const displayName = PROVIDER_DISPLAY_NAMES[provider] || provider;
  const buttonLabel = label ?? `Continue with ${displayName}`;
  const needsBorder = colors.bg.toLowerCase() === '#ffffff';
  const resolvedIconSize = iconSize ?? (compact ? 24 : 20);

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactButton,
          {
            backgroundColor: colors.bg,
            borderRadius,
            width: size,
            height: size,
          },
          needsBorder && styles.bordered,
          style,
        ]}
        onPress={() => onPress(provider)}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color={colors.text} size="small" />
        ) : (
          <ProviderIcon provider={provider} size={resolvedIconSize} color={colors.text} />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.bg,
          borderRadius,
          height,
        },
        needsBorder && styles.bordered,
        style,
      ]}
      onPress={() => onPress(provider)}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <>
          <ProviderIcon provider={provider} size={resolvedIconSize} color={colors.text} />
          <Text
            style={[
              styles.label,
              { color: colors.text },
              labelStyle,
            ]}
            numberOfLines={1}
          >
            {buttonLabel}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  compactButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: {
    borderWidth: 1,
    borderColor: '#dadce0',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
