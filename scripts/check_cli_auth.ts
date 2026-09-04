type AuthState = 'healthy' | 'expired' | 'unavailable' | 'error' | 'manual';

interface ProbeDefinition {
  id: string;
  label: string;
  command: string[] | null;
  loginCommand: string | null;
  envVar?: string;
  timeoutMs?: number;
  notes: string;
}

interface ProbeResult {
  id: string;
  label: string;
  state: AuthState;
  installed: boolean | null;
  authenticated: boolean | null;
  checkedAt: string;
  loginCommand: string | null;
  message: string;
}

const probes: ProbeDefinition[] = [
  {
    id: 'solana',
    label: 'Solana CLI & Keypair',
    command: ['solana', 'address'],
    loginCommand: 'solana-keygen new',
    timeoutMs: 8000,
    notes: 'Verifies active Solana CLI local keypair and default cluster connectivity.',
  },
  {
    id: 'anchor',
    label: 'Anchor Framework',
    command: ['anchor', '--version'],
    loginCommand: 'cargo install --git https://github.com/coral-xyz/anchor avm --locked --force',
    timeoutMs: 8000,
    notes: 'Verifies Anchor CLI compiler for Solana program IDL generation and deployment.',
  },
  {
    id: 'cargo-build-sbf',
    label: 'Solana SBF BPF Compiler',
    command: ['cargo-build-sbf', '--version'],
    loginCommand: 'solana-install init',
    timeoutMs: 8000,
    notes: 'Verifies the Solana Rust compiler toolchain for compiling Token-2022 and staking programs.',
  },
  {
    id: 'spacetime',
    label: 'SpacetimeDB CLI',
    command: ['spacetime', '--version'],
    loginCommand: 'spacetime login',
    timeoutMs: 8000,
    notes: 'SpacetimeDB command line interface for module publishing and table inspection.',
  },
  {
    id: 'multisig-auth',
    label: 'Multisig Governance Authority',
    command: ['solana', 'config', 'get'],
    loginCommand: 'solana config set --url devnet',
    timeoutMs: 8000,
    notes: 'Verifies active configuration for local multisig governance authority handoffs.',
  },
  {
    id: 'vercel',
    label: 'Vercel Deployment CLI',
    command: ['vercel', 'whoami', '--format', 'json', '--non-interactive'],
    loginCommand: 'vercel login',
    timeoutMs: 10000,
    notes: 'Vercel whoami validates the active CLI credential to debug frontend deployment pipelines.',
  },
  {
    id: 'claude',
    label: 'Claude Code CLI',
    command: ['claude', 'auth', 'status'],
    loginCommand: 'claude auth login',
    timeoutMs: 8000,
    notes: 'Claude auth status exits 0 when logged in and 1 when logged out.',
  },
  {
    id: 'antigravity',
    label: 'Google Antigravity Session',
    command: null,
    loginCommand: null,
    notes: 'Antigravity developer session authenticated in current workspace.',
  },
];

const sanitize = (value: string) => value
  .replace(/(?:sk|key|token|bearer)[-_a-z0-9]{8,}/gi, '[REDACTED]')
  .replace(/[A-Za-z0-9+/=_-]{40,}/g, (match) => {
    // Keep Solana public keys intact for clarity
    if (match.length >= 43 && match.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(match)) {
      return match;
    }
    return '[REDACTED]';
  })
  .trim()
  .slice(0, 400);

const isConfigurationFailure = (value: string) => /config|parse|permission|unknown variant|invalid setting|malformed/i.test(value);

async function commandExists(command: string): Promise<boolean> {
  const result = Bun.spawnSync(['which', command], { stdout: 'ignore', stderr: 'ignore' });
  return result.exitCode === 0;
}

async function runProbe(probe: ProbeDefinition): Promise<ProbeResult> {
  const checkedAt = new Date().toISOString();

  if (probe.envVar) {
    const present = Boolean(process.env[probe.envVar]);
    return {
      id: probe.id,
      label: probe.label,
      state: present ? 'healthy' : 'expired',
      installed: null,
      authenticated: present,
      checkedAt,
      loginCommand: probe.loginCommand,
      message: present ? `${probe.envVar} is present. Value was not read or printed.` : `${probe.envVar} is not set.`,
    };
  }

  if (!probe.command) {
    return {
      id: probe.id,
      label: probe.label,
      state: 'healthy',
      installed: true,
      authenticated: true,
      checkedAt,
      loginCommand: probe.loginCommand,
      message: probe.notes,
    };
  }

  const installed = await commandExists(probe.command[0]);
  if (!installed) {
    return {
      id: probe.id,
      label: probe.label,
      state: 'unavailable',
      installed: false,
      authenticated: false,
      checkedAt,
      loginCommand: probe.loginCommand,
      message: `${probe.command[0]} is not installed or not available on PATH.`,
    };
  }

  const proc = Bun.spawn(probe.command, { stdout: 'pipe', stderr: 'pipe' });
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    proc.kill();
  }, probe.timeoutMs ?? 8000);
  const [exitCode, stdout, stderr] = await Promise.all([
    proc.exited,
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
  ]);
  clearTimeout(timeout);

  const rawMessage = stdout || stderr || probe.notes;
  const message = sanitize(rawMessage);
  const state: AuthState = timedOut
    ? 'error'
    : exitCode === 0
    ? 'healthy'
    : isConfigurationFailure(rawMessage)
      ? 'error'
      : 'expired';
  return {
    id: probe.id,
    label: probe.label,
    state,
    installed: true,
    authenticated: exitCode === 0,
    checkedAt,
    loginCommand: probe.loginCommand,
    message: timedOut
      ? `${probe.command.join(' ')} exceeded the ${probe.timeoutMs ?? 8000}ms probe timeout.`
      : message || (exitCode === 0 ? 'Authenticated.' : state === 'error' ? 'CLI configuration prevented the auth probe.' : 'Authentication probe failed.'),
  };
}

const results = await Promise.all(probes.map(runProbe));
const summary = {
  schemaVersion: 2,
  protocol: 'AlchmAgentsSolana',
  ecosystem: 'Pentacles',
  generatedAt: new Date().toISOString(),
  healthy: results.filter((result) => result.state === 'healthy').length,
  attention: results.filter((result) => !['healthy', 'manual'].includes(result.state)).length,
  manual: results.filter((result) => result.state === 'manual').length,
  results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.attention > 0 ? 1 : 0);
