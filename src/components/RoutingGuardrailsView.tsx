import React, { useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  RefreshCw,
  Route,
  Server,
  ShieldCheck,
  Waypoints,
} from 'lucide-react';

type LogType = 'success' | 'info' | 'warning' | 'error' | 'default';
type RoutingMode = 'Balanced' | 'Quality' | 'Economy' | 'Local-first';

interface RoutingGuardrailsViewProps {
  onCommitLog: (text: string, type?: LogType) => void;
}

interface PolicyToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
  tone?: string;
}

const routeLanes = [
  { lane: 'Architecture', alias: 'architect-primary', primary: 'OpenAI', fallback: 'Anthropic', final: 'Local', maxRun: '$2.50', latency: '3.4s' },
  { lane: 'Implementation', alias: 'builder-fast', primary: 'Anthropic', fallback: 'OpenAI', final: 'Local', maxRun: '$1.25', latency: '1.8s' },
  { lane: 'Design QA', alias: 'vision-review', primary: 'Google', fallback: 'OpenAI', final: 'Local', maxRun: '$0.90', latency: '2.6s' },
  { lane: 'Background jobs', alias: 'economy-fallback', primary: 'OpenRouter', fallback: 'Anthropic', final: 'Local', maxRun: '$0.35', latency: '4.1s' },
];

const auditEvents = [
  { time: '18:04:22', actor: 'OP_GHOST_01', action: 'Approved Builder burst', detail: '$1.72 / implementation lane', tone: '#9ddf2e' },
  { time: '17:58:09', actor: 'gateway', action: 'Fallback executed', detail: 'Google -> OpenAI / 429 response', tone: '#ffb020' },
  { time: '17:42:31', actor: 'policy-engine', action: 'Prompt blocked', detail: 'secret exfiltration signature', tone: '#ffb4ab' },
  { time: '17:25:14', actor: 'cache', action: 'Semantic hit', detail: '41K input tokens avoided', tone: '#7dd3fc' },
  { time: '16:59:40', actor: 'OP_GHOST_01', action: 'Route policy changed', detail: 'Economy -> Balanced', tone: '#e3e3d8' },
];

const PolicyToggle: React.FC<PolicyToggleProps> = ({ checked, onChange, label, description, tone = '#9ddf2e' }) => (
  <button type="button" onClick={onChange} className="flex w-full items-start justify-between gap-4 border border-[#44483a] bg-[#0d0f09] p-3 text-left hover:border-[#8f9282]">
    <span><span className="block text-xs font-semibold text-[#e3e3d8]">{label}</span><span className="mt-1 block text-[11px] leading-4 text-[#8f9282]">{description}</span></span>
    <span className={`mt-0.5 h-5 w-9 shrink-0 border p-0.5 ${checked ? 'bg-white/5' : 'border-[#44483a] bg-[#1b1c16]'}`} style={checked ? { borderColor: tone } : undefined}><span className={`block h-3.5 w-3.5 transition-transform ${checked ? 'translate-x-3.5' : 'translate-x-0 bg-[#8f9282]'}`} style={checked ? { backgroundColor: tone } : undefined} /></span>
  </button>
);

export const RoutingGuardrailsView: React.FC<RoutingGuardrailsViewProps> = ({ onCommitLog }) => {
  const [mode, setMode] = useState<RoutingMode>('Balanced');
  const [autoFailover, setAutoFailover] = useState(true);
  const [semanticCache, setSemanticCache] = useState(true);
  const [promptScan, setPromptScan] = useState(true);
  const [piiRedaction, setPiiRedaction] = useState(true);
  const [deployApproval, setDeployApproval] = useState(true);
  const [spendApproval, setSpendApproval] = useState(true);
  const [localOnly, setLocalOnly] = useState(false);
  const [concurrency, setConcurrency] = useState(6);
  const [retries, setRetries] = useState(2);
  const [timeout, setTimeoutValue] = useState(90);
  const [approvalThreshold, setApprovalThreshold] = useState(2);
  const [testingRoute, setTestingRoute] = useState<string | null>(null);
  const [providerStates, setProviderStates] = useState([
    { provider: 'OpenAI', health: 99.98, latency: 620, state: 'closed' },
    { provider: 'Anthropic', health: 99.94, latency: 710, state: 'closed' },
    { provider: 'Google', health: 97.40, latency: 980, state: 'half-open' },
    { provider: 'OpenRouter', health: 99.10, latency: 840, state: 'closed' },
    { provider: 'Local', health: 100, latency: 410, state: 'closed' },
  ]);

  const changeMode = (nextMode: RoutingMode) => {
    setMode(nextMode);
    setLocalOnly(nextMode === 'Local-first');
    onCommitLog(`Routing profile switched to ${nextMode}.`, 'success');
  };

  const testRoute = (lane: string) => {
    setTestingRoute(lane);
    onCommitLog(`Route simulation started for ${lane}.`, 'info');
    setTimeout(() => {
      setTestingRoute(null);
      onCommitLog(`${lane} route passed: primary healthy, fallback reachable, budget gate active.`, 'success');
    }, 800);
  };

  const resetCircuit = (provider: string) => {
    setProviderStates((current) => current.map((item) => item.provider === provider ? { ...item, state: 'closed', health: Math.max(item.health, 99.5) } : item));
    onCommitLog(`${provider} circuit breaker reset after operator health probe.`, 'warning');
  };

  const applyGuardrails = () => {
    onCommitLog(`Runtime guardrails committed: ${mode}, concurrency ${concurrency}, ${retries} retries, ${timeout}s timeout, approval above $${approvalThreshold.toFixed(2)}.`, 'success');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pb-2">
        <section className="xl:col-span-8 border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#c084fc]"><Route className="h-4 w-4" /> model gateway policy</div>
              <h2 className="mt-3 text-2xl font-bold text-[#e3e3d8]">Routing & Guardrails</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c5c8b6]">Provider routing, fallbacks, approvals, privacy checks, queue controls, and circuit breakers.</p>
            </div>
            <button onClick={applyGuardrails} className="inline-flex items-center justify-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d0f09] hover:bg-[#83c300]"><CheckCircle2 className="h-3.5 w-3.5" /> Apply guardrails</button>
          </div>

          <div className="mt-5">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f9282]">Routing profile</span>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 border border-[#44483a] bg-[#0d0f09] p-1 gap-1">
              {(['Balanced', 'Quality', 'Economy', 'Local-first'] as RoutingMode[]).map((option) => (
                <button key={option} onClick={() => changeMode(option)} className={`px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] transition ${mode === option ? 'bg-[#c084fc]/15 text-[#c084fc] border border-[#c084fc]/50' : 'text-[#8f9282] border border-transparent hover:text-[#e3e3d8]'}`}>{option}</button>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[{ label: 'Success rate', value: '99.6%', note: 'last 24 hours', icon: Activity, tone: '#9ddf2e' }, { label: 'Fallbacks', value: '18', note: '2.1% of traffic', icon: Waypoints, tone: '#ffb020' }, { label: 'Cache savings', value: '$31.40', note: 'this month', icon: Database, tone: '#7dd3fc' }, { label: 'Approval queue', value: '2', note: 'operator review', icon: ShieldCheck, tone: '#c084fc' }].map((metric) => { const Icon = metric.icon; return <div key={metric.label} className="border border-[#44483a] bg-[#1b1c16] p-3"><div className="flex items-center justify-between"><span className="font-mono text-[9px] uppercase text-[#8f9282]">{metric.label}</span><Icon className="h-4 w-4" style={{ color: metric.tone }} /></div><div className="mt-3 text-xl font-bold text-[#e3e3d8]">{metric.value}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">{metric.note}</div></div>; })}
          </div>
        </section>

        <section className="xl:col-span-4 border border-[#44483a] bg-[#1b1c16] p-5">
          <div className="flex items-center gap-2"><Cpu className="h-4 w-4 text-[#7dd3fc]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Queue controls</h3></div>
          <div className="mt-4 space-y-4">
            <label className="block"><div className="flex justify-between font-mono text-[10px] uppercase text-[#c5c8b6]"><span>Max concurrency</span><span className="text-[#7dd3fc]">{concurrency}</span></div><input type="range" min="1" max="20" value={concurrency} onChange={(event) => setConcurrency(Number(event.target.value))} className="mt-2 w-full accent-[#7dd3fc]" /></label>
            <label className="block"><div className="flex justify-between font-mono text-[10px] uppercase text-[#c5c8b6]"><span>Retry attempts</span><span className="text-[#7dd3fc]">{retries}</span></div><input type="range" min="0" max="5" value={retries} onChange={(event) => setRetries(Number(event.target.value))} className="mt-2 w-full accent-[#7dd3fc]" /></label>
            <label className="block"><div className="flex justify-between font-mono text-[10px] uppercase text-[#c5c8b6]"><span>Request timeout</span><span className="text-[#7dd3fc]">{timeout}s</span></div><input type="range" min="15" max="180" step="15" value={timeout} onChange={(event) => setTimeoutValue(Number(event.target.value))} className="mt-2 w-full accent-[#7dd3fc]" /></label>
            <label className="block"><span className="font-mono text-[10px] uppercase text-[#c5c8b6]">Approval threshold / run</span><div className="mt-1 flex border border-[#44483a] bg-[#0d0f09]"><span className="px-3 py-2 text-[#8f9282]">$</span><input type="number" min="0.25" step="0.25" value={approvalThreshold} onChange={(event) => setApprovalThreshold(Number(event.target.value))} className="w-full bg-transparent px-2 py-2 font-mono text-sm text-[#e3e3d8] outline-none" /></div></label>
          </div>
        </section>

        <section className="xl:col-span-7 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Waypoints className="h-4 w-4 text-[#c084fc]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Route lanes</h3></div><span className="font-mono text-[9px] uppercase text-[#8f9282]">primary / fallback / local</span></div>
          <div className="mt-4 space-y-3">
            {routeLanes.map((route) => (
              <div key={route.lane} className="border border-[#44483a] bg-[#1b1c16] p-3">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3"><div><div className="font-semibold text-[#e3e3d8]">{route.lane}</div><div className="mt-1 font-mono text-[9px] text-[#9ddf2e]">{route.alias}</div></div><div className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase"><span className="border border-[#9ddf2e]/40 px-2 py-1 text-[#9ddf2e]">{route.primary}</span><span className="text-[#8f9282]">-&gt;</span><span className="border border-[#7dd3fc]/40 px-2 py-1 text-[#7dd3fc]">{route.fallback}</span><span className="text-[#8f9282]">-&gt;</span><span className="border border-[#c084fc]/40 px-2 py-1 text-[#c084fc]">{route.final}</span></div></div>
                <div className="mt-3 flex items-center justify-between border-t border-[#44483a]/60 pt-3"><div className="flex gap-4 font-mono text-[9px] uppercase text-[#8f9282]"><span>max {route.maxRun}</span><span>{route.latency} p95</span></div><button onClick={() => testRoute(route.lane)} className="border border-[#7dd3fc]/40 px-2 py-1 font-mono text-[9px] uppercase text-[#7dd3fc] hover:bg-[#7dd3fc]/10">{testingRoute === route.lane ? 'Testing...' : 'Test route'}</button></div>
              </div>
            ))}
          </div>
        </section>

        <section className="xl:col-span-5 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#9ddf2e]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Policy gates</h3></div>
          <div className="mt-4 space-y-2">
            <PolicyToggle checked={autoFailover} onChange={() => setAutoFailover((value) => !value)} label="Automatic provider failover" description="Retry on the next allowed provider after rate or availability failures." tone="#c084fc" />
            <PolicyToggle checked={semanticCache} onChange={() => setSemanticCache((value) => !value)} label="Semantic response cache" description="Reuse equivalent safe responses before issuing a paid request." tone="#7dd3fc" />
            <PolicyToggle checked={promptScan} onChange={() => setPromptScan((value) => !value)} label="Prompt injection scan" description="Inspect untrusted content before tools or privileged context are exposed." />
            <PolicyToggle checked={piiRedaction} onChange={() => setPiiRedaction((value) => !value)} label="Sensitive data redaction" description="Remove secrets and private identifiers before provider transmission." />
            <PolicyToggle checked={spendApproval} onChange={() => setSpendApproval((value) => !value)} label="High-spend approval" description={`Require operator approval above $${approvalThreshold.toFixed(2)} per run.`} tone="#ffb020" />
            <PolicyToggle checked={deployApproval} onChange={() => setDeployApproval((value) => !value)} label="Deploy approval" description="Require a human gate before production mutations or release actions." tone="#ffb020" />
            <PolicyToggle checked={localOnly} onChange={() => setLocalOnly((value) => !value)} label="Local-only privacy mode" description="Block external providers and route all eligible work to the sidecar." tone="#c084fc" />
          </div>
        </section>

        <section className="xl:col-span-5 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Server className="h-4 w-4 text-[#7dd3fc]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Circuit breakers</h3></div><button onClick={() => onCommitLog('Provider health telemetry refreshed.', 'success')} title="Refresh provider health" className="text-[#7dd3fc]"><RefreshCw className="h-4 w-4" /></button></div>
          <div className="mt-4 space-y-2">
            {providerStates.map((provider) => (
              <div key={provider.provider} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 border border-[#44483a] bg-[#0d0f09] p-3">
                <div><div className="text-xs font-semibold text-[#e3e3d8]">{provider.provider}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">{provider.latency}ms p95</div></div>
                <div className="text-right"><div className={`font-mono text-[10px] ${provider.health < 99 ? 'text-[#ffb020]' : 'text-[#9ddf2e]'}`}>{provider.health.toFixed(2)}%</div><div className="mt-1 font-mono text-[8px] uppercase text-[#8f9282]">{provider.state}</div></div>
                <button onClick={() => resetCircuit(provider.provider)} disabled={provider.state === 'closed'} className="border border-[#ffb020]/40 px-2 py-1 font-mono text-[8px] uppercase text-[#ffb020] disabled:border-[#44483a] disabled:text-[#44483a]">Reset</button>
              </div>
            ))}
          </div>
        </section>

        <section className="xl:col-span-7 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Clock className="h-4 w-4 text-[#ffb020]" /><h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Audit stream</h3></div><span className="font-mono text-[9px] uppercase text-[#8f9282]">immutable operator events</span></div>
          <div className="mt-4 space-y-2">{auditEvents.map((event) => <div key={`${event.time}-${event.action}`} className="grid grid-cols-[70px_110px_1fr] gap-3 border-b border-[#44483a]/60 pb-2 font-mono text-[10px]"><span className="text-[#8f9282]">{event.time}</span><span style={{ color: event.tone }}>{event.actor}</span><span className="text-[#c5c8b6]"><strong className="font-medium text-[#e3e3d8]">{event.action}</strong> / {event.detail}</span></div>)}</div>
        </section>

        <section className="xl:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#9ddf2e]"><ShieldCheck className="h-4 w-4" /> Least privilege</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Agents receive only the provider, tool, and environment capabilities required by their lane.</p></div>
          <div className="border border-[#ffb020]/40 bg-[#ffb020]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#ffb020]"><AlertTriangle className="h-4 w-4" /> Fail closed</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Deploy, secret, and budget gates stop when policy state cannot be verified.</p></div>
          <div className="border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#7dd3fc]"><Activity className="h-4 w-4" /> Observable routing</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Each request records selected alias, provider, fallback reason, cost, latency, and approval state.</p></div>
        </section>
      </div>
    </div>
  );
};
