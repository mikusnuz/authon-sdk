import { PROVIDER_COLORS, PROVIDER_DISPLAY_NAMES, type OAuthProviderType } from '@authon/shared';
import { getProviderButtonConfig } from '@authon/js';

export interface SocialButtonProps {
  provider: OAuthProviderType;
  onClick: (provider: OAuthProviderType) => void | Promise<void>;
  loading?: boolean;
  disabled?: boolean;
  /** Override button label. Default: "Continue with {Provider}" */
  label?: string;
  /** Compact mode — icon-only square button (default: false) */
  compact?: boolean;
  /** Override button className */
  className?: string;
  /** Override button style */
  style?: React.CSSProperties;
  /** Icon size (default: 20, compact default: 24) */
  iconSize?: number;
  /** Border radius in px (default: 10) */
  borderRadius?: number;
  /** Button height in px (default: 48) */
  height?: number;
  /** Button size for compact mode in px (default: 48) */
  size?: number;
}

const baseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  paddingLeft: 16,
  paddingRight: 16,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'opacity 0.15s',
  width: '100%',
};

const compactBaseStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  cursor: 'pointer',
  transition: 'opacity 0.15s',
  padding: 0,
};

export function SocialButton({
  provider,
  onClick,
  loading = false,
  disabled = false,
  label,
  compact = false,
  className,
  style: userStyle,
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
  const config = getProviderButtonConfig(provider);
  const iconSvg = config.iconSvg.replace(/width="\d+"/, `width="${resolvedIconSize}"`).replace(/height="\d+"/, `height="${resolvedIconSize}"`);

  const borderProps = needsBorder
    ? { border: '1px solid #dadce0' }
    : {};

  if (compact) {
    return (
      <button
        className={className}
        style={{
          ...compactBaseStyle,
          backgroundColor: colors.bg,
          borderRadius,
          width: size,
          height: size,
          ...borderProps,
          ...userStyle,
        }}
        onClick={() => onClick(provider)}
        disabled={disabled || loading}
        aria-label={`Sign in with ${displayName}`}
      >
        {loading ? (
          <span
            style={{
              display: 'inline-block',
              width: 16,
              height: 16,
              border: `2px solid ${colors.text}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'authon-spin 0.6s linear infinite',
            }}
          />
        ) : (
          <span
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
            dangerouslySetInnerHTML={{ __html: iconSvg }}
          />
        )}
      </button>
    );
  }

  return (
    <button
      className={className}
      style={{
        ...baseStyle,
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius,
        height,
        ...borderProps,
        ...userStyle,
      }}
      onClick={() => onClick(provider)}
      disabled={disabled || loading}
      aria-label={`Sign in with ${displayName}`}
    >
      {loading ? (
        <span
          style={{
            display: 'inline-block',
            width: 16,
            height: 16,
            border: `2px solid ${colors.text}`,
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'authon-spin 0.6s linear infinite',
          }}
        />
      ) : (
        <>
          <span
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}
            dangerouslySetInnerHTML={{ __html: iconSvg }}
          />
          <span style={{ fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {buttonLabel}
          </span>
        </>
      )}
    </button>
  );
}
