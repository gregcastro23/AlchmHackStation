import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const workspaceRoot = join(import.meta.dirname, '..');
const foundryBin = join(homedir(), '.foundry', 'bin');
const env = {
  ...process.env,
  PATH: `${foundryBin}:${process.env.PATH ?? ''}`,
};

function run(label: string, command: string[]) {
  console.log(`\n==> ${label}`);
  const result = Bun.spawnSync(command, {
    cwd: workspaceRoot,
    env,
    stdout: 'inherit',
    stderr: 'inherit',
  });

  if (result.exitCode !== 0) {
    console.error(`\nPreflight failed during: ${label}`);
    process.exit(result.exitCode || 1);
  }
}

function findCommand(command: string): boolean {
  return Bun.spawnSync(['which', command], {
    env,
    stdout: 'ignore',
    stderr: 'ignore',
  }).exitCode === 0;
}

function requireCommand(command: string) {
  if (!findCommand(command)) {
    console.error(`Required command is missing: ${command}`);
    process.exit(1);
  }
  console.log(`[ready] ${command}`);
}

console.log('AlchmHackStation preflight');
console.log(`Workspace: ${workspaceRoot}`);

console.log('\n==> Required toolchain');
for (const command of ['bun', 'git', 'forge', 'cast', 'anvil', 'chisel']) {
  requireCommand(command);
}

console.log('\n==> Optional integrations');
for (const command of ['codex', 'vercel', 'claude', 'docker']) {
  console.log(`${findCommand(command) ? '[available]' : '[optional missing]'} ${command}`);
}
console.log(`${process.env.V0_API_KEY ? '[available]' : '[optional missing]'} V0_API_KEY`);

run('Locked dependency install', ['bun', 'install', '--frozen-lockfile']);
run('Lint', ['bun', 'run', 'lint']);
run('Production build and deploy bundle', ['bun', 'run', 'package']);

const requiredArtifacts = [
  join(workspaceRoot, 'dist', 'index.html'),
  join(workspaceRoot, 'outputs', 'deploy_bundle', 'index.html'),
  join(workspaceRoot, 'outputs', 'deploy_bundle', 'deploy_manifest.json'),
];

for (const artifact of requiredArtifacts) {
  if (!existsSync(artifact)) {
    console.error(`Missing expected artifact: ${artifact}`);
    process.exit(1);
  }
}

console.log('\nPreflight passed.');
console.log('Launch with: bun run dev -- --host localhost');
