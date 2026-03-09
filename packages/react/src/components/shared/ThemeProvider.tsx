import { createContext, useContext, useMemo } from 'react';
import type { ReactNode, CSSProperties } from 'react';
import type { BrandingConfig } from '@authon/shared';
import { DEFAULT_BRANDING } from '@authon/shared';

interface ResolvedTheme {
  primaryStart: string;
  primaryEnd: string;
  bg: string;
  text: string;
  textMuted: string;
  border: string;
  borderRadius: string;
  fontFamily: string;
  inputStyle: 'outline' | 'filled';
}

const ThemeContext = createContext<ResolvedTheme | null>(null);

export function useTheme(): ResolvedTheme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return resolveTheme(DEFAULT_BRANDING, false);
  }
  return ctx;
}

function resolveTheme(branding: BrandingConfig, _dark: boolean): ResolvedTheme {
  const radius = branding.borderRadius ?? DEFAULT_BRANDING.borderRadius ?? 12;
  return {
    primaryStart: branding.primaryColorStart ?? DEFAULT_BRANDING.primaryColorStart ?? '#7c3aed',
    primaryEnd: branding.primaryColorEnd ?? DEFAULT_BRANDING.primaryColorEnd ?? '#4f46e5',
    bg: branding.lightBg ?? DEFAULT_BRANDING.lightBg ?? '#ffffff',
    text: branding.lightText ?? DEFAULT_BRANDING.lightText ?? '#111827',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    borderRadius: `${radius}px`,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    inputStyle: 'outline',
  };
}

interface ThemeProviderProps {
  branding: BrandingConfig;
  children: ReactNode;
  overrides?: Partial<BrandingConfig>;
  style?: CSSProperties;
  className?: string;
}

export function ThemeProvider({ branding, children, overrides, style, className }: ThemeProviderProps) {
  const merged = useMemo(() => ({ ...branding, ...overrides }), [branding, overrides]);
  const theme = useMemo(() => resolveTheme(merged, false), [merged]);

  const cssVars = {
    '--authon-primary-start': theme.primaryStart,
    '--authon-primary-end': theme.primaryEnd,
    '--authon-bg': theme.bg,
    '--authon-text': theme.text,
    '--authon-text-muted': theme.textMuted,
    '--authon-border': theme.border,
    '--authon-radius': theme.borderRadius,
    '--authon-font': theme.fontFamily,
  } as CSSProperties;

  return (
    <ThemeContext.Provider value={theme}>
      <div
        className={className}
        style={{
          fontFamily: theme.fontFamily,
          color: theme.text,
          ...cssVars,
          ...style,
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
