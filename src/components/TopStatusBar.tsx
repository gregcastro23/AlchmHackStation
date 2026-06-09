import React from 'react';
import { Cpu, Eye, Database, Hammer, RefreshCw, Network, Clock, Share2, Bot, Wand2, Gauge } from 'lucide-react';

interface TopStatusBarProps {
  foundryState: 'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR';
  blockHeight: number;
  onExport: () => void;
  onExportToClaude: () => void;
  onExportToCodex: () => void;
  missionReadiness: number;
  framework: string;
  cssEngine: string;
  database: string;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  foundryState,
  blockHeight,
  onExport,
  onExportToClaude,
  onExportToCodex,
  missionReadiness,
  framework,
  cssEngine,
  database,
}) => {
  return (
    <header className="h-[64px] min-h-[64px] bg-[#0A0A0B]/95 border-b border-[#23262B] px-6 flex items-center justify-between select-none z-50">
      {/* Left Identity */}
      <div className="flex items-center space-x-2">
        <div className="w-2.5 h-2.5 bg-[#DEFF9A] rounded-full animate-pulse glow-acid" />
        <h1 className="text-lg font-bold tracking-wider uppercase">
          <span className="text-[#DEFF9A] font-sans">Alchm</span>
          <span className="text-[#F5F5F5] font-sans">HackStation</span>
        </h1>
      </div>

      {/* Center Status Chips */}
      <div className="hidden md:flex items-center space-x-3 text-[11px] font-mono tracking-wider">
        <div className="flex items-center space-x-1.5 border border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5 px-2.5 py-1 rounded-sm">
          <Cpu className="w-3 h-3 text-[#DEFF9A]" />
          <span>{framework.toUpperCase()} CORE</span>
        </div>
        <div className="flex items-center space-x-1.5 border border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5 px-2.5 py-1 rounded-sm">
          <Eye className="w-3 h-3 text-[#DEFF9A]" />
          <span>{cssEngine.toUpperCase()} SYNC</span>
        </div>
        <div className="flex items-center space-x-1.5 border border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5 px-2.5 py-1 rounded-sm relative">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#DEFF9A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#DEFF9A]"></span>
          </span>
          <Database className="w-3 h-3 text-[#DEFF9A]" />
          <span>{database.toUpperCase()} LIVE</span>
        </div>
        <div className={`flex items-center space-x-1.5 border px-2.5 py-1 rounded-sm transition-all duration-300 ${
          foundryState === 'BUILDING' 
            ? 'border-[#FDE68A]/40 text-[#FDE68A] bg-[#FDE68A]/5' 
            : foundryState === 'ERROR'
            ? 'border-[#FB7185]/40 text-[#FB7185] bg-[#FB7185]/5'
            : 'border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5'
        }`}>
          <Hammer className={`w-3 h-3 ${foundryState === 'BUILDING' ? 'animate-spin' : ''} ${
            foundryState === 'BUILDING' ? 'text-[#FDE68A]' : foundryState === 'ERROR' ? 'text-[#FB7185]' : 'text-[#DEFF9A]'
          }`} />
          <span>FOUNDRY {foundryState}</span>
        </div>
        <div className="flex items-center space-x-1.5 border border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5 px-2.5 py-1 rounded-sm">
          <RefreshCw className="w-3 h-3 text-[#DEFF9A]" />
          <span>VERCEL SYNCED</span>
        </div>
        <div className="flex items-center space-x-1.5 border border-[#ffb020]/40 text-[#ffb020] bg-[#ffb020]/5 px-2.5 py-1 rounded-sm">
          <Gauge className="w-3 h-3 text-[#ffb020]" />
          <span>DEMO {missionReadiness}%</span>
        </div>
      </div>

      {/* Right Session Area */}
      <div className="flex items-center space-x-3 text-[12px] font-mono text-[#888888]">
        <button
          onClick={onExportToClaude}
          className="flex items-center space-x-1.5 border border-[#7dd3fc]/40 text-[#7dd3fc] hover:bg-[#7dd3fc]/10 px-3 py-1 rounded-sm text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-[0.97] hover:border-[#7dd3fc]/80 shadow-[0_0_12px_rgba(125,211,252,0.05)]"
        >
          <Bot className="w-3.5 h-3.5 text-[#7dd3fc]" />
          <span>EXPORT TO CLAUDE</span>
        </button>
        <button
          onClick={onExport}
          className="flex items-center space-x-1.5 border border-[#DEFF9A]/40 text-[#DEFF9A] hover:bg-[#DEFF9A]/10 px-3 py-1 rounded-sm text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-[0.97] hover:border-[#DEFF9A]/80 shadow-[0_0_12px_rgba(157,223,46,0.05)]"
        >
          <Share2 className="w-3.5 h-3.5 text-[#DEFF9A]" />
          <span>EXPORT TO AGY</span>
        </button>
        <button
          onClick={onExportToCodex}
          className="flex items-center space-x-1.5 border border-[#ffb020]/40 text-[#ffb020] hover:bg-[#ffb020]/10 px-3 py-1 rounded-sm text-[11px] font-mono transition-all duration-150 cursor-pointer active:scale-[0.97] hover:border-[#ffb020]/80 shadow-[0_0_12px_rgba(255,176,32,0.05)]"
        >
          <Wand2 className="w-3.5 h-3.5 text-[#ffb020]" />
          <span>EXPORT TO CODEX</span>
        </button>
        <div className="flex items-center space-x-2 border border-[#23262B] bg-[#101114] px-3 py-1 rounded-sm text-[#C0C0C5]">
          <Network className="w-3.5 h-3.5 text-[#DEFF9A]" />
          <span>ETHGLOBAL NY // LOCAL</span>
        </div>
        <div className="hidden lg:flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-[#525861]" />
          <span>BLOCK: <span className="text-[#F5F5F5]">{blockHeight}</span></span>
        </div>
        <div className="w-2.5 h-2.5 bg-[#DEFF9A] rounded-full animate-ping opacity-60" />
      </div>
    </header>
  );
};
