import React from "react";
import { ChefHat, Bot, Gamepad2, ExternalLink, Sparkles } from "lucide-react";
import { ElementName } from "@/lib/astrologyMath";

interface Props {
  hasKitchenData: boolean;
  hasAgentsData: boolean;
  hasPentaclesData: boolean;
  dominantElement?: ElementName;
  className?: string;
}

export function EcosystemDiscoveryDeck({
  hasKitchenData,
  hasAgentsData,
  hasPentaclesData,
  dominantElement = "Earth",
  className = "",
}: Props) {
  const cards = [
    {
      id: "kitchen",
      title: "Alchm Kitchen",
      subtitle: "Culinary Sanctum & Gastronomy",
      domain: "alchm.kitchen",
      url: "https://alchm.kitchen",
      connected: hasKitchenData,
      color: "var(--ac-matter)",
      accentBg: "rgba(95,179,122,0.1)",
      borderColor: "rgba(95,179,122,0.3)",
      icon: ChefHat,
      description: `Tailored alchemical gastronomy aligning dietary recipes to your ${dominantElement} constitution.`,
      cta: hasKitchenData ? "Enter Sanctum ↗" : "Connect Kitchen ↗",
    },
    {
      id: "agents",
      title: "Planetary Agents",
      subtitle: "Autonomous Intelligence Council",
      domain: "agents.alchm.kitchen",
      url: "https://agents.alchm.kitchen",
      connected: hasAgentsData,
      color: "var(--ac-essence)",
      accentBg: "rgba(74,163,216,0.1)",
      borderColor: "rgba(74,163,216,0.3)",
      icon: Bot,
      description: "Craft, evolve, and commune with planetary consciousness agents attuned to your chart.",
      cta: hasAgentsData ? "Summon Council ↗" : "Awaken Agent ↗",
    },
    {
      id: "pentacles",
      title: "Pentacles Arena",
      subtitle: "Celestial Deck & SpacetimeDB",
      domain: "pentacles.alchm.kitchen",
      url: "https://pentacles.alchm.kitchen",
      connected: hasPentaclesData,
      color: "var(--ac-gold-bright)",
      accentBg: "rgba(216,180,106,0.1)",
      borderColor: "rgba(216,180,106,0.3)",
      icon: Gamepad2,
      description: "Multiplayer astrological battles and deck-building synchronized on SpacetimeDB.",
      cta: hasPentaclesData ? "Enter Arena ↗" : "Launch Deck ↗",
    },
  ];

  return (
    <div data-consensus="true" className={`space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between px-1">
        <div className="text-xs uppercase tracking-wider text-[var(--ac-dim)] font-mono flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--ac-gold)]" />
          <span>Ecosystem Synergy Pillars</span>
        </div>
        <span className="text-[10px] font-mono text-[var(--ac-mute)]">Unified Triad Orbit</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="ac-glass-panel p-5 flex flex-col justify-between gap-4 transition-transform hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center border"
                    style={{
                      background: card.accentBg,
                      borderColor: card.borderColor,
                      color: card.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                    style={{
                      background: card.connected ? card.accentBg : "rgba(0,0,0,0.2)",
                      borderColor: card.connected ? card.borderColor : "var(--ac-line)",
                      color: card.connected ? card.color : "var(--ac-mute)",
                    }}
                  >
                    {card.connected ? "Synchronized" : "Independent"}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-[var(--ac-text)] flex items-center gap-1.5">
                    <span>{card.title}</span>
                  </h4>
                  <div className="text-[11px] font-mono text-[var(--ac-dim)]">
                    {card.subtitle}
                  </div>
                </div>

                <p className="text-xs text-[var(--ac-dim)] leading-relaxed">
                  {card.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--ac-line)] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--ac-mute)]">
                  {card.domain}
                </span>
                <a
                  href={card.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[var(--ac-gold-bright)] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{card.cta}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
