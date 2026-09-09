import React from "react";
import { MapPin, ChefHat, Bot, Gamepad2, Sparkles } from "lucide-react";

export type AstrologicalFrame = "natal" | "mundane" | "transit";
export type HouseSystem = "Placidus" | "WholeSign";

interface Props {
  activeFrame?: AstrologicalFrame;
  onFrameChange?: (frame: AstrologicalFrame) => void;
  houseSystem?: HouseSystem;
  onHouseSystemChange?: (system: HouseSystem) => void;
  onOpenBirthModal?: () => void;
  latitude?: number;
  longitude?: number;
  kitchenConnected?: boolean;
  agentsConnected?: boolean;
  pentaclesConnected?: boolean;
  className?: string;
}

export function EcosystemStatusBar({
  activeFrame = "natal",
  onFrameChange,
  houseSystem = "Placidus",
  onHouseSystemChange,
  onOpenBirthModal,
  latitude = 40.7128,
  longitude = -74.006,
  kitchenConnected = true,
  agentsConnected = false,
  pentaclesConnected = false,
  className = "",
}: Props) {
  return (
    <div
      data-consensus="true"
      className={`ac-glass-panel px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs ${className}`}
    >
      {/* Left: Brand / Title */}
      <div className="flex items-center gap-3">
        <span className="text-[var(--ac-gold)] font-serif text-base tracking-wide flex items-center gap-1.5 font-semibold">
          <span className="text-[var(--ac-gold-bright)]">✦</span> Alchm Consensus Profile
        </span>
        <span className="hidden sm:inline-block h-3 w-px bg-[var(--ac-line)]" />
        <div className="hidden md:flex items-center gap-1 text-[var(--ac-dim)] font-mono text-[11px]">
          <MapPin className="w-3 h-3 text-[var(--ac-gold)]" />
          <span>
            {latitude >= 0 ? `${latitude.toFixed(2)}°N` : `${Math.abs(latitude).toFixed(2)}°S`},{" "}
            {longitude >= 0 ? `${longitude.toFixed(2)}°E` : `${Math.abs(longitude).toFixed(2)}°W`}
          </span>
        </div>
      </div>

      {/* Middle: Frame Toggles, House System & Birth Attunement */}
      <div className="flex items-center gap-3">
        {/* Frame Toggle Pills */}
        <div className="inline-flex p-0.5 rounded-lg border border-[var(--ac-line)] bg-[rgba(0,0,0,0.4)]">
          {(
            [
              { id: "natal", label: "Natal" },
              { id: "mundane", label: "Mundane" },
              { id: "transit", label: "Transit" },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onFrameChange?.(item.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                activeFrame === item.id
                  ? "bg-[var(--ac-gold-deep)] text-[var(--ac-gold-bright)] shadow-sm"
                  : "text-[var(--ac-dim)] hover:text-[var(--ac-text)]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* House System Selector */}
        <select
          value={houseSystem}
          onChange={(e) => onHouseSystemChange?.(e.target.value as HouseSystem)}
          className="px-2 py-1 rounded-md border border-[var(--ac-line)] bg-[rgba(0,0,0,0.4)] text-[11px] text-[var(--ac-dim)] hover:text-[var(--ac-gold-bright)] focus:outline-none cursor-pointer font-mono"
        >
          <option value="Placidus">Placidus</option>
          <option value="WholeSign">Whole Sign</option>
        </select>

        {/* Custom Birth Chart Config Trigger */}
        {onOpenBirthModal && (
          <button
            type="button"
            onClick={onOpenBirthModal}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md border border-[rgba(216,180,106,0.3)] bg-[rgba(216,180,106,0.08)] hover:bg-[rgba(216,180,106,0.18)] text-[var(--ac-gold-bright)] text-[11px] font-medium transition-colors cursor-pointer"
            title="Attune custom birth chart data"
          >
            <Sparkles className="w-3 h-3 text-[var(--ac-gold)]" />
            <span>Attune Sky</span>
          </button>
        )}
      </div>

      {/* Right: Ecosystem Pillar Status Indicators */}
      <div className="flex items-center gap-2.5">
        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ${
            kitchenConnected
              ? "border-[rgba(95,179,122,0.3)] bg-[rgba(95,179,122,0.1)] text-[var(--ac-matter)]"
              : "border-[var(--ac-line)] bg-[rgba(0,0,0,0.2)] text-[var(--ac-mute)]"
          }`}
          title="alchm.kitchen culinary database"
        >
          <ChefHat className="w-3 h-3" />
          <span>Kitchen</span>
          <span className={`w-1.5 h-1.5 rounded-full ${kitchenConnected ? "bg-[var(--ac-matter)] animate-pulse" : "bg-gray-600"}`} />
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ${
            agentsConnected
              ? "border-[rgba(74,163,216,0.3)] bg-[rgba(74,163,216,0.1)] text-[var(--ac-essence)]"
              : "border-[var(--ac-line)] bg-[rgba(0,0,0,0.2)] text-[var(--ac-mute)]"
          }`}
          title="agents.alchm.kitchen intelligence council"
        >
          <Bot className="w-3 h-3" />
          <span>Agents</span>
          <span className={`w-1.5 h-1.5 rounded-full ${agentsConnected ? "bg-[var(--ac-essence)]" : "bg-gray-600"}`} />
        </div>

        <div
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-mono ${
            pentaclesConnected
              ? "border-[rgba(216,180,106,0.3)] bg-[rgba(216,180,106,0.1)] text-[var(--ac-gold-bright)]"
              : "border-[var(--ac-line)] bg-[rgba(0,0,0,0.2)] text-[var(--ac-mute)]"
          }`}
          title="Pentacles SpacetimeDB Web3 engine"
        >
          <Gamepad2 className="w-3 h-3" />
          <span>Pentacles</span>
          <span className={`w-1.5 h-1.5 rounded-full ${pentaclesConnected ? "bg-[var(--ac-gold)]" : "bg-gray-600"}`} />
        </div>
      </div>
    </div>
  );
}
