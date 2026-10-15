export interface AuthonErrorInfo {
  code: string
  message: string
  hint?: string
}

const HINTS: Record<string, string> = {
  AUTH_METHOD_DISABLED:
    'This sign-in method is turned off for the project. Turn it on in the Authon dashboard under Providers.',
  FORBIDDEN:
    'The project refused the wallet request. Usually this means embedded wallets are turned off: turn them on in the Authon dashboard under Advanced > Embedded wallets.',
  PRF_UNSUPPORTED:
    'This browser or passkey provider does not support the passkey PRF extension the wallet needs. Try a recent Chrome, Edge or Safari with a platform passkey.',
  NEEDS_RESTORE:
    'This browser does not hold your wallet key. Click "Restore wallet" and confirm with the passkey that protects it.',
  NOT_PROTECTED:
    'This wallet has no passkey backup yet, so it cannot be restored here. Protect it on the device that created it first.',
  ORIGIN_NOT_ALLOWED: "This site's origin is not in the project's allowed origins. Add it in the Authon dashboard.",
  NOT_CONFIGURED: 'Set wallet.origin in the Authon config when you use a custom apiUrl.',
  NOT_SIGNED_IN: 'Sign in first.',
  UNAUTHORIZED: 'Your session expired. Sign in again.',
  USER_CANCELLED: 'The passkey prompt was cancelled.',
  NotAllowedError: 'The passkey prompt was cancelled or timed out.',
  NEEDS_POPUP: 'The browser needs a popup to show the passkey prompt. Allow popups for this site and try again.',
  POPUP_BLOCKED: 'The browser blocked the wallet popup. Allow popups for this site and try again.',
  TIMEOUT: 'The wallet did not answer in time. Check your connection and try again.',
  RATE_LIMITED: 'Too many requests. Wait a moment and try again.',
}

/**
 * Wallet errors (AuthonWalletError) carry a `code`. Auth API errors from @authon/js only carry the
 * server message, so a disabled sign-in method (403 AUTH_METHOD_DISABLED) is recognised by its text.
 */
export function describeAuthonError(err: unknown): AuthonErrorInfo {
  const message = err instanceof Error ? err.message : String(err)
  const raw = (err as { code?: unknown; name?: unknown } | null) ?? {}
  let code = typeof raw.code === 'string' ? raw.code : ''
  if (!code && /turned off for this project/i.test(message)) code = 'AUTH_METHOD_DISABLED'
  if (!code && typeof raw.name === 'string' && raw.name !== 'Error') code = raw.name
  if (!code) code = 'ERROR'
  return { code, message, hint: HINTS[code] }
}
