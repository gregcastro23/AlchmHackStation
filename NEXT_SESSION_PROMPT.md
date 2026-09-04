# NEXT_SESSION_PROMPT: Phase 4 Advanced Cross-Ecosystem Operations & Telemetry Profiling

## 1. Executive Context & System Architecture

The **AlchmHackStation** operates as the mission control hub orchestrating **AlchmAgentsSolana (ASOL)**, **Pentacles (SpacetimeDB Cloud Game Client)**, and local Solana test execution environments.

### Environment & Constraints Profile
* **Hardware Profile:** 16GB RAM / Apple Silicon (M1) / macOS 26.6.2 (Darwin arm64).
* **Runtime Enforcement:** Mandatory Bun runtime (`bun --bun run dev`, `bun scripts/...`). No raw `npm` or unmonitored Node multi-instance processes.
* **Process Hygiene:** Strict listener check (`lsof -ti:5173 | xargs kill -9`) before startup; mandatory teardown on task closeout.
* **Security & Whitelist Boundaries:** Configured in `vite.config.ts`:
  * `/Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation`
  * `/Users/GregCastro/ASOL/alchm-agents-solana/target/idl`
  * `/Users/GregCastro/Pentacles`

---

## 2. Status of Preceding Phases

### Phase 1: Environment & Network Bindings (COMPLETE)
* `.env` configured with dedicated Solana RPCs and SpacetimeDB cloud module `cookingwithcastrollc`.
* Hardware probe [scripts/check_cli_auth.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/check_cli_auth.ts) registered to active developer identity (`AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5`).

### Phase 2: Cross-Repo IDL & SpacetimeDB Visualizer (COMPLETE)
* Vite server watcher configured to detect SBF builds in `AlchmAgentsSolana/target/idl/` and broadcast IDLs into `Pentacles/src/idl/` and `Pentacles/target/idl/`.
* [scripts/generate_types.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/generate_types.ts) auto-generates verified TypeScript types in [src/types/hackstation.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/types/hackstation.ts).
* Zero-overhead native WebSocket client in [src/lib/spacetimedbSocket.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/lib/spacetimedbSocket.ts) connected to `wss://maincloud.spacetimedb.com/database/subscribe/cookingwithcastrollc`.
* 60fps particle dynamics in [src/components/SwarmNexus.tsx](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/components/SwarmNexus.tsx) and live ticker in [src/components/ReducerFeed.tsx](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/components/ReducerFeed.tsx).

### Phase 3: Push-Button Token-2022 Pipeline & Canonical Coins (COMPLETE)
* All elemental coins aligned with canonical protocol coins: **Spirit**, **Essence**, **Matter**, and **Substance** (4 decimals).
* Pinned Devnet PDAs audited and operator ATAs initialized live on Solana Devnet (`3saLippxRYLsyEHHyxHiCcU4Q9exNWadbxwYZyM5uNdr6dQSJddQNyd8nGpzyF4C7rZXB2cP4dm8y5UAhUZ5siQz`).
* Interactive Deploy Token-2022 modal in [src/components/Token2022CommandCenter.tsx](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/components/Token2022CommandCenter.tsx).
* Pre-flight Arweave validator [src/lib/arweaveValidator.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/lib/arweaveValidator.ts) with SHA-256 integrity verification.
* Derived `ExtraAccountMetaList` PDA with 44-character hook address `Hook1gNisFeeResoLver111111111111111111111111`.

### Phase 3.5: Bespoke AMM Routing, Mathematical Scaling & Visualizations (COMPLETE)
* **Bespoke Zero-Escrow AMM**: [scripts/test_amm_bespoke_swap.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/test_amm_bespoke_swap.ts) routes non-transferable/soulbound assets via `PermanentDelegate` burn-and-mint.
* **Lossless $10^4$ Scaling**: [scripts/test_lossless_scaling.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/test_lossless_scaling.ts) validates constant-product invariant monotonicity across 10,000 Monte Carlo swaps.
* **Wavefunction Operator**: [scripts/test_pricing_wavefunction.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/test_pricing_wavefunction.ts) tests $\Psi_a(t)$ dignity curves and volatility bounds.
* **Extension Security**: [scripts/test_token2022_security.ts](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/test_token2022_security.ts) validates zero-transferability lock, metadata pointers, and permissioned burn protection.
* **Live Ticker Price Ribbon**: [src/components/TokenTickerRibbon.tsx](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/components/TokenTickerRibbon.tsx) mounted on header with live USD/SOL pricing and sparklines.
* **Orbital Liquidity Visualizer**: [src/components/TokenLiquidityVisualizer.tsx](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/components/TokenLiquidityVisualizer.tsx) mounted under `Bespoke AMM & Topology` tab.
* **Process Documentation Check**: Fully documented in [PROCESS_DOCUMENTATION_CHECK.md](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/PROCESS_DOCUMENTATION_CHECK.md).

---

## 3. Immediate Mission: Phase 4 Advanced Tasks

### Task 4.1: Compute Unit (CU) Profiling in [src/components/ModelAccountsView.tsx](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/components/ModelAccountsView.tsx)
* Parse local `solana-test-validator` transaction execution logs in real-time.
* Baseline priority fee estimation algorithms based on actual CU consumption of ASOL staking and bespoke swap instructions.
* Surface visual gas/CU gauges for all 6 AMM trading pools.

### Task 4.2: Astrometry Reconciliation Drift Engine in [src/components/PlanetaryCockpit.tsx](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/src/components/PlanetaryCockpit.tsx)
* Correlate Hipparcos star nodes from `Pentacles/server/src/tables.rs` (`star_node`) with on-chain Star Vault deposits and real-time ephemeris transits.
* Auto-flag visual alerts if drift delta exceeds block confirmation window (>1500ms).

### Task 4.3: Automated End-to-End Build & Release Packaging
* Run `bun run preflight` and `bun run package` to create verified desktop release bundle.
* Ensure clean sub-400ms production builds with 0 TypeScript warnings.

---

## 4. First Commands to Run in the Next Session

```bash
# 1. Verify Process Hygiene & Clean Listeners
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 2. Run Master Web3 Devnet Audit (All 5 Suites)
bun run test:all-coins

# 3. Test Production Compilation
bun run build

# 4. Launch Clean Dev Server (under Native Bun)
bun --bun run dev
```

---

## 5. Verification Scorecard Reference

| Suite | File | Coverage | Target Result |
| :--- | :--- | :--- | :--- |
| **Security & Locks** | `scripts/test_token2022_security.ts` | Non-transferable lock, metadata pointer, permissioned burn | 3 / 3 PASSED |
| **Lossless Scaling** | `scripts/test_lossless_scaling.ts` | $10^4$ scaling, invariant monotonicity, 10k swaps | 5 / 5 PASSED |
| **Wavefunction Operator** | `scripts/test_pricing_wavefunction.ts` | Dignity curves, time-stepping, volatility bounds | 4 / 4 PASSED |
| **Bespoke AMM Router** | `scripts/test_amm_bespoke_swap.ts` | 6 pool PDAs, Ed25519 attestation, Devnet simulation | 3 / 3 PASSED |
| **Master Orchestrator** | `scripts/run_all_devnet_tests.ts` | Full automated suite (`bun run test:all-coins`) | 5 / 5 SUITES PASSED |
