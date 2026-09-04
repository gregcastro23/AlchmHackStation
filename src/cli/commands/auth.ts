import { spawn } from 'child_process';
import { join } from 'path';
import { c, badges, printTable, printBox } from '../ui';

const rootDir = join(import.meta.dirname, '../../..');

interface ProbeResult {
  id: string;
  label: string;
  state: 'healthy' | 'expired' | 'unavailable' | 'error' | 'manual';
  installed: boolean | null;
  authenticated: boolean | null;
  checkedAt: string;
  loginCommand: string | null;
  message: string;
}

interface ProbeSummary {
  schemaVersion: number;
  protocol: string;
  ecosystem: string;
  generatedAt: string;
  healthy: number;
  attention: number;
  manual: number;
  results: ProbeResult[];
}

export async function runAuthCommand(args: string[]): Promise<void> {
  const isWatch = args.includes('watch') || args.includes('-w') || args.includes('--watch');
  const isJson = args.includes('--json') || args.includes('-j');

  if (isWatch) {
    console.log(c.azure('Starting Alchm CLI Auth Watcher... (Ctrl+C to stop)'));
    const proc = spawn('bun', [join(rootDir, 'scripts/watch_cli_auth.ts')], {
      stdio: 'inherit',
      cwd: rootDir,
    });
    return new Promise((resolve) => {
      proc.on('close', () => resolve());
    });
  }

  // Run probe
  const proc = Bun.spawn(['bun', join(rootDir, 'scripts/check_cli_auth.ts')], {
    cwd: rootDir,
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const rawOut = await new Response(proc.stdout).text();
  await proc.exited;

  let summary: ProbeSummary;
  try {
    summary = JSON.parse(rawOut);
  } catch {
    console.error(c.red('Failed to parse CLI auth probe results. Raw output:'));
    console.log(rawOut);
    process.exit(1);
  }

  if (isJson) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  console.log(c.bold('\n🔍 Toolchain & Multisig Authentication Audit:'));
  console.log(c.dim(`Protocol: ${summary.protocol} · Ecosystem: ${summary.ecosystem}`));

  const headers = ['Tool / Service', 'Status', 'Installed', 'Auth Details / Remedy'];
  const rows: string[][] = summary.results.map((r) => {
    let stateBadge = badges.unavailable;
    if (r.state === 'healthy') stateBadge = badges.healthy;
    else if (r.state === 'expired') stateBadge = badges.attention;
    else if (r.state === 'error') stateBadge = badges.fail;

    const installedStr = r.installed === true ? c.green('Yes') : r.installed === false ? c.red('No') : c.dim('N/A');

    let detailStr = r.message;
    if (detailStr.startsWith('{')) {
      try {
        const parsed = JSON.parse(detailStr);
        detailStr = `${parsed.email || parsed.name || parsed.username || 'Authenticated'}`;
      } catch {
        // keep string
      }
    }

    if (r.state !== 'healthy' && r.loginCommand) {
      detailStr += ` → run: ${c.amber(r.loginCommand)}`;
    }

    return [c.bold(r.label), stateBadge, installedStr, detailStr];
  });

  console.log('');
  printTable(headers, rows);
  console.log('');

  const summaryLines = [
    `Healthy Probes:   ${c.green(summary.healthy)}`,
    `Needs Attention:  ${summary.attention > 0 ? c.amber(summary.attention) : c.dim(0)}`,
    `Generated At:     ${c.dim(summary.generatedAt)}`,
  ];
  printBox('Auth Summary Scorecard', summaryLines, summary.attention === 0 ? undefined : '\x1b[38;5;214m');
}
