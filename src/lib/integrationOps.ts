export type IntegrationId = 'antigravity' | 'claude' | 'stitch' | 'codex' | 'v0' | 'vercel';
export type AuthMechanism = 'browser_oauth' | 'cli_oauth' | 'api_key' | 'access_token' | 'local_session';
export type AuthHealth = 'healthy' | 'warning' | 'expired' | 'unavailable' | 'error' | 'manual';

export interface IntegrationAccount {
  id: IntegrationId;
  label: string;
  authMechanism: AuthMechanism;
  statusCommand: string | null;
  loginCommand: string | null;
  logoutCommand: string | null;
  secretRef: string | null;
  expiryVisibility: 'exact' | 'opaque' | 'not_applicable';
  probeIntervalMinutes: number;
  capabilities: string[];
}

export interface IntegrationHealthSnapshot {
  integrationId: IntegrationId;
  health: AuthHealth;
  installed: boolean | null;
  authenticated: boolean | null;
  accountLabel: string | null;
  checkedAt: string;
  expiresAt: string | null;
  nextProbeAt: string;
  message: string;
}

export interface BuildRelayStage {
  id: string;
  integrationId: IntegrationId;
  title: string;
  objective: string;
  inputs: string[];
  outputs: string[];
  approvalRequired: boolean;
}

export interface ContextPacket {
  schemaVersion: 1;
  generatedAt: string;
  project: {
    name: string;
    repository: string;
    mission: string;
    stack: string[];
  };
  request: {
    objective: string;
    acceptanceCriteria: string[];
    designDirection: string;
    targetIntegration: IntegrationId;
  };
  controls: {
    lockedFiles: string[];
    maxBudgetUsd: number;
    requireReview: boolean;
    requireBuildProof: boolean;
    requireVisualProof: boolean;
  };
  handoff: {
    sourceIntegration: IntegrationId;
    nextIntegration: IntegrationId;
    artifactRefs: string[];
  };
}

export const AUTH_CHECK_ENDPOINT = '/api/integrations/auth/check';
export const AUTH_EVENT_ENDPOINT = '/api/integrations/auth/events';
export const CONTEXT_PACKET_ENDPOINT = '/api/integrations/context-packets';
export const V0_HANDOFF_ENDPOINT = '/api/integrations/v0/handoff';

export const INTEGRATION_SECURITY_RULES = [
  'Never expose raw OAuth tokens, API keys, cookies, or keychain values in browser responses.',
  'Treat an opaque expiry as healthy only until the next successful probe.',
  'Require operator confirmation before opening a browser login or replacing an active credential.',
  'Record login, logout, token rotation, probe failure, and account switch events.',
  'Run provider CLIs with bounded timeouts and redact stdout before persistence.',
] as const;
