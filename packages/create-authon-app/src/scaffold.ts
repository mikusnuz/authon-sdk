import path from 'path';
import fs from 'fs-extra';
import type { ProjectOptions, FrameworkTemplate } from './prompts.js';
import { generateNextjsApp } from './templates/nextjs-app/index.js';
import { generateNextjsPages } from './templates/nextjs-pages/index.js';
import { generateReactVite } from './templates/react-vite/index.js';
import { generateVueVite } from './templates/vue-vite/index.js';
import { generateNuxt } from './templates/nuxt/index.js';
import { generateSvelte } from './templates/svelte/index.js';
import { generateExpress } from './templates/express/index.js';
import { generateNode } from './templates/node/index.js';

export interface FileEntry {
  path: string;
  content: string;
}

type TemplateGenerator = (options: ProjectOptions) => FileEntry[];

const generators: Record<FrameworkTemplate, TemplateGenerator> = {
  'nextjs-app': generateNextjsApp,
  'nextjs-pages': generateNextjsPages,
  'react-vite': generateReactVite,
  'vue-vite': generateVueVite,
  nuxt: generateNuxt,
  svelte: generateSvelte,
  express: generateExpress,
  node: generateNode,
};

export async function scaffoldProject(options: ProjectOptions): Promise<void> {
  const projectDir = path.resolve(process.cwd(), options.projectName);

  if (await fs.pathExists(projectDir)) {
    const entries = await fs.readdir(projectDir);
    if (entries.length > 0) {
      throw new Error(`Directory "${options.projectName}" already exists and is not empty.`);
    }
  }

  await fs.ensureDir(projectDir);

  const generator = generators[options.template];
  const files = generator(options);

  for (const file of files) {
    const filePath = path.join(projectDir, file.path);
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, file.content, 'utf-8');
  }
}
