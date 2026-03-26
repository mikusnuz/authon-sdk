# @authon/create-app

Scaffold a new project with [Authon](https://authon.dev) authentication pre-configured.

## Prerequisites

Before using this CLI, create an Authon project and get your API keys:

1. **Create a project** at [Authon Dashboard](https://authon.dev/dashboard/overview)
   - Click "Create Project" and enter your app name
   - Select the authentication methods you want (Email/Password, OAuth providers, etc.)

2. **Get your API keys** from Project Settings → API Keys
   - **Publishable Key** (`pk_live_...`) — use in your frontend code
   - **Test Key** (`pk_test_...`) — for development, enables Dev Teleport

3. **Configure OAuth providers** (optional) in Project Settings → OAuth
   - Add Google, Apple, GitHub, etc. with their respective Client ID and Secret
   - Set the redirect URL to `https://api.authon.dev/v1/auth/oauth/redirect`

> **Test vs Live keys:** Use `pk_test_...` during development. Switch to `pk_live_...` before deploying to production. Test keys use a sandbox environment with no rate limits.

## Usage

```bash
npx @authon/create-app
```

### Non-interactive

```bash
npx @authon/create-app my-app --template nextjs-app --yes
```

## Templates

| Template | Framework | SDK |
|----------|-----------|-----|
| `nextjs-app` | Next.js (App Router) | `@authon/nextjs` |
| `nextjs-pages` | Next.js (Pages Router) | `@authon/nextjs` |
| `react-vite` | React + Vite | `@authon/react` |
| `vue-vite` | Vue 3 + Vite | `@authon/vue` |
| `nuxt` | Nuxt 3 | `@authon/vue` |
| `svelte` | SvelteKit | `@authon/svelte` |

## What's included

Each generated project includes:

- Framework-specific configuration
- Authon authentication setup (provider, middleware)
- Landing page with sign-in
- Protected dashboard page
- `.env.example` with Authon configuration
- `CLAUDE.md` for AI agent context

## Options

```
-t, --template <template>  Use a specific template (skip framework prompt)
-y, --yes                  Skip prompts and use defaults
-h, --help                 Show help
-v, --version              Show version
```

## License

[MIT](../../LICENSE)
