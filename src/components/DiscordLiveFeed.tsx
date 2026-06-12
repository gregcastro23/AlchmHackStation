import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Users, Settings, Radio, Send, Server, Wifi, Volume2, VolumeX } from 'lucide-react';

interface DiscordLiveFeedProps {
  onCommitLog?: (text: string, type?: 'success' | 'info' | 'warning' | 'error' | 'default') => void;
}

interface Message {
  id: string;
  author: string;
  avatarColor: string;
  content: string;
  timestamp: string;
  isStaff?: boolean;
  isMentor?: boolean;
}

const DEFAULT_SIM_MESSAGES: Record<string, Message[]> = {
  announcements: [
    { id: '1', author: 'ETHGlobal Staff', avatarColor: '#DEFF9A', content: 'Welcome to ETHGlobal New York 2026! 🚀 The hacking window is officially open!', timestamp: '10:00 AM', isStaff: true },
    { id: '2', author: 'Base Team', avatarColor: '#7DD3FC', content: 'Join us for the Base Builder workshop in Room A at 2:00 PM to learn about gasless transactions.', timestamp: '11:15 AM', isStaff: true },
    { id: '3', author: 'ETHGlobal Staff', avatarColor: '#DEFF9A', content: '🍕 Lunch is now being served in the main dining hall. Make sure to scan your hacker badge.', timestamp: '12:05 PM', isStaff: true },
  ],
  mentorship: [
    { id: '1', author: 'alex_dev', avatarColor: '#C0C0C5', content: 'Does anyone have experience debugging Tauri v2 webview crashes on macOS?', timestamp: '12:30 PM' },
    { id: '2', author: 'm5_hacker', avatarColor: '#888888', content: 'Need a hand with a Solidity signature verification bug. Table 42.', timestamp: '12:34 PM' },
    { id: '3', author: 'SolidityMentor', avatarColor: '#DEFF9A', content: 'On my way to Table 42 now! Look out for a blue hoodie.', timestamp: '12:38 PM', isMentor: true },
  ],
  'team-formation': [
    { id: '1', author: 'crypto_charles', avatarColor: '#ffb020', content: 'Frontend developer looking to join a project building on SpaceTimeDB. Experienced with React/Tailwind.', timestamp: '10:30 AM' },
    { id: '2', author: 'elena_designer', avatarColor: '#c4b5fd', content: 'UI/UX Designer here! Looking for a Solidity-focused team. I have Figma wireframes ready.', timestamp: '11:02 AM' },
    { id: '3', author: 'dan_builds', avatarColor: '#7dd3fc', content: '@elena_designer we have a Solidity backend going and need design help! Ping me.', timestamp: '11:10 AM' },
  ],
  'general-chat': [
    { id: '1', author: 'zk_pioneer', avatarColor: '#fb7185', content: 'The coffee setup at this venue is next level. ☕️', timestamp: '10:05 AM' },
    { id: '2', author: 'vitalik_fan', avatarColor: '#DEFF9A', content: 'LFG! Happy hacking everyone. May the gas fees be ever in your favor.', timestamp: '10:15 AM' },
    { id: '3', author: 'block_jockey', avatarColor: '#C0C0C5', content: 'Anyone playing the playlist in the lounge? Absolute vibes.', timestamp: '11:45 AM' },
  ],
};

const SIM_INCOMING: Record<string, Omit<Message, 'id' | 'timestamp'>[]> = {
  announcements: [
    { author: 'ETHGlobal Staff', avatarColor: '#DEFF9A', content: '⚠️ Reminder: Submission deadline is Sunday, June 14 at 9:00 AM EDT. No late submittals accepted.', isStaff: true },
    { author: 'Arbitrum Team', avatarColor: '#7DD3FC', content: 'Arbitrum support mentors are now active at Booth 3. Bring your L2 deployment questions!', isStaff: true },
    { author: 'ETHGlobal Staff', avatarColor: '#DEFF9A', content: '☕️ Midnight snacks and espresso bar will open in the hacker lounge at 12:00 AM.', isStaff: true },
  ],
  mentorship: [
    { author: 'lisa_contracts', avatarColor: '#ffb020', content: 'Is there a mentor available to review a flash loan helper contract for reentrancy? Table 12.' },
    { author: 'TauriMentor', avatarColor: '#DEFF9A', content: '@alex_dev I can help with that Tauri crash, meet me by the main tech support desk.', isMentor: true },
    { author: 'block_jockey', avatarColor: '#C0C0C5', content: 'How do I resolve a provider mismatch error with wagmi and WalletConnect?' },
  ],
  'team-formation': [
    { author: 'web3_nomad', avatarColor: '#fb7185', content: 'Solo Solidity developer looking to partner up. Interested in gaming or DeFi tracks.' },
    { author: 'grace_k', avatarColor: '#c4b5fd', content: 'AI engineer experienced with LLM agent loops. Wanting to build an agentic web3 tool.' },
  ],
  'general-chat': [
    { author: 'pizza_lover', avatarColor: '#888888', content: 'Is the vegetarian pizza gone already? 😭' },
    { author: 'dev_ops_guy', avatarColor: '#DEFF9A', content: 'T-minus 20 hours to deadline. We got this!' },
    { author: 'zk_pioneer', avatarColor: '#fb7185', content: 'Just compiled my first Rust WASM module in 200ms. Bun is fast.' },
  ],
};

export const DiscordLiveFeed: React.FC<DiscordLiveFeedProps> = ({ onCommitLog }) => {
  const [activeChannel, setActiveChannel] = useState<string>('announcements');
  const [messages, setMessages] = useState<Record<string, Message[]>>(DEFAULT_SIM_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [hackerCount, setHackerCount] = useState(1420);
  const [messageRate, setMessageRate] = useState(24);
  const [ping, setPing] = useState(45);

  // Custom Integration settings
  const [customGuildId, setCustomGuildId] = useState('');
  const [customChannelId, setCustomChannelId] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const log = (text: string, type: 'success' | 'info' | 'warning' | 'error' | 'default' = 'info') => {
    onCommitLog?.(text, type);
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChannel, isConnected]);

  // Simulate stats heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setHackerCount((prev) => prev + (Math.random() > 0.5 ? 1 : -1));
      setMessageRate((prev) => Math.max(12, Math.min(60, prev + Math.floor(Math.random() * 5) - 2)));
      setPing((prev) => Math.max(20, Math.min(80, prev + Math.floor(Math.random() * 9) - 4)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Simulate incoming messages
  useEffect(() => {
    if (isConnected) return; // Disable simulation when custom server is connected
    
    const interval = setInterval(() => {
      // Pick a random channel
      const channels = Object.keys(SIM_INCOMING);
      const chan = channels[Math.floor(Math.random() * channels.length)];
      const pool = SIM_INCOMING[chan];
      const template = pool[Math.floor(Math.random() * pool.length)];

      const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const newMessage: Message = {
        id: `sim_${Date.now()}`,
        author: template.author,
        avatarColor: template.avatarColor,
        content: template.content,
        timestamp: time,
        isStaff: template.isStaff,
        isMentor: template.isMentor,
      };

      setMessages((prev) => ({
        ...prev,
        [chan]: [...prev[chan], newMessage],
      }));

      // Sound notification
      if (soundEnabled && chan === activeChannel) {
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.type = 'sine';
          osc.frequency.value = 520; // nice high frequency chime
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.15);
        } catch {
          // ignore
        }
      }

      if (chan === 'announcements') {
        log(`[DISCORD] Broadcast announcements: "${newMessage.content.slice(0, 50)}..."`, 'info');
      }
    }, 14000); // New message every 14 seconds

    return () => clearInterval(interval);
  }, [soundEnabled, activeChannel, isConnected]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const time = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const userMsg: Message = {
      id: `user_${Date.now()}`,
      author: 'OP_GHOST_01 (You)',
      avatarColor: '#9ddf2e',
      content: inputValue.trim(),
      timestamp: time,
    };

    setMessages((prev) => ({
      ...prev,
      [activeChannel]: [...prev[activeChannel], userMsg],
    }));
    setInputValue('');

    // Simulate reply after 1.5 seconds
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      let replyMsg: Message = {
        id: `reply_${Date.now()}`,
        author: 'SolidityMentor',
        avatarColor: '#DEFF9A',
        content: 'Acknowledged. We are monitoring the channel feed.',
        timestamp: replyTime,
        isMentor: true,
      };

      if (activeChannel === 'mentorship') {
        replyMsg.content = 'Got it! I am looking into your request. What table are you at?';
      } else if (activeChannel === 'team-formation') {
        replyMsg.author = 'base_builder';
        replyMsg.avatarColor = '#c4b5fd';
        replyMsg.content = 'Nice! Join us in table 22 to align on ideas.';
        replyMsg.isMentor = false;
      } else if (activeChannel === 'general-chat') {
        replyMsg.author = 'zk_pioneer';
        replyMsg.avatarColor = '#fb7185';
        replyMsg.content = 'Vibes are definitely off the charts today.';
        replyMsg.isMentor = false;
      } else {
        replyMsg.author = 'ETHGlobal Staff';
        replyMsg.content = 'Staff is reviewing this. Standby for official announcements.';
        replyMsg.isStaff = true;
        replyMsg.isMentor = false;
      }

      setMessages((prev) => ({
        ...prev,
        [activeChannel]: [...prev[activeChannel], replyMsg],
      }));
    }, 1500);
  };

  const handleConnectCustomServer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGuildId.trim() || !customChannelId.trim()) {
      log('Please provide both Guild ID and Channel ID to connect.', 'warning');
      return;
    }
    setIsConnected(true);
    log(`[SYS] Custom Discord server bind: Guild ${customGuildId} // Channel ${customChannelId}.`, 'success');
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    log('[SYS] Custom Discord server unbound. Reverted to local simulation.', 'info');
  };

  const channelsList = [
    { id: 'announcements', label: 'announcements', desc: 'Official event announcements' },
    { id: 'mentorship', label: 'mentorship', desc: 'Request help from technical mentors' },
    { id: 'team-formation', label: 'team-formation', desc: 'Find builders & combine ideas' },
    { id: 'general-chat', label: 'general-chat', desc: 'Lounge chat & off-topic chatter' },
  ];

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 select-none lg:flex-row flex-1">
      {/* Left panel: Channels and controls */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[320px]">
        {/* Connection status */}
        <div className="border border-[#44483a] bg-[#12140e] p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-[#9ddf2e]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#e3e3d8]">Server Node</h2>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ddf2e] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9ddf2e]" />
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 font-mono text-[9px] uppercase">
            <div className="border border-[#44483a] bg-[#0d0f09] p-2">
              <span className="block text-[#8f9282]">Network</span>
              <span className="mt-1 block text-[#7dd3fc] truncate">ETHGLOBAL NY</span>
            </div>
            <div className="border border-[#44483a] bg-[#0d0f09] p-2">
              <span className="block text-[#8f9282]">Status</span>
              <span className="mt-1 block text-[#9ddf2e] font-bold">{isConnected ? 'CUSTOM' : 'SIMULATED'}</span>
            </div>
          </div>

          {/* Stats matrix */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between font-mono text-[9px] text-[#c5c8b6]">
              <span className="text-[#8f9282]">Connected Hackers:</span>
              <span className="font-bold flex items-center gap-1"><Users className="h-3 w-3" /> {hackerCount}</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[9px] text-[#c5c8b6]">
              <span className="text-[#8f9282]">Channel rate:</span>
              <span className="text-[#ffb020]">{messageRate} msgs/min</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[9px] text-[#c5c8b6]">
              <span className="text-[#8f9282]">Network Ping:</span>
              <span className="text-[#7dd3fc] flex items-center gap-1"><Wifi className="h-3 w-3" /> {ping}ms</span>
            </div>
          </div>
        </div>

        {/* Discord Channels List */}
        <div className="border border-[#44483a] bg-[#12140e] p-4 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between border-b border-[#44483a] pb-2 mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5 text-[#9ddf2e]" />
              <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Channels</h3>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-[#8f9282] hover:text-[#9ddf2e] transition"
              title={soundEnabled ? 'Disable ping audio' : 'Enable ping audio'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </button>
          </div>

          <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar pr-1">
            {channelsList.map((chan) => {
              const isActive = activeChannel === chan.id && !isConnected;
              return (
                <button
                  key={chan.id}
                  disabled={isConnected}
                  onClick={() => setActiveChannel(chan.id)}
                  className={`w-full px-3 py-2 flex flex-col text-left transition-all border ${
                    isActive
                      ? 'border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e]'
                      : 'border-[#44483a] bg-[#1b1c16] text-[#c5c8b6] hover:border-[#8f9282] disabled:opacity-40 disabled:hover:border-[#44483a]'
                  }`}
                >
                  <span className="font-mono text-[11px] font-bold flex items-center gap-1.5">
                    <span>#</span> {chan.label}
                  </span>
                  <span className="text-[9px] text-[#8f9282] mt-0.5 truncate">{chan.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom bindings manager */}
        <div className="border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center gap-2 border-b border-[#44483a] pb-2 mb-3">
            <Settings className="h-3.5 w-3.5 text-[#7dd3fc]" />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Custom Server Bind</h3>
          </div>

          {isConnected ? (
            <div className="space-y-3 font-mono text-[10px]">
              <div className="bg-[#0d0f09] border border-[#9ddf2e]/30 p-2.5 space-y-1">
                <div className="text-[#8f9282]">Active Binding:</div>
                <div className="text-[#9ddf2e] font-bold truncate">Guild: {customGuildId}</div>
                <div className="text-[#9ddf2e] font-bold truncate">Channel: {customChannelId}</div>
              </div>
              <p className="text-[9.5px] leading-4 text-[#c5c8b6]">
                Real-world read/write operations synced via widgetbot.io gateway.
              </p>
              <button
                onClick={handleDisconnect}
                className="w-full py-1.5 border border-[#fb7185] text-[#fb7185] hover:bg-[#fb7185]/10 font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer"
              >
                Disconnect Widget
              </button>
            </div>
          ) : (
            <form onSubmit={handleConnectCustomServer} className="space-y-2.5 font-mono text-[9px]">
              <div>
                <span className="text-[#8f9282] block mb-0.5 uppercase tracking-wide">Guild ID (Server ID)</span>
                <input
                  type="text"
                  required
                  value={customGuildId}
                  onChange={(e) => setCustomGuildId(e.target.value)}
                  placeholder="e.g. 1047805128362483712"
                  className="w-full border border-[#44483a] bg-[#0d0f09] p-1.5 text-[10px] text-[#e3e3d8] focus:border-[#7dd3fc] outline-none"
                />
              </div>
              <div>
                <span className="text-[#8f9282] block mb-0.5 uppercase tracking-wide">Channel ID</span>
                <input
                  type="text"
                  required
                  value={customChannelId}
                  onChange={(e) => setCustomChannelId(e.target.value)}
                  placeholder="e.g. 1047805129188757527"
                  className="w-full border border-[#44483a] bg-[#0d0f09] p-1.5 text-[10px] text-[#e3e3d8] focus:border-[#7dd3fc] outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 border border-[#7dd3fc] text-[#7dd3fc] hover:bg-[#7dd3fc]/10 font-bold uppercase transition duration-150 cursor-pointer text-[10px]"
              >
                Connect Server
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Right panel: Active Feed */}
      <div className="flex flex-col flex-1 border border-[#44483a] bg-[#0d0f09] min-h-[400px]">
        {/* Feed Header */}
        <div className="border-b border-[#44483a] bg-[#12140e] p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[#9ddf2e] text-lg font-bold">#</span>
              <span className="font-mono font-bold text-sm text-[#e3e3d8]">
                {isConnected ? 'live-chat' : activeChannel}
              </span>
            </div>
            <p className="text-[10px] text-[#8f9282] mt-0.5">
              {isConnected
                ? 'External Discord Channel connected via widgetbot iframe'
                : channelsList.find((c) => c.id === activeChannel)?.desc}
            </p>
          </div>
          <div className="flex items-center gap-2 border border-[#44483a] bg-[#0d0f09] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#c5c8b6]">
            <Radio className="h-3 w-3 text-[#9ddf2e] animate-pulse" />
            <span>{isConnected ? 'Widget Live' : 'Simulation active'}</span>
          </div>
        </div>

        {/* Chat Stream */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-4 min-h-0 bg-[#07080a]">
          {isConnected ? (
            <div className="w-full h-full min-h-[350px]">
              <iframe
                title="Discord Widget"
                src={`https://e.widgetbot.io/channels/${customGuildId}/${customChannelId}`}
                className="w-full h-full border-0 bg-[#07080a]"
                allow="clipboard-write"
              />
            </div>
          ) : (
            <>
              {messages[activeChannel]?.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3 group/msg">
                  <div
                    className="w-9 h-9 shrink-0 flex items-center justify-center font-mono font-bold text-sm text-[#0d0f09]"
                    style={{ backgroundColor: msg.avatarColor }}
                  >
                    {msg.author.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono font-bold text-xs text-[#e3e3d8]">{msg.author}</span>
                      {msg.isStaff && (
                        <span className="border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 text-[#9ddf2e] font-mono text-[7px] uppercase px-1 font-bold">
                          Staff
                        </span>
                      )}
                      {msg.isMentor && (
                        <span className="border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 text-[#7dd3fc] font-mono text-[7px] uppercase px-1 font-bold">
                          Mentor
                        </span>
                      )}
                      <span className="font-mono text-[9px] text-[#8f9282]">{msg.timestamp}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-[#c5c8b6] font-sans">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input box */}
        {!isConnected && (
          <form onSubmit={handleSendMessage} className="border-t border-[#44483a] bg-[#12140e] p-3 flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={`Message #${activeChannel}...`}
              className="flex-1 border border-[#44483a] bg-[#0d0f09] px-3 py-2 text-xs text-[#e3e3d8] outline-none focus:border-[#9ddf2e] placeholder:text-[#44483a]"
            />
            <button
              type="submit"
              className="border border-[#9ddf2e] bg-[#9ddf2e] p-2 text-[#0d0f09] hover:bg-[#83c300] transition active:scale-[0.96] cursor-pointer"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
