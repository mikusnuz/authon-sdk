# @authon/js

## 0.9.2

- Send `mfaCapable` on passwordless and web3 verification so accounts with MFA get the second-factor step (older SDKs keep the previous behavior on the server).

## 0.9.1

### Breaking Changes

- OAuth now requires an Authon API with PKCE OAuth (`POST /v1/auth/oauth/token`). Redirect-mode OAuth (`flowMode: 'redirect'`, a provider configured for redirect, or the automatic redirect fallback when a popup is blocked) only completes with this SDK version or later; 0.9.0 and earlier cannot finish redirect sign-in against the updated API.
- A one-time OAuth code is burned after 3 exchanges with a wrong verifier instead of the first one.

### Patch Changes

- OAuth sign-in for users with MFA throws `AuthonMfaRequiredError` and emits `mfaRequired`; finish with `verifyMfa(mfaToken, code)`.

## 0.9.0

### Minor Changes

- Add embedded wallets: `authon.wallet` creates a non-custodial HD wallet per user (BIP39 seed in 2-of-3 shares: device, Authon, passkey backup; EVM account m/44'/60'/0'/0/0) with sign, protect, restore and an EIP-1193 provider.
- Fix passkey registration and sign-in (option and verify body shapes).
- Verify magic links automatically on page load (`autoHandleMagicLink`, `handleMagicLink()`).
- Passwordless button text follows the project's method (magic link or 6-digit code).
- Social buttons use the modal language ("Continue with" was always English).

## 0.8.1

- Track the refresh response contract that returns the replacement Authon session ID.

## 0.8.0

### Minor Changes

- Add BFF-safe Authorization Code + PKCE authentication, browser-storage-free JS mode, and Next.js server transaction/exchange/revoke helpers.

### Patch Changes

- Updated dependencies []:
  - @authon/shared@0.8.0

## 0.7.17

### Patch Changes

- No core browser runtime API changes. This release keeps the fixed Authon SDK version group synchronized.

- Updated dependencies:
  - @authon/shared@0.7.17

## 0.7.16

### Patch Changes

- No core browser runtime API changes. This release keeps the fixed Authon SDK version group synchronized.

- Updated dependencies:
  - @authon/shared@0.7.16

## 0.7.15

### Patch Changes

- Harden session readiness, restoration, refresh, sign-out, persistence, and change-event contracts, including stale-request invalidation and provider synchronization.

- Updated dependencies [[`caec43c`](https://github.com/mikusnuz/authon-sdk/commit/caec43cb40e0e0f173201723bbc31affce42b48d)]:
  - @authon/shared@0.7.15

## 0.1.17

### Patch Changes

- Add provider-level OAuth flow support (auto/popup/redirect), redirect handoff recovery, and framework session-restore alignment.

- Updated dependencies []:
  - @authon/shared@0.1.17
