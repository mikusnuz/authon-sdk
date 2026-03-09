import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from './ThemeProvider';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'social' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  children: ReactNode;
  onClick?: () => void | Promise<void>;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
}

const SPINNER_STYLE: CSSProperties = {
  display: 'inline-block',
  width: 16,
  height: 16,
  border: '2px solid currentColor',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'authon-spin 0.6s linear infinite',
  flexShrink: 0,
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  style: userStyle,
}: ButtonProps) {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);

  const sizeMap: Record<ButtonSize, CSSProperties> = {
    sm: { height: 36, paddingLeft: 12, paddingRight: 12, fontSize: 13 },
    md: { height: 44, paddingLeft: 16, paddingRight: 16, fontSize: 15 },
    lg: { height: 52, paddingLeft: 20, paddingRight: 20, fontSize: 16 },
  };

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    fontWeight: 600,
    border: 'none',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.15s, transform 0.1s',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.55 : hovered && !disabled && !loading ? 0.88 : 1,
    transform: hovered && !disabled && !loading ? 'translateY(-1px)' : undefined,
    userSelect: 'none',
    ...sizeMap[size],
  };

  let variantStyle: CSSProperties = {};
  switch (variant) {
    case 'primary':
      variantStyle = {
        background: `linear-gradient(135deg, ${theme.primaryStart}, ${theme.primaryEnd})`,
        color: '#ffffff',
        boxShadow: hovered ? `0 4px 16px ${theme.primaryStart}55` : '0 2px 8px rgba(0,0,0,0.1)',
      };
      break;
    case 'secondary':
      variantStyle = {
        background: `${theme.primaryStart}18`,
        color: theme.primaryStart,
      };
      break;
    case 'outline':
      variantStyle = {
        background: 'transparent',
        color: theme.text,
        border: `1.5px solid ${theme.border}`,
      };
      break;
    case 'ghost':
      variantStyle = {
        background: 'transparent',
        color: theme.textMuted,
      };
      break;
    case 'social':
      variantStyle = {
        background: theme.bg,
        color: theme.text,
        border: `1.5px solid ${theme.border}`,
      };
      break;
  }

  return (
    <>
      <style>{`@keyframes authon-spin { to { transform: rotate(360deg); } }`}</style>
      <button
        type={type}
        disabled={disabled || loading}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ ...base, ...variantStyle, ...userStyle }}
      >
        {loading ? <span style={SPINNER_STYLE} /> : children}
      </button>
    </>
  );
}
