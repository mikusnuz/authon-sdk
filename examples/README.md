# Authon SDK Examples

Full-feature authentication examples for every Authon SDK. Each example implements the complete auth flow — email/password, social login (10 providers), MFA, sessions, profile management, and account deletion.

**Live Demo:** [examples.authon.dev](https://examples.authon.dev)

## Examples

### Frontend

| Framework | SDK | Live Demo | Source |
|-----------|-----|-----------|--------|
| React | `@authon/react` | [examples.authon.dev/react/](https://examples.authon.dev/react/) | [react/](./react/) |
| Next.js | `@authon/nextjs` | [examples.authon.dev/nextjs/](https://examples.authon.dev/nextjs/) | [nextjs/](./nextjs/) |
| Vue | `@authon/vue` | [examples.authon.dev/vue/](https://examples.authon.dev/vue/) | [vue/](./vue/) |
| Nuxt | `@authon/nuxt` | [examples.authon.dev/nuxt/](https://examples.authon.dev/nuxt/) | [nuxt/](./nuxt/) |
| Angular | `@authon/angular` | [examples.authon.dev/angular/](https://examples.authon.dev/angular/) | [angular/](./angular/) |
| Svelte | `@authon/svelte` | [examples.authon.dev/svelte/](https://examples.authon.dev/svelte/) | [svelte/](./svelte/) |
| Vanilla JS | `@authon/js` | [examples.authon.dev/js/](https://examples.authon.dev/js/) | [vanilla-js/](./vanilla-js/) |

### Backend

| Framework | SDK | Live Demo | Source |
|-----------|-----|-----------|--------|
| Express | `@authon/node` | [examples.authon.dev/express/](https://examples.authon.dev/express/) | [node-express/](./node-express/) |
| Go | `authon-sdk/go` | [examples.authon.dev/go/](https://examples.authon.dev/go/) | [go/](./go/) |
| FastAPI | `authon` (Python) | [examples.authon.dev/fastapi/](https://examples.authon.dev/fastapi/) | [python-fastapi/](./python-fastapi/) |
| Flask | `authon` (Python) | [examples.authon.dev/flask/](https://examples.authon.dev/flask/) | [python-flask/](./python-flask/) |
| Django | `authon` (Python) | [examples.authon.dev/django/](https://examples.authon.dev/django/) | [python-django/](./python-django/) |

### Mobile (Code Only)

| Framework | SDK | Source |
|-----------|-----|--------|
| React Native | `@authon/react-native` | [react-native/](./react-native/) |
| Flutter | `authon` (Dart) | [flutter/](./flutter/) |
| Kotlin Android | `dev.authon:sdk` | [kotlin-android/](./kotlin-android/) |
| Swift iOS | `Authon` (Swift) | [swift-ios/](./swift-ios/) |

## Features

Every example implements:

- [x] Email/password sign-up with validation
- [x] Email/password sign-in
- [x] Social login — Google, Apple, Kakao, Naver, GitHub, Facebook, Discord, X, LINE, Microsoft
- [x] Profile page (view & edit)
- [x] Password reset
- [x] MFA/TOTP setup (QR code + verification + backup codes)
- [x] Session management (list & revoke)
- [x] Account deletion with confirmation
- [x] Protected routes/pages
- [x] Sign-out

Backend examples additionally include:
- [x] Token verification middleware
- [x] Webhook signature verification

## Local Development

### Run all examples with Docker Compose

```bash
git clone https://github.com/mikusnuz/authon-sdk.git
cd authon-sdk/examples

# Copy and configure environment
cp .env.example .env
# Edit .env with your Authon project credentials

# Start all 13 web containers
docker compose up -d
```

Then visit:
- Portal: http://localhost:15585
- React: http://localhost:15586
- Next.js: http://localhost:15587
- Vue: http://localhost:15588
- Nuxt: http://localhost:15589
- Angular: http://localhost:15595
- Svelte: http://localhost:15596
- Vanilla JS: http://localhost:15597
- Express: http://localhost:15598
- Go: http://localhost:15599
- FastAPI: http://localhost:15600
- Flask: http://localhost:15601
- Django: http://localhost:15602

### Run a single example

Each example can be run independently. See the README in each directory for specific instructions.

## Environment Variables

```env
# All examples
AUTHON_PROJECT_ID=your-project-id
AUTHON_API_URL=https://api.authon.dev

# Vite-based frontends (React, Vue, Vanilla JS)
VITE_AUTHON_PROJECT_ID=your-project-id
VITE_AUTHON_API_URL=https://api.authon.dev

# Backend examples
AUTHON_API_KEY=your-api-key
AUTHON_WEBHOOK_SECRET=your-webhook-secret
```

## Architecture

```
                    Nginx (examples.authon.dev)
                           |
          +----------------+----------------+
          |                |                |
    /react/ (15586)  /nextjs/ (15587)  /vue/ (15588) ...
          |                |                |
     Docker Compose on server-1
          |
    Authon API (api.authon.dev)
```

All examples share the same Authon project and authenticate against the same API.

## License

MIT
