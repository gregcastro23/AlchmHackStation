import React from 'react';
import { Terminal, Cpu, Network, Shield, Wand2, Key, LogOut, Sparkles, PanelsTopLeft, Gauge, KeyRound, Route, Waypoints, Atom, BrainCircuit, CalendarDays, MessageSquare } from 'lucide-react';

interface SidebarDrawerProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gitHubUser: { username: string; avatarUrl: string; isLoggedIn: boolean } | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const SidebarDrawer: React.FC<SidebarDrawerProps> = ({
  activeTab,
  setActiveTab,
  gitHubUser,
  onLoginClick,
  onLogoutClick,
}) => {
  const navItems = [
    { id: 'hackathon-space', label: 'Pentacles Overview', icon: CalendarDays },
    { id: 'swarm-nexus', label: 'Swarm Nexus', icon: Atom },
    { id: 'overmind', label: 'Overmind AI', icon: BrainCircuit },
    { id: 'mission-control', label: 'Status Indicator', icon: PanelsTopLeft },
    { id: 'discord-feed', label: 'Discord Live Feed', icon: MessageSquare },
    { id: 'planetary-cockpit', label: 'Celestial Cockpit', icon: Atom },
    { id: 'integration-ops', label: 'Integration Ops', icon: Waypoints },
    { id: 'usage-limits', label: 'Usage & Limits', icon: Gauge },
    { id: 'model-accounts', label: 'Model Accounts', icon: KeyRound },
    { id: 'routing-guardrails', label: 'Routing & Guardrails', icon: Route },
    { id: 'console', label: 'Operator Console', icon: Terminal },
    { id: 'network', label: 'Node Network', icon: Network },
    { id: 'security', label: 'Security Protocols', icon: Shield },
    { id: 'stitch', label: 'Stitch AI Co-Op', icon: Wand2 },
    { id: 'claude-design', label: 'Claude Design', icon: Sparkles },
  ];

  return (
    <>
      <nav className="lg:hidden w-full shrink-0 overflow-x-auto custom-scrollbar border-b border-[#44483a] bg-[#1f201a]">
        <div className="flex min-w-max p-2 gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase ${isActive ? 'border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e]' : 'border-[#44483a] text-[#c5c8b6]'}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <aside className="hidden lg:flex bg-[#1f201a] border-r border-[#44483a] h-full w-80 flex-col select-none py-6 z-40">
      {/* Brand Identity / Profile area */}
      <div className="px-6 mb-8 border-b border-[#44483a]/40 pb-6">
        <div className="flex items-center space-x-3 bg-[#12140e] border border-[#44483a] p-3.5 shadow-[0_0_12px_rgba(0,0,0,0.2)]">
          <div className="w-11 h-11 border border-[#8f9282] bg-[#1b1c16] flex items-center justify-center relative overflow-hidden">
            {gitHubUser?.isLoggedIn ? (
              <img src={gitHubUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <Cpu className="w-5 h-5 text-[#8f9282]" />
            )}
            {gitHubUser?.isLoggedIn && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#9ddf2e] border border-[#12140e]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[13px] font-bold text-[#9ddf2e] truncate">
              {gitHubUser?.isLoggedIn ? gitHubUser.username : 'OP_CELESTIAL'}
            </div>
            <div className="font-mono text-[9px] text-[#c5c8b6] uppercase tracking-wider mt-0.5">
              {gitHubUser?.isLoggedIn ? 'PENTACLES_OPERATOR' : 'OP_GUEST'}
            </div>
            <div className="font-mono text-[9px] text-[#8f9282] uppercase mt-0.5">
              SPACETIMEDB // MAINCLOUD
            </div>
          </div>
        </div>

        {/* GitHub Bind button / Logout */}
        <div className="mt-4">
          {gitHubUser?.isLoggedIn ? (
            <button
              onClick={onLogoutClick}
              className="w-full flex items-center justify-between border border-[#ffb4ab]/30 text-[#ffb4ab] bg-[#ffb4ab]/5 hover:bg-[#ffb4ab]/10 px-3 py-1.5 font-mono text-[10px] uppercase transition-all duration-150 cursor-pointer"
            >
              <span className="flex items-center space-x-1">
                <Key className="w-3 h-3" />
                <span>DISCONNECT SESSION</span>
              </span>
              <LogOut className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="w-full flex items-center justify-center space-x-1.5 border border-[#9ddf2e]/60 text-[#9ddf2e] bg-[#9ddf2e]/5 hover:bg-[#9ddf2e]/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider font-bold transition-all duration-150 cursor-pointer active:scale-[0.98]"
            >
              <Key className="w-3.5 h-3.5" />
              <span>CONNECT GITHUB</span>
            </button>
          )}
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full px-6 py-3 flex items-center space-x-3 font-mono text-[12px] transition-all relative border-r-4 text-left cursor-pointer ${
                isActive
                  ? 'bg-[#83c300]/10 text-[#9ddf2e] border-[#9ddf2e] font-bold shadow-[inset_-6px_0_12px_rgba(157,223,46,0.02)]'
                  : 'text-[#c5c8b6] hover:bg-[#1b1c16] hover:text-[#9ddf2e] border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#9ddf2e]' : 'text-[#8f9282]'}`} />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 bg-[#9ddf2e] rounded-full animate-pulse shadow-[0_0_8px_#9ddf2e]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer system details */}
      <div className="px-6 border-t border-[#44483a]/40 pt-4 font-mono text-[10px] text-[#8f9282] space-y-1">
        <div className="flex justify-between">
          <span>DEPLOY WINDOW:</span>
          <span className="text-[#9ddf2e] font-bold">OPEN</span>
        </div>
        <div className="flex justify-between">
          <span>LAST SYNC:</span>
          <span className="text-[#c5c8b6]">2026-06-14</span>
        </div>
        <div className="flex justify-between">
          <span>STDB MODULE:</span>
          <span className="text-[#7dd3fc]">ACTIVE</span>
        </div>
      </div>
      </aside>
    </>
  );
};
