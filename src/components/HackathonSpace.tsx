import { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Code2,
  ExternalLink,
  FileCode2,
  Gauge,
  Hammer,
  HelpCircle,
  Lightbulb,
  Play,
  Rocket,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  WandSparkles,
} from 'lucide-react';

export type HackathonTrack = 'from-scratch' | 'extend-open-source' | 'ship-a-feature';

interface HackathonSpaceProps {
  missionReadiness: number;
  foundryState: 'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR';
  gitHubConnected: boolean;
  onNavigate: (tab: string) => void;
  onCommitLog: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
  onStartBuild: (idea: string, track: HackathonTrack) => void;
}

interface ProjectDraft {
  name: string;
  pitch: string;
}


const pentaclesModules: Array<{
  id: HackathonTrack;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  rule: string;
}> = [
  {
    id: 'from-scratch',
    number: '01',
    title: 'Rust Server Module',
    shortTitle: 'authoritative state',
    description: 'Authoritative transaction loop, 18 tables, scheduled ticks, and owner-gated reducers.',
    rule: 'Location: /server (Rust). spacetime build compiles it to WASM to run directly inside SpacetimeDB.',
  },
  {
    id: 'extend-open-source',
    number: '02',
    title: 'Playable Web Client',
    shortTitle: '2D / AR simulation',
    description: 'Browser client using HTML5 Canvas, Web Audio, and offline fallback local storage simulation.',
    rule: 'Location: / (client.html). Currently runs standalone offline; requires TS SDK live module integration.',
  },
  {
    id: 'ship-a-feature',
    number: '03',
    title: 'AR Unity Client',
    shortTitle: 'MMO interface',
    description: 'Client utilizing AR Foundation, true North gyroscope alignment, and generated C# bindings.',
    rule: 'Location: /unity. Renders live stars, maps alt/az, and dispatches reducer transactions on tap-to-strike.',
  },
];

const checklist = [
  { id: 'btree_index', label: 'Add btree indexes on card.owner, deck_slot.owner, and trade.proposer/partner', group: 'Database Optimization' },
  { id: 'prune_tables', label: 'Implement scheduled prune janitor on battle and oracle_request tables', group: 'Database Optimization' },
  { id: 'prompt_cache', label: 'Verify prompt cache size is >4096 tokens (Haiku 4.5 minimum cache block)', group: 'AI & Oracle Hardening' },
  { id: 'rebill_fix', label: 'Fix Oracle re-billing infinite loop on failed request API errors', group: 'AI & Oracle Hardening' },
  { id: 'groq_integration', label: 'Configure Groq API (Llama-70B) for free-chain planetary agent responses', group: 'AI & Oracle Hardening' },
  { id: 'owner_token', label: 'Mint deployable owner SPACETIME_TOKEN for feeder and oracle cron services', group: 'Services Deployment' },
  { id: 'sdk_wiring', label: 'Wire web client client.js to wss maincloud using TypeScript SDK', group: 'Web Client Integration' },
  { id: 'word_duel_brain', label: 'Wire planetary-agents Word Duel brain to the agent_letters seam', group: 'Web Client Integration' },
];

const pentaclesFeatures = [
  { label: 'Eleven-Zone Partition', prompt: 'Canvas coordinates dividing sky into 5 houses, 5 spires, and 1 crown.', icon: Code2 },
  { label: 'Environmental Weather', prompt: 'Element weather factors: x1.35 matched suit, x0.75 opposite.', icon: Lightbulb },
  { label: 'Zodiac Seals', prompt: 'Seals grant x1.15 element mastery buff in duels and sieges.', icon: CheckCircle2 },
  { label: 'Multi-Faction Siege', prompt: 'Auto-resolve combat loop supporting up to 10 contesting factions.', icon: Users },
  { label: 'Tarot Deck Minting', prompt: 'Starting deck (40 cards) generated from natal chart dignity scores.', icon: Sparkles },
];

const pentaclesFaqs = [
  {
    question: 'What is the SpacetimeDB Maincloud deployment details?',
    answer: 'The published module is named "cookingwithcastrollc". The owner identity is "c2007058fefb90b9ffcd33379c03d135cbecadda7b901575d9b8ed8ca06ddb52". The live host endpoint is wss://maincloud.spacetimedb.com.',
  },
  {
    question: 'Why is adding btree indexes critical?',
    answer: 'Currently, every player check (fetching active cards, loadout, trade processing) is an O(N) table scan over all cards in the game. This causes quadratic complexity (N players scanning N*C rows on a 1-minute schedule). Adding indexes scales it to O(C).',
  },
  {
    question: 'How does the Oracle chat service communicate safely?',
    answer: 'The client writes a question to the private oracle_request table. The trusted oracle-service reads it, calls Claude (caching system prompt), and writes the answer to oracle_reply. No API keys are stored in the client.',
  },
  {
    question: 'How do planetary agents determine Word Duel moves?',
    answer: 'The planetary agents use the planetary-agents API endpoint (running Groq/Llama-70B) to pick the best move in character, returning a themed one-line rationale, falling back to a greedy resolver if slow.',
  },
];

const resourceLanes = [
  {
    title: 'SpaceTimeDB',
    description: 'Relational database + WASM game server hosting the Rust module authoritative state.',
    icon: FileCode2,
    tone: 'text-[#e3e3d8]',
    links: [
      { label: 'SpacetimeDB Docs', href: 'https://spacetimedb.com/docs' },
      { label: 'Rust SDK', href: 'https://spacetimedb.com/docs/sdk/rust' },
    ],
  },
  {
    title: 'TypeScript SDK',
    description: 'Enables browser client.js to subscribe to database tables and call reducers reactively.',
    icon: Code2,
    tone: 'text-[#7dd3fc]',
    links: [
      { label: 'TS SDK Docs', href: 'https://spacetimedb.com/docs/sdk/typescript' },
    ],
  },
  {
    title: 'Anthropic Claude',
    description: 'Powers the Oracle chatbot, utilizing tiered models (Haiku 4.5/Sonnet 4.6) with prompt caching.',
    icon: ShieldCheck,
    tone: 'text-[#9ddf2e]',
    links: [
      { label: 'Anthropic Docs', href: 'https://docs.anthropic.com' },
    ],
  },
  {
    title: 'Groq Cloud',
    description: 'Executes fast, cost-efficient Llama-70B inference for planetary agent duels.',
    icon: Rocket,
    tone: 'text-[#ffb020]',
    links: [
      { label: 'Groq API Docs', href: 'https://console.groq.com/docs' },
    ],
  },
];

const buildTools = [
  { label: 'Verify codebase', detail: 'Verify Rust build and check client syntax.', tab: 'console', icon: Hammer, tone: 'amber' },
  { label: 'Track tasks', detail: 'Check completion progress and pending tasks.', tab: 'mission-control', icon: Gauge, tone: 'cyan' },
  { label: 'Manage environment', detail: 'Review environment variables and sync state.', tab: 'integration-ops', icon: Rocket, tone: 'acid' },
  { label: 'Security & proofs', detail: 'Enroll biometrics and inspect provenance proofs.', tab: 'security', icon: ShieldCheck, tone: 'white' },
];

const toneStyles: Record<string, string> = {
  acid: 'border-[#9ddf2e]/40 text-[#9ddf2e] bg-[#9ddf2e]/5 hover:bg-[#9ddf2e]/10',
  cyan: 'border-[#7dd3fc]/40 text-[#7dd3fc] bg-[#7dd3fc]/5 hover:bg-[#7dd3fc]/10',
  amber: 'border-[#ffb020]/40 text-[#ffb020] bg-[#ffb020]/5 hover:bg-[#ffb020]/10',
  white: 'border-[#e3e3d8]/30 text-[#e3e3d8] bg-[#e3e3d8]/5 hover:bg-[#e3e3d8]/10',
};

const storageKeys = {
  entered: 'pentacles-workspace-entered',
  track: 'pentacles-workspace-module',
  draft: 'pentacles-workspace-draft',
  checklist: 'pentacles-workspace-checklist',
};

const readStoredValue = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const HackathonSpace: React.FC<HackathonSpaceProps> = ({
  missionReadiness,
  foundryState,
  gitHubConnected,
  onNavigate,
  onCommitLog,
  onStartBuild,
}) => {
  const [entered, setEntered] = useState(() => readStoredValue(storageKeys.entered, false));
  const [track, setTrack] = useState<HackathonTrack>(() => readStoredValue(storageKeys.track, 'from-scratch'));
  const [draft, setDraft] = useState<ProjectDraft>(() =>
    readStoredValue(storageKeys.draft, {
      name: 'Pentacles MMO',
      pitch: 'Location-based AR MMO on SpaceTimeDB. Birth chart faction, Tarot arsenal, and 5,041 capturable stars.',
    }),
  );
  const [completed, setCompleted] = useState<string[]>(() => readStoredValue(storageKeys.checklist, []));
  const activeTrack = pentaclesModules.find((item) => item.id === track) ?? pentaclesModules[0];
  const completion = Math.round((completed.length / checklist.length) * 100);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.track, JSON.stringify(track));
  }, [track]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.draft, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.checklist, JSON.stringify(completed));
  }, [completed]);

  const enterHackathon = () => {
    setEntered(true);
    window.localStorage.setItem(storageKeys.entered, JSON.stringify(true));
    onCommitLog(`Pentacles Workspace loaded. Selected core context: ${activeTrack.title}.`, 'success');
  };

  const returnToTrackSelection = () => {
    setEntered(false);
    window.localStorage.setItem(storageKeys.entered, JSON.stringify(false));
  };

  const toggleChecklist = (id: string) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const startProject = () => {
    const idea = draft.pitch.trim() || draft.name.trim();
    if (!idea) {
      onCommitLog('Add a description before starting the forge build plan.', 'warning');
      return;
    }
    onStartBuild(idea, track);
  };

  if (!entered) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <section className="relative min-h-full overflow-hidden border border-[#44483a] bg-[#0d0f09]">
          <div className="absolute inset-0 eth-orbit-grid opacity-70" />
          <div className="absolute -right-28 top-10 h-80 w-80 rounded-full border border-[#9ddf2e]/20" />
          <div className="absolute -right-12 top-28 h-48 w-48 rounded-full border border-[#7dd3fc]/20" />
          <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-center px-5 py-10 md:px-10 lg:py-16">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#44483a] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center border border-[#9ddf2e] bg-[#9ddf2e]/10 font-mono text-xl font-bold text-[#9ddf2e]">
                  ✦
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#8f9282]">Pentacles Workspace Indicator</div>
                  <div className="mt-1 text-lg font-bold text-[#e3e3d8]">SpaceTimeDB MMO Module</div>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-[#44483a] bg-[#12140e] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em]">
                <span className="h-2 w-2 rounded-full bg-[#9ddf2e] animate-pulse" />
                <span className="text-[#9ddf2e]">Module Status: Active</span>
              </div>
            </div>

            <div className="grid items-end gap-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="inline-flex items-center gap-2 border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-[#7dd3fc]">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Claim the night sky // AR MMO
                </div>
                <h1 className="mt-6 max-w-4xl text-5xl font-bold leading-[0.95] tracking-[-0.05em] text-[#e3e3d8] md:text-7xl">
                  Map the heavens.
                  <span className="block text-[#9ddf2e]">Fight star by star.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#c5c8b6] md:text-lg">
                  A real-time project status and verification dashboard. Track database indexes, verify prompt caching, deploy feeders, and manage the live module status.
                </p>
              </div>

              <div className="border border-[#44483a] bg-[#12140e]/90 p-5">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f9282]">
                  <span>Server info</span>
                  <span className="text-[#9ddf2e]">cookingwithcastrollc</span>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    'wss://maincloud.spacetimedb.com',
                    '5,041 stars magnitude catalog',
                    'Tarot deck procedural stats',
                    'Word Duel planetary agents',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 border border-[#44483a] bg-[#0d0f09] px-3 py-2.5 text-sm text-[#e3e3d8]">
                      <Check className="h-4 w-4 text-[#9ddf2e]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
              {pentaclesModules.map((item) => {
                const selected = track === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setTrack(item.id)}
                    className={`group p-5 text-left transition ${selected ? 'border border-[#9ddf2e] bg-[#9ddf2e]/8' : 'border border-[#44483a] bg-[#12140e] hover:border-[#8f9282]'}`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`font-mono text-3xl font-bold ${selected ? 'text-[#9ddf2e]' : 'text-[#44483a]'}`}>{item.number}</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-[#9ddf2e] bg-[#9ddf2e] text-[#0d0f09]' : 'border-[#8f9282]'}`}>
                        {selected && <Check className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                    <div className="mt-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8f9282]">{item.shortTitle}</div>
                    <h2 className="mt-1 text-xl font-bold text-[#e3e3d8]">{item.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[#c5c8b6]">{item.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-stretch justify-between gap-4 border-t border-[#44483a] pt-6 lg:flex-row lg:items-center">
              <p className="max-w-2xl text-xs leading-5 text-[#8f9282]">
                Selected context: <span className="font-semibold text-[#e3e3d8]">{activeTrack.title}</span>. {activeTrack.rule}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  onClick={enterHackathon}
                  className="inline-flex shrink-0 items-center justify-center gap-3 border border-[#9ddf2e] bg-[#9ddf2e] px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d0f09] transition hover:bg-[#83c300]"
                >
                  Enter Project Workspace
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-[1600px] space-y-4 pb-2">
        <section className="relative overflow-hidden border border-[#44483a] bg-[#12140e] p-5 md:p-7">
          <div className="absolute inset-0 eth-orbit-grid opacity-40" />
          <div className="relative z-10 grid gap-7 xl:grid-cols-[1fr_360px]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#9ddf2e]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#9ddf2e] animate-pulse" />
                  STATUS: HARDENING PHASE
                </span>
                <span className="border border-[#44483a] bg-[#0d0f09] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c5c8b6]">
                  cookingwithcastrollc
                </span>
                <span className="border border-[#7dd3fc]/30 bg-[#7dd3fc]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7dd3fc]">
                  {activeTrack.title}
                </span>
                <a
                  href="https://maincloud.spacetimedb.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 border border-[#e3e3d8]/30 bg-[#e3e3d8]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e3e3d8] transition hover:border-[#7dd3fc]/60 hover:text-[#7dd3fc]"
                >
                  STDB Dashboard
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-[#e3e3d8] md:text-5xl">
                Pentacles Control Deck
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#c5c8b6] md:text-base">
                Monitor implementation plan verification, compile state, check authentication probes, and manage the cross-project seams with planetary agents.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {buildTools.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.tab}
                      onClick={() => onNavigate(tool.tab)}
                      className={`border p-3 text-left transition ${toneStyles[tool.tone]}`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon className="h-4 w-4" />
                        <ChevronRight className="h-3.5 w-3.5" />
                      </div>
                      <div className="mt-4 text-xs font-bold text-[#e3e3d8]">{tool.label}</div>
                      <div className="mt-1 text-[11px] leading-4 text-[#8f9282]">{tool.detail}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border border-[#44483a] bg-[#0d0f09]/90 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#8f9282]">Completion Readiness</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-[#9ddf2e]">{Math.round((missionReadiness + completion) / 2)}</span>
                    <span className="font-mono text-xs text-[#8f9282]">/ 100</span>
                  </div>
                </div>
                <Gauge className="h-9 w-9 text-[#9ddf2e]" />
              </div>
              <div className="mt-5 h-2 border border-[#44483a] bg-[#12140e]">
                <div className="h-full bg-[#9ddf2e] transition-all" style={{ width: `${Math.round((missionReadiness + completion) / 2)}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase">
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">Build</span>
                  <span className="mt-1 block text-[#e3e3d8]">{foundryState}</span>
                </div>
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">GitHub</span>
                  <span className={`mt-1 block ${gitHubConnected ? 'text-[#9ddf2e]' : 'text-[#ffb020]'}`}>
                    {gitHubConnected ? 'Linked' : 'Not linked'}
                  </span>
                </div>
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">Tasks</span>
                  <span className="mt-1 block text-[#7dd3fc]">{completion}%</span>
                </div>
                <div className="border border-[#44483a] bg-[#12140e] p-3">
                  <span className="block text-[#8f9282]">Module</span>
                  <span className="mt-1 block text-[#9ddf2e]">Active</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 xl:grid-cols-12">
          <section className="xl:col-span-7 border border-[#44483a] bg-[#12140e] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#44483a] pb-4">
              <div className="flex items-center gap-2">
                <WandSparkles className="h-4 w-4 text-[#9ddf2e]" />
                <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Project launchpad</h2>
              </div>
              <button
                onClick={returnToTrackSelection}
                className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282] hover:text-[#9ddf2e]"
              >
                Change Module View
              </button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f9282]">Project name</span>
                <input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Pentacles"
                  className="mt-2 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-3 text-sm text-[#e3e3d8] outline-none transition placeholder:text-[#44483a] focus:border-[#9ddf2e]"
                />
              </label>
              <label className="block">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f9282]">Objective</span>
                <input
                  value={draft.pitch}
                  onChange={(event) => setDraft((current) => ({ ...current, pitch: event.target.value }))}
                  placeholder="Workspace objective summary"
                  className="mt-2 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-3 text-sm text-[#e3e3d8] outline-none transition placeholder:text-[#44483a] focus:border-[#9ddf2e]"
                />
              </label>
            </div>

            <div className="mt-4 border border-[#44483a] bg-[#1b1c16] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#7dd3fc]">Active Module // {activeTrack.shortTitle}</div>
                  <div className="mt-1 text-base font-bold text-[#e3e3d8]">{activeTrack.title}</div>
                </div>
                <span className="font-mono text-3xl font-bold text-[#44483a]">{activeTrack.number}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#c5c8b6]">{activeTrack.rule}</p>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                onClick={startProject}
                className="inline-flex flex-1 items-center justify-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d0f09] transition hover:bg-[#83c300]"
              >
                <Play className="h-4 w-4 fill-current" />
                Forge Project Plan
              </button>
              <button
                onClick={() => onNavigate('mission-control')}
                className="inline-flex items-center justify-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10"
              >
                Open status board
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="xl:col-span-5 border border-[#44483a] bg-[#1b1c16] p-5">
            <div className="flex items-center justify-between border-b border-[#44483a] pb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-[#9ddf2e]" />
                <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Pending Tasks Checklist</h2>
              </div>
              <span className="font-mono text-[10px] text-[#9ddf2e]">{completed.length}/{checklist.length}</span>
            </div>
            <div className="mt-3 max-h-[380px] space-y-1 overflow-y-auto pr-1 custom-scrollbar">
              {checklist.map((item, index) => {
                const checked = completed.includes(item.id);
                const showGroup = index === 0 || checklist[index - 1].group !== item.group;
                return (
                  <div key={item.id}>
                    {showGroup && (
                      <div className="pb-1 pt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[#8f9282]">{item.group}</div>
                    )}
                    <button
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex w-full items-start gap-3 border px-3 py-2.5 text-left transition ${checked ? 'border-[#9ddf2e]/30 bg-[#9ddf2e]/5 text-[#e3e3d8]' : 'border-[#44483a] bg-[#12140e] text-[#c5c8b6] hover:border-[#8f9282]'}`}
                    >
                      {checked ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#9ddf2e]" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#44483a]" />}
                      <span className={`text-xs leading-5 ${checked ? '' : 'text-[#c5c8b6]'}`}>{item.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col gap-4 border-b border-[#44483a] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-[#9ddf2e]" />
                <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Technical Stack</h2>
              </div>
              <p className="mt-2 text-xs leading-5 text-[#8f9282]">Core technologies, APIs, and frameworks running in the Pentacles ecosystem.</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {resourceLanes.map((lane) => {
              const Icon = lane.icon;
              return (
                <div key={lane.title} className="border border-[#44483a] bg-[#0d0f09] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${lane.tone}`} />
                      <h3 className="text-xs font-bold text-[#e3e3d8]">{lane.title}</h3>
                    </div>
                    <p className="mt-2 text-[11px] leading-5 text-[#8f9282]">{lane.description}</p>
                  </div>

                  <div className="mt-4 space-y-1.5 shrink-0">
                    {lane.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between gap-3 border border-[#44483a] bg-[#12140e] px-3 py-2 text-[11px] text-[#c5c8b6] transition hover:border-[#7dd3fc]/50 hover:text-[#e3e3d8]"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#44483a] transition group-hover:text-[#7dd3fc]" />
                      </a>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col gap-3 border-b border-[#44483a] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-[#7dd3fc]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Retrospective FAQs</h2>
            </div>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-2">
            {pentaclesFaqs.map((faq) => (
              <details
                key={faq.question}
                className="group border border-[#44483a] bg-[#0d0f09] open:border-[#7dd3fc]/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-xs font-bold text-[#e3e3d8] marker:content-none">
                  {faq.question}
                  <span className="font-mono text-base font-normal text-[#7dd3fc] group-open:rotate-45">+</span>
                </summary>
                <p className="border-t border-[#44483a] px-4 py-3 text-xs leading-5 text-[#c5c8b6]">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex items-center gap-2 border-b border-[#44483a] pb-4">
            <Scale className="h-4 w-4 text-[#ffb020]" />
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Core Game Specifications</h2>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {pentaclesFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.label} className="border border-[#44483a] bg-[#0d0f09] p-3">
                  <Icon className="h-4 w-4 text-[#ffb020]" />
                  <div className="mt-3 text-xs font-bold text-[#e3e3d8]">{feat.label}</div>
                  <p className="mt-2 text-[11px] leading-4 text-[#8f9282]">{feat.prompt}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="flex flex-col gap-4 border border-[#ffb020]/30 bg-[#ffb020]/5 p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#ffb020]" />
            <div>
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb020]">Rules & Hardening Snapshot</div>
              <p className="mt-1 text-xs leading-5 text-[#c5c8b6]">
                Secure verification bounds must gate all reducers. Btree indexing stops quadratically-scaled full table scans. Direct owner tokens enable autonomous feeder scripts without developer login dependencies.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
