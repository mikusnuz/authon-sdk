import type { FileEntry } from '../../scaffold.js';
import type { ProjectOptions } from '../../prompts.js';
import { generateEnvExampleVite, generateGitignore, generateClaudeMd } from '../shared.js';

export function generateVueVite(options: ProjectOptions): FileEntry[] {
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
          build: 'vue-tsc -b && vite build',
          preview: 'vite preview',
        },
        dependencies: {
          '@authon/vue': '^0.3.0',
          vue: '^3.5.0',
          'vue-router': '^4.0.0',
        },
        devDependencies: {
          '@vitejs/plugin-vue': '^5.0.0',
          typescript: '^5.0.0',
          vite: '^6.0.0',
          'vue-tsc': '^2.0.0',
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
          module: 'ESNext',
          lib: ['ES2020', 'DOM', 'DOM.Iterable'],
          skipLibCheck: true,
          moduleResolution: 'bundler',
          allowImportingTsExtensions: true,
          isolatedModules: true,
          moduleDetection: 'force',
          noEmit: true,
          jsx: 'preserve',
          strict: true,
          noUnusedLocals: true,
          noUnusedParameters: true,
          noFallthroughCasesInSwitch: true,
        },
        include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue', 'env.d.ts'],
      },
      null,
      2,
    ) + '\n',
  });

  // vite.config.ts
  files.push({
    path: 'vite.config.ts',
    content: `import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
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
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
`,
  });

  // env.d.ts
  files.push({
    path: 'env.d.ts',
    content: `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTHON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
`,
  });

  // src/main.ts
  files.push({
    path: 'src/main.ts',
    content: `import { createApp } from 'vue';
import { createAuthon } from '@authon/vue';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);

const authon = createAuthon({
  publishableKey: import.meta.env.VITE_AUTHON_KEY,
});

app.use(authon);
app.use(router);
app.mount('#app');
`,
  });

  // src/router.ts
  files.push({
    path: 'src/router.ts',
    content: `import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import Dashboard from './views/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/dashboard', component: Dashboard },
  ],
});

export default router;
`,
  });

  // src/style.css
  files.push({
    path: 'src/style.css',
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

  // src/App.vue
  files.push({
    path: 'src/App.vue',
    content: `<template>
  <router-view />
</template>
`,
  });

  // src/views/Home.vue
  files.push({
    path: 'src/views/Home.vue',
    content: `<script setup lang="ts">
import { useAuthon } from '@authon/vue';
import { AuthonSignedIn, AuthonSignedOut, AuthonUserButton } from '@authon/vue';

const { openSignIn } = useAuthon();
</script>

<template>
  <main style="min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem;">
    <AuthonSignedOut>
      <div style="text-align: center; max-width: 480px;">
        <h1 style="font-size: 2.5rem; font-weight: 700; margin-bottom: 1rem;">
          Welcome to <span style="color: var(--primary);">${options.projectName}</span>
        </h1>
        <p style="color: var(--muted); margin-bottom: 2rem; line-height: 1.6;">
          Powered by Authon authentication. Sign in to get started.
        </p>
        <button
          @click="openSignIn()"
          style="padding: 12px 32px; font-size: 1rem; font-weight: 600; color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5); border: none; border-radius: 8px; cursor: pointer;"
        >
          Sign In
        </button>
      </div>
    </AuthonSignedOut>

    <AuthonSignedIn>
      <div style="text-align: center;">
        <div style="margin-bottom: 1.5rem;">
          <AuthonUserButton />
        </div>
        <h1 style="font-size: 2rem; font-weight: 700; margin-bottom: 1rem;">
          You're signed in!
        </h1>
        <router-link
          to="/dashboard"
          style="display: inline-block; padding: 12px 32px; font-size: 1rem; font-weight: 600; color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 8px; text-decoration: none;"
        >
          Go to Dashboard
        </router-link>
      </div>
    </AuthonSignedIn>
  </main>
</template>
`,
  });

  // src/views/Dashboard.vue
  files.push({
    path: 'src/views/Dashboard.vue',
    content: `<script setup lang="ts">
import { useAuthon, useUser } from '@authon/vue';
import { AuthonUserButton } from '@authon/vue';
import { watch } from 'vue';
import { useRouter } from 'vue-router';

const { isSignedIn, isLoading } = useAuthon();
const { user } = useUser();
const router = useRouter();

watch([isLoading, isSignedIn], ([loading, signedIn]) => {
  if (!loading && !signedIn) {
    router.push('/');
  }
}, { immediate: true });
</script>

<template>
  <main v-if="!isLoading && isSignedIn" style="min-height: 100vh; padding: 2rem; max-width: 800px; margin: 0 auto;">
    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
      <router-link to="/" style="font-size: 1.25rem; font-weight: 700; color: var(--primary); text-decoration: none;">
        ${options.projectName}
      </router-link>
      <AuthonUserButton />
    </header>

    <h1 style="font-size: 1.75rem; font-weight: 700; margin-bottom: 1.5rem;">Dashboard</h1>

    <div style="background: #f9fafb; border-radius: 12px; padding: 1.5rem; border: 1px solid var(--border);">
      <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">User Info</h2>
      <dl style="display: grid; grid-template-columns: 120px 1fr; gap: 0.5rem; font-size: 0.875rem;">
        <dt style="font-weight: 600;">ID</dt>
        <dd style="color: var(--muted); font-family: monospace;">{{ user?.id }}</dd>
        <dt style="font-weight: 600;">Email</dt>
        <dd style="color: var(--muted);">{{ user?.email }}</dd>
        <dt style="font-weight: 600;">Name</dt>
        <dd style="color: var(--muted);">{{ user?.displayName || 'Not set' }}</dd>
      </dl>
    </div>
  </main>

  <main v-else style="min-height: 100vh; display: flex; align-items: center; justify-content: center;">
    <p>Loading...</p>
  </main>
</template>
`,
  });

  // .env.example
  files.push({ path: '.env.example', content: generateEnvExampleVite(options) });
  files.push({ path: '.env', content: generateEnvExampleVite(options) });

  // .gitignore
  files.push({ path: '.gitignore', content: generateGitignore() });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: generateClaudeMd('vue-vite') });

  return files;
}
