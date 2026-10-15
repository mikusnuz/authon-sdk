# @authon/js

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
