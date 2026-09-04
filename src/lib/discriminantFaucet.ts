/**
 * AlchmHackStation: Canonical Discriminant Astrological Faucet Engine (ADR-014)
 * Evaluates current celestial moment (t), minter natal chart (N), and global supply damping
 */

export interface NatalChartData {
  dominantElement?: 'Fire' | 'Water' | 'Earth' | 'Air' | string | null;
  spiritScore?: number | null;
  essenceScore?: number | null;
  matterScore?: number | null;
  substanceScore?: number | null;
  monicaConstant?: number | null;
}

export interface TransitSkyData {
  aNumber: number;
  multiplier: number;
  isDiurnal: boolean;
  dominantElement: 'Fire' | 'Water' | 'Earth' | 'Air' | string;
  elementWeights: Record<'Fire' | 'Water' | 'Earth' | 'Air', number>;
}

export interface GlobalSupplyState {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface DiscriminantYieldBreakdown {
  skyDominance: number;
  natalAffinity: number;
  antiGlutFactor: number;
  finalYield: number;
}

export interface DiscriminantYieldResult {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  total: number;
  breakdown: {
    spirit: DiscriminantYieldBreakdown;
    essence: DiscriminantYieldBreakdown;
    matter: DiscriminantYieldBreakdown;
    substance: DiscriminantYieldBreakdown;
  };
}

/**
 * Computes discriminant daily yield across the 4 elemental axes:
 * Y_i = BASE * D_i(t) * A_i(N) * Omega_i * Tier
 */
export function computeDiscriminantDailyYield(
  natal: NatalChartData | null | undefined,
  transit: TransitSkyData,
  supply: GlobalSupplyState,
  isPremium = false
): DiscriminantYieldResult {
  const BASE_AXIS = 6.0;
  const tierMultiplier = isPremium ? 2.0 : 1.0;
  const axes = [
    { key: 'spirit' as const, element: 'Fire' as const, score: natal?.spiritScore },
    { key: 'essence' as const, element: 'Water' as const, score: natal?.essenceScore },
    { key: 'matter' as const, element: 'Earth' as const, score: natal?.matterScore },
    { key: 'substance' as const, element: 'Air' as const, score: natal?.substanceScore },
  ];

  const totalSupply = supply.spirit + supply.essence + supply.matter + supply.substance || 1;
  const totalWeight = Object.values(transit.elementWeights).reduce((a, b) => a + b, 0) || 1;

  const result: Record<string, number> = {};
  const breakdown: Record<string, DiscriminantYieldBreakdown> = {};

  for (const axis of axes) {
    // 1. Transit Sky Dominance (0.60 .. 1.80)
    const weightShare = (transit.elementWeights[axis.element] || 0) / totalWeight;
    let skyDominance = 0.60 + weightShare * 1.20;
    
    // Diurnal / Nocturnal sect bonus
    if (transit.isDiurnal && (axis.element === 'Fire' || axis.element === 'Air')) {
      skyDominance *= 1.10;
    } else if (!transit.isDiurnal && (axis.element === 'Water' || axis.element === 'Earth')) {
      skyDominance *= 1.10;
    }
    skyDominance = Math.max(0.60, Math.min(1.80, skyDominance));

    // 2. Natal Chart Affinity (0.50 .. 2.00)
    let natalAffinity = 0.70;
    if (natal) {
      if (typeof axis.score === 'number' && Number.isFinite(axis.score)) {
        natalAffinity += Math.max(0, Math.min(1, axis.score / 100)) * 0.50;
      }
      if (natal.dominantElement && natal.dominantElement.toLowerCase() === axis.element.toLowerCase()) {
        natalAffinity += 0.30;
      }
      if (typeof natal.monicaConstant === 'number') {
        natalAffinity += Math.max(0, Math.min(1, natal.monicaConstant)) * 0.20;
      }
    } else {
      natalAffinity = 1.0; // Neutral default
    }
    natalAffinity = Math.max(0.50, Math.min(2.00, natalAffinity));

    // 3. Counter-Cyclical Anti-Glut Damping (0.65 .. 1.00)
    const supplyShare = supply[axis.key] / totalSupply;
    let antiGlutFactor = 1.0;
    if (supplyShare > 0.30) {
      antiGlutFactor = Math.max(0.65, 1.0 - 2.0 * (supplyShare - 0.25));
    }

    // Combine & Clamp to Safety Corridors
    let computedYield = BASE_AXIS * skyDominance * natalAffinity * antiGlutFactor * tierMultiplier;
    
    // Bounds: 1.5 to 12.0 for standard tier (3.0 to 24.0 for premium)
    const minBound = 1.5 * tierMultiplier;
    const maxBound = 12.0 * tierMultiplier;
    computedYield = Math.max(minBound, Math.min(maxBound, computedYield));
    
    // Quantize to 4 decimal places (10^4 integer atoms)
    const finalYield = Math.floor(computedYield * 10000) / 10000;
    result[axis.key] = finalYield;

    breakdown[axis.key] = {
      skyDominance: Math.round(skyDominance * 1000) / 1000,
      natalAffinity: Math.round(natalAffinity * 1000) / 1000,
      antiGlutFactor: Math.round(antiGlutFactor * 1000) / 1000,
      finalYield,
    };
  }

  const spirit = result.spirit ?? 6.0;
  const essence = result.essence ?? 6.0;
  const matter = result.matter ?? 6.0;
  const substance = result.substance ?? 6.0;

  return {
    spirit,
    essence,
    matter,
    substance,
    total: Math.round((spirit + essence + matter + substance) * 10000) / 10000,
    breakdown: {
      spirit: breakdown.spirit!,
      essence: breakdown.essence!,
      matter: breakdown.matter!,
      substance: breakdown.substance!,
    },
  };
}
