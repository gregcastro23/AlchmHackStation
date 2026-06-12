// OVERMIND — the station's live AI build authority.
//
// Real Anthropic API integration, browser-side (BYOK). The operator's key is
// stored in localStorage only, sent only to api.anthropic.com, and never
// logged. The agent runs a manual streaming tool-use loop so every text delta,
// tool call, and tool result can be rendered live in the console — and its
// tools drive the actual app (forge the swarm, set the stack, open modules).

import type Anthropic from '@anthropic-ai/sdk';
import { LANGUAGE_NAMES, LANGUAGES } from './swarmEngine';

const VAULT_KEY = 'alchm.overmind.vault.v1';

export const DEFAULT_MODEL = 'claude-opus-4-8';

export interface ModelInfo {
  id: string;
  label: string;
}

// Cached catalog (2026-05); the live Models API overlay replaces this on connect.
export const MODEL_CATALOG: ModelInfo[] = [
  { id: 'claude-opus-4-8', label: 'Claude Opus 4.8' },
  { id: 'claude-fable-5', label: 'Claude Fable 5' },
  { id: 'claude-opus-4-7', label: 'Claude Opus 4.7' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { id: 'claude-haiku-4-5', label: 'Claude Haiku 4.5' },
];

// $ per MTok [input, output] — used for the live spend meter.
const PRICING: Record<string, [number, number]> = {
  'claude-fable-5': [10, 50],
  'claude-opus-4-8': [5, 25],
  'claude-opus-4-7': [5, 25],
  'claude-opus-4-6': [5, 25],
  'claude-sonnet-4-6': [3, 15],
  'claude-haiku-4-5': [1, 5],
};

export function estimateCostUsd(model: string, inputTokens: number, outputTokens: number): number {
  const [inP, outP] = PRICING[model] ?? PRICING[DEFAULT_MODEL];
  return (inputTokens * inP + outputTokens * outP) / 1_000_000;
}

// Adaptive thinking is supported on Fable 5 / Opus 4.6+ / Sonnet 4.6 only.
function supportsAdaptiveThinking(model: string): boolean {
  return /fable|opus-4-[678]|sonnet-4-6/.test(model);
}

// ---- key vault (local-only) ----
export function loadKey(): string {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return '';
    return (JSON.parse(raw) as { anthropic?: string }).anthropic ?? '';
  } catch {
    return '';
  }
}

export function saveKey(key: string): void {
  localStorage.setItem(VAULT_KEY, JSON.stringify({ anthropic: key }));
}

export function clearKey(): void {
  localStorage.removeItem(VAULT_KEY);
}

export function maskKey(key: string): string {
  if (key.length <= 12) return '••••••••';
  return `${key.slice(0, 10)}…${key.slice(-4)}`;
}

export async function makeClient(apiKey: string): Promise<Anthropic> {
  const { default: AnthropicClient } = await import('@anthropic-ai/sdk');
  return new AnthropicClient({ apiKey, dangerouslyAllowBrowser: true });
}

// Live model discovery — also doubles as the key health probe (no tokens billed).
export async function probeConnection(apiKey: string): Promise<ModelInfo[]> {
  const client = await makeClient(apiKey);
  const models: ModelInfo[] = [];
  for await (const m of client.models.list()) {
    models.push({ id: m.id, label: m.display_name ?? m.id });
  }
  return models;
}

// ---- the agentic loop ----

export interface ToolExecution {
  name: string;
  input: Record<string, unknown>;
  result: string;
  isError: boolean;
}

export interface OvermindEvents {
  onTextDelta: (delta: string) => void;
  onToolCall: (name: string, input: Record<string, unknown>) => void;
  onToolResult: (exec: ToolExecution) => void;
  onUsage: (inputTokens: number, outputTokens: number) => void;
}

export type ToolExecutor = (input: Record<string, unknown>) => Promise<string> | string;

export const OVERMIND_TOOLS: Anthropic.Tool[] = [
  {
    name: 'decompose_idea',
    description:
      'Decompose a freeform product idea into the station build plan: detected domains, recommended stack, and a dependency-aware task graph across the agent swarm. Call this when the operator describes an app they want to build and you need the structured plan before acting.',
    input_schema: {
      type: 'object',
      properties: {
        idea: { type: 'string', description: 'The product idea in plain language' },
      },
      required: ['idea'],
    },
  },
  {
    name: 'forge_swarm',
    description:
      'Dispatch an idea to the Swarm Nexus: decomposes it and launches the live multi-agent build visualization. Call this when the operator wants to see the swarm build their idea, after you have settled on the idea text and an orchestration pattern.',
    input_schema: {
      type: 'object',
      properties: {
        idea: { type: 'string', description: 'The final idea text to forge' },
        pattern: {
          type: 'string',
          enum: ['swarm', 'fanout', 'pipeline', 'supervisor', 'debate'],
          description:
            'Orchestration pattern: swarm (self-organizing queue), fanout (all-parallel), pipeline (phase-gated), supervisor (one task at a time), debate (builder/sentinel volley)',
        },
      },
      required: ['idea', 'pattern'],
    },
  },
  {
    name: 'set_stack',
    description:
      'Reconfigure the station workspace stack, including the core development language. Call when the build plan or operator preference implies a different language, framework, styling engine, or database than the current one — e.g. set language to Rust for systems/WASM/performance work, Python for ML and data, Go for concurrent services, Swift/Kotlin for native mobile, Solidity for contracts.',
    input_schema: {
      type: 'object',
      properties: {
        language: {
          type: 'string',
          enum: LANGUAGE_NAMES,
          description: 'Core development language for the build',
        },
        framework: { type: 'string', enum: ['Vite React', 'Next.js', 'Tauri V2'] },
        cssEngine: { type: 'string', enum: ['Tailwind v4', 'Vanilla CSS'] },
        database: { type: 'string', enum: ['SpaceTimeDB', 'PostgreSQL', 'SQLite'] },
      },
      required: [],
    },
  },
  {
    name: 'read_station_state',
    description:
      'Read the current HackStation state: mission readiness, active stack, foundry status, and recent operator-console log lines. Call this before advising when you need ground truth about what the station is doing.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'open_module',
    description:
      'Navigate the operator UI to a station module. Call when your guidance is about a specific module so the operator lands on it.',
    input_schema: {
      type: 'object',
      properties: {
        tab: {
          type: 'string',
          enum: [
            'swarm-nexus',
            'mission-control',
            'integration-ops',
            'usage-limits',
            'model-accounts',
            'routing-guardrails',
            'console',
            'network',
            'security',
          ],
        },
      },
      required: ['tab'],
    },
  },
];

const SYSTEM_PROMPT = `You are OVERMIND, the build authority of AlchmHackStation — a hackathon mission-control room. You command a six-agent swarm (Architect, Builder, Designer, Sentinel, Herald, Captain) and decide how ideas become shipped demos.

Operating doctrine:
- You are the authority on building. For minor choices (pattern selection, stack details, naming), decide and state your reasoning in one line rather than asking. Ask only when scope is genuinely ambiguous.
- You are polyglot. The station forges in every mainstream language — ${LANGUAGES.map((l) => l.name).join(', ')} — each with its real toolchain (Rust → ${LANGUAGES.find((l) => l.id === 'rust')?.toolchain}, Python → uv, Go → modules, etc.). Choose the language for the job and arm it via set_stack: Rust for systems, WASM, engines, and performance-critical cores; Python for ML/data; TypeScript as the web default; Go for concurrent services; Swift/Kotlin for native mobile; Solidity for on-chain contracts.
- Use your tools proactively. When the operator describes an app idea: call decompose_idea to get the plan, set_stack if the recommended stack differs from the current one, then forge_swarm to launch the build. Call read_station_state first when you need ground truth.
- Orchestration patterns: swarm = balanced default; fanout = maximum parallelism for demos; pipeline = phase-gated rigor; supervisor = careful sequencing; debate = adversarial quality for risky builds.
- Be terse and operational. Speak like a mission controller: short sentences, concrete verdicts, no filler. One- or two-sentence wrap-up when work is done.
- Default to silence between tool calls — only narrate when you find something, change direction, or hit a blocker.`;

export interface RunResult {
  history: Anthropic.MessageParam[];
  stopReason: string;
}

export async function runOvermind(opts: {
  apiKey: string;
  model: string;
  history: Anthropic.MessageParam[];
  directive: string;
  executors: Record<string, ToolExecutor>;
  events: OvermindEvents;
  signal?: AbortSignal;
}): Promise<RunResult> {
  const { apiKey, model, executors, events } = opts;
  const client = await makeClient(apiKey);
  const messages: Anthropic.MessageParam[] = [
    ...opts.history,
    { role: 'user', content: opts.directive },
  ];

  const MAX_TURNS = 8;
  let stopReason = 'end_turn';

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const stream = client.messages.stream(
      {
        model,
        max_tokens: 16000,
        system: SYSTEM_PROMPT,
        tools: OVERMIND_TOOLS,
        messages,
        ...(supportsAdaptiveThinking(model) ? { thinking: { type: 'adaptive' as const } } : {}),
      },
      { signal: opts.signal },
    );

    stream.on('text', (delta) => events.onTextDelta(delta));

    const message = await stream.finalMessage();
    events.onUsage(message.usage.input_tokens, message.usage.output_tokens);
    messages.push({ role: 'assistant', content: message.content });
    stopReason = message.stop_reason ?? 'end_turn';

    if (stopReason === 'pause_turn') continue;
    if (stopReason !== 'tool_use') break;

    const toolUses = message.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
    );
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const input = (tu.input ?? {}) as Record<string, unknown>;
      events.onToolCall(tu.name, input);
      const exec = executors[tu.name];
      let result: string;
      let isError = false;
      try {
        if (exec) {
          result = await exec(input);
        } else {
          result = `Unknown tool: ${tu.name}`;
          isError = true;
        }
      } catch (err) {
        result = `Tool failed: ${err instanceof Error ? err.message : String(err)}`;
        isError = true;
      }
      events.onToolResult({ name: tu.name, input, result, isError });
      results.push({
        type: 'tool_result',
        tool_use_id: tu.id,
        content: result,
        is_error: isError,
      });
    }
    messages.push({ role: 'user', content: results });
  }

  return { history: messages, stopReason };
}

export function describeApiError(err: unknown): string {
  const error = err as { name?: string; status?: number; message?: string };
  if (error.status === 401 || error.name === 'AuthenticationError') {
    return 'Authentication failed — the API key was rejected. Check it in the vault.';
  }
  if (error.status === 403 || error.name === 'PermissionDeniedError') {
    return 'Permission denied — this key cannot access the selected model.';
  }
  if (error.status === 404 || error.name === 'NotFoundError') {
    return 'Model not found — pick a different model from the selector.';
  }
  if (error.status === 429 || error.name === 'RateLimitError') {
    return 'Rate limited — wait a moment and retry.';
  }
  if (error.name === 'APIConnectionError') {
    return 'Connection failed — check network access to api.anthropic.com.';
  }
  if (typeof error.status === 'number') {
    return `API error ${error.status}: ${error.message ?? 'Unknown API error'}`;
  }
  return err instanceof Error ? err.message : String(err);
}
