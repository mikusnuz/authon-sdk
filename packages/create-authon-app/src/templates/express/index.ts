import type { FileEntry } from '../../scaffold.js';
import type { ProjectOptions } from '../../prompts.js';
import { generateEnvExampleServer, generateGitignore, generateClaudeMd } from '../shared.js';

export function generateExpress(options: ProjectOptions): FileEntry[] {
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
          express: '^4.21.0',
          cors: '^2.8.0',
        },
        devDependencies: {
          '@types/cors': '^2.8.0',
          '@types/express': '^4.17.0',
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
    content: `import express from 'express';
import cors from 'cors';
import { AuthonBackend, expressMiddleware } from '@authon/node';
import { userRouter } from './routes/user.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.get('/', (_req, res) => {
  res.json({
    name: '${options.projectName}',
    version: '0.1.0',
    docs: '/api',
  });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Protected routes (auth required)
const authMiddleware = expressMiddleware({
  secretKey: process.env.AUTHON_SECRET_KEY!,
});

app.use('/api/user', authMiddleware, userRouter);

// Start server
app.listen(port, () => {
  console.log(\`Server running at http://localhost:\${port}\`);
});

export default app;
`,
  });

  // src/routes/user.ts
  files.push({
    path: 'src/routes/user.ts',
    content: `import { Router } from 'express';
import type { AuthonUser } from '@authon/node';

interface AuthRequest {
  auth?: AuthonUser;
}

export const userRouter = Router();

// GET /api/user/profile
userRouter.get('/profile', (req, res) => {
  const { auth } = req as unknown as AuthRequest;

  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({
    id: auth.id,
    email: auth.email,
    displayName: auth.displayName,
  });
});

// GET /api/user/sessions
userRouter.get('/sessions', async (req, res) => {
  const { auth } = req as unknown as AuthRequest;

  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // You can use AuthonBackend to manage user sessions server-side
  return res.json({
    message: 'Use AuthonBackend to list sessions',
    userId: auth.id,
  });
});
`,
  });

  // src/middleware/auth.ts
  files.push({
    path: 'src/middleware/auth.ts',
    content: `import { AuthonBackend } from '@authon/node';
import type { Request, Response, NextFunction } from 'express';
import type { AuthonUser } from '@authon/node';

const authon = new AuthonBackend(process.env.AUTHON_SECRET_KEY!);

/**
 * Custom auth middleware example.
 * You can use the built-in expressMiddleware from @authon/node instead,
 * or customize this for your specific needs.
 */
export async function customAuthMiddleware(
  req: Request & { auth?: AuthonUser },
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  try {
    req.auth = await authon.verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
`,
  });

  // .env.example
  files.push({ path: '.env.example', content: generateEnvExampleServer(options) });
  files.push({ path: '.env', content: generateEnvExampleServer(options) });

  // .gitignore
  files.push({ path: '.gitignore', content: generateGitignore() });

  // CLAUDE.md
  files.push({ path: 'CLAUDE.md', content: generateClaudeMd('express') });

  return files;
}
