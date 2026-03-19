import type { FileEntry } from '../../scaffold.js';
import type { ProjectOptions } from '../../prompts.js';
import { generateEnvExample, generateGitignore, generateClaudeMd } from '../shared.js';

export function generateNextjsApp(options: ProjectOptions): FileEntry[] {
  const files: FileEntry[] = [];

  // package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify(
      {
        name: options.projectName,
        version: '0.1.0',
        private: true,
        scripts: {
          dev: 'next dev',
          build: 'next build',
          start: 'next start',
          lint: 'next lint',
        },
        dependencies: {
          '@authon/nextjs': '^0.3.0',
          next: '^15.0.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          typescript: '^5.0.0',
        },
      },
      null,
      2,
    ) + '\n',
  });

  // tsconfig.json
  files.push({
    path: 'tsconfig.json',
    content: JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2017',
          lib: ['dom', 'dom.iterable', 'esnext'],
          allowJs: true,
          skipLibCheck: true,
          strict: true,
          noEmit: true,
          esModuleInterop: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          resolveJsonModule: true,
          isolatedModules: true,
          jsx: 'preserve',
          incremental: true,
          plugins: [{ name: 'next' }],
          paths: { '@/*': ['./src/*'] },
        },
        include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
        exclude: ['node_modules'],
      },
      null,
      2,
    ) + '\n',
  });

  // next.config.ts
  files.push({
    path: 'next.config.ts',
    content: `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
`,
  });

  // middleware.ts
  files.push({
    path: 'middleware.ts',
    content: `import { authonMiddleware } from '@authon/nextjs';

export default authonMiddleware({
  publicRoutes: ['/', '/sign-in'],
});

export const config = {
  matcher: ['/((?!_next|.*\\\\..*).*)'],
};
`,
  });

  // app/layout.tsx
  files.push({
    path: 'app/layout.tsx',
    content: `import type { Metadata } from 'next';
import { AuthonProvider } from '@authon/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: '${options.projectName}',
  description: 'Built with Authon authentication',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthonProvider publishableKey={process.env.NEXT_PUBLIC_AUTHON_KEY!}>
          {children}
        </AuthonProvider>
      </body>
    </html>
  );
}
`,
  });

  // app/globals.css
  files.push({
    path: 'app/globals.css',
    content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --foreground: #171717;
  --background: #ffffff;
  --primary: #7c3aed;
  --primary-hover: #6d28d9;
  --muted: #6b7280;
  --border: #e5e7eb;
}

body {
  color: var(--foreground);
  background: var(--background);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}

a {
  color: var(--primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
`,
  });

  // app/page.tsx
  files.push({
    path: 'app/page.tsx',
    content: `'use client';

import { SignedIn, SignedOut, UserButton, useAuthon } from '@authon/nextjs';
import Link from 'next/link';

export default function Home() {
  const { openSignIn } = useAuthon();

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <SignedOut>
        <div style={{ textAlign: 'center', maxWidth: 480 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Welcome to <span style={{ color: 'var(--primary)' }}>${options.projectName}</span>
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Powered by Authon authentication. Sign in to get started.
          </p>
          <button
            onClick={() => openSignIn()}
            style={{
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>
      </SignedOut>

      <SignedIn>
        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <UserButton />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
            You&apos;re signed in!
          </h1>
          <Link
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#fff',
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              borderRadius: '8px',
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </SignedIn>
    </main>
  );
}
`,
  });

  // app/dashboard/page.tsx
  files.push({
    path: 'app/dashboard/page.tsx',
    content: `'use client';

import { useUser, UserButton } from '@authon/nextjs';
import Link from 'next/link';

export default function Dashboard() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>
          ${options.projectName}
        </Link>
        <UserButton />
      </header>

      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Dashboard</h1>

      <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>User Info</h2>
        <dl style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.5rem', fontSize: '0.875rem' }}>
          <dt style={{ fontWeight: 600 }}>ID</dt>
          <dd style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>{user?.id}</dd>
          <dt style={{ fontWeight: 600 }}>Email</dt>
          <dd style={{ color: 'var(--muted)' }}>{user?.email}</dd>
          <dt style={{ fontWeight: 600 }}>Name</dt>
          <dd style={{ color: 'var(--muted)' }}>{user?.displayName || 'Not set'}</dd>
        </dl>
      </div>
    </main>
  );
}
`,
  });

  // app/sign-in/page.tsx
  files.push({
    path: 'app/sign-in/page.tsx',
    content: `'use client';

import { useAuthon } from '@authon/nextjs';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const { openSignIn, isSignedIn } = useAuthon();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
      return;
    }
    openSignIn();
  }, [isSignedIn, openSignIn, router]);

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'var(--muted)' }}>Opening sign in...</p>
    </main>
  );
}
`,
  });

  // app/api/user/route.ts
  files.push({
    path: 'app/api/user/route.ts',
    content: `import { currentUser } from '@authon/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
`,
  });

  // .env.example
  files.push({ path: '.env.example', content: generateEnvExample(options) });
  files.push({ path: '.env.local', content: generateEnvExample(options) });

  // .gitignore
  files.push({ path: '.gitignore', content: generateGitignore() });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: generateClaudeMd('nextjs-app') });

  return files;
}
