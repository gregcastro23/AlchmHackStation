import React, { useState, useEffect } from 'react';
import { AlertTriangle, Zap } from 'lucide-react';
import { spacetimedbSocket, ELEMENTAL_COLORS } from '../lib/spacetimedbSocket';
import type { ReducerEvent, SpacetimeTelemetry } from '../lib/spacetimedbSocket';

export const ReducerFeed: React.FC = () => {
  const [events, setEvents] = useState<ReducerEvent[]>([
    {
      id: 'init_1',
      timestamp: Date.now() - 4200,
      reducerName: 'sync_solana_event_reducer',
      callerIdentity: '0xAhNR...42aK',
      status: 'committed',
      element: 'Air',
      mutatedRows: 1,
      latencyMs: 18,
      hash: '0x3f9a...8c2d',
      energy: 0.9,
    },
    {
      id: 'init_2',
      timestamp: Date.now() - 2800,
      reducerName: 'token2022_transfer_hook_charge',
      callerIdentity: '0x5Qhe...8WzD',
      status: 'committed',
      element: 'Fire',
      mutatedRows: 2,
      latencyMs: 24,
      hash: '0x8a2f...11b4',
      energy: 0.95,
    },
    {
      id: 'init_3',
      timestamp: Date.now() - 1400,
      reducerName: 'admin_agent_record_star_stake_reducer',
      callerIdentity: '0xc200...db52',
      status: 'committed',
      element: 'Earth',
      mutatedRows: 1,
      latencyMs: 16,
      hash: '0xec41...98f1',
      energy: 0.85,
    },
  ]);

  const [telemetry, setTelemetry] = useState<SpacetimeTelemetry>(spacetimedbSocket.getTelemetry());
  const [hasRollbackAlert, setHasRollbackAlert] = useState<boolean>(false);

  useEffect(() => {
    // Initiate WebSocket connection
    spacetimedbSocket.connect();

    // Listen for real-time telemetry updates
    const unsubTelemetry = spacetimedbSocket.onTelemetry((t) => {
      setTelemetry(t);
    });

    // Listen for incoming live reducer events
    const unsubEvents = spacetimedbSocket.onReducerEvent((event) => {
      setEvents((prev) => [event, ...prev.slice(0, 24)]);
      if (event.status === 'failed') {
        setHasRollbackAlert(true);
      }
    });

    return () => {
      unsubTelemetry();
      unsubEvents();
    };
  }, []);

  const handleTriggerTest = () => {
    spacetimedbSocket.triggerMockMutation();
  };

  return (
    <div className="rounded-lg bg-[#101114] border border-[#C0C0C5]/10 p-4 flex flex-col space-y-3 flex-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-[#F5F5F5] uppercase flex items-center gap-2">
            SPACETIMEDB REDUCER FEED
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
              telemetry.status === 'LIVE' ? 'bg-[#DEFF9A]/20 text-[#DEFF9A] border border-[#DEFF9A]/40' :
              telemetry.status === 'CONNECTING' ? 'bg-[#7DD3FC]/20 text-[#7DD3FC] border border-[#7DD3FC]/40 animate-pulse' :
              'bg-[#F87171]/20 text-[#F87171] border border-[#F87171]/40'
            }`}>
              {telemetry.status}
            </span>
          </h2>
          <p className="font-mono text-[10px] text-[#777E86] mt-0.5">
            wss://{telemetry.wsUrl.split('/')[2]} · {telemetry.pingMs}ms latency
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleTriggerTest}
            title="Trigger Instant Mutex Validation (<50ms)"
            className="px-2 py-1 bg-[#DEFF9A]/10 hover:bg-[#DEFF9A]/20 text-[#DEFF9A] border border-[#DEFF9A]/40 rounded font-mono text-[10px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer font-bold"
          >
            <Zap className="w-3 h-3 fill-current" />
            <span>MUTEX TEST</span>
          </button>
        </div>
      </div>

      {/* Warning Banner for Transaction Rollbacks / Desync */}
      {hasRollbackAlert && (
        <div className="p-2.5 rounded bg-[#F87171]/10 border border-[#F87171]/40 flex items-center justify-between font-mono text-[11px] text-[#F87171]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Warning: Transaction rollback detected in reducer stream.</span>
          </div>
          <button
            onClick={() => setHasRollbackAlert(false)}
            className="underline hover:opacity-80 text-[10px] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Live Reducer Event Ticker */}
      <div className="flex flex-col space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
        {events.map((item) => {
          const color = ELEMENTAL_COLORS[item.element] || '#DEFF9A';

          return (
            <div
              key={item.id}
              className="flex items-stretch bg-[#0A0A0B]/80 rounded-md border border-[#23262B] hover:border-[#30343A] overflow-hidden transition-all"
            >
              {/* Colored left rail indicator (Elemental theme) */}
              <div
                className="w-1.5 min-w-[6px]"
                style={{ backgroundColor: color }}
              />

              {/* Inner Content */}
              <div className="flex-1 p-2.5 flex items-center justify-between font-mono text-xs">
                <div className="flex flex-col space-y-1">
                  {/* Reducer Name & Element */}
                  <div className="flex items-center space-x-2">
                    <span className="text-[#F5F5F5] font-semibold text-[11px]">{item.reducerName}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                      style={{ color, backgroundColor: `${color}15`, border: `1px solid ${color}40` }}
                    >
                      {item.element}
                    </span>
                  </div>

                  {/* Caller identity & row count */}
                  <div className="flex items-center gap-2 text-[10px] text-[#777E86]">
                    <span>Caller: <strong className="text-[#C0C0C5]">{item.callerIdentity}</strong></span>
                    <span>·</span>
                    <span>Mutated: <strong className="text-[#DEFF9A]">+{item.mutatedRows} row{item.mutatedRows > 1 ? 's' : ''}</strong></span>
                  </div>
                </div>

                {/* Hash / Latency block */}
                <div className="text-right flex flex-col space-y-0.5 justify-center font-mono">
                  <span className="text-[10px] text-[#525861]">{item.hash}</span>
                  <div className="flex items-center justify-end gap-1 text-[9px]">
                    <span className="text-[#7DD3FC]">{item.latencyMs}ms</span>
                    <span className="text-[#DEFF9A]/70 uppercase tracking-wider">
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

