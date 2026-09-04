import { spawn } from 'child_process';
import { join } from 'path';
import { c } from '../ui';

const rootDir = join(import.meta.dirname, '../../..');

export async function runDevnetCommand(args: string[]): Promise<void> {
  const sub = args[0] || 'test';

  const runScript = (scriptName: string, title: string): Promise<void> => {
    console.log(c.azure(`\n▶ [ALCHM CLI] Running ${title}...\n`));
    const proc = spawn('bun', [join(rootDir, `scripts/${scriptName}`)], {
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

  if (sub === 'test' || sub === 'all') {
    return runScript('run_all_devnet_tests.ts', 'Canonical Coins Master Devnet Audit');
  }

  if (sub === 'amm') {
    return runScript('test_amm_bespoke_swap.ts', 'Bespoke AMM Liquidity Router');
  }

  if (sub === 'wavefunction') {
    return runScript('test_pricing_wavefunction.ts', 'Chart Dignity Wavefunction Operator');
  }

  if (sub === 'preflight') {
    return runScript('preflight.ts', 'Station Preflight Check');
  }

  console.log(`
${c.bold('Usage:')} alchm devnet <subcommand>

${c.bold('Subcommands:')}
  ${c.cyan('test')}           Run master canonical coin test suite across all 5 modules
  ${c.cyan('amm')}            Test bespoke AMM routing, invariant swaps & slippage
  ${c.cyan('wavefunction')}   Test celestial chart dignity pricing wavefunction
  ${c.cyan('preflight')}      Run workstation preflight checks & build verification
`);
}
