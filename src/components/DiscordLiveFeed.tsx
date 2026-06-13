import React from 'react';
import { Radio, MessageSquare } from 'lucide-react';

interface DiscordLiveFeedProps {
  onCommitLog?: (text: string, type?: 'success' | 'info' | 'warning' | 'error' | 'default') => void;
}

export const DiscordLiveFeed: React.FC<DiscordLiveFeedProps> = () => {
  return (
    <div className="flex flex-col flex-1 border border-[#44483a] bg-[#0d0f09] min-h-[500px] h-full select-none">
      {/* Feed Header */}
      <div className="border-b border-[#44483a] bg-[#12140e] p-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-4.5 w-4.5 text-[#9ddf2e]" />
            <span className="font-mono text-[#9ddf2e] text-lg font-bold">#</span>
            <span className="font-mono font-bold text-sm text-[#e3e3d8]">ethglobal-nyc-2206</span>
          </div>
          <p className="text-[10px] text-[#8f9282] mt-0.5">
            Real-world Discord channel connected via Widgetbot integration. Guild: 554623348622098432 // Channel: 1503742997693599814
          </p>
        </div>
        <div className="flex items-center gap-2 border border-[#44483a] bg-[#0d0f09] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#c5c8b6]">
          <Radio className="h-3 w-3 text-[#9ddf2e] animate-pulse" />
          <span>Widget Live</span>
        </div>
      </div>

      {/* Chat Stream (Widgetbot Iframe) */}
      <div className="flex-1 min-h-0 bg-[#07080a] relative">
        <iframe
          title="Discord Widget"
          src="https://e.widgetbot.io/channels/554623348622098432/1503742997693599814"
          className="absolute inset-0 w-full h-full border-0 bg-[#07080a]"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
};
