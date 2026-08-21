import { readFileSync } from 'node:fs';

export interface CliArgs {
  template?: string;
  projectName?: string;
  yes?: boolean;
}

export function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {};
  const positional: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--template' || arg === '-t') {
      args.template = argv[++i];
    } else if (arg === '--yes' || arg === '-y') {
      args.yes = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--version' || arg === '-v') {
      console.log(readPackageVersion());
      process.exit(0);
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  if (positional.length > 0) {
    args.projectName = positional[0];
  }

  return args;
}

export function readPackageVersion(): string {
  const manifest = JSON.parse(
    readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
  ) as { version?: unknown };

  if (typeof manifest.version !== 'string' || manifest.version.length === 0) {
    throw new Error('Unable to read @authon/create-app version');
  }

  return manifest.version;
}

function printHelp() {
  console.log(`
  Usage: @authon/create-app [project-name] [options]

  Options:
    -t, --template <template>  Use a specific template (skip framework prompt)
    -y, --yes                  Skip prompts and use defaults
    -h, --help                 Show this help message
    -v, --version              Show version number

  Templates:
    nextjs-app       Next.js with App Router
    nextjs-pages     Next.js with Pages Router
    react-vite       React with Vite
    vue-vite         Vue 3 with Vite
    nuxt             Nuxt 3
    svelte           SvelteKit
    express          Express.js
    node             Plain Node.js

  Examples:
    npx @authon/create-app
    npx @authon/create-app my-app
    npx @authon/create-app my-app --template nextjs-app
  `);
}
