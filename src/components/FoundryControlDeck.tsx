import React from 'react';
import { Play, ChevronRight } from 'lucide-react';

interface FoundryControlDeckProps {
  onRunBuild: () => void;
  onSelectCommand: (command: string) => void;
  activeCommand: string;
  isBuilding: boolean;
  buildSuccess: boolean;
}

export const FoundryControlDeck: React.FC<FoundryControlDeckProps> = ({
  onRunBuild,
  onSelectCommand,
  activeCommand,
  isBuilding,
  buildSuccess,
}) => {
  const commands = [
    { id: 'forge build', label: 'forge build' },
    { id: 'forge test', label: 'forge test' },
    { id: 'forge script', label: 'forge script' },
    { id: 'anvil', label: 'anvil --host 127.0.0.1' },
  ];

  return (
    <div className="rounded-lg bg-[#101114] border border-[#C0C0C5]/10 p-4 flex flex-col space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wider text-[#F5F5F5] uppercase">
            FOUNDRY CONTROL DECK
          </h2>
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#DEFF9A] bg-[#DEFF9A]/10 px-1.5 py-0.5 rounded-sm">
            Bun Sidecar
          </span>
        </div>
        <p className="text-xs text-[#777E86] mt-0.5 font-mono">
          Bun sidecar orchestration // sub-second forge loops
        </p>
      </div>

      {/* Commands Selection Grid */}
      <div className="grid grid-cols-2 gap-2">
        {commands.map((cmd) => (
          <button
            key={cmd.id}
            onClick={() => onSelectCommand(cmd.id)}
            className={`font-mono text-xs py-2 px-3 rounded-md text-left transition-all duration-200 border flex items-center justify-between group ${
              activeCommand === cmd.id
                ? 'border-[#DEFF9A]/60 bg-[#DEFF9A]/10 text-[#DEFF9A] shadow-[0_0_24px_rgba(222,255,154,0.08)]'
                : 'border-[#30343A] bg-[#0A0A0B] text-[#C0C0C5] hover:border-[#DEFF9A]/30 hover:text-[#DEFF9A]'
            }`}
          >
            <span className="truncate">{cmd.label}</span>
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
              activeCommand === cmd.id ? 'translate-x-0.5 text-[#DEFF9A]' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 text-[#777E86]'
            }`} />
          </button>
        ))}
      </div>

      {/* Execution Actions */}
      <div className="flex items-center space-x-3 pt-1">
        <button
          onClick={onRunBuild}
          disabled={isBuilding}
          className={`flex-1 flex items-center justify-center space-x-2 font-mono font-bold text-xs uppercase py-2.5 px-4 rounded-md tracking-wider transition-all duration-200 cursor-pointer shadow-lg ${
            isBuilding
              ? 'bg-[#15171B] border border-[#30343A] text-[#777E86] cursor-not-allowed'
              : 'bg-[#DEFF9A] text-black border border-transparent hover:bg-[#A3E635] active:scale-[0.98]'
          }`}
        >
          <Play className={`w-3.5 h-3.5 fill-current ${isBuilding ? 'animate-pulse' : ''}`} />
          <span>{isBuilding ? 'COMPILING...' : 'RUN BUILD'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#23262B] text-center font-mono">
        <div className="flex flex-col p-1.5 rounded bg-[#0A0A0B]/60 border border-[#23262B]">
          <span className="text-[10px] text-[#777E86] uppercase">last build</span>
          <span className={`text-xs font-semibold mt-0.5 transition-colors duration-300 ${
            buildSuccess ? 'text-[#DEFF9A]' : 'text-[#F5F5F5]'
          }`}>
            0.5s{buildSuccess && ' ✓'}
          </span>
        </div>
        <div className="flex flex-col p-1.5 rounded bg-[#0A0A0B]/60 border border-[#23262B]">
          <span className="text-[10px] text-[#777E86] uppercase">tests</span>
          <span className="text-xs text-[#DEFF9A] font-semibold mt-0.5">42/42</span>
        </div>
        <div className="flex flex-col p-1.5 rounded bg-[#0A0A0B]/60 border border-[#23262B]">
          <span className="text-[10px] text-[#777E86] uppercase">gas delta</span>
          <span className="text-xs text-[#FB7185] font-semibold mt-0.5">-8.2%</span>
        </div>
        <div className="flex flex-col p-1.5 rounded bg-[#0A0A0B]/60 border border-[#23262B]">
          <span className="text-[10px] text-[#777E86] uppercase">solc</span>
          <span className="text-xs text-[#7DD3FC] font-semibold mt-0.5">0.8.26</span>
        </div>
      </div>
    </div>
  );
};
