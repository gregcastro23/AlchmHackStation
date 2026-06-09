import React from 'react';
import { Database } from 'lucide-react';

export const ReducerFeed: React.FC = () => {
  const reducers = [
    {
      name: 'Deployments',
      reducer: 'on_forge_deploy()',
      output: 'Verified contract address',
      color: 'acid', // acid green
      hash: '0x3f9a...8c2d',
    },
    {
      name: 'EnvState',
      reducer: 'on_vercel_sync()',
      output: 'Active env-hash mapping',
      color: 'cyan', // cyan
      hash: 'sha256:8a2f',
    },
    {
      name: 'ActivityLog',
      reducer: 'on_terminal_io()',
      output: '3D trace visual event',
      color: 'acid',
      hash: 'event:tx_ok',
    },
    {
      name: 'GasMetrics',
      reducer: 'on_block_trace()',
      output: 'PBR heatmap density',
      color: 'cyan',
      hash: 'block:788291',
    },
  ];

  return (
    <div className="rounded-lg bg-[#101114] border border-[#C0C0C5]/10 p-4 flex flex-col space-y-3 flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold tracking-wider text-[#F5F5F5] uppercase">
          SPACETIMEDB REDUCER FEED
        </h2>
        <div className="flex items-center space-x-1.5 font-mono text-[10px] text-[#888888]">
          <Database className="w-3.5 h-3.5 text-[#DEFF9A]" />
          <span className="text-[#DEFF9A]">ACTIVE REDUCERS</span>
        </div>
      </div>

      {/* Reducer Feed Items */}
      <div className="flex flex-col space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {reducers.map((item, idx) => (
          <div
            key={idx}
            className="flex items-stretch bg-[#0A0A0B]/60 rounded-md border border-[#23262B] overflow-hidden"
          >
            {/* Colored left rail indicator */}
            <div
              className={`w-1 min-w-1 ${
                item.color === 'acid' ? 'bg-[#DEFF9A]' : 'bg-[#7DD3FC]'
              }`}
            />

            {/* Inner Content */}
            <div className="flex-1 p-2.5 flex items-center justify-between font-mono text-xs">
              <div className="flex flex-col space-y-1">
                {/* Reducer Name */}
                <div className="flex items-center space-x-2">
                  <span className="text-[#F5F5F5] font-semibold">{item.name}</span>
                  <span className="text-[10px] text-[#777E86]">→</span>
                  <span
                    className={`font-semibold ${
                      item.color === 'acid' ? 'text-[#DEFF9A]' : 'text-[#7DD3FC]'
                    }`}
                  >
                    {item.reducer}
                  </span>
                </div>

                {/* Subtitle / Output */}
                <span className="text-[11px] text-[#C0C0C5]">{item.output}</span>
              </div>

              {/* Hash / Telemetry block */}
              <div className="text-right flex flex-col space-y-0.5 justify-center">
                <span className="text-[10px] text-[#525861]">{item.hash}</span>
                <span className="text-[9px] text-[#DEFF9A]/60 uppercase tracking-wider">
                  Live Sync
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
