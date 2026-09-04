# Process Documentation Check: Canonical ESMS Web3 Infrastructure & Devnet Operations

**Document Revision:** 1.0.0  
**Target Repository:** `AlchmHackStation`  
**Related Repositories:** `AlchmAgentsSolana` (ASOL), `Pentacles` (SpacetimeDB Cloud Client)  
**System Profile:** 16GB RAM / Apple Silicon (M5) / macOS / Bun Runtime  

---

## 1. Executive Summary & Verification Objective

This persistable document establishes the operational standard, security controls, and verification checklists for the **AlchmHackStation** mission control hub and its integration with the **AlchmAgentsSolana (ASOL)** Token-2022 elemental coins: **Spirit**, **Essence**, **Matter**, and **Substance** (ESMS).

All mock/placeholder names (Ignis, Aqua, Terra, Aeth) have been superseded. The system operates strictly with the four canonical protocol coins across all on-chain programs, RPC deployment pipelines, Arweave permanent storage, and front-end visualizers.

---

## 2. Canonical Token-2022 Coin Architecture

The four coins implement distinct, non-standard SPL Token-2022 extension architectures to govern alchemical state transitions, soulbound achievements, and liquidity routing.

| Coin Name | Symbol | Decimals | Scale Factor | Active Token-2022 Extensions | Live Devnet Pinned Mint PDA | Operator Devnet ATA |
|---|---|---|---|---|---|---|
| **Spirit** | `SPIRIT` | **4** | $10{,}000$ | `TransferHook`, `MetadataPointer`, `PermanentDelegate` | [`K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ`](https://solscan.io/token/K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ?cluster=devnet) | `EehnU8s5LSRW32iLWRENHuSrcZWWbLQjRrhwtq7UJNzu` |
| **Essence** | `ESSENCE` | **4** | $10{,}000$ | `ConfidentialTransfers`, `MetadataPointer`, `PermanentDelegate` | [`3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf`](https://solscan.io/token/3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf?cluster=devnet) | `13dBxuGU3XYoykodcbXoLSZo2bVSdxQeBkZb21aJpqak` |
| **Matter** | `MATTER` | **4** | $10{,}000$ | `NonTransferable`, `MetadataPointer`, `PermanentDelegate` | [`7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4`](https://solscan.io/token/7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4?cluster=devnet) | `HhJtErkC98ijNhYK7Xfu8vT4aG1ms4Mxr26eU86Gh2wT` |
| **Substance** | `SUBSTANCE` | **4** | $10{,}000$ | `PermanentDelegate`, `InterestBearingConfig` (18.20% APR), `MetadataPointer` | [`6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa`](https://solscan.io/token/6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa?cluster=devnet) | `4pGN6tjQJVgwuj92ymV3jw8qxsNR34w1vdZe1YFrAjmk` |

* **ASOL Program ID**: `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD`
* **Program Authority PDA**: `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku` (`['program_authority']`)
* **Operator Authority**: `AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5` (~13.0856 SOL)
* **Devnet ATA Initialization Transaction**: [`3saLippxRYLsyEHHyxHiCcU4Q9exNWadbxwYZyM5uNdr6dQSJddQNyd8nGpzyF4C7rZXB2cP4dm8y5UAhUZ5siQz`](https://solscan.io/tx/3saLippxRYLsyEHHyxHiCcU4Q9exNWadbxwYZyM5uNdr6dQSJddQNyd8nGpzyF4C7rZXB2cP4dm8y5UAhUZ5siQz?cluster=devnet)

---

## 3. The 5 Pillars of the Perfect Coin (Validation Checklist)

Every production coin must satisfy these 5 criteria:

### [x] Pillar 1: Mathematical Precision & Lossless Scaling
- **Constraint**: All calculations are executed strictly in integer atoms using `bigint` scaled at $10^4$ (`ESMS_RAW_SCALE = 10_000n`).
- **Invariant Monotonicity**: Constant-product AMM invariant $k = R_A \cdot R_B$ satisfies $k_{\text{after}} \ge k_{\text{before}}$ for every swap.
- **Truncation Direction**: Integer division strictly floors output amounts and ceilings protocol fees, guaranteeing zero leakage from virtual pools.
- **Audit Script**: `bun run test:scaling` (verifies 10,000 randomized Monte Carlo swaps).

### [x] Pillar 2: Runtime Extension Security & Anti-Exploit
- **Zero-Transferability Lock**: `MATTER` (and soulbound credentials) cannot be transferred peer-to-peer; direct `spl-token transfer` instructions are hard-rejected by the Token-2022 runtime.
- **Restricted Permanent Delegate**: Only the verified `ProgramConfig` PDA has delegate authority to rebalance or burn assets.
- **Permissioned Burn**: Unauthorized third-party burn attempts fail with `OwnerMismatch` or `InvalidAuthority`.
- **Audit Script**: `bun run test:security`.

### [x] Pillar 3: Bespoke Zero-Escrow AMM Liquidity Routing
- **Architecture**: Because soulbound assets cannot be escrowed, the protocol routes liquidity virtually.
  - Input token is burned from user ATA via `PermanentDelegate`.
  - Output token is minted to user ATA via Program Authority PDA signer seeds.
- **Attestation Preimage**: 170-byte canonical `ASOL_AMM_VISIBILITY_V1` payload signed by protocol Ed25519 attestor.
- **Replay Protection**: Enforced via on-chain per-trader sequence nonces (`['amm_nonce', poolId, trader]`).
- **Audit Script**: `bun run test:amm`.

### [x] Pillar 4: Universal Wallet & Metadata Pointer Resolution
- **Self-Referential Metadata**: `MetadataPointer` resolves to the mint's own account data, storing TLV metadata (name, symbol, Arweave URI).
- **Arweave Integrity**: Production JSON schemas resolve HTTP 200 OK with verified SHA-256 digests matching on-chain commitments.
- **Audit Script**: `bun run test:token2022`.

### [x] Pillar 5: Real-Time Observability & Visual Telemetry
- **Live Ticker Ribbon**: [src/components/TokenTickerRibbon.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/TokenTickerRibbon.tsx) mounts real-time USD/SOL pricing, 24h change indicators, and live SVG sparklines across the mission control header.
- **Orbital Liquidity Graph**: [src/components/TokenLiquidityVisualizer.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/TokenLiquidityVisualizer.tsx) renders the 4-node constellation topology across the 6 trading pools, featuring an interactive lossless swap simulator and extension health matrix.

---

## 4. Operational Runbook: Execution & Test Commands

All commands **MUST** use the Bun runtime under macOS Apple Silicon:

```bash
# ============================================================================
# STEP 1: Process Hygiene Check (Mandatory Pre-Flight)
# ============================================================================
# Check for active listeners on port 5173
lsof -ti:5173

# If occupied, terminate cleanly:
lsof -ti:5173 | xargs kill -9 2>/dev/null

# ============================================================================
# STEP 2: Master Devnet Test Execution (All 5 Suites)
# ============================================================================
bun run test:all-coins

# Or execute individual test suites:
bun run test:security       # Token-2022 security locks & metadata pointers
bun run test:scaling        # Lossless 10^4 scaling & invariant proofs (10k swaps)
bun run test:wavefunction   # Astrometry dignity curves & volatility corridor
bun run test:amm            # Bespoke AMM router simulation & Ed25519 attestation
bun run test:token2022      # Milestones M1-M4 pipeline & SpacetimeDB bridge

# ============================================================================
# STEP 3: Production Build & Lint Verification
# ============================================================================
bun run build               # Runs: tsc -b && vite build (target: <250ms)

# ============================================================================
# STEP 4: Launch Dev Server Under Native Bun
# ============================================================================
bun --bun run dev           # Launches Vite server on http://localhost:5173
```

---

## 5. Persistent File Map & Component Responsibilities

| File Path | Component Role | Critical Responsibilities |
|---|---|---|
| [src/lib/tokenPricingEngine.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/lib/tokenPricingEngine.ts) | Math / Pricing Engine | Computes real-time USD/SOL quotes, 24h deltas, and lossless $10^4$ integer swap quotes. |
| [src/components/TokenTickerRibbon.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/TokenTickerRibbon.tsx) | Front-End Ticker Bar | Renders dynamic pricing chips, SVG sparklines, and copy-mint buttons across the top header. |
| [src/components/TokenLiquidityVisualizer.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/TokenLiquidityVisualizer.tsx) | Interactive Topology | Renders orbital constellation liquidity graph, swap simulator, and Token-2022 health matrix. |
| [src/components/Token2022CommandCenter.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/Token2022CommandCenter.tsx) | Mission Control UI | Primary control center featuring the `amm-router` tab, deployment modal, and live balances. |
| [src/data/arweaveManifests.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/data/arweaveManifests.ts) | Permanent Storage | Canonical JSON metadata manifests with SHA-256 digests and vector SVG paths. |
| [scripts/test_token2022_security.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/scripts/test_token2022_security.ts) | Test Harness | Validates non-transferable locks, metadata pointers, and permissioned burn rejections. |
| [scripts/test_lossless_scaling.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/scripts/test_lossless_scaling.ts) | Test Harness | 10,000-swap Monte Carlo simulator validating constant-product invariant monotonicity. |
| [scripts/test_pricing_wavefunction.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/scripts/test_pricing_wavefunction.ts) | Test Harness | Validates $\Psi_a(t)$ dignity curves and volatility bounds across 1,000 hourly steps. |
| [scripts/test_amm_bespoke_swap.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/scripts/test_amm_bespoke_swap.ts) | Test Harness | Tests bespoke swap instruction assembly, Ed25519 attestations, and permanent delegate routing. |
| [scripts/run_all_devnet_tests.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/scripts/run_all_devnet_tests.ts) | Master Orchestrator | Executes all test suites and outputs the final executive scorecard. |

---

## 6. Process Hygiene & Hardware Constraints Compliance

* **Memory Budget**: Evaluated within 16GB unified memory; zero multi-instance Node.js processes; Bun single-thread runtime enforced.
* **Port Lifecycle**: Port 5173 is validated prior to server launch (`lsof -ti:5173`) and torn down immediately upon task completion.
* **Compilation Benchmark**: Clean production build in $\le 210\text{ms}$ with zero TypeScript errors.
