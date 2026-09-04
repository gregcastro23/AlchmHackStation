import { spawn } from 'child_process';
import { join } from 'path';
import { existsSync, readdirSync } from 'fs';
import { c, printTable, printBox } from '../ui';

const rootDir = join(import.meta.dirname, '../../..');

export async function runIdlCommand(args: string[]): Promise<void> {
  const sub = args[0] || 'list';

  if (sub === 'sync') {
    console.log(c.azure('Synchronizing Anchor IDL definitions across ASOL, Pentacles, and HackStation...\n'));
    const proc = spawn('bun', [join(rootDir, 'scripts/generate_types.ts'), '--sync'], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    return new Promise((resolve) => {
      proc.on('close', (code) => {
        if (code !== 0) process.exit(code || 1);
        resolve();
      });
    });
  }

  if (sub === 'generate') {
    console.log(c.azure('Compiling TypeScript typings from existing IDL files...\n'));
    const proc = spawn('bun', [join(rootDir, 'scripts/generate_types.ts')], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    return new Promise((resolve) => {
      proc.on('close', (code) => {
        if (code !== 0) process.exit(code || 1);
        resolve();
      });
    });
  }

  if (sub === 'list') {
    const idlDir = join(rootDir, 'src/idl');
    console.log(c.bold('\n📁 Registered Anchor IDL Schemas:'));

    if (!existsSync(idlDir)) {
      console.log(c.dim('No src/idl directory found. Run `alchm idl sync` to synchronize.'));
      return;
    }

    const files = readdirSync(idlDir).filter((f) => f.endsWith('.json'));
    if (files.length === 0) {
      console.log(c.dim('No IDL files found in src/idl. Run `alchm idl sync` to fetch them.'));
      return;
    }

    const headers = ['Program / IDL File', 'Size', 'Instructions', 'Accounts', 'Status'];
    const rows = files.map((file) => {
      try {
        const raw = require('fs').readFileSync(join(idlDir, file), 'utf-8');
        const content = JSON.parse(raw);
        const instructions = content.instructions?.length || 0;
        const accounts = content.accounts?.length || 0;
        const size = `${(Buffer.byteLength(raw) / 1024).toFixed(1)} KB`;
        return [c.bold(file), size, `${instructions} instructions`, `${accounts} accounts`, c.green('Synchronized')];
      } catch {
        return [c.bold(file), 'Unknown', '-', '-', c.red('Invalid JSON')];
      }
    });

    printTable(headers, rows);
    console.log('');
    printBox(
      'IDL Synchronization Commands',
      [
        'Sync from ASOL & Pentacles:   alchm idl sync',
        'Regenerate TypeScript Types: alchm idl generate',
        'Target Output:               src/types/solana-programs.ts',
      ],
      '\x1b[38;5;75m'
    );
    return;
  }

  console.log(`
${c.bold('Usage:')} alchm idl <subcommand>

${c.bold('Subcommands:')}
  ${c.cyan('list')}        List current registered Anchor IDLs and accounts
  ${c.cyan('sync')}        Pull and sync IDLs from ASOL & Pentacles, then regenerate TS
  ${c.cyan('generate')}    Regenerate client TypeScript bindings from local src/idl/
`);
}
