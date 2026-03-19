import type { FileEntry } from '../../scaffold.js';
import type { ProjectOptions } from '../../prompts.js';
import { generateEnvExampleNuxt, generateGitignore, generateClaudeMd } from '../shared.js';

export function generateNuxt(options: ProjectOptions): FileEntry[] {
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
          dev: 'nuxt dev',
          build: 'nuxt build',
          generate: 'nuxt generate',
          preview: 'nuxt preview',
        },
        dependencies: {
          '@authon/vue': '^0.3.0',
          '@authon/js': '^0.3.0',
          nuxt: '^3.15.0',
          vue: '^3.5.0',
          'vue-router': '^4.0.0',
        },
        devDependencies: {
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
        extends: './.nuxt/tsconfig.json',
      },
      null,
      2,
    ) + '\n',
  });

  // nuxt.config.ts
  files.push({
    path: 'nuxt.config.ts',
    content: `export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },
  runtimeConfig: {
    authonSecretKey: process.env.AUTHON_SECRET_KEY || '',
    public: {
      authonKey: process.env.NUXT_PUBLIC_AUTHON_KEY || '',
    },
  },
  css: ['~/assets/css/main.css'],
});
`,
  });

  // plugins/authon.client.ts
  files.push({
    path: 'plugins/authon.client.ts',
    content: `import { createAuthon } from '@authon/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();

  const authon = createAuthon({
    publishableKey: config.public.authonKey,
  });

  nuxtApp.vueApp.use(authon);
});
`,
  });

  // middleware/auth.ts
  files.push({
    path: 'middleware/auth.ts',
    content: `export default defineNuxtRouteMiddleware((to) => {
  // This middleware redirects unauthenticated users
  // For client-side protection, use the AuthonSignedIn / AuthonSignedOut components
  // For server-side protection, verify tokens in your API routes
  const publicRoutes = ['/', '/sign-in'];
  if (publicRoutes.includes(to.path)) {
    return;
  }
});
`,
  });

  // assets/css/main.css
  files.push({
    path: 'assets/css/main.css',
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

  // app.vue
  files.push({
    path: 'app.vue',
    content: `<template>
  <NuxtPage />
</template>
`,
  });

  // pages/index.vue
  files.push({
    path: 'pages/index.vue',
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
        <NuxtLink
          to="/dashboard"
          style="display: inline-block; padding: 12px 32px; font-size: 1rem; font-weight: 600; color: #fff; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 8px; text-decoration: none;"
        >
          Go to Dashboard
        </NuxtLink>
      </div>
    </AuthonSignedIn>
  </main>
</template>
`,
  });

  // pages/dashboard.vue
  files.push({
    path: 'pages/dashboard.vue',
    content: `<script setup lang="ts">
import { useAuthon, useUser } from '@authon/vue';
import { AuthonUserButton } from '@authon/vue';
import { watch } from 'vue';

const { isSignedIn, isLoading } = useAuthon();
const { user } = useUser();
const router = useRouter();

watch([() => isLoading, () => isSignedIn], ([loading, signedIn]) => {
  if (!loading && !signedIn) {
    router.push('/');
  }
}, { immediate: true });
</script>

<template>
  <main v-if="!isLoading && isSignedIn" style="min-height: 100vh; padding: 2rem; max-width: 800px; margin: 0 auto;">
    <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border);">
      <NuxtLink to="/" style="font-size: 1.25rem; font-weight: 700; color: var(--primary); text-decoration: none;">
        ${options.projectName}
      </NuxtLink>
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

  // server/api/user.get.ts
  files.push({
    path: 'server/api/user.get.ts',
    content: `import { AuthonBackend } from '@authon/node';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const authon = new AuthonBackend(config.authonSecretKey);

  const authHeader = getRequestHeader(event, 'authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw createError({ statusCode: 401, message: 'Unauthorized' });
  }

  try {
    const user = await authon.verifyToken(token);
    return { user };
  } catch {
    throw createError({ statusCode: 401, message: 'Invalid token' });
  }
});
`,
  });

  // .env.example
  files.push({ path: '.env.example', content: generateEnvExampleNuxt(options) });
  files.push({ path: '.env', content: generateEnvExampleNuxt(options) });

  // .gitignore
  files.push({ path: '.gitignore', content: generateGitignore() });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: generateClaudeMd('nuxt') });

  return files;
}
