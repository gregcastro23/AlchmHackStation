import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Atom, Cpu, Gauge, Hexagon, Play, RotateCcw, Sparkles, Zap } from 'lucide-react';
import {
  AGENTS,
  AGENT_BY_ROLE,
  PATTERNS,
  SAMPLE_IDEAS,
  decomposeIdea,
  LANGUAGES,
  LANGUAGE_NAMES,
} from '../lib/swarmEngine';
import type {
  AgentRole,
  AgentSpec,
  BuildPlan,
  OrchestrationPattern,
  Phase,
  PlanTask,
} from '../lib/swarmEngine';

interface SwarmNexusProps {
  onCommitLog?: (text: string, type?: 'default' | 'info' | 'success' | 'warning') => void;
  onReadiness?: (delta: number) => void;
}

// ---- simulation model (lives entirely in a ref; never triggers React renders) ----
interface SimAgent {
  spec: AgentSpec;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseAngle: number;
  load: number;
  pulse: number;
  tasksDone: number;
}

interface SimTask extends PlanTask {
  status: 'queued' | 'active' | 'done';
  progress: number;
  agentIndex: number;
}

interface SimParticle {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  cx: number;
  cy: number;
  x: number;
  y: number;
  t: number;
  speed: number;
  color: string;
  size: number;
  trail: Array<{ x: number; y: number }>;
  onArrive?: () => void;
}

interface SimRipple {
  x: number;
  y: number;
  r: number;
  max: number;
  color: string;
}

interface SimSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface Sim {
  agents: SimAgent[];
  tasks: SimTask[];
  particles: SimParticle[];
  ripples: SimRipple[];
  sparks: SimSpark[];
  edgeHeat: number[][];
  core: { x: number; y: number; pulse: number; charge: number };
  pattern: OrchestrationPattern;
  running: boolean;
  shipped: boolean;
  clock: number;
  lastDispatch: number;
  startedAt: number;
  completed: number;
  tokens: number;
  tokensPerSec: number;
  w: number;
  h: number;
  orbit: number;
  pointer: { x: number; y: number; dragging: number };
}

interface HudView {
  phase: 'idle' | 'forging' | 'shipped';
  active: number;
  completed: number;
  total: number;
  throughput: number;
  tokensPerSec: number;
  coherence: number;
  elapsed: number;
}

const PHASE_TINT: Record<Phase, string> = {
  Plan: '#9ddf2e',
  Build: '#7dd3fc',
  Verify: '#ffb020',
  Ship: '#fb7185',
};

const ROLE_ORDER: AgentRole[] = ['architect', 'builder', 'designer', 'sentinel', 'herald', 'captain'];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CONCURRENCY: Record<OrchestrationPattern, number> = {
  fanout: 99,
  pipeline: 99,
  supervisor: 1,
  debate: 2,
  swarm: 3,
};

function agentEdges(pattern: OrchestrationPattern): Array<[number, number]> {
  const idx = (r: AgentRole) => ROLE_ORDER.indexOf(r);
  if (pattern === 'pipeline') {
    const e: Array<[number, number]> = [];
    for (let i = 0; i < ROLE_ORDER.length - 1; i++) e.push([i, i + 1]);
    return e;
  }
  if (pattern === 'swarm') {
    const e: Array<[number, number]> = [];
    for (let i = 0; i < ROLE_ORDER.length; i++) e.push([i, (i + 1) % ROLE_ORDER.length]);
    return e;
  }
  if (pattern === 'debate') {
    return [[idx('builder'), idx('sentinel')], [idx('architect'), idx('herald')]];
  }
  return []; // fanout + supervisor are pure stars (core only)
}

export const SwarmNexus: React.FC<SwarmNexusProps> = ({ onCommitLog, onReadiness }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const simRef = useRef<Sim | null>(null);
  const rafRef = useRef<number>(0);

  const [idea, setIdea] = useState('Launch of Alchm Token System on Ethereum - deploy ERC-20 contract, coordinate planetary agent nodes, and establish on-chain secure verification gates.');
  const [pattern, setPattern] = useState<OrchestrationPattern>('swarm');
  const [plan, setPlan] = useState<BuildPlan | null>(null);
  const [taskView, setTaskView] = useState<Array<{ task: PlanTask; status: SimTask['status']; progress: number }>>([]);
  const [hud, setHud] = useState<HudView>({
    phase: 'idle',
    active: 0,
    completed: 0,
    total: 0,
    throughput: 0,
    tokensPerSec: 0,
    coherence: 100,
    elapsed: 0,
  });

  // Task customizability states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRole, setNewTaskRole] = useState<AgentRole>('builder');
  const [newTaskPhase, setNewTaskPhase] = useState<Phase>('Build');
  const [newTaskComplexity, setNewTaskComplexity] = useState<number>(3);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskRole, setEditTaskRole] = useState<AgentRole>('builder');
  const [editTaskPhase, setEditTaskPhase] = useState<Phase>('Build');
  const [editTaskComplexity, setEditTaskComplexity] = useState<number>(3);

  const log = useCallback(
    (text: string, type: 'default' | 'info' | 'success' | 'warning' = 'info') => {
      onCommitLog?.(text, type);
    },
    [onCommitLog],
  );

  // -- init simulation once --
  function ensureSim(w: number, h: number): Sim {
    if (simRef.current) {
      simRef.current.w = w;
      simRef.current.h = h;
      simRef.current.core.x = w / 2;
      simRef.current.core.y = h / 2;
      simRef.current.orbit = Math.min(w, h) * 0.34;
      return simRef.current;
    }
    const orbit = Math.min(w, h) * 0.34;
    const agents: SimAgent[] = AGENTS.map((spec, i) => {
      const a = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
      return {
        spec,
        baseAngle: a,
        x: w / 2 + Math.cos(a) * orbit,
        y: h / 2 + Math.sin(a) * orbit,
        vx: 0,
        vy: 0,
        load: 0.05,
        pulse: 0,
        tasksDone: 0,
      };
    });
    const sim: Sim = {
      agents,
      tasks: [],
      particles: [],
      ripples: [],
      sparks: [],
      edgeHeat: AGENTS.map(() => AGENTS.map(() => 0)),
      core: { x: w / 2, y: h / 2, pulse: 0, charge: 0 },
      pattern: 'swarm',
      running: false,
      shipped: false,
      clock: 0,
      lastDispatch: 0,
      startedAt: 0,
      completed: 0,
      tokens: 0,
      tokensPerSec: 0,
      w,
      h,
      orbit,
      pointer: { x: -9999, y: -9999, dragging: -1 },
    };
    simRef.current = sim;
    return sim;
  }

  const forge = useCallback((ideaOverride?: string, langOverride?: string) => {
    const sim = simRef.current;
    if (!sim) return;
    const built = decomposeIdea(ideaOverride ?? idea, langOverride);
    setPlan(built);
    const tasks: SimTask[] = built.tasks.map((t) => ({
      ...t,
      status: 'queued',
      progress: 0,
      agentIndex: ROLE_ORDER.indexOf(t.role),
    }));
    sim.tasks = tasks;
    sim.particles = [];
    sim.sparks = [];
    sim.running = true;
    sim.shipped = false;
    sim.completed = 0;
    sim.tokens = 0;
    sim.startedAt = sim.clock;
    sim.lastDispatch = sim.clock;
    sim.core.pulse = 1;
    sim.ripples.push({ x: sim.core.x, y: sim.core.y, r: 8, max: sim.orbit * 1.4, color: '#9ddf2e' });
    log(`[NEXUS] Forging "${built.headline}" → ${tasks.length} tasks across ${AGENTS.length} agents (${sim.pattern.toUpperCase()}).`, 'success');
    if (built.domains.length) {
      log(`[NEXUS] Domains detected: ${built.domains.map((d) => d.label).join(', ')}.`, 'info');
    }
  }, [idea, log]);

  const handleUpdateStackValue = (key: keyof BuildPlan['stack'], value: string) => {
    if (!plan) return;
    const updatedPlan = {
      ...plan,
      stack: {
        ...plan.stack,
        [key]: value,
      },
    };
    setPlan(updatedPlan);
    log(`[NEXUS] Stack updated: ${key} set to ${value}.`, 'info');
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const sim = simRef.current;
    if (!sim || !plan) return;

    const newId = `task_custom_${Date.now()}`;
    const order: Record<Phase, number> = { Plan: 0, Build: 1, Verify: 2, Ship: 3 };
    let dependsOn = -1;
    for (let j = sim.tasks.length - 1; j >= 0; j--) {
      if (order[sim.tasks[j].phase] < order[newTaskPhase]) {
        dependsOn = j;
        break;
      }
    }

    const newTask: SimTask = {
      id: newId,
      title: newTaskTitle.trim(),
      phase: newTaskPhase,
      role: newTaskRole,
      complexity: newTaskComplexity,
      domain: 'custom',
      dependsOn,
      status: 'queued',
      progress: 0,
      agentIndex: ROLE_ORDER.indexOf(newTaskRole),
    };

    const updatedTasks = [...sim.tasks, newTask];
    updatedTasks.sort((a, b) => order[a.phase] - order[b.phase]);
    
    updatedTasks.forEach((t, i) => {
      let dep = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (order[updatedTasks[j].phase] < order[t.phase]) {
          dep = j;
          break;
        }
      }
      t.dependsOn = dep;
    });

    sim.tasks = updatedTasks;
    setPlan({
      ...plan,
      tasks: updatedTasks,
      totalComplexity: updatedTasks.reduce((sum, t) => sum + t.complexity, 0),
    });
    setTaskView(updatedTasks.map((t) => ({ task: t, status: t.status, progress: t.progress })));

    setNewTaskTitle('');
    setIsAddingTask(false);
    log(`[NEXUS] Custom task added: "${newTask.title}" for ${newTaskRole.toUpperCase()}.`, 'success');
  };

  const handleDeleteTask = (taskId: string) => {
    const sim = simRef.current;
    if (!sim || !plan) return;

    const taskToDelete = sim.tasks.find((t) => t.id === taskId);
    if (!taskToDelete) return;

    const updatedTasks = sim.tasks.filter((t) => t.id !== taskId);
    
    const order: Record<Phase, number> = { Plan: 0, Build: 1, Verify: 2, Ship: 3 };
    updatedTasks.forEach((t, i) => {
      let dep = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (order[updatedTasks[j].phase] < order[t.phase]) {
          dep = j;
          break;
        }
      }
      t.dependsOn = dep;
    });

    sim.tasks = updatedTasks;
    setPlan({
      ...plan,
      tasks: updatedTasks,
      totalComplexity: updatedTasks.reduce((sum, t) => sum + t.complexity, 0),
    });
    setTaskView(updatedTasks.map((t) => ({ task: t, status: t.status, progress: t.progress })));
    log(`[NEXUS] Task deleted: "${taskToDelete.title}".`, 'warning');
  };

  const handleStartEdit = (task: PlanTask) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskRole(task.role);
    setEditTaskPhase(task.phase);
    setEditTaskComplexity(task.complexity);
  };

  const handleSaveEdit = (taskId: string) => {
    const sim = simRef.current;
    if (!sim || !plan) return;

    const updatedTasks = sim.tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          title: editTaskTitle.trim(),
          role: editTaskRole,
          phase: editTaskPhase,
          complexity: editTaskComplexity,
          agentIndex: ROLE_ORDER.indexOf(editTaskRole),
        };
      }
      return t;
    });

    const order: Record<Phase, number> = { Plan: 0, Build: 1, Verify: 2, Ship: 3 };
    updatedTasks.sort((a, b) => order[a.phase] - order[b.phase]);

    updatedTasks.forEach((t, i) => {
      let dep = -1;
      for (let j = i - 1; j >= 0; j--) {
        if (order[updatedTasks[j].phase] < order[t.phase]) {
          dep = j;
          break;
        }
      }
      t.dependsOn = dep;
    });

    sim.tasks = updatedTasks;
    setPlan({
      ...plan,
      tasks: updatedTasks,
      totalComplexity: updatedTasks.reduce((sum, t) => sum + t.complexity, 0),
    });
    setTaskView(updatedTasks.map((t) => ({ task: t, status: t.status, progress: t.progress })));
    setEditingTaskId(null);
    log(`[NEXUS] Task updated: "${editTaskTitle.trim()}".`, 'info');
  };

  const reset = useCallback(() => {
    const sim = simRef.current;
    if (!sim) return;
    sim.tasks = [];
    sim.particles = [];
    sim.sparks = [];
    sim.ripples = [];
    sim.running = false;
    sim.shipped = false;
    sim.completed = 0;
    sim.tokens = 0;
    sim.agents.forEach((a) => {
      a.load = 0.05;
      a.tasksDone = 0;
      a.pulse = 0;
    });
    setPlan(null);
    setTaskView([]);
    log('[NEXUS] Swarm reset to idle orbit.', 'default');
  }, [log]);

  // keep sim.pattern in sync with selector
  useEffect(() => {
    if (simRef.current) simRef.current.pattern = pattern;
  }, [pattern]);

  // external forge bridge — Overmind (or any module) can dispatch a build here
  useEffect(() => {
    const onExternalForge = (e: Event) => {
      const detail = (e as CustomEvent<{ idea?: string; pattern?: OrchestrationPattern }>).detail ?? {};
      if (detail.pattern) {
        setPattern(detail.pattern);
        if (simRef.current) simRef.current.pattern = detail.pattern;
      }
      if (detail.idea) setIdea(detail.idea);
      forge(detail.idea);
    };
    window.addEventListener('alchm:forge', onExternalForge);
    return () => window.removeEventListener('alchm:forge', onExternalForge);
  }, [forge]);

  // -- the engine loop --
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(320, rect.width);
      const h = Math.max(320, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ensureSim(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const spawnDispatch = (sim: Sim, ai: number) => {
      const ag = sim.agents[ai];
      const mx = (sim.core.x + ag.x) / 2 + (Math.random() - 0.5) * 40;
      const my = (sim.core.y + ag.y) / 2 + (Math.random() - 0.5) * 40;
      sim.particles.push({
        fromX: sim.core.x,
        fromY: sim.core.y,
        toX: ag.x,
        toY: ag.y,
        cx: mx,
        cy: my,
        x: sim.core.x,
        y: sim.core.y,
        t: 0,
        speed: 0.7 + Math.random() * 0.4,
        color: ag.spec.color,
        size: 2.2,
        trail: [],
        onArrive: () => {
          ag.pulse = 1;
        },
      });
    };

    const spawnResult = (sim: Sim, ai: number, color: string) => {
      const ag = sim.agents[ai];
      const mx = (sim.core.x + ag.x) / 2 + (Math.random() - 0.5) * 50;
      const my = (sim.core.y + ag.y) / 2 + (Math.random() - 0.5) * 50;
      sim.particles.push({
        fromX: ag.x,
        fromY: ag.y,
        toX: sim.core.x,
        toY: sim.core.y,
        cx: mx,
        cy: my,
        x: ag.x,
        y: ag.y,
        t: 0,
        speed: 0.9 + Math.random() * 0.5,
        color,
        size: 2.6,
        trail: [],
        onArrive: () => {
          sim.core.pulse = Math.min(1.4, sim.core.pulse + 0.45);
        },
      });
      // completion burst
      for (let i = 0; i < 10; i++) {
        const an = Math.random() * Math.PI * 2;
        const sp = 30 + Math.random() * 70;
        sim.sparks.push({ x: ag.x, y: ag.y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp, life: 1, color });
      }
    };

    const eligible = (sim: Sim, t: SimTask): boolean => {
      if (t.status !== 'queued') return false;
      if (sim.pattern === 'fanout') return true;
      if (t.dependsOn >= 0 && sim.tasks[t.dependsOn].status !== 'done') return false;
      if (sim.pattern === 'pipeline') {
        const order: Record<Phase, number> = { Plan: 0, Build: 1, Verify: 2, Ship: 3 };
        // find lowest phase that still has incomplete tasks
        let minPhase = 4;
        for (const tk of sim.tasks) {
          if (tk.status !== 'done') minPhase = Math.min(minPhase, order[tk.phase]);
        }
        return order[t.phase] === minPhase;
      }
      return true;
    };

    const schedule = (sim: Sim) => {
      if (!sim.running) return;
      const cap = CONCURRENCY[sim.pattern];
      const cooldown = sim.pattern === 'fanout' ? 0.05 : 0.16;
      let active = sim.tasks.filter((t) => t.status === 'active').length;
      const queued = sim.tasks.filter((t) => t.status === 'queued').length;
      if (queued === 0 && active === 0) {
        if (!sim.shipped) {
          sim.shipped = true;
          sim.running = false;
          sim.core.pulse = 1.4;
          sim.ripples.push({ x: sim.core.x, y: sim.core.y, r: 8, max: sim.orbit * 1.8, color: '#9ddf2e' });
          log(`[NEXUS] Mission shipped — ${sim.completed} tasks resolved, swarm coherent.`, 'success');
          onReadiness?.(6);
        }
        return;
      }
      if (sim.clock - sim.lastDispatch < cooldown) return;
      while (active < cap) {
        // pick the eligible queued task with the lowest phase then complexity
        const order: Record<Phase, number> = { Plan: 0, Build: 1, Verify: 2, Ship: 3 };
        let pick: SimTask | null = null;
        for (const t of sim.tasks) {
          if (!eligible(sim, t)) continue;
          if (!pick || order[t.phase] < order[pick.phase] || (order[t.phase] === order[pick.phase] && t.complexity > pick.complexity)) {
            pick = t;
          }
        }
        if (!pick) break;
        pick.status = 'active';
        pick.progress = 0;
        spawnDispatch(sim, pick.agentIndex);
        sim.lastDispatch = sim.clock;
        active += 1;
        if (sim.pattern === 'debate') {
          // volley between builder and sentinel before commit
          const b = ROLE_ORDER.indexOf('builder');
          const s = ROLE_ORDER.indexOf('sentinel');
          sim.edgeHeat[b][s] = 1;
          sim.edgeHeat[s][b] = 1;
        }
        if (sim.pattern !== 'fanout') break; // others stagger one per cooldown
      }
    };

    const step = (sim: Sim, dt: number) => {
      sim.clock += dt;
      // --- task progress ---
      for (const t of sim.tasks) {
        if (t.status !== 'active') continue;
        const rate = 1 / (t.complexity * 0.9 + 0.5);
        t.progress += dt * rate;
        sim.tokens += dt * (40 + t.complexity * 55);
        if (t.progress >= 1) {
          t.progress = 1;
          t.status = 'done';
          sim.completed += 1;
          sim.agents[t.agentIndex].tasksDone += 1;
          spawnResult(sim, t.agentIndex, PHASE_TINT[t.phase]);
          onReadiness?.(1);
        }
      }
      schedule(sim);

      // instantaneous token/sec estimate
      const activeTasks = sim.tasks.filter((t) => t.status === 'active');
      const tps = activeTasks.reduce((s, t) => s + 40 + t.complexity * 55, 0);
      sim.tokensPerSec = lerp(sim.tokensPerSec, tps, 0.1);

      // --- physics ---
      const { core, orbit } = sim;
      core.pulse = Math.max(0, core.pulse - dt * 1.1);
      core.charge = lerp(core.charge, activeTasks.length > 0 ? 1 : 0.2, dt * 3);

      for (let i = 0; i < sim.agents.length; i++) {
        const ag = sim.agents[i];
        const load = clamp(
          0.05 + sim.tasks.filter((t) => t.agentIndex === i && t.status === 'active').length * 0.55,
          0,
          1,
        );
        ag.load = lerp(ag.load, load, dt * 4);
        ag.pulse = Math.max(0, ag.pulse - dt * 1.6);

        if (sim.pointer.dragging === i) {
          ag.x = sim.pointer.x;
          ag.y = sim.pointer.y;
          ag.vx = 0;
          ag.vy = 0;
          continue;
        }

        const drift = sim.clock * 0.06;
        const ang = ag.baseAngle + drift;
        const rad = orbit * (1 + ag.load * 0.12) + Math.sin(sim.clock * 0.8 + i) * 6;
        const ax = core.x + Math.cos(ang) * rad;
        const ay = core.y + Math.sin(ang) * rad;
        // spring to anchor
        ag.vx += (ax - ag.x) * 2.4 * dt;
        ag.vy += (ay - ag.y) * 2.4 * dt;
        // repulsion between agents
        for (let j = 0; j < sim.agents.length; j++) {
          if (j === i) continue;
          const o = sim.agents[j];
          const dx = ag.x - o.x;
          const dy = ag.y - o.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 14000 && d2 > 0.01) {
            const f = (14000 - d2) / 14000;
            const d = Math.sqrt(d2);
            ag.vx += (dx / d) * f * 220 * dt;
            ag.vy += (dy / d) * f * 220 * dt;
          }
        }
        ag.vx *= 0.86;
        ag.vy *= 0.86;
        ag.x += ag.vx * dt * 6;
        ag.y += ag.vy * dt * 6;
      }

      // --- particles ---
      for (let i = sim.particles.length - 1; i >= 0; i--) {
        const p = sim.particles[i];
        p.t += dt * p.speed;
        const tt = clamp(p.t, 0, 1);
        const mt = 1 - tt;
        p.x = mt * mt * p.fromX + 2 * mt * tt * p.cx + tt * tt * p.toX;
        p.y = mt * mt * p.fromY + 2 * mt * tt * p.cy + tt * tt * p.toY;
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 9) p.trail.shift();
        if (p.t >= 1) {
          p.onArrive?.();
          sim.particles.splice(i, 1);
        }
      }
      if (sim.particles.length > 160) sim.particles.splice(0, sim.particles.length - 160);

      // --- ripples & sparks & edge heat ---
      for (let i = sim.ripples.length - 1; i >= 0; i--) {
        const r = sim.ripples[i];
        r.r += dt * 240;
        if (r.r >= r.max) sim.ripples.splice(i, 1);
      }
      for (let i = sim.sparks.length - 1; i >= 0; i--) {
        const s = sim.sparks[i];
        s.life -= dt * 1.6;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.vx *= 0.92;
        s.vy *= 0.92;
        if (s.life <= 0) sim.sparks.splice(i, 1);
      }
      for (let a = 0; a < sim.edgeHeat.length; a++) {
        for (let b = 0; b < sim.edgeHeat[a].length; b++) {
          sim.edgeHeat[a][b] = Math.max(0, sim.edgeHeat[a][b] - dt * 0.8);
        }
      }
    };

    const draw = (sim: Sim) => {
      const { w, h, core } = sim;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // backdrop
      ctx.fillStyle = '#07080a';
      ctx.fillRect(0, 0, w, h);
      const bg = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, Math.max(w, h) * 0.7);
      bg.addColorStop(0, 'rgba(157,223,46,0.05)');
      bg.addColorStop(0.4, 'rgba(125,211,252,0.015)');
      bg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // faint grid
      ctx.strokeStyle = 'rgba(143,146,130,0.05)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 32) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
      }
      for (let y = 0; y < h; y += 32) {
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
      }
      ctx.stroke();

      ctx.globalCompositeOperation = 'lighter';

      // core -> agent edges
      for (let i = 0; i < sim.agents.length; i++) {
        const ag = sim.agents[i];
        const heat = clamp(ag.load, 0, 1);
        ctx.strokeStyle = `rgba(157,223,46,${0.05 + heat * 0.22})`;
        ctx.lineWidth = 1 + heat * 1.6;
        ctx.beginPath();
        ctx.moveTo(core.x, core.y);
        ctx.lineTo(ag.x, ag.y);
        ctx.stroke();
      }
      // pattern agent-agent edges
      for (const [a, b] of agentEdges(sim.pattern)) {
        const A = sim.agents[a];
        const B = sim.agents[b];
        const heat = Math.max(sim.edgeHeat[a][b], (A.load + B.load) * 0.3);
        ctx.strokeStyle = `rgba(125,211,252,${0.06 + heat * 0.3})`;
        ctx.lineWidth = 1 + heat * 2;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(B.x, B.y);
        ctx.stroke();
      }

      // particles + trails
      for (const p of sim.particles) {
        for (let k = 0; k < p.trail.length; k++) {
          const pt = p.trail[k];
          const a = (k / p.trail.length) * 0.5;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = a;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, p.size * (k / p.trail.length), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
        g.addColorStop(0, p.color);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // sparks
      for (const s of sim.sparks) {
        ctx.globalAlpha = clamp(s.life, 0, 1);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ripples
      for (const r of sim.ripples) {
        const a = clamp(1 - r.r / r.max, 0, 1) * 0.5;
        ctx.strokeStyle = r.color;
        ctx.globalAlpha = a;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      drawCore(ctx, sim);
      for (const ag of sim.agents) drawAgent(ctx, ag);
    };

    let last = performance.now();
    let lastFrameAt = performance.now();
    let lastStepWall = performance.now();
    const loop = (now: number) => {
      const sim = simRef.current;
      if (sim) {
        let dt = (now - last) / 1000;
        if (dt > 0.05) dt = 0.05; // clamp big gaps (tab switches)
        last = now;
        lastFrameAt = now;
        lastStepWall = now;
        step(sim, dt);
        draw(sim);
      } else {
        last = now;
        lastFrameAt = now;
        lastStepWall = now;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    // pointer interaction
    const pointerPos = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onDown = (e: PointerEvent) => {
      const sim = simRef.current;
      if (!sim) return;
      const { x, y } = pointerPos(e);
      sim.pointer.x = x;
      sim.pointer.y = y;
      for (let i = 0; i < sim.agents.length; i++) {
        const ag = sim.agents[i];
        if (Math.hypot(ag.x - x, ag.y - y) < 34) {
          sim.pointer.dragging = i;
          canvas.setPointerCapture(e.pointerId);
          return;
        }
      }
      if (Math.hypot(sim.core.x - x, sim.core.y - y) < 46) {
        sim.core.pulse = 1.3;
        sim.core.charge = 1;
        sim.ripples.push({ x: sim.core.x, y: sim.core.y, r: 8, max: sim.orbit * 1.3, color: '#9ddf2e' });
        onReadiness?.(1);
      }
    };
    const onMove = (e: PointerEvent) => {
      const sim = simRef.current;
      if (!sim) return;
      const { x, y } = pointerPos(e);
      sim.pointer.x = x;
      sim.pointer.y = y;
    };
    const onUp = (e: PointerEvent) => {
      const sim = simRef.current;
      if (!sim) return;
      sim.pointer.dragging = -1;
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* noop */
      }
    };
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);

    // UI mirror sync (decoupled from render rate)
    const sync = setInterval(() => {
      const sim = simRef.current;
      if (!sim) return;
      // rAF watchdog: when frames starve (throttled/background/headless
      // contexts), keep simulation logic advancing in real time without
      // drawing. Fixed 0.1s substeps keep the physics stable even when the
      // interval itself is throttled to ~1Hz by the browser.
      const wallNow = performance.now();
      if (wallNow - lastFrameAt > 400) {
        let pending = Math.min((wallNow - lastStepWall) / 1000, 1.5);
        while (pending > 0.001) {
          const subDt = Math.min(pending, 0.1);
          step(sim, subDt);
          pending -= subDt;
        }
        lastStepWall = wallNow;
      }
      const active = sim.tasks.filter((t) => t.status === 'active').length;
      const total = sim.tasks.length;
      const elapsed = sim.running || sim.shipped ? sim.clock - sim.startedAt : 0;
      const throughput = elapsed > 0.2 ? (sim.completed / elapsed) * 60 : 0;
      // coherence = load balance across agents (1 - normalized spread)
      const loads = sim.agents.map((a) => a.load);
      const mean = loads.reduce((s, v) => s + v, 0) / loads.length;
      const variance = loads.reduce((s, v) => s + (v - mean) ** 2, 0) / loads.length;
      const coherence = clamp(100 - Math.sqrt(variance) * 160, 20, 100);
      setHud({
        phase: sim.shipped ? 'shipped' : sim.running ? 'forging' : 'idle',
        active,
        completed: sim.completed,
        total,
        throughput,
        tokensPerSec: sim.tokensPerSec,
        coherence,
        elapsed,
      });
      setTaskView(sim.tasks.map((t) => ({ task: t, status: t.status, progress: t.progress })));
    }, 140);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      clearInterval(sync);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patternMeta = useMemo(() => PATTERNS.find((p) => p.id === pattern)!, [pattern]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 select-none lg:flex-row">
      {/* LEFT — forge + telemetry */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[330px]">
        <div className="border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center gap-2">
            <Atom className="h-4 w-4 text-[#9ddf2e]" />
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#e3e3d8]">The Crucible</h2>
          </div>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f9282]">
            idea → swarm → shipped app
          </p>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) forge();
            }}
            rows={3}
            placeholder="Describe the app you want to build…"
            className="mt-3 w-full resize-none border border-[#44483a] bg-[#0d0f09] p-2.5 font-mono text-[12px] leading-5 text-[#e3e3d8] placeholder:text-[#8f9282]/60 focus:border-[#9ddf2e]/60 focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap gap-1.5">
            {SAMPLE_IDEAS.slice(0, 3).map((s, i) => (
              <button
                key={i}
                onClick={() => setIdea(s)}
                className="border border-[#44483a] bg-[#1b1c16] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[#8f9282] transition hover:border-[#9ddf2e]/50 hover:text-[#9ddf2e]"
              >
                seed {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => forge()}
              className="flex flex-1 items-center justify-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d0f09] transition hover:bg-[#83c300] active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Forge
            </button>
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 border border-[#44483a] bg-[#1b1c16] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c5c8b6] transition hover:border-[#ffb4ab]/50 hover:text-[#ffb4ab]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* pattern selector */}
        <div className="border border-[#44483a] bg-[#12140e] p-4">
          <div className="flex items-center gap-2">
            <Hexagon className="h-3.5 w-3.5 text-[#7dd3fc]" />
            <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Orchestration</h3>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1.5">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPattern(p.id)}
                className={`border px-2 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition ${
                  pattern === p.id
                    ? 'border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e]'
                    : 'border-[#44483a] bg-[#1b1c16] text-[#8f9282] hover:border-[#9ddf2e]/40 hover:text-[#c5c8b6]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="mt-2.5 border-l-2 border-[#9ddf2e]/40 pl-2 font-mono text-[10px] leading-4 text-[#c5c8b6]">
            {patternMeta.blurb}
          </p>
        </div>

        {/* live telemetry HUD */}
        <div className="grid grid-cols-2 gap-2">
          <Metric icon={Zap} label="Throughput" value={`${hud.throughput.toFixed(1)}`} unit="tasks/min" tone="#9ddf2e" />
          <Metric icon={Cpu} label="Token rate" value={`${(hud.tokensPerSec / 1000).toFixed(1)}k`} unit="tok/s" tone="#7dd3fc" />
          <Metric icon={Gauge} label="Coherence" value={`${hud.coherence.toFixed(0)}`} unit="% balance" tone="#ffb020" />
          <Metric
            icon={Sparkles}
            label="Resolved"
            value={`${hud.completed}/${hud.total || 0}`}
            unit={hud.phase === 'shipped' ? 'shipped' : hud.phase === 'forging' ? `${hud.active} active` : 'idle'}
            tone={hud.phase === 'shipped' ? '#9ddf2e' : '#c4b5fd'}
          />
        </div>

        {/* agent roster */}
        <div className="min-h-0 flex-1 overflow-y-auto border border-[#44483a] bg-[#12140e] p-3 custom-scrollbar">
          <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f9282]">Swarm roster</h3>
          <div className="space-y-1.5">
            {ROLE_ORDER.map((role) => {
              const spec = AGENT_BY_ROLE[role];
              const done = taskView.filter((t) => t.task.role === role && t.status === 'done').length;
              const act = taskView.filter((t) => t.task.role === role && t.status === 'active').length;
              return (
                <div key={role} className="flex items-center gap-2 border border-[#44483a]/60 bg-[#1b1c16] px-2 py-1.5">
                  <span className="font-mono text-[13px]" style={{ color: spec.color }}>
                    {spec.glyph}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold tracking-wider text-[#e3e3d8]">{spec.name}</span>
                      <span className="font-mono text-[9px]" style={{ color: act > 0 ? spec.color : '#8f9282' }}>
                        {act > 0 ? '● live' : `${done} done`}
                      </span>
                    </div>
                    <span className="font-mono text-[8.5px] uppercase tracking-wider text-[#8f9282]">{spec.model}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CENTER — the swarm canvas */}
      <div className="relative min-h-[340px] flex-1 overflow-hidden border border-[#44483a] bg-[#07080a]">
        <div ref={wrapRef} className="absolute inset-0">
          <canvas ref={canvasRef} className="h-full w-full touch-none" />
        </div>
        {/* overlay HUD corners */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-3 top-3 flex items-center gap-2 border border-[#9ddf2e]/30 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#9ddf2e] backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9ddf2e] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#9ddf2e]" />
            </span>
            Swarm Nexus // {pattern}
          </div>
          <div className="absolute right-3 top-3 border border-[#44483a] bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#c5c8b6] backdrop-blur-sm">
            {hud.phase === 'forging'
              ? `forging · ${hud.elapsed.toFixed(1)}s`
              : hud.phase === 'shipped'
                ? 'shipped ✓'
                : 'awaiting idea'}
          </div>
          <div className="absolute bottom-3 left-3 border border-[#44483a] bg-black/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f9282] backdrop-blur-sm">
            drag agents · click core to ignite · ⌘+enter to forge
          </div>
        </div>
        {/* scanline + vignette */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[2px] animate-scanline bg-gradient-to-r from-transparent via-[#9ddf2e]/30 to-transparent" />
      </div>

      {/* RIGHT — build plan stream */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[320px]">
        <div className="border border-[#44483a] bg-[#12140e] p-4">
          <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Build plan</h3>
          {plan ? (
            <>
              <p className="mt-2 text-sm font-semibold leading-5 text-[#e3e3d8]">{plan.headline}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {plan.domains.length ? (
                  plan.domains.map((d) => (
                    <span
                      key={d.key}
                      className="border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#7dd3fc]"
                    >
                      {d.label}
                    </span>
                  ))
                ) : (
                  <span className="font-mono text-[9px] uppercase text-[#8f9282]">generalist build</span>
                )}
                {plan.languages.map((l) => (
                  <span
                    key={l.key}
                    className="border border-[#ffb020]/40 bg-[#ffb020]/5 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#ffb020]"
                  >
                    ⌨ {l.label}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1.5 font-mono text-[9px]">
                <StackChip
                  label="Language"
                  value={plan.stack.language}
                  options={LANGUAGE_NAMES}
                  onChange={(newLangName) => {
                    const newLangId = LANGUAGES.find(l => l.name === newLangName)?.id;
                    if (newLangId) {
                      forge(plan.idea, newLangId);
                    }
                  }}
                />
                <StackChip label="Toolchain" value={plan.stack.toolchain} />
                <StackChip
                  label="Framework"
                  value={plan.stack.framework}
                  options={['Vite React', 'Next.js', 'Tauri V2', 'Spring Boot', 'Jetpack Compose', 'SwiftUI', 'Phoenix LiveView', 'Laravel', 'Rails', 'None']}
                  onChange={(val) => handleUpdateStackValue('framework', val)}
                />
                <StackChip
                  label="Styling"
                  value={plan.stack.styling}
                  options={['Tailwind v4', 'Vanilla CSS', 'CSS Modules', 'Native styling', 'None']}
                  onChange={(val) => handleUpdateStackValue('styling', val)}
                />
                <StackChip
                  label="State"
                  value={plan.stack.database}
                  options={['SpaceTimeDB', 'PostgreSQL', 'SQLite', 'MongoDB', 'Redis', 'None']}
                  onChange={(val) => handleUpdateStackValue('database', val)}
                />
                <StackChip
                  label="AI"
                  value={plan.stack.ai}
                  options={['Claude API (Opus 4.8)', 'Gemini API (1.5 Pro)', 'GPT-4o', 'DeepSeek-V3', 'none']}
                  onChange={(val) => handleUpdateStackValue('ai', val)}
                />
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-[#44483a]/50 pt-2 font-mono text-[9px] uppercase tracking-wider text-[#8f9282]">
                <span>
                  complexity <span className="text-[#9ddf2e]">{plan.totalComplexity}</span>
                </span>
                <span>
                  est <span className="text-[#ffb020]">~{plan.estMinutes}m</span>
                </span>
              </div>
            </>
          ) : (
            <p className="mt-2 font-mono text-[11px] leading-5 text-[#8f9282]">
              Forge an idea to decompose it into a dependency-aware task graph and dispatch it across the swarm.
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border border-[#44483a] bg-[#12140e] p-3 custom-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#8f9282]">
              Task graph {taskView.length ? `· ${taskView.filter((t) => t.status === 'done').length}/${taskView.length}` : ''}
            </h3>
            {plan && (
              <button
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="font-mono text-[9px] uppercase tracking-wider text-[#9ddf2e] hover:text-[#deff9a] cursor-pointer"
              >
                {isAddingTask ? 'Cancel' : '+ Add Task'}
              </button>
            )}
          </div>

          {isAddingTask && (
            <div className="border border-[#9ddf2e]/40 bg-[#0d0f09] p-2.5 mb-3 space-y-2 font-mono text-[9px] relative z-20">
              <div>
                <span className="text-[#8f9282] block mb-1 uppercase tracking-wider text-[7.5px]">Task Title</span>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Audit smart contract"
                  className="w-full border border-[#44483a] bg-[#12140e] p-1.5 text-[10px] text-[#e3e3d8] focus:border-[#9ddf2e] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[#8f9282] block mb-0.5 uppercase tracking-wider text-[7.5px]">Agent Role</span>
                  <select
                    value={newTaskRole}
                    onChange={(e) => setNewTaskRole(e.target.value as AgentRole)}
                    className="w-full border border-[#44483a] bg-[#12140e] p-1 text-[10px] text-[#e3e3d8] outline-none"
                  >
                    {AGENTS.map((a) => (
                      <option key={a.role} value={a.role}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="text-[#8f9282] block mb-0.5 uppercase tracking-wider text-[7.5px]">Phase</span>
                  <select
                    value={newTaskPhase}
                    onChange={(e) => setNewTaskPhase(e.target.value as Phase)}
                    className="w-full border border-[#44483a] bg-[#12140e] p-1 text-[10px] text-[#e3e3d8] outline-none"
                  >
                    <option value="Plan">Plan</option>
                    <option value="Build">Build</option>
                    <option value="Verify">Verify</option>
                    <option value="Ship">Ship</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  <span className="text-[#8f9282] uppercase tracking-wider text-[7.5px]">Complexity:</span>
                  <select
                    value={newTaskComplexity}
                    onChange={(e) => setNewTaskComplexity(Number(e.target.value))}
                    className="border border-[#44483a] bg-[#12140e] p-0.5 text-[9px] text-[#e3e3d8] outline-none"
                  >
                    <option value={1}>1 (simple)</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5 (complex)</option>
                  </select>
                </div>
                <button
                  onClick={handleAddTask}
                  className="border border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e] hover:bg-[#9ddf2e] hover:text-[#0d0f09] px-2 py-1 font-bold uppercase transition cursor-pointer text-[9px]"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {taskView.length === 0 && (
              <div className="border border-dashed border-[#44483a] bg-[#0d0f09] p-3 text-center font-mono text-[10px] uppercase tracking-wider text-[#8f9282]">
                no tasks queued
              </div>
            )}
            {taskView.map(({ task, status, progress }) => {
              const spec = AGENT_BY_ROLE[task.role];
              const tint = PHASE_TINT[task.phase];
              
              if (editingTaskId === task.id) {
                return (
                  <div
                    key={task.id}
                    className="border border-[#9ddf2e]/60 bg-[#0d0f09] p-2.5 space-y-2 font-mono text-[9px]"
                  >
                    <div>
                      <span className="text-[#8f9282] block mb-0.5">Title</span>
                      <input
                        type="text"
                        value={editTaskTitle}
                        onChange={(e) => setEditTaskTitle(e.target.value)}
                        className="w-full border border-[#44483a] bg-[#12140e] p-1 text-[10px] text-[#e3e3d8] focus:border-[#9ddf2e] outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <div>
                        <span className="text-[#8f9282] block mb-0.5">Role</span>
                        <select
                          value={editTaskRole}
                          onChange={(e) => setEditTaskRole(e.target.value as AgentRole)}
                          className="w-full border border-[#44483a] bg-[#12140e] p-0.5 text-[9px] text-[#e3e3d8] outline-none"
                        >
                          {AGENTS.map((a) => (
                            <option key={a.role} value={a.role}>
                              {a.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-[#8f9282] block mb-0.5">Phase</span>
                        <select
                          value={editTaskPhase}
                          onChange={(e) => setEditTaskPhase(e.target.value as Phase)}
                          className="w-full border border-[#44483a] bg-[#12140e] p-0.5 text-[9px] text-[#e3e3d8] outline-none"
                        >
                          <option value="Plan">Plan</option>
                          <option value="Build">Build</option>
                          <option value="Verify">Verify</option>
                          <option value="Ship">Ship</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[#8f9282]">Complexity:</span>
                        <select
                          value={editTaskComplexity}
                          onChange={(e) => setEditTaskComplexity(Number(e.target.value))}
                          className="ml-1 border border-[#44483a] bg-[#12140e] p-0.5 text-[9px] text-[#e3e3d8] outline-none"
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                          <option value={5}>5</option>
                        </select>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="border border-[#44483a] bg-[#1b1c16] text-[#c5c8b6] px-1.5 py-0.5 hover:text-[#fb7185] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className="border border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e] hover:bg-[#9ddf2e] hover:text-[#0d0f09] px-1.5 py-0.5 cursor-pointer font-bold"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={task.id}
                  className={`border bg-[#1b1c16] p-2 transition group/task relative ${
                    status === 'active'
                      ? 'border-[#9ddf2e]/60'
                      : status === 'done'
                        ? 'border-[#44483a]/40 opacity-60'
                        : 'border-[#44483a]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-semibold leading-4 text-[#e3e3d8]">{task.title}</span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleStartEdit(task)}
                        className="opacity-0 group-hover/task:opacity-100 text-[#8f9282] hover:text-[#7dd3fc] font-mono text-[8px] uppercase px-1 transition duration-150 cursor-pointer"
                        title="Edit task"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="opacity-0 group-hover/task:opacity-100 text-[#8f9282] hover:text-[#fb7185] font-mono text-[10px] px-1 transition duration-150 cursor-pointer"
                        title="Delete task"
                      >
                        ×
                      </button>
                      <span
                        className="shrink-0 border px-1 py-0.5 font-mono text-[8px] uppercase tracking-wider"
                        style={{ color: tint, borderColor: `${tint}55` }}
                      >
                        {task.phase}
                      </span>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between font-mono text-[8.5px] uppercase tracking-wider">
                    <span className="flex items-center gap-1" style={{ color: spec.color }}>
                      {spec.glyph} {spec.name}
                    </span>
                    <span className="text-[#8f9282]">
                      {status === 'done' ? '✓ done' : status === 'active' ? `${Math.round(progress * 100)}%` : 'queued'}
                    </span>
                  </div>
                  <div className="mt-1 h-0.5 bg-[#0d0f09]">
                    <div
                      className="h-full transition-[width] duration-150"
                      style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: tint }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {plan && plan.riskNotes.length > 0 && (
            <div className="mt-3 border border-[#ffb020]/30 bg-[#ffb020]/5 p-2.5">
              <div className="font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-[#ffb020]">Risk read</div>
              <ul className="mt-1 space-y-1">
                {plan.riskNotes.map((n, i) => (
                  <li key={i} className="font-mono text-[9.5px] leading-4 text-[#c5c8b6]">
                    → {n}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ---- small presentational helpers ----
const Metric: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  unit: string;
  tone: string;
}> = ({ icon: Icon, label, value, unit, tone }) => (
  <div className="border border-[#44483a] bg-[#12140e] p-2.5">
    <div className="flex items-center justify-between">
      <span className="font-mono text-[8.5px] uppercase tracking-[0.14em] text-[#8f9282]">{label}</span>
      <Icon className="h-3 w-3" />
    </div>
    <div className="mt-1 font-mono text-[20px] font-bold leading-none" style={{ color: tone }}>
      {value}
    </div>
    <div className="mt-0.5 font-mono text-[8px] uppercase tracking-wider text-[#8f9282]">{unit}</div>
  </div>
);

const StackChip: React.FC<{
  label: string;
  value: string;
  options?: string[];
  onChange?: (val: string) => void;
}> = ({ label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative border border-[#44483a] bg-[#0d0f09] px-2 py-1 group">
      <div className="text-[8px] uppercase tracking-wider text-[#8f9282]">{label}</div>
      {options && onChange ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-left truncate text-[10px] font-bold text-[#9ddf2e] hover:text-[#deff9a] flex items-center justify-between cursor-pointer focus:outline-none"
          >
            <span className="truncate">{value}</span>
            <span className="text-[7px] text-[#8f9282] ml-1 shrink-0">▼</span>
          </button>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
              <div className="absolute left-0 right-0 mt-1 bg-[#12140e] border border-[#9ddf2e]/40 z-50 max-h-48 overflow-y-auto custom-scrollbar font-mono text-[9px] shadow-lg shadow-black">
                {options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-2 py-1 hover:bg-[#9ddf2e]/10 hover:text-[#9ddf2e] block truncate cursor-pointer ${
                      opt === value ? 'text-[#9ddf2e] bg-[#9ddf2e]/5 font-bold' : 'text-[#c5c8b6]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="truncate text-[10px] font-bold text-[#9ddf2e]">{value}</div>
      )}
    </div>
  );
};

function drawCore(ctx: CanvasRenderingContext2D, sim: Sim) {
  const { x, y, pulse, charge } = sim.core;
  const t = sim.clock;
  const baseR = 26 + pulse * 10;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // outer glow
  const glow = ctx.createRadialGradient(x, y, 0, x, y, baseR * 3.4);
  glow.addColorStop(0, `rgba(157,223,46,${0.25 + charge * 0.25})`);
  glow.addColorStop(0.5, 'rgba(157,223,46,0.06)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, baseR * 3.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // rotating rings
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = `rgba(157,223,46,${0.5 + charge * 0.3})`;
  ctx.lineWidth = 1.4;
  ctx.rotate(t * 0.4);
  ctx.beginPath();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r1 = baseR + 8;
    const r2 = baseR + 14;
    ctx.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
    ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
  }
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-t * 0.25);
  ctx.strokeStyle = 'rgba(125,211,252,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, baseR + 20, 0, Math.PI * 1.5);
  ctx.stroke();
  ctx.restore();

  // core body
  const body = ctx.createRadialGradient(x, y - baseR * 0.3, baseR * 0.2, x, y, baseR);
  body.addColorStop(0, '#eaffc0');
  body.addColorStop(0.5, '#9ddf2e');
  body.addColorStop(1, '#3c5a08');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, baseR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(234,255,192,0.9)';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // glyph
  ctx.fillStyle = '#0d0f09';
  ctx.font = `bold ${Math.round(baseR * 0.8)}px "JetBrains Mono", monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('◬', x, y + 1);
}

function drawAgent(ctx: CanvasRenderingContext2D, ag: SimAgent) {
  const { x, y, spec, load, pulse, tasksDone } = ag;
  const r = 17;

  // glow when busy
  if (load > 0.12 || pulse > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
    g.addColorStop(0, hexA(spec.color, 0.3 + pulse * 0.4));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // load ring
  ctx.strokeStyle = 'rgba(143,146,130,0.25)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = spec.color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, r + 6, -Math.PI / 2, -Math.PI / 2 + load * Math.PI * 2);
  ctx.stroke();

  // node
  ctx.fillStyle = '#12140e';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = spec.color;
  ctx.lineWidth = 1.4 + pulse;
  ctx.stroke();

  // glyph
  ctx.fillStyle = spec.color;
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(spec.glyph, x, y + 1);

  // name label
  ctx.fillStyle = '#c5c8b6';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillText(spec.name, x, y + r + 16);

  // tasksDone pips
  const pips = Math.min(tasksDone, 6);
  for (let i = 0; i < pips; i++) {
    ctx.fillStyle = spec.color;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(x - (pips - 1) * 3 + i * 6, y + r + 24, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function hexA(hex: string, a: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
