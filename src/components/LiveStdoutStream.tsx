import React, { useState, useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

export interface LogLine {
  timestamp: string;
  text: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'default';
}

interface LiveStdoutStreamProps {
  logs: LogLine[];
  onCommandSubmit: (cmd: string) => void;
}

export const LiveStdoutStream: React.FC<LiveStdoutStreamProps> = ({ logs, onCommandSubmit }) => {
  const [inputValue, setInputValue] = useState('');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal whenever logs change
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onCommandSubmit(inputValue.trim());
    setInputValue('');
  };

  const getTagColor = (type: LogLine['type']) => {
    switch (type) {
      case 'success':
        return 'text-[#DEFF9A]';
      case 'info':
        return 'text-[#7DD3FC]';
      case 'warning':
        return 'text-[#FDE68A]';
      case 'error':
        return 'text-[#FB7185]';
      default:
        return 'text-[#C0C0C5]';
    }
  };

  return (
    <div className="rounded-lg bg-[#0A0A0B]/80 border border-[#30343A] p-4 flex flex-col h-full font-mono text-xs overflow-hidden select-text">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#23262B] pb-2 mb-2 select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-[#DEFF9A]" />
          <h2 className="text-xs font-semibold tracking-wider text-[#F5F5F5] uppercase">
            LIVE STDOUT STREAM
          </h2>
        </div>
        <span className="text-[10px] text-[#7DD3FC]">
          on_terminal_io() // Bun sidecar
        </span>
      </div>

      {/* Terminal Output stream */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1.5 pr-1 mb-2 max-h-[160px] min-h-[100px]">
        {logs.map((log, idx) => (
          <div key={idx} className="flex items-start leading-relaxed">
            {/* Timestamp */}
            <span className="text-[#525861] mr-2 select-none">[{log.timestamp}]</span>
            {/* Text content with custom coloring */}
            <span className={`${getTagColor(log.type)} whitespace-pre-wrap flex-1 break-all`}>
              {log.text}
            </span>
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Strip */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center border-t border-[#23262B] pt-2 mt-auto select-none"
      >
        <span className="text-[#DEFF9A] mr-2 shrink-0 font-semibold">
          operator@alchm ~ %
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="forge test --gas-report"
          className="flex-1 bg-transparent text-[#F5F5F5] outline-none border-none placeholder-[#525861] focus:ring-0 p-0 text-xs font-mono"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
        {/* Blinking Cursor Indicator */}
        <span className="w-1.5 h-3.5 bg-[#DEFF9A] animate-pulse shrink-0 ml-1" />
      </form>
    </div>
  );
};
