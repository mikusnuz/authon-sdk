import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';

const packagesRoot = new URL('../packages/', import.meta.url);

function collectExportTargets(value, targets = []) {
  if (typeof value === 'string') {
    targets.push(value);
  } else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) collectExportTargets(nested, targets);
  }
  return targets;
}

for (const directory of await readdir(packagesRoot)) {
  const packageDirectory = new URL(`./${directory}/`, packagesRoot);
  const manifestPath = new URL('./package.json', packageDirectory);
  let manifest;

  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') continue;
    throw error;
  }

  const packed = spawnSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], {
    cwd: packageDirectory,
    encoding: 'utf8',
  });
  if (packed.status !== 0) {
    throw new Error(`Unable to inspect ${manifest.name}:\n${packed.stderr || packed.stdout}`);
  }

  const [{ files }] = JSON.parse(packed.stdout);
  const packedPaths = new Set(files.map(({ path }) => path));
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
  process.stdout.write(`verified ${manifest.name}\n`);
}
