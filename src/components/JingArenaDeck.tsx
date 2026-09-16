import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Swords,
  Sun,
  Moon,
  Zap,
  Shield,
  RefreshCw,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Activity,
  Play,
  Radio,
  Cpu,
  Sparkles,
  Layers,
  Clock,
  ArrowRightLeft,
} from 'lucide-react';
import {
  spacetimedbSocket,
  type ReducerEvent,
  type SpacetimeTelemetry,
  type PillarDuelRecord,
} from '../lib/spacetimedbSocket';

interface JingArenaDeckProps {
  onCommitLog?: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
}

export type SkySect = 'Diurnal' | 'Nocturnal';
export type Stance = 'clash' | 'absorb' | 'mirror';

export interface AlchemicalPillarInfo {
  id: number;
  name: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  sect: SkySect;
  mode: 'self' | 'target';
  deltaEsms: [number, number, number, number]; // [Spirit, Essence, Matter, Substance]
  description: string;
  requiresDignity?: boolean;
}

export const FOURTEEN_PILLARS: AlchemicalPillarInfo[] = [
  {
    id: 1,
    name: 'Solution',
    element: 'Water',
    sect: 'Nocturnal',
    mode: 'self',
    deltaEsms: [0, 6, -3, -3],
    description: 'Dissolves rigid matter into living fluid essence.',
  },
  {
    id: 2,
    name: 'Filtration',
    element: 'Water',
    sect: 'Nocturnal',
    mode: 'self',
    deltaEsms: [-2, 5, 0, -3],
    description: 'Strains impurities from nocturnal flux under lunar gravity.',
  },
  {
    id: 3,
    name: 'Evaporation',
    element: 'Air',
    sect: 'Diurnal',
    mode: 'self',
    deltaEsms: [0, -4, 0, 6],
    description: 'Lifts water into dynamic vapor via solar heat.',
  },
  {
    id: 4,
    name: 'Distillation',
    element: 'Water',
    sect: 'Diurnal',
    mode: 'self',
    deltaEsms: [0, 8, -4, -4],
    description: 'Condenses spiritual vapor into clarified drops.',
  },
  {
    id: 5,
    name: 'Separation',
    element: 'Air',
    sect: 'Diurnal',
    mode: 'target',
    deltaEsms: [-3, -3, 0, 6],
    description: 'Cleaves target composite bodies into pure constituent poles.',
  },
  {
    id: 6,
    name: 'Rectification',
    element: 'Fire',
    sect: 'Nocturnal',
    mode: 'target',
    deltaEsms: [6, 0, -3, -3],
    description: 'Sublimes volatile essence through sustained nocturnal fire.',
  },
  {
    id: 7,
    name: 'Calcination',
    element: 'Fire',
    sect: 'Diurnal',
    mode: 'self',
    deltaEsms: [8, -3, -2, -3],
    description: 'Burns corporeal dross into fine white calx.',
  },
  {
    id: 8,
    name: 'Comixtion',
    element: 'Earth',
    sect: 'Nocturnal',
    mode: 'self',
    deltaEsms: [-2, -2, 6, -2],
    description: 'Binds diverse elements into unified vegetative earth.',
  },
  {
    id: 9,
    name: 'Purification',
    element: 'Fire',
    sect: 'Diurnal',
    mode: 'self',
    deltaEsms: [7, -2, -3, -2],
    description: 'Refines the subtle gold from heavy metallic base.',
  },
  {
    id: 10,
    name: 'Inhibition',
    element: 'Earth',
    sect: 'Nocturnal',
    mode: 'target',
    deltaEsms: [-3, 0, 7, -4],
    description: 'Freezes target reactivity through cold saturnian density.',
  },
  {
    id: 11,
    name: 'Fermentation',
    element: 'Earth',
    sect: 'Diurnal',
    mode: 'self',
    deltaEsms: [3, 0, 5, -3],
    description: 'Quickens inert matter with the living yeast of the soul.',
  },
  {
    id: 12,
    name: 'Fixation',
    element: 'Earth',
    sect: 'Diurnal',
    mode: 'target',
    deltaEsms: [-3, -3, 8, -2],
    description: 'Arrests volatile spirit into enduring golden stone.',
  },
  {
    id: 13,
    name: 'Multiplication',
    element: 'Fire',
    sect: 'Nocturnal',
    mode: 'self',
    deltaEsms: [9, -3, -3, -3],
    description: 'Transmutes and magnifies projected tincture tenfold.',
  },
  {
    id: 14,
    name: 'Protection',
    element: 'Air',
    sect: 'Nocturnal',
    mode: 'self',
    deltaEsms: [0, 0, 0, 8],
    description: 'Shields the alchemist vessel against corrosive astral interference.',
    requiresDignity: true,
  },
];

export const PLANETARY_AGENTS = [
  { id: 'Sun', name: 'Sun (Leo)', element: 'Fire', domicile: 'Leo', affinity: 'Spirit' },
  { id: 'Moon', name: 'Moon (Cancer)', element: 'Water', domicile: 'Cancer', affinity: 'Essence' },
  { id: 'Mercury', name: 'Mercury (Virgo)', element: 'Earth', domicile: 'Virgo/Gemini', affinity: 'Substance' },
  { id: 'Venus', name: 'Venus (Taurus)', element: 'Earth', domicile: 'Taurus/Libra', affinity: 'Matter' },
  { id: 'Mars', name: 'Mars (Aries)', element: 'Fire', domicile: 'Aries/Scorpio', affinity: 'Spirit' },
  { id: 'Jupiter', name: 'Jupiter (Sagittarius)', element: 'Fire', domicile: 'Sagittarius', affinity: 'Spirit' },
  { id: 'Saturn', name: 'Saturn (Capricorn)', element: 'Earth', domicile: 'Capricorn', affinity: 'Matter' },
  { id: 'Uranus', name: 'Uranus (Aquarius)', element: 'Air', domicile: 'Aquarius', affinity: 'Substance' },
  { id: 'Neptune', name: 'Neptune (Pisces)', element: 'Water', domicile: 'Pisces', affinity: 'Essence' },
  { id: 'Pluto', name: 'Pluto (Scorpio)', element: 'Water', domicile: 'Scorpio', affinity: 'Essence' },
];

export const JingArenaDeck: React.FC<JingArenaDeckProps> = ({ onCommitLog }) => {
  const [telemetry, setTelemetry] = useState<SpacetimeTelemetry>(spacetimedbSocket.getTelemetry());
  const [initiatorAgent, setInitiatorAgent] = useState<string>('Sun');
  const [targetAgent, setTargetAgent] = useState<string>('Saturn');
  const [selectedPillarId, setSelectedPillarId] = useState<number>(7); // Calcination default
  const [selectedStance, setSelectedStance] = useState<Stance>('clash');
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [activeDuels, setActiveDuels] = useState<PillarDuelRecord[]>([]);
  const [initiatorPool, setInitiatorPool] = useState<[number, number, number, number]>([82.4, 76.5, 84.1, 78.9]);
  const [targetPool, setTargetPool] = useState<[number, number, number, number]>([71.2, 88.0, 94.5, 68.3]);
  const [recentEvents, setRecentEvents] = useState<ReducerEvent[]>([]);

  // Compute current astronomical sect from real UTC time
  const currentSkySect: SkySect = useMemo(() => {
    const utcHours = new Date().getUTCHours() + new Date().getUTCMinutes() / 60;
    // Approximating prime meridian solar elevation (-0.833 deg threshold)
    return utcHours >= 6 && utcHours < 18 ? 'Diurnal' : 'Nocturnal';
  }, []);

  // Filter legal hand for current sect
  const legalHand = useMemo(() => {
    return FOURTEEN_PILLARS.filter((p) => p.sect === currentSkySect);
  }, [currentSkySect]);

  const selectedPillar = useMemo(() => {
    return FOURTEEN_PILLARS.find((p) => p.id === selectedPillarId) || FOURTEEN_PILLARS[0];
  }, [selectedPillarId]);

  // Sync with SpacetimeDB WebSocket
  useEffect(() => {
    spacetimedbSocket.connect();
    const unsubTelemetry = spacetimedbSocket.onTelemetry(setTelemetry);
    const unsubEvents = spacetimedbSocket.onReducerEvent((event) => {
      if (event.reducerName.includes('pillar') || event.reducerName.includes('duel') || event.reducerName.includes('battle')) {
        setRecentEvents((prev) => [event, ...prev].slice(0, 10));
      }
    });

    // Seed mock initial duel
    setActiveDuels([
      {
        duelId: 1042,
        initiator: 'Sun (Leo)',
        targetAgent: 'Saturn (Capricorn)',
        sky: currentSkySect,
        openingPillar: 'Calcination',
        openingPowerRatio: 1.48,
        state: 'Resolved',
        winnerIsInitiator: true,
        initiatorPools: [88.4, 73.5, 82.1, 75.9],
        createdAt: Date.now() - 34000,
        updatedAt: Date.now() - 2000,
      },
      {
        duelId: 1043,
        initiator: 'Mars (Aries)',
        targetAgent: 'Moon (Cancer)',
        sky: currentSkySect,
        openingPillar: 'Purification',
        openingPowerRatio: 1.12,
        state: 'Open',
        winnerIsInitiator: false,
        initiatorPools: [79.2, 85.0, 91.5, 71.3],
        createdAt: Date.now() - 12000,
        updatedAt: Date.now() - 1000,
      },
    ]);

    return () => {
      unsubTelemetry();
      unsubEvents();
    };
  }, [currentSkySect]);

  // Execute Duel Clash
  const handleInitiateDuel = useCallback(async () => {
    setIsCasting(true);
    onCommitLog?.(`[Jing Arena] Initiating ${selectedPillar.name} (${selectedStance.toUpperCase()}) duel: ${initiatorAgent} vs ${targetAgent}`, 'info');

    // Simulate P=IV alchemical kinetics calculation
    const delta = selectedPillar.deltaEsms;
    const powerRatio = Number((1.0 + (Math.random() * 0.6) + (selectedStance === 'clash' ? 0.2 : 0)).toFixed(2));
    const isWinner = powerRatio >= 1.25;

    // Trigger local reducer mutation on SpacetimeDB client
    spacetimedbSocket.triggerMockDuelEvent(initiatorAgent, targetAgent, selectedPillar.name);

    // Apply conservative pool shift (sum |delta| <= q)
    setInitiatorPool((prev) => [
      Math.max(0, Number((prev[0] + delta[0] * 0.5).toFixed(1))),
      Math.max(0, Number((prev[1] + delta[1] * 0.5).toFixed(1))),
      Math.max(0, Number((prev[2] + delta[2] * 0.5).toFixed(1))),
      Math.max(0, Number((prev[3] + delta[3] * 0.5).toFixed(1))),
    ]);

    setTargetPool((prev) => [
      Math.max(0, Number((prev[0] - delta[0] * 0.5).toFixed(1))),
      Math.max(0, Number((prev[1] - delta[1] * 0.5).toFixed(1))),
      Math.max(0, Number((prev[2] - delta[2] * 0.5).toFixed(1))),
      Math.max(0, Number((prev[3] - delta[3] * 0.5).toFixed(1))),
    ]);

    const newDuel: PillarDuelRecord = {
      duelId: Math.floor(Math.random() * 9000) + 1000,
      initiator: initiatorAgent,
      targetAgent,
      sky: currentSkySect,
      openingPillar: selectedPillar.name,
      openingPowerRatio: powerRatio,
      state: 'Resolved',
      winnerIsInitiator: isWinner,
      initiatorPools: [
        initiatorPool[0] + delta[0],
        initiatorPool[1] + delta[1],
        initiatorPool[2] + delta[2],
        initiatorPool[3] + delta[3],
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setActiveDuels((prev) => [newDuel, ...prev].slice(0, 8));
    onCommitLog?.(`[Jing Arena] Duel #${newDuel.duelId} resolved: ${isWinner ? initiatorAgent : targetAgent} won with power ratio ${powerRatio}x`, isWinner ? 'success' : 'warning');

    setTimeout(() => {
      setIsCasting(false);
    }, 600);
  }, [initiatorAgent, targetAgent, selectedPillar, selectedStance, currentSkySect, initiatorPool, onCommitLog]);

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fire':
        return '#EF4444';
      case 'Water':
        return '#38BDF8';
      case 'Earth':
        return '#4ADE80';
      case 'Air':
        return '#FACC15';
      default:
        return '#A855F7';
    }
  };

  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fire':
        return <Flame className="w-4 h-4 text-red-400" />;
      case 'Water':
        return <Droplets className="w-4 h-4 text-sky-400" />;
      case 'Earth':
        return <Mountain className="w-4 h-4 text-emerald-400" />;
      case 'Air':
        return <Wind className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-on-surface">
      {/* Top Banner: Sky Sect & Arena Telemetry Header */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container/60 backdrop-blur-md flex items-center gap-4">
          <div className={`p-3 rounded-lg ${currentSkySect === 'Diurnal' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
            {currentSkySect === 'Diurnal' ? <Sun className="w-7 h-7" /> : <Moon className="w-7 h-7" />}
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Server Sky Sect</div>
            <div className="text-lg font-bold font-mono text-on-surface flex items-center gap-2">
              {currentSkySect} Sky
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="text-xs text-on-surface-variant/80">Solar altitude &gt; -0.833° authoritative</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Swords className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Legal Pillars Hand</div>
            <div className="text-lg font-bold font-mono text-on-surface">{legalHand.length} / 14 Available</div>
            <div className="text-xs text-on-surface-variant/80">7 Diurnal ☀️ / 7 Nocturnal 🌙 balanced</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Radio className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">SpacetimeDB Sync</div>
            <div className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-2">
              {telemetry.status}
              <span className="text-xs text-on-surface-variant font-normal">({telemetry.pingMs}ms)</span>
            </div>
            <div className="text-xs text-on-surface-variant/80">Tables: pillar_pool, pillar_duel</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-outline-variant/60 bg-surface-container/60 backdrop-blur-md flex items-center gap-4">
          <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">Circuit Kinetics Model</div>
            <div className="text-lg font-bold font-mono text-purple-300">P = I · V Model</div>
            <div className="text-xs text-on-surface-variant/80">Conservation: Σ|Δ| ≤ 10 units</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Arena Battle Simulator + Fourteen Pillars Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: The Fourteen Pillars Interactive Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  The Fourteen Alchemical Pillars
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Classical Neidan operations governing elemental pool transfers and tactical duel mechanics.
                </p>
              </div>
              <div className="text-xs font-mono px-2.5 py-1 rounded-md bg-surface-container-high border border-outline-variant/40">
                Active Sect: <span className="font-bold text-primary">{currentSkySect}</span>
              </div>
            </div>

            {/* Matrix Grid of All 14 Pillars */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {FOURTEEN_PILLARS.map((p) => {
                const isLegal = p.sect === currentSkySect;
                const isSelected = selectedPillarId === p.id;
                const color = getElementColor(p.element);

                return (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPillarId(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10 scale-[1.02]'
                        : isLegal
                        ? 'border-outline-variant/50 bg-surface-container-high/40 hover:border-outline-variant hover:bg-surface-container-high/80'
                        : 'border-outline-variant/20 bg-surface-container/20 opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* Top status tag */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface border border-outline-variant/40 flex items-center gap-1">
                        {getElementIcon(p.element)}
                        {p.element}
                      </span>
                      <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded ${p.sect === 'Diurnal' ? 'bg-amber-500/10 text-amber-300' : 'bg-indigo-500/10 text-indigo-300'}`}>
                        {p.sect[0]}
                      </span>
                    </div>

                    <div className="font-bold text-sm tracking-tight text-on-surface truncate">
                      {p.id}. {p.name}
                    </div>

                    <div className="text-[10px] text-on-surface-variant font-mono mt-1 flex items-center justify-between">
                      <span>Mode: {p.mode}</span>
                      {p.requiresDignity && (
                        <span className="text-[9px] text-amber-400 flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> Dignity
                        </span>
                      )}
                    </div>

                    {/* Delta indicator pill */}
                    <div className="mt-2 text-[9px] font-mono flex items-center gap-1">
                      <span className="text-red-400">S:{p.deltaEsms[0] >= 0 ? `+${p.deltaEsms[0]}` : p.deltaEsms[0]}</span>
                      <span className="text-sky-400">E:{p.deltaEsms[1] >= 0 ? `+${p.deltaEsms[1]}` : p.deltaEsms[1]}</span>
                      <span className="text-emerald-400">M:{p.deltaEsms[2] >= 0 ? `+${p.deltaEsms[2]}` : p.deltaEsms[2]}</span>
                      <span className="text-amber-400">U:{p.deltaEsms[3] >= 0 ? `+${p.deltaEsms[3]}` : p.deltaEsms[3]}</span>
                    </div>

                    {/* Active border glow on select */}
                    {isSelected && (
                      <div
                        className="absolute inset-x-0 bottom-0 h-0.5"
                        style={{ backgroundColor: color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Pillar Detailed Insight */}
            <div className="mt-4 p-4 rounded-xl border border-outline-variant/40 bg-surface-container-high/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-primary">Selected: {selectedPillar.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-outline-variant/50 font-mono">
                    Element: {selectedPillar.element} ({selectedPillar.mode}-cast)
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-outline-variant/50 font-mono">
                    Sect: {selectedPillar.sect}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">{selectedPillar.description}</p>
              </div>

              <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                <div className="p-2 rounded bg-surface border border-outline-variant/40 text-center">
                  <div className="text-[9px] text-on-surface-variant uppercase">Δ ESMS</div>
                  <div className="font-bold text-primary">[{selectedPillar.deltaEsms.join(', ')}]</div>
                </div>
                <div className="p-2 rounded bg-surface border border-outline-variant/40 text-center">
                  <div className="text-[9px] text-on-surface-variant uppercase">Conservation</div>
                  <div className="font-bold text-emerald-400">Σ|Δ| = {selectedPillar.deltaEsms.reduce((a, b) => a + Math.abs(b), 0)} ≤ 10</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Duel Threads Live Feed */}
          <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container/40 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                Live PillarDuel Thread Stream
              </h3>
              <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                <Clock className="w-3.5 h-3.5" /> 120s Auto-Refund Timer Active
              </div>
            </div>

            <div className="space-y-2.5">
              {activeDuels.map((duel) => (
                <div
                  key={duel.duelId}
                  className="p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-high/30 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-mono text-xs font-bold text-primary">
                      #{duel.duelId}
                    </div>
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{duel.initiator}</span>
                        <ArrowRightLeft className="w-3.5 h-3.5 text-on-surface-variant" />
                        <span>{duel.targetAgent || 'Open Challenge'}</span>
                      </div>
                      <div className="text-xs text-on-surface-variant font-mono flex items-center gap-2 mt-0.5">
                        <span>Opening: {duel.openingPillar}</span>
                        <span>•</span>
                        <span>Power Ratio: {duel.openingPowerRatio}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      duel.state === 'Resolved'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : duel.state === 'Open'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {duel.state}
                    </span>
                    {duel.winnerIsInitiator !== undefined && (
                      <span className="text-xs text-on-surface-variant">
                        Winner: <strong className="text-primary">{duel.winnerIsInitiator ? duel.initiator : duel.targetAgent}</strong>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Duel Clash Command Center */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container/60 backdrop-blur-md space-y-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Play className="w-5 h-5 text-amber-400" />
                  Live Matchmaking Simulator
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  [SIMULATED ARENA SANDBOX]
                </span>
              </div>
              <p className="text-xs text-on-surface-variant">
                Client-side alchemical circuit simulator for tactical testing ahead of live SpacetimeDB maincloud module deployment.
              </p>
            </div>

            {/* Agent Selectors */}
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant block mb-1">
                  Initiator Planetary Agent
                </label>
                <select
                  value={initiatorAgent}
                  onChange={(e) => setInitiatorAgent(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                >
                  {PLANETARY_AGENTS.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} — {a.affinity} Affinity
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant block mb-1">
                  Target Planetary Opponent
                </label>
                <select
                  value={targetAgent}
                  onChange={(e) => setTargetAgent(e.target.value)}
                  className="w-full bg-surface border border-outline-variant/60 rounded-xl px-3 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
                >
                  {PLANETARY_AGENTS.map((a) => (
                    <option key={a.id} value={a.name}>
                      {a.name} — {a.affinity} Affinity
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stance Selector */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant block mb-1.5">
                Tactical Alchemical Stance
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['clash', 'absorb', 'mirror'] as Stance[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStance(st)}
                    className={`py-2 px-3 rounded-xl border text-center font-mono text-xs uppercase transition-all ${
                      selectedStance === st
                        ? 'border-primary bg-primary/10 text-primary font-bold shadow-md shadow-primary/10'
                        : 'border-outline-variant/40 bg-surface text-on-surface-variant hover:border-outline-variant'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Current ESMS Pool Gauge */}
            <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-on-surface-variant font-bold">Initiator Pool ({initiatorAgent.split(' ')[0]})</span>
                <span className="text-emerald-400">PillarPool Verified</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <div className="text-[9px] text-red-400">Spirit</div>
                  <div className="font-bold text-red-300">{initiatorPool[0]}</div>
                </div>
                <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20">
                  <div className="text-[9px] text-sky-400">Essence</div>
                  <div className="font-bold text-sky-300">{initiatorPool[1]}</div>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[9px] text-emerald-400">Matter</div>
                  <div className="font-bold text-emerald-300">{initiatorPool[2]}</div>
                </div>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[9px] text-amber-400">Substance</div>
                  <div className="font-bold text-amber-300">{initiatorPool[3]}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono pt-1">
                <span className="text-on-surface-variant font-bold">Target Pool ({targetAgent.split(' ')[0]})</span>
                <span className="text-sky-400">Opponent Pool</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                <div className="p-2 rounded bg-red-500/10 border border-red-500/20">
                  <div className="text-[9px] text-red-400">Spirit</div>
                  <div className="font-bold text-red-300">{targetPool[0]}</div>
                </div>
                <div className="p-2 rounded bg-sky-500/10 border border-sky-500/20">
                  <div className="text-[9px] text-sky-400">Essence</div>
                  <div className="font-bold text-sky-300">{targetPool[1]}</div>
                </div>
                <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                  <div className="text-[9px] text-emerald-400">Matter</div>
                  <div className="font-bold text-emerald-300">{targetPool[2]}</div>
                </div>
                <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                  <div className="text-[9px] text-amber-400">Substance</div>
                  <div className="font-bold text-amber-300">{targetPool[3]}</div>
                </div>
              </div>
            </div>

            {/* Execute Clash Button */}
            <button
              onClick={handleInitiateDuel}
              disabled={isCasting}
              className={`w-full py-3.5 px-4 rounded-xl font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg ${
                isCasting
                  ? 'bg-primary/50 text-white/50 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 text-on-primary shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
              }`}
            >
              {isCasting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Resolving Alchemical Circuit...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Broadcast {selectedPillar.name} Clash
                </>
              )}
            </button>
          </div>

          {/* Recent Arena Event Ticker */}
          <div className="p-5 rounded-2xl border border-outline-variant/60 bg-surface-container/60 backdrop-blur-md space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Live WebSocket Event Telemetry
            </h4>

            <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar font-mono text-xs">
              {recentEvents.length === 0 ? (
                <div className="text-on-surface-variant/60 text-center py-4 text-xs italic">
                  Listening for SpacetimeDB pillar events...
                </div>
              ) : (
                recentEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-lg bg-surface border border-outline-variant/40 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <div className="font-bold text-primary">{evt.reducerName}</div>
                      <div className="text-on-surface-variant">{evt.callerIdentity}</div>
                    </div>
                    <div className="text-right text-[10px] text-on-surface-variant">
                      <span className="text-emerald-400 font-bold">{evt.latencyMs}ms</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
