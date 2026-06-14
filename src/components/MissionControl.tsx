import React from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  Braces,
  CheckCircle2,
  ClipboardCheck,
  Code2,
  Database,
  Eye,
  FileText,
  Gauge,
  GitBranch,
  Play,
  Radio,
  Rocket,
  Server,
  Sparkles,
  Terminal,
  Users,
} from 'lucide-react';

interface MissionControlProps {
  blockHeight: number;
  foundryState: 'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR';
  missionReadiness: number;
  language: string;
  framework: string;
  cssEngine: string;
  database: string;
  isBuilding: boolean;
  onLaunchDemo: () => void;
  onMissionSignal: (signal: string) => void;
}

type AgentStatus = 'active' | 'review' | 'blocked' | 'ready';
type TaskStage = 'Draft' | 'Active' | 'Review' | 'Shipped';

const agentCrew: Array<{
  name: string;
  role: string;
  status: AgentStatus;
  lane: string;
  output: string;
  load: number;
}> = [
  {
    name: 'Rust Backend',
    role: 'spacetimedb module',
    status: 'active',
    lane: 'server/src/',
    output: 'indexes & table pruning pending',
    load: 68,
  },
  {
    name: 'Web Client',
    role: '2d / ar client',
    status: 'active',
    lane: 'client.js',
    output: 'standalone offline simulation ok',
    load: 85,
  },
  {
    name: 'Unity Client',
    role: 'ar foundation client',
    status: 'ready',
    lane: 'unity/',
    output: 'c# bindings generated and verified',
    load: 45,
  },
  {
    name: 'Ephemeris Feeder',
    role: 'bun cron runner',
    status: 'active',
    lane: 'feeder/push-ephemeris.ts',
    output: 'pushing planetary alt/az values',
    load: 50,
  },
  {
    name: 'Oracle Service',
    role: 'anthropic bot handler',
    status: 'review',
    lane: 'feeder/oracle-service.ts',
    output: 'failed request billing leak found',
    load: 70,
  },
  {
    name: 'Planetary Duelist',
    role: 'groq brain helper',
    status: 'blocked',
    lane: 'api.agents.alchm.kitchen',
    output: 'waiting for duel challenge wiring',
    load: 90,
  },
];

const tasks: Array<{
  title: string;
  stage: TaskStage;
  owner: string;
  proof: string;
  priority: 'P0' | 'P1' | 'P2';
}> = [
  {
    title: 'Add #[index(btree)] on card.owner and deck_slot.owner',
    stage: 'Active',
    owner: 'Rust Backend',
    proof: 'Rust schema btree tags',
    priority: 'P0',
  },
  {
    title: 'Fix Oracle re-billing loop on failed API requests',
    stage: 'Active',
    owner: 'Oracle Service',
    proof: 'exception catch & terminal response',
    priority: 'P0',
  },
  {
    title: 'Verify prompt cache prefix size exceeds Haiku 4096 min',
    stage: 'Active',
    owner: 'Oracle Service',
    proof: 'cache_read_input_tokens > 0',
    priority: 'P1',
  },
  {
    title: 'Set up non-interactive owner SPACETIME_TOKEN',
    stage: 'Review',
    owner: 'Ephemeris Feeder',
    proof: 'env-loaded token credential check',
    priority: 'P1',
  },
  {
    title: 'Wire client.js to SpacetimeDB TypeScript SDK',
    stage: 'Draft',
    owner: 'Web Client',
    proof: 'wss maincloud connections active',
    priority: 'P0',
  },
  {
    title: 'Replace spacetime sql CLI-polling with subscription',
    stage: 'Draft',
    owner: 'Oracle Service',
    proof: 'onInsert listener replaces loop',
    priority: 'P1',
  },
  {
    title: 'Prune battle/oracle tables in tick_sky schedule',
    stage: 'Shipped',
    owner: 'Rust Backend',
    proof: 'janitor cleanup reducer run',
    priority: 'P2',
  },
  {
    title: 'Wire Word Duel brain to agent_letters seam',
    stage: 'Draft',
    owner: 'Planetary Duelist',
    proof: 'POST api.agents.alchm.kitchen',
    priority: 'P0',
  },
];

const proofEvents = [
  {
    icon: Terminal,
    label: 'Build Proof',
    value: '42 tests queued',
    tone: 'acid',
  },
  {
    icon: Eye,
    label: 'Browser Proof',
    value: 'viewport ready',
    tone: 'cyan',
  },
  {
    icon: GitBranch,
    label: 'Repo Proof',
    value: 'public source linked',
    tone: 'white',
  },
  {
    icon: FileText,
    label: 'Story Proof',
    value: 'pitch packet active',
    tone: 'amber',
  },
];

const marketSignals = [
  'Plan/Build split',
  'Agent task board',
  'Browser self-test',
  'Rollback mindset',
  'GitHub sync',
  'One-click demo story',
  'Budget guardrails',
  'Provider routing',
];

const stageColumns: TaskStage[] = ['Draft', 'Active', 'Review', 'Shipped'];

const statusStyles: Record<AgentStatus, string> = {
  active: 'border-[#9ddf2e]/50 text-[#9ddf2e] bg-[#9ddf2e]/10',
  review: 'border-[#7dd3fc]/50 text-[#7dd3fc] bg-[#7dd3fc]/10',
  blocked: 'border-[#ffb020]/50 text-[#ffb020] bg-[#ffb020]/10',
  ready: 'border-[#e3e3d8]/40 text-[#e3e3d8] bg-[#e3e3d8]/10',
};

const toneStyles: Record<string, string> = {
  acid: 'border-[#9ddf2e]/40 text-[#9ddf2e] bg-[#9ddf2e]/5',
  cyan: 'border-[#7dd3fc]/40 text-[#7dd3fc] bg-[#7dd3fc]/5',
  white: 'border-[#e3e3d8]/30 text-[#e3e3d8] bg-[#e3e3d8]/5',
  amber: 'border-[#ffb020]/40 text-[#ffb020] bg-[#ffb020]/5',
};

const getReadinessTone = (score: number) => {
  if (score >= 90) return 'text-[#9ddf2e]';
  if (score >= 75) return 'text-[#ffb020]';
  return 'text-[#ffb4ab]';
};

export const MissionControl: React.FC<MissionControlProps> = ({
  blockHeight,
  foundryState,
  missionReadiness,
  language,
  framework,
  cssEngine,
  database,
  isBuilding,
  onLaunchDemo,
  onMissionSignal,
}) => {
  const readinessItems = [
    { label: 'Rust backend tests', score: foundryState === 'SUCCESS' ? 98 : isBuilding ? 74 : 85 },
    { label: 'Web client SDK sync', score: 20 },
    { label: 'Oracle chatbot safety', score: 75 },
    { label: 'Word duel integration', score: 10 },
  ];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pb-2">
        <section className="xl:col-span-8 border border-[#44483a] bg-[#12140e] p-5 min-h-[260px] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#9ddf2e]/60 to-transparent" />
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[#9ddf2e]">
                <Radio className="h-3.5 w-3.5" />
                project status
              </div>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold text-[#e3e3d8] tracking-normal">
                Pentacles Status
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c5c8b6]">
                Monitor implementation plan verification, database indexing, API safety gates, and cross-project seams with planetary agents.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 min-w-[220px] font-mono text-[10px] uppercase">
              <div className="border border-[#44483a] bg-[#0d0f09] p-2">
                <span className="block text-[#8f9282]">Database</span>
                <span className="mt-1 block text-[#e3e3d8]">cookingwithcastro</span>
              </div>
              <div className="border border-[#44483a] bg-[#0d0f09] p-2">
                <span className="block text-[#8f9282]">Height</span>
                <span className="mt-1 block text-[#7dd3fc]">{blockHeight}</span>
              </div>
              <div className="border border-[#44483a] bg-[#0d0f09] p-2">
                <span className="block text-[#8f9282]">Module</span>
                <span className="mt-1 block text-[#9ddf2e]">{foundryState}</span>
              </div>
              <div className="border border-[#44483a] bg-[#0d0f09] p-2">
                <span className="block text-[#8f9282]">Components</span>
                <span className="mt-1 block text-[#e3e3d8]">6 active</span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
            {[
              { icon: Braces, label: 'Backend', value: language },
              { icon: Code2, label: 'Web Client', value: framework },
              { icon: Sparkles, label: 'Aesthetics', value: cssEngine },
              { icon: Database, label: 'Database', value: database },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="border border-[#44483a] bg-[#1b1c16] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f9282]">{item.label}</span>
                    <Icon className="h-4 w-4 text-[#9ddf2e]" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-[#e3e3d8]">{item.value}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onLaunchDemo}
              disabled={isBuilding}
              className="inline-flex items-center justify-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d0f09] transition hover:bg-[#83c300] disabled:cursor-not-allowed disabled:border-[#44483a] disabled:bg-[#1b1c16] disabled:text-[#8f9282]"
            >
              <Play className="h-4 w-4 fill-current" />
              {isBuilding ? 'Running check' : 'Run validation build'}
            </button>
            <button
              onClick={() => onMissionSignal('service re-probe initiated')}
              className="inline-flex items-center justify-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10"
            >
              <Users className="h-4 w-4" />
              Re-probe services
            </button>
            <button
              onClick={() => onMissionSignal('project status exported')}
              className="inline-flex items-center justify-center gap-2 border border-[#ffb020]/50 bg-[#ffb020]/5 px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#ffb020] transition hover:bg-[#ffb020]/10"
            >
              <FileText className="h-4 w-4" />
              Export status
            </button>
          </div>
        </section>

        <section className="xl:col-span-4 border border-[#44483a] bg-[#1b1c16] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#8f9282]">Demo readiness</div>
              <div className={`mt-2 text-5xl font-bold ${getReadinessTone(missionReadiness)}`}>
                {missionReadiness}
              </div>
            </div>
            <Gauge className="h-10 w-10 text-[#9ddf2e]" />
          </div>
          <div className="mt-5 space-y-3">
            {readinessItems.map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase text-[#c5c8b6]">
                  <span>{item.label}</span>
                  <span className={getReadinessTone(item.score)}>{item.score}%</span>
                </div>
                <div className="h-1.5 bg-[#0d0f09] border border-[#44483a]">
                  <div className="h-full bg-[#9ddf2e]" style={{ width: `${Math.max(8, Math.min(100, item.score))}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border border-[#44483a] bg-[#0d0f09] p-3">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#ffb020]">
              <AlertTriangle className="h-3.5 w-3.5" />
              primary risk
            </div>
            <p className="mt-2 text-xs leading-5 text-[#c5c8b6]">
              Database scaling cliff: full-table scans over all cards will bottleneck on high traffic.
            </p>
          </div>
        </section>

        <section className="xl:col-span-7 border border-[#44483a] bg-[#12140e] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[#9ddf2e]" />
              <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Agent crew</h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#8f9282]">local + cloud lanes</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agentCrew.map((agent) => (
              <button
                key={agent.name}
                onClick={() => onMissionSignal(`${agent.name} lane inspected: ${agent.output}`)}
                className="border border-[#44483a] bg-[#1b1c16] p-3 text-left transition hover:border-[#9ddf2e]/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-[#e3e3d8]">{agent.name}</div>
                    <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f9282]">{agent.role}</div>
                  </div>
                  <span className={`border px-2 py-1 font-mono text-[9px] uppercase ${statusStyles[agent.status]}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-[#c5c8b6]">{agent.lane}</span>
                  <span className="font-mono text-[#7dd3fc]">{agent.load}%</span>
                </div>
                <div className="mt-2 h-1 bg-[#0d0f09]">
                  <div className="h-full bg-[#7dd3fc]" style={{ width: `${agent.load}%` }} />
                </div>
                <div className="mt-3 text-xs text-[#c5c8b6]">{agent.output}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="xl:col-span-5 border border-[#44483a] bg-[#12140e] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-[#9ddf2e]" />
              <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Build board</h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#8f9282]">draft to shipped</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stageColumns.map((stage) => (
              <div key={stage} className="border border-[#44483a] bg-[#0d0f09] p-2">
                <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f9282]">{stage}</div>
                <div className="space-y-2">
                  {tasks
                    .filter((task) => task.stage === stage)
                    .map((task) => (
                      <button
                        key={task.title}
                        onClick={() => onMissionSignal(`task selected: ${task.title}`)}
                        className="w-full border border-[#44483a] bg-[#1b1c16] p-2 text-left transition hover:border-[#9ddf2e]/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold leading-5 text-[#e3e3d8]">{task.title}</span>
                          <span className="shrink-0 font-mono text-[9px] text-[#ffb020]">{task.priority}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between font-mono text-[9px] uppercase text-[#8f9282]">
                          <span>{task.owner}</span>
                          <span>{task.proof}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="xl:col-span-7 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#9ddf2e]" />
              <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Proof feed</h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#8f9282]">verifiable artifacts</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {proofEvents.map((proof) => {
              const Icon = proof.icon;
              return (
                <button
                  key={proof.label}
                  onClick={() => onMissionSignal(`${proof.label}: ${proof.value}`)}
                  className={`border p-3 text-left transition hover:bg-[#0d0f09] ${toneStyles[proof.tone]}`}
                >
                  <Icon className="h-5 w-5" />
                  <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em]">{proof.label}</div>
                  <div className="mt-1 text-sm font-semibold text-[#e3e3d8]">{proof.value}</div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border border-[#44483a] bg-[#0d0f09] p-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7dd3fc]">
                <Server className="h-3.5 w-3.5" />
                deploy lane
              </div>
              <div className="mt-2 text-sm text-[#e3e3d8]">Vercel preview synced</div>
            </div>
            <div className="border border-[#44483a] bg-[#0d0f09] p-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9ddf2e]">
                <Activity className="h-3.5 w-3.5" />
                live state
              </div>
              <div className="mt-2 text-sm text-[#e3e3d8]">Reducer feed online</div>
            </div>
            <div className="border border-[#44483a] bg-[#0d0f09] p-3">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#ffb020]">
                <Rocket className="h-3.5 w-3.5" />
                pitch moment
              </div>
              <div className="mt-2 text-sm text-[#e3e3d8]">Agent war room is the demo</div>
            </div>
          </div>
        </section>

        <section className="xl:col-span-5 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#9ddf2e]" />
              <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Market bar</h3>
            </div>
            <span className="font-mono text-[10px] uppercase text-[#8f9282]">2026 signals</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {marketSignals.map((signal) => (
              <div key={signal} className="border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#c5c8b6]">
                {signal}
              </div>
            ))}
          </div>
          <div className="mt-4 border border-[#9ddf2e]/30 bg-[#9ddf2e]/5 p-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#9ddf2e]">positioning</div>
            <p className="mt-2 text-xs leading-5 text-[#c5c8b6]">
              A multiplayer hackathon command center with agents, proofs, and demo readiness in one live surface.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
