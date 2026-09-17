# Phase 3 Implementation Plan (revised): Economic Circuit & Solana Attestation

Repos and branches:
- **ASOL:** `alchm-agents-solana`, branch `feat/esms-attestation`, worktree `/Users/GregCastro/ASOL/wt-alchm-vessel`, based on `4b92e09`.
- **HackStation:** `AlchmHackStation`, branch `feat/amm-sync`, based on `9be3cc6`.
- **WTEN:** stays frozen until the last phase. Nothing below depends on it.

This revision replaces the first draft. The draft's goals stand. What changed is **where truth comes from** (server state, not request bodies) and **which invariants belong where**. The program and routes already solve replay, nonces and cluster binding, so the plan reuses them.

---

## 0. Problems in the first draft (with evidence)

| # | Draft item | Problem | Evidence |
|---|---|---|---|
| 1 | Duel attestation accepts `winner`, `transferredUnits`, `powerRatio`, `nonce`, `deadline`, `clusterDomain` from the request | **It is a signing oracle.** Any caller gets the attestor key to sign any outcome they invent. | Outcome truth lives in Pentacles `pillar_duel` (`state`, `winner_is_initiator`), server/src/tables.rs:1000 |
| 2 | Receipt id = `sha256(challenger:pillar:winner:units:nonce)` | Receipts aren't tied to a duel: a fresh `nonce` gives a fresh receipt, so one duel can be claimed many times. Two different duels with the same fields collide. | — |
| 3 | Caller-supplied `nonce`, `deadline`, `clusterDomain` | This regresses from the existing pattern. The AMM route reads the nonce **from chain**, the cluster domain from `SOLANA_CLUSTER_DOMAIN`, and the deadline from a server TTL. | app/api/solana/amm-attestation/route.ts:171-210 |
| 4 | New "128-byte `ASOL_DUEL_ATTESTATION_V1`" preimage | **No on-chain instruction verifies it**, so the signature proves nothing to the program. The listed fields add up to 148–150 bytes, not 128. The layout binds neither the duel id nor the opponent. | programs/asol_program/src/lib.rs has no duel instruction. The AMM preimage is 170 bytes, mirrored in `vectors.rs` and pinned by `golden-vectors.spec.ts`. |
| 5 | `getReceiptAddress('claim', duelReceiptId)` | This PDA namespace is created by `claim_mint_esms`. Deriving it for anything else only makes sense if `claim_mint_esms` is the consumer (see decision D1). | lib/solana/esms.ts:41, programs/asol_program/src/instructions/esms.rs:75 |
| 6 | `validateKineticEnergyConservation` / `scaleDeltasToKineticQuota` in the AMM | **Σ\|Δ\| ≤ q is the Pentacles pillar-transfer rule, not an AMM invariant.** Swaps are constant-product burn-in/mint-out with `min_out` enforced on-chain. A swap of x in for y out has Σ\|Δ\| = x + y, and no quota bounds that. An off-chain check the program doesn't enforce is false assurance. Silently scaling deltas changes the user's trade. | lib/solana/constellation-amm.ts:204 `quoteAmmSwap`; lib.rs `swap_esms(…, min_out, …)` |
| 7 | "Verified zero-escrow burn/mint confirmation receipt" in HackStation | The current button is a `setTimeout` that prints `Devnet Swap Simulation Confirmed … Status: 0x0 SUCCESS`. Nothing is sent or simulated. Its quote comes from the price index (`calculateLosslessSwapQuote`), not pool reserves. Wiring more UI onto it would present a fabricated receipt as verified. | src/components/TokenLiquidityVisualizer.tsx:98-108 |
| 8 | Vessel "dual scale" on `balances` | `balances` are **off-chain ledger** balances. Showing them as Token-2022 atoms implies on-chain holdings that were never read. A "synchronized" badge would claim a comparison that never ran. | lib/vessel/summary.ts (balances come from the Kitchen ledger) |
| 9 | `poolUnitsToAtoms(units: number): bigint` | Pillar pool units are f64 tenths, so the conversion must floor explicitly and return the dust. Atoms are u64 and should cross JSON as decimal strings. | Pentacles `ESMS_ATOMS_PER_POOL_UNIT = 1_000` (#67) |
| 10 | Rate limiting via `checkAttestationRateLimit` | The limiter is in-memory, so it is per-instance on Vercel. It can't be the protection for a value-bearing route. | lib/solana/amm-attestation-limiter.ts |
| 11 | "0 lint errors" | ASOL eslint ignores `lib/**` and `app/**` by default, so linting the new route or AMM code checks nothing. HackStation has lint errors already on `main`. | eslint.config (lines 37-38) |
| 12 | `devnet-amm.spec.ts` as a gate | It hits live Devnet (`api.devnet.solana.com`) and skips itself conditionally. It is a smoke check, not a deterministic gate. | test/solana/devnet-amm.spec.ts:28-35 |
| 13 | Roadmap item "Cooldown & Yield Harmonization" | The draft drops it silently. | docs/JING_ARENA_PHASE_TRACKING.md, Phase 3 |

---

## 1. Decisions for the user (before Workstream A)

**D1. What does a verified 14-Pillars duel win do on-chain?**

- **B (recommended): mint a fixed per-win ESMS reward through the existing `claim_mint_esms`.**
  - **No program change, no Devnet upgrade.** The attestor is already an authorized signer (`ProgramConfig.can_attest`).
  - **Replay protection already exists.** The claim-receipt PDA for `claim_id = duelReceiptId` makes a second mint fail on-chain.
  - **You set the tokenomics:** reward per win (in atoms), daily cap per wallet, and whether duels against agents (`target_agent`) earn anything. I recommend **not**, since agent wins are farmable.
- **A: record-only proof.** A new program instruction stores a duel receipt, with no value. This needs a new Anchor instruction and account, a `vectors.rs` mirror and golden vector, an IDL, and a Devnet program upgrade. Choose it only if an on-chain proof with no reward is the goal.
- **C (not recommended): zero-sum on-chain settlement** (burn from the loser, mint to the winner). ESMS mints are `NonTransferable` + `PermanentDelegate`, so this would burn a loser's tokens without their signature.

**D2. HackStation swap panel: honest simulation or visual only?**

- **Recommended: honest simulation.** An ASOL read-only quote/simulate endpoint does the work (B2); HackStation shows the result labeled "Simulated, not sent".
- **Alternative: visual only.** Keep the topology view, and remove the fake "Confirmed / 0x0 SUCCESS" receipt.

**D3. Yield harmonization** (ASOL `lib/profile-yield.ts` vs Kitchen): in scope for Phase 3, or deferred to Phase 4 with WTEN? Recommended: **defer**. It touches the Kitchen side, which is frozen.

---

## 2. Workstream A: server-authoritative duel attestation (ASOL)

Assumes D1 = B. If A is chosen, see A7.

### A1. `POST /api/solana/duel-attestation`: request carries identity and a duel id only
- **Body:** `{ duelId: string }`, a u64 as a decimal string. Reject any other field with 400. Never accept an outcome, amount, nonce, deadline or cluster.
- **Auth:** session **or** desktop API key (`lib/security/desktop-auth.ts`), exactly as in `app/api/vessel/summary/route.ts`. Unlinked dev tokens get 401.
- **Load the duel from SpacetimeDB** with the HTTP SQL API. Reuse `decodeSqlResult` / `identityHex` from `lib/vessel/spacetime-stats.ts`; don't write a second decoder.
  - `SELECT * FROM pillar_duel WHERE duel_id = <u64>`
  - Require `state = Resolved` and `winner_is_initiator` not null. Otherwise return 409 (`duel_not_resolved`).
  - Require `target_player` set (player-vs-player), unless D1 allows agent duels. Otherwise return 422 (`agent_duel_not_rewarded`).
- **Winner → wallet:** winner identity = `initiator` if `winner_is_initiator`, else `target_player`. Look it up in `verified_solana_wallet`. The caller's `VerifiedSolanaWallet` (Prisma) must equal that wallet, or return 403.
- **Unreachable or paused database:** return 503 (`arena_unreachable`) and never sign.

### A2. Receipt identity: exactly one per duel
- `duelReceiptId = sha256("ASOL_PILLAR_DUEL_RECEIPT_V1" ‖ spacetimeDbIdentity(32) ‖ duel_id(u64 LE) ‖ created_at_micros(i64 LE))`
  - **Database identity:** use the SpacetimeDB database identity, not the name.
  - **Why `created_at`:** `duel_id` is `auto_inc` and restarts if the module is ever force-published with `--delete-data` (`scripts/prod-cutover.sh`). Including `created_at` keeps an old receipt from blocking a new duel with the same id.
- `ledgerReferenceHash = sha256` of a canonical duel record: receipt id, winner wallet, loser identity, opening pillar, `opening_power_ratio` in bps (`round(ratio × 10_000)`, u32), resolved `updated_at`.
- **Idempotent:** the same duel always yields the same receipt id and hash.

### A3. Settlement: reuse the claim path
- **Pre-check:** `getSolanaClaimSettlementProof(duelReceiptId)`. If already settled, return `{ settled: true, txHash }` with 200 and don't mint again.
- **Mint:** `mintEsmsClaimSolana({ recipient: winnerWallet, claimId: duelReceiptId, amounts: DUEL_WIN_REWARD })`. It already routes through the KMS signer, priority fees and RPC failover.
  - **Reward amount:** `DUEL_WIN_REWARD` is a server constant from D1. Never derive it from pool deltas: `pillar_duel` has no transferred-amount field, and pool transfers are zero-sum game state.
- **Daily cap:** a durable store counts wins claimed per wallet per UTC day, following the `duel_yield` count query in `app/api/economy/duel-yield/route.ts`. Keep the in-memory limiter only as a burst guard.
- **Response:** `{ receiptId, receiptAddress, ledgerReferenceHash, txHash, settled }`.

### A4. Shared unit constants (no new copies)
- **Put them in `lib/solana/esms.ts`:** `ESMS_ATOMS_PER_POOL_UNIT = 1_000n`, plus `poolUnitsToAtoms(units: number): { atoms: bigint; dustUnits: number }`. It floors and returns the remainder.
- **Golden table**, identical to Pentacles #58/#67: 1 atom → 0 units, 999 → 0, 1 000 → 1, 10 000 → 10, 23.456 units → 23 456 atoms.

### A5. Tests (`test/solana/duel-attestation.spec.ts`; mock the SQL transport and the minter)
- **Rejections:**
  - anonymous → 401
  - unlinked dev token → 401
  - extra body fields → 400
  - unresolved duel → 409
  - agent duel → 422
  - caller not the winner → 403
  - wallet mismatch → 403
  - paused database → 503, and the signer is never called
- **Idempotency:** the same duel gives the same receipt id and hash. An already-settled receipt returns 200 `settled` and the minter is not called.
- **Receipt stability:** the receipt id changes when `created_at` changes (the republish case) and doesn't change when the request changes.
- **Daily cap:** the (N+1)th win in a UTC day returns capped, not minted.
- **Mutation checks:** remove the caller-is-winner check and the `state = Resolved` check one at a time; tests must fail each time. Record the results in the PR.

### A6. Guards
- **Keep client bundles free of Node built-ins.** Keep `node:crypto` out of any module imported by client components, and run `no-node-builtins.spec.ts`.
- **Lint actually runs.** The new route and tests must be whitelisted in `eslint.config` (it ignores `app/**` and `lib/**` by default), or the PR must say lint didn't cover them.

### A7. Only if D1 = A (record-only instruction)
- **Program:** a new Anchor instruction `record_pillar_duel(receipt_id, record_hash)`, init-once PDA seed `pillar_duel_receipt`, signer `can_attest`.
- **Parity:** add the layout to `vectors.rs` and `lib/solana/vectors.ts`, and assert a golden hex vector in `golden-vectors.spec.ts`.
- **Tests:** a runtime test that a second record fails.
- **Checks:** `anchor build`, IDL diff, `cargo test`.
- **Deploy:** a Devnet program upgrade, run only with explicit approval.

---

## 3. Workstream B: AMM, honest numbers only

### B1. No new AMM "kinetic conservation" functions
- **Drop them.** Don't add `validateKineticEnergyConservation` or `scaleDeltasToKineticQuota`.
- **Test the invariant the AMM does have** (`test/solana/constellation-amm.spec.ts`):
  - **Constant product:** for random reserves, fee and input, `(reserveIn + inWithFee) × (reserveOut − out) ≥ reserveIn × reserveOut`.
  - **Bounds:** `out < reserveOut`, and `out` never increases when `feeBps` increases.
  - **Parity:** `quoteAmmSwap` matches the Rust `quote_swap` (programs/asol_program/src/state/amm.rs:111) on shared vectors. `golden-vectors.spec.ts` has no swap-quote vectors today, so add them on both sides.

### B2. Read-only quote and simulation endpoint (ASOL; HackStation consumes it)
HackStation must not become a third copy of the program's PDA and instruction layouts.

- **Route:** `GET /api/solana/amm-quote?poolId&inElement&inAmountAtoms[&trader]`.
- **Quote from chain:** read the `ConstellationPool` account (decode with the existing `decodeConstellationPool`), then quote with `quoteAmmSwap` against the **reserves**, not the price index. Return `{ reserves, feeBps, outAtoms, minOutAtoms(slippage bps param), slot }`.
- **Optional simulation (with `trader`):**
  1. Build the real swap transaction: Ed25519 instruction from `/api/solana/amm-attestation`, then `swap_esms`.
  2. Run `connection.simulateTransaction(tx, { sigVerify: false, replaceRecentBlockhash: true })`.
  3. Return `{ simulated: true, err, logs, unitsConsumed }`.
- **Never** return anything labeled confirmed or success without a confirmed signature. This endpoint never sends.

### B3. HackStation (`feat/amm-sync`)
- **`vite.config.ts`:** add a server-side proxy for `/api/solana/amm-quote` and `/api/solana/amm-attestation`. Follow the Vessel proxy's pattern (timeout, status passthrough). Proxy the duel attestation too only if the operator cockpit needs it, forwarding `ALCHM_DESKTOP_API_KEY` server-side, never from the browser. It's a dev-server proxy; note that packaged desktop builds don't have it.
- **`TokenLiquidityVisualizer.tsx`:**
  - Remove the `setTimeout` fake and its "Confirmed / 0x0 SUCCESS" text.
  - Show the reserve-based quote with the slot.
  - With D2 = simulate, show the simulation `err`/`unitsConsumed`/logs, labeled **"Simulated on Devnet, not sent"**.
  - When the endpoint is unreachable, show "quote unavailable", not the price-index number.
- **Lint:** no new errors in touched files. `Token2022CommandCenter.tsx` errors already on `main` get listed, not counted as new.

---

## 4. Workstream C: Vessel on-chain balances (ASOL contract first, then HackStation)

- **C1. Additive contract change** in `lib/vessel/contract.ts` (still v1; the new field is optional):
  ```ts
  onchain?: {
    cluster: 'devnet' | 'mainnet-beta'
    wallet: string
    atoms: [string, string, string, string]   // u64 as decimal strings, per ESMS mint
    slot: number
  } | null
  ```
  - **Where it's read:** in `loadVesselForUser`, via `getTokenAccountBalance` on the verified wallet's Token-2022 ATAs for the four ESMS mints.
  - **Source tracking:** new source key `onchain` in `sources`, with failures recorded like the other sources.
  - **Accounts:** a missing ATA means zero atoms, not an error.
- **C2. Mirror the type** in HackStation `src/lib/alchmVessel.ts`. `isVesselState` must **not** require `onchain`, so older ASOL deployments still parse. Pentacles `parseTreasury` already ignores unknown fields.
- **C3. UI (`AlchmVessel.tsx`), three sources on separate labeled rows:**
  - **Ledger balance (off-chain):** unchanged.
  - **On-chain (Devnet):** atoms formatted as ESMS, with the slot.
  - **Pillar pool (game units, 10 = 1.0 ESMS):** already labeled.
  - **No "synchronized" badge.** Ledger and chain are *expected* to differ (unclaimed vs minted). If a comparison is shown, call it "unclaimed ledger balance" and compute it from both reads.
- **C4. Pentacles drawer:** optionally show the on-chain row. No other change.

---

## 5. Sequencing

1. **User decides D1–D3.**
2. **ASOL PR 1:** A1–A6 (duel attestation via `claim_mint_esms`). Needs no Pentacles publish to *merge*. Needs a published module and an unpaused `cookingwithcastrollc` to work *live*.
3. **ASOL PR 2:** B1, B2, C1 (AMM invariant tests, quote/simulate endpoint, Vessel `onchain`).
4. **HackStation PR:** B3, C2, C3, after ASOL PR 2 is deployed.
5. **Prerequisite outside this phase:** publish the Pentacles module (#62–#67), and run `SELECT COUNT(*) FROM faucet_transaction` first.

## 6. Verification (gates vs reported checks)

**Gates** (must pass; paste counts into the PRs):
- **ASOL, deterministic tests:**
  ```bash
  cd /Users/GregCastro/ASOL/wt-alchm-vessel
  node_modules/.bin/vitest run --config vitest.solana.config.ts test/solana/duel-attestation.spec.ts test/solana/amm-attestation.spec.ts test/solana/constellation-amm.spec.ts test/solana/golden-vectors.spec.ts test/solana/no-node-builtins.spec.ts test/solana/solana-minter.spec.ts
  node_modules/.bin/vitest run test/vessel test/jing-duels-auth.test.ts test/esms
  ```
- **ASOL, static checks:** `bunx tsc --noEmit`, and `bunx prettier --check` on touched files. `eslint` must run on touched files that are whitelisted; otherwise the PR says lint didn't cover them.
- **HackStation:** `npx tsc -b`, `bun run build`, `bun run build:all-aboard`, `bun run build:consensus`; no new eslint errors in touched files.
- **Mutation checks** from A5, with the results in the PR.
- **Program:** if D1 = A, `cargo test`, `anchor build`, IDL diff. Otherwise the PR states "no program change, no Devnet upgrade".

**Reported, not gating** (network or live state):
- `test/solana/devnet-amm.spec.ts` against live Devnet.
- End-to-end duel claim, only once the Pentacles module is published and the database is unpaused.

## 7. Out of scope
- WTEN (frozen).
- Mainnet anything.
- Sending swaps from HackStation: it has no wallet signer.
- Carrying sub-unit jing dust: needs a Pentacles schema change.
