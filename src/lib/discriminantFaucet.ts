/**
 * AlchmHackStation: Canonical Discriminant Astrological Faucet Engine (ADR-014)
 * 
 * Clean Chart-Ratio Formulation:
 * Evaluates the minter's natal chart ratio (E / Sp / M / Su),
 * modulated by current celestial moment transit weights w_i(t)
 * and counter-cyclical anti-glut damping Omega_i.
 * 
 * Strictly conserved at 12.0000 tokens universally for all users.
 * No artificial sect hacks or wave functions.
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
  aNumber?: number;
  multiplier?: number;
  isDiurnal?: boolean;
  dominantElement?: 'Fire' | 'Water' | 'Earth' | 'Air' | string;
  elementWeights: Record<'Fire' | 'Water' | 'Earth' | 'Air', number>;
}

export interface GlobalSupplyState {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface DiscriminantYieldBreakdown {
  natalRatio: number;
  transitRatio: number;
  antiGlutFactor: number;
  finalYield: number;
  skyDominance?: number;
  natalAffinity?: number;
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
 * Computes discriminant daily yield across the 4 elemental axes using the
 * proportional chart ratio formulation:
 * Y_i = Y_total * (r_i(N) * w_i(t) * Omega_i) / sum_j(r_j(N) * w_j(t) * Omega_j)
 */
export function computeDiscriminantDailyYield(
  natal: NatalChartData | null | undefined,
  transit: TransitSkyData,
  supply: GlobalSupplyState
): DiscriminantYieldResult {
  const TOTAL_YIELD = 12.0;

  // 1. Natal Chart Ratio Vector r_i(N)
  const natalRaw = {
    spirit: typeof natal?.spiritScore === 'number' && natal.spiritScore > 0 ? natal.spiritScore : 0,
    essence: typeof natal?.essenceScore === 'number' && natal.essenceScore > 0 ? natal.essenceScore : 0,
    matter: typeof natal?.matterScore === 'number' && natal.matterScore > 0 ? natal.matterScore : 0,
    substance: typeof natal?.substanceScore === 'number' && natal.substanceScore > 0 ? natal.substanceScore : 0,
  };
  const natalSum = natalRaw.spirit + natalRaw.essence + natalRaw.matter + natalRaw.substance;
  
  const natalRatio = natalSum > 0 ? {
    spirit: natalRaw.spirit / natalSum,
    essence: natalRaw.essence / natalSum,
    matter: natalRaw.matter / natalSum,
    substance: natalRaw.substance / natalSum,
  } : {
    spirit: 0.25,
    essence: 0.25,
    matter: 0.25,
    substance: 0.25,
  };

  // 2. Transit Sky Weights w_i(t)
  const tw = transit.elementWeights;
  const transitTotal = (tw.Fire || 0) + (tw.Water || 0) + (tw.Earth || 0) + (tw.Air || 0) || 1;
  const transitRatio = {
    spirit: (tw.Fire || 0) / transitTotal,
    essence: (tw.Water || 0) / transitTotal,
    matter: (tw.Earth || 0) / transitTotal,
    substance: (tw.Air || 0) / transitTotal,
  };

  // 3. Counter-Cyclical Anti-Glut Damping Omega_i
  const totalSupply = supply.spirit + supply.essence + supply.matter + supply.substance || 1;
  const getOmega = (supplyVal: number) => {
    const share = supplyVal / totalSupply;
    if (share > 0.30) {
      return Math.max(0.65, 1.0 - 2.0 * (share - 0.25));
    }
    return 1.0;
  };

  const omega = {
    spirit: getOmega(supply.spirit),
    essence: getOmega(supply.essence),
    matter: getOmega(supply.matter),
    substance: getOmega(supply.substance),
  };

  // 4. Combined Weighting Share & Normalization
  const weighted = {
    spirit: natalRatio.spirit * transitRatio.spirit * omega.spirit,
    essence: natalRatio.essence * transitRatio.essence * omega.essence,
    matter: natalRatio.matter * transitRatio.matter * omega.matter,
    substance: natalRatio.substance * transitRatio.substance * omega.substance,
  };
  const totalWeighted = weighted.spirit + weighted.essence + weighted.matter + weighted.substance || 1;

  // 5. Conserved Daily Allocation (Quantized to 4 decimal places)
  let spirit = Math.round((TOTAL_YIELD * (weighted.spirit / totalWeighted)) * 10000) / 10000;
  let essence = Math.round((TOTAL_YIELD * (weighted.essence / totalWeighted)) * 10000) / 10000;
  let matter = Math.round((TOTAL_YIELD * (weighted.matter / totalWeighted)) * 10000) / 10000;
  let substance = Math.round((TOTAL_YIELD * (weighted.substance / totalWeighted)) * 10000) / 10000;

  // Exact residual conservation adjustment
  const unroundedTotal = spirit + essence + matter + substance;
  const diff = Math.round((TOTAL_YIELD - unroundedTotal) * 10000) / 10000;
  if (Math.abs(diff) > 0 && Math.abs(diff) < 0.01) {
    spirit = Math.round((spirit + diff) * 10000) / 10000;
  }

  return {
    spirit,
    essence,
    matter,
    substance,
    total: TOTAL_YIELD,
    breakdown: {
      spirit: {
        natalRatio: Math.round(natalRatio.spirit * 10000) / 10000,
        transitRatio: Math.round(transitRatio.spirit * 10000) / 10000,
        antiGlutFactor: Math.round(omega.spirit * 1000) / 1000,
        finalYield: spirit,
        skyDominance: Math.round(transitRatio.spirit * 10000) / 10000,
        natalAffinity: Math.round(natalRatio.spirit * 10000) / 10000,
      },
      essence: {
        natalRatio: Math.round(natalRatio.essence * 10000) / 10000,
        transitRatio: Math.round(transitRatio.essence * 10000) / 10000,
        antiGlutFactor: Math.round(omega.essence * 1000) / 1000,
        finalYield: essence,
        skyDominance: Math.round(transitRatio.essence * 10000) / 10000,
        natalAffinity: Math.round(natalRatio.essence * 10000) / 10000,
      },
      matter: {
        natalRatio: Math.round(natalRatio.matter * 10000) / 10000,
        transitRatio: Math.round(transitRatio.matter * 10000) / 10000,
        antiGlutFactor: Math.round(omega.matter * 1000) / 1000,
        finalYield: matter,
        skyDominance: Math.round(transitRatio.matter * 10000) / 10000,
        natalAffinity: Math.round(natalRatio.matter * 10000) / 10000,
      },
      substance: {
        natalRatio: Math.round(natalRatio.substance * 10000) / 10000,
        transitRatio: Math.round(transitRatio.substance * 10000) / 10000,
        antiGlutFactor: Math.round(omega.substance * 1000) / 1000,
        finalYield: substance,
        skyDominance: Math.round(transitRatio.substance * 10000) / 10000,
        natalAffinity: Math.round(natalRatio.substance * 10000) / 10000,
      },
    },
  };
}
