import React, { useState } from 'react';
import { Sparkles, Play, FileCheck, Code2 } from 'lucide-react';
import { loadKey, makeClient, DEFAULT_MODEL } from '../lib/overmind';

interface ClaudeDesignBridgeProps {
  framework: string;
  cssEngine: string;
  onCommitLog: (text: string, type?: 'info' | 'success' | 'warning' | 'default' | 'error') => void;
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

  const handleGenerate = async () => {
    const key = loadKey();
    if (!key) {
      onCommitLog('Claude Design: No Anthropic key found in local vault. Connect Overmind first.', 'error');
      return;
    }

    setIsCompiling(true);
    setLogs(['[Claude] Fetching Stitch visual frame nodes...', '[Claude] Ingesting layout parameters and color tokens...']);
    
    try {
      const client = await makeClient(key);
      const stream = await client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: 2000,
        temperature: 0,
        system: `You are an expert ${framework} developer utilizing ${cssEngine}. You must convert the provided JSON visual schema into a fully functional, highly polished React component. Return ONLY the raw code inside a markdown block. Use lucide-react for icons. Adhere strictly to the "AlchmHackStation" design language (sharp corners, acid green accents, tech grid borders). The component name should be "GeneratedComponent".`,
        messages: [{ role: 'user', content: activeSchema }],
        stream: true,
      });

      setLogs((prev) => [
        ...prev,
        `[Claude] Building component for target framework: ${framework}`,
        `[Claude] Mapping design variables using stylesheet: ${cssEngine}`,
        '[Claude] Streaming type-safe React properties...',
      ]);
      
      let fullText = '';
      setCompiledCode('');
      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text;
          setCompiledCode(fullText.replace(/^```tsx?\n?/, '').replace(/```$/, ''));
        }
      }

      setLogs((prev) => [...prev, '[Claude] Component blueprint generated successfully.']);
      onCommitLog(`Claude Design: Compiled visual frame deck to a React component for ${framework}.`, 'success');
    } catch (err: any) {
      onCommitLog(`Claude Design: Compilation failed — ${err.message}`, 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleCommit = async () => {
    onCommitLog('Claude Design: Writing component src/components/GeneratedComponent.tsx to workspace...', 'info');
    try {
      const res = await fetch('/api/fs', {
        method: 'POST',
        body: JSON.stringify({ filePath: 'src/components/GeneratedComponent.tsx', content: compiledCode })
      });
      if (!res.ok) throw new Error('Failed to write file via local API');
      onCommitLog('✓ File src/components/GeneratedComponent.tsx committed successfully to disk.', 'success');
      onCommitLog('Vite hot-reloading active target modules...', 'success');
    } catch (err: any) {
      onCommitLog(`Claude Design: File write failed — ${err.message}`, 'error');
    }
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
