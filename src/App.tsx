import { useState, useEffect } from 'react';
import { TopStatusBar } from './components/TopStatusBar';
import { FoundryControlDeck } from './components/FoundryControlDeck';
import { EnvironmentSyncModule } from './components/EnvironmentSyncModule';
import { ReducerFeed } from './components/ReducerFeed';
import { UnityAltarViewport } from './components/UnityAltarViewport';
import { LiveStdoutStream } from './components/LiveStdoutStream';
import type { LogLine } from './components/LiveStdoutStream';

// Import new modular prototype components
import { SidebarDrawer } from './components/SidebarDrawer';
import { GitHubLoginModal } from './components/GitHubLoginModal';
import { StitchAICooperator } from './components/StitchAICooperator';
import { NodeNetworkView } from './components/NodeNetworkView';
import { SecurityProtocolsView } from './components/SecurityProtocolsView';
import { AppBuilderDeck } from './components/AppBuilderDeck';
import { ClaudeDesignBridge } from './components/ClaudeDesignBridge';
import { MissionControl } from './components/MissionControl';

function App() {
  const [foundryState, setFoundryState] = useState<'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [blockHeight, setBlockHeight] = useState(788291);
  const [activeCommand, setActiveCommand] = useState('forge build');
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    { timestamp: '23:41:00', text: 'bun run tauri v2 environment initialized', type: 'info' },
    { timestamp: '23:41:02', text: 'space-time database local client connected to: spacetime_instance_local', type: 'info' },
    { timestamp: '23:41:05', text: 'vercel sync: matches development branch env_4c29', type: 'success' },
    { timestamp: '23:41:08', text: 'bun run forge build', type: 'default' },
    { timestamp: '23:41:08', text: 'compiling 37 contracts with solc 0.8.26', type: 'info' },
    { timestamp: '23:41:09', text: 'gas snapshot delta -8.2%', type: 'warning' },
    { timestamp: '23:41:09', text: 'deployment reducer emitted verified address: 0x5FbDB2315678afecb367f032d93F642f64180aa3', type: 'success' },
    { timestamp: '23:41:10', text: 'spacetime sync committed ActivityLog row', type: 'success' },
  ]);

  // Combined V2 states
  const [activeTab, setActiveTab] = useState<string>('mission-control');
  const [missionReadiness, setMissionReadiness] = useState(86);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [gitHubUser, setGitHubUser] = useState<{ username: string; avatarUrl: string; isLoggedIn: boolean } | null>(null);

  // App Builder Customizer states
  const [framework, setFramework] = useState<string>('Vite React');
  const [cssEngine, setCssEngine] = useState<string>('Tailwind v4');
  const [database, setDatabase] = useState<string>('SpaceTimeDB');

  // Block height increment simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setBlockHeight((prev) => prev + 1);
      
      // Add a small background heartbeat log
      const time = new Date().toLocaleTimeString('en-US', { hour12: false });
      setLogs((prev) => [
        ...prev,
        {
          timestamp: time,
          text: `spacetime db sync: committed block_height update to index ${blockHeight + 1}`,
          type: 'info',
        },
      ]);
    }, 12000);
    return () => clearInterval(interval);
  }, [blockHeight]);

  const addLog = (text: string, type: LogLine['type'] = 'default') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    setLogs((prev) => [...prev, { timestamp: time, text, type }]);
  };

  const handleRunBuild = () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setFoundryState('BUILDING');
    
    // Customize compiler output logs dynamically based on framework/CSS settings!
    addLog(`Initiating build runner: bun --bun run compile --target=${framework.toLowerCase().replace(' ', '-')}`, 'info');

    setTimeout(() => {
      setIsBuilding(false);
      setFoundryState('SUCCESS');
      setMissionReadiness((prev) => Math.min(98, prev + 3));
      addLog(`Build synthesis complete for framework: ${framework}`, 'success');
      addLog(`Bundled styles via stylesheet compiler: ${cssEngine}`, 'success');
      addLog(`Database schema sync verified against client node: ${database}`, 'success');
    }, 1500); // 1.5s compile
  };

  const handleSelectCommand = (command: string) => {
    setActiveCommand(command);
    addLog(`Active orchestration command updated to: ${command}`, 'info');
  };

  const handleEnvironmentAction = (action: string) => {
    addLog(`Invoked environment operator: on_vercel_sync(${action.toLowerCase()})`, 'info');
    setTimeout(() => {
      switch (action) {
        case 'Pull':
          addLog('Vercel env pull complete: retrieved hash env_4c29.', 'success');
          break;
        case 'Diff':
          addLog('Vercel env diff: LOCAL (env_4c29) <=> PREVIEW (env_a81f) mismatch detected in GAS_LIMIT.', 'warning');
          break;
        case 'Push':
          addLog('Vercel env push complete: updated environment mapping to preview deployment.', 'success');
          break;
        case 'Seal':
          addLog('Production environment configuration LOCKED under hash env_9d02.', 'success');
          break;
        default:
          break;
      }
    }, 400);
  };

  const handleCommandInput = (cmd: string) => {
    addLog(`operator@alchm ~ % ${cmd}`, 'default');
    
    // Command parser simulation
    setTimeout(() => {
      const cleanCmd = cmd.toLowerCase().trim();
      if (cleanCmd === 'forge build' || cleanCmd === 'bun run build') {
        handleRunBuild();
      } else if (cleanCmd.startsWith('forge test')) {
        addLog('Running 42 tests via Bun sidecar Anvil instance...', 'info');
        setTimeout(() => {
          addLog('Test suite passed. Gas snapshot delta: -8.2%', 'success');
        }, 800);
      } else if (cleanCmd === 'anvil') {
        addLog('Spawning Anvil Ethereum local testnet node...', 'info');
        addLog('Anvil listening on 127.0.0.1:8545', 'success');
      } else if (cleanCmd === 'clear') {
        setLogs([]);
      } else if (cleanCmd === 'help') {
        addLog('Available commands: forge build, forge test, anvil, clear, help, ship demo, readiness, agent swarm', 'info');
      } else if (cleanCmd === 'ship demo') {
        addLog('Mission Control queued demo run: build, proof feed, pitch packet, deploy seal.', 'info');
        setMissionReadiness((prev) => Math.min(97, prev + 2));
        handleRunBuild();
      } else if (cleanCmd === 'readiness') {
        addLog(`Mission readiness score: ${missionReadiness}/100. Final blocker: production deploy seal.`, 'info');
      } else if (cleanCmd === 'agent swarm') {
        addLog('Architect, Builder, Designer, QA, Pitch Coach, and Deploy Captain synced.', 'success');
        addLog('Agent board updated: 2 active builds, 1 review, 1 deploy blocker.', 'info');
      } else {
        addLog(`executing custom sidecar process: ${cmd}`, 'info');
        setTimeout(() => {
          addLog(`Process exit 0: ${cmd}`, 'success');
        }, 500);
      }
    }, 200);
  };

  const handleApplyConfig = () => {
    addLog(`[SYS] Reconfiguring project specs: ${framework} + ${cssEngine} + ${database}...`, 'info');
    setTimeout(() => {
      addLog(`✓ Framework compiler mapped to ${framework}`, 'success');
      addLog(`✓ Style injection hooks set to ${cssEngine}`, 'success');
      addLog(`✓ Database schema sync redirected to ${database}`, 'success');
      addLog('Project workspace configuration RECONCILED successfully.', 'success');
    }, 450);
  };

  const handleMissionSignal = (signal: string) => {
    addLog(`[MISSION] ${signal}`, 'info');
    if (signal.includes('pitch')) {
      setMissionReadiness((prev) => Math.min(99, prev + 1));
      addLog('Pitch packet refreshed: README, demo script, and proof feed references aligned.', 'success');
    }
  };

  const handleLaunchDemo = () => {
    setActiveTab('console');
    addLog('[MISSION] Launching full demo run from Mission Control.', 'info');
    addLog('[MISSION] Sequence: app build -> browser proof -> deploy seal -> pitch packet.', 'info');
    setMissionReadiness((prev) => Math.min(98, prev + 4));
    handleRunBuild();
  };

  const handleExportToAntigravity = () => {
    const stateExport = {
      timestamp: new Date().toISOString(),
      blockHeight,
      foundryState,
      activeCommand,
      configuration: {
        framework,
        cssEngine,
        database,
      },
      mission: {
        readiness: missionReadiness,
        demoTarget: 'real-time hackathon command center',
        crew: ['Architect', 'Builder', 'Designer', 'QA', 'Pitch Coach', 'Deploy Captain'],
      },
      environments: [
        { name: 'LOCAL', hash: 'env_4c29', status: 'synced' },
        { name: 'PREVIEW', hash: 'env_a81f', status: 'dirty' },
        { name: 'PRODUCTION', hash: 'env_9d02', status: 'locked' }
      ],
      activeLogs: logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`),
    };

    // 1. Download JSON file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `antigravity_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // 2. Format & copy markdown representation to clipboard
    const markdownSummary = `### AlchmHackStation State Export
- **Exported**: ${stateExport.timestamp}
- **Active Block**: ${blockHeight}
- **Foundry State**: ${foundryState}
- **App Stack**: ${framework} // ${cssEngine} // ${database}
- **Selected Forge Command**: \`${activeCommand}\`
- **Telemetry Logs**:
\`\`\`
${stateExport.activeLogs.join('\n')}
\`\`\`
`;
    
    navigator.clipboard.writeText(markdownSummary).then(() => {
      addLog('Successfully exported console snapshot: downloaded JSON & copied Markdown to clipboard for Antigravity.', 'success');
    }).catch(() => {
      addLog('Exported console snapshot: downloaded JSON file successfully.', 'success');
    });
  };

  const handleExportToClaudeCode = () => {
    const stateExport = {
      timestamp: new Date().toISOString(),
      activeTab,
      blockHeight,
      foundryState,
      activeCommand,
      gitHubUser: gitHubUser?.isLoggedIn ? gitHubUser.username : 'GUEST',
      configuration: {
        framework,
        cssEngine,
        database,
      },
      activeLogs: logs.map((l) => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`),
    };

    const claudePromptContent = `### CLAUDE CODE CLI DEVELOPER SESSION SYNC
This file contains compiled telemetry context from the AlchmHackStation console.

#### 1. Core State Metadata
- **Timestamp**: ${stateExport.timestamp}
- **Active View**: ${stateExport.activeTab}
- **Block Height**: ${stateExport.blockHeight}
- **Foundry State**: ${stateExport.foundryState}
- **Mission Readiness**: ${missionReadiness}/100
- **App Stack**: ${framework} // ${cssEngine} // ${database}
- **Selected Shell Command**: \`${stateExport.activeCommand}\`
- **GitHub Session**: ${stateExport.gitHubUser}

#### 2. Log History
\`\`\`
${stateExport.activeLogs.slice(-15).join('\n')}
\`\`\`

#### 3. Directive
You are running as Claude Code in the terminal workspace. Review the developer console logs above to diagnose compilation errors, sync environment changes, or run unit test assertions.
`;

    // 1. Download file
    const blob = new Blob([claudePromptContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = `claude_prompt_${Date.now()}.md`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);

    // 2. Copy CLI command execution script to clipboard
    const clipScript = `cat claude_prompt_${Date.now()}.md | claude`;
    navigator.clipboard.writeText(clipScript).then(() => {
      addLog('Successfully generated Claude Code export prompt: downloaded Markdown & copied execution script command.', 'success');
    }).catch(() => {
      addLog('Successfully generated Claude Code export prompt: downloaded Markdown file.', 'success');
    });
  };

  const handleExportToCodex = () => {
    const stateExport = {
      timestamp: new Date().toISOString(),
      blueprintId: `bp_alchm_${Date.now().toString(36)}`,
      engineSpecs: {
        runtime: 'Bun 1.3.13',
        framework,
        missionReadiness,
        css: cssEngine,
        database,
      },
      activeTargetAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      logsCount: logs.length,
    };

    // 1. Download Codex Blueprint JSON file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stateExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `codex_blueprint_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    // 2. Copy Codex command compilation script to clipboard
    const clipScript = `codex compile codex_blueprint_${Date.now()}.json --target=${framework.toLowerCase().replace(' ', '-')}`;
    navigator.clipboard.writeText(clipScript).then(() => {
      addLog('Successfully compiled Codex developer blueprint. JSON file downloaded & Codex compile script copied to clipboard.', 'success');
    }).catch(() => {
      addLog('Successfully compiled Codex developer blueprint. JSON file downloaded.', 'success');
    });
  };

  return (
    <div className="min-h-screen bg-[#0d0f09] text-[#c5c8b6] antialiased flex flex-col relative font-sans">
      {/* Background Subtle Radial Lighting Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(157,223,46,0.02),transparent_45%)] pointer-events-none z-0" />
      
      {/* Main Container Shell */}
      <div className="flex-1 flex flex-col bg-[#12140e] border border-[#44483a]/60 shadow-2xl shadow-black/90 z-10 m-0 md:m-3 overflow-hidden">
        
        {/* Top Header System Bar */}
        <TopStatusBar 
          foundryState={foundryState} 
          blockHeight={blockHeight} 
          onExport={handleExportToAntigravity} 
          onExportToClaude={handleExportToClaudeCode} 
          onExportToCodex={handleExportToCodex}
          missionReadiness={missionReadiness}
          framework={framework}
          cssEngine={cssEngine}
          database={database}
        />

        {/* Horizontal Split for Sidebar + Content Pane */}
        <div className="flex-1 flex overflow-hidden min-h-0 relative">
          {/* Left Navigation Drawer */}
          <SidebarDrawer 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            gitHubUser={gitHubUser} 
            onLoginClick={() => setIsLoginModalOpen(true)} 
            onLogoutClick={() => {
              setGitHubUser(null);
              addLog('GitHub developer session disconnected.', 'info');
            }} 
          />

          {/* Right Content Panels */}
          <main className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-0 flex flex-col">
            {activeTab === 'mission-control' && (
              <MissionControl
                blockHeight={blockHeight}
                foundryState={foundryState}
                missionReadiness={missionReadiness}
                framework={framework}
                cssEngine={cssEngine}
                database={database}
                isBuilding={isBuilding}
                onLaunchDemo={handleLaunchDemo}
                onMissionSignal={handleMissionSignal}
              />
            )}

            {activeTab === 'console' && (
              <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden h-[calc(100vh-64px-24px)] md:h-auto">
                {/* Left Orchestration Column (40% width) */}
                <section className="w-full lg:w-[40%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-0 lg:pr-1 min-h-0">
                  <AppBuilderDeck 
                    framework={framework}
                    setFramework={setFramework}
                    cssEngine={cssEngine}
                    setCssEngine={setCssEngine}
                    database={database}
                    setDatabase={setDatabase}
                    onApplyConfig={handleApplyConfig}
                  />

                  <FoundryControlDeck
                    onRunBuild={handleRunBuild}
                    onSelectCommand={handleSelectCommand}
                    activeCommand={activeCommand}
                    isBuilding={isBuilding}
                    buildSuccess={foundryState === 'SUCCESS'}
                  />

                  <EnvironmentSyncModule onActionClick={handleEnvironmentAction} />

                  <ReducerFeed />
                </section>

                {/* Right Execution & Logs Column (60% width) */}
                <section className="w-full lg:w-[60%] flex flex-col gap-4 overflow-hidden min-h-0">
                  {/* Top 60% of right column is Unity Viewport */}
                  <div className="flex-[6] min-h-0">
                    <UnityAltarViewport isCompiling={isBuilding} blockHeight={blockHeight} />
                  </div>

                  {/* Bottom 40% of right column is Live Stdout Stream */}
                  <div className="flex-[4] min-h-0">
                    <LiveStdoutStream logs={logs} onCommandSubmit={handleCommandInput} />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'network' && (
              <div className="flex-1 min-h-0">
                <NodeNetworkView />
              </div>
            )}

            {activeTab === 'security' && (
              <div className="flex-1 min-h-0">
                <SecurityProtocolsView />
              </div>
            )}

            {activeTab === 'stitch' && (
              <div className="flex-1 min-h-0">
                <StitchAICooperator />
              </div>
            )}

            {activeTab === 'claude-design' && (
              <div className="flex-1 min-h-0">
                <ClaudeDesignBridge 
                  framework={framework} 
                  cssEngine={cssEngine} 
                  onCommitLog={addLog} 
                />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* GitHub Login Handshake Modal overlay */}
      <GitHubLoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={(username, avatarUrl) => {
          setGitHubUser({ username, avatarUrl, isLoggedIn: true });
          setIsLoginModalOpen(false);
          addLog(`GitHub session authenticated. Bound user: ${username}`, 'success');
        }} 
      />
    </div>
  );
}

export default App;
