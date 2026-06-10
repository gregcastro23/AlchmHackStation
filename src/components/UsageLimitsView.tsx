import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  Cpu,
  Gauge,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

type LogType = 'success' | 'info' | 'warning' | 'error' | 'default';

interface UsageLimitsViewProps {
  onCommitLog: (text: string, type?: LogType) => void;
  onBudgetChange: (utilization: number) => void;
}

interface AgentAllocation {
  id: string;
  name: string;
  lane: string;
  spent: number;
  limit: number;
  requests: number;
  policy: 'Hard stop' | 'Downgrade' | 'Approval';
}

const usageBars = [28, 34, 31, 46, 39, 55, 61, 48, 67, 58, 72, 64, 81, 76];

const initialAllocations: AgentAllocation[] = [
  { id: 'architect', name: 'Architect', lane: 'Reasoning', spent: 28.4, limit: 60, requests: 318, policy: 'Approval' },
  { id: 'builder', name: 'Builder', lane: 'Code generation', spent: 39.8, limit: 80, requests: 746, policy: 'Downgrade' },
  { id: 'designer', name: 'Designer', lane: 'Vision + UI', spent: 17.2, limit: 45, requests: 204, policy: 'Downgrade' },
  { id: 'qa', name: 'QA', lane: 'Test review', spent: 12.6, limit: 35, requests: 412, policy: 'Hard stop' },
  { id: 'pitch', name: 'Pitch Coach', lane: 'Narrative', spent: 6.8, limit: 20, requests: 96, policy: 'Approval' },
];

const Toggle: React.FC<{
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}> = ({ checked, onChange, label, description }) => (
  <button
    type="button"
    onClick={onChange}
    className="w-full flex items-start justify-between gap-4 border border-[#44483a] bg-[#0d0f09] p-3 text-left transition hover:border-[#8f9282]"
  >
    <span>
      <span className="block text-xs font-semibold text-[#e3e3d8]">{label}</span>
      <span className="mt-1 block text-[11px] leading-4 text-[#8f9282]">{description}</span>
    </span>
    <span className={`mt-0.5 h-5 w-9 shrink-0 border p-0.5 transition ${checked ? 'border-[#9ddf2e] bg-[#9ddf2e]/20' : 'border-[#44483a] bg-[#1b1c16]'}`}>
      <span className={`block h-3.5 w-3.5 bg-current transition-transform ${checked ? 'translate-x-3.5 text-[#9ddf2e]' : 'translate-x-0 text-[#8f9282]'}`} />
    </span>
  </button>
);

export const UsageLimitsView: React.FC<UsageLimitsViewProps> = ({ onCommitLog, onBudgetChange }) => {
  const [monthlyBudget, setMonthlyBudget] = useState(250);
  const [dailyBudget, setDailyBudget] = useState(18);
  const [alertThreshold, setAlertThreshold] = useState(75);
  const [requestsPerMinute, setRequestsPerMinute] = useState(60);
  const [tokensPerMinute, setTokensPerMinute] = useState(120000);
  const [concurrency, setConcurrency] = useState(6);
  const [hardStop, setHardStop] = useState(true);
  const [autoDowngrade, setAutoDowngrade] = useState(true);
  const [pauseNewRuns, setPauseNewRuns] = useState(false);
  const [allocations, setAllocations] = useState(initialAllocations);

  const currentSpend = 104.8;
  const utilization = Math.min(100, Math.round((currentSpend / monthlyBudget) * 100));
  const projectedSpend = Math.round(currentSpend * 2.12);
  const headroom = Math.max(0, monthlyBudget - currentSpend);

  const allocationTotal = useMemo(
    () => allocations.reduce((total, allocation) => total + allocation.limit, 0),
    [allocations],
  );

  const updateAllocation = (id: string, limit: number) => {
    setAllocations((current) => current.map((allocation) => (
      allocation.id === id ? { ...allocation, limit } : allocation
    )));
  };

  const applyLimits = () => {
    onBudgetChange(utilization);
    onCommitLog(
      `Usage policy committed: $${monthlyBudget}/month, $${dailyBudget}/day, ${requestsPerMinute} RPM, ${tokensPerMinute.toLocaleString()} TPM, concurrency ${concurrency}.`,
      'success',
    );
  };

  const syncUsage = () => {
    onCommitLog('Provider usage sync complete: spend, token, request, and cache metrics reconciled.', 'success');
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 pb-2">
        <section className="xl:col-span-8 border border-[#44483a] bg-[#12140e] p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#9ddf2e]">
                <Gauge className="h-4 w-4" />
                usage control plane
              </div>
              <h2 className="mt-3 text-2xl font-bold text-[#e3e3d8]">Usage & Limits</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#c5c8b6]">
                Organization budgets, workspace quotas, rate limits, and per-agent cost envelopes.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={syncUsage}
                className="inline-flex items-center gap-2 border border-[#7dd3fc]/50 bg-[#7dd3fc]/5 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#7dd3fc] hover:bg-[#7dd3fc]/10"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Sync usage
              </button>
              <button
                onClick={applyLimits}
                className="inline-flex items-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d0f09] hover:bg-[#83c300]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Apply policy
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Month spend', value: `$${currentSpend.toFixed(2)}`, note: `${utilization}% utilized`, icon: CircleDollarSign, tone: '#9ddf2e' },
              { label: 'Projected', value: `$${projectedSpend}`, note: projectedSpend > monthlyBudget ? 'over envelope' : 'inside envelope', icon: Activity, tone: projectedSpend > monthlyBudget ? '#ffb020' : '#7dd3fc' },
              { label: 'Headroom', value: `$${headroom.toFixed(2)}`, note: 'before hard cap', icon: ShieldCheck, tone: '#7dd3fc' },
              { label: 'Cache hit', value: '43%', note: '1.8M tokens saved', icon: Cpu, tone: '#e3e3d8' },
            ].map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="border border-[#44483a] bg-[#1b1c16] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f9282]">{metric.label}</span>
                    <Icon className="h-4 w-4" style={{ color: metric.tone }} />
                  </div>
                  <div className="mt-3 text-xl font-bold text-[#e3e3d8]">{metric.value}</div>
                  <div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">{metric.note}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border border-[#44483a] bg-[#0d0f09] p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#c5c8b6]">14 day spend velocity</span>
              <span className="font-mono text-[10px] text-[#7dd3fc]">$3.10 avg / day</span>
            </div>
            <div className="mt-4 flex h-24 items-end gap-2 border-b border-[#44483a] px-1">
              {usageBars.map((height, index) => (
                <div key={`${height}-${index}`} className="flex-1 bg-[#7dd3fc]/70 transition hover:bg-[#9ddf2e]" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
        </section>

        <section className="xl:col-span-4 border border-[#44483a] bg-[#1b1c16] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8f9282]">Budget utilization</div>
              <div className={`mt-2 text-5xl font-bold ${utilization >= 75 ? 'text-[#ffb020]' : 'text-[#9ddf2e]'}`}>{utilization}%</div>
            </div>
            <CircleDollarSign className="h-10 w-10 text-[#9ddf2e]" />
          </div>
          <div className="mt-5 h-2 border border-[#44483a] bg-[#0d0f09]">
            <div className={utilization >= 75 ? 'h-full bg-[#ffb020]' : 'h-full bg-[#9ddf2e]'} style={{ width: `${utilization}%` }} />
          </div>
          <div className="mt-5 space-y-3">
            <label className="block">
              <span className="font-mono text-[10px] uppercase text-[#c5c8b6]">Monthly budget</span>
              <div className="mt-1 flex border border-[#44483a] bg-[#0d0f09]">
                <span className="px-3 py-2 text-[#8f9282]">$</span>
                <input type="number" min="50" step="10" value={monthlyBudget} onChange={(event) => setMonthlyBudget(Number(event.target.value))} className="w-full bg-transparent px-2 py-2 font-mono text-sm text-[#e3e3d8] outline-none" />
              </div>
            </label>
            <label className="block">
              <span className="font-mono text-[10px] uppercase text-[#c5c8b6]">Daily budget</span>
              <div className="mt-1 flex border border-[#44483a] bg-[#0d0f09]">
                <span className="px-3 py-2 text-[#8f9282]">$</span>
                <input type="number" min="1" step="1" value={dailyBudget} onChange={(event) => setDailyBudget(Number(event.target.value))} className="w-full bg-transparent px-2 py-2 font-mono text-sm text-[#e3e3d8] outline-none" />
              </div>
            </label>
            <label className="block">
              <div className="flex justify-between font-mono text-[10px] uppercase text-[#c5c8b6]"><span>Warning threshold</span><span className="text-[#ffb020]">{alertThreshold}%</span></div>
              <input type="range" min="25" max="95" step="5" value={alertThreshold} onChange={(event) => setAlertThreshold(Number(event.target.value))} className="mt-2 w-full accent-[#ffb020]" />
            </label>
          </div>
        </section>

        <section className="xl:col-span-5 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#7dd3fc]" />
            <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Rate envelope</h3>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label>
              <span className="font-mono text-[9px] uppercase text-[#8f9282]">Requests / min</span>
              <input type="number" min="1" value={requestsPerMinute} onChange={(event) => setRequestsPerMinute(Number(event.target.value))} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-sm text-[#e3e3d8] outline-none focus:border-[#7dd3fc]" />
            </label>
            <label>
              <span className="font-mono text-[9px] uppercase text-[#8f9282]">Tokens / min</span>
              <input type="number" min="1000" step="1000" value={tokensPerMinute} onChange={(event) => setTokensPerMinute(Number(event.target.value))} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-sm text-[#e3e3d8] outline-none focus:border-[#7dd3fc]" />
            </label>
            <label>
              <span className="font-mono text-[9px] uppercase text-[#8f9282]">Concurrency</span>
              <input type="number" min="1" max="32" value={concurrency} onChange={(event) => setConcurrency(Number(event.target.value))} className="mt-1 w-full border border-[#44483a] bg-[#0d0f09] px-3 py-2 font-mono text-sm text-[#e3e3d8] outline-none focus:border-[#7dd3fc]" />
            </label>
          </div>
          <div className="mt-4 space-y-2">
            <Toggle checked={hardStop} onChange={() => setHardStop((current) => !current)} label="Hard budget stop" description="Reject new paid requests after the workspace cap is reached." />
            <Toggle checked={autoDowngrade} onChange={() => setAutoDowngrade((current) => !current)} label="Automatic model downgrade" description="Move eligible lanes to lower-cost routes before blocking work." />
            <Toggle checked={pauseNewRuns} onChange={() => { setPauseNewRuns((current) => !current); onCommitLog(`New agent runs ${pauseNewRuns ? 'resumed' : 'paused'} by operator.`, pauseNewRuns ? 'success' : 'warning'); }} label="Pause new agent runs" description="Keep active work alive while preventing new queue entries." />
          </div>
        </section>

        <section className="xl:col-span-7 border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#9ddf2e]" />
              <h3 className="font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#e3e3d8]">Agent allocations</h3>
            </div>
            <span className={`font-mono text-[10px] ${allocationTotal > monthlyBudget ? 'text-[#ffb020]' : 'text-[#8f9282]'}`}>${allocationTotal} allocated</span>
          </div>
          <div className="mt-4 overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f9282]">
                <tr className="border-b border-[#44483a]">
                  <th className="pb-2 font-normal">Agent</th><th className="pb-2 font-normal">Spend</th><th className="pb-2 font-normal">Limit</th><th className="pb-2 font-normal">Requests</th><th className="pb-2 font-normal">Policy</th>
                </tr>
              </thead>
              <tbody>
                {allocations.map((allocation) => {
                  const allocationUse = Math.round((allocation.spent / allocation.limit) * 100);
                  return (
                    <tr key={allocation.id} className="border-b border-[#44483a]/60 text-xs">
                      <td className="py-3"><div className="font-semibold text-[#e3e3d8]">{allocation.name}</div><div className="mt-1 font-mono text-[9px] uppercase text-[#8f9282]">{allocation.lane}</div></td>
                      <td className="py-3 font-mono text-[#7dd3fc]">${allocation.spent.toFixed(2)}</td>
                      <td className="py-3"><input aria-label={`${allocation.name} budget`} type="number" min="5" step="5" value={allocation.limit} onChange={(event) => updateAllocation(allocation.id, Number(event.target.value))} className="w-20 border border-[#44483a] bg-[#0d0f09] px-2 py-1 font-mono text-[#e3e3d8] outline-none" /><div className="mt-1 h-1 w-20 bg-[#0d0f09]"><div className={allocationUse >= 80 ? 'h-full bg-[#ffb020]' : 'h-full bg-[#9ddf2e]'} style={{ width: `${Math.min(100, allocationUse)}%` }} /></div></td>
                      <td className="py-3 font-mono text-[#c5c8b6]">{allocation.requests}</td>
                      <td className="py-3"><span className="border border-[#44483a] bg-[#1b1c16] px-2 py-1 font-mono text-[9px] uppercase text-[#c5c8b6]">{allocation.policy}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="xl:col-span-12 border border-[#44483a] bg-[#1b1c16] p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="border border-[#ffb020]/40 bg-[#ffb020]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#ffb020]"><AlertTriangle className="h-4 w-4" /> Forecast alert</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Current velocity projects ${Math.max(0, projectedSpend - monthlyBudget)} above the monthly envelope.</p></div>
            <div className="border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#7dd3fc]"><Clock className="h-4 w-4" /> Reset window</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Daily controls reset at 00:00 UTC. Monthly controls reset in 21 days.</p></div>
            <div className="border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 p-3"><div className="flex items-center gap-2 font-mono text-[10px] uppercase text-[#9ddf2e]"><Activity className="h-4 w-4" /> Live telemetry</div><p className="mt-2 text-xs leading-5 text-[#c5c8b6]">Provider headers and gateway events update remaining request and token headroom.</p></div>
          </div>
        </section>
      </div>
    </div>
  );
};
