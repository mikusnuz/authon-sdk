# Authon SDK

Official SDKs for [Authon](https://authon.dev) — the authentication platform for modern apps.

![Version](https://img.shields.io/npm/v/@authon/js?label=version)
![License](https://img.shields.io/badge/license-MIT-blue)

## Packages

| Package | Registry | Description |
|---------|----------|-------------|
| [`@authon/shared`](./packages/shared) | [npm](https://www.npmjs.com/package/@authon/shared) | Shared types and constants |
| [`@authon/js`](./packages/js) | [npm](https://www.npmjs.com/package/@authon/js) | Core browser SDK — ShadowDOM modal, OAuth, sessions |
| [`@authon/react`](./packages/react) | [npm](https://www.npmjs.com/package/@authon/react) | React hooks and components |
| [`@authon/nextjs`](./packages/nextjs) | [npm](https://www.npmjs.com/package/@authon/nextjs) | Next.js middleware and server helpers |
| [`@authon/vue`](./packages/vue) | [npm](https://www.npmjs.com/package/@authon/vue) | Vue 3 plugin, composables, components |
| [`@authon/nuxt`](./packages/nuxt) | [npm](https://www.npmjs.com/package/@authon/nuxt) | Nuxt 3 module |
| [`@authon/svelte`](./packages/svelte) | [npm](https://www.npmjs.com/package/@authon/svelte) | Svelte stores and components |
| [`@authon/angular`](./packages/angular) | [npm](https://www.npmjs.com/package/@authon/angular) | Angular service and guard |
| [`@authon/react-native`](./packages/react-native) | [npm](https://www.npmjs.com/package/@authon/react-native) | React Native mobile SDK |
| [`@authon/node`](./packages/node) | [npm](https://www.npmjs.com/package/@authon/node) | Node.js server SDK |
| [`authon` (Python)](./python) | [PyPI](https://pypi.org/project/authon/) | Django, Flask, FastAPI |
| [`authon-go`](./go) | [Go modules](https://pkg.go.dev/github.com/mikusnuz/authon-sdk/go) | Go net/http middleware |
| [`authon` (Dart)](./dart) | [pub.dev](https://pub.dev/packages/authon) | Flutter SDK |
| [`Authon` (Swift)](./swift) | SPM | iOS/macOS SDK |
| [`authon-kotlin`](./kotlin) | Maven | Android SDK |

## Quick Start

### React

```bash
npm install @authon/react
```

```tsx
import { AuthonProvider, SignedIn, SignedOut, UserButton } from '@authon/react';
import { useUser } from '@authon/react';

function App() {
  return (
    <AuthonProvider publishableKey="pk_live_...">
      <SignedIn>
        <UserButton />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </AuthonProvider>
  );
}

function Dashboard() {
  const { user } = useUser();
  return <h1>Welcome, {user?.displayName}</h1>;
}
```

### Next.js

```bash
npm install @authon/nextjs
```

```ts
// middleware.ts
import { authMiddleware } from '@authon/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHON_KEY!,
  publicRoutes: ['/', '/about', '/pricing'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

```tsx
// app/layout.tsx
import { AuthonProvider } from '@authon/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
          {children}
        </AuthonProvider>
      </body>
    </html>
  );
}
```

```ts
// Server-side token verification
import { currentUser } from '@authon/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}
```

### Node.js

```bash
npm install @authon/node
```

```ts
import { AuthonBackend, expressMiddleware } from '@authon/node';

// Middleware — protects routes automatically
app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHON_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  res.json({ user: req.auth });
});

// Direct client usage
const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

const user = await authon.verifyToken(accessToken);
const users = await authon.users.list({ page: 1, limit: 10 });
const event = authon.webhooks.verify(payload, signature, webhookSecret);
```

### Python (FastAPI)

```bash
pip install authon
```

```python
from fastapi import FastAPI, Depends
from authon import AuthonBackend, require_auth, AuthonUser

authon = AuthonBackend(secret_key="sk_live_...")
app = FastAPI()

@app.get("/api/profile")
async def profile(user: AuthonUser = Depends(require_auth(authon))):
    return {"id": user.id, "email": user.email}
```

## Documentation

Full documentation is available at [authon.dev/docs](https://authon.dev/docs).

## Contributing

We welcome contributions. Please open an issue first to discuss any changes you'd like to make.

```bash
# Clone and install
git clone https://github.com/mikusnuz/authon-sdk.git
cd authon-sdk
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev
```

## License

[MIT](./LICENSE)
