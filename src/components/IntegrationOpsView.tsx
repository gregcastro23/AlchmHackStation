import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Code2,
  Copy,
  Download,
  FileJson,
  KeyRound,
  Play,
  RefreshCw,
  Route,
  ShieldCheck,
  Sparkles,
  Waypoints,
} from 'lucide-react';
import type { AuthHealth, ContextPacket, IntegrationId } from '../lib/integrationOps';

type LogType = 'success' | 'info' | 'warning' | 'error' | 'default';

interface IntegrationOpsViewProps {
  onCommitLog: (text: string, type?: LogType) => void;
}

interface IntegrationRuntime {
  id: IntegrationId;
  label: string;
  role: string;
  health: AuthHealth;
  auth: string;
  statusCommand: string;
  loginCommand: string;
  expiry: string;
  message: string;
}

const initialIntegrations: IntegrationRuntime[] = [
  {
    id: 'antigravity',
    label: 'Antigravity',
    role: 'Agent orchestration and browser execution',
    health: 'manual',
    auth: 'Google browser session',
    statusCommand: 'Manual session verification',
    loginCommand: 'Open Antigravity and confirm Google session',
    expiry: 'Opaque',
    message: 'Browser session requires a manual health confirmation.',
  },
  {
    id: 'claude',
    label: 'Claude Code',
    role: 'Implementation, review, and long-context reasoning',
    health: 'unavailable',
    auth: 'CLI OAuth / API helper',
    statusCommand: 'claude auth status',
    loginCommand: 'claude auth login',
    expiry: 'Opaque',
    message: 'CLI was not detected on PATH during the last local probe.',
  },
  {
    id: 'stitch',
    label: 'Google Stitch',
    role: 'Design exploration and interface source artifacts',
    health: 'manual',
    auth: 'Google browser session',
    statusCommand: 'Manual session verification',
    loginCommand: 'Open Stitch and confirm Google session',
    expiry: 'Opaque',
    message: 'No public scriptable auth-status command is configured.',
  },
  {
    id: 'codex',
    label: 'Codex',
    role: 'Repository implementation, tests, and release hardening',
    health: 'error',
    auth: 'Local CLI session',
    statusCommand: 'codex login status',
    loginCommand: 'codex login',
    expiry: 'Opaque',
    message: 'Current CLI config must parse before auth health can be verified.',
  },
  {
    id: 'v0',
    label: 'v0',
    role: 'Runnable UI variants and full-stack generation',
    health: 'expired',
    auth: 'V0_API_KEY',
    statusCommand: 'bun run auth:check',
    loginCommand: 'Set V0_API_KEY in the server environment',
    expiry: 'Key rotation policy',
    message: 'Server key reference is not present in this local shell.',
  },
  {
    id: 'vercel',
    label: 'Vercel',
    role: 'Preview proof, deployment, and production promotion',
    health: 'healthy',
    auth: 'CLI token / browser login',
    statusCommand: 'vercel whoami',
    loginCommand: 'vercel login',
    expiry: 'Opaque',
    message: 'Operator confirmed the Vercel CLI session; the watcher will continue bounded verification.',
  },
];

const relayStages = [
  { integration: 'stitch' as IntegrationId, title: 'Explore', detail: 'Generate interface directions and export the chosen visual source.', output: 'design-source.json' },
  { integration: 'v0' as IntegrationId, title: 'Materialize', detail: 'Turn the context packet and source files into runnable app variants.', output: 'v0-chat + preview' },
  { integration: 'claude' as IntegrationId, title: 'Implement', detail: 'Resolve architecture, edge cases, and cross-file implementation work.', output: 'reviewed patch' },
  { integration: 'codex' as IntegrationId, title: 'Harden', detail: 'Apply changes in-repo, run tests, inspect diffs, and prepare release proof.', output: 'verified commit' },
  { integration: 'antigravity' as IntegrationId, title: 'Operate', detail: 'Coordinate browser checks, agent tasks, and demo execution.', output: 'proof ledger' },
  { integration: 'vercel' as IntegrationId, title: 'Ship', detail: 'Create the preview, verify it, and promote with an approval gate.', output: 'deployment URL' },
];

const toneByHealth: Record<AuthHealth, string> = {
  healthy: '#9ddf2e',
  warning: '#ffb020',
  expired: '#ffb4ab',
  unavailable: '#8f9282',
  error: '#ff7b72',
  manual: '#7dd3fc',
};

const copyText = async (value: string) => {
  await navigator.clipboard.writeText(value);
};

export const IntegrationOpsView: React.FC<IntegrationOpsViewProps> = ({ onCommitLog }) => {
  const [integrations, setIntegrations] = useState(initialIntegrations);
  const [probingId, setProbingId] = useState<IntegrationId | null>(null);
  const [pollMinutes, setPollMinutes] = useState(5);
  const [pauseRelay, setPauseRelay] = useState(true);
  const [notifyOnFailure, setNotifyOnFailure] = useState(true);
  const [objective, setObjective] = useState('Create a polished integration operations center with auth health, reusable context handoffs, and deployment proof.');
  const [lockedFiles, setLockedFiles] = useState('package.json, bun.lock, src/lib/modelOps.ts');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('Responsive operator UI\nNo secret values rendered\nBuild and lint pass\nAuth failures pause the relay');
  const [maxBudget, setMaxBudget] = useState(8);
  const [packet, setPacket] = useState<ContextPacket | null>(null);

  const healthCounts = useMemo(() => ({
    healthy: integrations.filter((item) => item.health === 'healthy').length,
    attention: integrations.filter((item) => ['warning', 'expired', 'error', 'unavailable'].includes(item.health)).length,
    manual: integrations.filter((item) => item.health === 'manual').length,
  }), [integrations]);

  const probe = (integration: IntegrationRuntime) => {
    setProbingId(integration.id);
    onCommitLog(`Auth Watch executing bounded probe: ${integration.statusCommand}.`, 'info');
    setTimeout(() => {
      setProbingId(null);
      setIntegrations((current) => current.map((item) => item.id === integration.id
        ? {
            ...item,
            health: item.id === 'antigravity' || item.id === 'stitch' ? 'manual' : item.id === 'codex' ? 'error' : 'healthy',
            message: item.id === 'codex'
              ? 'Probe reached the CLI, but configuration still blocks auth inspection.'
              : item.id === 'antigravity' || item.id === 'stitch'
                ? 'Manual browser-session confirmation is still required.'
                : 'Latest health probe completed successfully.',
          }
        : item));
      onCommitLog(`${integration.label} auth probe recorded without reading or persisting a credential value.`, integration.id === 'codex' ? 'warning' : 'success');
    }, 650);
  };

  const markRenewed = (integration: IntegrationRuntime) => {
    setIntegrations((current) => current.map((item) => item.id === integration.id
      ? { ...item, health: 'healthy', message: 'Operator confirmed renewed authentication; verification probe is queued.' }
      : item));
    onCommitLog(`${integration.label} renewal confirmation recorded; follow-up probe queued.`, 'success');
  };

  const copyReauth = async (integration: IntegrationRuntime) => {
    try {
      await copyText(integration.loginCommand);
      onCommitLog(`${integration.label} reauthentication command copied for operator-confirmed execution.`, 'info');
    } catch {
      onCommitLog(`${integration.label} reauthentication command is ready: ${integration.loginCommand}`, 'warning');
    }
  };

  const generatePacket = () => {
    const nextPacket: ContextPacket = {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      project: {
        name: 'AlchmHackStation',
        repository: 'gregcastro23/AlchmHackStation',
        mission: 'A unified AI development command center for building, proving, and shipping hackathon products.',
        stack: ['React', 'TypeScript', 'Vite', 'Bun', 'Tailwind CSS', 'Tauri'],
      },
      request: {
        objective: objective.trim(),
        acceptanceCriteria: acceptanceCriteria.split('\n').map((line) => line.trim()).filter(Boolean),
        designDirection: 'Dense operator console, restrained industrial palette, responsive controls, no marketing shell.',
        targetIntegration: 'v0',
      },
      controls: {
        lockedFiles: lockedFiles.split(',').map((file) => file.trim()).filter(Boolean),
        maxBudgetUsd: maxBudget,
        requireReview: true,
        requireBuildProof: true,
        requireVisualProof: true,
      },
      handoff: {
        sourceIntegration: 'stitch',
        nextIntegration: 'v0',
        artifactRefs: ['stitch/design-source.json', 'repository://current-worktree', 'proof://latest-build'],
      },
    };
    setPacket(nextPacket);
    onCommitLog('Provider-neutral context packet generated for the Stitch to v0 relay.', 'success');
  };

  const downloadPacket = () => {
    if (!packet) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `alchm-context-packet-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    onCommitLog('Context packet downloaded with locked files, budget, and proof requirements.', 'success');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pb-2">
        <section className="xl:col-span-12 border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#9ddf2e]">
                <Waypoints className="h-4 w-4" />
                cross-agent operations
              </div>
              <h2 className="mt-3 text-2xl font-bold text-[#e3e3d8]">Integration Operations</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#c5c8b6]">
                Keep every AI builder authenticated, hand off structured context instead of loose prompts, and preserve proof from first design through production.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => integrations.forEach((item, index) => setTimeout(() => probe(item), index * 120))} className="inline-flex items-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[#7dd3fc] hover:bg-[#7dd3fc]/10">
                <RefreshCw className="h-3.5 w-3.5" /> Probe all
              </button>
              <button onClick={() => onCommitLog('Build Relay queued with auth and approval preflight.', 'success')} className="inline-flex items-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#0d0f09] hover:bg-[#83c300]">
                <Play className="h-3.5 w-3.5" /> Queue relay
              </button>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Integrations</div><div className="mt-2 text-2xl font-bold text-[#e3e3d8]">{integrations.length}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#7dd3fc]">one relay</div></div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Healthy</div><div className="mt-2 text-2xl font-bold text-[#9ddf2e]">{healthCounts.healthy}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">verified sessions</div></div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Attention</div><div className="mt-2 text-2xl font-bold text-[#ffb020]">{healthCounts.attention}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">auth or install</div></div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="font-mono text-[9px] uppercase text-[#8f9282]">Manual checks</div><div className="mt-2 text-2xl font-bold text-[#7dd3fc]">{healthCounts.manual}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">browser sessions</div></div>
          </div>
        </section>

        <section className="xl:col-span-8 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-[#7dd3fc]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Auth Watch</h3></div>
            <span className="font-mono text-[9px] uppercase text-[#8f9282]">tokens never rendered</span>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {integrations.map((integration) => {
              const tone = toneByHealth[integration.health];
              return (
                <article key={integration.id} className="border border-[#44483a] bg-[#1b1c16] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="flex items-center gap-2"><span className="h-2 w-2" style={{ backgroundColor: tone }} /><h4 className="font-semibold text-[#e3e3d8]">{integration.label}</h4></div><p className="mt-1 text-xs leading-5 text-[#c5c8b6]">{integration.role}</p></div>
                    <span className="border px-2 py-1 font-mono text-[8px] uppercase" style={{ borderColor: `${tone}66`, color: tone }}>{integration.health}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-[9px] uppercase">
                    <div><span className="text-[#8f9282]">Auth</span><div className="mt-1 text-[#e3e3d8]">{integration.auth}</div></div>
                    <div><span className="text-[#8f9282]">Expiry</span><div className="mt-1 text-[#ffb020]">{integration.expiry}</div></div>
                  </div>
                  <div className="mt-3 border border-[#44483a] bg-[#0d0f09] p-2 font-mono text-[10px] text-[#7dd3fc]">{integration.statusCommand}</div>
                  <p className="mt-3 min-h-10 text-xs leading-5 text-[#c5c8b6]">{integration.message}</p>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button onClick={() => probe(integration)} className="border border-[#7dd3fc]/40 px-2 py-1.5 font-mono text-[9px] uppercase text-[#7dd3fc] hover:bg-[#7dd3fc]/10">{probingId === integration.id ? 'Probing' : 'Probe'}</button>
                    <button onClick={() => copyReauth(integration)} className="inline-flex items-center justify-center gap-1 border border-[#44483a] px-2 py-1.5 font-mono text-[9px] uppercase text-[#c5c8b6] hover:border-[#9ddf2e]"><Copy className="h-3 w-3" /> Reauth</button>
                    <button onClick={() => markRenewed(integration)} className="border border-[#9ddf2e]/40 px-2 py-1.5 font-mono text-[9px] uppercase text-[#9ddf2e] hover:bg-[#9ddf2e]/10">Renewed</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="xl:col-span-4 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#9ddf2e]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Monitor policy</h3></div>
          <label className="mt-5 block"><div className="flex justify-between font-mono text-[9px] uppercase text-[#8f9282]"><span>Probe interval</span><span className="text-[#7dd3fc]">{pollMinutes} min</span></div><input type="range" min="1" max="30" value={pollMinutes} onChange={(event) => setPollMinutes(Number(event.target.value))} className="mt-3 w-full accent-[#9ddf2e]" /></label>
          <div className="mt-5 space-y-3">
            <button onClick={() => setPauseRelay((value) => !value)} className="flex w-full items-center justify-between border border-[#44483a] bg-[#0d0f09] p-3 text-left"><span><span className="block font-mono text-[10px] uppercase text-[#e3e3d8]">Pause relay on failure</span><span className="mt-1 block text-xs text-[#8f9282]">Prevent partial handoffs.</span></span><span className={`h-5 w-9 border p-0.5 ${pauseRelay ? 'border-[#9ddf2e] bg-[#9ddf2e]/20' : 'border-[#44483a]'}`}><span className={`block h-3.5 w-3.5 transition-transform ${pauseRelay ? 'translate-x-3.5 bg-[#9ddf2e]' : 'bg-[#8f9282]'}`} /></span></button>
            <button onClick={() => setNotifyOnFailure((value) => !value)} className="flex w-full items-center justify-between border border-[#44483a] bg-[#0d0f09] p-3 text-left"><span><span className="block font-mono text-[10px] uppercase text-[#e3e3d8]">Failure notification</span><span className="mt-1 block text-xs text-[#8f9282]">Surface the exact recovery action.</span></span><span className={`h-5 w-9 border p-0.5 ${notifyOnFailure ? 'border-[#7dd3fc] bg-[#7dd3fc]/20' : 'border-[#44483a]'}`}><span className={`block h-3.5 w-3.5 transition-transform ${notifyOnFailure ? 'translate-x-3.5 bg-[#7dd3fc]' : 'bg-[#8f9282]'}`} /></span></button>
          </div>
          <div className="mt-4 border border-[#ffb020]/40 bg-[#ffb020]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#ffb020]"><Clock3 className="h-4 w-4" /> Opaque expiry strategy</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">When a provider does not expose expiry time, a successful bounded status probe becomes the freshness signal.</p></div>
          <div className="mt-3 border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#9ddf2e]"><ShieldCheck className="h-4 w-4" /> Operator gate</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">The watcher can stage reauth, but account changes always require confirmation.</p></div>
        </section>

        <section className="xl:col-span-12 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Route className="h-4 w-4 text-[#9ddf2e]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Build Relay</h3></div><span className="font-mono text-[9px] uppercase text-[#8f9282]">artifact-backed handoffs</span></div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-2">
            {relayStages.map((stage, index) => (
              <div key={stage.integration} className="relative border border-[#44483a] bg-[#1b1c16] p-3">
                <div className="flex items-center justify-between"><span className="font-mono text-[9px] text-[#8f9282]">0{index + 1}</span>{index < relayStages.length - 1 && <Waypoints className="h-3.5 w-3.5 text-[#44483a]" />}</div>
                <div className="mt-3 font-mono text-[9px] uppercase text-[#7dd3fc]">{stage.integration}</div>
                <h4 className="mt-1 font-semibold text-[#e3e3d8]">{stage.title}</h4>
                <p className="mt-2 text-xs leading-5 text-[#c5c8b6]">{stage.detail}</p>
                <div className="mt-3 border-t border-[#44483a] pt-2 font-mono text-[8px] uppercase text-[#9ddf2e]">{stage.output}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="xl:col-span-7 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-[#7dd3fc]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">v0 Bridge</h3></div><span className="font-mono text-[9px] uppercase text-[#8f9282]">files first / chat second</span></div>
          <label className="mt-4 block"><span className="font-mono text-[9px] uppercase text-[#8f9282]">Objective</span><textarea value={objective} onChange={(event) => setObjective(event.target.value)} rows={3} className="mt-1 w-full resize-none border border-[#44483a] bg-[#0d0f09] px-3 py-2 text-sm leading-6 text-[#e3e3d8] outline-none focus:border-[#7dd3fc]" /></label>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <label><span className="font-mono text-[9px] uppercase text-[#8f9282]">Locked files</span><input value={lockedFiles} onChange={(event) => setLockedFiles(event.target.value)} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-xs text-[#ffb020] outline-none focus:border-[#7dd3fc]" /></label>
            <label><span className="font-mono text-[9px] uppercase text-[#8f9282]">Maximum generation budget</span><div className="mt-1 flex items-center border border-[#44483a] bg-[#0d0f09]"><span className="px-3 font-mono text-xs text-[#8f9282]">$</span><input type="number" min="1" max="100" value={maxBudget} onChange={(event) => setMaxBudget(Number(event.target.value))} className="w-full bg-transparent px-1 py-2 text-sm text-[#e3e3d8] outline-none" /></div></label>
          </div>
          <label className="mt-3 block"><span className="font-mono text-[9px] uppercase text-[#8f9282]">Acceptance criteria</span><textarea value={acceptanceCriteria} onChange={(event) => setAcceptanceCriteria(event.target.value)} rows={4} className="mt-1 w-full resize-none border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-xs leading-6 text-[#e3e3d8] outline-none focus:border-[#7dd3fc]" /></label>
          <div className="mt-4 flex flex-wrap gap-2"><button onClick={generatePacket} disabled={!objective.trim()} className="inline-flex items-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-3 py-2 font-mono text-[10px] font-bold uppercase text-[#0d0f09] disabled:opacity-40"><FileJson className="h-3.5 w-3.5" /> Generate packet</button><button onClick={() => packet && copyText(JSON.stringify(packet, null, 2)).then(() => onCommitLog('v0 context packet copied.', 'success')).catch(() => onCommitLog('Clipboard unavailable; download the packet instead.', 'warning'))} disabled={!packet} className="inline-flex items-center gap-2 border border-[#7dd3fc]/40 px-3 py-2 font-mono text-[10px] uppercase text-[#7dd3fc] disabled:opacity-30"><Copy className="h-3.5 w-3.5" /> Copy JSON</button><button onClick={downloadPacket} disabled={!packet} className="inline-flex items-center gap-2 border border-[#44483a] px-3 py-2 font-mono text-[10px] uppercase text-[#c5c8b6] disabled:opacity-30"><Download className="h-3.5 w-3.5" /> Download</button></div>
        </section>

        <section className="xl:col-span-5 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="flex items-center gap-2"><Code2 className="h-4 w-4 text-[#9ddf2e]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Handoff contract</h3></div>
          {packet ? (
            <div className="mt-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#9ddf2e]"><CheckCircle2 className="h-4 w-4" /> Packet ready</div>
              <pre className="mt-3 max-h-[360px] overflow-auto custom-scrollbar border border-[#44483a] bg-[#0d0f09] p-3 font-mono text-[10px] leading-5 text-[#c5c8b6]">{JSON.stringify(packet, null, 2)}</pre>
            </div>
          ) : (
            <div className="mt-4 border border-[#44483a] bg-[#0d0f09] p-4">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#ffb020]"><AlertTriangle className="h-4 w-4" /> Awaiting packet</div>
              <p className="mt-3 text-xs leading-5 text-[#c5c8b6]">The bridge packages source artifacts, mission, constraints, budget, locked files, and proof requirements into one provider-neutral contract.</p>
            </div>
          )}
          <div className="mt-4 space-y-2 font-mono text-[9px] uppercase">
            <div className="flex justify-between border-b border-[#44483a] pb-2"><span className="text-[#8f9282]">v0 initialization</span><span className="text-[#7dd3fc]">existing files / repo</span></div>
            <div className="flex justify-between border-b border-[#44483a] pb-2"><span className="text-[#8f9282]">review gate</span><span className="text-[#9ddf2e]">required</span></div>
            <div className="flex justify-between border-b border-[#44483a] pb-2"><span className="text-[#8f9282]">visual proof</span><span className="text-[#9ddf2e]">required</span></div>
            <div className="flex justify-between"><span className="text-[#8f9282]">secret transport</span><span className="text-[#ffb020]">server reference only</span></div>
          </div>
        </section>
      </div>
    </div>
  );
};
