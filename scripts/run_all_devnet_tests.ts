#!/usr/bin/env bun
/**
 * AlchmHackStation: Master Devnet Test Orchestrator
 * Runs the comprehensive test suite for canonical coins (Spirit, Essence, Matter, Substance).
 */

import { spawnSync } from 'child_process';

const SUITES = [
  { name: 'Token-2022 Security & Lock Audits', file: 'scripts/test_token2022_security.ts' },
  { name: 'Lossless 10^4 Scaling & Invariant Proofs', file: 'scripts/test_lossless_scaling.ts' },
  { name: 'Chart Dignity Wavefunction Operator', file: 'scripts/test_pricing_wavefunction.ts' },
  { name: 'Bespoke AMM Liquidity Router', file: 'scripts/test_amm_bespoke_swap.ts' },
  { name: 'Push-Button Pipeline & SpacetimeDB Bridge', file: 'scripts/test_token2022_pipeline.ts' },
];

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        CANONICAL COINS DEVNET TEST SUITE: COMPLETE SYSTEM AUDIT               ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝\n');

  let passed = 0;
  const startTotal = performance.now();

  for (let i = 0; i < SUITES.length; i++) {
    const suite = SUITES[i];
    console.log(`\n▶ [${i + 1}/${SUITES.length}] EXECUTING: ${suite.name}...`);
    const start = performance.now();

    const res = spawnSync('bun', [suite.file], {
      stdio: 'inherit',
      env: process.env,
    });

    const elapsed = ((performance.now() - start) / 1000).toFixed(2);

    if (res.status === 0) {
      console.log(`>>> [SUCCESS] ${suite.name} PASSED (${elapsed}s)`);
      passed++;
    } else {
      console.error(`>>> [FAILED] ${suite.name} FAILED with exit code ${res.status} (${elapsed}s)`);
    }
  }

  const totalElapsed = ((performance.now() - startTotal) / 1000).toFixed(2);

  console.log('\n╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log(`║   FINAL DEVNET AUDIT SCORECARD: ${passed} / ${SUITES.length} SUITES PASSED (${totalElapsed}s)                  ║`);
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');

  if (passed === SUITES.length) {
    console.log('\n🎉 ALL CANONICAL COIN WEB3 INFRASTRUCTURE AUDITS COMPLETED SUCCESSFULLY!\n');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
