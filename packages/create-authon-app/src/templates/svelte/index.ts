import type { FileEntry } from '../../scaffold.js';
import type { ProjectOptions } from '../../prompts.js';
import { generateEnvExampleVite, generateGitignore, generateClaudeMd } from '../shared.js';

export function generateSvelte(options: ProjectOptions): FileEntry[] {
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
          dev: 'vite dev',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          '@authon/svelte': '^0.3.0',
        },
        devDependencies: {
          '@sveltejs/adapter-auto': '^3.0.0',
          '@sveltejs/kit': '^2.0.0',
          '@sveltejs/vite-plugin-svelte': '^4.0.0',
          svelte: '^5.0.0',
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
        extends: './.svelte-kit/tsconfig.json',
        compilerOptions: {
          allowJs: true,
          checkJs: true,
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          skipLibCheck: true,
          sourceMap: true,
          strict: true,
        },
      },
      null,
      2,
    ) + '\n',
  });

  // svelte.config.js
  files.push({
    path: 'svelte.config.js',
    content: `import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
  },
};

export default config;
`,
  });

  // vite.config.ts
  files.push({
    path: 'vite.config.ts',
    content: `import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
});
`,
  });

  // src/lib/authon.ts
  files.push({
    path: 'src/lib/authon.ts',
    content: `import { createAuthonStore } from '@authon/svelte';
import { browser } from '$app/environment';

let authonStore: ReturnType<typeof createAuthonStore> | null = null;

export function getAuthonStore() {
  if (!browser) return null;

  if (!authonStore) {
    const key = import.meta.env.VITE_AUTHON_KEY;
    if (!key) {
      console.warn('VITE_AUTHON_KEY is not set. Check your .env file.');
      return null;
    }
    authonStore = createAuthonStore(key);
  }

  return authonStore;
}
`,
  });

  // src/app.css
  files.push({
    path: 'src/app.css',
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

  // src/app.html
  files.push({
    path: 'src/app.html',
    content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${options.projectName}</title>
    %sveltekit.head%
  </head>
  <body data-sveltekit-preload-data="hover">
    <div style="display: contents">%sveltekit.body%</div>
  </body>
</html>
`,
  });

  // src/routes/+layout.svelte
  files.push({
    path: 'src/routes/+layout.svelte',
    content: `<script lang="ts">
  import '../app.css';
</script>

<slot />
`,
  });

  // src/routes/+page.svelte
  files.push({
    path: 'src/routes/+page.svelte',
    content: `<script lang="ts">
  import { onMount } from 'svelte';
  import { getAuthonStore } from '$lib/authon';

  let user: any = null;
  let isSignedIn = false;
  let isLoading = true;

  onMount(() => {
    const store = getAuthonStore();
    if (!store) return;

    store.user.subscribe((u) => {
      user = u;
      isSignedIn = !!u;
    });

    store.isLoading.subscribe((l) => {
      isLoading = l;
    });
  });

  function signIn() {
    const store = getAuthonStore();
    store?.openSignIn();
  }
</script>

{#if isLoading}
  <main style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <p>Loading...</p>
  </main>
{:else if !isSignedIn}
  <main style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;">
    <div style="text-align: center; max-width: 480px;">
      <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">
        Welcome to <span style="color: var(--primary);">${options.projectName}</span>
      </h1>
      <p style="color: var(--muted); margin-bottom: 2rem; line-height: 1.6;">
        Powered by Authon authentication. Sign in to get started.
      </p>
      <button
        on:click={signIn}
        style="padding: 12px 32px; font-size: 1rem; font-weight: 600; color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: none; border-radius: 8px; cursor: pointer;"
      >
        Sign In
      </button>
    </div>
  </main>
{:else}
  <main style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;">
    <div style="text-align: center;">
      <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">
        You're signed in!
      </h1>
      <p style="color: var(--muted); margin-bottom: 1rem;">{user?.email}</p>
      <a
        href="/dashboard"
        style="display: inline-block; padding: 12px 32px; font-size: 1rem; font-weight: 600; color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 8px; text-decoration: none;"
      >
        Go to Dashboard
      </a>
    </div>
  </main>
{/if}
`,
  });

  // src/routes/dashboard/+page.svelte
  files.push({
    path: 'src/routes/dashboard/+page.svelte',
    content: `<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getAuthonStore } from '$lib/authon';

  let user: any = null;
  let isSignedIn = false;
  let isLoading = true;

  onMount(() => {
    const store = getAuthonStore();
    if (!store) return;

    store.user.subscribe((u) => {
      user = u;
      isSignedIn = !!u;
    });

    store.isLoading.subscribe((l) => {
      isLoading = l;
      if (!l && !isSignedIn) {
        goto('/');
      }
    });
  });

  function signOut() {
    const store = getAuthonStore();
    store?.signOut().then(() => goto('/'));
  }
</script>

{#if isLoading}
  <main style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <p>Loading...</p>
  </main>
{:else if isSignedIn && user}
  <main style="min-height: 100vh; padding: 2rem; max-width: 800px; margin: 0 auto;">
    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
      <a href="/" style="font-size: 1.25rem; font-weight: 700; color: var(--primary); text-decoration: none;">
        ${options.projectName}
      </a>
      <button
        on:click={signOut}
        style="padding: 8px 16px; font-size: 0.875rem; font-weight: 500; color: #ef4444; background: none; border: 1px solid #fecaca; border-radius: 8px; cursor: pointer;"
      >
        Sign Out
      </button>
    </header>

    <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem;">Dashboard</h1>

    <div style="background: #f9fafb; border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border);">
      <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">User Info</h2>
      <dl style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; font-size: 0.875rem;">
        <dt style="font-weight: 600;">ID</dt>
        <dd style="color: var(--muted); font-family: monospace;">{user.id}</dd>
        <dt style="font-weight: 600;">Email</dt>
        <dd style="color: var(--muted);">{user.email}</dd>
        <dt style="font-weight: 600;">Name</dt>
        <dd style="color: var(--muted);">{user.displayName || 'Not set'}</dd>
      </dl>
    </div>
  </main>
{/if}
`,
  });

  // .env.example
  files.push({ path: '.env.example', content: generateEnvExampleVite(options) });
  files.push({ path: '.env', content: generateEnvExampleVite(options) });

  // .gitignore
  files.push({ path: '.gitignore', content: generateGitignore() });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: generateClaudeMd('svelte') });

  return files;
}
