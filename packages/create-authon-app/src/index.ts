#!/usr/bin/env node

import pc from 'picocolors';
import { collectOptions } from './prompts.js';
import { scaffoldProject } from './scaffold.js';
import { parseArgs } from './args.js';

async function main() {
  console.log();
  console.log(pc.bold(pc.magenta('  @authon/create-app')) + pc.dim(' — scaffold a new Authon project'));
  console.log();

  try {
    const cliArgs = parseArgs(process.argv.slice(2));
    const options = await collectOptions(cliArgs);

    console.log();
    console.log(pc.cyan('  Scaffolding project...'));
    console.log();

    await scaffoldProject(options);

    console.log(pc.green('  Done!') + ' Your project is ready.');
    console.log();
    console.log('  Next steps:');
    console.log();
    console.log(pc.cyan(`    cd ${options.projectName}`));
    console.log(pc.cyan('    npm install'));
    console.log(pc.dim('    # Copy .env.example to .env and fill in your Authon credentials'));
    console.log(pc.cyan('    npm run dev'));
    console.log();
    console.log(pc.dim('  Get your keys at ') + pc.underline('https://dashboard.authon.dev'));
    console.log();
  } catch (err) {
    if ((err as { name?: string }).name === 'ExitPromptError') {
      console.log(pc.dim('\n  Cancelled.\n'));
      process.exit(0);
    }
    console.error(pc.red(`\n  Error: ${(err as Error).message}\n`));
    process.exit(1);
  }
}

main();
