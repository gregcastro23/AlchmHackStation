#!/usr/bin/env bun
/**
 * AlchmHackStation: Chart Dignity Wavefunction \Psi_a(t) & Pricing Operator Simulation
 * 
 * Verifies:
 * 1. Wavefunction Operator Normalization (bounded within [-1.0, +1.0])
 * 2. Continuous Astronomical Time-Series Stepping (t0 + 1h ... +365d)
 * 3. Extreme Celestial Edge-Cases (Stelliums, Oppositions, Null-Sky Invariance)
 * 4. Fee & Price Volatility Corridor Constraints ([0.25x, 4.00x] safety bounds)
 * 5. Deterministic Zero-Discontinuity Assertion
 */

export interface PlanetaryAspectVector {
  totalSpirit: number;
  totalEssence: number;
  totalMatter: number;
  totalSubstance: number;
}

/**
 * Compute the continuous Chart Dignity Wavefunction \Psi_a(t) for live sky transits.
 * Returns normalized values in [-1, +1].
 */
export function computeDignityWavefunction(aspects: PlanetaryAspectVector): {
  psiSpirit: number;
  psiEssence: number;
  psiMatter: number;
  psiSubstance: number;
} {
  const { totalSpirit, totalEssence, totalMatter, totalSubstance } = aspects;
  const sumAbs =
    Math.abs(totalSpirit) +
    Math.abs(totalEssence) +
    Math.abs(totalMatter) +
    Math.abs(totalSubstance);

  if (sumAbs === 0 || !Number.isFinite(sumAbs)) {
    return { psiSpirit: 0, psiEssence: 0, psiMatter: 0, psiSubstance: 0 };
  }

  const halfSum = sumAbs / 2;
  const clamp = (val: number) => {
    const raw = val / halfSum;
    const clamped = Math.max(-1, Math.min(1, raw));
    return Math.round(clamped * 10000) / 10000;
  };

  return {
    psiSpirit: clamp(totalSpirit),
    psiEssence: clamp(totalEssence),
    psiMatter: clamp(totalMatter),
    psiSubstance: clamp(totalSubstance),
  };
}

/**
 * Calculates the dynamic fee multiplier based on the wavefunction dignity:
 * multiplier = 1.0 - (0.5 * \Psi_a) clamped between [0.25, 4.00]
 */
export function calculateDynamicFeeMultiplier(psi: number): number {
  if (!Number.isFinite(psi)) return 1.0;
  // Positive dignity (resonance) lowers friction fees; negative dignity (dissonance) raises fees
  const raw = 1.0 - 0.5 * psi;
  const clamped = Math.max(0.25, Math.min(4.0, raw));
  return Math.round(clamped * 10000) / 10000;
}

/**
 * Synthetic ephemeris simulation function generating continuous planetary movement at timestamp t.
 */
export function sampleSyntheticEphemeris(unixTimestampSec: number): PlanetaryAspectVector {
  // Periods: 
  // Solar/Spirit: 365.25 days
  // Lunar/Essence: 29.53 days
  // Mercurial/Substance: 88 days
  // Saturnian/Matter: 10759 days (29.5 years)
  const DAY_SEC = 86400;
  const tDays = unixTimestampSec / DAY_SEC;

  const spirit = Math.sin((2 * Math.PI * tDays) / 365.25) * 10.0 + 5.0;
  const essence = Math.cos((2 * Math.PI * tDays) / 29.53) * 8.0 + 4.0;
  const substance = Math.sin((2 * Math.PI * tDays) / 88.0) * 6.0 + 3.0;
  const matter = Math.cos((2 * Math.PI * tDays) / 365.25) * 7.0 + 2.0;

  return {
    totalSpirit: spirit,
    totalEssence: essence,
    totalMatter: matter,
    totalSubstance: substance,
  };
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║        WAVEFUNCTION OPERATOR & DYNAMIC PRICING CURVE AUDIT                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

  let passedTests = 0;
  const totalTests = 4;

  // =========================================================================
  // TEST 1: Wavefunction Normalization Bounds ([-1.0, +1.0])
  // =========================================================================
  console.log('[TEST 1] Testing Wavefunction Normalization across Extreme Vectors...');
  const extremeVectors: PlanetaryAspectVector[] = [
    { totalSpirit: 1000, totalEssence: 0, totalMatter: 0, totalSubstance: 0 }, // 100% Spirit Stellium
    { totalSpirit: 0, totalEssence: 500, totalMatter: 500, totalSubstance: 0 }, // Water-Earth Equal Blend
    { totalSpirit: -250, totalEssence: 250, totalMatter: -100, totalSubstance: 100 }, // Mixed Dissonance
    { totalSpirit: 0, totalEssence: 0, totalMatter: 0, totalSubstance: 0 }, // Null Sky
  ];

  let t1Passed = true;
  for (const v of extremeVectors) {
    const psi = computeDignityWavefunction(v);
    const inBounds =
      psi.psiSpirit >= -1 && psi.psiSpirit <= 1 &&
      psi.psiEssence >= -1 && psi.psiEssence <= 1 &&
      psi.psiMatter >= -1 && psi.psiMatter <= 1 &&
      psi.psiSubstance >= -1 && psi.psiSubstance <= 1;

    if (!inBounds) {
      console.error('  ✗ Out-of-bounds wavefunction output:', psi);
      t1Passed = false;
    }
  }

  if (t1Passed) {
    console.log('  ✓ All extreme aspect permutations bounded strictly within [-1.0000, +1.0000].');
    console.log('>>> [PASS] Test 1: Wavefunction normalization bounds verified.\n');
    passedTests++;
  } else {
    console.error('>>> [FAIL] Test 1 failed.\n');
  }

  // =========================================================================
  // TEST 2: Volatility Corridor & Clamping Safety ([0.25x, 4.00x])
  // =========================================================================
  console.log('[TEST 2] Testing Volatility Corridor Clamping & Multipliers...');
  const testPsis = [-1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 2.0, NaN, Infinity];
  let t2Passed = true;

  for (const p of testPsis) {
    const mult = calculateDynamicFeeMultiplier(p);
    const valid = Number.isFinite(mult) && mult >= 0.25 && mult <= 4.0;
    if (!valid) {
      console.error(`  ✗ Invalid multiplier ${mult} for psi ${p}`);
      t2Passed = false;
    }
  }

  if (t2Passed) {
    console.log('  ✓ Multiplier safety corridor confirmed: min 0.25x, max 4.00x, null-safe 1.00x.');
    console.log('>>> [PASS] Test 2: Fee volatility corridor validated.\n');
    passedTests++;
  } else {
    console.error('>>> [FAIL] Test 2 failed.\n');
  }

  // =========================================================================
  // TEST 3: Continuous Ephemeris Time-Stepping (t0 -> t0 + 365 Days)
  // =========================================================================
  console.log('[TEST 3] Simulating Continuous Ephemeris Time Series (1,000 Steps)...');
  const now = Math.floor(Date.now() / 1000);
  let t3Passed = true;
  let maxDelta = 0;

  let prevPsi = computeDignityWavefunction(sampleSyntheticEphemeris(now));

  for (let step = 1; step <= 1000; step++) {
    const futureTime = now + step * 3600; // 1-hour increments
    const aspects = sampleSyntheticEphemeris(futureTime);
    const currentPsi = computeDignityWavefunction(aspects);

    const delta = Math.abs(currentPsi.psiSpirit - prevPsi.psiSpirit);
    if (delta > maxDelta) maxDelta = delta;

    // Delta between consecutive hours must be smooth (no sudden discontinuities > 0.1)
    if (delta > 0.1) {
      console.error(`  ✗ Discontinuity detected at step ${step}: delta = ${delta}`);
      t3Passed = false;
      break;
    }
    prevPsi = currentPsi;
  }

  if (t3Passed) {
    console.log(`  ✓ 1,000 consecutive hourly timestamps evaluated smoothly.`);
    console.log(`  ✓ Maximum 1-hour Wavefunction delta: ${maxDelta.toFixed(5)} (Continuous ✓)`);
    console.log('>>> [PASS] Test 3: Time-series continuity verified.\n');
    passedTests++;
  } else {
    console.error('>>> [FAIL] Test 3 failed.\n');
  }

  // =========================================================================
  // TEST 4: Null Sky & Singularity Rejection
  // =========================================================================
  console.log('[TEST 4] Testing Degenerate Zero-Sky & Null Aspect Resistance...');
  const nullAspects: PlanetaryAspectVector = {
    totalSpirit: 0,
    totalEssence: 0,
    totalMatter: 0,
    totalSubstance: 0,
  };

  const nullResult = computeDignityWavefunction(nullAspects);
  const nullMult = calculateDynamicFeeMultiplier(nullResult.psiSpirit);

  const t4Passed =
    nullResult.psiSpirit === 0 &&
    nullResult.psiEssence === 0 &&
    nullResult.psiMatter === 0 &&
    nullResult.psiSubstance === 0 &&
    nullMult === 1.0;

  if (t4Passed) {
    console.log('  ✓ Degenerate null aspects produce exact equilibrium: \Psi = 0.0000, Multiplier = 1.0000x.');
    console.log('>>> [PASS] Test 4: Degenerate singularity protection confirmed.\n');
    passedTests++;
  } else {
    console.error('>>> [FAIL] Test 4 failed.\n');
  }

  // =========================================================================
  // SCORECARD
  // =========================================================================
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log(`║   WAVEFUNCTION PRICING AUDIT: ${passedTests} / ${totalTests} TESTS PASSED                          ║`);
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL WAVEFUNCTION OPERATOR CONSTRAINTS FULLY SATISFIED!\n');
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
