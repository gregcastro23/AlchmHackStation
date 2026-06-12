import { useState, useEffect, useRef, useCallback } from 'react';
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
import { UsageLimitsView } from './components/UsageLimitsView';
import { ModelAccountsView } from './components/ModelAccountsView';
import { RoutingGuardrailsView } from './components/RoutingGuardrailsView';
import { IntegrationOpsView } from './components/IntegrationOpsView';
import { SwarmNexus } from './components/SwarmNexus';
import { OvermindConsole } from './components/OvermindConsole';
import { HackathonSpace } from './components/HackathonSpace';
import { DiscordLiveFeed } from './components/DiscordLiveFeed';
import type { HackathonTrack } from './components/HackathonSpace';
import { WorkstationLockOverlay } from './components/WorkstationLockOverlay';
import { decomposeIdea, LANGUAGE_NAMES, LANGUAGES } from './lib/swarmEngine';
import {
  clearPlatformBiometric,
  enrollPlatformBiometric,
  getStoredWorkstationCredential,
  supportsPlatformBiometrics,
  verifyPlatformBiometric,
} from './lib/workstationSecurity';
import {
  buildMediaProvenanceManifest,
  getCaptureDeviceContext,
  hashCaptureSegment,
  requestCaptureLocation,
} from './lib/mediaProvenance';
import type {
  CaptureDeviceContext,
  CaptureLocation,
  CaptureSegmentProof,
  MediaProvenanceManifest,
} from './lib/mediaProvenance';

interface SecurityRecording {
  url: string;
  filename: string;
  durationSeconds: number;
  size: number;
  proofUrl: string | null;
  proofFilename: string | null;
  manifest: MediaProvenanceManifest | null;
}

type SecurityPhase = 'idle' | 'enrolling' | 'arming' | 'locked' | 'verifying';

function App() {
  const [foundryState, setFoundryState] = useState<'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [blockHeight, setBlockHeight] = useState(788291);
  const [activeCommand, setActiveCommand] = useState('forge build');
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([
    { timestamp: '23:41:00', text: 'ETHGlobal New York 2026 build room initialized', type: 'info' },
    { timestamp: '23:41:02', text: 'space-time database local client connected to: spacetime_instance_local', type: 'info' },
    { timestamp: '23:41:05', text: 'vercel sync: matches development branch env_4c29', type: 'success' },
    { timestamp: '23:41:08', text: 'bun run forge build', type: 'default' },
    { timestamp: '23:41:08', text: 'compiling 37 contracts with solc 0.8.26', type: 'info' },
    { timestamp: '23:41:09', text: 'gas snapshot delta -8.2%', type: 'warning' },
    { timestamp: '23:41:09', text: 'deployment reducer emitted verified address: 0x5FbDB2315678afecb367f032d93F642f64180aa3', type: 'success' },
    { timestamp: '23:41:10', text: 'spacetime sync committed ActivityLog row', type: 'success' },
  ]);

  // Combined V2 states
  const [activeTab, setActiveTab] = useState<string>('hackathon-space');
  const [missionReadiness, setMissionReadiness] = useState(86);
  const [budgetUtilization, setBudgetUtilization] = useState(42);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [gitHubUser, setGitHubUser] = useState<{ username: string; avatarUrl: string; isLoggedIn: boolean } | null>(null);
  const [securityCredentialId, setSecurityCredentialId] = useState<string | null>(() => getStoredWorkstationCredential());
  const [securityPhase, setSecurityPhase] = useState<SecurityPhase>('idle');
  const [securityStream, setSecurityStream] = useState<MediaStream | null>(null);
  const [securityStartedAt, setSecurityStartedAt] = useState(0);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [lastSecurityRecording, setLastSecurityRecording] = useState<SecurityRecording | null>(null);
  const [includeSecurityLocation, setIncludeSecurityLocation] = useState(false);
  const securityRecorderRef = useRef<MediaRecorder | null>(null);
  const securityChunksRef = useRef<Blob[]>([]);
  const securityStreamRef = useRef<MediaStream | null>(null);
  const securityRecordingUrlRef = useRef<string | null>(null);
  const securityProofUrlRef = useRef<string | null>(null);
  const securitySegmentsRef = useRef<CaptureSegmentProof[]>([]);
  const securitySegmentSequenceRef = useRef(0);
  const securityHashQueueRef = useRef<Promise<void>>(Promise.resolve());
  const securityCaptureIdRef = useRef('');
  const securityDeviceContextRef = useRef<CaptureDeviceContext | null>(null);
  const securityLocationRef = useRef<CaptureLocation | null>(null);

  // App Builder Customizer states
  const [language, setLanguage] = useState<string>('TypeScript');
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

  useEffect(() => () => {
    const recorder = securityRecorderRef.current;
    if (recorder) {
      recorder.ondataavailable = null;
      recorder.onstop = null;
      if (recorder.state !== 'inactive') recorder.stop();
    }
    securityStreamRef.current?.getTracks().forEach((track) => track.stop());
    if (securityRecordingUrlRef.current) URL.revokeObjectURL(securityRecordingUrlRef.current);
    if (securityProofUrlRef.current) URL.revokeObjectURL(securityProofUrlRef.current);
  }, []);

  const getSecurityError = (error: unknown, fallback: string) => {
    if (error instanceof DOMException && error.name === 'NotAllowedError') {
      return 'The request was cancelled or permission was denied.';
    }
    return error instanceof Error ? error.message : fallback;
  };

  const handleEnrollBiometric = async () => {
    setSecurityError(null);
    setSecurityPhase('enrolling');
    try {
      const isAvailable = await supportsPlatformBiometrics();
      if (!isAvailable) throw new Error('No platform biometric authenticator is available in this browser.');
      const credentialId = await enrollPlatformBiometric();
      setSecurityCredentialId(credentialId);
      addLog('Workstation biometric enrolled with required local user verification.', 'success');
    } catch (error) {
      const message = getSecurityError(error, 'Biometric enrollment failed.');
      setSecurityError(message);
      addLog(`Workstation biometric enrollment failed: ${message}`, 'warning');
    } finally {
      setSecurityPhase('idle');
    }
  };

  const handleForgetBiometric = () => {
    clearPlatformBiometric();
    setSecurityCredentialId(null);
    setSecurityError(null);
    addLog('Local workstation biometric binding removed from this browser.', 'info');
  };

  const handleArmSecurity = async () => {
    if (!securityCredentialId) {
      setActiveTab('security');
      setSecurityError('Enroll this laptop\'s platform biometric before locking the space.');
      addLog('Workstation lock requires biometric enrollment first.', 'warning');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setActiveTab('security');
      setSecurityError('This browser does not support the required camera recording APIs.');
      return;
    }

    setSecurityError(null);
    setSecurityPhase('arming');
    let stream: MediaStream | null = null;

    try {
      securityLocationRef.current = null;
      if (includeSecurityLocation) {
        try {
          securityLocationRef.current = await requestCaptureLocation();
          addLog('Location consent granted for the next local provenance manifest.', 'info');
        } catch (error) {
          addLog(`Location was not included in provenance: ${getSecurityError(error, 'Unavailable')}`, 'warning');
        }
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      const preferredTypes = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/mp4'];
      const mimeType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(stream, {
        ...(mimeType ? { mimeType } : {}),
        videoBitsPerSecond: 1_000_000,
      });
      const startedAt = Date.now();

      securityChunksRef.current = [];
      securitySegmentsRef.current = [];
      securitySegmentSequenceRef.current = 0;
      securityHashQueueRef.current = Promise.resolve();
      securityCaptureIdRef.current = window.crypto.randomUUID();
      securityDeviceContextRef.current = getCaptureDeviceContext(stream);
      recorder.ondataavailable = (event) => {
        if (event.data.size === 0) return;
        securityChunksRef.current.push(event.data);
        const sequence = securitySegmentSequenceRef.current;
        securitySegmentSequenceRef.current += 1;
        const capturedAt = new Date().toISOString();
        securityHashQueueRef.current = securityHashQueueRef.current.then(async () => {
          const previousChainHash = securitySegmentsRef.current.at(-1)?.chainHash ?? null;
          const proof = await hashCaptureSegment(event.data, sequence, capturedAt, previousChainHash);
          securitySegmentsRef.current.push(proof);
        });
      };
      recorder.onerror = () => {
        setSecurityError('The local camera recording encountered an error.');
      };
      recorder.onstop = async () => {
        await securityHashQueueRef.current;
        const blob = new Blob(securityChunksRef.current, { type: recorder.mimeType || 'video/webm' });
        if (blob.size === 0) return;
        const completedAt = Date.now();
        const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
        const filename = `ethstation-security-${new Date(startedAt).toISOString().replace(/[:.]/g, '-')}.${extension}`;
        const url = URL.createObjectURL(blob);
        let manifest: MediaProvenanceManifest | null = null;
        let proofUrl: string | null = null;
        let proofFilename: string | null = null;

        try {
          if (!securityDeviceContextRef.current) throw new Error('Capture device context was unavailable.');
          manifest = await buildMediaProvenanceManifest({
            captureId: securityCaptureIdRef.current,
            startedAt,
            completedAt,
            filename,
            media: blob,
            segments: securitySegmentsRef.current,
            device: securityDeviceContextRef.current,
            location: securityLocationRef.current,
            locationConsent: includeSecurityLocation,
            biometricCredentialId: securityCredentialId,
          });
          proofFilename = filename.replace(/\.[^.]+$/, '.provenance.json');
          proofUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }));
        } catch (error) {
          const message = getSecurityError(error, 'Unable to generate the provenance manifest.');
          setSecurityError(message);
          addLog(`Video saved, but provenance generation failed: ${message}`, 'warning');
        }

        const recording: SecurityRecording = {
          url,
          filename,
          durationSeconds: Math.max(1, Math.round((completedAt - startedAt) / 1000)),
          size: blob.size,
          proofUrl,
          proofFilename,
          manifest,
        };
        securityRecordingUrlRef.current = recording.url;
        securityProofUrlRef.current = recording.proofUrl;
        setLastSecurityRecording((previous) => {
          if (previous) URL.revokeObjectURL(previous.url);
          if (previous?.proofUrl) URL.revokeObjectURL(previous.proofUrl);
          return recording;
        });
        if (manifest) {
          addLog(`Provenance proof created: ${manifest.captureProof.segmentCount} chained segments; anchor status UNANCHORED.`, 'success');
        }
      };

      securityRecorderRef.current = recorder;
      securityStreamRef.current = stream;
      recorder.start(1000);
      setSecurityStream(stream);
      setSecurityStartedAt(startedAt);
      setSecurityPhase('locked');
      addLog('SPACE LOCKED: local camera recording active; biometric verification required.', 'warning');
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      const message = getSecurityError(error, 'Unable to arm workstation security.');
      setSecurityError(message);
      setSecurityPhase('idle');
      setActiveTab('security');
      addLog(`Workstation security was not armed: ${message}`, 'warning');
    }
  };

  const handleUnlockSecurity = async () => {
    const credentialId = securityCredentialId ?? getStoredWorkstationCredential();
    if (!credentialId) {
      setSecurityError('The local biometric binding is missing. Close the browser and use operating-system recovery.');
      return;
    }

    setSecurityError(null);
    setSecurityPhase('verifying');
    try {
      await verifyPlatformBiometric(credentialId);
      const recorder = securityRecorderRef.current;
      if (recorder && recorder.state !== 'inactive') recorder.stop();
      securityStream?.getTracks().forEach((track) => track.stop());
      securityStreamRef.current = null;
      securityRecorderRef.current = null;
      setSecurityStream(null);
      setSecurityPhase('idle');
      addLog('SPACE UNLOCKED: platform biometric verified; local recording finalized.', 'success');
    } catch (error) {
      const message = getSecurityError(error, 'Biometric verification failed.');
      setSecurityError(message);
      setSecurityPhase('locked');
      addLog(`Workstation remains locked: ${message}`, 'warning');
    }
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
        addLog('Available commands: nexus, overmind, languages, forge idea, forge build, forge test, anvil, clear, help, ship demo, readiness, agent swarm, usage report, model accounts, route health, integration status, auth watch, v0 handoff', 'info');
      } else if (cleanCmd === 'nexus' || cleanCmd === 'swarm nexus' || cleanCmd === 'crucible' || cleanCmd === 'forge idea') {
        addLog('Opening Swarm Nexus — The Crucible. Type an idea and forge it across the agent swarm.', 'success');
        setActiveTab('swarm-nexus');
      } else if (cleanCmd === 'overmind' || cleanCmd === 'ai') {
        addLog('Opening Overmind — live agentic build authority. Bind an Anthropic key to bring it online.', 'success');
        setActiveTab('overmind');
      } else if (cleanCmd === 'languages' || cleanCmd === 'langs') {
        addLog(`Polyglot foundry online — ${LANGUAGES.length} language toolchains armed: ${LANGUAGE_NAMES.join(', ')}.`, 'success');
        addLog(`Active core language: ${language}. Switch via the App Builder Configurator or Overmind set_stack.`, 'info');
      } else if (cleanCmd === 'ship demo') {
        addLog('Mission Control queued demo run: build, proof feed, pitch packet, deploy seal.', 'info');
        setMissionReadiness((prev) => Math.min(97, prev + 2));
        handleRunBuild();
      } else if (cleanCmd === 'readiness') {
        addLog(`Mission readiness score: ${missionReadiness}/100. Final blocker: production deploy seal.`, 'info');
      } else if (cleanCmd === 'agent swarm') {
        addLog('Architect, Builder, Designer, QA, Pitch Coach, and Deploy Captain synced.', 'success');
        addLog('Agent board updated: 2 active builds, 1 review, 1 deploy blocker.', 'info');
      } else if (cleanCmd === 'usage report') {
        addLog(`Usage report: ${budgetUtilization}% monthly budget utilized, 43% cache hit rate, 2 approvals pending.`, 'info');
        setActiveTab('usage-limits');
      } else if (cleanCmd === 'model accounts') {
        addLog('Opening model account vault: 4 connected providers, 5 stable aliases.', 'info');
        setActiveTab('model-accounts');
      } else if (cleanCmd === 'route health') {
        addLog('Route health: 99.6% success, 18 fallbacks, Google circuit half-open.', 'warning');
        setActiveTab('routing-guardrails');
      } else if (cleanCmd === 'integration status') {
        addLog('Integration preflight: 6 adapters registered; CLI auth and browser sessions require operator review.', 'info');
        setActiveTab('integration-ops');
      } else if (cleanCmd === 'auth watch') {
        addLog('Auth Watch armed: bounded probes, redacted output, operator-confirmed reauthentication.', 'success');
        setActiveTab('integration-ops');
      } else if (cleanCmd === 'v0 handoff') {
        addLog('v0 Bridge opened: prepare source files, locked paths, acceptance criteria, and generation budget.', 'info');
        setActiveTab('integration-ops');
      } else {
        addLog(`executing custom sidecar process: ${cmd}`, 'info');
        setTimeout(() => {
          addLog(`Process exit 0: ${cmd}`, 'success');
        }, 500);
      }
    }, 200);
  };

  const handleApplyConfig = () => {
    const lang = LANGUAGES.find((l) => l.name === language);
    addLog(`[SYS] Reconfiguring project specs: ${language} + ${framework} + ${cssEngine} + ${database}...`, 'info');
    setTimeout(() => {
      addLog(`✓ Core language toolchain armed: ${lang ? `${lang.name} (${lang.toolchain}, tests via ${lang.testCmd})` : language}`, 'success');
      addLog(`✓ Framework compiler mapped to ${framework}`, 'success');
      addLog(`✓ Style injection hooks set to ${cssEngine}`, 'success');
      addLog(`✓ Database schema sync redirected to ${database}`, 'success');
      addLog('Project workspace configuration RECONCILED successfully.', 'success');
    }, 450);
  };

  // --- Overmind bridge: stable callbacks over always-fresh state ---
  const stationRef = useRef({
    missionReadiness, foundryState, language, framework, cssEngine, database, blockHeight, budgetUtilization, logs,
  });
  useEffect(() => {
    stationRef.current = {
      missionReadiness, foundryState, language, framework, cssEngine, database, blockHeight, budgetUtilization, logs,
    };
  }, [missionReadiness, foundryState, language, framework, cssEngine, database, blockHeight, budgetUtilization, logs]);

  const getStationState = useCallback(() => {
    const s = stationRef.current;
    const lang = LANGUAGES.find((l) => l.name === s.language);
    return {
      missionReadiness: s.missionReadiness,
      foundryState: s.foundryState,
      stack: {
        language: s.language,
        toolchain: lang?.toolchain ?? 'unknown',
        framework: s.framework,
        cssEngine: s.cssEngine,
        database: s.database,
      },
      supportedLanguages: LANGUAGE_NAMES,
      blockHeight: s.blockHeight,
      budgetUtilization: s.budgetUtilization,
      recentLogs: s.logs.slice(-12).map((l) => `[${l.timestamp}] ${l.text}`),
    };
  }, []);

  const applyStack = useCallback((patch: { language?: string; framework?: string; cssEngine?: string; database?: string }) => {
    if (patch.language) setLanguage(patch.language);
    if (patch.framework) setFramework(patch.framework);
    if (patch.cssEngine) setCssEngine(patch.cssEngine);
    if (patch.database) setDatabase(patch.database);
  }, []);

  const handleOvermindForge = useCallback((idea: string, pattern: string) => {
    const plan = decomposeIdea(idea);
    window.dispatchEvent(new CustomEvent('alchm:forge', { detail: { idea, pattern } }));
    setActiveTab('swarm-nexus');
    return JSON.stringify({
      forged: true,
      pattern,
      headline: plan.headline,
      taskCount: plan.tasks.length,
      domains: plan.domains.map((d) => d.label),
      stack: plan.stack,
      totalComplexity: plan.totalComplexity,
    });
  }, []);

  const handleStartHackathonBuild = useCallback((idea: string, track: HackathonTrack) => {
    const trackLabels: Record<HackathonTrack, string> = {
      'from-scratch': 'From Scratch',
      'extend-open-source': 'Extend Open Source',
      'ship-a-feature': 'Ship a Feature',
    };
    addLog(`[ETHGLOBAL] Forging "${idea}" on the ${trackLabels[track]} track.`, 'success');
    handleOvermindForge(idea, 'swarm');
  }, [handleOvermindForge]);

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
        language,
        framework,
        cssEngine,
        database,
      },
      mission: {
        readiness: missionReadiness,
        demoTarget: 'real-time hackathon command center',
        crew: ['Architect', 'Builder', 'Designer', 'QA', 'Pitch Coach', 'Deploy Captain'],
      },
      operations: {
        budgetUtilization,
        modelAccounts: 4,
        modelAliases: 5,
        routingProfile: 'Balanced',
        approvalGates: ['high-spend', 'production-deploy'],
        integrations: ['Antigravity', 'Claude Code', 'Stitch', 'Codex', 'v0', 'Vercel'],
        authWatch: 'operator-confirmed',
        contextPacketSchema: 1,
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
- **App Stack**: ${language} // ${framework} // ${cssEngine} // ${database}
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
        language,
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
- **Budget Utilization**: ${budgetUtilization}%
- **App Stack**: ${language} // ${framework} // ${cssEngine} // ${database}
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
        language,
        framework,
        missionReadiness,
        budgetUtilization,
        modelAccounts: 4,
        routingProfile: 'Balanced',
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
          budgetUtilization={budgetUtilization}
          language={language}
          framework={framework}
          cssEngine={cssEngine}
          database={database}
          securityReady={Boolean(securityCredentialId)}
          securityBusy={securityPhase === 'arming' || securityPhase === 'enrolling'}
          onLockSpace={handleArmSecurity}
        />

        {/* Horizontal Split for Sidebar + Content Pane */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 relative">
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
            {activeTab === 'hackathon-space' && (
              <HackathonSpace
                missionReadiness={missionReadiness}
                foundryState={foundryState}
                gitHubConnected={Boolean(gitHubUser?.isLoggedIn)}
                onNavigate={setActiveTab}
                onCommitLog={addLog}
                onStartBuild={handleStartHackathonBuild}
              />
            )}

            {/* Persistent modules — stay mounted so the swarm sim and Overmind's
                live agent run survive tab switches */}
            <div className={`flex-1 min-h-0 ${activeTab === 'swarm-nexus' ? '' : 'hidden'}`}>
              <SwarmNexus
                onCommitLog={addLog}
                onReadiness={(delta) =>
                  setMissionReadiness((prev) => Math.min(99, Math.round(prev + delta)))
                }
              />
            </div>

            <div className={`flex-1 min-h-0 ${activeTab === 'overmind' ? '' : 'hidden'}`}>
              <OvermindConsole
                onCommitLog={addLog}
                setActiveTab={setActiveTab}
                applyStack={applyStack}
                getStationState={getStationState}
                decompose={(idea) => decomposeIdea(idea) as unknown as Record<string, unknown>}
                forgeSwarm={handleOvermindForge}
              />
            </div>

            {activeTab === 'discord-feed' && (
              <DiscordLiveFeed onCommitLog={addLog} />
            )}

            {activeTab === 'mission-control' && (
              <MissionControl
                blockHeight={blockHeight}
                foundryState={foundryState}
                missionReadiness={missionReadiness}
                language={language}
                framework={framework}
                cssEngine={cssEngine}
                database={database}
                isBuilding={isBuilding}
                onLaunchDemo={handleLaunchDemo}
                onMissionSignal={handleMissionSignal}
              />
            )}

            {activeTab === 'usage-limits' && (
              <UsageLimitsView onCommitLog={addLog} onBudgetChange={setBudgetUtilization} />
            )}

            {activeTab === 'model-accounts' && (
              <ModelAccountsView onCommitLog={addLog} />
            )}

            {activeTab === 'routing-guardrails' && (
              <RoutingGuardrailsView onCommitLog={addLog} />
            )}

            {activeTab === 'integration-ops' && (
              <IntegrationOpsView onCommitLog={addLog} />
            )}

            {activeTab === 'console' && (
              <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden h-[calc(100vh-64px-24px)] md:h-auto">
                {/* Left Orchestration Column (40% width) */}
                <section className="w-full lg:w-[40%] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-0 lg:pr-1 min-h-0">
                  <AppBuilderDeck
                    language={language}
                    setLanguage={setLanguage}
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
                <SecurityProtocolsView
                  biometricEnrolled={Boolean(securityCredentialId)}
                  securityPhase={securityPhase}
                  securityError={securityError}
                  lastRecording={lastSecurityRecording}
                  includeLocation={includeSecurityLocation}
                  onEnrollBiometric={handleEnrollBiometric}
                  onForgetBiometric={handleForgetBiometric}
                  onArmSecurity={handleArmSecurity}
                  onIncludeLocationChange={setIncludeSecurityLocation}
                />
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

      {securityStream && (securityPhase === 'locked' || securityPhase === 'verifying') && (
        <WorkstationLockOverlay
          stream={securityStream}
          startedAt={securityStartedAt}
          isVerifying={securityPhase === 'verifying'}
          error={securityError}
          onUnlock={handleUnlockSecurity}
        />
      )}
    </div>
  );
}

export default App;
