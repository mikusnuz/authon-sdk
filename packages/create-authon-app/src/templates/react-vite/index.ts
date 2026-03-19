import type { FileEntry } from '../../scaffold.js';
import type { ProjectOptions } from '../../prompts.js';
import { generateEnvExampleVite, generateGitignore, generateClaudeMd } from '../shared.js';

export function generateReactVite(options: ProjectOptions): FileEntry[] {
  const files: FileEntry[] = [];

  // package.json
  files.push({
    path: 'package.json',
    content: JSON.stringify(
      {
        name: options.projectName,
        version: '0.1.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite',
          build: 'tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          '@authon/react': '^0.3.0',
          react: '^19.0.0',
          'react-dom': '^19.0.0',
          'react-router-dom': '^7.0.0',
        },
        devDependencies: {
          '@types/react': '^19.0.0',
          '@types/react-dom': '^19.0.0',
          '@vitejs/plugin-react': '^4.0.0',
          typescript: '^5.0.0',
          vite: '^6.0.0',
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
          target: 'ES2020',
          useDefineForClassFields: true,
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'react-jsx',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src'],
      },
      null,
      2,
    ) + '\n',
  });

  // vite.config.ts
  files.push({
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
  });

  // index.html
  files.push({
    path: 'index.html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${options.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
  });

  // src/main.tsx
  files.push({
    path: 'src/main.tsx',
    content: `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthonProvider } from '@authon/react';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthonProvider publishableKey={import.meta.env.VITE_AUTHON_KEY}>
        <App />
      </AuthonProvider>
    </BrowserRouter>
  </StrictMode>,
);
`,
  });

  // src/App.tsx
  files.push({
    path: 'src/App.tsx',
    content: `import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
`,
  });

  // src/index.css
  files.push({
    path: 'src/index.css',
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

  // src/pages/Home.tsx
  files.push({
    path: 'src/pages/Home.tsx',
    content: `import { SignedIn, SignedOut, UserButton, useAuthon } from '@authon/react';
import { Link } from 'react-router-dom';

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
            You're signed in!
          </h1>
          <Link
            to="/dashboard"
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

  // src/pages/Dashboard.tsx
  files.push({
    path: 'src/pages/Dashboard.tsx',
    content: `import { useUser, useAuthon, UserButton, Protect } from '@authon/react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const { isSignedIn } = useAuthon();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      navigate('/');
    }
  }, [isLoading, isSignedIn, navigate]);

  return (
    <Protect fallback={<p style={{ textAlign: 'center', padding: '4rem' }}>Loading...</p>}>
      <main style={{ minHeight: '100vh', padding: '2rem', maxWidth: 800, margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
          <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>
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
    </Protect>
  );
}
`,
  });

  // src/vite-env.d.ts
  files.push({
    path: 'src/vite-env.d.ts',
    content: `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTHON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
`,
  });

  // .env.example
  files.push({ path: '.env.example', content: generateEnvExampleVite(options) });
  files.push({ path: '.env', content: generateEnvExampleVite(options) });

  // .gitignore
  files.push({ path: '.gitignore', content: generateGitignore() });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: generateClaudeMd('react-vite') });

  return files;
}
