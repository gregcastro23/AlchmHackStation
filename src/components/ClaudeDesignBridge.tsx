import React, { useState } from 'react';
import { Sparkles, Play, FileCheck, Code2 } from 'lucide-react';

interface ClaudeDesignBridgeProps {
  framework: string;
  cssEngine: string;
  onCommitLog: (text: string, type?: 'info' | 'success' | 'warning' | 'default') => void;
}

export const ClaudeDesignBridge: React.FC<ClaudeDesignBridgeProps> = ({
  framework,
  cssEngine,
  onCommitLog,
}) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [activeSchema, setActiveSchema] = useState<string>(`{
  "nodeId": "altar_deck_frame",
  "type": "CONTAINER",
  "styles": {
    "background": "surface-dim",
    "border": "1px outline-variant",
    "padding": "panel-padding",
    "corners": "sharp"
  },
  "children": [
    { "type": "HEADER", "label": "Foundry Control Deck" },
    { "type": "GRID", "columns": 4, "gap": "unit" },
    { "type": "STATUS_FEED", "source": "spacetime" }
  ]
}`);

  const [compiledCode, setCompiledCode] = useState<string>(`// Code not compiled yet.
// Click "GENERATE COMPONENT BLUEPRINT" to run Claude Design Compiler.`);

  const [logs, setLogs] = useState<string[]>([]);

  const handleGenerate = () => {
    setIsCompiling(true);
    setLogs(['[Claude] Fetching Stitch visual frame nodes...', '[Claude] Ingesting layout parameters and color tokens...']);
    
    setTimeout(() => {
      setLogs((prev) => [
        ...prev,
        `[Claude] Building component for target framework: ${framework}`,
        `[Claude] Mapping design variables using stylesheet: ${cssEngine}`,
        '[Claude] Generating type-safe React properties...',
      ]);
      
      setTimeout(() => {
        setLogs((prev) => [...prev, '[Claude] Component blueprint generated successfully.']);
        setCompiledCode(`import React from 'react';
import { Play } from 'lucide-react';

// Compiled via Claude Design Bridge
export const AltarControlDeck: React.FC = () => {
  return (
    <div className="bg-[#12140e] border border-[#44483a] p-5 rounded-none flex flex-col space-y-4">
      <header className="border-b border-[#44483a] pb-2 flex justify-between items-center">
        <h2 className="font-mono text-[13px] text-[#e3e3d8] uppercase tracking-wider font-bold">
          Altar Control System
        </h2>
        <span className="w-2 h-2 rounded-full bg-[#9ddf2e] animate-pulse" />
      </header>
      <div className="grid grid-cols-4 gap-1">
        <button className="bg-[#9ddf2e]/10 border border-[#9ddf2e] text-[#9ddf2e] font-mono py-2 text-[11px] uppercase tracking-widest font-bold">
          COMPILE
        </button>
      </div>
    </div>
  );
};`);
        setIsCompiling(false);
        onCommitLog(`Claude Design: Compiled visual frame deck to a React component for ${framework}.`, 'success');
      }, 900);
    }, 600);
  };

  const handleCommit = () => {
    onCommitLog('Claude Design: Writing component src/components/AltarControlDeck.tsx to workspace...', 'info');
    setTimeout(() => {
      onCommitLog('✓ File src/components/AltarControlDeck.tsx committed successfully to disk.', 'success');
      onCommitLog('Vite hot-reloading active target modules...', 'success');
    }, 600);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full min-h-0 select-none">
      {/* Visual Frame Schema editor panel */}
      <div className="bg-[#12140e] border border-[#44483a] p-5 flex flex-col min-h-0">
        <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-[#9ddf2e] glow-acid" />
            <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
              STITCH VISUAL SCHEMAS
            </h2>
          </div>
          <span className="font-mono text-[9px] text-[#8f9282] uppercase">source: figma_bridge</span>
        </header>

        <div className="flex-1 flex flex-col space-y-3 min-h-0">
          <textarea
            value={activeSchema}
            onChange={(e) => setActiveSchema(e.target.value)}
            className="flex-1 bg-[#0d0f09] border border-[#44483a] p-4 font-mono text-[11px] text-[#c5c8b6] focus:outline-none resize-none custom-scrollbar leading-relaxed"
          />
          
          <div className="flex space-x-3 shrink-0">
            <button
              onClick={handleGenerate}
              disabled={isCompiling}
              className="flex-1 py-2.5 border border-[#9ddf2e] text-[#9ddf2e] hover:bg-[#9ddf2e]/10 font-mono text-[11px] uppercase tracking-wide font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-all duration-150 active:scale-[0.98]"
            >
              <Play className={`w-3.5 h-3.5 ${isCompiling ? 'animate-spin' : ''}`} />
              <span>{isCompiling ? 'COMPILING BLUEPRINTS...' : 'COMPILE FIGMA TO REACT'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compiled Code Diff Viewer panel */}
      <div className="bg-[#12140e] border border-[#44483a] p-5 flex flex-col justify-between min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center shrink-0">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4.5 h-4.5 text-[#9ddf2e]" />
              <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
                CLAUDE SYNTHESIZED CODE
              </h2>
            </div>
            <span className="font-mono text-[9px] text-[#8f9282] uppercase">target: {framework}</span>
          </header>

          {/* Code block output */}
          <pre className="flex-1 bg-[#0d0f09] border border-[#44483a] p-4 font-mono text-[11px] text-[#c5c8b6] overflow-auto custom-scrollbar leading-relaxed mb-4 min-h-[150px]">
            {compiledCode}
          </pre>
        </div>

        {/* Action Commit panel */}
        <div className="border-t border-[#44483a]/40 pt-4 space-y-3 shrink-0">
          {logs.length > 0 && (
            <div className="bg-[#0d0f09] border border-[#44483a] p-2.5 font-mono text-[9px] text-[#8f9282] max-h-20 overflow-y-auto custom-scrollbar flex flex-col space-y-0.5">
              {logs.map((log, index) => (
                <div key={index} className="truncate">
                  {log}
                </div>
              ))}
            </div>
          )}
          
          <button
            onClick={handleCommit}
            disabled={compiledCode.includes('not compiled')}
            className="w-full py-2.5 border border-[#9ddf2e] bg-[#9ddf2e] text-[#12140e] hover:bg-[#83c300] hover:border-[#83c300] disabled:opacity-40 disabled:cursor-not-allowed font-mono text-[11px] uppercase tracking-widest font-bold transition-all duration-150 cursor-pointer active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <FileCheck className="w-4 h-4 text-[#12140e]" />
            <span>COMMIT COMPONENT TO WORKSPACE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
