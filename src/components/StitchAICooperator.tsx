import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, Wand2 } from 'lucide-react';

interface AICooperatorLine {
  sender: 'system' | 'ai' | 'user';
  text: string;
}

export const StitchAICooperator: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [feed, setFeed] = useState<AICooperatorLine[]>([
    { sender: 'system', text: 'Initializing design-to-code bridge interface...' },
    { sender: 'ai', text: 'Stitch AI Co-Operator active. Synchronized with obsidian_command/DESIGN.md. System tokens parsed successfully.' },
    { sender: 'ai', text: 'Ready to bridge Figma frames and tailwind configuration specs. Enter stitch commands below.' },
  ]);

  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [feed]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setFeed((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputVal('');

    setTimeout(() => {
      const clean = userText.toLowerCase();
      if (clean === 'help') {
        setFeed((prev) => [
          ...prev,
          { sender: 'ai', text: 'Available Stitch AI queries:' },
          { sender: 'ai', text: '  - "stitch sync" : Triggers Figma-to-Forge compiler reconciliation.' },
          { sender: 'ai', text: '  - "stitch lint" : Lints DOM tree for obsidian color compliance.' },
          { sender: 'ai', text: '  - "stitch tokens" : Prints currently imported DESIGN.md variables.' },
          { sender: 'ai', text: '  - "clear" : Flushes active feed history.' },
        ]);
      } else if (clean === 'stitch sync') {
        setFeed((prev) => [
          ...prev,
          { sender: 'system', text: 'Reconciling design mappings...' },
          { sender: 'ai', text: '✓ 12 components mapped successfully: ControlDeck, ReducerFeed, SyncModule, NavigationDrawer...' },
          { sender: 'ai', text: '✓ Unified spacing scale: 4px base units verified across grid layouts.' },
          { sender: 'ai', text: 'Design paths synced. All styling variables compiled to tailwind classes.' },
        ]);
      } else if (clean === 'stitch lint') {
        setFeed((prev) => [
          ...prev,
          { sender: 'system', text: 'Lifting color & border-radius metrics...' },
          { sender: 'ai', text: '✓ Shape Test: 100% 0px border-radius compliance detected. All edges are sharp.' },
          { sender: 'ai', text: '✓ Color Test: Primary (#ffffff), Secondary (#9ddf2e), and Surface (#12140e) match perfectly.' },
          { sender: 'ai', text: 'Linting status: SECURE. No design deviation warnings generated.' },
        ]);
      } else if (clean === 'stitch tokens') {
        setFeed((prev) => [
          ...prev,
          { sender: 'ai', text: 'Active Design System Properties:' },
          { sender: 'ai', text: '  --color-surface: #12140e (Obsidian Dark)' },
          { sender: 'ai', text: '  --color-secondary: #9ddf2e (Acid Green)' },
          { sender: 'ai', text: '  --font-sans: Hanken Grotesk' },
          { sender: 'ai', text: '  --font-mono: JetBrains Mono' },
          { sender: 'ai', text: '  --radius-*: 0px (Precision Sharp Shape)' },
        ]);
      } else if (clean === 'clear') {
        setFeed([]);
      } else {
        setFeed((prev) => [
          ...prev,
          { sender: 'system', text: 'Generating design model diffs for query...' },
          { sender: 'ai', text: `Stitch AI completed synthesis loop for prompt: "${userText}". Mapped changes to tailwind templates.` },
        ]);
      }
    }, 350);
  };

  return (
    <section className="bg-[#12140e] border border-[#44483a] p-5 flex flex-col h-full relative overflow-hidden select-none">
      {/* Visual Overlay Scanline */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,20,14,0)_50%,rgba(18,20,14,0.15)_50%)] bg-[length:100%_4px] opacity-15 z-0" />
      
      {/* Card Header */}
      <header className="border-b border-[#44483a] pb-3.5 mb-4 flex justify-between items-center z-10 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-[#9ddf2e] glow-acid" />
            <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#9ddf2e] font-bold">
              STITCH AI CO-OPERATOR
            </h2>
          </div>
          <p className="font-mono text-[10px] text-[#8f9282] mt-0.5">
            Design-to-code bridge // Latent space orchestration
          </p>
        </div>
        <div className="flex items-center space-x-2 bg-[#9ddf2e]/10 px-2 py-0.5 border border-[#9ddf2e]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#9ddf2e] animate-pulse" />
          <span className="font-mono text-[9px] text-[#9ddf2e] font-bold tracking-wider">LIVE</span>
        </div>
      </header>

      {/* Main logs terminal */}
      <div className="flex-1 bg-[#0d0f09] border border-[#44483a] p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col space-y-1.5 z-10 min-h-0">
        {feed.map((line, index) => (
          <div key={index} className="flex items-start space-x-2 leading-relaxed">
            {line.sender === 'user' && (
              <>
                <span className="text-[#9ddf2e] font-bold shrink-0">OPERATOR &gt;</span>
                <span className="text-[#e3e3d8]">{line.text}</span>
              </>
            )}
            {line.sender === 'ai' && (
              <>
                <span className="text-[#9ddf2e] font-bold shrink-0">[AI]</span>
                <span className="text-[#c5c8b6] whitespace-pre-wrap">{line.text}</span>
              </>
            )}
            {line.sender === 'system' && (
              <>
                <span className="text-[#8f9282] font-bold shrink-0">[SYS]</span>
                <span className="text-[#8f9282] italic">{line.text}</span>
              </>
            )}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Interactive Command Prompt Line */}
      <form onSubmit={handleSubmit} className="mt-4 flex items-center space-x-2 border border-[#44483a] bg-[#1f201a] p-2 z-10 shrink-0">
        <span className="font-mono text-[11px] text-[#9ddf2e] font-bold shrink-0 tracking-wider">
          STITCH_COMMAND &gt;
        </span>
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Type stitch query (e.g. 'help', 'stitch sync')..."
          className="flex-1 bg-transparent text-[#e3e3d8] font-mono text-[11px] focus:outline-none placeholder-[#8f9282]/60"
        />
        <button type="submit" className="text-[#9ddf2e] hover:text-white transition-colors cursor-pointer p-0.5">
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>
    </section>
  );
};
