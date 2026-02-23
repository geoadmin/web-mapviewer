import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

function runCommand(command, args) {
  console.log(`> Running: ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: rootDir,
  });
  if (result.status !== 0) {
    console.error(`Command failed with status: ${result.status}`);
    process.exit(result.status);
  }
}

/**
 * Finds and deletes all `node_modules` folders recursively from rootDir.
 * It's safer than `pnpm -r exec` because it catches all node_modules,
 * not just those in workspace packages (e.g. nested ones).
 */
function recursiveClean(dir) {
  const files = readdirSync(dir);
  for (const file of files) {
    const fullPath = join(dir, file);
    try {
      if (file === 'node_modules' && statSync(fullPath).isDirectory()) {
        console.log(`Removing: ${fullPath}`);
        rmSync(fullPath, { recursive: true, force: true });
      } else if (file !== 'node_modules' && !file.startsWith('.') && statSync(fullPath).isDirectory()) {
        recursiveClean(fullPath);
      }
    } catch (err) {
      console.warn(`Could not process ${fullPath}: ${err.message}`);
      throw err
    }
  }
}

async function main() {
    console.log(`Starting hard pnpm reset in: ${rootDir}`);

    // 1. Remove lockfile
    const lockfilePath = join(rootDir, 'pnpm-lock.yaml');
    if (existsSync(lockfilePath)) {
      console.log(`Removing: ${lockfilePath}`);
      rmSync(lockfilePath, { force: true });
    }

    // 2. Remove all node_modules
    console.log('> Searching for node_modules to remove...');
    recursiveClean(rootDir);

    // 3. Clean pnpm store
    console.log('> Pruning pnpm store...');
    runCommand('pnpm', ['store', 'prune']);

    // 4. Fresh install
    console.log('> Performing fresh pnpm install (re-downloading if necessary)...');
    runCommand('pnpm', ['install', '--force']);

    console.log('\nSuccess: Re-installation completed from scratch!');
}

main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
})

