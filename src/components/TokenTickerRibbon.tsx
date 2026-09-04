import React, { useState, useEffect } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
import { 
  getLiveTokenQuotes, 
  getLivePriceIndex, 
  subscribeToPriceIndex,
  fetchCanonicalPriceIndex,
  type TokenPriceQuote,
  type CanonicalPriceIndexPayload 
} from '../lib/tokenPricingEngine';

interface TokenTickerRibbonProps {
  selectedSymbol?: string;
  onSelectToken?: (symbol: string) => void;
}

const ELEMENT_STYLES: Record<string, {
  accent: string;
  border: string;
  bg: string;
  glow: string;
  badge: string;
}> = {
  SPIRIT: {
    accent: '#ff7b72',
    border: 'border-orange-500/30',
    bg: 'bg-orange-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    badge: 'bg-orange-950/50 text-orange-300 border-orange-800/40',
  },
  ESSENCE: {
    accent: '#7dd3fc',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    badge: 'bg-cyan-950/50 text-cyan-300 border-cyan-800/40',
  },
  MATTER: {
    accent: '#9ddf2e',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    badge: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40',
  },
  SUBSTANCE: {
    accent: '#e3e3d8',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    badge: 'bg-indigo-950/50 text-indigo-300 border-indigo-800/40',
  },
};

export const TokenTickerRibbon: React.FC<TokenTickerRibbonProps> = ({
  selectedSymbol = 'SPIRIT',
  onSelectToken,
}) => {
  const [quotes, setQuotes] = useState<Record<string, TokenPriceQuote>>(getLiveTokenQuotes());
  const [payload, setPayload] = useState<CanonicalPriceIndexPayload>(getLivePriceIndex());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    // Initial fetch and subscribe to reactive stream
    fetchCanonicalPriceIndex().then((p) => {
      setPayload(p);
      setQuotes(getLiveTokenQuotes());
    });

    const unsubscribe = subscribeToPriceIndex((p) => {
      setPayload(p);
      setQuotes(getLiveTokenQuotes());
    });

    const timer = setInterval(() => {
      fetchCanonicalPriceIndex().then((p) => {
        setPayload(p);
        setQuotes(getLiveTokenQuotes());
      });
    }, 8000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, []);

  const handleCopy = (address: string, sym: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    setCopiedKey(sym);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const renderSparkline = (points: number[], color: string) => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 0.001;
    const width = 56;
    const height = 22;

    const pathData = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 6) - 3;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible opacity-90">
        <path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  const skyAspect = payload ? `A ${payload.aNumber.toFixed(1)} · ×${payload.multiplier.toFixed(4)} · ${payload.isDiurnal ? 'diurnal sky' : 'nocturnal sky'}` : 'A 6.7 · ×1.1455 · diurnal sky';

  return (
    <div className="w-full bg-[#0a0d14]/95 backdrop-blur-md border-b border-[#21262d] py-2 px-3 overflow-x-auto select-none transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-[920px]">
        {/* Left: Canonical Live Banner & Celestial Aspect Dignity */}
        <div className="flex items-center gap-3 pr-3 border-r border-[#21262d] shrink-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-mono tracking-wider text-[#f0f6fc] font-bold flex items-center gap-1">
                LIVE ELEMENTAL EXCHANGE
              </span>
            </div>
            <div className="text-[10px] font-mono text-indigo-300 flex items-center gap-1 mt-0.5">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400 inline" />
              <span>{skyAspect}</span>
            </div>
          </div>
        </div>

        {/* 4 Canonical Token Ticker Cards */}
        <div className="grid grid-cols-4 gap-2.5 flex-1">
          {Object.values(quotes).map((quote) => {
            const isSelected = selectedSymbol.toUpperCase() === quote.symbol;
            const style = ELEMENT_STYLES[quote.symbol] || ELEMENT_STYLES.SPIRIT;
            const isPositive = quote.change24h >= 0;

            return (
              <div
                key={quote.symbol}
                onClick={() => onSelectToken && onSelectToken(quote.symbol)}
                className={`relative flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? `${style.border} ${style.bg} ring-1 ring-white/10 shadow-lg`
                    : 'border-[#30363d]/60 bg-[#161b22]/60 hover:bg-[#161b22]'
                } ${style.glow}`}
              >
                {/* Left: Symbol, Glyph & Mint Address Copy */}
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-black/50 border border-white/10 flex items-center justify-center text-sm font-serif">
                    <span style={{ color: style.accent }}>{quote.glyph}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono tracking-wide text-[#f0f6fc]">
                        {quote.symbol}
                      </span>
                      <button
                        title="Copy Pinned Token-2022 Mint PDA"
                        onClick={(e) => handleCopy(quote.mintAddress, quote.symbol, e)}
                        className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors p-0.5"
                      >
                        {copiedKey === quote.symbol ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                    <div className="text-[9.5px] text-[#8b949e] font-mono">
                      {quote.element} · {(quote.circulatingSupply / 1000).toFixed(1)}k
                    </div>
                  </div>
                </div>

                {/* Center: Sparkline */}
                <div className="hidden lg:block px-1">
                  {renderSparkline(quote.sparkline, isPositive ? '#3fb950' : '#f85149')}
                </div>

                {/* Right: Dimensionless Canonical Index & 24h Change */}
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-[#f0f6fc]">
                    {quote.index.toFixed(4)}
                  </div>
                  <div
                    className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    <span>{isPositive ? '▲ +' : '▼ '}{Math.abs(quote.change24h).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rightmost: Rails Reference Indicator */}
        <div className="hidden xl:flex flex-col items-end pl-2 text-[9.5px] font-mono text-[#8b949e] border-l border-[#21262d] shrink-0">
          <span className="text-[#c9d1d9]">Mint $0.025 · Redeem $0.01</span>
          <span className="text-indigo-400/80">Season of {payload?.sunSign || 'Virgo'} · {payload?.dominantElement || 'Air'}</span>
        </div>
      </div>
    </div>
  );
};
