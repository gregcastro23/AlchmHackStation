import React, { useState, useEffect } from "react";
import {
  ConsensusGaugeViewModel,
  buildGaugeViewModel,
  CANONICAL_REFERENCE_CHART,
  ChartInput,
  adaptKitchenChartToMath,
} from "@/lib/astrologyMath";
import { calculateEphemerisPositions, calculateAscendant } from "@/lib/ephemeris";
import { AlchemicalTemperamentGauge } from "./AlchemicalTemperamentGauge";
import { EcosystemStatusBar, AstrologicalFrame, HouseSystem } from "./EcosystemStatusBar";
import { EcosystemDiscoveryDeck } from "./EcosystemDiscoveryDeck";
import { BirthDataModal } from "./BirthDataModal";
import {
  Sparkles,
  Coins,
  Bot,
  Utensils,
  Gamepad2,
  CheckCircle2,
  ExternalLink,
  Shield,
  RotateCcw,
} from "lucide-react";

export function ConsensusDashboard() {
  const [activeFrame, setActiveFrame] = useState<AstrologicalFrame>("natal");
  const [houseSystem, setHouseSystem] = useState<HouseSystem>("Placidus");
  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);

  // User state (cached in localStorage for persistent client-side attunement)
  const [customChart, setCustomChart] = useState<ChartInput | null>(null);
  const [birthData, setBirthData] = useState<any>(null);

  useEffect(() => {
    try {
      const savedChart = localStorage.getItem("alchm_consensus_chart");
      const savedData = localStorage.getItem("alchm_consensus_birthdata");
      if (savedChart) setCustomChart(JSON.parse(savedChart));
      if (savedData) setBirthData(JSON.parse(savedData));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleSaveCustomChart = (chart: ChartInput, bData: any) => {
    setCustomChart(chart);
    setBirthData(bData);
    setActiveFrame("natal");
    try {
      localStorage.setItem("alchm_consensus_chart", JSON.stringify(chart));
      localStorage.setItem("alchm_consensus_birthdata", JSON.stringify(bData));
    } catch {
      // Ignore storage errors
    }
  };

  const handleResetToSample = () => {
    setCustomChart(null);
    setBirthData(null);
    setActiveFrame("natal");
    try {
      localStorage.removeItem("alchm_consensus_chart");
      localStorage.removeItem("alchm_consensus_birthdata");
    } catch {
      // Ignore storage errors
    }
  };

  // Determine active chart based on active frame
  let currentChartInput: ChartInput = CANONICAL_REFERENCE_CHART;
  let isFixture = customChart === null;

  if (activeFrame === "mundane" || activeFrame === "transit") {
    const now = new Date();
    currentChartInput = {
      asc: calculateAscendant(now, birthData?.latitude ?? 40.7128, birthData?.longitude ?? -74.006),
      positions: calculateEphemerisPositions(now),
    };
    isFixture = false;
  } else if (customChart) {
    currentChartInput = customChart;
    isFixture = false;
  }

  // Adapt chart with active house system
  const adapted = adaptKitchenChartToMath(currentChartInput, { houseSystem });
  const gaugeViewModel: ConsensusGaugeViewModel = buildGaugeViewModel(
    adapted.chart,
    isFixture
  );

  const lat = birthData?.latitude ?? 40.7128;
  const lon = birthData?.longitude ?? -74.006;

  return (
    <div
      data-consensus="true"
      className="w-full max-w-[1440px] mx-auto px-4 py-6 space-y-6 font-sans text-[var(--ac-text)]"
    >
      {/* Top Status & Telemetry Bar */}
      <EcosystemStatusBar
        activeFrame={activeFrame}
        onFrameChange={setActiveFrame}
        houseSystem={houseSystem}
        onHouseSystemChange={setHouseSystem}
        onOpenBirthModal={() => setIsBirthModalOpen(true)}
        latitude={lat}
        longitude={lon}
        kitchenConnected={true}
        agentsConnected={false}
        pentaclesConnected={false}
      />

      {/* Cloudflare Edge Micro-Frontend Notice */}
      <div className="ac-glass-panel px-4 py-3 border-[rgba(216,180,106,0.3)] bg-[rgba(216,180,106,0.06)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[var(--ac-gold-bright)] animate-pulse" />
          <span>
            <strong className="text-[var(--ac-gold-bright)] font-semibold">Alchm Consensus Hub</strong> — Independent Cloudflare Edge Micro-Frontend.
          </span>
          <span className="hidden md:inline-block text-[var(--ac-dim)] font-mono text-[11px]">
            (Decoupled from kitchen & agents repo deploy cycles)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono">
          {customChart ? (
            <button
              type="button"
              onClick={handleResetToSample}
              className="flex items-center gap-1 text-[var(--ac-dim)] hover:text-white transition-colors cursor-pointer"
              title="Reset to canonical reference sample"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sample</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsBirthModalOpen(true)}
              className="px-2.5 py-1 rounded bg-[var(--ac-gold-deep)] hover:bg-[var(--ac-gold)] text-[var(--ac-gold-bright)] hover:text-black transition-colors font-medium cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Attune Birth Data</span>
            </button>
          )}
        </div>
      </div>

      {/* 3-Column Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols / ~42%): Alchemical Temperament Hero Gauge */}
        <div className="lg:col-span-5 space-y-6">
          <AlchemicalTemperamentGauge
            viewModel={gaugeViewModel}
            onOpenBirthModal={() => setIsBirthModalOpen(true)}
          />
        </div>

        {/* Middle Column (4 cols / ~33%): Core Identity, Tokens & Agentic Council */}
        <div className="lg:col-span-4 space-y-6">
          {/* Identity Card */}
          <div className="ac-glass-panel p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[rgba(216,180,106,0.15)] border border-[rgba(216,180,106,0.3)] flex items-center justify-center text-lg font-serif text-[var(--ac-gold-bright)]">
                  A
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--ac-text)] flex items-center gap-1.5">
                    <span>Alchemist Explorer</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[rgba(216,180,106,0.2)] text-[var(--ac-gold-bright)] border border-[rgba(216,180,106,0.4)] font-mono uppercase">
                      Consensus
                    </span>
                  </h3>
                  <div className="text-xs text-[var(--ac-dim)] font-mono">
                    @edge-initiate · Edge Node
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-mono text-[var(--ac-dim)]">
                  K_alchm
                </div>
                <div className="text-xs font-mono font-bold text-[var(--ac-gold-bright)]">
                  1.618
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--ac-line)] text-xs text-[var(--ac-dim)] font-mono">
              <div>
                <span className="text-[10px] text-[var(--ac-mute)] block">ACTIVE FRAME</span>
                <span className="text-sm font-semibold text-[var(--ac-text)] capitalize">
                  {activeFrame} Sky
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[var(--ac-mute)] block">HOUSE SYSTEM</span>
                <span className="text-sm font-semibold text-[var(--ac-text)]">
                  {houseSystem}
                </span>
              </div>
            </div>
          </div>

          {/* Alchemical Balances / Tokens */}
          <div className="ac-glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[var(--ac-gold)]" />
                <h4 className="text-xs uppercase font-mono tracking-wider text-[var(--ac-dim)] font-semibold">
                  Alchemical Balances
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[var(--ac-dim)]">ESMS Standard</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-2.5 rounded-lg bg-[rgba(224,162,58,0.08)] border border-[rgba(224,162,58,0.25)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[var(--ac-spirit)]">🜂 Spirit</div>
                  <div className="text-sm font-mono font-bold text-[var(--ac-text)]">
                    {gaugeViewModel.pct[0].toFixed(1)}%
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[var(--ac-spirit)]" />
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(74,163,216,0.08)] border border-[rgba(74,163,216,0.25)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[var(--ac-essence)]">🜄 Essence</div>
                  <div className="text-sm font-mono font-bold text-[var(--ac-text)]">
                    {gaugeViewModel.pct[1].toFixed(1)}%
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[var(--ac-essence)]" />
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(95,179,122,0.08)] border border-[rgba(95,179,122,0.25)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[var(--ac-matter)]">🜃 Matter</div>
                  <div className="text-sm font-mono font-bold text-[var(--ac-text)]">
                    {gaugeViewModel.pct[2].toFixed(1)}%
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[var(--ac-matter)]" />
              </div>

              <div className="p-2.5 rounded-lg bg-[rgba(185,140,214,0.08)] border border-[rgba(185,140,214,0.25)] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[var(--ac-substance)]">🜁 Substance</div>
                  <div className="text-sm font-mono font-bold text-[var(--ac-text)]">
                    {gaugeViewModel.pct[3].toFixed(1)}%
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-[var(--ac-substance)]" />
              </div>
            </div>
          </div>

          {/* Autonomous Agents Pillar */}
          <div className="ac-glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[var(--ac-essence)]" />
                <h4 className="text-xs uppercase font-mono tracking-wider text-[var(--ac-dim)] font-semibold">
                  Agentic Intelligence
                </h4>
              </div>
              <a
                href="https://agents.alchm.kitchen"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-[var(--ac-gold)] hover:underline inline-flex items-center gap-1"
              >
                <span>Console</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            <div className="p-3 rounded-lg border border-[var(--ac-line)] bg-[rgba(0,0,0,0.3)] flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-[var(--ac-text)] flex items-center gap-2">
                  <span>Planetary Council</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[rgba(74,163,216,0.15)] text-[var(--ac-essence)]">
                    Active Orbit
                  </span>
                </div>
                <div className="text-[11px] text-[var(--ac-dim)] font-mono mt-0.5">
                  Attuned to {gaugeViewModel.rulerName} ruler
                </div>
              </div>
              <CheckCircle2 className="w-4 h-4 text-[var(--ac-essence)]" />
            </div>
          </div>
        </div>

        {/* Right Column (3 cols / ~25%): Culinary Sanctum & SpacetimeDB Gaming */}
        <div className="lg:col-span-3 space-y-6">
          {/* Culinary Sanctum */}
          <div className="ac-glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-[var(--ac-matter)]" />
                <h4 className="text-xs uppercase font-mono tracking-wider text-[var(--ac-dim)] font-semibold">
                  Culinary Sanctum
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[var(--ac-matter)]">Alchm.kitchen</span>
            </div>

            <div className="space-y-2.5 text-xs text-[var(--ac-dim)]">
              <div>
                <span className="text-[10px] font-mono text-[var(--ac-mute)] block">PRIMARY ELEMENT</span>
                <span className="text-[var(--ac-text)] font-semibold">{gaugeViewModel.dominantElement} ({gaugeViewModel.dominantPct}%)</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-[var(--ac-mute)] block">GASTRONOMY ALIGNMENT</span>
                <span className="text-[var(--ac-text)] capitalize">
                  {gaugeViewModel.dominantElement === "Fire"
                    ? "Thermo-spicy, charred, solar-roasted"
                    : gaugeViewModel.dominantElement === "Water"
                    ? "Aquatic, braised, oceanic-fermented"
                    : gaugeViewModel.dominantElement === "Earth"
                    ? "Rooted, mineral-dense, slow-simmered"
                    : "Aerated, aromatic, ethereal herbs"}
                </span>
              </div>
            </div>
          </div>

          {/* SpacetimeDB Gaming & Celestial Deck */}
          <div className="ac-glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[var(--ac-gold)]" />
                <h4 className="text-xs uppercase font-mono tracking-wider text-[var(--ac-dim)] font-semibold">
                  Pentacles Arena
                </h4>
              </div>
              <span className="text-[10px] font-mono text-[var(--ac-gold-bright)]">SpacetimeDB</span>
            </div>

            <div className="space-y-2 text-xs text-[var(--ac-dim)] font-mono">
              <div className="flex justify-between">
                <span className="text-[var(--ac-mute)]">Faction</span>
                <span className="text-[var(--ac-gold-bright)] font-semibold">
                  Unaligned
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--ac-mute)]">Arena Status</span>
                <span>Standby</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[var(--ac-line)]">
                <span className="text-[var(--ac-mute)]">Wallet Binding</span>
                <span className="text-[var(--ac-mute)]">Unlinked</span>
              </div>
            </div>

            <div className="pt-2">
              <a
                href="https://pentacles.alchm.kitchen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full block text-center px-3 py-1.5 rounded-lg border border-[rgba(216,180,106,0.3)] bg-[rgba(216,180,106,0.08)] hover:bg-[rgba(216,180,106,0.18)] text-[var(--ac-gold-bright)] text-xs font-medium transition-colors"
              >
                Launch Pentacles Deck ↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Span: Cross-Platform Discovery Deck */}
      <EcosystemDiscoveryDeck
        hasKitchenData={true}
        hasAgentsData={false}
        hasPentaclesData={false}
        dominantElement={gaugeViewModel.dominantElement}
      />

      {/* Birth Chart Modal */}
      <BirthDataModal
        isOpen={isBirthModalOpen}
        onClose={() => setIsBirthModalOpen(false)}
        onSaveChart={handleSaveCustomChart}
      />
    </div>
  );
}
