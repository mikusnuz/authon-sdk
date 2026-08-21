# @authon/nuxt

## 0.7.17

### Patch Changes

- Register Authon Vue components with Nuxt auto-imports and stop generated pages from importing the protected module entry directly.

- Updated dependencies:
  - @authon/shared@0.7.17
  - @authon/js@0.7.17
  - @authon/vue@0.7.17

## 0.7.16

### Patch Changes

- [`fbd1b23`](https://github.com/mikusnuz/authon-sdk/commit/fbd1b23b83e9d3a902f90525cf66ce15432cab41) Thanks [@mikusnuz](https://github.com/mikusnuz)! - Declare the Node.js `^20.19.0 || >=22.12.0` requirement used by Nuxt 3.21 and document it in both package READMEs. Runtime APIs are unchanged.

- Updated dependencies:
  - @authon/shared@0.7.16
  - @authon/js@0.7.16
  - @authon/vue@0.7.16

## 0.7.15

### Patch Changes

- Ship a real SSR-safe Nuxt module with runtime configuration, plugin hydration, auto-imported composables, optional middleware, cleanup, and dual ESM/CJS package support.

- Updated dependencies [[`caec43c`](https://github.com/mikusnuz/authon-sdk/commit/caec43cb40e0e0f173201723bbc31affce42b48d)]:
  - @authon/shared@0.7.15
  - @authon/js@0.7.15
  - @authon/vue@0.7.15

## 0.1.17

### Patch Changes

- Add provider-level OAuth flow support (auto/popup/redirect), redirect handoff recovery, and framework session-restore alignment.

- Updated dependencies []:
  - @authon/shared@0.1.17
  - @authon/js@0.1.17
