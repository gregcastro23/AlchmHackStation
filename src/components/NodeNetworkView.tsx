import React, { useState } from 'react';
import { Network, Activity, RefreshCw, Server, AlertCircle } from 'lucide-react';

interface NetworkNode {
  id: string;
  location: string;
  status: 'ACTIVE' | 'SYNCING' | 'DISCONNECTED';
  latency: number | null;
  role: string;
}

export const NodeNetworkView: React.FC = () => {
  const [isResyncing, setIsResyncing] = useState(false);
  const [nodes, setNodes] = useState<NetworkNode[]>([
    { id: 'node_alchm_local', location: 'ETHGLOBAL NY // LOCAL', status: 'ACTIVE', latency: 3, role: 'Operator Hub' },
    { id: 'node_spacetime_ny', location: 'AWS US-EAST-1 // SPACETIMEDB', status: 'ACTIVE', latency: 14, role: 'Relay Sync' },
    { id: 'node_tauri_bridge', location: 'LOCAL SIDECAR // IPC', status: 'ACTIVE', latency: 1, role: 'Tauri Daemon' },
    { id: 'node_anvil_rpc', location: 'LOCAL ANVIL // PORT 8545', status: 'ACTIVE', latency: 2, role: 'Ethereum Node' },
    { id: 'node_planetary_peer', location: 'PLANETARY SERVERS // CLOUD', status: 'SYNCING', latency: 89, role: 'Word Duel Peer' },
    { id: 'node_backup_replica', location: 'AWS EU-WEST-1 // BACKUP', status: 'DISCONNECTED', latency: null, role: 'Read Replica' },
  ]);

  const handleResync = () => {
    setIsResyncing(true);
    setTimeout(() => {
      setIsResyncing(false);
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          latency: n.status !== 'DISCONNECTED' ? Math.floor(Math.random() * 20) + 1 : null,
          status: n.id === 'node_planetary_peer' ? 'ACTIVE' : n.status,
        }))
      );
    }, 1200);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-full min-h-0 select-none">
      {/* 2D Grid Visualizer Map */}
      <div className="xl:col-span-2 bg-[#12140e] border border-[#44483a] p-5 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,20,14,0)_50%,rgba(18,20,14,0.15)_50%)] bg-[length:100%_4px] opacity-15 z-0" />
        
        <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center z-10 shrink-0">
          <div className="flex items-center space-x-2">
            <Network className="w-4.5 h-4.5 text-[#9ddf2e]" />
            <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
              PEER TOPOLOGY VISUALIZER
            </h2>
          </div>
          <button
            onClick={handleResync}
            disabled={isResyncing}
            className="flex items-center space-x-1.5 border border-[#9ddf2e]/60 text-[#9ddf2e] hover:bg-[#9ddf2e]/10 px-3 py-1 font-mono text-[10px] uppercase transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <RefreshCw className={`w-3 h-3 ${isResyncing ? 'animate-spin' : ''}`} />
            <span>{isResyncing ? 'PINGING...' : 'FORCE PING PEERS'}</span>
          </button>
        </header>

        {/* Node Lattice Simulator Panel */}
        <div className="flex-1 bg-[#0d0f09] border border-[#44483a] relative tech-grid flex items-center justify-center p-8 min-h-[300px]">
          {/* SVG Lattices */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <line x1="20%" y1="20%" x2="50%" y2="50%" stroke="#9ddf2e" strokeWidth="1" />
            <line x1="80%" y1="20%" x2="50%" y2="50%" stroke="#9ddf2e" strokeWidth="1" />
            <line x1="15%" y1="75%" x2="50%" y2="50%" stroke="#9ddf2e" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="50%" y1="85%" x2="50%" y2="50%" stroke="#9ddf2e" strokeWidth="1" />
            <line x1="85%" y1="75%" x2="50%" y2="50%" stroke="#ffb4ab" strokeWidth="1" strokeDasharray="4 4" />
          </svg>

          {/* Central Operator Node */}
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
            <div className="w-16 h-16 border-2 border-[#9ddf2e] bg-[#12140e] flex items-center justify-center glow-acid animate-pulse">
              <Server className="w-7 h-7 text-[#9ddf2e]" />
            </div>
            <span className="font-mono text-[9px] text-[#9ddf2e] mt-1.5 uppercase font-bold tracking-widest bg-[#1b1c16] px-1 border border-[#44483a]">
              HUB_MASTER
            </span>
          </div>

          {/* Connected Peripheral Nodes */}
          <div className="absolute top-[20%] left-[20%] flex flex-col items-center">
            <div className="w-10 h-10 border border-[#9ddf2e] bg-[#12140e] flex items-center justify-center">
              <span className="font-mono text-[10px] text-[#9ddf2e]">NY</span>
            </div>
            <span className="font-mono text-[8px] text-[#c5c8b6] mt-1">spacetime_ny</span>
          </div>

          <div className="absolute top-[20%] left-[80%] flex flex-col items-center">
            <div className="w-10 h-10 border border-[#9ddf2e] bg-[#12140e] flex items-center justify-center">
              <span className="font-mono text-[10px] text-[#9ddf2e]">SEC</span>
            </div>
            <span className="font-mono text-[8px] text-[#c5c8b6] mt-1">tauri_bridge</span>
          </div>

          <div className="absolute bottom-[25%] left-[15%] flex flex-col items-center">
            <div className="w-10 h-10 border border-[#9ddf2e] bg-[#12140e] border-dashed flex items-center justify-center">
              <span className="font-mono text-[10px] text-[#9ddf2e]">ANV</span>
            </div>
            <span className="font-mono text-[8px] text-[#c5c8b6] mt-1">anvil_rpc</span>
          </div>

          <div className="absolute bottom-[15%] left-[50%] -translate-x-1/2 flex flex-col items-center">
            <div className={`w-10 h-10 border bg-[#12140e] flex items-center justify-center transition-all ${
              nodes.find(n => n.id === 'node_planetary_peer')?.status === 'ACTIVE'
                ? 'border-[#9ddf2e]'
                : 'border-[#ffb020] border-dashed animate-pulse'
            }`}>
              <span className={`font-mono text-[10px] ${
                nodes.find(n => n.id === 'node_planetary_peer')?.status === 'ACTIVE'
                  ? 'text-[#9ddf2e]'
                  : 'text-[#ffb020]'
              }`}>AGY</span>
            </div>
            <span className="font-mono text-[8px] text-[#c5c8b6] mt-1">planetary_peer</span>
          </div>

          <div className="absolute bottom-[25%] left-[85%] flex flex-col items-center opacity-40">
            <div className="w-10 h-10 border border-[#ffb4ab] bg-[#12140e] flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-[#ffb4ab]" />
            </div>
            <span className="font-mono text-[8px] text-[#ffb4ab] mt-1">replica_01</span>
          </div>
        </div>
      </div>

      {/* Nodes Listing Table panel */}
      <div className="bg-[#12140e] border border-[#44483a] p-5 flex flex-col">
        <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-[#9ddf2e]" />
            <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
              PEER REGISTRY
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`p-3 border flex flex-col space-y-1.5 transition-colors ${
                node.status === 'ACTIVE'
                  ? 'bg-[#1b1c16] border-[#44483a] hover:border-[#9ddf2e]'
                  : node.status === 'SYNCING'
                  ? 'bg-[#1b1c16]/80 border-[#ffb020]/30 hover:border-[#ffb020]'
                  : 'bg-[#12140e] border-[#44483a]/30 opacity-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-bold text-[#e3e3d8]">{node.id}</span>
                <span className={`font-mono text-[9px] px-1.5 py-0.5 border rounded-sm font-bold ${
                  node.status === 'ACTIVE'
                    ? 'border-[#9ddf2e]/30 text-[#9ddf2e] bg-[#9ddf2e]/5'
                    : node.status === 'SYNCING'
                    ? 'border-[#ffb020]/30 text-[#ffb020] bg-[#ffb020]/5'
                    : 'border-[#ffb4ab]/30 text-[#ffb4ab] bg-[#ffb4ab]/5'
                }`}>
                  {node.status}
                </span>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#c5c8b6]">
                <span>ROLE:</span>
                <span className="text-[#8f9282]">{node.role}</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#c5c8b6]">
                <span>LOCATION:</span>
                <span className="text-[#8f9282] truncate max-w-[150px]">{node.location}</span>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-[#c5c8b6]">
                <span>LATENCY:</span>
                <span className={node.latency && node.latency < 5 ? 'text-[#9ddf2e]' : 'text-[#c5c8b6]'}>
                  {node.latency !== null ? `${node.latency} ms` : '--'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
