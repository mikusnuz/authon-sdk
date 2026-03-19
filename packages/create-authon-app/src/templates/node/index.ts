import type { FileEntry } from '../../scaffold.js';
import type { ProjectOptions } from '../../prompts.js';
import { generateEnvExampleServer, generateGitignore, generateClaudeMd } from '../shared.js';

export function generateNode(options: ProjectOptions): FileEntry[] {
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
          dev: 'tsx watch src/index.ts',
          build: 'tsc',
          start: 'node dist/index.js',
        },
        dependencies: {
          '@authon/node': '^0.3.0',
        },
        devDependencies: {
          '@types/node': '^22.0.0',
          tsx: '^4.0.0',
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
          target: 'ES2022',
          module: 'Node16',
          moduleResolution: 'Node16',
          outDir: 'dist',
          rootDir: 'src',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          declaration: true,
        },
        include: ['src'],
        exclude: ['node_modules', 'dist'],
      },
      null,
      2,
    ) + '\n',
  });

  // src/index.ts
  files.push({
    path: 'src/index.ts',
    content: `import { createServer } from 'http';
import { AuthonBackend } from '@authon/node';

const port = Number(process.env.PORT) || 3000;
const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

function parseBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function json(res: import('http').ServerResponse, statusCode: number, data: unknown) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', \`http://localhost:\${port}\`);
  const { pathname } = url;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  // Public: health check
  if (pathname === '/' && req.method === 'GET') {
    return json(res, 200, {
      name: '${options.projectName}',
      version: '0.1.0',
      status: 'ok',
    });
  }

  // Public: health
  if (pathname === '/health' && req.method === 'GET') {
    return json(res, 200, { status: 'ok' });
  }

  // Protected: user profile
  if (pathname === '/api/user' && req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return json(res, 401, { error: 'Missing authorization header' });
    }

    try {
      const user = await authon.verifyToken(token);
      return json(res, 200, {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
      });
    } catch {
      return json(res, 401, { error: 'Invalid token' });
    }
  }

  // Protected: webhook verification example
  if (pathname === '/api/webhook' && req.method === 'POST') {
    const body = await parseBody(req);
    const signature = req.headers['x-authon-signature'] as string;
    const timestamp = req.headers['x-authon-timestamp'] as string;
    const webhookSecret = process.env.AUTHON_WEBHOOK_SECRET;

    if (!signature || !timestamp || !webhookSecret) {
      return json(res, 400, { error: 'Missing webhook headers or secret' });
    }

    try {
      const event = authon.webhooks.verify(body, signature, timestamp, webhookSecret);
      console.log('Webhook event:', event);
      return json(res, 200, { received: true });
    } catch {
      return json(res, 400, { error: 'Invalid webhook signature' });
    }
  }

  // 404
  return json(res, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});
`,
  });

  // .env.example
  const envContent = generateEnvExampleServer(options) +
    '\n# Webhook secret (optional, for verifying Authon webhooks)\n# AUTHON_WEBHOOK_SECRET=whsec_your_webhook_secret\n';
  files.push({ path: '.env.example', content: envContent });
  files.push({ path: '.env', content: envContent });

  // .gitignore
  files.push({ path: '.gitignore', content: generateGitignore() });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: generateClaudeMd('node') });

  return files;
}
