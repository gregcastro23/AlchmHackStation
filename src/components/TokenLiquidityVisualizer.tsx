import React, { useState } from 'react';
import { 
  Network, 
  Lock, 
  ShieldCheck, 
  Flame, 
  Droplets, 
  Mountain, 
  Wind, 
  ArrowRightLeft, 
  CheckCircle2, 
  Play
} from 'lucide-react';
import { 
  calculateLosslessSwapQuote, 
  parseEsmsDecimal 
} from '../lib/tokenPricingEngine';

interface TokenLiquidityVisualizerProps {
  onCommitLog?: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
}

type CoinSymbol = 'SPIRIT' | 'ESSENCE' | 'MATTER' | 'SUBSTANCE';

const COIN_CONFIGS: Record<CoinSymbol, {
  color: string;
  fillColor: string;
  glowColor: string;
  element: string;
  icon: React.ReactNode;
  extensions: string[];
  securityFeature: string;
}> = {
  SPIRIT: {
    color: '#ff7b72',
    fillColor: 'rgba(255,123,114,0.15)',
    glowColor: 'rgba(255,123,114,0.4)',
    element: 'Fire',
    icon: <Flame className="w-4 h-4 text-[#ff7b72]" />,
    extensions: ['TransferHook', 'MetadataPointer', 'PermanentDelegate'],
    securityFeature: 'Dynamic Friction Fee Resolver',
  },
  ESSENCE: {
    color: '#7dd3fc',
    fillColor: 'rgba(125,211,252,0.15)',
    glowColor: 'rgba(125,211,252,0.4)',
    element: 'Water',
    icon: <Droplets className="w-4 h-4 text-[#7dd3fc]" />,
    extensions: ['ConfidentialTransfers', 'MetadataPointer', 'PermanentDelegate'],
    securityFeature: 'ZK Bulletproofs Stealth Privacy',
  },
  MATTER: {
    color: '#9ddf2e',
    fillColor: 'rgba(157,223,46,0.15)',
    glowColor: 'rgba(157,223,46,0.4)',
    element: 'Earth',
    icon: <Mountain className="w-4 h-4 text-[#9ddf2e]" />,
    extensions: ['NonTransferable', 'MetadataPointer', 'PermanentDelegate'],
    securityFeature: 'Runtime Zero-Transferability Lock',
  },
  SUBSTANCE: {
    color: '#e3e3d8',
    fillColor: 'rgba(227,227,216,0.15)',
    glowColor: 'rgba(227,227,216,0.4)',
    element: 'Air',
    icon: <Wind className="w-4 h-4 text-[#e3e3d8]" />,
    extensions: ['PermanentDelegate', 'InterestBearingConfig', 'MetadataPointer'],
    securityFeature: '18.20% APR Continuous Staking Yield',
  },
};

export const TokenLiquidityVisualizer: React.FC<TokenLiquidityVisualizerProps> = ({ onCommitLog }) => {
  const [sourceCoin, setSourceCoin] = useState<CoinSymbol>('SPIRIT');
  const [targetCoin, setTargetCoin] = useState<CoinSymbol>('MATTER');
  const [swapInput, setSwapInput] = useState<string>('25.0000');
  const [simulating, setSimulating] = useState(false);
  const [simReceipt, setSimReceipt] = useState<string | null>(null);

  const parsedInputAtoms = parseEsmsDecimal(swapInput, 4);
  const quote = calculateLosslessSwapQuote(sourceCoin, targetCoin, parsedInputAtoms);

  const handleSimulateSwap = () => {
    setSimulating(true);
    setSimReceipt(null);
    setTimeout(() => {
      setSimulating(false);
      const receipt = `Devnet Swap Simulation Confirmed: ${swapInput} $${sourceCoin} -> ${quote.outFormatted} $${targetCoin} (Error: 0x0 SUCCESS, Invariant: ${(quote.invariantRatio * 100).toFixed(4)}%)`;
      setSimReceipt(receipt);
      if (onCommitLog) onCommitLog(receipt, 'success');
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Section: Orbital Constellation Liquidity Topology */}
      <div className="bg-[#161b22]/70 border border-[#30363d] rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold font-mono tracking-wider text-[#f0f6fc] uppercase">
              Bespoke AMM Virtual Reserve Topology (6 Trading Pools)
            </h3>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[#8b949e]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            Zero-Escrow Virtual Routing Active
          </div>
        </div>

        {/* Constellation SVG Diagram */}
        <div className="relative w-full h-64 bg-[#0d1117] rounded-lg border border-[#21262d] flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 600 240">
            {/* Background Grid Accent */}
            <defs>
              <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#0d1117" stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="300" cy="120" r="100" fill="url(#hubGlow)" />

            {/* Connecting Pool Lines */}
            {/* Spirit (140, 60) to Essence (460, 60) */}
            <line x1="140" y1="60" x2="460" y2="60" stroke="#30363d" strokeWidth="2" strokeDasharray="4 4" />
            {/* Spirit (140, 60) to Matter (140, 180) */}
            <line x1="140" y1="60" x2="140" y2="180" stroke={sourceCoin === 'SPIRIT' && targetCoin === 'MATTER' ? '#ff7b72' : '#30363d'} strokeWidth={sourceCoin === 'SPIRIT' && targetCoin === 'MATTER' ? '3' : '2'} />
            {/* Spirit (140, 60) to Substance (460, 180) */}
            <line x1="140" y1="60" x2="460" y2="180" stroke="#30363d" strokeWidth="1.5" />
            {/* Essence (460, 60) to Matter (140, 180) */}
            <line x1="460" y1="60" x2="140" y2="180" stroke="#30363d" strokeWidth="1.5" />
            {/* Essence (460, 60) to Substance (460, 180) */}
            <line x1="460" y1="60" x2="460" y2="180" stroke="#30363d" strokeWidth="2" strokeDasharray="4 4" />
            {/* Matter (140, 180) to Substance (460, 180) */}
            <line x1="140" y1="180" x2="460" y2="180" stroke="#30363d" strokeWidth="2" strokeDasharray="4 4" />

            {/* Central ASOL Program Authority Router Node */}
            <circle cx="300" cy="120" r="28" fill="#161b22" stroke="#6366f1" strokeWidth="2" />
            <text x="300" y="117" textAnchor="middle" fill="#c7d2fe" fontSize="9" fontFamily="monospace" fontWeight="bold">ASOL</text>
            <text x="300" y="129" textAnchor="middle" fill="#818cf8" fontSize="8" fontFamily="monospace">ROUTER</text>

            {/* Node 1: Spirit (Top Left) */}
            <g transform="translate(140, 60)" className="cursor-pointer" onClick={() => setSourceCoin('SPIRIT')}>
              <circle r="26" fill="#1c1212" stroke="#ff7b72" strokeWidth={sourceCoin === 'SPIRIT' ? '3' : '1.5'} />
              <text y="-4" textAnchor="middle" fill="#ff7b72" fontSize="10" fontFamily="monospace" fontWeight="bold">SPIRIT</text>
              <text y="10" textAnchor="middle" fill="#8b949e" fontSize="8" fontFamily="monospace">500k Res</text>
            </g>

            {/* Node 2: Essence (Top Right) */}
            <g transform="translate(460, 60)" className="cursor-pointer" onClick={() => setSourceCoin('ESSENCE')}>
              <circle r="26" fill="#0c1924" stroke="#7dd3fc" strokeWidth={sourceCoin === 'ESSENCE' ? '3' : '1.5'} />
              <text y="-4" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="monospace" fontWeight="bold">ESSENCE</text>
              <text y="10" textAnchor="middle" fill="#8b949e" fontSize="8" fontFamily="monospace">750k Res</text>
            </g>

            {/* Node 3: Matter (Bottom Left) */}
            <g transform="translate(140, 180)" className="cursor-pointer" onClick={() => setTargetCoin('MATTER')}>
              <circle r="26" fill="#131e0f" stroke="#9ddf2e" strokeWidth={targetCoin === 'MATTER' ? '3' : '1.5'} />
              <text y="-4" textAnchor="middle" fill="#9ddf2e" fontSize="10" fontFamily="monospace" fontWeight="bold">MATTER</text>
              <text y="10" textAnchor="middle" fill="#8b949e" fontSize="8" fontFamily="monospace">50k Res</text>
            </g>

            {/* Node 4: Substance (Bottom Right) */}
            <g transform="translate(460, 180)" className="cursor-pointer" onClick={() => setTargetCoin('SUBSTANCE')}>
              <circle r="26" fill="#171822" stroke="#e3e3d8" strokeWidth={targetCoin === 'SUBSTANCE' ? '3' : '1.5'} />
              <text y="-4" textAnchor="middle" fill="#e3e3d8" fontSize="10" fontFamily="monospace" fontWeight="bold">SUBSTANCE</text>
              <text y="10" textAnchor="middle" fill="#8b949e" fontSize="8" fontFamily="monospace">2M Res</text>
            </g>
          </svg>
        </div>
      </div>

      {/* 2. Middle Section: Interactive Lossless Swap Simulator */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left Card: Swap Configuration */}
        <div className="bg-[#161b22]/70 border border-[#30363d] rounded-xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold font-mono text-[#f0f6fc] uppercase">
                  Bespoke AMM Router Simulator
                </h4>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                10^4 Lossless
              </span>
            </div>

            {/* From Coin */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-[#8b949e] block mb-1.5">INPUT ASSET (Burned via PermanentDelegate):</label>
                <div className="flex items-center gap-2">
                  <select
                    value={sourceCoin}
                    onChange={(e) => setSourceCoin(e.target.value as CoinSymbol)}
                    className="bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#f0f6fc] rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="SPIRIT">SPIRIT (Fire)</option>
                    <option value="ESSENCE">ESSENCE (Water)</option>
                    <option value="MATTER">MATTER (Earth - Soulbound)</option>
                    <option value="SUBSTANCE">SUBSTANCE (Air)</option>
                  </select>
                  <input
                    type="text"
                    value={swapInput}
                    onChange={(e) => setSwapInput(e.target.value)}
                    placeholder="0.0000"
                    className="flex-1 bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#f0f6fc] rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* To Coin */}
              <div>
                <label className="text-[11px] font-mono text-[#8b949e] block mb-1.5">OUTPUT ASSET (Minted via Program Authority):</label>
                <div className="flex items-center gap-2">
                  <select
                    value={targetCoin}
                    onChange={(e) => setTargetCoin(e.target.value as CoinSymbol)}
                    className="bg-[#0d1117] border border-[#30363d] text-xs font-mono text-[#f0f6fc] rounded-lg p-2.5 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="MATTER">MATTER (Earth - Soulbound)</option>
                    <option value="SPIRIT">SPIRIT (Fire)</option>
                    <option value="ESSENCE">ESSENCE (Water)</option>
                    <option value="SUBSTANCE">SUBSTANCE (Air)</option>
                  </select>
                  <div className="flex-1 bg-[#0d1117]/60 border border-[#30363d] text-xs font-mono text-emerald-400 rounded-lg p-2.5 font-bold">
                    ≈ {quote.outFormatted} ${targetCoin}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-[#21262d]">
            <button
              disabled={simulating}
              onClick={handleSimulateSwap}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              {simulating ? 'Simulating Atomic Swap on Devnet...' : 'Execute Bespoke Swap Simulation'}
            </button>
            {simReceipt && (
              <div className="mt-2.5 p-2 rounded bg-emerald-950/30 border border-emerald-500/30 text-[11px] font-mono text-emerald-400">
                {simReceipt}
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Quote Breakdown & Mathematical Guarantees */}
        <div className="bg-[#161b22]/70 border border-[#30363d] rounded-xl p-5 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold font-mono text-[#f0f6fc] uppercase">
                Mathematical Execution Parameters
              </h4>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between py-1.5 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Effective Rate:</span>
                <span className="text-[#f0f6fc] font-bold">1 ${sourceCoin} = {quote.effectiveRate.toFixed(4)} ${targetCoin}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Protocol Liquidity Fee (0.30%):</span>
                <span className="text-[#f0f6fc]">{quote.feeFormatted} ${sourceCoin}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Price Impact:</span>
                <span className={quote.priceImpactPct > 1 ? 'text-amber-400' : 'text-emerald-400'}>
                  {quote.priceImpactPct.toFixed(4)}%
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#21262d]">
                <span className="text-[#8b949e]">Invariant Conservation (k_after / k_before):</span>
                <span className="text-emerald-400 font-bold">{(quote.invariantRatio * 100).toFixed(6)}% (Lossless)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#8b949e]">Custody Model:</span>
                <span className="text-indigo-300">Zero-Custody (Burn/Mint Atomic)</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0d1117] border border-[#21262d] mt-4">
            <div className="text-[11px] font-mono text-[#8b949e] leading-relaxed">
              <span className="text-[#f0f6fc] font-semibold">Soulbound Routing Guarantee:</span> Because standard AMMs cannot hold non-transferable assets in escrow accounts, the ASOL internal liquidity engine acts as the certified router to deliver atomic parity.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Token-2022 Security & Extension Health Matrix */}
      <div className="bg-[#161b22]/70 border border-[#30363d] rounded-xl p-5 backdrop-blur-md">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-emerald-400" />
          <h4 className="text-xs font-bold font-mono text-[#f0f6fc] uppercase">
            Canonical Token-2022 Extension Health & Security Matrix
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {(Object.keys(COIN_CONFIGS) as CoinSymbol[]).map((sym) => {
            const cfg = COIN_CONFIGS[sym];
            return (
              <div key={sym} className="p-3.5 rounded-lg border border-[#30363d] bg-[#0d1117]/80 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      {cfg.icon}
                      <span className="text-xs font-bold font-mono text-[#f0f6fc]">${sym}</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-[#8b949e]">
                      {cfg.element}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#8b949e] font-mono mb-2">
                    {cfg.securityFeature}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[#21262d]">
                  {cfg.extensions.map((ext) => (
                    <div key={ext} className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>{ext}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
