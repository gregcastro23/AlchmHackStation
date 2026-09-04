import { spawn } from 'child_process';
import { join } from 'path';
import { c, tokens, printTable, printBox } from '../ui';

const rootDir = join(import.meta.dirname, '../../..');

export async function runToken2022Command(args: string[]): Promise<void> {
  const sub = args[0] || 'info';

  const runScript = (scriptName: string, title: string): Promise<void> => {
    console.log(c.azure(`\n▶ EXECUTING: ${title}...\n`));
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

  if (sub === 'security' || sub === 'sec') {
    return runScript('test_token2022_security.ts', 'Token-2022 Security & Lock Invariant Audits');
  }

  if (sub === 'scaling') {
    return runScript('test_lossless_scaling.ts', 'Lossless 10^4 Scaling & Fixed-Point Arithmetic Invariants');
  }

  if (sub === 'pipeline') {
    return runScript('test_token2022_pipeline.ts', 'Push-Button Token-2022 Pipeline & SpacetimeDB Bridge');
  }

  if (sub === 'deploy') {
    return runScript('deploy_token2022.ts', 'Token-2022 Canonical Mint Deployment Pipeline');
  }

  if (sub === 'test') {
    await runScript('test_token2022_security.ts', '1/3 Token-2022 Security Invariants');
    await runScript('test_lossless_scaling.ts', '2/3 Lossless Scaling');
    await runScript('test_token2022_pipeline.ts', '3/3 SpacetimeDB Pipeline Bridge');
    return;
  }

  if (sub === 'info' || sub === 'list') {
    console.log(c.bold('\n🪐 Canonical Token-2022 Elemental Token Configurations:'));

    const headers = ['Token', 'Symbol', 'Extension Type', 'Protocol Role'];
    const rows = [
      [
        tokens.spirit,
        '🝇 / 🜂',
        c.crimson('ExtensionType.TransferHook'),
        'Kinetic friction combat fees burned to celestial pool',
      ],
      [
        tokens.essence,
        '🝑 / 🜄',
        c.azure('ExtensionType.ConfidentialTransferMint'),
        'Privacy-shielded ElGamal encrypted agent transfers',
      ],
      [
        tokens.matter,
        '🝙 / 🜃',
        c.emerald('ExtensionType.NonTransferable'),
        'Soulbound cryptographic agent identity badges',
      ],
      [
        tokens.substance,
        '🝉 / 🜁',
        c.gold('ExtensionType.PermanentDelegate'),
        'Automated yield & SpacetimeDB balance reconciliation',
      ],
    ];

    printTable(headers, rows);
    console.log('');
    printBox(
      'Token-2022 Verification Commands',
      [
        'Security Audit:    alchm token2022 security',
        'Scaling Proofs:    alchm token2022 scaling',
        'Pipeline Bridge:   alchm token2022 pipeline',
        'Deploy Mint:       alchm token2022 deploy',
      ],
      '\x1b[38;5;141m'
    );
    return;
  }

  console.log(`
${c.bold('Usage:')} alchm token2022 <subcommand>

${c.bold('Subcommands:')}
  ${c.cyan('info')}       List the 4 canonical Token-2022 token specifications & extensions
  ${c.cyan('test')}       Run all Token-2022 test suites sequentially
  ${c.cyan('security')}   Run Transfer Hook, Freeze, and Non-Transferable security audits
  ${c.cyan('scaling')}    Verify 10^4 fixed-point lossless scaling invariants
  ${c.cyan('pipeline')}   Run SpacetimeDB push-button sync bridge test
  ${c.cyan('deploy')}     Deploy Token-2022 canonical mints to Solana cluster
`);
}
