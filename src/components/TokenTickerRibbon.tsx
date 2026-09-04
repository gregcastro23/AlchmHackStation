import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Copy, Check, Flame, Droplets, Mountain, Wind } from 'lucide-react';
import { getLiveTokenQuotes, type TokenPriceQuote } from '../lib/tokenPricingEngine';

interface TokenTickerRibbonProps {
  selectedSymbol?: string;
  onSelectToken?: (symbol: string) => void;
}

const ELEMENT_STYLES: Record<string, {
  color: string;
  border: string;
  bg: string;
  glow: string;
  icon: React.ReactNode;
}> = {
  SPIRIT: {
    color: '#ff7b72',
    border: 'border-orange-500/30',
    bg: 'bg-orange-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(249,115,22,0.25)]',
    icon: <Flame className="w-3.5 h-3.5 text-orange-400" />,
  },
  ESSENCE: {
    color: '#7dd3fc',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.25)]',
    icon: <Droplets className="w-3.5 h-3.5 text-cyan-400" />,
  },
  MATTER: {
    color: '#9ddf2e',
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    icon: <Mountain className="w-3.5 h-3.5 text-emerald-400" />,
  },
  SUBSTANCE: {
    color: '#e3e3d8',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-950/20',
    glow: 'hover:shadow-[0_0_15px_rgba(99,102,241,0.25)]',
    icon: <Wind className="w-3.5 h-3.5 text-indigo-400" />,
  },
};

export const TokenTickerRibbon: React.FC<TokenTickerRibbonProps> = ({
  selectedSymbol = 'SPIRIT',
  onSelectToken,
}) => {
  const [quotes, setQuotes] = useState<Record<string, TokenPriceQuote>>(getLiveTokenQuotes());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuotes(getLiveTokenQuotes());
    }, 4000);
    return () => clearInterval(timer);
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
    const range = max - min || 1;
    const width = 48;
    const height = 18;

    const pathData = points
      .map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * (height - 4) - 2;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <svg width={width} height={height} className="overflow-visible opacity-85">
        <path d={pathData} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <div className="w-full bg-[#0a0d14]/90 backdrop-blur-md border-b border-[#21262d] py-2 px-3 overflow-x-auto select-none transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-w-[780px]">
        {/* Market Label */}
        <div className="flex items-center gap-2 pr-3 border-r border-[#21262d] shrink-0">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div className="text-[11px] font-mono tracking-wider text-[#8b949e] font-semibold">
            ESMS / SOLANA DEVNET
          </div>
        </div>

        {/* 4 Token Ticker Cards */}
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
                    : 'border-[#30363d]/60 bg-[#161b22]/50 hover:bg-[#161b22]'
                } ${style.glow}`}
              >
                {/* Left: Token Identifier */}
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-black/40 border border-white/5">
                    {style.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold font-mono tracking-wide text-[#f0f6fc]">
                        ${quote.symbol}
                      </span>
                      <button
                        title="Copy Pinned Mint Address"
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
                    <div className="text-[10px] text-[#8b949e] font-mono">
                      {quote.priceSol.toFixed(4)} SOL
                    </div>
                  </div>
                </div>

                {/* Center: Sparkline */}
                <div className="hidden sm:block px-1">
                  {renderSparkline(quote.sparkline, isPositive ? '#3fb950' : '#f85149')}
                </div>

                {/* Right: Price & 24h Change */}
                <div className="text-right">
                  <div className="text-xs font-semibold font-mono text-[#f0f6fc]">
                    ${quote.priceUsd.toFixed(2)}
                  </div>
                  <div
                    className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                    <span>{isPositive ? '+' : ''}{quote.change24h.toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
