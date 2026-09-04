import { spawn } from 'child_process';
import { join } from 'path';
import { c } from '../ui';

const rootDir = join(import.meta.dirname, '../../..');

export async function runStationCommand(args: string[]): Promise<void> {
  const sub = args[0] || 'dev';

  const runNpmScript = (script: string, title: string): Promise<void> => {
    console.log(c.azure(`\n▶ [ALCHM CLI] Launching HackStation: ${title}...\n`));
    const proc = spawn('bun', ['run', script], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    return new Promise((resolve) => {
      proc.on('close', (code) => {
        if (code !== 0) process.exit(code || 1);
        resolve();
      });
    });
  };

  if (sub === 'dev') {
    // Check and kill stale listeners on port 5173
    const lsof = Bun.spawnSync(['lsof', '-ti:5173'], { stdout: 'pipe', stderr: 'ignore' });
    const pids = (await new Response(lsof.stdout).text()).trim();
    if (pids) {
      console.log(c.dim(`Cleaning up stale dev server on port 5173 (PID: ${pids})...`));
      Bun.spawnSync(['kill', '-9', ...pids.split(/\s+/)]);
    }
    return runNpmScript('dev', 'Vite Mission Control Server (http://localhost:5173)');
  }

  if (sub === 'build') {
    return runNpmScript('build', 'Production TypeScript & Vite Build');
  }

  if (sub === 'package') {
    return runNpmScript('package', 'Production Deploy Bundle Packaging');
  }

  if (sub === 'preview') {
    return runNpmScript('preview', 'Local Production Bundle Preview');
  }

  console.log(`
${c.bold('Usage:')} alchm station <subcommand>

${c.bold('Subcommands:')}
  ${c.cyan('dev')}        Start the local Vite development server with API bridges
  ${c.cyan('build')}      Compile TypeScript & bundle production assets with Vite
  ${c.cyan('package')}    Build and package deploy bundle to outputs/
  ${c.cyan('preview')}    Preview the production build locally
`);
}
