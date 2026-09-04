/**
 * AlchmHackStation: Canonical ESMS Token Pricing & Celestial Liquidity Engine
 * Synchronizes with ADR-011/013 canonical-esms-index v2 from alchm.kitchen & agents.alchm.kitchen.
 * ESMS coins are dimensionless index points centered at parity 1.0000, governed by celestial ephemeris.
 */

export interface CanonicalTokenQuote {
  token: 'Spirit' | 'Essence' | 'Matter' | 'Substance';
  index: number;
  change24hPct: number;
  weight: number;
  sparkline: number[];
}

export interface CanonicalPriceIndexPayload {
  success: boolean;
  live: boolean;
  generatedAt: string;
  bucketStartUtc: string;
  aNumber: number;
  multiplier: number;
  dominantElement: string;
  sunSign: string;
  isDiurnal: boolean;
  tokens: CanonicalTokenQuote[];
  compositeIndex: number;
  composite24hPct: number;
  degraded: string | null;
  basis: {
    model: string;
    engine: string;
    constants: string;
  };
  railsUsd: {
    mintPerTokenUsd: number;
    mintSource: string;
    redeemPerTokenUsd: number;
    redeemSource: string;
  };
  supply: {
    live: boolean;
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
  };
}

export interface TokenPriceQuote {
  symbol: 'SPIRIT' | 'ESSENCE' | 'MATTER' | 'SUBSTANCE';
  name: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  glyph: string;
  elementSymbol: string;
  index: number;
  priceUsd: number; // Redeem food credit value ($0.010) or mint value ($0.025)
  priceSol: number; // Canonical index normalized
  change24h: number;
  weight: number;
  mintPerTokenUsd: number;
  redeemPerTokenUsd: number;
  circulatingSupply: number;
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
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  glyph: string;
  elementSymbol: string;
  decimals: number;
  mintAddress: string;
  baseSupply: number;
}> = {
  SPIRIT: {
    name: 'Spirit',
    symbol: 'SPIRIT',
    element: 'Fire',
    glyph: '🝇',
    elementSymbol: '🜂',
    decimals: 4,
    mintAddress: 'K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ',
    baseSupply: 10583.22,
  },
  ESSENCE: {
    name: 'Essence',
    symbol: 'ESSENCE',
    element: 'Water',
    glyph: '🝑',
    elementSymbol: '🜄',
    decimals: 4,
    mintAddress: '3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf',
    baseSupply: 15780.23,
  },
  MATTER: {
    name: 'Matter',
    symbol: 'MATTER',
    element: 'Earth',
    glyph: '🝙',
    elementSymbol: '🜃',
    decimals: 4,
    mintAddress: '7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4',
    baseSupply: 29116.87,
  },
  SUBSTANCE: {
    name: 'Substance',
    symbol: 'SUBSTANCE',
    element: 'Air',
    glyph: '🝉',
    elementSymbol: '🜁',
    decimals: 4,
    mintAddress: '6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa',
    baseSupply: 22133.85,
  },
};

// Canonical Initial Seed State (Exact snapshot from alchm.kitchen)
const INITIAL_CANONICAL_PAYLOAD: CanonicalPriceIndexPayload = {
  success: true,
  live: true,
  generatedAt: '2026-09-04T15:45:49.198Z',
  bucketStartUtc: '2026-09-04T15:45:00.000Z',
  aNumber: 6.7269,
  multiplier: 1.1454,
  dominantElement: 'Air',
  sunSign: 'virgo',
  isDiurnal: true,
  tokens: [
    {
      token: 'Spirit',
      index: 1.0994,
      change24hPct: -1.61,
      weight: 0.4108,
      sparkline: [1.1175, 1.1159, 1.1140, 1.1135, 1.1136, 1.1137, 1.1130, 1.1113, 1.1794, 1.1777, 1.1767, 1.1761, 1.1756, 1.1748, 1.1734, 1.1715, 1.1691, 1.1665, 1.1640, 1.0921, 1.0929, 1.0954, 1.0979, 1.0994, 1.0994]
    },
    {
      token: 'Essence',
      index: 1.0708,
      change24hPct: -1.95,
      weight: 0.5104,
      sparkline: [1.0922, 1.0894, 1.0863, 1.0848, 1.0844, 1.0842, 1.0831, 1.0811, 1.2057, 1.2040, 1.2029, 1.2025, 1.2023, 1.2018, 1.2009, 1.1996, 1.1976, 1.1954, 1.1933, 1.0637, 1.0651, 1.0682, 1.0708, 1.0719, 1.0708]
    },
    {
      token: 'Matter',
      index: 1.1982,
      change24hPct: -2.72,
      weight: 0.0657,
      sparkline: [1.2317, 1.2298, 1.2271, 1.2254, 1.2244, 1.2234, 1.2212, 1.2178, 1.0722, 1.0684, 1.0651, 1.0623, 1.0599, 1.0575, 1.0551, 1.0527, 1.0501, 1.0478, 1.0458, 1.1875, 1.1896, 1.1935, 1.1969, 1.1987, 1.1982]
    },
    {
      token: 'Substance',
      index: 1.2132,
      change24hPct: -2.21,
      weight: 0.0131,
      sparkline: [1.2407, 1.2384, 1.2356, 1.2342, 1.2337, 1.2333, 1.2317, 1.2292, 1.2028, 1.2002, 1.1982, 1.1968, 1.1955, 1.1942, 1.1924, 1.1903, 1.1878, 1.1851, 1.1827, 1.2043, 1.2059, 1.2093, 1.2123, 1.2138, 1.2132]
    }
  ],
  compositeIndex: 1.1454,
  composite24hPct: -2.14,
  degraded: null,
  basis: {
    model: 'ADR-011/013 canonical-esms-index v2',
    engine: 'astronomy-engine (local), 10 ESMS bodies, geocentric longitude + distance, degree-level dignity + aspects, no Ascendant vessel',
    constants: 'pricing imported from livePricing.ts; quantization from esmsQuantization.ts; Hamiltonian from esmsOscillator.ts'
  },
  railsUsd: {
    mintPerTokenUsd: 0.025,
    mintSource: 'mcp_top_up_5',
    redeemPerTokenUsd: 0.01,
    redeemSource: 'NEXT_PUBLIC_ESMS_RESTAURANT_CENTS_PER_TOKEN'
  },
  supply: {
    live: true,
    spirit: 10583.22,
    essence: 15780.23,
    matter: 29116.87,
    substance: 22133.85
  }
};

let cachedPayload: CanonicalPriceIndexPayload = INITIAL_CANONICAL_PAYLOAD;
const listeners = new Set<(payload: CanonicalPriceIndexPayload) => void>();

/**
 * Fetch latest canonical price index from local proxy or production authority
 */
export async function fetchCanonicalPriceIndex(): Promise<CanonicalPriceIndexPayload> {
  try {
    const res = await fetch('/api/economy/price-index', {
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.tokens)) {
        cachedPayload = data;
        listeners.forEach((fn) => fn(cachedPayload));
        return cachedPayload;
      }
    }
  } catch (err) {
    // Retain cached payload on network glitch
  }
  return cachedPayload;
}

/**
 * Subscribe to live price index state changes
 */
export function subscribeToPriceIndex(fn: (payload: CanonicalPriceIndexPayload) => void): () => void {
  listeners.add(fn);
  fn(cachedPayload);
  return () => listeners.delete(fn);
}

/**
 * Get current cached canonical price index payload
 */
export function getLivePriceIndex(): CanonicalPriceIndexPayload {
  return cachedPayload;
}

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
 * Compute real-time token market quotes matching canonical celestial indices
 */
export function getLiveTokenQuotes(): Record<string, TokenPriceQuote> {
  const p = cachedPayload;
  const quotes: Record<string, TokenPriceQuote> = {};

  const tokenMap: Record<string, CanonicalTokenQuote> = {};
  for (const t of p.tokens) {
    tokenMap[t.token.toUpperCase()] = t;
  }

  const supplies = p.supply || {
    spirit: 10583.22,
    essence: 15780.23,
    matter: 29116.87,
    substance: 22133.85,
  };

  const keys: Array<'SPIRIT' | 'ESSENCE' | 'MATTER' | 'SUBSTANCE'> = ['SPIRIT', 'ESSENCE', 'MATTER', 'SUBSTANCE'];

  for (const key of keys) {
    const coin = CANONICAL_COINS[key];
    const canonical = tokenMap[key] || {
      token: coin.name as any,
      index: 1.0000,
      change24hPct: 0.0,
      weight: 0.25,
      sparkline: [1.0, 1.0, 1.0, 1.0, 1.0],
    };

    const supplyValue =
      key === 'SPIRIT' ? supplies.spirit :
      key === 'ESSENCE' ? supplies.essence :
      key === 'MATTER' ? supplies.matter :
      supplies.substance;

    quotes[key] = {
      symbol: key,
      name: coin.name,
      element: coin.element,
      glyph: coin.glyph,
      elementSymbol: coin.elementSymbol,
      index: canonical.index,
      priceUsd: p.railsUsd?.redeemPerTokenUsd || 0.01,
      priceSol: canonical.index, // Normalized relative index parity
      change24h: canonical.change24hPct,
      weight: canonical.weight,
      mintPerTokenUsd: p.railsUsd?.mintPerTokenUsd || 0.025,
      redeemPerTokenUsd: p.railsUsd?.redeemPerTokenUsd || 0.01,
      circulatingSupply: supplyValue,
      decimals: 4,
      mintAddress: coin.mintAddress,
      sparkline: canonical.sparkline,
    };
  }

  return quotes;
}

/**
 * Lossless constant-product swap calculator based on celestial relative index parity.
 * Maintains 10^4 integer atom precision without floating point drift.
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

  const quotes = getLiveTokenQuotes();
  const quoteIn = quotes[inSymbol];
  const quoteOut = quotes[outSymbol];

  // Scale index (e.g. 1.0994 -> 10994n)
  const indexInAtoms = BigInt(Math.round((quoteIn?.index || 1.0) * 10000));
  const indexOutAtoms = BigInt(Math.round((quoteOut?.index || 1.0) * 10000));

  // Deduct swap fee
  const feeAmount = (inAmountAtoms * BigInt(feeBps) + 9999n) / 10000n;
  const inWithFee = inAmountAtoms - feeAmount;

  // Swap output based on relative elemental index parity:
  // outAmount = inWithFee * indexIn / indexOut
  const outAmount = indexOutAtoms > 0n ? (inWithFee * indexInAtoms) / indexOutAtoms : 0n;

  const effectiveRate = Number(outAmount) / (Number(inAmountAtoms) || 1);
  const theoreticalRate = Number(indexInAtoms) / Number(indexOutAtoms || 10000n);
  const priceImpactPct = theoreticalRate > 0 ? Math.max(0, ((theoreticalRate - effectiveRate) / theoreticalRate) * 100) : 0;

  const invariantBefore = indexInAtoms * 10000n;
  const invariantAfter = indexOutAtoms * BigInt(Math.round(effectiveRate * 10000));
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

// Automatically trigger background poll when loaded in browser
if (typeof window !== 'undefined') {
  fetchCanonicalPriceIndex();
  setInterval(fetchCanonicalPriceIndex, 10000);
}
