# create-authon-app

Scaffold a new project with [Authon](https://authon.dev) authentication pre-configured.

## Usage

```bash
npx create-authon-app
```

### Non-interactive

```bash
npx create-authon-app my-app --template nextjs-app --yes
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
| `express` | Express.js | `@authon/node` |
| `node` | Plain Node.js | `@authon/node` |

## What's included

Each generated project includes:

- Framework-specific configuration
- Authon authentication setup (provider, middleware)
- Landing page with sign-in
- Protected dashboard page
- Server-side token verification (where applicable)
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
