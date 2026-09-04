# AlchmHackStation — Solana Mission Control
### Dedicated Mission Control for the AlchmAgentsSolana Protocol & Pentacles Ecosystem

AlchmHackStation is a high-performance, real-time developer mission control room engineered specifically for the **AlchmAgentsSolana** protocol and the **Pentacles** (`SpaceTimeDB`) relational game ecosystem. 

By eliminating legacy EVM/Circle dependencies and the monolithic hackathon tracking canvas, the station directly orchestrates Token-2022 elemental mints, monitors 60fps WebSocket RPC event sync feeders, audits on-chain staking telemetry, and enforces biometric governance handoffs.

---

## Core Systems & Repurposed Architecture

### 1. Token-2022 Command Center (`Token2022CommandCenter.tsx`)
- **Four Canonical ESMS Protocol Tokens**:
  - **SPIRIT ($SPIRIT)**: Governed by the **Transfer Hook** extension (`ExtensionType.TransferHook`). Requires strict on-chain `ExtraAccountMetaList` PDA derivation before CPI execution. Enforces kinetic friction combat fees burned to the celestial pool. (Cosmological element: Fire).
  - **ESSENCE ($ESSENCE)**: Privacy-shielded transactions using the **Confidential Transfer** extension (`ExtensionType.ConfidentialTransferMint`) with ElGamal encryption. (Cosmological element: Water).
  - **MATTER ($MATTER)**: **Non-Transferable / Soulbound** badges (`ExtensionType.NonTransferable`) cryptographically locked to agent identities. (Cosmological element: Earth).
  - **SUBSTANCE ($SUBSTANCE)**: Yield-bearing dynamic staking token with the **Permanent Delegate** extension (`ExtensionType.PermanentDelegate`) for automated SpacetimeDB balance reconciliation. (Cosmological element: Air).
- **Permanent Arweave Metadata**: Inspects permanent Arweave transaction manifests (`https://arweave.net/...`), immutability digests, and Metaplex metadata pointers.
- **Star Vault Staking Engine**: Connects Hipparcos star catalog astrometry (Polaris, Sirius, Vega, Rigel, Arcturus, Betelgeuse, Antares, Aldebaran) to calculate dynamic elemental APY multipliers.

### 2. Solana Event Sync Visualizer (`SwarmNexus.tsx`)
- **60fps Canvas Physics Engine**: Connects interactive canvas particle physics to real-time Solana WebSocket subscriptions (`logsSubscribe`, `accountSubscribe`, `programSubscribe`).
- **SpacetimeDB Feeder Pipeline**: Maps streaming block confirmations and program logs from dedicated RPCs (Helius Atlas / Triton Sub-Zero) directly into SpacetimeDB table rows (`ephemeris`, `star_vault`, `alchm_agent_state`) for module `cookingwithcastrollc`.
- **Live Throughput Telemetry**: Tracks WebSocket frames/sec, reducer queue backlog, compute units consumed per slot, and synchronization coherence.

### 3. Staking Engine Telemetry & Durable Reconciliation (`PlanetaryCockpit.tsx`)
- **Durable State Reconciliation**: Monitors state drift between Solana on-chain Token-2022 vault accounts and local SpacetimeDB relational tables. Provides one-click force reconciliation.
- **Solana SBF Program Toolchain**: Integrates local program compilation commands (`cargo build-sbf`, `anchor build`, `solana-test-validator`).
- **Astrometry Kinetics Engine**: Live astrometric parameters (Heat, Entropy, Reactivity, Alchemical Number) calculating celestial yield dominance.

### 4. RPC & Compute Unit Budget Monitor (`ModelAccountsView.tsx`)
- **Dedicated RPC Cluster Health**: Tracks live ping latencies and WebSocket throughput across Helius Dedicated, Triton Sub-Zero, QuickNode, and Localhost (`127.0.0.1:8899`).
- **Compute Unit (CU) Budget Profiler**: Simulates transaction CU limits (50k base, 400k Token-2022 CPI with ExtraAccountMetas, 1.4M max) and calculates prioritization fees in micro-lamports/CU.

### 5. Multisig & Governance Auth (`check_cli_auth.ts` & `SecurityProtocolsView.tsx`)
- **Hardened CLI Probes**: Verifies active local developer credentials across `solana`, `anchor`, `cargo-build-sbf`, `spacetime`, and `vercel`.
- **Biometric Media Provenance**: Pairs macOS Touch ID platform biometrics (WebAuthn) with continuous camera segment hashing (`alchm.media-provenance.v1`) to log indisputable developer intent before irreversible mainnet governance actions.

---

## Hardened Local CLI & File System Bridge (`vite.config.ts`)

The Vite backend middleware is hardened with strict whitelisting to eliminate arbitrary code execution risks:
- **Whitelisted Executables**: `cargo build-sbf`, `cargo test`, `solana-test-validator`, `solana *`, `anchor *`, `bun scripts/*`, `lsof -i *`, `spacetime *`.
- **Verified IDL Generation (`/api/fs`)**: Cleanly generates, stores, and validates Anchor Interface Definition Language (IDL) JSON artifacts in `src/idl/`:
  - `alchm_staking_vaults.json`
  - `token2022_transfer_hook.json`

---

## Development Stack & Build Verification

- **Runtime**: Bun 1.3.13 (Native Apple Silicon M5 optimized)
- **Framework**: React 19 + TypeScript + Vite 8 + Tailwind CSS v4
- **Solana Toolchains**: `@solana/web3.js` (1.98.4), `@solana/spl-token` (0.4.15), `@metaplex-foundation/js` (0.20.1), `bs58` (6.0.0)

### 1. Build Verification
```bash
bun run build
```
*Builds in ~195ms with Rolldown manual chunk splitting (`solana-core`, `icons`, `index`).*

### 2. Official Alchm CLI Tool (`alchm`)
The repository includes the official `alchm` CLI, registered globally via `bun link`:
```bash
# Global help & version
alchm --help
alchm --version

# Audit ecosystem toolchains (Solana, Anchor, Spacetime, Vercel, Claude)
alchm auth check

# Faucet status & ADR-014 test harness
alchm faucet status
alchm faucet test
alchm faucet calc --fire 5 --water 2 --earth 1 --air 2

# Anchor IDL synchronization
alchm idl list
alchm idl sync

# Token-2022 & Devnet master test suite
alchm token2022 info
alchm devnet test
```

### 3. Local CLI & Multisig Auth Probe
```bash
bun run auth:check
```

### 3. Local Development Server
```bash
# Check port listeners first (process hygiene)
lsof -ti:5173 | xargs kill -9
bun --bun run dev
```
