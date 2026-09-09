import React from "react";
import {
  ConsensusGaugeViewModel,
  ESMS_COLORS_ARRAY,
  buildGaugeViewModel,
  CANONICAL_REFERENCE_CHART,
  ChartInput,
} from "@/lib/astrologyMath";
import { Sparkles } from "lucide-react";

interface Props {
  viewModel?: ConsensusGaugeViewModel | null;
  chart?: ChartInput | null;
  onOpenBirthModal?: () => void;
  className?: string;
}

export function AlchemicalTemperamentGauge({
  viewModel,
  chart,
  onOpenBirthModal,
  className = "",
}: Props) {
  const vm: ConsensusGaugeViewModel =
    viewModel ||
    (chart ? buildGaugeViewModel(chart, false) : buildGaugeViewModel(CANONICAL_REFERENCE_CHART, true));

  const C = 100;
  const RMAX = 80;

  const clampedPct = vm.pct.map((p) => Math.max(5, Math.min(95, p)));
  const points = [
    [C, C - (clampedPct[0] / 100) * RMAX], // Spirit (Top)
    [C + (clampedPct[1] / 100) * RMAX, C], // Essence (Right)
    [C, C + (clampedPct[2] / 100) * RMAX], // Matter (Bottom)
    [C - (clampedPct[3] / 100) * RMAX, C], // Substance (Left)
  ];
  const pointsString = points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const dominantColor = ESMS_COLORS_ARRAY[vm.dominantIndex] || "#5fb37a";

  return (
    <div
      data-consensus="true"
      className={`ac-glass-panel p-6 flex flex-col gap-5 text-[var(--ac-text)] ${className}`}
    >
      {/* Sample / Fixture Chart Overlay Banner */}
      {vm.isFixture && (
        <div className="p-3 rounded-lg border border-[rgba(216,180,106,0.35)] bg-[rgba(216,180,106,0.08)] flex items-center justify-between text-xs text-[var(--ac-gold-bright)]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 flex-none text-[var(--ac-gold)]" />
            <span>
              <strong className="font-semibold">Sample Attunement Chart</strong> — Add your birth data to generate your authentic sky.
            </span>
          </div>
          {onOpenBirthModal && (
            <button
              type="button"
              onClick={onOpenBirthModal}
              className="text-[11px] font-mono underline hover:text-white transition-colors flex-none ml-2 cursor-pointer"
            >
              Add Data →
            </button>
          )}
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center space-y-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-[var(--ac-dim)] font-mono">
          Alchemical Temperament — Blended SMES
        </div>
        <h2 className="ac-hero-headline flex items-center justify-center gap-2">
          <span>{vm.dominantName}-dominant</span>
          <span style={{ color: dominantColor }}>{vm.dominantGlyph}</span>
        </h2>
        <div className="text-xs text-[var(--ac-dim)] font-sans">
          {vm.dominantElement} · {vm.dominantPct}% · {vm.dominantVibe}
        </div>
        <div className="pt-1">
          <div className="ac-crown-pill">
            <span className="text-[var(--ac-gold-bright)] text-sm leading-none">♔</span>
            <span className="font-medium">
              {vm.rulerGlyph} {vm.rulerName} — chart ruler
            </span>
          </div>
        </div>
      </div>

      {/* Four-Quadrant Diamond Gauge (SVG Kite) */}
      <div className="ac-diamond-wrap">
        <svg
          className="ac-diamond-svg"
          viewBox="0 0 200 200"
          role="img"
          aria-label="Alchemical temperament 4-quadrant diamond gauge"
        >
          {/* Concentric Guide Rings: 20%, 40%, 60%, 80% */}
          {[20, 40, 60, 80].map((r) => (
            <circle key={r} className="ac-ring" cx={C} cy={C} r={r} />
          ))}

          {/* Cross Axes */}
          <line className="ac-axis" x1={C} y1={C - RMAX} x2={C} y2={C + RMAX} />
          <line className="ac-axis" x1={C - RMAX} y1={C} x2={C + RMAX} y2={C} />

          {/* Color-Coded Spokes */}
          <line className="ac-spoke" x1={C} y1={C} x2={C} y2={C - RMAX} stroke={ESMS_COLORS_ARRAY[0]} />
          <line className="ac-spoke" x1={C} y1={C} x2={C + RMAX} y2={C} stroke={ESMS_COLORS_ARRAY[1]} />
          <line className="ac-spoke" x1={C} y1={C} x2={C} y2={C + RMAX} stroke={ESMS_COLORS_ARRAY[2]} />
          <line className="ac-spoke" x1={C} y1={C} x2={C - RMAX} y2={C} stroke={ESMS_COLORS_ARRAY[3]} />

          {/* Shaded Value Polygon (Kite) */}
          <polygon
            className="ac-poly"
            points={pointsString}
            fill={dominantColor}
            fillOpacity={0.22}
            stroke={dominantColor}
          />

          {/* Tip Labels with Glyphs & Percentages */}
          <text
            x={C}
            y={C - RMAX - 8}
            textAnchor="middle"
            fill={ESMS_COLORS_ARRAY[0]}
            className={`ac-tip-text ${vm.dominantIndex === 0 ? "ac-tip-dom" : ""}`}
          >
            🜂 {Math.round(vm.pct[0])}%
          </text>
          <text
            x={C + RMAX + 10}
            y={C + 4}
            textAnchor="start"
            fill={ESMS_COLORS_ARRAY[1]}
            className={`ac-tip-text ${vm.dominantIndex === 1 ? "ac-tip-dom" : ""}`}
          >
            🜄 {Math.round(vm.pct[1])}%
          </text>
          <text
            x={C}
            y={C + RMAX + 15}
            textAnchor="middle"
            fill={ESMS_COLORS_ARRAY[2]}
            className={`ac-tip-text ${vm.dominantIndex === 2 ? "ac-tip-dom" : ""}`}
          >
            🜃 {Math.round(vm.pct[2])}%
          </text>
          <text
            x={C - RMAX - 10}
            y={C + 4}
            textAnchor="end"
            fill={ESMS_COLORS_ARRAY[3]}
            className={`ac-tip-text ${vm.dominantIndex === 3 ? "ac-tip-dom" : ""}`}
          >
            🜁 {Math.round(vm.pct[3])}%
          </text>
        </svg>
      </div>

      {/* Planetary Contribution Weight Stack */}
      <div className="space-y-2 mt-1">
        <div className="text-[11px] uppercase tracking-[0.08em] text-[var(--ac-dim)] flex justify-between items-center">
          <span>Planetary Contribution Weight</span>
          <span className="font-mono text-[10px] text-[var(--ac-mute)]">Stack Ratio</span>
        </div>

        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 select-none">
          {vm.contributions.map((c) => (
            <div
              key={c.body}
              className={`flex items-center gap-3 p-1.5 rounded-lg transition-colors ${
                c.isRuler
                  ? "ac-contrib-row--ruler bg-[rgba(216,180,106,0.06)] border border-[rgba(216,180,106,0.25)]"
                  : "hover:bg-[rgba(255,255,255,0.03)]"
              }`}
            >
              <div
                className="relative w-6 text-center text-sm font-medium flex-none"
                title={c.name}
              >
                <span className={c.isRuler ? "text-[var(--ac-gold-bright)] font-bold" : "text-[var(--ac-text)]"}>
                  {c.glyph}
                </span>
                {c.isRuler && (
                  <span
                    className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] text-[var(--ac-gold-bright)] leading-none"
                    title="Chart Ruler"
                  >
                    ♔
                  </span>
                )}
                {c.retrograde && (
                  <span
                    className="absolute -bottom-1 right-0 text-[8px] text-[var(--ac-dim)] leading-none"
                    title="Retrograde"
                  >
                    ℞
                  </span>
                )}
              </div>

              <div className="ac-contrib-track">
                <div
                  className="ac-contrib-bar"
                  style={{ width: `${Math.max(6, c.relativeWeightPct).toFixed(1)}%` }}
                >
                  <span style={{ width: `${c.comp[0]}%`, background: ESMS_COLORS_ARRAY[0] }} title={`Spirit: ${c.comp[0].toFixed(1)}%`} />
                  <span style={{ width: `${c.comp[1]}%`, background: ESMS_COLORS_ARRAY[1] }} title={`Essence: ${c.comp[1].toFixed(1)}%`} />
                  <span style={{ width: `${c.comp[2]}%`, background: ESMS_COLORS_ARRAY[2] }} title={`Matter: ${c.comp[2].toFixed(1)}%`} />
                  <span style={{ width: `${c.comp[3]}%`, background: ESMS_COLORS_ARRAY[3] }} title={`Substance: ${c.comp[3].toFixed(1)}%`} />
                </div>
              </div>

              <div className="text-[10px] font-mono text-[var(--ac-dim)] w-14 text-right flex-none">
                {c.weight.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reading Card */}
      <div className="p-3 rounded-lg border border-[var(--ac-line)] bg-[rgba(0,0,0,0.3)] text-xs text-[var(--ac-dim)] leading-relaxed">
        <div className="text-[10px] uppercase font-mono text-[var(--ac-gold)] mb-1">
          ✦ Alchemical Reading
        </div>
        <div>
          Primary grounding anchored in <span className="text-[var(--ac-gold-bright)] font-semibold">{vm.dominantElement}</span> ({vm.dominantPct}%). Chart ruler <span className="text-[var(--ac-gold-bright)]">{vm.rulerName}</span> dictates structural stability across mundane and culinary orbits.
        </div>
      </div>
    </div>
  );
}
