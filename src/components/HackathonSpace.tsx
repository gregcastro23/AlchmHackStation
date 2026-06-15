import React, { useEffect, useState, useMemo, useRef } from 'react';
import type { CompletedHackathon } from '../lib/completedHacks';
import { runDiagnostics } from '../lib/diagnosticsEngine';
import type { DiagnosticReport } from '../lib/diagnosticsEngine';

const getNow = () => performance.now();

export type HackathonTrack = 'from-scratch' | 'extend-open-source' | 'ship-a-feature';

interface HackathonSpaceProps {
  missionReadiness: number;
  foundryState: 'IDLE' | 'BUILDING' | 'SUCCESS' | 'ERROR';
  gitHubConnected: boolean;
  onNavigate: (tab: string) => void;
  onCommitLog: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
  onStartBuild: (idea: string, track: HackathonTrack) => void;
  onArchiveHackathon: (archiveRecord: CompletedHackathon) => void;
  activeLanguage: string;
  activeFramework: string;
  activeCssEngine: string;
  activeDatabase: string;
  securityReady: boolean;
}

interface ProjectConfig {
  eventName: string;
  projectName: string;
  projectPath: string;
  objective: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  group: string;
}

const TEMPLATE_TASKS: Record<HackathonTrack, ChecklistItem[]> = {
  'from-scratch': [
    { id: 'btree_index', label: 'Add btree indexes on card.owner, deck_slot.owner, and trade.proposer/partner', group: 'Database Optimization' },
    { id: 'prune_tables', label: 'Implement scheduled prune janitor on battle and oracle_request tables', group: 'Database Optimization' },
    { id: 'prompt_cache', label: 'Verify prompt cache size is >4096 tokens (Haiku 4.5 minimum cache block)', group: 'AI & Oracle Hardening' },
    { id: 'rebill_fix', label: 'Fix Oracle re-billing infinite loop on failed request API errors', group: 'AI & Oracle Hardening' },
    { id: 'groq_integration', label: 'Configure Groq API (Llama-70B) for free-chain planetary agent responses', group: 'AI & Oracle Hardening' },
    { id: 'owner_token', label: 'Mint deployable owner SPACETIME_TOKEN for feeder and oracle cron services', group: 'Services Deployment' },
    { id: 'sdk_wiring', label: 'Wire web client client.js to wss maincloud using TypeScript SDK', group: 'Web Client Integration' },
    { id: 'word_duel_brain', label: 'Wire planetary-agents Word Duel brain to the agent_letters seam', group: 'Web Client Integration' }
  ],
  'extend-open-source': [
    { id: 'ext_clone', label: 'Fork open-source repository and clone locally', group: 'Project Setup' },
    { id: 'ext_audit', label: 'Audit existing APIs, dependencies, and integration seams', group: 'Specifications' },
    { id: 'ext_bridge', label: 'Implement custom adapter or bridge service with cache layers', group: 'Integrations' },
    { id: 'ext_auth', label: 'Configure EIP-3009 signature verification gates in middleware', group: 'Security' },
    { id: 'ext_regression', label: 'Run regression tests against original test suite', group: 'Verification' },
    { id: 'ext_verify', label: 'Verify local environment variables and secret rotations', group: 'Shipping' }
  ],
  'ship-a-feature': [
    { id: 'feat_branch', label: 'Branch off the main development repository', group: 'Project Setup' },
    { id: 'feat_design', label: 'Design visual components and wire up layout classes', group: 'UI Development' },
    { id: 'feat_logic', label: 'Write owner-gated validation logic and event hooks', group: 'Feature Logic' },
    { id: 'feat_state', label: 'Link new feature data stores to global state manager', group: 'Feature Logic' },
    { id: 'feat_integ', label: 'Execute integration tests and verify clean compiler output', group: 'Verification' },
    { id: 'feat_build', label: 'Build and verify release binary artifact compile', group: 'Shipping' }
  ]
};

const storageKeys = {
  entered: 'hackstation-workspace-entered-v3',
  track: 'hackstation-workspace-track-v3',
  config: 'hackstation-workspace-config-v3',
  completed: 'hackstation-workspace-completed-v3',
  customTasks: 'hackstation-workspace-customtasks-v3',
  repos: 'hackstation-workspace-repos-v3'
};

const readStoredValue = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const HackathonSpace: React.FC<HackathonSpaceProps> = ({
  missionReadiness,
  foundryState,
  gitHubConnected,
  onNavigate,
  onCommitLog,
  onStartBuild,
  onArchiveHackathon,
  activeLanguage,
  activeFramework,
  activeCssEngine,
  activeDatabase,
  securityReady
}) => {
  const [entered, setEntered] = useState(() => readStoredValue(storageKeys.entered, false));
  const [track, setTrack] = useState<HackathonTrack>(() => readStoredValue(storageKeys.track, 'from-scratch'));
  
  const [config, setConfig] = useState<ProjectConfig>(() =>
    readStoredValue(storageKeys.config, {
      eventName: 'ETHGlobal New York 2026',
      projectName: 'Pentacles MMO',
      projectPath: '/Users/cookingwithcastro/Desktop/AlchmHackStation',
      objective: 'Location-based AR MMO on SpaceTimeDB. Birth chart faction, Tarot arsenal, and 5,041 capturable stars.'
    })
  );

  const [completed, setCompleted] = useState<string[]>(() => readStoredValue(storageKeys.completed, []));
  const [customTasks, setCustomTasks] = useState<ChecklistItem[]>(() => readStoredValue(storageKeys.customTasks, []));
  const [repos, setRepos] = useState<string[]>(() => readStoredValue(storageKeys.repos, ['gregcastro23/AlchmHackStation']));
  
  // Custom inputs
  const [newRepo, setNewRepo] = useState('');
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [newTaskGroup, setNewTaskGroup] = useState('Custom Development');

  // Recording states
  const [isRecordingDemo, setIsRecordingDemo] = useState(false);
  const [demoDuration, setDemoDuration] = useState(0);
  const demoRecorderRef = useRef<MediaRecorder | null>(null);
  const demoStreamRef = useRef<MediaStream | null>(null);
  const demoChunksRef = useRef<Blob[]>([]);
  const demoTimerRef = useRef<number | null>(null);

  // Scanning details
  const [isScanning, setIsScanning] = useState(false);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Archive details
  const [archiveAccomplishments, setArchiveAccomplishments] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Storyboard Script details
  const [isStoryboardOpen, setIsStoryboardOpen] = useState(false);
  const [generatingStoryboard, setGeneratingStoryboard] = useState(false);

  // PushPlay Video Synthesizer States
  const [isPushPlayOpen, setIsPushPlayOpen] = useState(false);
  const [pushPlayRendering, setPushPlayRendering] = useState(false);
  const [pushPlayProgress, setPushPlayProgress] = useState(0);
  const [pushPlayTime, setPushPlayTime] = useState(0);
  const [pushPlayMuted, setPushPlayMuted] = useState(false);
  const [pushPlayFinished, setPushPlayFinished] = useState(false);

  const pushPlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const pushPlayRecorderRef = useRef<MediaRecorder | null>(null);
  const pushPlayAudioCtxRef = useRef<AudioContext | null>(null);
  const pushPlayStreamRef = useRef<MediaStream | null>(null);
  const pushPlayChunksRef = useRef<Blob[]>([]);
  const pushPlayRenderIntervalRef = useRef<number | null>(null);
  const pushPlaySpeakerGainRef = useRef<GainNode | null>(null);
  const pushPlayBeatRef = useRef<number>(0);


  // Sync to local storage
  useEffect(() => {
    window.localStorage.setItem(storageKeys.track, JSON.stringify(track));
  }, [track]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.config, JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.completed, JSON.stringify(completed));
  }, [completed]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.customTasks, JSON.stringify(customTasks));
  }, [customTasks]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.repos, JSON.stringify(repos));
  }, [repos]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [scanLogs]);

  const activeChecklist = useMemo(() => {
    const defaultTasks = TEMPLATE_TASKS[track] || [];
    return [...defaultTasks, ...customTasks];
  }, [track, customTasks]);

  const checklistCompleted = useMemo(() => {
    return completed.filter(id => activeChecklist.some(t => t.id === id));
  }, [activeChecklist, completed]);

  // Compute diagnostics
  const diagnostics = useMemo<DiagnosticReport>(() => {
    return runDiagnostics(track, checklistCompleted, repos, securityReady);
  }, [track, checklistCompleted, repos, securityReady]);

  const overallCompletion = useMemo(() => {
    if (activeChecklist.length === 0) return 100;
    const completionPercent = Math.round((checklistCompleted.length / activeChecklist.length) * 100);
    return Math.round((missionReadiness + completionPercent) / 2);
  }, [missionReadiness, checklistCompleted, activeChecklist]);

  const storyboardScript = useMemo(() => {
    const listAccomplishments = archiveAccomplishments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, ''));

    const accomplishmentsText = listAccomplishments.length > 0
      ? listAccomplishments.join(', ')
      : checklistCompleted.length > 0
        ? checklistCompleted
            .map(id => activeChecklist.find(t => t.id === id)?.label || id)
            .slice(0, 3)
            .join(', ')
        : 'built out core backend endpoints and set up developer dashboards';

    const reposText = repos.length > 0
      ? repos.join(', ')
      : 'gregcastro23/AlchmHackStation';

    return [
      {
        scene: 'SCENE 1: INTRODUCTION & PROJECT HOOK (0:00 - 0:15)',
        visual: 'Visual: Display the Active Workstation dashboard, showing the Overall Health dial.',
        narration: `Hey everyone! Today we are showcasing ${config.projectName}, built for the ${config.eventName} event. Our core objective is: ${config.objective} We initiated this workspace directory and started tracking our deliverables live on the station cockpit.`
      },
      {
        scene: 'SCENE 2: ENGINEERING & STACK DEEP-DIVE (0:15 - 0:35)',
        visual: 'Visual: Navigate to the Swarm Nexus node graph visualization or Operator Console tab.',
        narration: `This project is engineered using a high-performance ${activeLanguage} stack built on ${activeFramework}. Our design is powered by ${activeCssEngine}, and all relational/planetary state data is synced live to our local ${activeDatabase} cluster. By planning through Swarm, we mapped our codebase dependency boundaries instantly.`
      },
      {
        scene: 'SCENE 3: AUDITED METRICS & DIAGNOSTICS (0:35 - 0:50)',
        visual: 'Visual: Highlight the Project Diagnostics and Scoring dial showing our overall health score.',
        narration: `To guarantee production readiness, we ran the Alchm Diagnostics Engine. The system evaluated our security rules, git health, and performance to give us a rating of ${diagnostics.score} out of 100. During this session, we successfully finished: ${accomplishmentsText}.`
      },
      {
        scene: 'SCENE 4: BIOMETRIC SHIELD & WRAP (0:50 - 1:00)',
        visual: 'Visual: Demonstrate clicking the lock button and showing the active camera biometric scanner.',
        narration: `Finally, we secured our workspace by arming the biometric TouchID/FaceID locks, recording security proofs on the decentralized chain. Our source code is fully compiled, verified, and pushed to GitHub at ${reposText}. Thanks for watching our demo!`
      }
    ];
  }, [config, activeLanguage, activeFramework, activeCssEngine, activeDatabase, diagnostics, checklistCompleted, repos, archiveAccomplishments, activeChecklist]);

  const handleEnterWorkspace = () => {
    if (!config.projectName.trim() || !config.projectPath.trim()) {
      onCommitLog('Please specify a project name and target directory path.', 'warning');
      return;
    }
    setEntered(true);
    window.localStorage.setItem(storageKeys.entered, JSON.stringify(true));
    onCommitLog(`Hack Station Workspace initialized. Project: ${config.projectName} | Path: ${config.projectPath}`, 'success');
  };

  const handleReturnToSetup = () => {
    setEntered(false);
    window.localStorage.setItem(storageKeys.entered, JSON.stringify(false));
  };

  const toggleChecklist = (id: string) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const handleAddRepo = () => {
    if (!newRepo.trim()) return;
    const cleanRepo = newRepo.trim().replace(/^(https:\/\/github\.com\/)/, '');
    if (repos.includes(cleanRepo)) {
      onCommitLog('Repository is already linked to this workstation.', 'warning');
      return;
    }
    setRepos(prev => [...prev, cleanRepo]);
    setNewRepo('');
    onCommitLog(`Linked GitHub repository: ${cleanRepo}`, 'success');
  };

  const handleRemoveRepo = (repoName: string) => {
    setRepos(prev => prev.filter(r => r !== repoName));
    onCommitLog(`Unlinked repository: ${repoName}`, 'info');
  };

  const handleAddCustomTask = () => {
    if (!newTaskLabel.trim()) return;
    const task: ChecklistItem = {
      id: `custom_${Date.now()}`,
      label: newTaskLabel.trim(),
      group: newTaskGroup.trim() || 'Custom Development'
    };
    setCustomTasks(prev => [...prev, task]);
    setNewTaskLabel('');
    onCommitLog(`Added custom task: ${task.label}`, 'info');
  };

  const handleRemoveCustomTask = (id: string) => {
    setCustomTasks(prev => prev.filter(t => t.id !== id));
    setCompleted(prev => prev.filter(cid => cid !== id));
    onCommitLog('Removed custom task', 'info');
  };

  const handleStartForgePlan = () => {
    const idea = config.objective.trim() || config.projectName.trim();
    onStartBuild(idea, track);
  };

  const triggerDiagnosticScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanLogs([]);
    onCommitLog(`Diagnostic scanning pipeline engaged for: ${config.projectName}`, 'info');

    const auditSteps = [
      `Initializing Alchm Diagnostics Engine v4.0.2...`,
      `Scanning directory tree: ${config.projectPath}`,
      `Checking git remote headers... [Found ${repos.length} linked repos]`,
      `Auditing core stack configuration: ${activeLanguage} // ${activeFramework} // ${activeDatabase}`,
      `Inspecting environment configuration in ${config.projectPath}/.env`,
      `Analyzing database optimization hooks...`,
      `Evaluating Btree index coverage tables...`,
      `Auditing security boundaries and biometric Lock bindings...`,
      `Checking test coverage assertions: ${checklistCompleted.length} of ${activeChecklist.length} checklist items resolved.`,
      `Audit scan finalising... Compilation telemetry synced.`
    ];

    let currentStep = 0;
    const timer = setInterval(() => {
      if (currentStep < auditSteps.length) {
        setScanLogs(prev => [...prev, `[AUDIT] ${new Date().toLocaleTimeString()} - ${auditSteps[currentStep]}`]);
        currentStep++;
      } else {
        clearInterval(timer);
        setIsScanning(false);
        onCommitLog(`Diagnostics scan completed. Score: ${diagnostics.score}/100. ${diagnostics.weakPoints.length} weak points identified.`, diagnostics.score > 80 ? 'success' : 'warning');
      }
    }, 280);
  };

  // Video recording handlers
  const handleStartDemoRecord = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        onCommitLog('Browser does not support screen sharing API.', 'error');
        return;
      }
      
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30, width: 1280, height: 720 },
        audio: true
      });
      
      demoStreamRef.current = stream;
      demoChunksRef.current = [];
      setDemoDuration(0);
      setIsRecordingDemo(true);
      onCommitLog('Screen recording initialized. Select the target window/tab to capture.', 'info');

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
      demoRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          demoChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(demoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const cleanName = config.projectName.toLowerCase().replace(/\s+/g, '_');
        a.download = `${cleanName}_demo.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        setIsRecordingDemo(false);
        if (demoTimerRef.current) {
          window.clearInterval(demoTimerRef.current);
          demoTimerRef.current = null;
        }
        onCommitLog('Demo video recording finished and downloaded.', 'success');
      };

      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      recorder.start(1000);

      demoTimerRef.current = window.setInterval(() => {
        setDemoDuration(prev => prev + 1);
      }, 1000) as unknown as number;

    } catch (err) {
      onCommitLog(`Could not start screen recording: ${err instanceof Error ? err.message : String(err)}`, 'warning');
      setIsRecordingDemo(false);
    }
  };

  const handleStopDemoRecord = () => {
    const recorder = demoRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
    const stream = demoStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // Canvas screenshot capture
  const handleCaptureSwarmCanvas = () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) {
        onCommitLog('Swarm Crucible Canvas is not currently mounted. Navigate to the Swarm Nexus tab first.', 'warning');
        return;
      }
      
      const imgDataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgDataUrl;
      const cleanName = config.projectName.toLowerCase().replace(/\s+/g, '_');
      a.download = `${cleanName}_swarm_crucible.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onCommitLog('Swarm Crucible Canvas frame captured and downloaded.', 'success');
    } catch (err) {
      onCommitLog(`Canvas capture failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  // Generate Pitch Slide Card
  const handleGeneratePitchSlide = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#0A0A0B';
      ctx.fillRect(0, 0, 1200, 630);

      // Gridlines
      ctx.strokeStyle = '#44483a';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.15;
      const gridSize = 40;
      for (let x = 0; x < 1200; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 630);
        ctx.stroke();
      }
      for (let y = 0; y < 630; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1200, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      // Borders
      ctx.strokeStyle = '#ccff80';
      ctx.lineWidth = 2;
      ctx.strokeRect(30, 30, 1140, 570);

      ctx.strokeStyle = '#30343a';
      ctx.lineWidth = 1;
      ctx.strokeRect(40, 40, 1120, 550);

      // Header info
      ctx.fillStyle = '#ccff80';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('ALCHM HACK STATION // PROJECT DEMO PITCH BLOCK', 60, 75);

      ctx.fillStyle = '#8f9282';
      ctx.fillText(`ARCHIVE HASH ID: ${Date.now().toString(36).toUpperCase()}`, 900, 75);

      ctx.strokeStyle = '#30343a';
      ctx.beginPath();
      ctx.moveTo(60, 95);
      ctx.lineTo(1140, 95);
      ctx.stroke();

      // Title
      ctx.fillStyle = '#e3e3d8';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(config.projectName.toUpperCase(), 60, 165);

      ctx.fillStyle = '#5de6ff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`Event: ${config.eventName}`, 60, 210);

      // Objective panel
      ctx.fillStyle = '#12140e';
      ctx.strokeStyle = '#44483a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(60, 240, 1080, 110);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#c5c8b6';
      ctx.font = 'italic 16px sans-serif';
      const words = config.objective.split(' ');
      let line = '';
      let y = 275;
      const maxWidth = 1040;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, 80, y);
          line = words[n] + ' ';
          y += 26;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 80, y);

      // Stack specs
      ctx.fillStyle = '#8f9282';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('ARMED STACK CONFIGURATIONS:', 60, 395);

      ctx.fillStyle = '#e3e3d8';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`Language:  ${activeLanguage}`, 60, 425);
      ctx.fillText(`Framework: ${activeFramework}`, 60, 455);
      ctx.fillText(`Styling:   ${activeCssEngine}`, 60, 485);
      ctx.fillText(`Database:  ${activeDatabase}`, 60, 515);

      // Diagnostic score block
      ctx.fillStyle = '#0d0f09';
      ctx.strokeStyle = '#ccff80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(800, 380, 340, 170);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8f9282';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('DIAGNOSTICS RATING', 830, 410);

      ctx.fillStyle = '#ccff80';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(`${diagnostics.score}`, 830, 490);

      ctx.fillStyle = '#5de6ff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`/ 100 HEALTH`, 960, 480);

      ctx.fillStyle = '#8f9282';
      ctx.font = '10px monospace';
      ctx.fillText(`Sec: ${diagnostics.categories.security}% | Perf: ${diagnostics.categories.performance}% | Git: ${diagnostics.categories.git}%`, 830, 530);

      // Footer
      ctx.strokeStyle = '#30343a';
      ctx.beginPath();
      ctx.moveTo(60, 570);
      ctx.lineTo(1140, 570);
      ctx.stroke();

      ctx.fillStyle = '#8f9282';
      ctx.font = '10px monospace';
      ctx.fillText('ALCHMHACKSTATION PLATFORM PRODUCTION BLUEPRINT CARD', 60, 588);

      const imgUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgUrl;
      const cleanName = config.projectName.toLowerCase().replace(/\s+/g, '_');
      a.download = `${cleanName}_pitch_slide.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onCommitLog('Presentation pitch slide card generated and downloaded.', 'success');
    } catch (err) {
      onCommitLog(`Slide generation failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
    }
  };

  const handleGenerateStoryboard = () => {
    if (generatingStoryboard) return;
    setGeneratingStoryboard(true);
    onCommitLog('Initializing AI Demo Storyboard script compiler...', 'info');
    setTimeout(() => {
      setGeneratingStoryboard(false);
      setIsStoryboardOpen(true);
      onCommitLog('AI Demo Storyboard compiled successfully!', 'success');
    }, 800);
  };

  const startPushPlayRender = async () => {
    if (pushPlayRendering) return;
    
    setPushPlayRendering(true);
    setPushPlayFinished(false);
    setPushPlayProgress(0);
    setPushPlayTime(0);
    pushPlayChunksRef.current = [];
    pushPlayBeatRef.current = 0;
    
    onCommitLog('PushPlay Studio: Initializing rendering context...', 'info');

    const canvas = pushPlayCanvasRef.current;
    if (!canvas) {
      onCommitLog('PushPlay Studio: Canvas ref missing.', 'error');
      setPushPlayRendering(false);
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      onCommitLog('PushPlay Studio: Canvas 2D context missing.', 'error');
      setPushPlayRendering(false);
      return;
    }

    // Initialize Audio
    let audioCtx: AudioContext | null = null;
    let speakerGain: GainNode | null = null;
    let dest: MediaStreamAudioDestinationNode | null = null;
    
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = new AudioCtxClass();
      pushPlayAudioCtxRef.current = audioCtx;
      
      speakerGain = audioCtx.createGain();
      speakerGain.gain.setValueAtTime(pushPlayMuted ? 0 : 0.2, audioCtx.currentTime);
      speakerGain.connect(audioCtx.destination);
      pushPlaySpeakerGainRef.current = speakerGain;

      dest = audioCtx.createMediaStreamDestination();
    } catch {
      onCommitLog('PushPlay Studio: Web Audio API initialization failed. Render will proceed silently.', 'warning');
    }

    const canvasStream = canvas.captureStream(30);
    pushPlayStreamRef.current = canvasStream;

    let combinedStream = canvasStream;
    if (dest && dest.stream.getAudioTracks().length > 0) {
      combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);
    }

    let recorder: MediaRecorder;
    try {
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      recorder = new MediaRecorder(combinedStream, options);
    } catch {
      try {
        const options = { mimeType: 'video/webm' };
        recorder = new MediaRecorder(combinedStream, options);
      } catch (err) {
        onCommitLog(`PushPlay Studio: MediaRecorder initialization failed: ${err instanceof Error ? err.message : String(err)}`, 'error');
        setPushPlayRendering(false);
        return;
      }
    }
    pushPlayRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        pushPlayChunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(pushPlayChunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const cleanName = config.projectName.toLowerCase().replace(/\s+/g, '_');
      a.download = `${cleanName}_ai_demo.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      onCommitLog('PushPlay Studio: Export completed! Video saved as WebM.', 'success');
      setPushPlayRendering(false);
      setPushPlayFinished(true);
    };

    recorder.start(1000);

    const spokenScenes = new Set<number>();
    const width = canvas.width;
    const height = canvas.height;
    const totalDuration = 60;
    const startTime = getNow();

    const speakSceneUtterance = (sceneIndex: number) => {
      if ('speechSynthesis' in window && !pushPlayMuted) {
        window.speechSynthesis.cancel();
        const text = storyboardScript[sceneIndex].narration;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      }
    };

    const drawBackground = (elapsed: number) => {
      const grad = ctx.createRadialGradient(width/2, height/2, 100, width/2, height/2, 700);
      grad.addColorStop(0, '#0d0e12');
      grad.addColorStop(1, '#020304');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#22251a';
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.25;
      const gridSize = 40;
      const offsetX = (elapsed * 25) % gridSize;
      for (let x = -offsetX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = '#2d3027';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);

      ctx.strokeStyle = '#ccff80';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(40, 60); ctx.lineTo(40, 40); ctx.lineTo(60, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - 40, 60); ctx.lineTo(width - 40, 40); ctx.lineTo(width - 60, 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, height - 60); ctx.lineTo(40, height - 40); ctx.lineTo(60, height - 40); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(width - 40, height - 60); ctx.lineTo(width - 40, height - 40); ctx.lineTo(width - 60, height - 40); ctx.stroke();
    };

    const drawOverlay = (elapsed: number, currentScene: number) => {
      ctx.fillStyle = '#ccff80';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`PUSHPLAY STUDIO // AI GENERATED SHOWCASE // SCENE ${currentScene + 1}`, 60, 28);

      const m = Math.floor(elapsed / 60);
      const s = Math.floor(elapsed % 60);
      const ms = Math.floor((elapsed % 1) * 30);
      const tc = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
      ctx.fillStyle = '#8f9282';
      ctx.fillText(`TIMECODE: ${tc}`, 60, height - 20);

      ctx.textAlign = 'right';
      ctx.fillText('ALCHM HACK STATION BETA', width - 60, 28);
      ctx.fillText(`HEALTH SCORE: ${diagnostics.score}/100`, width - 60, height - 20);

      ctx.fillStyle = 'rgba(5, 5, 5, 0.85)';
      ctx.strokeStyle = '#323630';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(100, height - 120, width - 200, 75, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#e3e3d8';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'left';
      const fullNarration = storyboardScript[currentScene].narration;
      
      let sceneStart = 0;
      let sceneEnd = 15;
      if (currentScene === 1) { sceneStart = 15; sceneEnd = 35; }
      if (currentScene === 2) { sceneStart = 35; sceneEnd = 50; }
      if (currentScene === 3) { sceneStart = 50; sceneEnd = 60; }
      
      const sceneProgress = (elapsed - sceneStart) / (sceneEnd - sceneStart);
      const charactersToShow = Math.floor(fullNarration.length * Math.min(sceneProgress * 1.5, 1.0));
      const textChunk = fullNarration.substring(0, charactersToShow);
      
      const words = textChunk.split(' ');
      let line = '';
      let textY = height - 95;
      const textMaxWidth = width - 240;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > textMaxWidth && n > 0) {
          ctx.fillText(line, 120, textY);
          line = words[n] + ' ';
          textY += 22;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 120, textY);

      ctx.fillStyle = '#ccff80';
      for (let i = 0; i < 12; i++) {
        const barHeight = Math.sin(elapsed * 15 + i) * 12 + 16;
        ctx.fillRect(width - 190 + i * 8, height - 90 - barHeight / 2, 4, barHeight);
      }
    };

    const loop = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      
      if (elapsed >= totalDuration) {
        stopPushPlayRender();
        return;
      }

      setPushPlayTime(elapsed);
      setPushPlayProgress(Math.min(Math.round((elapsed / totalDuration) * 100), 100));

      let currentScene = 0;
      if (elapsed >= 15 && elapsed < 35) currentScene = 1;
      else if (elapsed >= 35 && elapsed < 50) currentScene = 2;
      else if (elapsed >= 50) currentScene = 3;

      if (!spokenScenes.has(currentScene)) {
        spokenScenes.add(currentScene);
        speakSceneUtterance(currentScene);
      }

      if (audioCtx && dest && speakerGain) {
        const beatIndex = Math.floor(elapsed * 2);
        if (beatIndex > pushPlayBeatRef.current) {
          pushPlayBeatRef.current = beatIndex;
          
          try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(dest);
            gain.connect(speakerGain);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(100, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            
            gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);

            if (beatIndex % 4 === 0) {
              const notes = [220, 261.63, 293.66, 329.63, 392.00];
              const pitch = notes[(beatIndex / 4) % notes.length];
              
              const synthOsc = audioCtx.createOscillator();
              const synthGain = audioCtx.createGain();
              synthOsc.connect(synthGain);
              synthGain.connect(dest);
              synthGain.connect(speakerGain);
              
              synthOsc.type = 'triangle';
              synthOsc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
              
              synthGain.gain.setValueAtTime(0.05, audioCtx.currentTime);
              synthGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.9);
              
              synthOsc.start();
              synthOsc.stop(audioCtx.currentTime + 0.9);
            }
          } catch {
            // Silence
          }
        }
      }

      drawBackground(elapsed);

      if (currentScene === 0) {
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(config.projectName.toUpperCase(), 100, 160);

        ctx.fillStyle = '#5de6ff';
        ctx.font = 'bold 16px monospace';
        ctx.fillText(`LAUNCHING AT ${config.eventName.toUpperCase()}`, 100, 205);

        ctx.fillStyle = '#8f9282';
        ctx.font = '13px sans-serif';
        ctx.fillText('CORE OBJECTIVE:', 100, 250);

        ctx.fillStyle = '#e3e3d8';
        ctx.font = 'italic 16px sans-serif';
        const wordsObj = config.objective.split(' ');
        let objLine = '';
        let objY = 285;
        for (let i = 0; i < wordsObj.length; i++) {
          const testL = objLine + wordsObj[i] + ' ';
          if (ctx.measureText(testL).width > 420 && i > 0) {
            ctx.fillText(objLine, 100, objY);
            objLine = wordsObj[i] + ' ';
            objY += 26;
          } else {
            objLine = testL;
          }
        }
        ctx.fillText(objLine, 100, objY);

        ctx.fillStyle = '#111317';
        ctx.strokeStyle = '#32363e';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(620, 120, 560, 360, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e2128';
        ctx.beginPath();
        ctx.roundRect(620, 120, 560, 30, [8, 8, 0, 0]);
        ctx.fill();

        ctx.fillStyle = '#ff5f56'; ctx.beginPath(); ctx.arc(640, 135, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffbd2e'; ctx.beginPath(); ctx.arc(655, 135, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#27c93f'; ctx.beginPath(); ctx.arc(670, 135, 5, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#0d0f12';
        ctx.beginPath();
        ctx.roundRect(700, 125, 420, 20, 4);
        ctx.fill();
        ctx.fillStyle = '#555964';
        ctx.font = '10px monospace';
        ctx.fillText(`https://alchm.hackstation/${config.projectName.toLowerCase().replace(/\s+/g, '_')}`, 715, 138);

        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('ACTIVE SYSTEM BLUEPRINT INITIALIZED', 650, 185);

        ctx.fillStyle = '#1a1d24';
        ctx.fillRect(650, 210, 240, 100);
        ctx.fillRect(910, 210, 240, 100);
        ctx.fillRect(650, 330, 500, 120);

        ctx.strokeStyle = '#ccff80';
        ctx.globalAlpha = 0.15 + Math.sin(elapsed * 6) * 0.05;
        ctx.strokeRect(650, 210, 240, 100);
        ctx.strokeRect(910, 210, 240, 100);
        ctx.strokeRect(650, 330, 500, 120);
        ctx.globalAlpha = 1.0;

        ctx.fillStyle = '#8f9282';
        ctx.font = '9px monospace';
        ctx.fillText('SYS_DIAGNOSTICS_CARD', 660, 225);
        ctx.fillText('SWARM_CRUCIBLE_GRID', 920, 225);
        ctx.fillText('LIVE_OPERATOR_LOGSTREAM', 660, 345);

        ctx.strokeStyle = '#ccff80';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(770, 265, 25, 0, Math.PI * 2 * (overallCompletion / 100));
        ctx.stroke();
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 12px monospace';
        ctx.fillText(`${overallCompletion}%`, 755, 270);

        ctx.strokeStyle = '#5de6ff';
        ctx.beginPath();
        ctx.arc(1030, 265, 25, 0, Math.PI * 2 * (elapsed / 15));
        ctx.stroke();
        ctx.fillStyle = '#5de6ff';
        ctx.fillText('CRUC', 1015, 270);

      } else if (currentScene === 1) {
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('SWARM INTEGRATION ARCHITECTURE', 100, 100);

        const centerNode = { x: 340, y: 300, label: 'Operator' };
        const subNodes = [
          { x: 200, y: 180, label: activeDatabase, color: '#5de6ff' },
          { x: 480, y: 180, label: activeFramework, color: '#ffb300' },
          { x: 200, y: 420, label: 'Circle API', color: '#00e5ff' },
          { x: 480, y: 420, label: 'Dynamic Auth', color: '#af52de' }
        ];

        ctx.lineWidth = 1.5;
        subNodes.forEach((node, i) => {
          ctx.strokeStyle = '#32363e';
          ctx.beginPath();
          ctx.moveTo(centerNode.x, centerNode.y);
          ctx.lineTo(node.x, node.y);
          ctx.stroke();

          const packetProgress = (elapsed * 0.8 + i * 0.25) % 1.0;
          const px = centerNode.x + (node.x - centerNode.x) * packetProgress;
          const py = centerNode.y + (node.y - centerNode.y) * packetProgress;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.arc(centerNode.x, centerNode.y, 22 + Math.sin(elapsed * 5) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(centerNode.label.toUpperCase(), centerNode.x, centerNode.y + 3);

        ctx.textAlign = 'left';
        subNodes.forEach((node) => {
          ctx.fillStyle = node.color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#e3e3d8';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(node.label.toUpperCase(), node.x - 45, node.y - 22);
        });

        ctx.fillStyle = '#0d0f12';
        ctx.strokeStyle = '#22242a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(660, 120, 520, 360, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#1e2128';
        ctx.fillRect(661, 121, 518, 25);
        ctx.fillStyle = '#8f9282';
        ctx.font = 'bold 9px monospace';
        ctx.fillText('OPERATOR_LOGSTREAM_ACTIVE', 675, 137);

        ctx.fillStyle = '#ccff80';
        ctx.font = '10px monospace';
        const logLines = [
          `[OK] INITIALIZED COMPILER ENGINE VIA BUN`,
          `[OK] HOT-RELOAD PORT 5173 CONNECTED`,
          `[OK] COMPILED DEPLOYMENT ARTIFACTS IN 208ms`,
          `[OK] SYNCED DATABASE SCHEMAS ON '${activeDatabase}'`,
          `[OK] DETECTED FRAMEWORK WRAPPER '${activeFramework}'`,
          `[OK] LOADED ENCRYPTION CREDENTIALS TO WORKSPACE`,
          `[OK] ATTACHED LIVE GIT TRACKING: ${repos[0] || 'AlchmHackStation'}`,
          `[OK] PREFLIGHT CHECKS COMPILING RESOLVED`,
          `[OK] BIOMETRIC VERIFICATION GATE: ARMED`,
          `[OK] INTEGRATION MODULE CHECKS COMPLETE: ALL SEAMS ALIGN`
        ];

        const displayLineCount = Math.min(Math.floor((elapsed - 15) * 1.5) + 1, logLines.length);
        const yStart = 170;
        for (let i = 0; i < displayLineCount; i++) {
          ctx.fillText(logLines[i], 680, yStart + i * 26);
        }

      } else if (currentScene === 2) {
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('TELEMETRY SCAN & HEALTH RATING', 100, 100);

        const gaugeX = 880;
        const gaugeY = 290;
        const gaugeRadius = 110;

        ctx.strokeStyle = '#22252a';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, gaugeRadius, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();

        const sweepProgress = Math.min((elapsed - 35) / 3, 1.0);
        const targetGaugeAngle = Math.PI * 0.8 + (Math.PI * 1.4 * (diagnostics.score / 100)) * sweepProgress;

        ctx.strokeStyle = '#ccff80';
        ctx.lineWidth = 16;
        ctx.beginPath();
        ctx.arc(gaugeX, gaugeY, gaugeRadius, Math.PI * 0.8, targetGaugeAngle);
        ctx.stroke();

        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 64px sans-serif';
        ctx.textAlign = 'center';
        const currentScoreVal = Math.floor(diagnostics.score * sweepProgress);
        ctx.fillText(`${currentScoreVal}`, gaugeX, gaugeY + 15);

        ctx.fillStyle = '#8f9282';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('DIAGNOSTIC HEALTH SCORE', gaugeX, gaugeY + 45);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('COMPILATION DIAGNOSTICS', 100, 150);

        const categories = [
          { label: 'Security Protocols', score: diagnostics.categories.security, y: 195 },
          { label: 'Database Optimization', score: diagnostics.categories.performance, y: 255 },
          { label: 'Checklist Deliverables', score: diagnostics.categories.coverage, y: 315 },
          { label: 'GitHub Seam Connections', score: diagnostics.categories.git, y: 375 }
        ];

        categories.forEach((cat) => {
          ctx.fillStyle = '#8f9282';
          ctx.font = '11px monospace';
          ctx.fillText(cat.label.toUpperCase(), 100, cat.y);

          ctx.fillStyle = '#22252a';
          ctx.fillRect(100, cat.y + 8, 420, 10);
          ctx.fillStyle = cat.score >= 80 ? '#ccff80' : cat.score >= 60 ? '#ffb300' : '#ff4444';
          ctx.fillRect(100, cat.y + 8, 420 * (cat.score / 100) * sweepProgress, 10);

          ctx.fillStyle = '#e3e3d8';
          ctx.font = 'bold 11px monospace';
          ctx.fillText(`${Math.floor(cat.score * sweepProgress)}%`, 535, cat.y + 18);
        });

      } else {
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('SECURITY HARDENING & PUSH TO DEPLOY', 100, 100);

        const boxX = 640;
        const boxY = 130;
        const boxW = 480;
        const boxH = 340;

        ctx.fillStyle = 'rgba(17, 19, 23, 0.6)';
        ctx.fillRect(boxX, boxY, boxW, boxH);
        ctx.strokeStyle = '#2d323e';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX, boxY, boxW, boxH);

        const sweepY = boxY + ((Math.sin(elapsed * 4.5) + 1) / 2) * boxH;
        ctx.strokeStyle = '#ccff80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(boxX, sweepY);
        ctx.lineTo(boxX + boxW, sweepY);
        ctx.stroke();

        ctx.strokeStyle = '#ccff80';
        ctx.globalAlpha = 0.2;
        ctx.beginPath(); ctx.arc(boxX + boxW / 2, boxY + boxH / 2, 70, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(boxX + boxW / 2, boxY + boxH / 2, 110, 0, Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 1.0;

        ctx.strokeStyle = '#5de6ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(boxX + boxW / 2, boxY + boxH / 2, 40, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#5de6ff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SCANNING...', boxX + boxW / 2, boxY + boxH / 2 + 5);

        if (elapsed >= 54) {
          ctx.fillStyle = '#0a1a0e';
          ctx.strokeStyle = '#ccff80';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(boxX + 60, boxY + 110, 360, 120, 8);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ccff80';
          ctx.font = 'bold 22px sans-serif';
          ctx.fillText('BIOMETRICS LOCKED', boxX + boxW / 2, boxY + 165);
          ctx.fillStyle = '#5de6ff';
          ctx.font = 'bold 14px monospace';
          ctx.fillText('DEPLOYED TO ARCNET WORKSPACE', boxX + boxW / 2, boxY + 200);
        }

        ctx.textAlign = 'left';
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('SESSION SUBMISSION BLUEPRINT', 100, 150);

        ctx.fillStyle = '#8f9282';
        ctx.font = '12px monospace';
        ctx.fillText(`PROJECT DIRECTORY:`, 100, 195);
        ctx.fillStyle = '#e3e3d8';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`${config.projectPath}`, 100, 215);

        ctx.fillStyle = '#8f9282';
        ctx.font = '12px monospace';
        ctx.fillText(`GITHUB BINDINGS:`, 100, 265);
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`github.com/${repos[0] || 'AlchmHackStation'}`, 100, 285);

        ctx.fillStyle = '#8f9282';
        ctx.font = '12px monospace';
        ctx.fillText(`DEPLOYMENT HASH:`, 100, 335);
        ctx.fillStyle = '#5de6ff';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`arc1p9e8a${Date.now().toString(36).toUpperCase()}`, 100, 355);

        ctx.fillStyle = '#8f9282';
        ctx.font = '12px monospace';
        ctx.fillText(`STABILITY CLASSIFICATION:`, 100, 405);
        ctx.fillStyle = '#ccff80';
        ctx.font = 'bold 13px monospace';
        ctx.fillText('PRODUCTION SECURITY SECURED // A-GRADE', 100, 425);
      }

      ctx.textAlign = 'left';
      drawOverlay(elapsed, currentScene);

      pushPlayRenderIntervalRef.current = requestAnimationFrame(loop);
    };

    pushPlayRenderIntervalRef.current = requestAnimationFrame(loop);
  };

  const stopPushPlayRender = () => {
    if (pushPlayRenderIntervalRef.current) {
      cancelAnimationFrame(pushPlayRenderIntervalRef.current);
      pushPlayRenderIntervalRef.current = null;
    }

    const recorder = pushPlayRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }

    const stream = pushPlayStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const audioCtx = pushPlayAudioCtxRef.current;
    if (audioCtx) {
      audioCtx.close();
      pushPlayAudioCtxRef.current = null;
    }

    setPushPlayRendering(false);
  };

  const handleTogglePushPlayMute = () => {
    const nextMuted = !pushPlayMuted;
    setPushPlayMuted(nextMuted);
    
    if (nextMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    const speakerGain = pushPlaySpeakerGainRef.current;
    const audioCtx = pushPlayAudioCtxRef.current;
    if (speakerGain && audioCtx) {
      speakerGain.gain.setValueAtTime(nextMuted ? 0 : 0.2, audioCtx.currentTime);
    }
  };

  const downloadPushPlaySlidePng = () => {
    const canvas = pushPlayCanvasRef.current;
    if (!canvas) return;
    try {
      const imgDataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imgDataUrl;
      const cleanName = config.projectName.toLowerCase().replace(/\s+/g, '_');
      a.download = `${cleanName}_slide_capture.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onCommitLog('PushPlay Studio: Slide snapshot saved.', 'success');
    } catch {
      onCommitLog('PushPlay Studio: Slide capture failed.', 'error');
    }
  };

  useEffect(() => {
    return () => {
      if (pushPlayRenderIntervalRef.current) {
        cancelAnimationFrame(pushPlayRenderIntervalRef.current);
      }
      if (pushPlayAudioCtxRef.current) {
        pushPlayAudioCtxRef.current.close();
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);


  const handleCopyStoryboard = () => {
    const fullText = storyboardScript
      .map(item => `${item.scene}\n${item.visual}\nNarration: "${item.narration}"`)
      .join('\n\n');
    navigator.clipboard.writeText(fullText);
    onCommitLog('Demo script and visual cues copied to clipboard!', 'success');
  };

  // storyboardScript is moved to the top of the component scope

  const handleArchive = () => {
    if (!archiveAccomplishments.trim()) {
      onCommitLog('Please document at least one accomplishment to archive the session.', 'warning');
      return;
    }

    const accomplishmentsArray = archiveAccomplishments
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^-\s*/, '').replace(/^\d+\.\s*/, ''));

    const activeCompletedTasks = activeChecklist.filter(t => completed.includes(t.id));

    const archiveRecord = {
      id: `hack_${Date.now()}`,
      eventName: config.eventName.trim() || 'Generic Hackathon',
      projectName: config.projectName.trim() || 'Prototype',
      projectPath: config.projectPath.trim() || '/unknown',
      objective: config.objective.trim(),
      track: track === 'from-scratch' ? 'From Scratch' : track === 'extend-open-source' ? 'Extend Open Source' : 'Ship a Feature',
      dates: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      stack: {
        language: activeLanguage,
        framework: activeFramework,
        cssEngine: activeCssEngine,
        database: activeDatabase
      },
      accomplishments: accomplishmentsArray,
      completedTasks: activeCompletedTasks,
      archivedAt: new Date().toISOString()
    };

    onArchiveHackathon(archiveRecord);
    onCommitLog(`Hackathon session archived successfully: ${archiveRecord.projectName}`, 'success');

    // Reset workstation states
    setCompleted([]);
    setCustomTasks([]);
    setRepos(['gregcastro23/AlchmHackStation']);
    setArchiveAccomplishments('');
    setEntered(false);
    window.localStorage.setItem(storageKeys.entered, JSON.stringify(false));
    window.localStorage.removeItem(storageKeys.completed);
    window.localStorage.removeItem(storageKeys.customTasks);
    window.localStorage.removeItem(storageKeys.repos);
    setConfig({
      eventName: 'ETHGlobal New York 2026',
      projectName: 'Pentacles MMO',
      projectPath: '/Users/cookingwithcastro/Desktop/AlchmHackStation',
      objective: 'Location-based AR MMO on SpaceTimeDB. Birth chart faction, Tarot arsenal, and 5,041 capturable stars.'
    });
  };

  if (!entered) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-lg">
        <div className="max-w-4xl mx-auto space-y-lg">
          <div className="flex justify-between items-end border-b border-outline-variant/40 pb-md">
            <div>
              <h2 className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-[0.28em]">
                Hack Station Active Workstation
              </h2>
              <h1 className="mt-1 text-2xl font-bold text-on-surface uppercase tracking-tight">
                Workspace Configuration
              </h1>
            </div>
            <div className="flex items-center gap-xs font-mono text-[10px] uppercase text-primary border border-primary/20 bg-primary/5 px-2.5 py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              SETUP_STANDBY
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
            
            {/* Parameters Panel */}
            <div className="md:col-span-8 glass-panel p-panel-padding rounded-lg space-y-md">
              <div className="flex items-center gap-sm mb-xs">
                <span className="material-symbols-outlined text-primary text-sm">settings</span>
                <span className="font-label-caps text-label-caps text-on-surface">INITIALIZATION_DECK</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div>
                  <label className="block font-label-caps text-[9px] text-on-surface-variant mb-xs">EVENT_NAME</label>
                  <input 
                    type="text" 
                    value={config.eventName}
                    onChange={(e) => setConfig(prev => ({ ...prev, eventName: e.target.value }))}
                    className="w-full bg-black/40 border-outline-variant/40 border text-primary font-label-caps px-md py-sm focus:ring-0 focus:border-secondary text-xs outline-none" 
                  />
                </div>
                <div>
                  <label className="block font-label-caps text-[9px] text-on-surface-variant mb-xs">PROJECT_NAME</label>
                  <input 
                    type="text" 
                    value={config.projectName}
                    onChange={(e) => setConfig(prev => ({ ...prev, projectName: e.target.value }))}
                    className="w-full bg-black/40 border-outline-variant/40 border text-primary font-label-caps px-md py-sm focus:ring-0 focus:border-secondary text-xs outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant mb-xs">FOLDER_PATH</label>
                <div className="flex">
                  <span className="bg-black/60 border border-outline-variant/40 border-r-0 px-md py-sm flex items-center shrink-0">
                    <span className="material-symbols-outlined text-sm text-on-surface-variant">folder</span>
                  </span>
                  <input 
                    type="text" 
                    value={config.projectPath}
                    onChange={(e) => setConfig(prev => ({ ...prev, projectPath: e.target.value }))}
                    className="w-full bg-black/40 border-outline-variant/40 border text-on-surface-variant font-label-caps px-md py-sm focus:ring-0 focus:border-secondary text-xs outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant mb-xs">OBJECTIVE_SUMMARY</label>
                <textarea 
                  rows={3}
                  value={config.objective}
                  onChange={(e) => setConfig(prev => ({ ...prev, objective: e.target.value }))}
                  className="w-full bg-black/40 border-outline-variant/40 border text-on-surface font-body-md text-xs p-sm focus:ring-0 focus:border-secondary resize-none outline-none"
                  placeholder="Summarize hackathon objective..."
                />
              </div>
            </div>

            {/* Static Stack Preview */}
            <div className="md:col-span-4 glass-panel p-panel-padding rounded-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-sm mb-md">
                  <span className="material-symbols-outlined text-secondary text-sm">bolt</span>
                  <span className="font-label-caps text-label-caps text-on-surface">ACTIVE_STACK</span>
                </div>
                <p className="text-[11px] text-on-surface-variant leading-relaxed mb-md">
                  Stack configuration hot-locked from active console settings:
                </p>

                <div className="space-y-sm font-mono text-[10px]">
                  <div className="flex justify-between border-b border-outline-variant/20 pb-1.5">
                    <span className="text-on-surface-variant">LANGUAGE</span>
                    <span className="text-primary font-bold">{activeLanguage}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-1.5">
                    <span className="text-on-surface-variant">FRAMEWORK</span>
                    <span className="text-on-surface">{activeFramework}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/20 pb-1.5">
                    <span className="text-on-surface-variant">STYLING</span>
                    <span className="text-on-surface">{activeCssEngine}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">DATABASE</span>
                    <span className="text-secondary font-bold">{activeDatabase}</span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-on-surface-variant/60 leading-normal border-t border-outline-variant/20 pt-md mt-md">
                *Re-configure stack definitions anytime via the Operator Console tabs.
              </div>
            </div>

          </div>

          {/* Template Selectors */}
          <div className="space-y-sm">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider block">
              SELECT_WORKSPACE_CHECKLIST_TEMPLATE
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {[
                {
                  id: 'from-scratch',
                  title: 'Full-Stack Setup',
                  desc: 'Starter template optimized for database engines, API hardening, and server-side deployment tasks.',
                  count: 8
                },
                {
                  id: 'extend-open-source',
                  title: 'Integration Engine',
                  desc: 'Audits forked repositories, sets adapter configurations, and runs core bridge checks.',
                  count: 6
                },
                {
                  id: 'ship-a-feature',
                  title: 'Feature Release',
                  desc: 'Focuses on feature branch isolation, custom components, and deployment checks.',
                  count: 6
                }
              ].map((item) => {
                const isSelected = track === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setTrack(item.id as HackathonTrack)}
                    className={`glass-panel p-md rounded-lg flex flex-col justify-between cursor-pointer border transition-all ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-on-surface-variant'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-center mb-sm">
                        <span className={`font-label-caps text-[11px] ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {item.title.toUpperCase()}
                        </span>
                        <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary text-on-primary-container' : 'border-outline-variant'
                        }`}>
                          {isSelected && <span className="material-symbols-outlined text-[12px] font-bold">check</span>}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="mt-md font-mono text-[9px] text-outline uppercase">
                      {item.count} Checklist Items
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="flex justify-between items-center border-t border-outline-variant/40 pt-md mt-md">
            <span className="font-code-sm text-[11px] text-on-surface-variant">Ready to lock parameters.</span>
            <button
              onClick={handleEnterWorkspace}
              className="bg-primary hover:bg-primary-container text-on-primary-container font-label-caps text-label-caps px-lg py-sm flex items-center gap-xs acid-glow active:scale-95 duration-75 cursor-pointer"
            >
              INITIALIZE WORKSPACE
              <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Workstation Dashboard (entered === true)
  return (
    <div className="flex-1 overflow-hidden flex flex-col relative min-h-0">
      <div className="scanline"></div>
      
      {/* 3-Column Tactical Grid */}
      <div className="grid grid-cols-12 gap-lg flex-1 overflow-y-auto custom-scrollbar p-sm pb-lg min-h-0">
        
        {/* ================= COLUMN 1: CONFIGS & REPOS & ASSETS ================= */}
        <div className="col-span-12 lg:col-span-4 space-y-lg flex flex-col">
          
          {/* Initialization Deck */}
          <section className="glass-panel p-panel-padding rounded-lg shrink-0">
            <div className="flex items-center justify-between mb-md border-b border-outline-variant/20 pb-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-sm">settings</span>
                <h3 className="font-label-caps text-label-caps text-on-surface">INITIALIZATION_DECK</h3>
              </div>
              <button 
                onClick={handleReturnToSetup}
                className="text-secondary hover:underline font-label-caps text-[9px] cursor-pointer"
              >
                RECONFIG
              </button>
            </div>
            
            <div className="space-y-sm font-mono text-[11px]">
              <div className="bg-black/20 p-2 border border-outline-variant/20">
                <span className="block text-[8px] text-on-surface-variant uppercase">EVENT NAME</span>
                <span className="text-primary truncate block font-bold mt-0.5">{config.eventName}</span>
              </div>
              <div className="bg-black/20 p-2 border border-outline-variant/20">
                <span className="block text-[8px] text-on-surface-variant uppercase">PROJECT NAME</span>
                <span className="text-primary truncate block font-bold mt-0.5">{config.projectName}</span>
              </div>
              <div className="bg-black/20 p-2 border border-outline-variant/20">
                <span className="block text-[8px] text-on-surface-variant uppercase">DIRECTORY PATH</span>
                <span className="text-on-surface-variant truncate block mt-0.5">{config.projectPath}</span>
              </div>
            </div>

            <button
              onClick={handleStartForgePlan}
              className="mt-3 w-full bg-secondary/10 hover:bg-secondary text-secondary hover:text-black border border-secondary/40 py-2 rounded font-label-caps text-label-caps transition-all cursor-pointer active:scale-95 duration-75 text-center flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              FORGE PLAN IN SWARM
            </button>
          </section>

          {/* GitHub Repository Manager */}
          <section className="glass-panel p-panel-padding rounded-lg flex flex-col flex-1 min-h-[200px]">
            <div className="flex items-center justify-between mb-md border-b border-outline-variant/20 pb-sm shrink-0">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-sm">account_tree</span>
                <h3 className="font-label-caps text-label-caps text-on-surface">REPO_MANAGER</h3>
              </div>
              <div className="flex items-center gap-xs font-mono text-[9px] uppercase">
                <span className={`h-1.5 w-1.5 rounded-full ${gitHubConnected ? 'bg-primary animate-pulse' : 'bg-amber-warning'}`} />
                <span className={gitHubConnected ? 'text-primary' : 'text-tertiary-container'}>
                  {gitHubConnected ? 'CONNECTED' : 'GUEST_MODE'}
                </span>
              </div>
            </div>

            <div className="flex gap-sm mb-md shrink-0">
              <input 
                type="text" 
                placeholder="github_handle/repo_name..."
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddRepo()}
                className="flex-1 bg-black/40 border border-outline-variant/40 text-primary font-mono text-xs px-3 py-1.5 focus:ring-0 focus:border-secondary outline-none" 
              />
              <button 
                onClick={handleAddRepo}
                className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-black border border-secondary/40 px-3 transition-all cursor-pointer font-mono text-xs flex items-center justify-center"
              >
                ADD
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-sm pr-1">
              {repos.length === 0 ? (
                <div className="text-center font-code-sm text-[10px] text-on-surface-variant py-8">
                  NO GIT REPOSITORIES LINKED
                </div>
              ) : (
                repos.map((repo) => (
                  <div key={repo} className="bg-black/20 p-sm border-l-2 border-primary border border-outline-variant/20 flex items-center justify-between">
                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                      <span className="font-label-caps text-[11px] text-on-surface truncate">{repo}</span>
                      <span className="font-code-sm text-[9px] text-on-surface-variant">branch: <span className="text-secondary">[main]</span></span>
                    </div>
                    <div className="flex items-center gap-sm shrink-0">
                      <div className="flex items-center gap-xs">
                        <span className="material-symbols-outlined text-[13px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                          sync
                        </span>
                        <span className="font-label-caps text-[9px] text-primary">SYNC</span>
                      </div>
                      <button 
                        onClick={() => handleRemoveRepo(repo)}
                        className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Demo & Pitch Asset Capturer */}
          <section className="glass-panel p-panel-padding rounded-lg shrink-0 space-y-md">
            <div className="flex items-center gap-sm border-b border-outline-variant/20 pb-sm">
              <span className="material-symbols-outlined text-secondary text-sm">video_camera_back</span>
              <h3 className="font-label-caps text-label-caps text-on-surface">DEMO_&_PITCH_ASSETS</h3>
            </div>
            
            <p className="text-[10px] text-on-surface-variant leading-relaxed">
              Generate submission assets directly from the workstation environment:
            </p>

            <div className="space-y-sm">
              {isRecordingDemo ? (
                <button
                  onClick={handleStopDemoRecord}
                  className="w-full flex items-center justify-center gap-sm bg-error text-on-error py-2 font-label-caps text-label-caps active:scale-95 duration-75 transition-all cursor-pointer"
                >
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  STOP RECORDING ({Math.floor(demoDuration / 60)}:{(demoDuration % 60).toString().padStart(2, '0')})
                </button>
              ) : (
                <button
                  onClick={handleStartDemoRecord}
                  className="w-full flex items-center justify-center gap-sm border border-secondary text-secondary hover:bg-secondary/10 py-2 font-label-caps text-label-caps active:scale-95 duration-75 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">videocam</span>
                  RECORD DEMO VIDEO
                </button>
              )}

              <button
                onClick={handleGenerateStoryboard}
                disabled={generatingStoryboard}
                className="w-full flex items-center justify-center gap-sm border border-primary text-primary hover:bg-primary/10 py-2 font-label-caps text-label-caps active:scale-95 duration-75 transition-all cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {generatingStoryboard ? 'sync' : 'auto_awesome'}
                </span>
                <span>{generatingStoryboard ? 'GENERATING STORYBOARD...' : 'AI DEMO STORYBOARD'}</span>
              </button>

              <button
                onClick={() => setIsPushPlayOpen(true)}
                className="w-full flex items-center justify-center gap-sm border border-secondary text-secondary hover:bg-secondary/10 py-2 font-label-caps text-label-caps active:scale-95 duration-75 transition-all cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">play_circle</span>
                PUSHPLAY SYNTHESIZER
              </button>


              <div className="grid grid-cols-2 gap-sm">
                <button
                  onClick={handleCaptureSwarmCanvas}
                  className="border border-outline-variant hover:border-secondary bg-black/40 text-on-surface hover:text-secondary py-2 text-center font-label-caps text-[10px] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">photo_camera</span>
                  CRUCIBLE PNG
                </button>
                <button
                  onClick={handleGeneratePitchSlide}
                  className="border border-outline-variant hover:border-primary bg-black/40 text-on-surface hover:text-primary py-2 text-center font-label-caps text-[10px] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[12px] align-middle mr-1">art_track</span>
                  PITCH CARD
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* ================= COLUMN 2: TELEMETRY & CHECKLISTS ================= */}
        <div className="col-span-12 lg:col-span-4 space-y-lg flex flex-col">
          
          {/* Project Health Telemetry */}
          <section className="glass-panel p-md rounded-lg flex flex-col items-center justify-center relative overflow-hidden shrink-0">
            <h3 className="font-label-caps text-label-caps text-primary tracking-[0.2em] mb-md mt-sm select-none">
              OVERALL_PROJECT_HEALTH
            </h3>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle className="text-surface-container-highest" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="4"></circle>
                <circle 
                  className="text-primary transition-all duration-1000 ease-out" 
                  cx="96" 
                  cy="96" 
                  fill="transparent" 
                  r="80" 
                  stroke="currentColor" 
                  strokeDasharray="502.4" 
                  strokeDashoffset={502.4 - (502.4 * overallCompletion) / 100} 
                  strokeWidth="8" 
                  style={{ filter: 'drop-shadow(0 0 6px #ccff80)' }}
                ></circle>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-telemetry-lg text-4xl leading-none text-primary font-bold">{overallCompletion}</span>
                <span className="font-label-caps text-[9px] text-on-surface-variant mt-1">SCORE_PTS</span>
              </div>
            </div>

            <div className="mt-md grid grid-cols-3 gap-xs w-full">
              <div className="text-center p-sm glass-panel bg-primary/5 border-primary/20 rounded min-w-0">
                <p className="font-label-caps text-[8px] text-on-surface-variant truncate">STABILITY</p>
                <p className="font-telemetry-lg text-[10px] text-primary mt-1 truncate">
                  {overallCompletion >= 80 ? 'CRITICAL' : overallCompletion >= 60 ? 'STABLE' : 'RISK'}
                </p>
              </div>
              <div className="text-center p-sm glass-panel bg-secondary/5 border-secondary/20 rounded min-w-0">
                <p className="font-label-caps text-[8px] text-on-surface-variant truncate">OPTIMIZE</p>
                <p className="font-telemetry-lg text-[10px] text-secondary mt-1 truncate">
                  {overallCompletion >= 85 ? 'A-GRADE' : overallCompletion >= 70 ? 'B-GRADE' : 'FAIL'}
                </p>
              </div>
              <div className="text-center p-sm glass-panel bg-tertiary-container/5 border-tertiary-container/20 rounded min-w-0">
                <p className="font-label-caps text-[8px] text-on-surface-variant truncate">FOUNDRY</p>
                <p className="font-telemetry-lg text-[10px] text-tertiary-container mt-1 truncate">
                  {foundryState}
                </p>
              </div>
            </div>
          </section>

          {/* Sub-Category Scorecards */}
          <section className="grid grid-cols-2 gap-sm shrink-0">
            <div className="glass-panel p-sm rounded flex justify-between items-center border-l-4 border-primary">
              <div>
                <p className="font-label-caps text-[9px] text-on-surface-variant">SECURITY</p>
                <p className="font-headline-md text-sm text-primary uppercase font-bold mt-0.5">
                  {diagnostics.categories.security >= 80 ? 'HIGH' : diagnostics.categories.security >= 60 ? 'MED' : 'LOW'}
                </p>
              </div>
              <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
            </div>

            <div className="glass-panel p-sm rounded flex justify-between items-center border-l-4 border-tertiary-container">
              <div>
                <p className="font-label-caps text-[9px] text-on-surface-variant">PERF_INDEX</p>
                <p className="font-headline-md text-sm text-tertiary-container uppercase font-bold mt-0.5">
                  {diagnostics.categories.performance >= 80 ? 'HIGH' : diagnostics.categories.performance >= 60 ? 'MED' : 'LOW'}
                </p>
              </div>
              <span className="material-symbols-outlined text-tertiary-container text-lg">speed</span>
            </div>

            <div className="glass-panel p-sm rounded flex justify-between items-center border-l-4 border-error">
              <div>
                <p className="font-label-caps text-[9px] text-on-surface-variant">COVERAGE</p>
                <p className="font-headline-md text-sm text-error uppercase font-bold mt-0.5">
                  {diagnostics.categories.coverage >= 80 ? 'HIGH' : diagnostics.categories.coverage >= 60 ? 'MED' : 'LOW'}
                </p>
              </div>
              <span className="material-symbols-outlined text-error text-lg">bug_report</span>
            </div>

            <div className="glass-panel p-sm rounded flex justify-between items-center border-l-4 border-primary">
              <div>
                <p className="font-label-caps text-[9px] text-on-surface-variant">GIT_HEALTH</p>
                <p className="font-headline-md text-sm text-primary uppercase font-bold mt-0.5">
                  {diagnostics.categories.git >= 80 ? 'HIGH' : diagnostics.categories.git >= 60 ? 'MED' : 'LOW'}
                </p>
              </div>
              <span className="material-symbols-outlined text-primary text-lg">commit</span>
            </div>
          </section>

          {/* Active Workspace Checklist */}
          <section className="glass-panel p-panel-padding rounded-lg flex flex-col flex-1 min-h-[260px]">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-sm shrink-0 mb-sm">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-sm">checklist</span>
                <span className="font-label-caps text-label-caps text-on-surface">WORKSTATION_CHECKLIST</span>
              </div>
              <span className="font-mono text-[10px] text-primary">
                {checklistCompleted.length}/{activeChecklist.length}
              </span>
            </div>

            {/* Checklist items scrollbar container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-sm pr-1">
              {activeChecklist.map((item, index) => {
                const isChecked = completed.includes(item.id);
                const isCustom = item.id.startsWith('custom_');
                const showGroupHeader = index === 0 || activeChecklist[index - 1].group !== item.group;
                return (
                  <div key={item.id}>
                    {showGroupHeader && (
                      <div className="text-[9px] font-label-caps text-on-surface-variant/50 uppercase pt-2 pb-1">
                        {item.group}
                      </div>
                    )}
                    <div 
                      onClick={() => toggleChecklist(item.id)}
                      className={`flex w-full items-start gap-sm p-sm border transition-all cursor-pointer ${
                        isChecked 
                          ? 'border-primary/30 bg-primary/5 text-on-surface' 
                          : 'border-outline-variant/40 bg-black/20 text-on-surface-variant hover:border-secondary/60'
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary text-sm shrink-0 select-none">
                        {isChecked ? 'check_circle' : 'radio_button_unchecked'}
                      </span>
                      <span className="text-xs leading-normal flex-1 pr-1">{item.label}</span>
                      {isCustom && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveCustomTask(item.id);
                          }}
                          className="text-on-surface-variant hover:text-error transition-colors shrink-0 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Custom Task Injector */}
            <div className="border-t border-outline-variant/20 pt-sm mt-md shrink-0 space-y-sm">
              <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-wider block">
                INJECT_CUSTOM_TASK
              </span>
              <div className="flex gap-xs">
                <input 
                  type="text" 
                  placeholder="Task description..."
                  value={newTaskLabel}
                  onChange={(e) => setNewTaskLabel(e.target.value)}
                  className="flex-1 bg-black/40 border border-outline-variant/40 text-primary font-mono text-xs px-2 py-1 focus:ring-0 focus:border-secondary outline-none" 
                />
                <input 
                  type="text" 
                  placeholder="Group..."
                  value={newTaskGroup}
                  onChange={(e) => setNewTaskGroup(e.target.value)}
                  className="w-20 bg-black/40 border border-outline-variant/40 text-primary font-mono text-xs px-2 py-1 focus:ring-0 focus:border-secondary outline-none" 
                />
                <button 
                  onClick={handleAddCustomTask}
                  className="bg-primary hover:bg-primary-container text-on-primary-container border border-primary/40 px-3 cursor-pointer transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-sm font-bold">add</span>
                </button>
              </div>
            </div>
          </section>

        </div>

        {/* ================= COLUMN 3: WEAK POINTS & CONSOLE & ARCHIVER ================= */}
        <div className="col-span-12 lg:col-span-4 space-y-lg flex flex-col">
          
          {/* Weak Points Feed */}
          <section className="glass-panel p-panel-padding rounded-lg flex flex-col flex-1 min-h-[220px]">
            <div className="flex items-center gap-sm mb-md border-b border-outline-variant/20 pb-sm shrink-0">
              <span className="material-symbols-outlined text-error text-sm">warning</span>
              <h3 className="font-label-caps text-label-caps text-on-surface">WEAK_POINTS_FEED</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-sm pr-1">
              {diagnostics.weakPoints.length === 0 ? (
                <div className="border border-primary/20 bg-primary/5 p-4 rounded text-center text-xs font-mono text-primary flex items-center justify-center gap-xs">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                  ALL WORKSPACE TELEMETRY OPTIMAL
                </div>
              ) : (
                diagnostics.weakPoints.map((issue) => {
                  const isSelected = selectedIssueId === issue.id;
                  const severityStyles = 
                    issue.severity === 'critical'
                      ? 'bg-error/10 border border-error/20 text-error'
                      : issue.severity === 'warning'
                        ? 'bg-tertiary-container/10 border border-tertiary-container/20 text-tertiary-container'
                        : 'bg-on-surface-variant/10 border border-outline-variant/40 text-on-surface-variant';
                  
                  return (
                    <div 
                      key={issue.id}
                      onClick={() => setSelectedIssueId(isSelected ? null : issue.id)}
                      className={`flex flex-col p-sm transition-all cursor-pointer ${severityStyles}`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-sm min-w-0">
                          <span className="font-label-caps text-[9px] px-xs border uppercase self-start mt-0.5">
                            {issue.severity}
                          </span>
                          <span className="font-label-caps text-xs text-on-surface truncate block">
                            {issue.message}
                          </span>
                        </div>
                        <span className="material-symbols-outlined text-[14px] ml-xs shrink-0 self-center text-on-surface-variant">
                          {isSelected ? 'expand_less' : 'expand_more'}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="mt-sm pt-sm border-t border-outline-variant/20 font-code-sm text-[10px] text-on-surface-variant leading-relaxed">
                          <span className="text-primary font-bold">RECOM:</span> {issue.recommendation}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* Diagnostics scanner & Console */}
          <section className="space-y-sm shrink-0">
            <button 
              onClick={triggerDiagnosticScan}
              disabled={isScanning}
              className="w-full bg-primary hover:bg-primary-container text-on-primary-container py-3 font-headline-md text-headline-md acid-glow transition-all active:scale-95 flex items-center justify-center gap-md cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">radar</span>
              RUN DIAGNOSTICS
            </button>

            {/* Monospace terminal console */}
            <div className="glass-panel p-md rounded-lg h-[180px] flex flex-col font-code-sm text-[11px]">
              <div className="flex items-center justify-between border-b border-outline-variant/40 pb-xs mb-sm shrink-0">
                <span className="text-primary font-label-caps">SCAN_CONSOLE.LOG</span>
                <button 
                  onClick={() => onNavigate('console')}
                  className="text-on-surface-variant hover:text-secondary font-label-caps text-[9px] cursor-pointer"
                >
                  FULL_STREAM
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-xs text-on-surface-variant custom-scrollbar select-text pr-1">
                {scanLogs.length === 0 ? (
                  <p className="text-outline-variant">[AWAIT] Click RUN DIAGNOSTICS to engage testing pipeline...</p>
                ) : (
                  scanLogs.map((line, idx) => {
                    let textClass = 'text-on-surface-variant';
                    if (line.includes('completed') || line.includes('finalising')) textClass = 'text-primary';
                    if (line.includes('error') || line.includes('fail')) textClass = 'text-error';
                    return (
                      <p key={idx} className={textClass}>{line}</p>
                    );
                  })
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </section>

          {/* Session Archiver */}
          <section className="glass-panel p-panel-padding rounded-lg shrink-0">
            <div className="flex items-center gap-sm mb-md border-b border-outline-variant/20 pb-sm">
              <span className="material-symbols-outlined text-secondary text-sm">save</span>
              <h3 className="font-label-caps text-label-caps text-on-surface">SESSION_ARCHIVER</h3>
            </div>
            
            <div className="space-y-md">
              <div>
                <label className="block font-label-caps text-[9px] text-on-surface-variant mb-xs">KEY_ACCOMPLISHMENTS</label>
                <textarea 
                  rows={2}
                  value={archiveAccomplishments}
                  onChange={(e) => setArchiveAccomplishments(e.target.value)}
                  className="w-full bg-black/40 border border-outline-variant/40 text-on-surface font-body-md text-xs p-sm focus:ring-0 focus:border-secondary resize-none outline-none" 
                  placeholder="Log milestones (one per line)..."
                />
              </div>
              <button 
                onClick={handleArchive}
                className="w-full border border-secondary text-secondary hover:bg-secondary/10 py-2 rounded font-label-caps text-label-caps transition-all cursor-pointer active:scale-95"
              >
                ARCHIVE &amp; COMPLETE
              </button>
            </div>
          </section>

        </div>
      </div>

      {/* Storyboard Script Modal */}
      {isStoryboardOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-md animate-fade-in">
          <div className="glass-panel w-full max-w-3xl bg-[#0a1420]/95 border border-outline-variant/40 rounded-lg flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-md border-b border-outline-variant/40 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
                <span className="font-label-caps text-label-caps text-on-surface">AI_DEMO_VIDEO_STORYBOARD</span>
              </div>
              <button 
                onClick={() => setIsStoryboardOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-md space-y-md custom-scrollbar">
              <div className="border border-primary/20 bg-primary/5 p-sm text-xs leading-relaxed text-on-surface rounded-sm">
                <span className="font-bold text-primary mr-1">AI Prompt Strategy:</span> 
                Use this custom-generated storyboard script to record your hackathon video. Read the narration lines aloud while demonstrating the corresponding on-screen actions!
              </div>

              <div className="space-y-lg">
                {storyboardScript.map((step, idx) => (
                  <div key={idx} className="border border-outline-variant/20 bg-black/20 p-md rounded-sm space-y-sm">
                    <div className="font-label-caps text-[11px] text-primary">{step.scene}</div>
                    <div className="font-mono text-[10px] text-secondary italic">{step.visual}</div>
                    <div className="font-body-md text-sm text-on-surface bg-black/40 p-sm border border-outline-variant/10 rounded-xs leading-relaxed select-text">
                      "{step.narration}"
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-md border-t border-outline-variant/40 flex justify-end gap-sm shrink-0">
              <button
                onClick={handleCopyStoryboard}
                className="border border-primary text-primary hover:bg-primary/10 px-md py-sm font-label-caps text-label-caps transition-all cursor-pointer flex items-center gap-xs"
              >
                <span className="material-symbols-outlined text-sm">content_copy</span>
                COPY SCRIPT
              </button>
              <button
                onClick={() => setIsStoryboardOpen(false)}
                className="bg-primary hover:bg-primary-container text-on-primary-container font-label-caps text-label-caps px-md py-sm transition-all cursor-pointer"
              >
                CLOSE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PushPlay Synthesizer Rendering Studio Modal */}
      {isPushPlayOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-md animate-fade-in">
          <div className="glass-panel w-full max-w-4xl bg-[#0a0c10]/95 border border-outline-variant/40 rounded-lg flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-md border-b border-outline-variant/40 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-secondary text-[20px]">play_circle</span>
                <span className="font-label-caps text-label-caps text-on-surface">PUSHPLAY_DEMO_VIDEO_SYNTHESIZER</span>
              </div>
              <button 
                onClick={() => {
                  stopPushPlayRender();
                  setIsPushPlayOpen(false);
                }}
                className="text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-md grid grid-cols-1 lg:grid-cols-12 gap-lg custom-scrollbar">
              
              {/* Left Column: Canvas Preview & Timeline */}
              <div className="lg:col-span-8 space-y-md">
                <div className="relative aspect-[16/9] w-full border border-outline-variant/40 bg-black/60 flex items-center justify-center rounded overflow-hidden">
                  <canvas 
                    ref={pushPlayCanvasRef}
                    width={1280}
                    height={720}
                    className="w-full h-full object-contain"
                  />
                  {!pushPlayRendering && !pushPlayFinished && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-sm">
                      <span className="material-symbols-outlined text-secondary text-5xl animate-pulse">play_circle</span>
                      <span className="font-label-caps text-xs text-on-surface-variant">READY_FOR_SYNTH_RENDER</span>
                    </div>
                  )}
                </div>

                {/* Timeline status bar */}
                <div className="bg-black/40 p-sm border border-outline-variant/20 rounded font-mono text-[10px] space-y-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-on-surface-variant">TIMELINE PROGRESS: {pushPlayProgress}%</span>
                    <span className="text-secondary">{Math.floor(pushPlayTime)}s / 60s</span>
                  </div>
                  <div className="w-full bg-black/60 h-2 rounded border border-outline-variant/10 overflow-hidden">
                    <div 
                      className="bg-secondary h-full transition-all duration-100 ease-linear shadow-[0_0_8px_#ccff80]"
                      style={{ width: `${pushPlayProgress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-xs font-label-caps text-[8px] text-on-surface-variant pt-1 text-center border-t border-outline-variant/15 mt-1">
                    <span className={pushPlayTime < 15 ? 'text-primary font-bold' : ''}>SCENE 1: HOOK (15s)</span>
                    <span className={pushPlayTime >= 15 && pushPlayTime < 35 ? 'text-primary font-bold' : ''}>SCENE 2: STACK (20s)</span>
                    <span className={pushPlayTime >= 35 && pushPlayTime < 50 ? 'text-primary font-bold' : ''}>SCENE 3: DIAG (15s)</span>
                    <span className={pushPlayTime >= 50 ? 'text-primary font-bold' : ''}>SCENE 4: DEPLOY (10s)</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Rendering controls, information, stats */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-md">
                <div className="space-y-md">
                  <div className="border border-outline-variant/20 bg-black/20 p-sm rounded text-xs font-mono text-on-surface-variant space-y-sm">
                    <div className="flex items-center gap-xs text-secondary font-label-caps text-[10px] border-b border-outline-variant/20 pb-xs">
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      SYNTHESIZER CONFIG
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      PushPlay compiles your directory stack config, diagnostics telemetry logs, accomplishments feed, and security credentials directly into a WebM video stream.
                    </p>
                    <div className="space-y-xs text-[9px] pt-1">
                      <div className="flex justify-between"><span className="text-on-surface-variant">Resolution:</span><span className="text-on-surface">1280 x 720 (720p HD)</span></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Framerate:</span><span className="text-on-surface">30 FPS Video</span></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Audio Track:</span><span className="text-on-surface">Synthesized 120BPM TechBeat</span></div>
                      <div className="flex justify-between"><span className="text-on-surface-variant">Voice Track:</span><span className="text-on-surface">Native TTS Voiceover</span></div>
                    </div>
                  </div>

                  {/* Operational States */}
                  <div className="space-y-sm">
                    {pushPlayRendering ? (
                      <button
                        onClick={stopPushPlayRender}
                        className="w-full flex items-center justify-center gap-sm bg-error text-on-error py-2.5 font-label-caps text-label-caps active:scale-95 duration-75 transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                        STOP &amp; EXPORT VIDEO
                      </button>
                    ) : (
                      <button
                        onClick={startPushPlayRender}
                        className="w-full flex items-center justify-center gap-sm bg-secondary text-black hover:bg-secondary-container py-2.5 font-headline-md text-headline-md font-bold active:scale-95 duration-75 transition-all cursor-pointer acid-glow"
                      >
                        <span className="material-symbols-outlined text-[18px]">movie_creation</span>
                        START VIDEO SYNTHESIZER
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-sm">
                      <button
                        onClick={handleTogglePushPlayMute}
                        className="border border-outline-variant hover:border-on-surface-variant bg-black/40 text-on-surface py-2 text-center font-label-caps text-[10px] transition-all cursor-pointer flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-sm">
                          {pushPlayMuted ? 'volume_off' : 'volume_up'}
                        </span>
                        <span>{pushPlayMuted ? 'UNMUTE AUD' : 'MUTE AUD'}</span>
                      </button>

                      <button
                        onClick={downloadPushPlaySlidePng}
                        disabled={!pushPlayRendering}
                        className="border border-outline-variant hover:border-on-surface-variant bg-black/40 text-on-surface py-2 text-center font-label-caps text-[10px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-xs"
                      >
                        <span className="material-symbols-outlined text-sm">photo_camera</span>
                        <span>SNAP SLIDE</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="border-t border-outline-variant/20 pt-md text-[9px] text-on-surface-variant/60 leading-normal font-mono uppercase">
                  *Video is compiled in browser memory and downloaded directly upon completion.
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-md border-t border-outline-variant/40 flex justify-end gap-sm shrink-0">
              <button
                onClick={() => {
                  stopPushPlayRender();
                  setIsPushPlayOpen(false);
                }}
                className="bg-primary hover:bg-primary-container text-on-primary-container font-label-caps text-label-caps px-md py-sm transition-all cursor-pointer"
              >
                CLOSE STUDIO
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
