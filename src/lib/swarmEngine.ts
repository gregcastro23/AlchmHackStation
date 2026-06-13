// SWARM NEXUS — deterministic idea-decomposition + orchestration engine.
//
// This is the "intelligence" behind The Crucible. It takes a freeform product
// idea and produces a structured, explainable build plan: detected domains, a
// recommended stack, and a dependency-aware task graph assigned across a swarm
// of model-specialized agents. It is fully deterministic — the same idea always
// yields the same plan — so the visualization is reproducible during a demo.

export type AgentRole =
  | 'architect'
  | 'builder'
  | 'designer'
  | 'sentinel'
  | 'herald'
  | 'captain';

export type Phase = 'Plan' | 'Build' | 'Verify' | 'Ship';

export type OrchestrationPattern =
  | 'fanout'
  | 'pipeline'
  | 'debate'
  | 'supervisor'
  | 'swarm';

export interface AgentSpec {
  role: AgentRole;
  name: string;
  glyph: string;
  model: string;
  modelFamily: string;
  color: string;
  discipline: string;
}

export interface PatternSpec {
  id: OrchestrationPattern;
  name: string;
  blurb: string;
}

export interface PlanTask {
  id: string;
  title: string;
  phase: Phase;
  role: AgentRole;
  complexity: number; // 1..5 — drives processing time + token burn
  domain: string;
  dependsOn: number; // index into ordered task list, -1 for none
}

export interface BuildPlan {
  idea: string;
  headline: string;
  domains: DetectedDomain[];
  languages: DetectedDomain[];
  stack: {
    language: string;
    toolchain: string;
    framework: string;
    styling: string;
    database: string;
    ai: string;
  };
  tasks: PlanTask[];
  totalComplexity: number;
  estMinutes: number;
  riskNotes: string[];
}

export interface DetectedDomain {
  key: string;
  label: string;
  weight: number;
}

// ----------------------------------------------------------------------------
// Language registry. Every mainstream development language is first-class:
// detection signals route ideas to the right language, each carries its real
// toolchain, and primary languages inject language-specific tasks (Rust gets
// cargo/clippy/WASM treatment, Python gets uv/pytest, Go gets goroutines...).
// ----------------------------------------------------------------------------
export interface LanguageSpec {
  id: string;
  name: string;
  short: string;
  toolchain: string;
  testCmd: string;
  color: string;
  signals: string[];
  defaultFramework: string | null;
  tasks: Array<Omit<PlanTask, 'id' | 'dependsOn' | 'domain'>>;
}

export const LANGUAGES: LanguageSpec[] = [
  {
    id: 'typescript',
    name: 'TypeScript',
    short: 'TS',
    toolchain: 'Bun + tsc 6',
    testCmd: 'bun test',
    color: '#7dd3fc',
    signals: ['typescript', 'tsx', 'react', 'frontend', 'web'],
    defaultFramework: null,
    tasks: [
      { title: 'Lock strict tsconfig + shared types', phase: 'Plan', role: 'architect', complexity: 1 },
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    short: 'JS',
    toolchain: 'Node 24 / Bun',
    testCmd: 'bun test',
    color: '#ffb020',
    signals: ['javascript', 'node', 'nodejs', 'deno', 'express'],
    defaultFramework: null,
    tasks: [],
  },
  {
    id: 'rust',
    name: 'Rust',
    short: 'RS',
    toolchain: 'cargo + rustc (stable)',
    testCmd: 'cargo test',
    color: '#fb7185',
    signals: [
      'rust', 'cargo', 'crate', 'wasm', 'webassembly', 'tokio', 'bevy', 'axum',
      'systems', 'embedded', 'firmware', 'microcontroller', 'kernel', 'compiler',
      'interpreter', 'high performance', 'low latency', 'memory safe', 'blazing fast',
    ],
    defaultFramework: 'Tauri V2',
    tasks: [
      { title: 'Scaffold cargo workspace + crates', phase: 'Plan', role: 'architect', complexity: 2 },
      { title: 'Implement core engine in Rust', phase: 'Build', role: 'builder', complexity: 4 },
      { title: 'Compile WASM bridge for the shell', phase: 'Build', role: 'builder', complexity: 3 },
      { title: 'Pass clippy + borrow-checker audit', phase: 'Verify', role: 'sentinel', complexity: 3 },
    ],
  },
  {
    id: 'python',
    name: 'Python',
    short: 'PY',
    toolchain: 'uv + CPython 3.13',
    testCmd: 'pytest',
    color: '#9ddf2e',
    signals: [
      'python', 'ml', 'machine learning', 'data science', 'pandas', 'pytorch',
      'tensorflow', 'scraping', 'scraper', 'jupyter', 'notebook', 'neural', 'training',
    ],
    defaultFramework: null,
    tasks: [
      { title: 'Set up uv env + typed data models', phase: 'Plan', role: 'architect', complexity: 2 },
      { title: 'Build inference / data pipeline', phase: 'Build', role: 'builder', complexity: 4 },
      { title: 'Validate with pytest + type checks', phase: 'Verify', role: 'sentinel', complexity: 2 },
    ],
  },
  {
    id: 'go',
    name: 'Go',
    short: 'GO',
    toolchain: 'go 1.25 + modules',
    testCmd: 'go test ./...',
    color: '#7dd3fc',
    signals: ['golang', 'grpc', 'microservice', 'microservices', 'kubernetes', 'concurrency'],
    defaultFramework: null,
    tasks: [
      { title: 'Wire goroutine worker pool + gRPC', phase: 'Build', role: 'builder', complexity: 3 },
      { title: 'Race-detector + bench pass', phase: 'Verify', role: 'sentinel', complexity: 2 },
    ],
  },
  {
    id: 'java',
    name: 'Java',
    short: 'JV',
    toolchain: 'JDK 25 + Gradle',
    testCmd: 'gradle test',
    color: '#ffb020',
    signals: ['java', 'spring', 'jvm', 'enterprise'],
    defaultFramework: null,
    tasks: [
      { title: 'Spring service skeleton + DI graph', phase: 'Build', role: 'builder', complexity: 3 },
    ],
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    short: 'KT',
    toolchain: 'Kotlin 2.2 + Gradle',
    testCmd: 'gradle test',
    color: '#c4b5fd',
    signals: ['kotlin', 'android', 'jetpack'],
    defaultFramework: 'Jetpack Compose',
    tasks: [
      { title: 'Compose UI shell + nav graph', phase: 'Build', role: 'designer', complexity: 3 },
    ],
  },
  {
    id: 'swift',
    name: 'Swift',
    short: 'SW',
    toolchain: 'Swift 6 + Xcode',
    testCmd: 'swift test',
    color: '#fb7185',
    signals: ['swift', 'swiftui', 'ios', 'iphone', 'ipad', 'macos', 'watchos'],
    defaultFramework: 'SwiftUI',
    tasks: [
      { title: 'SwiftUI shell + state container', phase: 'Build', role: 'designer', complexity: 3 },
    ],
  },
  {
    id: 'csharp',
    name: 'C#',
    short: 'C#',
    toolchain: '.NET 10 + MSBuild',
    testCmd: 'dotnet test',
    color: '#c4b5fd',
    signals: ['csharp', 'dotnet', 'unity', 'xamarin', 'blazor'],
    defaultFramework: null,
    tasks: [
      { title: 'Compose .NET service + DI host', phase: 'Build', role: 'builder', complexity: 3 },
    ],
  },
  {
    id: 'cpp',
    name: 'C/C++',
    short: 'C++',
    toolchain: 'clang 21 + CMake',
    testCmd: 'ctest',
    color: '#7dd3fc',
    signals: ['cpp', 'unreal', 'vulkan', 'opengl', 'cuda', 'graphics engine'],
    defaultFramework: null,
    tasks: [
      { title: 'CMake targets + sanitizer matrix', phase: 'Plan', role: 'architect', complexity: 3 },
      { title: 'ASan/UBSan + fuzz pass', phase: 'Verify', role: 'sentinel', complexity: 3 },
    ],
  },
  {
    id: 'ruby',
    name: 'Ruby',
    short: 'RB',
    toolchain: 'Ruby 3.4 + Bundler',
    testCmd: 'rspec',
    color: '#fb7185',
    signals: ['ruby', 'rails'],
    defaultFramework: null,
    tasks: [
      { title: 'Rails resources + migrations', phase: 'Build', role: 'builder', complexity: 3 },
    ],
  },
  {
    id: 'php',
    name: 'PHP',
    short: 'PHP',
    toolchain: 'PHP 8.4 + Composer',
    testCmd: 'phpunit',
    color: '#c4b5fd',
    signals: ['php', 'laravel', 'wordpress'],
    defaultFramework: null,
    tasks: [
      { title: 'Laravel routes + Eloquent models', phase: 'Build', role: 'builder', complexity: 3 },
    ],
  },
  {
    id: 'elixir',
    name: 'Elixir',
    short: 'EX',
    toolchain: 'Elixir 1.18 + Mix',
    testCmd: 'mix test',
    color: '#c4b5fd',
    signals: ['elixir', 'phoenix', 'erlang', 'liveview', 'fault tolerant'],
    defaultFramework: 'Phoenix LiveView',
    tasks: [
      { title: 'Supervision tree + LiveView mounts', phase: 'Build', role: 'builder', complexity: 3 },
    ],
  },
  {
    id: 'zig',
    name: 'Zig',
    short: 'ZG',
    toolchain: 'zig 0.15',
    testCmd: 'zig test',
    color: '#ffb020',
    signals: ['zig', 'comptime'],
    defaultFramework: null,
    tasks: [
      { title: 'Comptime allocator strategy pass', phase: 'Plan', role: 'architect', complexity: 3 },
    ],
  },
  {
    id: 'solidity',
    name: 'Solidity',
    short: 'SOL',
    toolchain: 'Foundry (forge + anvil)',
    testCmd: 'forge test',
    color: '#9ddf2e',
    signals: ['solidity', 'foundry', 'hardhat', 'evm'],
    defaultFramework: null,
    tasks: [
      { title: 'Forge test suite + gas snapshots', phase: 'Verify', role: 'sentinel', complexity: 3 },
    ],
  },
];

export const LANGUAGE_BY_ID: Record<string, LanguageSpec> = LANGUAGES.reduce(
  (acc, l) => {
    acc[l.id] = l;
    return acc;
  },
  {} as Record<string, LanguageSpec>,
);

export const LANGUAGE_NAMES: string[] = LANGUAGES.map((l) => l.name);

// ----------------------------------------------------------------------------
// The crew. Each agent is bound to a distinct model family so the swarm reads
// as a true multi-model orchestration, mirroring how 2026 agent teams route
// reasoning, codegen, and verification to specialized models.
// ----------------------------------------------------------------------------
export const AGENTS: AgentSpec[] = [
  {
    role: 'architect',
    name: 'ARCHITECT',
    glyph: '◈',
    model: 'Claude Opus 4.8',
    modelFamily: 'anthropic',
    color: '#9ddf2e',
    discipline: 'system design',
  },
  {
    role: 'builder',
    name: 'BUILDER',
    glyph: '⌬',
    model: 'Codex o-series',
    modelFamily: 'openai',
    color: '#7dd3fc',
    discipline: 'implementation',
  },
  {
    role: 'designer',
    name: 'DESIGNER',
    glyph: '✦',
    model: 'Stitch · Claude Design',
    modelFamily: 'design',
    color: '#c4b5fd',
    discipline: 'interaction',
  },
  {
    role: 'sentinel',
    name: 'SENTINEL',
    glyph: '⛬',
    model: 'Gemini 2.5 Pro',
    modelFamily: 'google',
    color: '#ffb020',
    discipline: 'verification',
  },
  {
    role: 'herald',
    name: 'HERALD',
    glyph: '✧',
    model: 'Claude Sonnet 4.6',
    modelFamily: 'anthropic',
    color: '#fb7185',
    discipline: 'narrative',
  },
  {
    role: 'captain',
    name: 'CAPTAIN',
    glyph: '⏣',
    model: 'Vercel Ship Agent',
    modelFamily: 'vercel',
    color: '#e3e3d8',
    discipline: 'release',
  },
];

export const AGENT_BY_ROLE: Record<AgentRole, AgentSpec> = AGENTS.reduce(
  (acc, a) => {
    acc[a.role] = a;
    return acc;
  },
  {} as Record<AgentRole, AgentSpec>,
);

export const PATTERNS: PatternSpec[] = [
  { id: 'swarm', name: 'SWARM', blurb: 'Self-organizing — agents pull from a shared queue continuously.' },
  { id: 'fanout', name: 'FAN-OUT', blurb: 'Every agent fires in parallel from the core at once.' },
  { id: 'pipeline', name: 'PIPELINE', blurb: 'Plan → Build → Verify → Ship, strictly phase-gated.' },
  { id: 'supervisor', name: 'SUPERVISOR', blurb: 'Core dispatches one task at a time and collects each result.' },
  { id: 'debate', name: 'DEBATE', blurb: 'Builder and Sentinel volley before any task is committed.' },
];

// ----------------------------------------------------------------------------
// Domain detection. Each detector contributes weight when its signals appear in
// the idea text, and injects domain-specific tasks into the plan.
// ----------------------------------------------------------------------------
interface DomainDef {
  key: string;
  label: string;
  signals: string[];
  tasks: Array<Omit<PlanTask, 'id' | 'dependsOn' | 'domain'>>;
}

const DOMAIN_DEFS: DomainDef[] = [
  {
    key: 'auth',
    label: 'Identity & Auth',
    signals: ['login', 'auth', 'sign in', 'sign up', 'account', 'user', 'oauth', 'session', 'password'],
    tasks: [
      { title: 'Model identity & session boundaries', phase: 'Plan', role: 'architect', complexity: 3 },
      { title: 'Build auth flow + protected routes', phase: 'Build', role: 'builder', complexity: 3 },
      { title: 'Audit token storage & session fixation', phase: 'Verify', role: 'sentinel', complexity: 4 },
    ],
  },
  {
    key: 'payments',
    label: 'Payments & Billing',
    signals: ['pay', 'payment', 'stripe', 'checkout', 'subscription', 'billing', 'invoice', 'pricing', 'paywall'],
    tasks: [
      { title: 'Design billing schema & webhooks', phase: 'Plan', role: 'architect', complexity: 4 },
      { title: 'Wire checkout + subscription UI', phase: 'Build', role: 'builder', complexity: 4 },
      { title: 'Verify idempotency & refund paths', phase: 'Verify', role: 'sentinel', complexity: 4 },
    ],
  },
  {
    key: 'realtime',
    label: 'Realtime & Multiplayer',
    signals: ['realtime', 'real-time', 'live', 'chat', 'collaborate', 'multiplayer', 'sync', 'presence', 'websocket'],
    tasks: [
      { title: 'Design reducer/event model for sync', phase: 'Plan', role: 'architect', complexity: 4 },
      { title: 'Build live presence + optimistic UI', phase: 'Build', role: 'builder', complexity: 4 },
      { title: 'Stress-test concurrent state merges', phase: 'Verify', role: 'sentinel', complexity: 3 },
    ],
  },
  {
    key: 'ai',
    label: 'AI & Agents',
    signals: ['ai', 'agent', 'llm', 'gpt', 'claude', 'gemini', 'ml', 'model', 'prompt', 'rag', 'embedding', 'generate', 'copilot', 'assistant'],
    tasks: [
      { title: 'Spec agent loop + tool contracts', phase: 'Plan', role: 'architect', complexity: 4 },
      { title: 'Build streaming inference surface', phase: 'Build', role: 'builder', complexity: 4 },
      { title: 'Tune prompts + guardrail evals', phase: 'Verify', role: 'sentinel', complexity: 3 },
      { title: 'Frame the "AI does the work" beat', phase: 'Ship', role: 'herald', complexity: 2 },
    ],
  },
  {
    key: 'data',
    label: 'Data & Analytics',
    signals: ['dashboard', 'analytics', 'data', 'chart', 'report', 'metric', 'graph', 'visualize', 'insight', 'kpi'],
    tasks: [
      { title: 'Define metric model & query layer', phase: 'Plan', role: 'architect', complexity: 3 },
      { title: 'Build live charts + drilldowns', phase: 'Build', role: 'designer', complexity: 3 },
      { title: 'Validate aggregation correctness', phase: 'Verify', role: 'sentinel', complexity: 3 },
    ],
  },
  {
    key: 'commerce',
    label: 'Commerce & Catalog',
    signals: ['shop', 'store', 'ecommerce', 'e-commerce', 'product', 'cart', 'catalog', 'marketplace', 'inventory', 'order'],
    tasks: [
      { title: 'Model catalog + cart + order flow', phase: 'Plan', role: 'architect', complexity: 3 },
      { title: 'Build storefront + cart UX', phase: 'Build', role: 'builder', complexity: 3 },
      { title: 'Verify inventory race conditions', phase: 'Verify', role: 'sentinel', complexity: 3 },
    ],
  },
  {
    key: 'social',
    label: 'Social & Feed',
    signals: ['social', 'feed', 'post', 'follow', 'comment', 'like', 'community', 'profile', 'share', 'notification'],
    tasks: [
      { title: 'Design feed ranking + graph model', phase: 'Plan', role: 'architect', complexity: 3 },
      { title: 'Build feed + composer + reactions', phase: 'Build', role: 'builder', complexity: 3 },
    ],
  },
  {
    key: 'web3',
    label: 'Web3 & Contracts',
    signals: ['web3', 'crypto', 'nft', 'token', 'contract', 'wallet', 'onchain', 'on-chain', 'blockchain', 'defi', 'solidity'],
    tasks: [
      { title: 'Spec contract surface + invariants', phase: 'Plan', role: 'architect', complexity: 4 },
      { title: 'Wire wallet connect + tx flow', phase: 'Build', role: 'builder', complexity: 4 },
      { title: 'Run reentrancy + gas security audit', phase: 'Verify', role: 'sentinel', complexity: 5 },
    ],
  },
  {
    key: 'media',
    label: 'Media & Streaming',
    signals: ['video', 'image', 'photo', 'audio', 'stream', 'media', 'camera', 'upload', 'gallery', 'voice'],
    tasks: [
      { title: 'Plan media pipeline + storage', phase: 'Plan', role: 'architect', complexity: 3 },
      { title: 'Build upload + transform + player', phase: 'Build', role: 'builder', complexity: 3 },
    ],
  },
  {
    key: 'geo',
    label: 'Maps & Geo',
    signals: ['map', 'location', 'geo', 'gps', 'route', 'nearby', 'place', 'directions', 'distance'],
    tasks: [
      { title: 'Model geo entities + spatial queries', phase: 'Plan', role: 'architect', complexity: 3 },
      { title: 'Build interactive map + clustering', phase: 'Build', role: 'designer', complexity: 3 },
    ],
  },
];

const STOPWORDS = new Set([
  'a', 'an', 'the', 'for', 'and', 'or', 'to', 'of', 'with', 'that', 'this', 'app',
  'application', 'platform', 'tool', 'build', 'make', 'create', 'lets', 'let', 'users',
  'people', 'where', 'which', 'can', 'will', 'into', 'their', 'they', 'you', 'your',
]);

function headlineFrom(idea: string): string {
  const cleaned = idea.replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'Untitled mission';
  const words = cleaned.split(' ').filter((w) => !STOPWORDS.has(w.toLowerCase()));
  const pick = (words.length ? words : cleaned.split(' ')).slice(0, 6).join(' ');
  return pick.replace(/[.,!?;:]+$/g, '');
}

// Tokenize on word boundaries so signals match whole words only — "marketplace"
// must never trip the "place" (geo) signal, and "ai" must not match "chain".
// "c#"/"c++"/".net" lose their symbols here, so language signals use the
// symbol-free forms (csharp, cpp, dotnet).
function buildMatcher(idea: string): (sig: string) => boolean {
  const cleaned = idea.toLowerCase().replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
  const padded = ` ${cleaned} `;
  const tokens = new Set(cleaned.split(' ').filter(Boolean));
  // add naive singular forms so "payments"/"nfts" match "payment"/"nft"
  for (const t of [...tokens]) {
    if (t.length > 3 && t.endsWith('s')) tokens.add(t.slice(0, -1));
  }
  return (sig: string): boolean => {
    const s = sig.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    return s.includes(' ') ? padded.includes(` ${s} `) : tokens.has(s);
  };
}

function detectDomains(matches: (sig: string) => boolean): DetectedDomain[] {
  const found: DetectedDomain[] = [];
  for (const def of DOMAIN_DEFS) {
    let hits = 0;
    for (const sig of def.signals) {
      if (matches(sig)) hits += 1;
    }
    if (hits > 0) found.push({ key: def.key, label: def.label, weight: hits });
  }
  return found.sort((a, b) => b.weight - a.weight);
}

function detectLanguages(matches: (sig: string) => boolean, domainKeys: Set<string>): DetectedDomain[] {
  const found: DetectedDomain[] = [];
  for (const lang of LANGUAGES) {
    let hits = 0;
    for (const sig of lang.signals) {
      if (matches(sig)) hits += 1;
    }
    if (hits > 0) found.push({ key: lang.id, label: lang.name, weight: hits });
  }
  // Web3 contracts always pull Solidity in as a companion language.
  if (domainKeys.has('web3') && !found.some((l) => l.key === 'solidity')) {
    found.push({ key: 'solidity', label: 'Solidity', weight: 1 });
  }
  return found.sort((a, b) => b.weight - a.weight);
}

function chooseStack(domainKeys: Set<string>, primary: LanguageSpec): BuildPlan['stack'] {
  const framework =
    primary.defaultFramework ??
    (domainKeys.has('web3') || domainKeys.has('media') ? 'Next.js' : 'Vite React');
  const styling = primary.defaultFramework ? 'Native styling' : 'Tailwind v4';
  const database = domainKeys.has('realtime') || domainKeys.has('social')
    ? 'SpaceTimeDB'
    : domainKeys.has('data') || domainKeys.has('commerce') || domainKeys.has('payments')
      ? 'PostgreSQL'
      : 'SQLite';
  const ai = domainKeys.has('ai') ? 'Claude API (Opus 4.8)' : 'none';
  return { language: primary.name, toolchain: primary.toolchain, framework, styling, database, ai };
}

function buildRiskNotes(domainKeys: Set<string>, total: number): string[] {
  const notes: string[] = [];
  if (domainKeys.has('payments')) notes.push('Payments path needs idempotent webhooks before demo.');
  if (domainKeys.has('web3')) notes.push('Contract security audit gates the deploy seal.');
  if (domainKeys.has('realtime')) notes.push('Concurrent state merges are the highest-risk surface.');
  if (domainKeys.has('auth')) notes.push('Session security must pass Sentinel before ship.');
  if (total > 28) notes.push('Scope is heavy — consider cutting one domain for the demo window.');
  if (notes.length === 0) notes.push('Scope is tight and demo-ready; protect the core loop.');
  return notes;
}

// Baseline spine present in every mission — scaffold, design system, deploy, pitch.
const BASELINE: Array<Omit<PlanTask, 'id' | 'dependsOn' | 'domain'>> = [
  { title: 'Lock data model & system map', phase: 'Plan', role: 'architect', complexity: 3 },
  { title: 'Scaffold app shell & routing', phase: 'Build', role: 'builder', complexity: 2 },
  { title: 'Compose design system & tokens', phase: 'Build', role: 'designer', complexity: 2 },
  { title: 'Smoke-test the critical path', phase: 'Verify', role: 'sentinel', complexity: 2 },
  { title: 'Seal env & ship preview deploy', phase: 'Ship', role: 'captain', complexity: 3 },
  { title: 'Draft the 90-second demo arc', phase: 'Ship', role: 'herald', complexity: 1 },
];

const PHASE_ORDER: Record<Phase, number> = { Plan: 0, Build: 1, Verify: 2, Ship: 3 };

export function decomposeIdea(rawIdea: string, overrideLanguageId?: string): BuildPlan {
  const idea = rawIdea.trim() || 'Launch of Alchm Token System on Ethereum - deploy ERC-20 contract, coordinate planetary agent nodes, and establish on-chain secure verification gates';
  const matches = buildMatcher(idea);
  const domains = detectDomains(matches);
  const domainKeys = new Set(domains.map((d) => d.key));
  const languages = detectLanguages(matches, domainKeys);
  
  let primaryLang = LANGUAGE_BY_ID[languages[0]?.key ?? 'typescript'] ?? LANGUAGE_BY_ID.typescript;
  if (overrideLanguageId && LANGUAGE_BY_ID[overrideLanguageId]) {
    primaryLang = LANGUAGE_BY_ID[overrideLanguageId];
    const existingIdx = languages.findIndex((l) => l.key === overrideLanguageId);
    if (existingIdx >= 0) {
      const [removed] = languages.splice(existingIdx, 1);
      languages.unshift(removed);
    } else {
      languages.unshift({ key: overrideLanguageId, label: primaryLang.name, weight: 1 });
    }
  }

  const collected: Array<Omit<PlanTask, 'id' | 'dependsOn'>> = BASELINE.map((t) => ({ ...t, domain: 'core' }));
  for (const def of DOMAIN_DEFS) {
    if (!domainKeys.has(def.key)) continue;
    for (const t of def.tasks) collected.push({ ...t, domain: def.key });
  }
  // Primary-language tasks, plus companion-language verify tasks (e.g. Solidity
  // audits riding alongside a TypeScript dapp).
  for (const t of primaryLang.tasks) collected.push({ ...t, domain: `lang:${primaryLang.id}` });
  for (const detected of languages.slice(1)) {
    const lang = LANGUAGE_BY_ID[detected.key];
    if (!lang) continue;
    for (const t of lang.tasks.filter((task) => task.phase === 'Verify')) {
      collected.push({ ...t, domain: `lang:${lang.id}` });
    }
  }

  // Order by phase so dependency wiring + pipeline scheduling are coherent.
  collected.sort((a, b) => PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase]);

  const tasks: PlanTask[] = collected.map((t, i) => {
    // Each task depends on the most recent task from an earlier phase, giving a
    // realistic Plan→Build→Verify→Ship dependency chain without a full DAG.
    let dependsOn = -1;
    for (let j = i - 1; j >= 0; j--) {
      if (PHASE_ORDER[collected[j].phase] < PHASE_ORDER[t.phase]) {
        dependsOn = j;
        break;
      }
    }
    return {
      ...t,
      id: `task_${i}`,
      dependsOn,
    };
  });

  const totalComplexity = tasks.reduce((sum, t) => sum + t.complexity, 0);
  const estMinutes = Math.round(totalComplexity * 4.5);

  return {
    idea,
    headline: headlineFrom(idea),
    domains,
    languages,
    stack: chooseStack(domainKeys, primaryLang),
    tasks,
    totalComplexity,
    estMinutes,
    riskNotes: buildRiskNotes(domainKeys, totalComplexity),
  };
}

// Curated demo prompts that each light up a distinct domain + language mix.
export const SAMPLE_IDEAS: string[] = [
  'Launch Alchm Token System on Base - deploy ERC-20 contract and set up agent reward pools',
  'Orchestrate Alchm Planetary Agent MCPs with strict cryptographic secure verification gates',
  'Deploy Alchm token staking contracts with automated yield distribution agents',
  'Establish zero-knowledge timing-obfuscated timing gates for private token withdrawals',
  'Integrate Circle Gateway payment streams with Alchm agent coordination networks',
];
