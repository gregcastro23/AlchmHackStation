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
    id: 'codex',
    label: 'Codex CLI',
    command: ['codex', 'login', 'status'],
    loginCommand: 'codex login',
    timeoutMs: 8000,
    notes: 'Codex exposes a login status subcommand. Credential expiry is treated as opaque and verified by probe.',
  },
  {
    id: 'claude',
    label: 'Claude Code',
    command: ['claude', 'auth', 'status'],
    loginCommand: 'claude auth login',
    timeoutMs: 8000,
    notes: 'Claude auth status exits 0 when logged in and 1 when logged out.',
  },
  {
    id: 'vercel',
    label: 'Vercel CLI',
    command: ['vercel', 'whoami', '--format', 'json', '--non-interactive'],
    loginCommand: 'vercel login',
    timeoutMs: 10000,
    notes: 'Vercel whoami validates the active CLI credential without revealing it.',
  },
  {
    id: 'v0',
    label: 'v0 Platform API',
    command: null,
    loginCommand: null,
    envVar: 'V0_API_KEY',
    notes: 'v0 uses API key authentication. This probe checks presence only; a server API probe should verify health.',
  },
  {
    id: 'antigravity',
    label: 'Google Antigravity',
    command: null,
    loginCommand: null,
    notes: 'No public scriptable CLI auth-status command is configured. Verify the desktop/browser session manually.',
  },
  {
    id: 'stitch',
    label: 'Google Stitch',
    command: null,
    loginCommand: null,
    notes: 'No public scriptable CLI auth-status command is configured. Verify the Google browser session manually.',
  },
];

const sanitize = (value: string) => value
  .replace(/(?:sk|key|token|bearer)[-_a-z0-9]{8,}/gi, '[REDACTED]')
  .replace(/[A-Za-z0-9+/=_-]{40,}/g, '[REDACTED]')
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
      state: 'manual',
      installed: null,
      authenticated: null,
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
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  healthy: results.filter((result) => result.state === 'healthy').length,
  attention: results.filter((result) => !['healthy', 'manual'].includes(result.state)).length,
  manual: results.filter((result) => result.state === 'manual').length,
  results,
};

console.log(JSON.stringify(summary, null, 2));
process.exit(summary.attention > 0 ? 1 : 0);
