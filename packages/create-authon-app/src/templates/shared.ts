import type { ProjectOptions } from '../prompts.js';

export function generateEnvExample(options: ProjectOptions): string {
  const lines = [
    '# Authon Configuration',
    '# Get your keys at https://dashboard.authon.dev',
    '',
    '# Your Authon publishable key (safe for client-side)',
    'NEXT_PUBLIC_AUTHON_KEY=pk_test_your_publishable_key_here',
    '',
    '# Your Authon secret key (server-side only)',
    'AUTHON_SECRET_KEY=sk_test_your_secret_key_here',
    '',
    '# Authon API URL (defaults to https://api.authon.dev)',
    '# AUTHON_API_URL=https://api.authon.dev',
  ];

  if (options.features.oauth && options.features.oauthProviders.length > 0) {
    lines.push('', '# OAuth providers are configured in the Authon Dashboard');
    lines.push('# https://dashboard.authon.dev/oauth-providers');
  }

  return lines.join('\n') + '\n';
}

export function generateEnvExampleVite(options: ProjectOptions): string {
  return generateEnvExample(options)
    .replace(/NEXT_PUBLIC_AUTHON_KEY/g, 'VITE_AUTHON_KEY');
}

export function generateEnvExampleNuxt(options: ProjectOptions): string {
  return generateEnvExample(options)
    .replace(/NEXT_PUBLIC_AUTHON_KEY/g, 'NUXT_PUBLIC_AUTHON_KEY');
}

export function generateEnvExampleServer(options: ProjectOptions): string {
  const lines = [
    '# Authon Configuration',
    '# Get your keys at https://dashboard.authon.dev',
    '',
    '# Your Authon secret key (server-side)',
    'AUTHON_SECRET_KEY=sk_test_your_secret_key_here',
    '',
    '# Authon API URL (defaults to https://api.authon.dev)',
    '# AUTHON_API_URL=https://api.authon.dev',
    '',
    '# Server port',
    'PORT=3000',
  ];

  return lines.join('\n') + '\n';
}

export function generateGitignore(): string {
  return `node_modules/
dist/
.next/
.nuxt/
.svelte-kit/
.env
.env.local
.env.*.local
*.log
.DS_Store
`;
}

export function generateClaudeMd(template: string): string {
  const frameworkNames: Record<string, string> = {
    'nextjs-app': 'Next.js (App Router)',
    'nextjs-pages': 'Next.js (Pages Router)',
    'react-vite': 'React + Vite',
    'vue-vite': 'Vue + Vite',
    nuxt: 'Nuxt 3',
    svelte: 'SvelteKit',
    express: 'Express',
    node: 'Node.js',
  };

  const sdkPackages: Record<string, string> = {
    'nextjs-app': '@authon/nextjs',
    'nextjs-pages': '@authon/nextjs',
    'react-vite': '@authon/react',
    'vue-vite': '@authon/vue',
    nuxt: '@authon/nuxt',
    svelte: '@authon/svelte',
    // express: '@authon/node',  // DEPRECATED: @authon/node is no longer maintained
    // node: '@authon/node',     // DEPRECATED: @authon/node is no longer maintained
  };

  const isServer = template === 'express' || template === 'node';
  const framework = frameworkNames[template] || template;
  const sdk = sdkPackages[template] || '@authon/js';

  let content = `# Project Overview

This is a ${framework} project using **Authon** for authentication.

## Auth SDK

- Package: \`${sdk}\`
- Docs: https://docs.authon.dev
- Dashboard: https://dashboard.authon.dev

## Key Files
`;

  if (template === 'nextjs-app') {
    content += `
- \`middleware.ts\` — Authon route protection middleware
- \`app/layout.tsx\` — AuthonProvider wraps the app
- \`app/page.tsx\` — Landing page with sign-in
- \`app/dashboard/page.tsx\` — Protected dashboard page
- \`app/api/user/route.ts\` — Server-side user verification
`;
  } else if (template === 'nextjs-pages') {
    content += `
- \`middleware.ts\` — Authon route protection middleware
- \`pages/_app.tsx\` — AuthonProvider wraps the app
- \`pages/index.tsx\` — Landing page with sign-in
- \`pages/dashboard.tsx\` — Protected dashboard page
- \`pages/api/user.ts\` — Server-side user verification
`;
  } else if (template === 'react-vite') {
    content += `
- \`src/main.tsx\` — AuthonProvider wraps the app
- \`src/App.tsx\` — Main app with routing
- \`src/pages/Home.tsx\` — Landing page with sign-in
- \`src/pages/Dashboard.tsx\` — Protected dashboard page
`;
  } else if (template === 'vue-vite') {
    content += `
- \`src/main.ts\` — Authon plugin installed
- \`src/App.vue\` — Main app with routing
- \`src/views/Home.vue\` — Landing page with sign-in
- \`src/views/Dashboard.vue\` — Protected dashboard page
`;
  } else if (template === 'nuxt') {
    content += `
- \`nuxt.config.ts\` — Authon module configuration
- \`plugins/authon.client.ts\` — Client-side Authon setup
- \`middleware/auth.ts\` — Route protection middleware
- \`pages/index.vue\` — Landing page with sign-in
- \`pages/dashboard.vue\` — Protected dashboard page
`;
  } else if (template === 'svelte') {
    content += `
- \`src/lib/authon.ts\` — Authon store setup
- \`src/routes/+layout.svelte\` — App layout
- \`src/routes/+page.svelte\` — Landing page with sign-in
- \`src/routes/dashboard/+page.svelte\` — Protected dashboard
`;
  } else if (template === 'express') {
    content += `
- \`src/index.ts\` — Express server setup
- \`src/middleware/auth.ts\` — Authon middleware for token verification
- \`src/routes/user.ts\` — Protected user routes
`;
  } else if (template === 'node') {
    content += `
- \`src/index.ts\` — HTTP server with Authon token verification
`;
  }

  content += `
## Authon API Patterns

### Client-side (${isServer ? 'N/A for this server project' : sdk})
${isServer ? '' : `
\`\`\`ts
// React/Next.js
import { AuthonProvider, useAuthon, useUser, SignedIn, SignedOut } from '${sdk}';

// Vue
import { createAuthon, useAuthon, useUser } from '${sdk}';

// Svelte
import { createAuthonStore } from '${sdk}';
\`\`\`
`}

### Server-side (webhook sync)

> **Note**: @authon/node is deprecated. Authon is a frontend-only platform.
> For webhook handling, use a plain HTTP endpoint in your backend framework.

\`\`\`ts
// POST /api/webhook/authon — sync Authon events to your database
app.post('/api/webhook/authon', async (req, res) => {
  const { type, data } = req.body;
  if (type === 'user.created') {
    await db.users.create({ email: data.user.email });
  }
  res.json({ ok: true });
});
\`\`\`

## Environment Variables

- \`${isServer ? 'AUTHON_SECRET_KEY' : template === 'nuxt' ? 'NUXT_PUBLIC_AUTHON_KEY' : template.includes('vite') ? 'VITE_AUTHON_KEY' : 'NEXT_PUBLIC_AUTHON_KEY'}\` — ${isServer ? 'Secret key for server-side operations' : 'Publishable key (safe for client)'}
${!isServer ? `- \`AUTHON_SECRET_KEY\` — Secret key for server-side operations` : ''}
`;

  return content;
}
