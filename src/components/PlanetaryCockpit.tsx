import React, { useState, useEffect, useRef } from 'react';
import { 
  Atom, 
  Activity, 
  Terminal, 
  Cpu, 
  RefreshCw, 
  Play, 
  Flame, 
  Droplets, 
  Wind, 
  Mountain, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Trash2, 
  Sparkles,
  Layers,
  Database
} from 'lucide-react';

interface PlanetaryCockpitProps {
  onCommitLog?: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
}

interface LogLine {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'default';
}

interface ServiceStatus {
  name: string;
  port: number;
  status: 'ONLINE' | 'OFFLINE' | 'CHECKING';
  pid?: string;
  details?: string;
}

export const PlanetaryCockpit: React.FC<PlanetaryCockpitProps> = ({ onCommitLog }) => {
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'stack' | 'solidity' | 'python' | 'telemetry'>('stack');
  
  // Service Stack States
  const [services, setServices] = useState<ServiceStatus[]>([
    { name: 'Next.js Frontend', port: 3000, status: 'OFFLINE' },
    { name: 'FastAPI Backend', port: 8000, status: 'OFFLINE' },
    { name: 'WebSockets Service', port: 8001, status: 'OFFLINE' },
    { name: 'ChromaDB Server', port: 8000, status: 'OFFLINE', details: 'Embedded / Port 8000' }
  ]);

  // Foundry States
  const [foundryStatus, setFoundryStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [foundryLogs, setFoundryLogs] = useState<string>('No compilation or test run executed yet.');
  const [foundryStats, setFoundryStats] = useState<{ passed: number; failed: number; total: number } | null>(null);

  // Pytest States
  const [pytestStatus, setPytestStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [pytestLogs, setPytestLogs] = useState<string>('No Python backend tests executed yet.');
  
  // Celestial Energy States (Telemetry)
  const [celestialEnergy, setCelestialEnergy] = useState({
    alchemicalNumber: 4.82,
    monicaConstant: 5.12,
    consciousnessLevel: 'Developing',
    elements: { Fire: 0.28, Water: 0.15, Air: 0.32, Earth: 0.25 },
    kinetics: { Heat: 52.4, Entropy: 41.2, Reactivity: 68.9 },
    planetaryHour: 'Sun',
    dominantElement: 'Air'
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLocalLog = (message: string, type: LogLine['type'] = 'default') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
    if (onCommitLog) {
      onCommitLog(message, type);
    }
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Telemetry animation
  useEffect(() => {
    const interval = setInterval(() => {
      setCelestialEnergy((prev) => {
        const delta = (Math.random() - 0.5) * 0.05;
        const newA = Math.max(1, Math.min(12, Number((prev.alchemicalNumber + delta).toFixed(2))));
        const newHeat = Math.max(10, Math.min(100, Number((prev.kinetics.Heat + (Math.random() - 0.5) * 1.5).toFixed(1))));
        const newEntropy = Math.max(10, Math.min(100, Number((prev.kinetics.Entropy + (Math.random() - 0.5) * 0.8).toFixed(1))));
        const newReactivity = Math.max(10, Math.min(100, Number((prev.kinetics.Reactivity + (Math.random() - 0.5) * 2.1).toFixed(1))));

        return {
          ...prev,
          alchemicalNumber: newA,
          kinetics: { Heat: newHeat, Entropy: newEntropy, Reactivity: newReactivity }
        };
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Initial Status Check
  useEffect(() => {
    checkAllServices();
  }, []);

  const runCommand = async (command: string, cwd?: string): Promise<{ stdout: string; stderr: string; error: string | null }> => {
    try {
      const response = await fetch('/api/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, cwd })
      });
      return await response.json();
    } catch (e: any) {
      return { stdout: '', stderr: e.message, error: e.message };
    }
  };

  const checkAllServices = async () => {
    addLocalLog('Probing system stack ports for active services...', 'info');
    
    // Set services status to checking
    setServices((prev) => prev.map((s) => ({ ...s, status: 'CHECKING' })));

    // Run lsof check
    const { stdout, error } = await runCommand('lsof -i :3000 -i :8000 -i :8001 -P -n | grep LISTEN || true');

    if (error) {
      addLocalLog(`Service probe failed: ${error}`, 'error');
      setServices((prev) => prev.map((s) => ({ ...s, status: 'OFFLINE' })));
      return;
    }

    const updated: ServiceStatus[] = services.map((service) => {
      // Look for a listener matching the port
      const lines = stdout.split('\n');
      const match = lines.find((l) => l.includes(`:${service.port} `) || l.includes(`*:${service.port} `));
      
      if (match) {
        const parts = match.trim().split(/\s+/);
        const pid = parts[1];
        const processName = parts[0];
        
        // Special logic for ChromaDB vs FastAPI (both share port 8000 in local dev)
        if (service.name === 'ChromaDB Server') {
          return {
            ...service,
            status: 'ONLINE' as const,
            pid,
            details: `Docker/Process: ${processName}`
          };
        }

        return {
          ...service,
          status: 'ONLINE' as const,
          pid,
          details: `Process: ${processName}`
        };
      } else {
        return {
          ...service,
          status: 'OFFLINE' as const,
          pid: undefined,
          details: undefined
        };
      }
    });

    setServices(updated);
    addLocalLog('System stack ports scan complete.', 'success');
  };

  const killService = async (service: ServiceStatus) => {
    if (!service.pid) {
      addLocalLog(`Cannot kill ${service.name}: No active PID identified.`, 'warning');
      return;
    }

    addLocalLog(`Executing SIGKILL on PID ${service.pid} for ${service.name}...`, 'info');
    const { error } = await runCommand(`kill -9 ${service.pid}`);

    if (error) {
      addLocalLog(`Failed to terminate service: ${error}`, 'error');
    } else {
      addLocalLog(`${service.name} terminated successfully.`, 'success');
      setTimeout(checkAllServices, 1000);
    }
  };

  const startServiceInCwd = async (serviceName: string, command: string, cwd: string) => {
    addLocalLog(`Launching ${serviceName} in background: '${command}'`, 'info');
    
    // We execute in background using nohup to prevent blocking the Vite response
    const backgroundCmd = `nohup ${command} > /dev/null 2>&1 &`;
    const { error } = await runCommand(backgroundCmd, cwd);

    if (error) {
      addLocalLog(`Failed to launch ${serviceName}: ${error}`, 'error');
    } else {
      addLocalLog(`${serviceName} launch signal sent. Probing ports in 3 seconds...`, 'success');
      setTimeout(checkAllServices, 3000);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    addLocalLog(`Copied ${label} command to clipboard.`, 'info');
  };

  // Run Foundry Compile & Test
  const runFoundryTests = async () => {
    setFoundryStatus('running');
    setFoundryLogs('Compiling smart contracts and executing Foundry tests...\n');
    addLocalLog('Starting Foundry test suite in contracts directory...', 'info');

    const contractsCwd = '../EthGlobalHackathon/AlchmAgentsETH-main/contracts';
    const { stdout, stderr, error } = await runCommand('forge test --gas-report', contractsCwd);

    const fullLog = stdout + '\n' + stderr;
    setFoundryLogs(fullLog);

    if (error || stderr.includes('Error:') || stdout.includes('Failed')) {
      setFoundryStatus('failed');
      addLocalLog('Foundry tests failed. Check compilation errors.', 'error');
    } else {
      setFoundryStatus('success');
      addLocalLog('Foundry test suite executed successfully.', 'success');
    }

    // Parse stats
    const match = stdout.match(/Suite result: (ok|failed)\. (\d+) passed; (\d+) failed;/);
    if (match) {
      setFoundryStats({
        passed: parseInt(match[2]),
        failed: parseInt(match[3]),
        total: parseInt(match[2]) + parseInt(match[3])
      });
    } else {
      const passCount = (stdout.match(/\[PASS\]/g) || []).length;
      const failCount = (stdout.match(/\[FAIL\]/g) || []).length;
      if (passCount > 0 || failCount > 0) {
        setFoundryStats({
          passed: passCount,
          failed: failCount,
          total: passCount + failCount
        });
      } else {
        setFoundryStats(null);
      }
    }
  };

  // Run Pytest Suite
  const runPytests = async () => {
    setPytestStatus('running');
    setPytestLogs('Activating virtualenv and running python test suites...\n');
    addLocalLog('Executing FastAPI backend pytest suite...', 'info');

    const backendCwd = '../EthGlobalHackathon/AlchmAgentsETH-main/backend';
    // Run pytest on the test_main.py file
    const { stdout, stderr, error } = await runCommand('poetry run pytest test_main.py || bun run python3 -m pytest test_main.py || python3 -m pytest test_main.py || pytest test_main.py', backendCwd);

    const fullLog = stdout + '\n' + stderr;
    setPytestLogs(fullLog);

    if (error || fullLog.includes('FAILED') || fullLog.includes('errors during collection')) {
      setPytestStatus('failed');
      addLocalLog('FastAPI python tests failed.', 'error');
    } else {
      setPytestStatus('success');
      addLocalLog('FastAPI backend tests passed.', 'success');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-[#0d0f09] text-[#c5c8b6] font-mono border-t border-[#44483a]">
      {/* Header status strip */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#44483a] bg-[#12140e] px-6 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center border border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e] shadow-[0_0_8px_rgba(157,223,46,0.2)]">
            <Atom className="h-5 w-5 animate-spin-slow" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-[#e3e3d8] tracking-wider uppercase">AlchmAgentsETH Console</div>
            <div className="text-[9px] text-[#8f9282] uppercase mt-0.5">Submission readiness & cockpit control</div>
          </div>
        </div>

        {/* Global Stats */}
        <div className="flex items-center space-x-6 text-[10px]">
          <div className="hidden sm:block border-r border-[#44483a]/60 pr-6">
            <span className="text-[#8f9282]">CELESTIAL HOUR:</span>
            <span className="ml-2 font-bold text-[#9ddf2e]">{celestialEnergy.planetaryHour} hour</span>
          </div>
          <div className="hidden md:block border-r border-[#44483a]/60 pr-6">
            <span className="text-[#8f9282]">DOMINANT ENERGY:</span>
            <span className="ml-2 font-bold text-[#7dd3fc] uppercase flex items-center inline-flex gap-1">
              {celestialEnergy.dominantElement === 'Air' && <Wind className="h-3 w-3 text-[#7dd3fc]" />}
              {celestialEnergy.dominantElement === 'Fire' && <Flame className="h-3 w-3 text-red-400" />}
              {celestialEnergy.dominantElement === 'Water' && <Droplets className="h-3 w-3 text-blue-400" />}
              {celestialEnergy.dominantElement === 'Earth' && <Mountain className="h-3 w-3 text-green-400" />}
              {celestialEnergy.dominantElement}
            </span>
          </div>
          <div>
            <span className="text-[#8f9282]">A# BALANCE:</span>
            <span className="ml-2 font-bold text-[#9ddf2e]">{celestialEnergy.alchemicalNumber} (±0.01°)</span>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Control Panel Column (60% width) */}
        <div className="w-full lg:w-[60%] flex flex-col border-r border-[#44483a] min-h-0 overflow-y-auto custom-scrollbar">
          
          {/* Sub Navigation Tabs */}
          <div className="flex shrink-0 border-b border-[#44483a] bg-[#12140e] p-1 gap-1">
            <button 
              onClick={() => setActiveSubTab('stack')}
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition ${activeSubTab === 'stack' ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-transparent text-[#8f9282] hover:text-[#c5c8b6]'}`}
            >
              <Cpu className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Stack Monitor
            </button>
            <button 
              onClick={() => setActiveSubTab('solidity')}
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition ${activeSubTab === 'solidity' ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-transparent text-[#8f9282] hover:text-[#c5c8b6]'}`}
            >
              <Layers className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Solidity Contracts (Foundry)
            </button>
            <button 
              onClick={() => setActiveSubTab('python')}
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition ${activeSubTab === 'python' ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-transparent text-[#8f9282] hover:text-[#c5c8b6]'}`}
            >
              <Activity className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Python backend (pytest)
            </button>
            <button 
              onClick={() => setActiveSubTab('telemetry')}
              className={`px-4 py-2 text-[10px] uppercase font-bold tracking-wider border cursor-pointer transition ${activeSubTab === 'telemetry' ? 'border-[#9ddf2e] text-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-transparent text-[#8f9282] hover:text-[#c5c8b6]'}`}
            >
              <Sparkles className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
              Celestial Telemetry
            </button>
          </div>

          <div className="flex-1 p-6">
            
            {/* Tab 1: Stack Monitor */}
            {activeSubTab === 'stack' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#e3e3d8]">Local Services Status</h2>
                  <button 
                    onClick={checkAllServices}
                    className="flex items-center gap-1.5 border border-[#44483a] bg-[#12140e] hover:bg-[#1b1c16] px-2.5 py-1 text-[10px] font-bold text-[#c5c8b6] hover:text-[#9ddf2e] transition cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" />
                    RE-SCAN PORTS
                  </button>
                </div>

                <div className="grid gap-3">
                  {services.map((service) => (
                    <div key={service.name} className="border border-[#44483a] bg-[#12140e] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs font-bold text-[#e3e3d8] flex items-center gap-2">
                          <span>{service.name}</span>
                          <span className="text-[10px] font-normal text-[#8f9282] font-mono">(:{service.port})</span>
                        </div>
                        <div className="text-[10px] text-[#8f9282] mt-1 font-mono">
                          {service.status === 'ONLINE' 
                            ? service.details 
                            : service.status === 'CHECKING' 
                              ? 'Scanning port listener...' 
                              : 'No service listening on this port'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Status tag */}
                        <div className={`px-2 py-0.5 text-[9px] font-bold border rounded-sm ${
                          service.status === 'ONLINE' 
                            ? 'border-[#9ddf2e]/40 bg-[#9ddf2e]/5 text-[#9ddf2e]' 
                            : service.status === 'CHECKING' 
                              ? 'border-yellow-500/40 bg-yellow-500/5 text-yellow-500' 
                              : 'border-red-500/40 bg-red-500/5 text-red-500'
                        }`}>
                          {service.status}
                        </div>

                        {/* Actions */}
                        {service.status === 'ONLINE' ? (
                          <button
                            onClick={() => killService(service)}
                            className="border border-red-500/30 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-bold text-[9px] uppercase px-2 py-1 transition cursor-pointer"
                          >
                            Kill Process
                          </button>
                        ) : (
                          <div className="flex gap-2">
                            {service.name.includes('Frontend') && (
                              <button
                                onClick={() => startServiceInCwd('Frontend', 'bun run dev', '../EthGlobalHackathon/AlchmAgentsETH-main')}
                                className="border border-[#9ddf2e]/40 hover:border-[#9ddf2e] bg-[#9ddf2e]/5 hover:bg-[#9ddf2e]/10 text-[#9ddf2e] font-bold text-[9px] uppercase px-2 py-1 transition cursor-pointer"
                              >
                                Launch Bun Dev
                              </button>
                            )}
                            {service.name.includes('Backend') && (
                              <button
                                onClick={() => startServiceInCwd('Backend', 'python3 -m uvicorn main:app --reload --port 8000', '../EthGlobalHackathon/AlchmAgentsETH-main/backend')}
                                className="border border-[#9ddf2e]/40 hover:border-[#9ddf2e] bg-[#9ddf2e]/5 hover:bg-[#9ddf2e]/10 text-[#9ddf2e] font-bold text-[9px] uppercase px-2 py-1 transition cursor-pointer"
                              >
                                Launch FastAPI
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Commands Helper Card */}
                <div className="border border-[#44483a] bg-[#12140e] p-4">
                  <h3 className="text-xs font-bold text-[#e3e3d8] flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-[#9ddf2e]" />
                    Manual Orchestration Commands
                  </h3>
                  <p className="text-[10px] text-[#8f9282] mt-1">If you prefer running services inside your workspace terminal, copy these verified commands:</p>
                  
                  <div className="space-y-3 mt-4 text-[10px]">
                    <div className="flex items-center justify-between border-b border-[#44483a]/40 pb-2">
                      <div>
                        <div className="font-bold text-[#c5c8b6]">1. Frontend Next.js (port 3000)</div>
                        <div className="font-mono text-[#8f9282] mt-0.5">bun --bun run dev</div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard('bun --bun run dev', 'Next.js Dev')}
                        className="p-1 border border-[#44483a] hover:border-[#9ddf2e] hover:text-[#9ddf2e] cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between border-b border-[#44483a]/40 pb-2">
                      <div>
                        <div className="font-bold text-[#c5c8b6]">2. Backend FastAPI (port 8000)</div>
                        <div className="font-mono text-[#8f9282] mt-0.5">cd backend && uvicorn main:app --reload --port 8000</div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard('cd backend && uvicorn main:app --reload --port 8000', 'FastAPI Uvicorn')}
                        className="p-1 border border-[#44483a] hover:border-[#9ddf2e] hover:text-[#9ddf2e] cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-[#c5c8b6]">3. Planetary Hour MCP Server</div>
                        <div className="font-mono text-[#8f9282] mt-0.5">cd backend && python3 planetary_agents_mcp_server.py</div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard('cd backend && python3 planetary_agents_mcp_server.py', 'MCP Server')}
                        className="p-1 border border-[#44483a] hover:border-[#9ddf2e] hover:text-[#9ddf2e] cursor-pointer"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Solidity Foundry Deck */}
            {activeSubTab === 'solidity' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#e3e3d8]">Foundry Solidity Contracts</h2>
                    <p className="text-[10px] text-[#8f9282] mt-0.5 font-mono">Target: EsmsToken.sol (contracts/src/EsmsToken.sol)</p>
                  </div>
                  <button 
                    onClick={runFoundryTests}
                    disabled={foundryStatus === 'running'}
                    className={`flex items-center gap-1.5 border border-[#9ddf2e] bg-[#9ddf2e] px-4 py-1.5 text-[10px] font-bold text-[#0d0f09] hover:bg-[#83c300] transition cursor-pointer disabled:opacity-50`}
                  >
                    {foundryStatus === 'running' ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        RUNNING TESTS...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-[#0d0f09]" />
                        RUN FORGE TESTS
                      </>
                    )}
                  </button>
                </div>

                {/* Foundry Stats Summary */}
                {foundryStats && (
                  <div className="border border-[#44483a] bg-[#12140e] p-4 flex justify-around items-center text-center">
                    <div>
                      <div className="text-[10px] text-[#8f9282] uppercase">Solidity Tests</div>
                      <div className="text-xl font-bold text-[#e3e3d8] mt-1">{foundryStats.total} total</div>
                    </div>
                    <div className="h-8 w-px bg-[#44483a]" />
                    <div>
                      <div className="text-[10px] text-[#8f9282] uppercase">Passed</div>
                      <div className="text-xl font-bold text-[#9ddf2e] mt-1">{foundryStats.passed}</div>
                    </div>
                    <div className="h-8 w-px bg-[#44483a]" />
                    <div>
                      <div className="text-[10px] text-[#8f9282] uppercase">Failed</div>
                      <div className="text-xl font-bold text-red-500 mt-1">{foundryStats.failed}</div>
                    </div>
                  </div>
                )}

                {/* Console Output */}
                <div className="border border-[#44483a] flex flex-col bg-[#050604] min-h-[300px]">
                  <div className="border-b border-[#44483a] bg-[#12140e] px-4 py-2 flex items-center justify-between text-[10px] font-bold text-[#8f9282]">
                    <span className="flex items-center gap-1.5 uppercase">
                      <Terminal className="h-3.5 w-3.5 text-[#9ddf2e]" />
                      Forge Console Output
                    </span>
                    <button 
                      onClick={() => setFoundryLogs('Logs cleared.')}
                      className="hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <pre className="flex-1 p-4 overflow-auto max-h-[350px] text-[10px] leading-relaxed text-[#c5c8b6] font-mono whitespace-pre-wrap">
                    {foundryLogs}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 3: Python backend pytest */}
            {activeSubTab === 'python' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#e3e3d8]">FastAPI Pytest Runner</h2>
                    <p className="text-[10px] text-[#8f9282] mt-0.5 font-mono">Target: backend/test_main.py (Uvicorn API endpoints)</p>
                  </div>
                  <button 
                    onClick={runPytests}
                    disabled={pytestStatus === 'running'}
                    className={`flex items-center gap-1.5 border border-[#9ddf2e] bg-[#9ddf2e] px-4 py-1.5 text-[10px] font-bold text-[#0d0f09] hover:bg-[#83c300] transition cursor-pointer disabled:opacity-50`}
                  >
                    {pytestStatus === 'running' ? (
                      <>
                        <RefreshCw className="h-3 w-3 animate-spin" />
                        RUNNING PYTEST...
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-[#0d0f09]" />
                        RUN BACKEND TESTS
                      </>
                    )}
                  </button>
                </div>

                {/* Test results banner */}
                {pytestStatus !== 'idle' && (
                  <div className={`border p-4 flex items-center gap-3 ${
                    pytestStatus === 'success' 
                      ? 'border-[#9ddf2e]/40 bg-[#9ddf2e]/5 text-[#9ddf2e]' 
                      : pytestStatus === 'failed' 
                        ? 'border-red-500/40 bg-red-500/5 text-red-500' 
                        : 'border-yellow-500/40 bg-yellow-500/5 text-yellow-500'
                  }`}>
                    {pytestStatus === 'success' && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                    {pytestStatus === 'failed' && <AlertTriangle className="h-5 w-5 shrink-0" />}
                    {pytestStatus === 'running' && <RefreshCw className="h-5 w-5 shrink-0 animate-spin" />}
                    <div>
                      <div className="text-xs font-bold uppercase font-mono">
                        {pytestStatus === 'success' ? 'All Python Backend Tests Passed' : pytestStatus === 'failed' ? 'Python Tests Failed' : 'Executing Python Test Framework...'}
                      </div>
                      <div className="text-[9px] opacity-80 mt-0.5">
                        {pytestStatus === 'success' ? 'Gateway endpoint configurations are secure.' : pytestStatus === 'failed' ? 'Check python dependency mismatches or database connectivity.' : 'Running uvicorn environment probe tests...'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pytest Output */}
                <div className="border border-[#44483a] flex flex-col bg-[#050604] min-h-[300px]">
                  <div className="border-b border-[#44483a] bg-[#12140e] px-4 py-2 flex items-center justify-between text-[10px] font-bold text-[#8f9282]">
                    <span className="flex items-center gap-1.5 uppercase">
                      <Terminal className="h-3.5 w-3.5 text-[#9ddf2e]" />
                      Pytest Console Output
                    </span>
                    <button 
                      onClick={() => setPytestLogs('Logs cleared.')}
                      className="hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                  <pre className="flex-1 p-4 overflow-auto max-h-[350px] text-[10px] leading-relaxed text-[#c5c8b6] font-mono whitespace-pre-wrap">
                    {pytestLogs}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 4: Celestial Telemetry */}
            {activeSubTab === 'telemetry' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-[12px] font-bold uppercase tracking-wider text-[#e3e3d8]">Live Celestial Energy Telemetry</h2>
                  <p className="text-[10px] text-[#8f9282] mt-0.5 font-mono">Synchronized with astronomical ephemeris positions</p>
                </div>

                {/* Energy Matrix Progress Bars */}
                <div className="border border-[#44483a] bg-[#12140e] p-6 space-y-4">
                  <h3 className="text-xs font-bold text-[#e3e3d8] flex items-center gap-1.5 uppercase border-b border-[#44483a] pb-2">
                    <Sparkles className="h-3.5 w-3.5 text-[#9ddf2e]" />
                    SMES Distribution Metrics
                  </h3>

                  <div className="space-y-3 pt-2 text-[11px]">
                    {/* Spirit */}
                    <div>
                      <div className="flex justify-between text-[#8f9282] font-bold">
                        <span className="flex items-center gap-1 text-yellow-400"><Wind className="h-3.5 w-3.5" /> SPIRIT (AIR)</span>
                        <span className="text-[#e3e3d8] font-mono">{(celestialEnergy.elements.Air * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-[#1b1c16] border border-[#44483a] h-2.5 mt-1.5">
                        <div className="bg-[#9ddf2e] h-full transition-all duration-1000" style={{ width: `${celestialEnergy.elements.Air * 100}%` }} />
                      </div>
                    </div>

                    {/* Matter */}
                    <div>
                      <div className="flex justify-between text-[#8f9282] font-bold">
                        <span className="flex items-center gap-1 text-[#7dd3fc]"><Droplets className="h-3.5 w-3.5" /> MATTER (WATER)</span>
                        <span className="text-[#e3e3d8] font-mono">{(celestialEnergy.elements.Water * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-[#1b1c16] border border-[#44483a] h-2.5 mt-1.5">
                        <div className="bg-[#7dd3fc] h-full transition-all duration-1000" style={{ width: `${celestialEnergy.elements.Water * 100}%` }} />
                      </div>
                    </div>

                    {/* Essence */}
                    <div>
                      <div className="flex justify-between text-[#8f9282] font-bold">
                        <span className="flex items-center gap-1 text-green-400"><Mountain className="h-3.5 w-3.5" /> ESSENCE (EARTH)</span>
                        <span className="text-[#e3e3d8] font-mono">{(celestialEnergy.elements.Earth * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-[#1b1c16] border border-[#44483a] h-2.5 mt-1.5">
                        <div className="bg-[#22c55e] h-full transition-all duration-1000" style={{ width: `${celestialEnergy.elements.Earth * 100}%` }} />
                      </div>
                    </div>

                    {/* Substance */}
                    <div>
                      <div className="flex justify-between text-[#8f9282] font-bold">
                        <span className="flex items-center gap-1 text-red-400"><Flame className="h-3.5 w-3.5" /> SUBSTANCE (FIRE)</span>
                        <span className="text-[#e3e3d8] font-mono">{(celestialEnergy.elements.Fire * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-[#1b1c16] border border-[#44483a] h-2.5 mt-1.5">
                        <div className="bg-[#ef4444] h-full transition-all duration-1000" style={{ width: `${celestialEnergy.elements.Fire * 100}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kinetics & Thermodynamics Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-[#44483a] bg-[#12140e] p-4 text-center">
                    <div className="text-[10px] text-[#8f9282] uppercase">Heat (Thermodynamics)</div>
                    <div className="text-2xl font-bold text-[#e3e3d8] mt-2 flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5 text-red-500" />
                      {celestialEnergy.kinetics.Heat}°C
                    </div>
                  </div>

                  <div className="border border-[#44483a] bg-[#12140e] p-4 text-center">
                    <div className="text-[10px] text-[#8f9282] uppercase">Entropy (Thermodynamics)</div>
                    <div className="text-2xl font-bold text-[#e3e3d8] mt-2 flex items-center justify-center gap-1">
                      <Wind className="h-5 w-5 text-[#8f9282]" />
                      {celestialEnergy.kinetics.Entropy} J/K
                    </div>
                  </div>

                  <div className="border border-[#44483a] bg-[#12140e] p-4 text-center">
                    <div className="text-[10px] text-[#8f9282] uppercase">Reactivity (Kinetics)</div>
                    <div className="text-2xl font-bold text-[#e3e3d8] mt-2 flex items-center justify-center gap-1">
                      <Activity className="h-5 w-5 text-[#9ddf2e]" />
                      {celestialEnergy.kinetics.Reactivity} m/s
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Console Log Panel (40% width) */}
        <div className="w-full lg:w-[40%] flex flex-col h-full bg-[#12140e] min-h-[200px] lg:min-h-0">
          <div className="shrink-0 border-b border-[#44483a] bg-[#1f201a] px-6 py-4 flex items-center justify-between text-[11px] font-bold text-[#e3e3d8] tracking-wider uppercase font-mono">
            <span className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#9ddf2e]" />
              Submission Log Terminal
            </span>
            <button 
              onClick={() => setLogs([])}
              className="text-[9px] border border-[#44483a] px-2 py-0.5 hover:border-red-500 hover:text-red-500 transition cursor-pointer"
            >
              CLEAR
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar font-mono text-[11px] leading-relaxed space-y-2.5 bg-[#0d0f09]">
            {logs.length === 0 ? (
              <div className="text-[#8f9282] italic text-center mt-12">No console operations recorded. Actions will output results here.</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="flex items-start space-x-2 border-b border-[#44483a]/10 pb-1.5 last:border-b-0">
                  <span className="text-[#8f9282] shrink-0">[{log.timestamp}]</span>
                  <span className={`break-all ${
                    log.type === 'info' 
                      ? 'text-[#7dd3fc]' 
                      : log.type === 'success' 
                        ? 'text-[#9ddf2e]' 
                        : log.type === 'warning' 
                          ? 'text-yellow-500' 
                          : log.type === 'error' 
                            ? 'text-red-500' 
                            : 'text-[#c5c8b6]'
                  }`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};
