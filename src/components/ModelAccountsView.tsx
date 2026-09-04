import React, { useState, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  RefreshCw,
  Radio,
  Sliders,
} from 'lucide-react';

type LogType = 'success' | 'info' | 'warning' | 'error' | 'default';

interface ModelAccountsViewProps {
  onCommitLog: (text: string, type?: LogType) => void;
}

export interface RpcEndpoint {
  id: string;
  name: string;
  provider: 'Helius' | 'Triton' | 'QuickNode' | 'Localnet';
  url: string;
  wsUrl: string;
  pingMs: number;
  status: 'healthy' | 'degraded' | 'local';
  priorityLevel: 'Primary' | 'Secondary' | 'Fallback' | 'Development';
  tps: number;
  cuConsumptionAvg: number;
  payloadKbPerSec: number;
}

const INITIAL_ENDPOINTS: RpcEndpoint[] = [
  {
    id: 'helius-dedicated',
    name: 'Helius Dedicated RPC (Atlas)',
    provider: 'Helius',
    url: 'https://mainnet.helius-rpc.com/?api-key=***',
    wsUrl: 'wss://atlas-mainnet.helius-rpc.com',
    pingMs: 18,
    status: 'healthy',
    priorityLevel: 'Primary',
    tps: 2840,
    cuConsumptionAvg: 245000,
    payloadKbPerSec: 342.5,
  },
  {
    id: 'triton-validator',
    name: 'Triton Sub-Zero RPC Pool',
    provider: 'Triton',
    url: 'https://alchm-solana-mainnet.rpcpool.com',
    wsUrl: 'wss://alchm-solana-mainnet.rpcpool.com',
    pingMs: 24,
    status: 'healthy',
    priorityLevel: 'Secondary',
    tps: 2810,
    cuConsumptionAvg: 218000,
    payloadKbPerSec: 310.2,
  },
  {
    id: 'quicknode-backup',
    name: 'QuickNode High-Throughput Gateway',
    provider: 'QuickNode',
    url: 'https://solana-mainnet.quiknode.pro/***',
    wsUrl: 'wss://solana-mainnet.quiknode.pro',
    pingMs: 38,
    status: 'healthy',
    priorityLevel: 'Fallback',
    tps: 2650,
    cuConsumptionAvg: 198000,
    payloadKbPerSec: 180.4,
  },
  {
    id: 'solana-localnet',
    name: 'Local Solana Test Validator',
    provider: 'Localnet',
    url: 'http://127.0.0.1:8899',
    wsUrl: 'ws://127.0.0.1:8900',
    pingMs: 1,
    status: 'local',
    priorityLevel: 'Development',
    tps: 4200,
    cuConsumptionAvg: 120000,
    payloadKbPerSec: 85.0,
  },
];

export const ModelAccountsView: React.FC<ModelAccountsViewProps> = ({ onCommitLog }) => {
  const [endpoints, setEndpoints] = useState<RpcEndpoint[]>(INITIAL_ENDPOINTS);
  const [activeEndpointId, setActiveEndpointId] = useState('helius-dedicated');
  const [testingId, setTestingId] = useState<string | null>(null);

  // Compute Unit Budget Simulation states
  const [cuLimit, setCuLimit] = useState<number>(400000);
  const [priorityFeeMicroLamports, setPriorityFeeMicroLamports] = useState<number>(50000);
  const [selectedInstruction, setSelectedInstruction] = useState<'transfer-hook' | 'token-mint' | 'reconcile'>('transfer-hook');

  // Ping jitter tick
  useEffect(() => {
    const interval = setInterval(() => {
      setEndpoints((prev) =>
        prev.map((ep) => {
          const jitter = Math.floor((Math.random() - 0.5) * 4);
          const newPing = Math.max(1, ep.pingMs + jitter);
          return { ...ep, pingMs: newPing };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testEndpoint = (ep: RpcEndpoint) => {
    setTestingId(ep.id);
    onCommitLog(`Probing latency & WebSocket throughput for ${ep.name}...`, 'info');

    setTimeout(() => {
      setTestingId(null);
      onCommitLog(`Ping confirmed: ${ep.pingMs}ms. Validated slot commitment 'confirmed' on ${ep.provider}.`, 'success');
    }, 600);
  };

  const instructionCuEstimate = {
    'transfer-hook': {
      label: 'Token-2022 Transfer Hook (Ignis)',
      baseCu: 4200,
      extraMetasCu: 14800,
      hookCpiCu: 68500,
      totalCu: 87500,
    },
    'token-mint': {
      label: 'Confidential Token Mint (Aqua)',
      baseCu: 12500,
      extraMetasCu: 0,
      hookCpiCu: 45000,
      totalCu: 57500,
    },
    'reconcile': {
      label: 'SpacetimeDB Staking Reconcile',
      baseCu: 6800,
      extraMetasCu: 8200,
      hookCpiCu: 92000,
      totalCu: 107000,
    },
  }[selectedInstruction];

  const estimatedFeeSol = ((cuLimit * priorityFeeMicroLamports) / 1e15).toFixed(7);

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar font-mono text-xs">
      {/* Header Banner */}
      <div className="p-4 glass-panel rounded-lg border border-primary/30 bg-primary/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-primary animate-pulse" />
            <h1 className="font-heading text-base font-bold text-on-surface uppercase tracking-wider">
              RPC Throughput & Compute Unit Budget Monitor
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-primary/20 text-primary border border-primary/40 font-bold">
              SOLANA INFRASTRUCTURE
            </span>
          </div>
          <p className="text-on-surface-variant text-[11px] mt-1 font-sans">
            Tracking dedicated RPC cluster latencies, Compute Unit (CU) execution limits, priority fees, and indexing stream payloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#8f9282]">Cluster Throughput:</span>
          <span className="text-primary font-bold">~2,840 TPS</span>
        </div>
      </div>

      {/* Grid: RPC Endpoints (Top) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {endpoints.map((ep) => {
          const isActive = activeEndpointId === ep.id;
          return (
            <div
              key={ep.id}
              onClick={() => {
                setActiveEndpointId(ep.id);
                onCommitLog(`Switched primary monitoring endpoint to ${ep.name}.`, 'info');
              }}
              className={`p-3.5 glass-panel rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/5'
                  : 'border-outline-variant/30 bg-surface-container hover:border-outline-variant/70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-on-surface text-xs">{ep.provider}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-surface border border-outline-variant/30 text-secondary">
                    {ep.priorityLevel}
                  </span>
                </div>
                <div className="text-[11px] text-primary font-semibold truncate mt-1">{ep.name}</div>
                <div className="text-[10px] text-[#8f9282] font-mono truncate mt-0.5">{ep.url}</div>
              </div>

              <div className="pt-2 border-t border-outline-variant/20 space-y-1 text-[10px]">
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Ping Latency:</span>
                  <span className="text-primary font-bold">{ep.pingMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Indexing Stream:</span>
                  <span className="text-on-surface">{ep.payloadKbPerSec} KB/s</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  testEndpoint(ep);
                }}
                disabled={testingId === ep.id}
                className="w-full py-1 rounded bg-surface hover:bg-surface-container-high border border-outline-variant/40 text-[10px] font-bold text-on-surface uppercase flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                {testingId === ep.id ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin text-primary" />
                    <span>Pinging RPC...</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3 h-3 text-secondary" />
                    <span>Ping Endpoint</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Split: Compute Unit Budget Simulation & Instruction Analyzer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: CU Budget Controls (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <span className="text-xs uppercase text-on-surface-variant font-bold tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Compute Unit (CU) Budget Configuration
          </span>

          <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-surface-container space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] text-[#8f9282] uppercase">Compute Unit Limit</label>
                <span className="text-primary font-bold">{cuLimit.toLocaleString()} CU</span>
              </div>
              <input
                type="range"
                min={50000}
                max={1400000}
                step={25000}
                value={cuLimit}
                onChange={(e) => setCuLimit(Number(e.target.value))}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[9px] text-[#8f9282] mt-1">
                <span>50k (Base)</span>
                <span>400k (Token-2022 CPI)</span>
                <span>1.4M (Tx Max)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] text-[#8f9282] uppercase">Prioritization Fee Rate</label>
                <span className="text-secondary font-bold">{priorityFeeMicroLamports.toLocaleString()} micro-lamports / CU</span>
              </div>
              <input
                type="range"
                min={1000}
                max={250000}
                step={5000}
                value={priorityFeeMicroLamports}
                onChange={(e) => setPriorityFeeMicroLamports(Number(e.target.value))}
                className="w-full accent-secondary cursor-pointer"
              />
            </div>

            <div className="p-3 bg-surface rounded border border-outline-variant/30 space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8f9282]">Estimated Priority Fee:</span>
                <span className="text-primary font-bold">{estimatedFeeSol} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f9282]">Inclusion Probability:</span>
                <span className="text-primary font-bold">99.4% (Next 1-2 Slots)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Instruction CU Profiler (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-3">
          <span className="text-xs uppercase text-on-surface-variant font-bold tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-secondary" />
            Instruction CU Profiler
          </span>

          <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-surface-container space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[#8f9282]">Scenario:</span>
              <select
                value={selectedInstruction}
                onChange={(e) => setSelectedInstruction(e.target.value as typeof selectedInstruction)}
                className="bg-surface border border-outline-variant/40 rounded px-2.5 py-1 text-primary font-bold focus:outline-none"
              >
                <option value="transfer-hook">Token-2022 Transfer Hook (Ignis)</option>
                <option value="token-mint">Confidential Token Mint (Aqua)</option>
                <option value="reconcile">SpacetimeDB Staking Reconcile</option>
              </select>
            </div>

            <div className="p-3 bg-surface rounded border border-outline-variant/30 space-y-1.5 text-[11px]">
              <div className="font-bold text-on-surface mb-1">{instructionCuEstimate.label}</div>
              <div className="flex justify-between">
                <span className="text-[#8f9282]">Base SPL Execution:</span>
                <span className="text-on-surface">{instructionCuEstimate.baseCu.toLocaleString()} CU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f9282]">ExtraAccountMetas PDA Lookup:</span>
                <span className="text-on-surface">{instructionCuEstimate.extraMetasCu.toLocaleString()} CU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8f9282]">Hook Program CPI Execution:</span>
                <span className="text-on-surface">{instructionCuEstimate.hookCpiCu.toLocaleString()} CU</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-outline-variant/20 font-bold">
                <span className="text-primary">Total Estimated CU:</span>
                <span className="text-primary text-sm">{instructionCuEstimate.totalCu.toLocaleString()} CU</span>
              </div>
            </div>

            <div className={`p-2.5 rounded text-[11px] flex items-center gap-2 ${
              cuLimit >= instructionCuEstimate.totalCu
                ? 'bg-primary/10 border border-primary/30 text-primary'
                : 'bg-[#ff7b72]/10 border border-[#ff7b72]/30 text-[#ff7b72]'
            }`}>
              {cuLimit >= instructionCuEstimate.totalCu ? (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>CU budget is sufficient. Transaction will execute without exceeding compute limits.</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Insufficient CU limit! Transaction is projected to exhaust compute units.</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
