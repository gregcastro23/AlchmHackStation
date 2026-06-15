import React from 'react';

interface TopStatusBarProps {
  foundryState: 'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR';
  blockHeight: number;
  onExport: () => void;
  onExportToClaude: () => void;
  onExportToCodex: () => void;
  missionReadiness: number;
  budgetUtilization: number;
  language: string;
  framework: string;
  cssEngine: string;
  database: string;
  securityReady: boolean;
  securityBusy: boolean;
  onLockSpace: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  foundryState,
  blockHeight,
  onExport,
  onExportToClaude,
  onExportToCodex,
  missionReadiness,
  budgetUtilization,
  language,
  framework,
  cssEngine,
  database,
  securityReady,
  securityBusy,
  onLockSpace,
}) => {
  return (
    <header className="sticky top-0 h-[64px] z-50 bg-surface/80 dark:bg-surface/80 backdrop-blur-xl border-b border-outline-variant/40 shadow-[0_0_15px_rgba(163,230,53,0.1)] flex justify-between items-center px-lg w-full shrink-0">
      
      {/* Left Logo / Identity */}
      <div className="flex items-center gap-md">
        <span className="material-symbols-outlined text-primary text-[24px]">terminal</span>
        <h1 className="font-headline-lg text-headline-lg tracking-tighter text-primary italic uppercase select-none">
          ALCHMHACKSTATION
        </h1>
      </div>

      {/* Center status indicator badges */}
      <div className="hidden xl:flex items-center gap-md font-mono text-[9px] uppercase select-none">
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium">
          LANG: <span className="text-primary font-bold">{language.split(' ')[0]}</span>
        </span>
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium">
          CORE: <span className="text-secondary font-bold">{framework.split(' ')[0]}</span>
        </span>
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium">
          STYLE: <span className="text-primary font-bold">{cssEngine}</span>
        </span>
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium">
          DB: <span className="text-tertiary-container font-bold">{database}</span>
        </span>
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${foundryState === 'BUILDING' ? 'bg-[#ffcb56] animate-pulse' : foundryState === 'ERROR' ? 'bg-error' : 'bg-primary'}`} />
          BUILD: <span className="text-on-surface font-bold">{foundryState}</span>
        </span>
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium">
          DEMO: <span className="text-secondary font-bold">{missionReadiness}%</span>
        </span>
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium">
          BUDGET: <span className="text-tertiary-container font-bold">{budgetUtilization}%</span>
        </span>
        <span className="border border-outline-variant/40 bg-black/40 px-2 py-1 text-on-surface-variant font-medium">
          BLOCK: <span className="text-primary font-bold">{blockHeight}</span>
        </span>
      </div>

      {/* Right control deck buttons */}
      <div className="flex items-center gap-md">
        <div className="hidden md:flex gap-sm">
          <button
            onClick={onExportToClaude}
            title="Export session context to Claude Code"
            className="border border-secondary/40 text-secondary hover:bg-secondary/10 px-3 py-1 text-[10px] font-label-caps uppercase transition-colors cursor-pointer active:scale-95"
          >
            CLAUDE_SYNC
          </button>
          <button
            onClick={onExport}
            title="Export session to Antigravity SDK agent"
            className="border border-primary/40 text-primary hover:bg-primary/10 px-3 py-1 text-[10px] font-label-caps uppercase transition-colors cursor-pointer active:scale-95"
          >
            AGY_EXPORT
          </button>
          <button
            onClick={onExportToCodex}
            title="Export workspace blueprint to Codex"
            className="border border-tertiary-container/40 text-tertiary-container hover:bg-tertiary-container/10 px-3 py-1 text-[10px] font-label-caps uppercase transition-colors cursor-pointer active:scale-95"
          >
            CODEX_SYNC
          </button>
        </div>

        <button
          onClick={onLockSpace}
          disabled={securityBusy}
          className="bg-primary text-on-primary font-label-caps text-label-caps px-md py-xs flex items-center gap-xs active:scale-95 duration-75 cursor-pointer disabled:opacity-50"
        >
          <span className="material-symbols-outlined text-[16px]">
            {securityReady ? 'lock' : 'lock_open'}
          </span>
          <span>{securityBusy ? 'ARMING...' : securityReady ? 'LOCK' : 'ARM_LOCK'}</span>
        </button>
      </div>

    </header>
  );
};
