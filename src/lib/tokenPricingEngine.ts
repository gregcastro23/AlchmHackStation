/**
 * AlchmHackStation: Token Pricing & Liquidity Engine
 * Provides real-time pricing feeds, invariant depth calculations, and market telemetry
 * for the 4 canonical coins: SPIRIT, ESSENCE, MATTER, and SUBSTANCE.
 */

export interface TokenPriceQuote {
  symbol: 'SPIRIT' | 'ESSENCE' | 'MATTER' | 'SUBSTANCE';
  name: string;
  priceUsd: number;
  priceSol: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  marketCapUsd: number;
  virtualReserve: bigint;
  decimals: number;
  mintAddress: string;
  sparkline: number[];
}

export interface SwapQuoteResult {
  inSymbol: string;
  outSymbol: string;
  inAmount: bigint;
  outAmount: bigint;
  feeAmount: bigint;
  feeBps: number;
  effectiveRate: number;
  priceImpactPct: number;
  inFormatted: string;
  outFormatted: string;
  feeFormatted: string;
  invariantRatio: number;
}

export const CANONICAL_COINS: Record<string, {
  name: string;
  symbol: 'SPIRIT' | 'ESSENCE' | 'MATTER' | 'SUBSTANCE';
  decimals: number;
  mintAddress: string;
  basePriceUsd: number;
  baseReserve: bigint; // 10^4 units
}> = {
  SPIRIT: {
    name: 'Spirit',
    symbol: 'SPIRIT',
    decimals: 4,
    mintAddress: 'K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ',
    basePriceUsd: 1.45,
    baseReserve: 500_000_0000n,
  },
  ESSENCE: {
    name: 'Essence',
    symbol: 'ESSENCE',
    decimals: 4,
    mintAddress: '3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf',
    basePriceUsd: 0.98,
    baseReserve: 750_000_0000n,
  },
  MATTER: {
    name: 'Matter',
    symbol: 'MATTER',
    decimals: 4,
    mintAddress: '7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4',
    basePriceUsd: 18.25, // Scarce soulbound asset
    baseReserve: 50_000_0000n,
  },
  SUBSTANCE: {
    name: 'Substance',
    symbol: 'SUBSTANCE',
    decimals: 4,
    mintAddress: '6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa',
    basePriceUsd: 0.42,
    baseReserve: 2_000_000_0000n,
  },
};

const SOL_USD_PRICE = 145.0;

/**
 * Format raw 10^4 integer atoms to decimal string
 */
export function formatEsmsAtoms(atoms: bigint, decimals = 4): string {
  if (atoms < 0n) return '0.0000';
  const scale = 10n ** BigInt(decimals);
  const whole = atoms / scale;
  const frac = (atoms % scale).toString().padStart(decimals, '0');
  return `${whole}.${frac}`;
}

/**
 * Parse decimal string into raw 10^4 integer atoms
 */
export function parseEsmsDecimal(val: string, decimals = 4): bigint {
  const clean = val.trim();
  if (!clean || isNaN(Number(clean))) return 0n;
  const parts = clean.split('.');
  const whole = BigInt(parts[0] || '0');
  let fracPart = parts[1] || '';
  if (fracPart.length > decimals) {
    fracPart = fracPart.slice(0, decimals);
  } else {
    fracPart = fracPart.padEnd(decimals, '0');
  }
  return whole * (10n ** BigInt(decimals)) + BigInt(fracPart);
}

/**
 * Compute real-time token market quotes with dynamic simulated delta
 */
export function getLiveTokenQuotes(): Record<string, TokenPriceQuote> {
  const now = Date.now();
  // Minute-scale micro variation based on time
  const seed = (now / 60000) % 100;

  return {
    SPIRIT: {
      symbol: 'SPIRIT',
      name: 'Spirit',
      priceUsd: 1.45 + Math.sin(seed * 0.1) * 0.04,
      priceSol: (1.45 + Math.sin(seed * 0.1) * 0.04) / SOL_USD_PRICE,
      change24h: +4.82 + Math.sin(seed * 0.2) * 0.5,
      high24h: 1.52,
      low24h: 1.38,
      volume24hUsd: 142580,
      marketCapUsd: 1425800,
      virtualReserve: CANONICAL_COINS.SPIRIT.baseReserve,
      decimals: 4,
      mintAddress: CANONICAL_COINS.SPIRIT.mintAddress,
      sparkline: [1.38, 1.39, 1.41, 1.40, 1.43, 1.42, 1.44, 1.45],
    },
    ESSENCE: {
      symbol: 'ESSENCE',
      name: 'Essence',
      priceUsd: 0.98 + Math.cos(seed * 0.15) * 0.02,
      priceSol: (0.98 + Math.cos(seed * 0.15) * 0.02) / SOL_USD_PRICE,
      change24h: +1.95 + Math.cos(seed * 0.3) * 0.4,
      high24h: 1.02,
      low24h: 0.95,
      volume24hUsd: 89340,
      marketCapUsd: 893400,
      virtualReserve: CANONICAL_COINS.ESSENCE.baseReserve,
      decimals: 4,
      mintAddress: CANONICAL_COINS.ESSENCE.mintAddress,
      sparkline: [0.96, 0.95, 0.97, 0.98, 0.97, 0.99, 0.98, 0.98],
    },
    MATTER: {
      symbol: 'MATTER',
      name: 'Matter',
      priceUsd: 18.25 + Math.sin(seed * 0.08) * 0.65,
      priceSol: (18.25 + Math.sin(seed * 0.08) * 0.65) / SOL_USD_PRICE,
      change24h: +11.40 + Math.sin(seed * 0.25) * 0.8,
      high24h: 19.10,
      low24h: 16.50,
      volume24hUsd: 215400,
      marketCapUsd: 2589000,
      virtualReserve: CANONICAL_COINS.MATTER.baseReserve,
      decimals: 4,
      mintAddress: CANONICAL_COINS.MATTER.mintAddress,
      sparkline: [16.8, 17.2, 17.0, 17.6, 17.9, 18.1, 18.0, 18.25],
    },
    SUBSTANCE: {
      symbol: 'SUBSTANCE',
      name: 'Substance',
      priceUsd: 0.42 + Math.cos(seed * 0.12) * 0.015,
      priceSol: (0.42 + Math.cos(seed * 0.12) * 0.015) / SOL_USD_PRICE,
      change24h: -0.85 + Math.cos(seed * 0.4) * 0.3,
      high24h: 0.45,
      low24h: 0.41,
      volume24hUsd: 65120,
      marketCapUsd: 651200,
      virtualReserve: CANONICAL_COINS.SUBSTANCE.baseReserve,
      decimals: 4,
      mintAddress: CANONICAL_COINS.SUBSTANCE.mintAddress,
      sparkline: [0.44, 0.43, 0.43, 0.42, 0.43, 0.42, 0.41, 0.42],
    },
  };
}

/**
 * Lossless constant-product swap calculator between any two canonical coins.
 */
export function calculateLosslessSwapQuote(
  inSymbol: 'SPIRIT' | 'ESSENCE' | 'MATTER' | 'SUBSTANCE',
  outSymbol: 'SPIRIT' | 'ESSENCE' | 'MATTER' | 'SUBSTANCE',
  inAmountAtoms: bigint,
  feeBps = 30 // 0.30%
): SwapQuoteResult {
  if (inSymbol === outSymbol) {
    return {
      inSymbol,
      outSymbol,
      inAmount: inAmountAtoms,
      outAmount: inAmountAtoms,
      feeAmount: 0n,
      feeBps: 0,
      effectiveRate: 1.0,
      priceImpactPct: 0,
      inFormatted: formatEsmsAtoms(inAmountAtoms),
      outFormatted: formatEsmsAtoms(inAmountAtoms),
      feeFormatted: '0.0000',
      invariantRatio: 1.0,
    };
  }

  const inCoin = CANONICAL_COINS[inSymbol];
  const outCoin = CANONICAL_COINS[outSymbol];

  const reserveIn = inCoin.baseReserve;
  const reserveOut = outCoin.baseReserve;

  const feeAmount = (inAmountAtoms * BigInt(feeBps) + 9999n) / 10000n;
  const inWithFee = inAmountAtoms - feeAmount;

  const numerator = reserveOut * inWithFee;
  const denominator = reserveIn + inWithFee;
  const outAmount = denominator > 0n ? numerator / denominator : 0n;

  const effectiveRate = Number(outAmount) / (Number(inAmountAtoms) || 1);
  const spotRate = Number(reserveOut) / Number(reserveIn);
  const priceImpactPct = spotRate > 0 ? Math.max(0, ((spotRate - effectiveRate) / spotRate) * 100) : 0;

  const invariantBefore = reserveIn * reserveOut;
  const invariantAfter = (reserveIn + inAmountAtoms) * (reserveOut - outAmount);
  const invariantRatio = Number(invariantAfter) / Number(invariantBefore || 1n);

  return {
    inSymbol,
    outSymbol,
    inAmount: inAmountAtoms,
    outAmount,
    feeAmount,
    feeBps,
    effectiveRate,
    priceImpactPct,
    inFormatted: formatEsmsAtoms(inAmountAtoms),
    outFormatted: formatEsmsAtoms(outAmount),
    feeFormatted: formatEsmsAtoms(feeAmount),
    invariantRatio,
  };
}
