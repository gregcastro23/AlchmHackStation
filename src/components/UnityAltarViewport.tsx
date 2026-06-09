import React from 'react';
import { Sparkles } from 'lucide-react';

interface UnityAltarViewportProps {
  isCompiling: boolean;
  blockHeight: number;
}

export const UnityAltarViewport: React.FC<UnityAltarViewportProps> = ({ isCompiling, blockHeight }) => {
  return (
    <div className="rounded-lg bg-[#0D0F12] border border-[#30343A] p-4 flex flex-col h-full relative overflow-hidden group select-none">
      {/* Scanning effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_48%,rgba(222,255,154,0.03)_50%,transparent_52%)] bg-[length:100%_8px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#DEFF9A]/[0.015] to-transparent pointer-events-none" />
      
      {/* Scanline Sweep */}
      <div className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#DEFF9A]/15 to-transparent animate-scanline pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 tech-grid opacity-60 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10">
        <div>
          <h2 className="text-sm font-semibold tracking-wider text-[#F5F5F5] uppercase">
            UNITY WEBGL ALTAR
          </h2>
          <p className="text-xs text-[#777E86] font-mono">
            Cinematic state visualization // live trace render
          </p>
        </div>
        
        {/* Top-right badges */}
        <div className="flex space-x-2 font-mono text-[10px]">
          <span className="flex items-center space-x-1 border border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5 px-2 py-0.5 rounded-sm">
            <span className="w-1.5 h-1.5 bg-[#DEFF9A] rounded-full animate-ping" />
            <span>TX OK</span>
          </span>
          <span className="flex items-center space-x-1 border border-[#7DD3FC]/40 text-[#7DD3FC] bg-[#7DD3FC]/5 px-2 py-0.5 rounded-sm">
            <span>GAS NORMAL</span>
          </span>
          <span className="flex items-center space-x-1 border border-[#DEFF9A]/20 text-[#888888] bg-black/40 px-2 py-0.5 rounded-sm">
            <span>LIVE</span>
          </span>
        </div>
      </div>

      {/* Central Viewport Visualization Area */}
      <div className="flex-1 flex items-center justify-center relative my-4 min-h-[200px] border border-[#23262B] bg-[#050506]/40 rounded-md overflow-hidden">
        {/* Technical radar overlay circles */}
        <div className="absolute w-[280px] h-[280px] border border-[#30343A]/20 rounded-full" />
        <div className="absolute w-[200px] h-[200px] border border-[#DEFF9A]/10 rounded-full border-dashed" />
        <div className="absolute w-[120px] h-[120px] border border-[#7DD3FC]/10 rounded-full" />

        {/* Orbit Tracks */}
        <div className="absolute w-[240px] h-[240px] border border-transparent border-t-[#DEFF9A]/15 border-b-[#7DD3FC]/15 rounded-full animate-orbit-slow" />
        <div className="absolute w-[160px] h-[160px] border border-transparent border-l-[#DEFF9A]/20 border-r-[#7DD3FC]/20 rounded-full animate-orbit-fast" />

        {/* Diagonal Crosshair Rules */}
        <div className="absolute w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[#30343A]/30 to-transparent rotate-45" />
        <div className="absolute w-[300px] h-[1px] bg-gradient-to-r from-transparent via-[#30343A]/30 to-transparent -rotate-45" />

        {/* CENTRAL ALTAR ORB */}
        <div className="absolute w-20 h-20 rounded-full border border-[#DEFF9A] bg-[#DEFF9A]/10 flex flex-col items-center justify-center animate-pulse-slow z-20">
          <Sparkles className="w-5 h-5 text-[#DEFF9A] mb-0.5" />
          <span className="font-mono text-[11px] font-bold text-[#DEFF9A] tracking-widest">ALTAR</span>
        </div>

        {/* Connected Event Nodes */}
        {/* 1. block_trace (Top Left) */}
        <div className="absolute top-[15%] left-[18%] z-10 flex flex-col items-start bg-[#101114]/90 border border-[#30343A] p-1.5 rounded text-[10px] font-mono shadow-lg shadow-black/80 hover:border-[#7DD3FC]/50 transition-colors duration-200">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-[#7DD3FC] rounded-full animate-pulse" />
            <span className="text-[#F5F5F5] font-semibold">block_trace</span>
          </div>
          <span className="text-[#888888] mt-0.5">hash: 0x{blockHeight.toString(16)}</span>
        </div>
        {/* Line connection from top-left to central altar */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="28%" y1="23%" x2="40%" y2="42%" stroke="#7DD3FC" strokeWidth="1" strokeDasharray="3 3" />
        </svg>

        {/* 2. forge_deploy (Top Right) */}
        <div className="absolute top-[18%] right-[18%] z-10 flex flex-col items-start bg-[#101114]/90 border border-[#30343A] p-1.5 rounded text-[10px] font-mono shadow-lg shadow-black/80 hover:border-[#DEFF9A]/50 transition-colors duration-200">
          <div className="flex items-center space-x-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isCompiling ? 'bg-[#FDE68A] animate-ping' : 'bg-[#DEFF9A]'}`} />
            <span className="text-[#F5F5F5] font-semibold">forge_deploy</span>
          </div>
          <span className="text-[#888888] mt-0.5">{isCompiling ? 'compiling...' : '0x3f9a...8c2d'}</span>
        </div>
        {/* Line connection */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="72%" y1="26%" x2="60%" y2="42%" stroke="#DEFF9A" strokeWidth="1" />
        </svg>

        {/* 3. terminal_io (Bottom Left) */}
        <div className="absolute bottom-[18%] left-[16%] z-10 flex flex-col items-start bg-[#101114]/90 border border-[#30343A] p-1.5 rounded text-[10px] font-mono shadow-lg shadow-black/80 hover:border-[#DEFF9A]/50 transition-colors duration-200">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-[#DEFF9A] rounded-full" />
            <span className="text-[#F5F5F5] font-semibold">terminal_io</span>
          </div>
          <span className="text-[#888888] mt-0.5">Bun stdout syncd</span>
        </div>
        {/* Line connection */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="28%" y1="74%" x2="40%" y2="58%" stroke="#DEFF9A" strokeWidth="1" />
        </svg>

        {/* 4. gas_metrics (Bottom Right) */}
        <div className="absolute bottom-[15%] right-[16%] z-10 flex flex-col items-start bg-[#101114]/90 border border-[#30343A] p-1.5 rounded text-[10px] font-mono shadow-lg shadow-black/80 hover:border-[#7DD3FC]/50 transition-colors duration-200">
          <div className="flex items-center space-x-1.5">
            <div className="w-1.5 h-1.5 bg-[#7DD3FC] rounded-full" />
            <span className="text-[#F5F5F5] font-semibold">gas_metrics</span>
          </div>
          <span className="text-[#888888] mt-0.5">delta: -8.2%</span>
        </div>
        {/* Line connection */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40">
          <line x1="72%" y1="77%" x2="60%" y2="58%" stroke="#7DD3FC" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* Signal Grammar / Legend */}
      <div className="border-t border-[#23262B] pt-3 z-10 font-mono text-[11px]">
        <span className="text-[#888888] uppercase tracking-wider block mb-2 text-[10px]">
          SIGNAL GRAMMAR
        </span>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-1.5 bg-[#0D0F12] border border-[#30343A] rounded-sm block" />
            <span className="text-[#C0C0C5] text-[10px] truncate">Obsidian depth → state logs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-1.5 bg-[#DEFF9A]/20 border border-[#DEFF9A] rounded-sm block" />
            <span className="text-[#C0C0C5] text-[10px] truncate">Acid traces → successful txs</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-1.5 bg-[#7DD3FC]/20 border border-[#7DD3FC] rounded-sm block" />
            <span className="text-[#C0C0C5] text-[10px] truncate">PBR heatmaps → gas density</span>
          </div>
        </div>
      </div>
    </div>
  );
};
