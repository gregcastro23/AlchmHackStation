# NEXT_SESSION_PROMPT: Phase 3 Token-2022 Pipeline & Cross-Ecosystem Operations

## 1. Executive Context & System Architecture

The **AlchmHackStation** operates as the mission control hub orchestrating **AlchmAgentsSolana (ASOL)**, **Pentacles (SpacetimeDB Cloud Game Client)**, and local Solana test execution environments.

### Environment & Constraints Profile
* **Hardware Profile:** 16GB RAM / Apple Silicon (M5) / macOS.
* **Runtime Enforcement:** Mandatory Bun runtime (`bun --bun run dev`, `bun scripts/...`). No raw `npm` or unmonitored Node multi-instance processes.
* **Process Hygiene:** Strict listener check (`lsof -ti:5173 | xargs kill -9`) before startup; mandatory teardown on task closeout.
* **Security & Whitelist Boundaries:** Configured in `vite.config.ts`:
  * `/Users/cookingwithcastro/Desktop/AlchmHackStation`
  * `/Users/cookingwithcastro/Desktop/AlchmAgentsSolana/target/idl`
  * `/Users/cookingwithcastro/Desktop/Spacetimedbhackathon/Pentacles`

---

## 2. Status of Preceding Phases

### Phase 1: Environment & Network Bindings (COMPLETE)
* `.env` configured with dedicated Solana RPCs and SpacetimeDB cloud module `cookingwithcastrollc`.
* Hardware probe [scripts/check_cli_auth.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/scripts/check_cli_auth.ts) registered to active developer identity (`AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5`).

### Phase 2: Option A — Cross-Repo IDL & Type Injection Engine (COMPLETE)
* Hardened `/api/fs` and `/api/sync-idl` endpoints in [vite.config.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/vite.config.ts).
* Vite server watcher configured to detect SBF builds in `AlchmAgentsSolana/target/idl/` and broadcast IDLs into `Pentacles/src/idl/` and `Pentacles/target/idl/`.
* [scripts/generate_types.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/scripts/generate_types.ts) auto-generates 653 lines of verified TypeScript types in [src/types/hackstation.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/types/hackstation.ts).

### Phase 2: Option B — SpacetimeDB WebSocket Visualizer & Reducer Feed (COMPLETE)
* Zero-overhead native WebSocket client in [src/lib/spacetimedbSocket.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/lib/spacetimedbSocket.ts) connected to `wss://maincloud.spacetimedb.com/database/subscribe/cookingwithcastrollc`.
* 60fps particle dynamics with elemental coloring (Fire/Water/Earth/Air) wired to live reducers in [src/components/SwarmNexus.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/SwarmNexus.tsx).
* Real-time virtualized event ticker in [src/components/ReducerFeed.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/ReducerFeed.tsx) with sub-1ms mutex testing.
* State drift gauge and SpacetimeDB engine health tracking in [src/components/PlanetaryCockpit.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/PlanetaryCockpit.tsx).

---

## 3. Immediate Mission: Phase 3 Push-Button Token-2022 Pipeline

Transition [src/components/Token2022CommandCenter.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/Token2022CommandCenter.tsx) from mock telemetry into an **active on-chain execution pipeline**.

### Task 3.1: Arweave Metadata Schema Verification & Pre-flight Validator
* **Target Elements:**
  * **IGNIS (Fire)**: `https://arweave.net/qR8v7_Ignis_Alchm_Elemental_Proof_v2.json`
    * Attributes: Combat kinetic fee (1.5%), transfer hook binding, mutable=false.
  * **AQUA (Water)**: `https://arweave.net/wT2x9_Aqua_Stealth_Reagent_v2.json`
    * Attributes: ElGamal confidential transfers, ZK proof assertion.
  * **TERRA (Earth)**: `https://arweave.net/eM4k1_Terra_Soulbound_Badge_v2.json`
    * Attributes: Non-transferable mint flag, Star Vault credential.
  * **AETH (Air/Aether)**: `https://arweave.net/aL9p4_Aether_Dynamic_Staking_v2.json`
    * Attributes: Permanent delegate authority, dynamic compounding yield.
* **Pre-flight Check Logic:** Implement an automated `fetchArweaveMetadata(uri: string)` pre-flight check in the UI that validates the JSON digest and displays metadata confirmation before signing.

### Task 3.2: Active Transaction Builder for Token-2022 Extensions
Implement client-side transaction assembly in [src/components/Token2022CommandCenter.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/Token2022CommandCenter.tsx) using `@solana/web3.js` and `@solana/spl-token`:
1. **Fresh Mint Keypair:** Generate a new `Keypair.generate()` in component state upon modal open.
2. **ExtraAccountMetaList PDA Derivation:**
   ```ts
   const [extraAccountMetasPda] = PublicKey.findProgramAddressSync(
     [Buffer.from('extra-account-metas'), mintKeypair.publicKey.toBuffer()],
     new PublicKey(PROGRAM_IDS.TOKEN2022_TRANSFER_HOOK)
   );
   ```
3. **Strict Instruction Sequencing:**
   * **Calculate Extension Space:**
     ```ts
     const extensions = [ExtensionType.TransferHook, ExtensionType.MetadataPointer];
     // Add ExtensionType.NonTransferable for TERRA
     const mintLen = getMintLen(extensions);
     const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);
     ```
   * **Step 1: SystemProgram Account Creation:**
     ```ts
     SystemProgram.createAccount({
       fromPubkey: payerPublicKey,
       newAccountPubkey: mintKeypair.publicKey,
       space: mintLen,
       lamports,
       programId: TOKEN_2022_PROGRAM_ID,
     });
     ```
   * **Step 2: Extension Initializations (MUST precede initializeMint):**
     * **Transfer Hook**: `createInitializeTransferHookInstruction(mintKeypair.publicKey, payerPublicKey, hookProgramId, TOKEN_2022_PROGRAM_ID)`
     * **Non-Transferable** (Terra): `createInitializeNonTransferableMintInstruction(mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID)`
     * **Metadata Pointer**: `createInitializeMetadataPointerInstruction(mintKeypair.publicKey, payerPublicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID)`
     * **Mint Close Authority**: `createInitializeMintCloseAuthorityInstruction(mintKeypair.publicKey, payerPublicKey, TOKEN_2022_PROGRAM_ID)`
   * **Step 3: Mint Initialization:**
     `createInitializeMintInstruction(mintKeypair.publicKey, decimals, payerPublicKey, payerPublicKey, TOKEN_2022_PROGRAM_ID)`
   * **Step 4: Token-2022 Metadata Initialize:**
     Pack on-chain metadata pointers to Arweave URI digest.

### Task 3.3: Execution Bridge & Reducer Reconciliation Link
* Wire the **Deploy Elemental Token-2022 Mint** action button to submit the transaction:
  * Localnet: Execute via `/api/exec` running `solana transfer` / `spl-token create-token` scripts.
  * Devnet/Mainnet: Submit serialized transaction signed by the active identity keypair.
* On confirmation, automatically fire `spacetimedbSocket.triggerMockMutation()` or invoke `sync_solana_event_reducer` so the canvas particle burst and ReducerFeed ticker trigger in real-time.

---

## 4. Pending Phase 4 & Advanced Tasks

1. **Compute Unit (CU) Profiling in [src/components/ModelAccountsView.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/ModelAccountsView.tsx):**
   * Parse local `solana-test-validator` transaction execution logs in real-time.
   * Baseline priority fee estimation algorithms based on actual CU consumption of ASOL staking instructions.
2. **Astrometry Reconciliation Drift Engine in [src/components/PlanetaryCockpit.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/PlanetaryCockpit.tsx):**
   * Correlate Hipparcos star nodes from `Pentacles/server/src/tables.rs` (`star_node`) with on-chain Star Vault deposits.
   * Auto-flag visual alerts if drift delta exceeds block confirmation window (>1500ms).
3. **Automated End-to-End Build & Release:**
   * Run `bun run preflight` and `bun run package` to create release bundle.

---

## 5. First Commands to Run in the Next Session

```bash
# 1. Verify Process Hygiene & Clean Listeners
lsof -ti:5173 | xargs kill -9 2>/dev/null

# 2. Run Test Probes & Verify IDL / WebSocket Status
bun run auth:check
bun scripts/test_stdb_socket.ts
bun run sync:idl

# 3. Test Production Compilation
bun run build

# 4. Launch Clean Dev Server (under Bun)
bun --bun run dev
```

---

## 6. Verification Milestones for Next Session

| Milestone | Action | Target Verification |
| :--- | :--- | :--- |
| **M1: Arweave Pre-flight** | Query Arweave URIs for 4 elements | Return 200 OK with validated JSON schema & digest preview |
| **M2: PDA Derivation** | Derive ExtraAccountMetaList PDA for fresh mint | Matches `findProgramAddressSync(['extra-account-metas', mint], HOOK_ID)` |
| **M3: Instruction Sequence** | Build transaction with extensions preceding mint init | Transaction simulation returns zero errors (`0x0`) |
| **M4: Telemetry Bridge** | Successful mint triggers SpacetimeDB reducer | Particle burst renders in SwarmNexus within 50ms |
