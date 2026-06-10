export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'openrouter' | 'local';
export type LimitAction = 'warn' | 'require_approval' | 'downgrade' | 'hard_stop';
export type RoutingProfile = 'balanced' | 'quality' | 'economy' | 'local_first';
export type CircuitState = 'closed' | 'half_open' | 'open';

export interface ProviderAccountRecord {
  id: string;
  provider: ModelProvider;
  label: string;
  workspaceId: string;
  secretRef: string;
  enabled: boolean;
  defaultForProvider: boolean;
  allowedModelAliases: string[];
  monthlyBudgetUsd: number | null;
  rotationDueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UsagePolicy {
  workspaceId: string;
  monthlyBudgetUsd: number;
  dailyBudgetUsd: number;
  warningThresholdPercent: number;
  requestsPerMinute: number;
  inputTokensPerMinute: number;
  outputTokensPerMinute: number;
  maxConcurrency: number;
  limitAction: LimitAction;
  downgradeAlias: string | null;
  pauseNewRuns: boolean;
}

export interface AgentBudgetAllocation {
  agentId: string;
  monthlyBudgetUsd: number;
  perRunBudgetUsd: number;
  limitAction: LimitAction;
  allowedModelAliases: string[];
}

export interface ModelAliasRecord {
  alias: string;
  provider: ModelProvider;
  providerModelId: string;
  accountId: string;
  enabled: boolean;
  maxInputTokens: number | null;
  maxOutputTokens: number | null;
  costClass: 'free' | 'economy' | 'standard' | 'premium';
  dataClassification: 'public' | 'internal' | 'sensitive';
}

export interface RouteLanePolicy {
  id: string;
  label: string;
  primaryAlias: string;
  fallbackAliases: string[];
  maxRunCostUsd: number;
  timeoutMs: number;
  maxRetries: number;
  requireApproval: boolean;
  localOnly: boolean;
}

export interface ProviderCircuitHealth {
  provider: ModelProvider;
  state: CircuitState;
  successRate: number;
  p95LatencyMs: number;
  consecutiveFailures: number;
  lastFailureAt: string | null;
  retryAfter: string | null;
}

export interface ModelOpsAuditEvent {
  id: string;
  occurredAt: string;
  actorType: 'operator' | 'agent' | 'gateway' | 'policy_engine';
  actorId: string;
  action: string;
  resourceType: 'account' | 'usage_policy' | 'route' | 'approval' | 'secret_ref';
  resourceId: string;
  outcome: 'allowed' | 'blocked' | 'failed';
  metadata: Record<string, string | number | boolean | null>;
}

export const MODEL_OPS_ENDPOINTS = {
  accounts: '/api/model-ops/accounts',
  usagePolicy: '/api/model-ops/usage-policy',
  usageSnapshot: '/api/model-ops/usage',
  modelAliases: '/api/model-ops/model-aliases',
  routingPolicy: '/api/model-ops/routing-policy',
  routeTest: '/api/model-ops/route-test',
  approvals: '/api/model-ops/approvals',
  providerHealth: '/api/model-ops/provider-health',
  auditEvents: '/api/model-ops/audit-events',
} as const;

export const MODEL_OPS_SECURITY_REQUIREMENTS = [
  'Never return raw provider credentials to the browser.',
  'Resolve secret references only in a trusted server runtime.',
  'Require an audit event for credential, budget, route, and approval mutations.',
  'Fail closed when account ownership, policy state, or approval state is unknown.',
  'Separate provider organization limits from HackStation workspace and agent limits.',
] as const;
