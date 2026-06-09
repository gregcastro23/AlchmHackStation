import React, { useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Play, RefreshCw, BarChart2 } from 'lucide-react';

interface AuditMetric {
  name: string;
  category: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'QUEUED';
  details: string;
}

export const SecurityProtocolsView: React.FC = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [complianceScore, setComplianceScore] = useState(98);
  const [metrics, setMetrics] = useState<AuditMetric[]>([
    { name: 'Reentrancy Guard Check', category: 'STATE_MUTATION', status: 'PASSED', details: 'No external calls before state synchronization.' },
    { name: 'Arithmetic Assertions', category: 'COMPILER_SOLC', status: 'PASSED', details: 'SafeMath redundant, overflow checks auto-managed by Solidity 0.8.26.' },
    { name: 'Admin Privilege Allocation', category: 'ACCESS_CONTROL', status: 'WARNING', details: 'Deployer address given direct root ownership. Recommend Gnosis Multisig.' },
    { name: 'Integer Overflow Dials', category: 'REDUCER_STATE', status: 'PASSED', details: 'SpaceTimeDB committed values strictly bound by type-safety schemas.' },
    { name: 'Gas Consumption Limits', category: 'ANVIL_TELEMETRY', status: 'PASSED', details: 'Compilation logs confirm block gas limits below 30,000,000.' },
    { name: 'External Call Verification', category: 'INTERFACE_INTEGRATION', status: 'QUEUED', details: 'Syncing planetary dual matches endpoints.' },
  ]);

  const handleRunAudit = () => {
    setIsAuditing(true);
    // Queue final item
    setTimeout(() => {
      setIsAuditing(false);
      setComplianceScore(99);
      setMetrics((prev) =>
        prev.map((m) =>
          m.status === 'QUEUED'
            ? { ...m, status: 'PASSED', details: 'All external contract callbacks verified against oracle registries.' }
            : m
        )
      );
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full min-h-0 select-none">
      {/* Audit compliance score panel */}
      <div className="bg-[#12140e] border border-[#44483a] p-5 flex flex-col justify-between">
        <div>
          <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-4.5 h-4.5 text-[#9ddf2e]" />
              <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
                AUDIT TELEMETRY
              </h2>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center py-6 bg-[#0d0f09] border border-[#44483a] text-center">
            <span className="font-mono text-[10px] text-[#8f9282] uppercase tracking-widest">
              COMPLIANCE SCORE
            </span>
            <div className="font-mono text-[64px] font-bold text-[#9ddf2e] leading-none my-2 tracking-tighter animate-pulse glow-acid">
              {complianceScore}%
            </div>
            <div className="flex items-center space-x-1.5 bg-[#9ddf2e]/10 border border-[#9ddf2e]/30 px-3 py-1 text-[#9ddf2e] font-mono text-[10px] font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SECURITY SECURE</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#44483a]/40">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#8f9282]">TOTAL REDUCERS SCAN:</span>
            <span className="text-[#e3e3d8]">14 CHECKED</span>
          </div>
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#8f9282]">COMPILATION DEPLOYER:</span>
            <span className="text-[#ffb020] font-bold">1 WARNING</span>
          </div>
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#8f9282]">ASSERTION SUCCESSES:</span>
            <span className="text-[#9ddf2e]">37/37 PASSED</span>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full mt-4 flex items-center justify-center space-x-2 border border-[#9ddf2e] text-[#9ddf2e] hover:bg-[#9ddf2e]/10 py-2.5 font-mono text-[11px] uppercase font-bold tracking-wider cursor-pointer transition-all duration-150 active:scale-[0.98]"
          >
            <Play className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'AUDITING DAEMONS...' : 'TRIGGER FULL AUDIT SCAN'}</span>
          </button>
        </div>
      </div>

      {/* Audit criteria details list */}
      <div className="lg:col-span-2 bg-[#12140e] border border-[#44483a] p-5 flex flex-col min-h-0">
        <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4.5 h-4.5 text-[#9ddf2e]" />
            <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
              PROTOCOL INTEGRITY LIST
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 min-h-0">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-[#1b1c16] border border-[#44483a] p-3.5 flex flex-col space-y-1.5 hover:border-[#9ddf2e]/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {metric.status === 'PASSED' ? (
                    <ShieldCheck className="w-4 h-4 text-[#9ddf2e]" />
                  ) : metric.status === 'WARNING' ? (
                    <ShieldAlert className="w-4 h-4 text-[#ffb020]" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-[#8f9282] animate-spin" />
                  )}
                  <span className="font-mono text-[12px] font-bold text-[#e3e3d8]">
                    {metric.name}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[#8f9282] tracking-wider font-bold">
                  {metric.category}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#c5c8b6] pl-6 leading-relaxed">
                {metric.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
