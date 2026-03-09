import { useState } from 'react';
import type { CSSProperties, InputHTMLAttributes } from 'react';
import { useTheme } from './ThemeProvider';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  inputStyle?: 'outline' | 'filled';
  onChange?: (value: string) => void;
  rightElement?: React.ReactNode;
}

export function Input({
  label,
  error,
  hint,
  inputStyle,
  onChange,
  rightElement,
  style: userStyle,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const resolvedStyle = inputStyle ?? theme.inputStyle;

  const wrapperStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    width: '100%',
  };

  const labelStyle: CSSProperties = {
    fontSize: 13,
    fontWeight: 500,
    color: error ? '#ef4444' : theme.text,
  };

  const inputContainerStyle: CSSProperties = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const baseInputStyle: CSSProperties = {
    width: '100%',
    height: 44,
    paddingLeft: 14,
    paddingRight: rightElement ? 44 : 14,
    borderRadius: theme.borderRadius,
    fontFamily: theme.fontFamily,
    fontSize: 15,
    color: theme.text,
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
    boxSizing: 'border-box',
    ...userStyle,
  };

  let inputVariantStyle: CSSProperties = {};
  if (resolvedStyle === 'filled') {
    inputVariantStyle = {
      background: focused ? `${theme.primaryStart}0d` : '#f3f4f6',
      border: `1.5px solid ${error ? '#ef4444' : focused ? theme.primaryStart : 'transparent'}`,
      boxShadow: focused && !error ? `0 0 0 3px ${theme.primaryStart}22` : 'none',
    };
  } else {
    inputVariantStyle = {
      background: theme.bg,
      border: `1.5px solid ${error ? '#ef4444' : focused ? theme.primaryStart : theme.border}`,
      boxShadow: focused && !error ? `0 0 0 3px ${theme.primaryStart}22` : 'none',
    };
  }

  const rightStyle: CSSProperties = {
    position: 'absolute',
    right: 12,
    display: 'flex',
    alignItems: 'center',
    color: theme.textMuted,
  };

  const hintStyle: CSSProperties = {
    fontSize: 12,
    color: error ? '#ef4444' : theme.textMuted,
  };

  return (
    <div style={wrapperStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputContainerStyle}>
        <input
          {...rest}
          style={{ ...baseInputStyle, ...inputVariantStyle }}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          onChange={(e) => onChange?.(e.target.value)}
        />
        {rightElement && <div style={rightStyle}>{rightElement}</div>}
      </div>
      {(error || hint) && <span style={hintStyle}>{error ?? hint}</span>}
    </div>
  );
}
