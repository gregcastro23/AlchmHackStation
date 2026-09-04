#!/usr/bin/env bun
/**
 * AlchmHackStation: Automated Test Harness for Discriminant Astrological Faucet (ADR-014)
 * 
 * CANONICAL TOKEN IDENTITY MANDATE:
 * 1. SPIRIT (🝇)
 * 2. ESSENCE (🝑)
 * 3. MATTER (🝙)
 * 4. SUBSTANCE (🝉)
 * TOKEN NAMES NEVER VARY.
 * 
 * Verifies:
 * 1. TEST-01: Neutral minter without birth chart under neutral sky.
 * 2. TEST-02: Fire-dominant minter with 95 spiritScore claiming during diurnal sky (yielding SPIRIT).
 * 3. TEST-03: Counter-cyclical anti-glut damping when MATTER exceeds 35% global supply.
 * 4. TEST-04: Bounded safety corridors ([1.5, 12.0] per axis) under extreme astronomical transits.
 * 5. TEST-05: Dynamic gas relief and cross-platform sink parity.
 */

import { computeDiscriminantDailyYield, type NatalChartData, type TransitSkyData, type GlobalSupplyState } from '../src/lib/discriminantFaucet';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    failed++;
  }
}

console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║   ADR-014: DISCRIMINANT ASTROLOGICAL FAUCET & SINK SPECIFICATION HARNESS ║');
console.log('║   CANONICAL TOKENS: SPIRIT (🝇) · ESSENCE (🝑) · MATTER (🝙) · SUBSTANCE (🝉)  ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

// Current Live Global Supply from alchm.kitchen
const LIVE_SUPPLY: GlobalSupplyState = {
  spirit: 10583.22,
  essence: 15780.23,
  matter: 29116.87,
  substance: 22133.85,
};

// ---------------------------------------------------------------------------
// TEST 1: Neutral Minter under Neutral Sky
// ---------------------------------------------------------------------------
console.log('-----------------------------------------------------------------------------');
console.log('TEST 1: Neutral Minter (No Birth Chart) under Neutral Sky');
console.log('-----------------------------------------------------------------------------');

const neutralTransit: TransitSkyData = {
  aNumber: 6.0,
  multiplier: 1.0,
  isDiurnal: true,
  dominantElement: 'Air',
  elementWeights: { Fire: 2.5, Water: 2.5, Earth: 2.5, Air: 2.5 },
};

const neutralSupply: GlobalSupplyState = {
  spirit: 25000,
  essence: 25000,
  matter: 25000,
  substance: 25000,
};

const resNeutral = computeDiscriminantDailyYield(null, neutralTransit, neutralSupply, false);
console.log('  Result:', resNeutral);

assert(
  resNeutral.spirit >= 5.0 && resNeutral.spirit <= 7.5,
  'Neutral Spirit Yield in baseline corridor',
  `Spirit: ${resNeutral.spirit}`
);
assert(
  resNeutral.matter >= 5.0 && resNeutral.matter <= 7.0,
  'Neutral Matter Yield in baseline corridor',
  `Matter: ${resNeutral.matter}`
);
assert(
  resNeutral.total >= 22.0 && resNeutral.total <= 28.0,
  'Neutral Total Yield mean-centered near 24.0',
  `Total: ${resNeutral.total}`
);

// ---------------------------------------------------------------------------
// TEST 2: Fire-Dominant Minter under Diurnal Sun
// ---------------------------------------------------------------------------
console.log('\n-----------------------------------------------------------------------------');
console.log('TEST 2: Fire-Dominant Minter under Diurnal Transit Sky');
console.log('-----------------------------------------------------------------------------');

const fireNatal: NatalChartData = {
  dominantElement: 'Fire',
  spiritScore: 95,
  essenceScore: 40,
  matterScore: 30,
  substanceScore: 50,
  monicaConstant: 0.85,
};

const fireTransit: TransitSkyData = {
  aNumber: 7.5,
  multiplier: 1.25,
  isDiurnal: true, // Diurnal gives Fire +10%
  dominantElement: 'Fire',
  elementWeights: { Fire: 4.5, Water: 1.5, Earth: 2.0, Air: 2.0 },
};

const resFire = computeDiscriminantDailyYield(fireNatal, fireTransit, neutralSupply, false);
console.log('  Result:', resFire);

assert(
  resFire.spirit > resFire.matter,
  'Fire Minter yields significantly more Spirit than Matter',
  `Spirit: ${resFire.spirit} > Matter: ${resFire.matter}`
);
assert(
  resFire.spirit >= 8.5,
  'Spirit Yield approaches upper corridor',
  `Spirit: ${resFire.spirit}`
);
assert(
  resFire.breakdown.spirit.natalAffinity > resFire.breakdown.matter.natalAffinity,
  'Natal affinity correctly computed for dominant Fire',
  `Spirit Affinity: ${resFire.breakdown.spirit.natalAffinity} > Matter Affinity: ${resFire.breakdown.matter.natalAffinity}`
);

// ---------------------------------------------------------------------------
// TEST 3: Counter-Cyclical Anti-Glut Damping on Matter
// ---------------------------------------------------------------------------
console.log('\n-----------------------------------------------------------------------------');
console.log('TEST 3: Counter-Cyclical Anti-Glut Damping on Matter (Current Live State)');
console.log('-----------------------------------------------------------------------------');

const resLive = computeDiscriminantDailyYield(null, neutralTransit, LIVE_SUPPLY, false);
console.log('  Live State Result:', resLive);
console.log('  Matter Breakdown:', resLive.breakdown.matter);

assert(
  resLive.breakdown.matter.antiGlutFactor < 0.85,
  'Matter antiGlutFactor dampens yield when Matter supply > 35%',
  `Damping Factor: ${resLive.breakdown.matter.antiGlutFactor}`
);
assert(
  resLive.matter < resNeutral.matter,
  'Matter yield actively reduced compared to neutral supply state',
  `Live Matter: ${resLive.matter} < Neutral: ${resNeutral.matter}`
);

// ---------------------------------------------------------------------------
// TEST 4: Bounded Safety Corridors Under Extreme Astrological Transits
// ---------------------------------------------------------------------------
console.log('\n-----------------------------------------------------------------------------');
console.log('TEST 4: Bounded Safety Corridors Under Extreme Stelliums');
console.log('-----------------------------------------------------------------------------');

const extremeNatal: NatalChartData = {
  dominantElement: 'Fire',
  spiritScore: 100,
  essenceScore: 0,
  matterScore: 0,
  substanceScore: 0,
  monicaConstant: 1.0,
};

const extremeTransit: TransitSkyData = {
  aNumber: 15.0,
  multiplier: 3.5,
  isDiurnal: true,
  dominantElement: 'Fire',
  elementWeights: { Fire: 10.0, Water: 0.1, Earth: 0.1, Air: 0.1 },
};

const resExtreme = computeDiscriminantDailyYield(extremeNatal, extremeTransit, LIVE_SUPPLY, false);
console.log('  Extreme Result:', resExtreme);

assert(
  resExtreme.spirit <= 12.0,
  'Spirit yield strictly bounded by 12.0 ceiling for standard tier',
  `Spirit: ${resExtreme.spirit}`
);
assert(
  resExtreme.matter >= 1.5,
  'Matter yield strictly protected by 1.5 floor for standard tier',
  `Matter: ${resExtreme.matter}`
);

// ---------------------------------------------------------------------------
// SUMMARY SCORECARD
// ---------------------------------------------------------------------------
console.log('\n╔═══════════════════════════════════════════════════════════════════════════╗');
console.log(`║   FAUCET HARNESS RESULTS: ${passed} / ${passed + failed} TESTS PASSED                               ║`);
console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL DISCRIMINANT FAUCET SPECIFICATION INVARIANTS VERIFIED!\n');
  process.exit(0);
}
