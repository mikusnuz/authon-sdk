import { access, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const workspaceRoot = fileURLToPath(new URL('../', import.meta.url));
const packagesRoot = join(workspaceRoot, 'packages');
const temporaryRoot = await mkdtemp(join(tmpdir(), 'authon-package-consumer-'));

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed in ${cwd}:\n${result.stdout}${result.stderr}`,
    );
  }
  return result.stdout;
}

function collectExportTargets(value, targets = []) {
  if (typeof value === 'string') targets.push(value);
  else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectExportTargets(nested, targets);
  }
  return targets;
}

async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

async function installedVersion(path) {
  return JSON.parse(await readFile(join(workspaceRoot, path), 'utf8')).version;
}

async function createReactNativeStub(root, name, version) {
  const directory = join(root, ...name.split('/'));
  await mkdir(directory, { recursive: true });
  await writeJson(join(directory, 'package.json'), {
    name,
    version,
    main: './index.cjs',
    types: './index.d.ts',
  });

  if (name === 'react-native') {
    await writeFile(
      join(directory, 'index.cjs'),
      [
        "exports.ActivityIndicator = 'ActivityIndicator';",
        'exports.Linking = { openURL: async () => undefined };',
        'exports.StyleSheet = { create: (styles) => styles };',
        "exports.Text = 'Text';",
        "exports.TouchableOpacity = 'TouchableOpacity';",
        "exports.View = 'View';",
        '',
      ].join('\n'),
    );
    await writeFile(
      join(directory, 'index.d.ts'),
      [
        'export interface TextStyle { [key: string]: unknown }',
        'export interface ViewStyle { [key: string]: unknown }',
        'export const ActivityIndicator: unknown;',
        'export const Linking: { openURL(url: string): Promise<void> };',
        'export const StyleSheet: { create<T>(styles: T): T };',
        'export const Text: unknown;',
        'export const TouchableOpacity: unknown;',
        'export const View: unknown;',
        '',
      ].join('\n'),
    );
  } else {
    await writeFile(
      join(directory, 'index.cjs'),
      "exports.Path = 'Path';\nexports.Rect = 'Rect';\n",
    );
    await writeFile(
      join(directory, 'index.d.ts'),
      [
        'declare const Svg: unknown;',
        'export default Svg;',
        'export const Path: unknown;',
        'export const Rect: unknown;',
        '',
      ].join('\n'),
    );
  }
  return directory;
}

try {
  const tarballsDirectory = join(temporaryRoot, 'tarballs');
  const stubsDirectory = join(temporaryRoot, 'stubs');
  const consumerDirectory = join(temporaryRoot, 'consumer');
  await mkdir(tarballsDirectory, { recursive: true });

  const packedPackages = new Map();
  for (const directory of (await readdir(packagesRoot)).sort()) {
    const packageDirectory = join(packagesRoot, directory);
    let manifest;
    try {
      manifest = JSON.parse(await readFile(join(packageDirectory, 'package.json'), 'utf8'));
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }

    const packed = JSON.parse(
      run('pnpm', ['pack', '--json', '--pack-destination', tarballsDirectory], packageDirectory),
    );
    const packedPaths = new Set(packed.files.map(({ path }) => path));
    const requiredTargets = [
      manifest.main,
      manifest.module,
      manifest.types,
      ...collectExportTargets(manifest.exports),
      ...Object.values(manifest.bin ?? {}),
    ].filter(Boolean);

    for (const target of requiredTargets) {
      const normalizedTarget = target.replace(/^\.\//, '');
      if (!packedPaths.has(normalizedTarget)) {
        throw new Error(`${manifest.name} does not pack required entry ${target}`);
      }
    }
    packedPackages.set(manifest.name, { manifest, tarball: packed.filename });
    process.stdout.write(`packed ${manifest.name}\n`);
  }

  const reactNativeStub = await createReactNativeStub(stubsDirectory, 'react-native', '0.80.0');
  const reactNativeSvgStub = await createReactNativeStub(
    stubsDirectory,
    'react-native-svg',
    '15.0.0',
  );
  const authonDependencies = Object.fromEntries(
    [...packedPackages].map(([name, { tarball }]) => [name, `file:${tarball}`]),
  );
  const consumerManifest = {
    name: 'authon-packed-consumer',
    private: true,
    type: 'module',
    dependencies: {
      ...authonDependencies,
      '@angular/core': await installedVersion(
        'examples/angular/node_modules/@angular/core/package.json',
      ),
      '@angular/router': await installedVersion(
        'examples/angular/node_modules/@angular/router/package.json',
      ),
      next: await installedVersion('packages/nextjs/node_modules/next/package.json'),
      react: await installedVersion('node_modules/react/package.json'),
      'react-dom': await installedVersion('node_modules/react-dom/package.json'),
      'react-native': `file:${reactNativeStub}`,
      'react-native-svg': `file:${reactNativeSvgStub}`,
      svelte: await installedVersion('packages/svelte/node_modules/svelte/package.json'),
      vue: await installedVersion('packages/vue/node_modules/vue/package.json'),
    },
    pnpm: { overrides: authonDependencies },
  };
  await writeJson(join(consumerDirectory, 'package.json'), consumerManifest);

  await writeFile(
    join(consumerDirectory, 'consumer.mjs'),
    `
const runtimePackages = [
  '@authon/angular', '@authon/js', '@authon/nextjs', '@authon/nuxt', '@authon/react',
  '@authon/shared', '@authon/svelte', '@authon/vue',
];
for (const packageName of runtimePackages) {
  const loaded = await import(packageName);
  if (Object.keys(loaded).length === 0) throw new Error(packageName + ' has no ESM exports');
}
const nextServer = await import('@authon/nextjs/server');
if (typeof nextServer.auth !== 'function' || typeof nextServer.currentUser !== 'function') {
  throw new Error('@authon/nextjs/server ESM exports are incomplete');
}
const reactNative = await import('@authon/react-native');
if (typeof reactNative.AuthonMobileClient !== 'function' || typeof reactNative.AuthonProvider !== 'function') {
  throw new Error('@authon/react-native ESM exports are incomplete');
}
`,
  );
  await writeFile(
    join(consumerDirectory, 'consumer.cjs'),
    `
const runtimePackages = [
  '@authon/angular', '@authon/js', '@authon/nextjs', '@authon/nuxt',
  '@authon/react', '@authon/react-native', '@authon/shared', '@authon/svelte', '@authon/vue',
];
for (const packageName of runtimePackages) {
  const loaded = require(packageName);
  if (Object.keys(loaded).length === 0) throw new Error(packageName + ' has no CJS exports');
}
const nextServer = require('@authon/nextjs/server');
if (typeof nextServer.auth !== 'function' || typeof nextServer.currentUser !== 'function') {
  throw new Error('@authon/nextjs/server CJS exports are incomplete');
}
`,
  );
  await writeFile(
    join(consumerDirectory, 'consumer.ts'),
    `
import { AuthonService } from '@authon/angular';
import { Authon } from '@authon/js';
import { authonMiddleware } from '@authon/nextjs';
import { auth, currentUser } from '@authon/nextjs/server';
import { authonModule } from '@authon/nuxt';
import { AuthonProvider } from '@authon/react';
import { AuthonMobileClient } from '@authon/react-native';
import type { AuthonContextValue as ReactNativeAuthonContextValue } from '@authon/react-native';
import type { AuthonUser } from '@authon/shared';
import { createAuthonStore } from '@authon/svelte';
import { createAuthon } from '@authon/vue';

const core = new Authon('pk_test_consumer');
const angular = new AuthonService({ publishableKey: 'pk_test_consumer' });
const mobile = new AuthonMobileClient({ publishableKey: 'pk_test_consumer' });
const middleware = authonMiddleware();
const nuxt = authonModule({ publishableKey: 'pk_test_consumer' });
const svelte = createAuthonStore('pk_test_consumer');
const vue = createAuthon({ publishableKey: 'pk_test_consumer' });
type User = AuthonUser;
type MobileContext = ReactNativeAuthonContextValue;
void [core, angular, mobile, middleware, nuxt, svelte, vue, AuthonProvider, auth, currentUser];
void (null as User | MobileContext | null);
`,
  );
  await writeJson(join(consumerDirectory, 'tsconfig.json'), {
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      jsx: 'react-jsx',
    },
    include: ['./consumer.ts'],
  });

  run(
    'pnpm',
    ['install', '--ignore-scripts', '--no-frozen-lockfile', '--config.auto-install-peers=false'],
    consumerDirectory,
  );
  for (const [name] of packedPackages) {
    const manifestPath = join(consumerDirectory, 'node_modules', ...name.split('/'), 'package.json');
    if ((await readFile(manifestPath, 'utf8')).includes('workspace:')) {
      throw new Error(`${name} retained a workspace protocol in its packed manifest`);
    }
  }
  await access(join(consumerDirectory, 'node_modules/.bin/create-authon'));

  run(process.execPath, ['./consumer.mjs'], consumerDirectory);
  run(process.execPath, ['./consumer.cjs'], consumerDirectory);
  run('pnpm', ['exec', 'tsc', '--project', join(consumerDirectory, 'tsconfig.json')], workspaceRoot);
  process.stdout.write('verified packed ESM, CJS, CLI, and TypeScript consumers\n');
} finally {
  if (!temporaryRoot.startsWith(`${tmpdir()}${sep}`)) {
    throw new Error(`Refusing to clean unexpected temporary path ${temporaryRoot}`);
  }
  await rm(temporaryRoot, { recursive: true, force: true });
}
