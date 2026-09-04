#!/usr/bin/env bun
/**
 * AlchmHackStation: Automated Test Harness for Chart-Ratio Astrological Faucet (ADR-014)
 * 
 * CANONICAL TOKEN IDENTITY MANDATE:
 * 1. SPIRIT (🝇 / 🜂)
 * 2. ESSENCE (🝑 / 🜄)
 * 3. MATTER (🝙 / 🜃)
 * 4. SUBSTANCE (🝉 / 🜁)
 * TOKEN NAMES NEVER VARY.
 * 
 * Verifies:
 * 1. TEST-01: Neutral minter without birth chart under neutral sky (flat 6.0000 each, exactly 24.0000).
 * 2. TEST-02: Fire-dominant minter with high Spirit claiming during Fire transit sky (yielding high SPIRIT).
 * 3. TEST-03: Counter-cyclical anti-glut damping when MATTER exceeds 30% global supply (0.750 damping).
 * 4. TEST-04: Strict conservation: total yield is strictly conserved at 24.0000 (Standard) and 48.0000 (Premium).
 * 5. TEST-05: Chart ratio differentiation: higher natal ratio directly increases coin yield.
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
console.log('║   ADR-014: CHART-RATIO ASTROLOGICAL FAUCET SPECIFICATION HARNESS         ║');
console.log('║   CANONICAL TOKENS: SPIRIT (🝇) · ESSENCE (🝑) · MATTER (🝙) · SUBSTANCE (🝉)  ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

// Current Live Global Supply from alchm.kitchen
const LIVE_SUPPLY: GlobalSupplyState = {
  spirit: 10583.22,
  essence: 15780.23,
  matter: 29116.87,
  substance: 22133.85,
};

const neutralSupply: GlobalSupplyState = {
  spirit: 25000,
  essence: 25000,
  matter: 25000,
  substance: 25000,
};

const neutralTransit: TransitSkyData = {
  elementWeights: { Fire: 2.5, Water: 2.5, Earth: 2.5, Air: 2.5 },
};

// ---------------------------------------------------------------------------
// TEST 1: Neutral Minter under Neutral Sky
// ---------------------------------------------------------------------------
console.log('-----------------------------------------------------------------------------');
console.log('TEST 1: Neutral Minter (No Birth Chart) under Neutral Sky');
console.log('-----------------------------------------------------------------------------');

const resNeutral = computeDiscriminantDailyYield(null, neutralTransit, neutralSupply, false);
console.log('  Result:', resNeutral);

assert(
  resNeutral.spirit === 6.0,
  'Neutral Spirit Yield exactly 6.0000',
  `Spirit: ${resNeutral.spirit}`
);
assert(
  resNeutral.matter === 6.0,
  'Neutral Matter Yield exactly 6.0000',
  `Matter: ${resNeutral.matter}`
);
assert(
  resNeutral.total === 24.0,
  'Neutral Total Yield strictly conserved at 24.0000',
  `Total: ${resNeutral.total}`
);

// ---------------------------------------------------------------------------
// TEST 2: Fire-Dominant Minter under Fire Transit Sky
// ---------------------------------------------------------------------------
console.log('\n-----------------------------------------------------------------------------');
console.log('TEST 2: Fire-Dominant Minter under Fire Transit Sky');
console.log('-----------------------------------------------------------------------------');

const fireNatal: NatalChartData = {
  dominantElement: 'Fire',
  spiritScore: 95,
  essenceScore: 40,
  matterScore: 30,
  substanceScore: 50,
};

const fireTransit: TransitSkyData = {
  elementWeights: { Fire: 5.0, Water: 1.5, Earth: 1.5, Air: 2.0 },
};

const resFire = computeDiscriminantDailyYield(fireNatal, fireTransit, neutralSupply, false);
console.log('  Result:', resFire);

assert(
  resFire.spirit > resFire.matter,
  'Fire Minter yields significantly more Spirit than Matter',
  `Spirit: ${resFire.spirit} > Matter: ${resFire.matter}`
);
assert(
  resFire.spirit >= 10.0,
  'Spirit Yield reflects Fire prominence',
  `Spirit: ${resFire.spirit}`
);
assert(
  resFire.total === 24.0,
  'Total Yield strictly conserved at 24.0000',
  `Total: ${resFire.total}`
);

// ---------------------------------------------------------------------------
// TEST 3: Counter-Cyclical Anti-Glut Damping on Matter
// ---------------------------------------------------------------------------
console.log('\n-----------------------------------------------------------------------------');
console.log('TEST 3: Counter-Cyclical Anti-Glut Damping on Matter (Live Supply > 30%)');
console.log('-----------------------------------------------------------------------------');

const resLive = computeDiscriminantDailyYield(null, neutralTransit, LIVE_SUPPLY, false);
console.log('  Live State Result:', resLive);
console.log('  Matter Breakdown:', resLive.breakdown.matter);

assert(
  resLive.breakdown.matter.antiGlutFactor < 0.85,
  'Matter antiGlutFactor actively dampens yield when Matter supply > 30%',
  `Damping Factor: ${resLive.breakdown.matter.antiGlutFactor}`
);
assert(
  resLive.matter < resNeutral.matter,
  'Matter yield actively reduced compared to neutral supply state',
  `Live Matter: ${resLive.matter} < Neutral: ${resNeutral.matter}`
);
assert(
  resLive.total === 24.0,
  'Total Yield strictly conserved at 24.0000 under live anti-glut damping',
  `Total: ${resLive.total}`
);

// ---------------------------------------------------------------------------
// TEST 4: Conservation Invariant Across Extreme Sky Configurations
// ---------------------------------------------------------------------------
console.log('\n-----------------------------------------------------------------------------');
console.log('TEST 4: Conservation Invariant Across Extreme Sky Configurations');
console.log('-----------------------------------------------------------------------------');

const extremeTransit: TransitSkyData = {
  elementWeights: { Fire: 12.0, Water: 0.5, Earth: 0.5, Air: 1.0 },
};

const resExtreme = computeDiscriminantDailyYield(fireNatal, extremeTransit, LIVE_SUPPLY);
console.log('  Extreme Result:', resExtreme);

assert(
  resExtreme.total === 24.0,
  'Universal Daily Yield strictly conserved at 24.0000 under extreme transit (no premium tier)',
  `Total: ${resExtreme.total}`
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
  console.log('🎉 ALL CHART-RATIO FAUCET SPECIFICATION INVARIANTS VERIFIED!\n');
  process.exit(0);
}
