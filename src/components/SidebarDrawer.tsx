import React, { useState } from 'react';

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
  const [showAdvanced, setShowAdvanced] = useState(false);

  const primaryItems = [
    { id: 'web3-hub', label: 'Web3 Hub', icon: 'hub' },
    { id: 'hackathon-space', label: 'Active Workstation', icon: 'terminal' },
    { id: 'history', label: 'Hackathon History', icon: 'history' },
    { id: 'swarm-nexus', label: 'Swarm Nexus', icon: 'groups' },
    { id: 'overmind', label: 'Overmind AI', icon: 'psychology' },
    { id: 'console', label: 'Operator Console', icon: 'settings_input_component' },
  ];

  const advancedItems = [
    { id: 'integration-ops', label: 'Integration Ops', icon: 'settings_ethernet' },
    { id: 'usage-limits', label: 'Usage & Limits', icon: 'query_stats' },
    { id: 'model-accounts', label: 'Model Accounts', icon: 'vpn_key' },
    { id: 'routing-guardrails', label: 'Routing Rules', icon: 'alt_route' },
    { id: 'security', label: 'Security Specs', icon: 'verified_user' },
    { id: 'stitch', label: 'Stitch AI Co-Op', icon: 'auto_awesome' },
    { id: 'claude-design', label: 'Claude Design', icon: 'palette' },
  ];

  const renderItem = (item: { id: string; label: string; icon: string }) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        onClick={() => setActiveTab(item.id)}
        className={`w-full flex items-center gap-md px-md py-sm transition-all duration-200 text-left cursor-pointer ${
          isActive
            ? 'bg-primary/10 text-primary border-l-4 border-primary translate-x-1 font-bold'
            : 'text-on-surface-variant hover:bg-secondary/5 hover:text-secondary border-l-4 border-transparent'
        }`}
      >
        <span className="material-symbols-outlined text-[18px]" data-icon={item.icon}>
          {item.icon}
        </span>
        <span className="font-label-caps text-label-caps">{item.label}</span>
      </button>
    );
  };

  return (
    <>
      {/* Mobile Top Scrollable Navigation */}
      <nav className="lg:hidden w-full shrink-0 overflow-x-auto custom-scrollbar border-b border-outline-variant/40 bg-surface-container">
        <div className="flex min-w-max p-2 gap-1">
          {primaryItems.concat(advancedItems).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase transition-all duration-150 ${
                  isActive 
                    ? 'border-primary bg-primary/10 text-primary font-bold' 
                    : 'border-outline-variant/40 text-on-surface-variant hover:border-secondary/60'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Navigation Drawer */}
      <aside className="hidden lg:flex bg-surface-container border-r border-outline-variant/40 h-full w-[280px] flex-col py-lg z-40 shrink-0">
        
        {/* User profile / Git status section */}
        <div className="px-md mb-md">
          <div className="p-md glass-panel rounded-lg flex items-center gap-md border border-outline-variant/20">
            <div className="w-10 h-10 border border-outline bg-surface-dim flex items-center justify-center relative overflow-hidden rounded">
              {gitHubUser?.isLoggedIn ? (
                <img src={gitHubUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">person</span>
              )}
              {gitHubUser?.isLoggedIn && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-primary border border-surface-container" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-label-caps text-[12px] text-primary truncate leading-tight">
                {gitHubUser?.isLoggedIn ? gitHubUser.username : 'OP_GUEST'}
              </div>
              <div className="font-label-caps text-[9px] text-on-surface-variant uppercase mt-0.5 tracking-wider">
                {gitHubUser?.isLoggedIn ? 'CONNECTED_OP' : 'STANDBY_MODE'}
              </div>
            </div>
          </div>

          <div className="mt-3">
            {gitHubUser?.isLoggedIn ? (
              <button
                onClick={onLogoutClick}
                className="w-full flex items-center justify-between border border-error/30 text-error bg-error/5 hover:bg-error/10 px-3 py-1.5 font-mono text-[9px] uppercase transition-all duration-150 cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">logout</span>
                  <span>DISCONNECT SESSION</span>
                </span>
              </button>
            ) : (
              <button
                onClick={onLoginClick}
                className="w-full flex items-center justify-center gap-1.5 border border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 px-3 py-1.5 font-mono text-[9px] uppercase font-bold transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[13px]">vpn_key</span>
                <span>CONNECT GITHUB</span>
              </button>
            )}
          </div>
        </div>

        {/* System Menu Header */}
        <div className="px-md mb-sm">
          <h2 className="font-label-caps text-label-caps text-primary uppercase">SYSTEM_MENU</h2>
          <div className="h-[1px] bg-outline-variant/20 w-full mt-xs"></div>
        </div>

        {/* Primary Navigation Items */}
        <nav className="space-y-xs">
          {primaryItems.map(renderItem)}
        </nav>

        {/* Advanced Telemetry Divider */}
        <div className="px-md mt-md mb-xs">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex justify-between items-center font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors py-1 cursor-pointer"
          >
            <span>ADVANCED_TELEMETRY</span>
            <span className="material-symbols-outlined text-[16px]">
              {showAdvanced ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          <div className="h-[1px] bg-outline-variant/10 w-full mt-xs"></div>
        </div>

        {/* Advanced Navigation Items (Collapsible) */}
        {showAdvanced && (
          <nav className="space-y-xs max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
            {advancedItems.map(renderItem)}
          </nav>
        )}

        {/* Active Session telemetry indicators at bottom */}
        <div className="mt-auto px-md pt-lg border-t border-outline-variant/20">
          <div className="p-md glass-panel rounded-lg border border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between mb-sm">
              <span className="font-label-caps text-[9px] text-primary">SESSION_HEARTBEAT</span>
              <span className="font-code-sm text-[10px] text-primary">ONLINE</span>
            </div>
            <div className="w-full bg-surface-container-highest h-[2px]">
              <div className="bg-primary h-full w-[85%] progress-glow transition-all duration-1000"></div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
