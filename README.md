# Authup SDK

Official SDKs for [Authup](https://authup.dev) — the authentication platform for modern apps.

![Version](https://img.shields.io/npm/v/@authup/js?label=version)
![License](https://img.shields.io/badge/license-MIT-blue)

## Packages

| Package | Registry | Description |
|---------|----------|-------------|
| [`@authup/shared`](./packages/shared) | [npm](https://www.npmjs.com/package/@authup/shared) | Shared types and constants |
| [`@authup/js`](./packages/js) | [npm](https://www.npmjs.com/package/@authup/js) | Core browser SDK — ShadowDOM modal, OAuth, sessions |
| [`@authup/react`](./packages/react) | [npm](https://www.npmjs.com/package/@authup/react) | React hooks and components |
| [`@authup/nextjs`](./packages/nextjs) | [npm](https://www.npmjs.com/package/@authup/nextjs) | Next.js middleware and server helpers |
| [`@authup/vue`](./packages/vue) | [npm](https://www.npmjs.com/package/@authup/vue) | Vue 3 plugin, composables, components |
| [`@authup/nuxt`](./packages/nuxt) | [npm](https://www.npmjs.com/package/@authup/nuxt) | Nuxt 3 module |
| [`@authup/svelte`](./packages/svelte) | [npm](https://www.npmjs.com/package/@authup/svelte) | Svelte stores and components |
| [`@authup/angular`](./packages/angular) | [npm](https://www.npmjs.com/package/@authup/angular) | Angular service and guard |
| [`@authup/react-native`](./packages/react-native) | [npm](https://www.npmjs.com/package/@authup/react-native) | React Native mobile SDK |
| [`@authup/node`](./packages/node) | [npm](https://www.npmjs.com/package/@authup/node) | Node.js server SDK |
| [`authup` (Python)](./python) | [PyPI](https://pypi.org/project/authup/) | Django, Flask, FastAPI |
| [`authup-go`](./go) | [Go modules](https://pkg.go.dev/github.com/mikusnuz/authup-sdk/go) | Go net/http middleware |
| [`authup` (Dart)](./dart) | [pub.dev](https://pub.dev/packages/authup) | Flutter SDK |
| [`Authup` (Swift)](./swift) | SPM | iOS/macOS SDK |
| [`authup-kotlin`](./kotlin) | Maven | Android SDK |

## Quick Start

### React

```bash
npm install @authup/react
```

```tsx
import { AuthupProvider, SignedIn, SignedOut, UserButton } from '@authup/react';
import { useUser } from '@authup/react';

function App() {
  return (
    <AuthupProvider publishableKey="pk_live_...">
      <SignedIn>
        <UserButton />
        <Dashboard />
      </SignedIn>
      <SignedOut>
        <LandingPage />
      </SignedOut>
    </AuthupProvider>
  );
}

function Dashboard() {
  const { user } = useUser();
  return <h1>Welcome, {user?.displayName}</h1>;
}
```

### Next.js

```bash
npm install @authup/nextjs
```

```ts
// middleware.ts
import { authMiddleware } from '@authup/nextjs';

export default authMiddleware({
  publishableKey: process.env.NEXT_PUBLIC_AUTHUP_KEY!,
  publicRoutes: ['/', '/about', '/pricing'],
});

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
```

```tsx
// app/layout.tsx
import { AuthupProvider } from '@authup/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthupProvider publishableKey={process.env.NEXT_PUBLIC_AUTHUP_KEY!}>
          {children}
        </AuthupProvider>
      </body>
    </html>
  );
}
```

```ts
// Server-side token verification
import { currentUser } from '@authup/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) return new Response('Unauthorized', { status: 401 });
  return Response.json({ user });
}
```

### Node.js

```bash
npm install @authup/node
```

```ts
import { AuthupBackend, expressMiddleware } from '@authup/node';

// Middleware — protects routes automatically
app.use('/api', expressMiddleware({
  secretKey: process.env.AUTHUP_SECRET_KEY!,
}));

app.get('/api/profile', (req, res) => {
  res.json({ user: req.auth });
});

// Direct client usage
const authup = new AuthupBackend(process.env.AUTHUP_SECRET_KEY!);

const user = await authup.verifyToken(accessToken);
const users = await authup.users.list({ page: 1, limit: 10 });
const event = authup.webhooks.verify(payload, signature, webhookSecret);
```

### Python (FastAPI)

```bash
pip install authup
```

```python
from fastapi import FastAPI, Depends
from authup import AuthupBackend, require_auth, AuthupUser

authup = AuthupBackend(secret_key="sk_live_...")
app = FastAPI()

@app.get("/api/profile")
async def profile(user: AuthupUser = Depends(require_auth(authup))):
    return {"id": user.id, "email": user.email}
```

## Documentation

Full documentation is available at [authup.dev/docs](https://authup.dev/docs).

## Contributing

We welcome contributions. Please open an issue first to discuss any changes you'd like to make.

```bash
# Clone and install
git clone https://github.com/mikusnuz/authup-sdk.git
cd authup-sdk
pnpm install

# Build all packages
pnpm build

# Development mode
pnpm dev
```

## License

[MIT](./LICENSE)
