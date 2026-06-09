import React from 'react';
import { Lock, AlertTriangle, CheckCircle2, Sliders } from 'lucide-react';

interface EnvironmentSyncModuleProps {
  onActionClick: (action: string) => void;
}

export const EnvironmentSyncModule: React.FC<EnvironmentSyncModuleProps> = ({ onActionClick }) => {
  const envs = [
    { name: 'LOCAL', hash: 'env_4c29', status: 'synced', detail: 'Local node mapping' },
    { name: 'PREVIEW', hash: 'env_a81f', status: 'dirty', detail: 'Dev server staging mismatch' },
    { name: 'PRODUCTION', hash: 'env_9d02', status: 'locked', detail: 'Sealed mainnet environment' },
  ];

  return (
    <div className="rounded-lg bg-[#101114] border border-[#C0C0C5]/10 p-4 flex flex-col space-y-3">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider text-[#F5F5F5] uppercase">
            ENVIRONMENT SYNC
          </h2>
          <Sliders className="w-3.5 h-3.5 text-[#777E86]" />
        </div>
        <p className="font-mono text-[11px] text-[#7DD3FC] mt-0.5">
          on_vercel_sync() → Active Env-Hash Mapping
        </p>
      </div>

      {/* Environments List Table-like */}
      <div className="flex flex-col space-y-1">
        {envs.map((env) => (
          <div
            key={env.name}
            className={`flex items-center justify-between px-3 py-2 rounded-sm border font-mono text-xs select-none transition-all duration-200 ${
              env.status === 'locked'
                ? 'border-[#23262B] bg-[#0A0A0B]/40 text-[#525861]'
                : 'border-[#23262B] bg-[#0A0A0B]/80 text-[#C0C0C5] hover:border-[#30343A]'
            }`}
          >
            {/* Status dot and Name */}
            <div className="flex items-center space-x-2">
              {env.status === 'synced' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DEFF9A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#DEFF9A]"></span>
                </span>
              )}
              {env.status === 'dirty' && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FDE68A] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FDE68A]"></span>
                </span>
              )}
              {env.status === 'locked' && (
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#525861]"></span>
              )}
              <span className={`font-semibold ${env.status === 'locked' ? 'text-[#525861]' : 'text-[#F5F5F5]'}`}>
                {env.name}
              </span>
            </div>

            {/* Hash Code */}
            <div className="flex items-center space-x-3">
              <span className="text-[10px] text-[#777E86] bg-[#101114] px-1.5 py-0.5 rounded border border-[#23262B]">
                {env.hash}
              </span>
              <div className="flex items-center w-[75px] justify-end">
                {env.status === 'synced' && (
                  <span className="text-[#DEFF9A] text-[10px] flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SYNCED</span>
                  </span>
                )}
                {env.status === 'dirty' && (
                  <span className="text-[#FDE68A] text-[10px] flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>DIRTY</span>
                  </span>
                )}
                {env.status === 'locked' && (
                  <span className="text-[#525861] text-[10px] flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>LOCKED</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Row */}
      <div className="grid grid-cols-4 gap-1.5 pt-1">
        {['Pull', 'Diff', 'Push', 'Seal'].map((action) => (
          <button
            key={action}
            onClick={() => onActionClick(action)}
            className="border border-[#30343A] bg-[#0A0A0B] hover:border-[#DEFF9A]/40 hover:text-[#DEFF9A] text-[#C0C0C5] text-[11px] font-mono py-1 rounded-sm transition-all duration-150 active:scale-[0.97]"
          >
            {action}
          </button>
        ))}
      </div>
    </div>
  );
};
