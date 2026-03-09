import type { CSSProperties } from 'react';
import { useTheme } from './ThemeProvider';

interface DividerProps {
  label?: string;
}

export function Divider({ label = 'Or continue with' }: DividerProps) {
  const theme = useTheme();

  const containerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    margin: '4px 0',
  };

  const lineStyle: CSSProperties = {
    flex: 1,
    height: 1,
    background: theme.border,
  };

  const textStyle: CSSProperties = {
    fontSize: 13,
    color: theme.textMuted,
    whiteSpace: 'nowrap',
    fontWeight: 400,
  };

  return (
    <div style={containerStyle}>
      <div style={lineStyle} />
      <span style={textStyle}>{label}</span>
      <div style={lineStyle} />
    </div>
  );
}
