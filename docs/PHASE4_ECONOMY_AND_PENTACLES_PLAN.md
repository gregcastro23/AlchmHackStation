# Jing infrastructure, the Vessel, and the ESMS economy: Phase 3 review and the phases after it

> **Steering update (2026-09-17):** read `docs/PHASE4_STEERING_ADDENDUM.md` first. Where they conflict, it supersedes §3 (naming/shop), decisions E1/E2/E4/E6, Phase 3.1's F1 fix, and Phases 4–6 of this plan.

**Scope and state:**
- **Repos:** `alchm-agents-solana` (ASOL), `Pentacles`, `AlchmHackStation`.
- **WTEN:** stays frozen until the last phase (Phase 7).
- **Unpushed Phase 3 work:** ASOL `feat/esms-attestation` (`6f8a3e1`, `3c59744`, in `/Users/GregCastro/ASOL/wt-alchm-vessel`) and HackStation `feat/amm-sync` (`e56873d`).
- **Reviewed on:** 2026-09-17, against those commits and Pentacles `origin/main`.

**Operating rule for the executing session:** every claim in a walkthrough must be backed by output that was actually run.
- **Simulations:** no placeholder presented as a real result.
- **Mutation checks:** name the exact test that failed.
- **Lint:** "0 lint errors" only for files eslint actually checked.

---

## 1. Phase 3 review

### 1.1 What is solid
- **Duel route shape is right:** body rejection, session or desktop-key auth, and the duel loaded from SpacetimeDB.
- **Duel checks are right:** resolved, player-vs-player, and winner wallet equals the caller's wallet.
- **Idempotency:** a settlement-proof pre-check, plus the claim-receipt PDA, so concurrent requests can't double-mint.
- **Receipt id shape:** domain + DB identity + duel id + `created_at`.
- **Vessel contract:** the additive `onchain` field; HackStation's `isVesselState` stays backward compatible.
- **HackStation:** the fake `setTimeout` receipt is gone.
- **AMM tests:** constant-product and fee-monotonicity property tests exist.
- **Test runs:** `duel-attestation` + `amm-quote` + `constellation-amm` 83/83; `test/vessel` 16/16. I re-ran both on 2026-09-17.

### 1.2 Findings (fix before pushing or opening PRs)

| # | Sev | Finding | Evidence | Fix |
|---|---|---|---|---|
| F1 | **Critical** | **The duel reward is 10,000× the intended amount.** `DUEL_WIN_REWARD` is `'1000'` per element, but `EsmsClaimAmounts` are whole-token decimal strings: `toSolanaOnchainAmounts` runs `parseUnits(val, 4)`. Each win mints **1,000 ESMS per element (4,000 ESMS)**, not 0.1. With the cap of 5/day, that's 20,000 ESMS/day per wallet. The velocity guard (10M tokens) doesn't catch it. | ASOL `lib/solana/duel-attestation.ts:7`; `lib/solana/solana-minter.ts:97-100` | Express the reward as token decimals (`'0.1'`), or pass atoms through a typed `EsmsAtoms` bigint. Add a test asserting `toSolanaOnchainAmounts(DUEL_WIN_REWARD)` equals the intended atoms. Supersede this with decision E4 if that changes the reward model. |
| F2 | **Critical** | **The AMM "simulation" is fabricated.** With a `trader` param, `amm-quote` returns hard-coded logs ("Instruction: SwapEsms … success") and `unitsConsumed: 42000`, with no `simulateTransaction` call. HackStation then shows "Simulated on Devnet, not sent. Consumed 42000 CUs". The test asserts `expect.any(Number)`, which locks the fake in. | ASOL `app/api/solana/amm-quote/route.ts:134-145`; HackStation `src/components/TokenLiquidityVisualizer.tsx:223-234` | Either run a real `simulateTransaction` (Ed25519 attestation instruction + `swap_esms`, `sigVerify:false`, `replaceRecentBlockhash:true`) and return its real `err`/`logs`/`unitsConsumed`, or return `simulation: null` with `reason: "not_implemented"`. The test must fail if logs don't come from RPC. |
| F3 | High | **Receipts can silently lose their database binding.** `SPACETIMEDB_IDENTITY` falls back to 64 zeros, so a missing env var drops the DB binding and a republish that restarts `duel_id` collides with old receipts. | duel route `:190` | Fail closed: 503 `misconfigured` if unset or not 64 hex. Document it in `docs/ALCHM_VESSEL.md` and the env tables. |
| F4 | High | **The daily cap is bypassable and pollutes the ledger.** It counts `token_transactions` before minting and inserts after, so concurrent claims for different duels both pass. The insert error is swallowed (`.catch(() => {})`), so a failed insert makes the win invisible to the cap. `idempotencyKey` is `pillar_duel:<duelId>`, so after a republish the unique key collides and is swallowed. The inserted row records **0.1 Spirit off-chain** for a 4-element **on-chain** mint, with no matching `token_balances` change: the ledger no longer sums to the balance. | duel route `:235`, `:264-299`; balances come from `token_balances` (`lib/services/economyService.ts:69`) | Use a dedicated table `duel_reward_claim { receiptId @unique, userId, wallet, duelId, dbIdentity, day, state, txHash }`. Insert `state=pending` **before** minting (the unique receipt id is the lock, and the day count reads this table), then update to `settled`. Never write reward rows into `token_transactions`. |
| F5 | High (economic) | **Colluding accounts can farm ESMS.** Player-vs-player wins mint new ESMS, capped only per wallet. Two linked accounts alternating wins get up to 10 mints/day, paid for with pool units the faucet refills. | design | Phase 5, decision E4: pay duel wins in pentacles (zero-sum) and mint ESMS only on capped withdrawal. Until then, add pair limits (same opponent pair ≤ N/day) and a minimum account age. |
| F6 | Medium | **The returned `ledgerReferenceHash` isn't what goes on-chain.** The minter computes its own (`ASOL_CLAIM_SOLANA_V1:…`). | duel route response; `solana-minter.ts:193` | Let `mintEsmsClaimSolana` accept an explicit `ledgerReferenceHash`, or drop the field from the response. |
| F7 | Medium | **`opening_pillar` is always hashed as `1`.** SATS enums decode to variant names (e.g. `"Distillation"`), not numbers. The tests pass pre-decoded objects instead of real SATS rows, so no decode path is tested. | duel route `:197`; `decodeSqlResult` in `lib/vessel/spacetime-stats.ts` | Map the variant name to the canonical pillar index (the table exists in `lib/alchemy/pillars.ts`). Add a fixture captured from a real SpacetimeDB `pillar_duel` SQL response (schema + array rows) and run the route against it. |
| F8 | Medium | **The on-chain Vessel reader is wrong in three ways.** It hard-codes `ESMS_DEVNET_MINTS` even when `network === 'mainnet-beta'`. Any RPC error becomes `"0"` while the source still reports `ok`, fabricating zero balances. `slot` comes from `getLatestBlockhash`, not the balance reads. Commit `3c59744` claims missing-token-account tests; none exist. | ASOL `lib/vessel/summary.ts:234-252`; `test/vessel/vessel-summary.test.ts` | Derive mints with `getEsmsMintAddresses(programId)`. Read all 4 token accounts with one `getMultipleAccountsInfoAndContext` (its `context.slot`). Treat a missing account as `0`, and an RPC error as `sources.onchain = {ok:false}` with `onchain: null`. Add tests: missing account → 0; RPC throw → source failure; mainnet → mainnet mints. |
| F9 | Low | **The "Rust `quote_swap` parity" vectors are TypeScript outputs pinned to themselves.** `181_009n` was edited to `180_991n` to match TS. The formulas are identical by inspection (`programs/asol_program/src/state/amm.rs:111`), but no Rust test asserts these numbers. | `test/solana/constellation-amm.spec.ts:722,730` | Put the vectors in the shared golden-vector source, and assert them in a `cargo test` too. |
| F10 | Low | **HackStation proxies send `ALCHM_DESKTOP_API_KEY` to endpoints that don't need it** (`amm-quote`, `amm-attestation`). | HackStation `vite.config.ts` (0c, 0d) | Forward the key only to routes that authenticate (`duel-attestation`, `vessel/summary`). |
| F11 | Low | **`amm-quote` has no guards.** It is public, uncached and unlimited, costing one RPC read per request. It quotes paused or un-bootstrapped pools as if tradable. | `amm-quote/route.ts` | Cache per `poolId` for ≈2s. Return 409 `pool_paused` / `pool_not_bootstrapped` with no `outAtoms`. |
| F12 | Process | **The Phase 3 walkthrough overstates what was done:** `simulateTransaction`, missing-account tests, mutation-test names that don't exist in the spec, and "0 lint errors" (ASOL eslint ignores `app/**` and `lib/**`). Both branches are unpushed, with no PRs. | walkthrough vs repo | Correct the walkthrough. Whitelist the new route and test files in `eslint.config`, or say lint didn't cover them. |

---

## 2. The ESMS economy today: every way to earn, spend and convert

### 2.1 The seven balances

| Id | Balance | Where | Unit |
|---|---|---|---|
| L1 | Agents off-chain ledger | ASOL Postgres `token_balances` + `token_transactions` | ESMS, 4 dp |
| L2 | Kitchen ledger (**frozen**) | WTEN `token_transactions` | ESMS, 4 dp |
| L3 | `jing_pool.esms` | Pentacles SpacetimeDB (private) | u16, tenths of ESMS |
| L4 | `pillar_pool.esms` | Pentacles SpacetimeDB (public) | f64, tenths of ESMS |
| L5 | `player.tokens` ("arena tokens") | Pentacles SpacetimeDB | u64 integer, **not ESMS** |
| L6 | ESMS on Solana | Token-2022 mints (NonTransferable + PermanentDelegate) | atoms, 4 dp |
| L7 | ESMS on Base | ERC-1155 + `StarVault.sol` | 4 dp |

### 2.2 Earn

| Balance | Source | Code |
|---|---|---|
| L1 | Kitchen / Agents daily yield (`kitchen_daily_yield`, `agents_daily_yield`) | `lib/profile-yield.ts:112-113` → `EconomyService.claimKitchenYield/claimAgentsYield` |
| L1 | Planetary agent yield (`agents_yield` / `yield_claim`) | `app/api/economy/claim-yield` |
| L1 | Paid multi-agent chat round (`duel_yield`, HMAC claim token, daily cap) | `app/api/economy/duel-yield` |
| L1 | Stripe ESMS bundle (`token_purchase`) | `app/api/stripe/webhook` |
| L1 | Forge failure refund (`forge_refund`) | `app/api/create-agent:691` |
| L3 | Daily faucet, 10 units per ESMS granted | `claim_daily_faucet` (reducers.rs:7269) → `compute_faucet_pool_credit` |
| L3 | Melee round yield | `melee_settle` (:3446) |
| L3 | Zone-capture bounty | `apply_control` (:2671) |
| L3 | Duel round pot (100 units) | `record_round_play` / `round_pot_share` |
| L3 | Solana mint/burn mirror (**feeder never calls it**, per #58) | `sync_solana_event` (:6798) |
| L3 | Starter balance of 80 | `ensure_jing_pool` |
| L4 | Daily faucet (the **same** grant again) | `claim_daily_faucet` |
| L4 | Pillar duel outcome (zero-sum transfer) and escrow refunds | `counter_pillar`, `answer_pillar`, `cancel_pillar_duel`, `sweep_stale_pillar_duels` |
| L4 | Seed copied from L3, or 80 | `ensure_pillar_pool` |
| L5 | Word duels; Stardex constellation; AR capture; anomaly lock | `answer_duel`, `stardex_claim_constellation`, `capture_ar_constellation`, `lock_anomaly` |
| L6 | Ledger claim to chain (debit L1 first) | `app/api/esms/claim` → `claim_mint_esms` |
| L6 | **Duel win (new, F1/F5)** | `app/api/solana/duel-attestation` → `claim_mint_esms` |
| L6 | AMM swap out / liquidity withdrawal | `swap_esms`, `withdraw_liquidity` |
| L6 | Star vault yield | `claim_star_yield` |
| L7 | Ledger claim to Base; StarVault yield (EIP-712 attestation) | `app/api/esms/claim`, `app/api/staking/claim-attestation` |
| — | Decan dividends are **recorded but never credited** anywhere | `settle_decan_boundary` (:7392) → `decan_yield_distribution` only |

### 2.3 Spend

| Balance | Sink | Code |
|---|---|---|
| L1 | Unified chat, Oracle Chamber, Flash Epiphany, Council Conclave | `app/api/unified-multi-agent-chat` → `debitDynamic` |
| L1 | LangChain agent, unified agents | `app/api/langchain-agent`, `app/api/agents/unified` |
| L1 | Forge agent (45), EV reset (50), agent operation costs | `debitOperation` (`AGENT_OPERATION_COSTS` in `lib/economy-config.ts`) |
| L1 | Claim to chain (debit side) | `app/api/esms/claim` |
| L3 | Jing cast/counter: 10 units per cast | `cast_jing` (:5148), `counter_jing` |
| L4 | Pillar cast charge: 10 units, escrowed | `cast_pillar` (:7696) |
| L5 | Siege horizon star (50); add star to constellation (100) | `siege_horizon_star`, `add_star_to_constellation` |
| L6 | Shop digital items (on-chain burn with order receipt) | `app/api/shop/purchase` → `redeem_for_esms` |
| L6 | AMM swap in / add liquidity (burn into virtual reserves) | `swap_esms`, `add_liquidity` |
| L7 | Shop via Base ERC-1155 burn (EIP-712) | `app/api/shop/purchase` |

**HackStation** has no end-user earn/spend flows. It's the operator cockpit: Vessel, AMM quotes, the Jing Arena sandbox (simulated) and Devnet scripts.

### 2.4 Structural gaps

| # | Gap |
|---|---|
| G1 | **One faucet grant becomes two spendable balances.** Each claim credits L3 and L4 in the same unit, so one grant funds 12 Jing casts **and** 12 pillar casts. By the no-phantom-minting invariant, that's a double credit unless the two arenas are meant to have separate budgets. |
| G2 | **The two game balances diverge by source.** Melee, zone capture, round pot and Solana sync credit only L3; L4 gets only the faucet. |
| G3 | **`claim_profile` moves `jing_pool` and `jing_rate` but not `pillar_pool`.** A guest's pillar balance is orphaned, and the new identity reseeds from the migrated jing row. |
| G4 | **Decan dividends are never paid** (see §2.2). |
| G5 | **Nothing converts game balances to on-chain ESMS by debiting them.** Duel wins mint new ESMS from nothing; game units never leave the game. The game side isn't yet the intermediary it's meant to be. |
| G6 | **No on-chain → game path runs.** `sync_solana_event` exists, but the feeder never calls it. |
| G7 | **ESMS runs on two chains** (Solana, Base) with parallel claim, redeem and staking rails. |
| G8 | **Two ledgers carry the same yield source types.** L1 and L2 both carry `kitchen_daily_yield` / `agents_daily_yield`, so this may double-pay. Verify in Phase 7. |
| G9 | **The Vessel shows only some balances:** L1 (via Kitchen), L4, L5 and L6. It doesn't show L3, L7, pending conversions or any conversion history. |

---

## 3. Naming: should pillar-pool units become "pentacles"?

**Recommendation: yes, but name one unified balance, not the pillar pool alone.** L3 and L4 already use the same unit (tenths of an ESMS). Naming only L4 "pentacles" would leave two balances in one unit with different contents (G1, G2). Pentacles fit the intermediary role you describe:

| Property | Pentacles (⛤) |
|---|---|
| Peg | 10 ⛤ = 1.0 ESMS = 10,000 atoms, so 1 ⛤ = 1,000 atoms (Pentacles `ESMS_ATOMS_PER_POOL_UNIT`, #67) |
| Shape | Element-indexed: "⛤ Spirit 110 · Essence 105 · Matter 120 · Substance 105" |
| Lives in | Pentacles game state only, never a token |
| Enters from | Faucet, game yields, zone bounties, round pots, deposits of burned on-chain ESMS (Phase 5) |
| Spent on | Jing casts and pillar casts (10 ⛤ = one cast), duel stakes |
| Leaves via | Attested withdrawal that **debits** pentacles and mints ESMS (Phase 5) |

**Collisions to resolve with the rename:**
- **App name:** "Pentacles" is also the game/app/repo name. Keep it; write the unit lowercase with ⛤ ("110 ⛤", "pentacles").
- **ASOL shop:** there is already a shop item kind `'pentacles'` (star-vessel upgrades and sigils). "Pentacle" appears in 84 ASOL files (shop catalog, `lib/agents/duel/*`, Monica tarot, Solana sync/bridge). Rename the shop kind to `'sigils'`; the catalog is already titled "Pentacles & Sigils". Audit the rest.
- **Vessel stream key:** `pentaclesMelee`. Relabel the stream "Pentacles Arena" (keep the key for compatibility), and add a contract field `pentacles` beside the deprecated `pillarPool`.
- **"Fifth quantity" framing:** the element-free scalar in the game is actually `player.tokens` (L5). Keep it separate and non-convertible, and give it its own name (decision E5) so there aren't three "pentacle-ish" things.

**Storage:** don't rename SpacetimeDB tables in place (it's a breaking schema change). Add a new table, route every reducer through it, and retire `jing_pool.esms` / `pillar_pool`. Keep `jing_pool.sacred7` (stats, not currency).

**Timing: do it before the first publish of #62–#67.** The last recorded publish to `cookingwithcastrollc` was 2026-07-24, before the faucet (2026-09-04) and `pillar_pool` (#62). If that holds, **no live `pillar_pool` rows exist**, and unification needs no data migration. Verify first (Phase 4, step 0).

---

## 4. Decisions needed

| # | Decision | Recommendation |
|---|---|---|
| E1 | Name the game-side ESMS-denominated unit "pentacles" (⛤) | **Yes** |
| E2 | Unify `jing_pool.esms` + `pillar_pool.esms` into one pentacle balance | **Yes, before the first publish.** Otherwise decide explicitly that Jing and Pillars have separate budgets, and credit the faucet grant to only one of them. |
| E3 | Storage unit | **Integer pentacle atoms (u64 per element, 1 ⛤ = 1,000 atoms).** Converts exactly to Token-2022 atoms; circuit math stays f64 in-flight and is quantized on write (invariant 5). |
| E4 | Duel-win rewards | **Pay in pentacles** from the round pot / loser stake (zero-sum). Mint ESMS only through capped withdrawals. Retire the fixed ESMS mint after F1 is fixed. |
| E5 | Name for `player.tokens` | Your call (not "pentacles"), e.g. "stardust" or "arena marks" |
| E6 | Rename ASOL shop kind `pentacles` → `sigils` | **Yes** |
| E7 | Canonical ESMS chain | **Solana.** Freeze new Base features, and plan a Base sunset or bridge (affects `esms/claim`, shop, StarVault). |
| E8 | Decan dividends | Credit them as pentacles, or remove the table |
| E9 | Peg and caps | Review faucet size (12 ESMS/day = 120 ⛤ ≈ 12 casts) vs cast charge; daily withdrawal cap per wallet; pair limits |

---

## 5. Phases

### Phase 3.1: correctness and honesty (ASOL `feat/esms-attestation`, HackStation `feat/amm-sync`)
1. Fix F1–F11 as specified in §1.2.
2. **New tests, each mutation-checked** (break the code, the named test fails, restore):
   - reward atoms equal the intended value (F1)
   - simulation comes from RPC or is null (F2)
   - missing `SPACETIMEDB_IDENTITY` → 503 (F3)
   - concurrent claims for two duels can't exceed the cap (F4)
   - real-SATS fixture decodes pillar/state/options/timestamps (F7)
   - on-chain reader: missing account → 0, RPC error → source failure, mainnet mints (F8)
3. Correct the Phase 3 walkthrough (F12). Push both branches; open **ASOL PR** (A + B + C1) and **HackStation PR** (B3 + C2–C3). Don't merge without approval.

**Gates:**
```bash
cd /Users/GregCastro/ASOL/wt-alchm-vessel
node_modules/.bin/vitest run --config vitest.solana.config.ts test/solana/duel-attestation.spec.ts test/solana/amm-attestation.spec.ts test/solana/amm-quote.spec.ts test/solana/constellation-amm.spec.ts test/solana/golden-vectors.spec.ts test/solana/no-node-builtins.spec.ts test/solana/solana-minter.spec.ts
node_modules/.bin/vitest run test/vessel test/jing-duels-auth.test.ts test/esms
node_modules/.bin/tsc --noEmit && bunx prettier --check <touched files>
cd /Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation
npx tsc -b && bun run build && bun run build:all-aboard && bun run build:consensus
```

### Phase 4: the pentacle ledger (Pentacles; must land before `spacetime publish`)
0. **Verify the migration-free window.** Unpause `cookingwithcastrollc`, then run `SELECT COUNT(*) FROM faucet_transaction` and `SELECT COUNT(*) FROM pillar_pool`. An error or 0 confirms it. If rows exist, stop and add a migration step (E2 merge rule).
1. **Tables:**
   - `pentacle_balance { identity PK, atoms: Vec<u64> (4), updated_at }`
   - `pentacle_entry { entry_id auto_inc, identity, delta_atoms: Vec<i64>, source: PentacleSource enum, ref_id: u64, created_at }`: the audit trail, generalizing `faucet_transaction`.
2. **Pure core:** `apply_pentacle_delta(balance, delta) -> Result<balance>`. No negatives, checked math, Σ-conservation for transfers. Every reducer loads, calls it, writes, and appends an entry.
3. **Rewire every earn/spend site** from §2.2–2.3 (L3/L4) to the pentacle ledger:
   - faucet credits **once** (fixes G1)
   - melee, zone and round pot credit it (fixes G2)
   - Jing and pillar casts debit it
   - duel escrow and refund operate on it
4. **`claim_profile`** migrates `pentacle_balance` and its entries (fixes G3).
5. **Decan dividends:** credit or delete, per E8 (fixes G4).
6. **Rename across the codebase:**
   - Rust types and client bindings (regenerate)
   - `src/cards/pillars.js`
   - `src/ui/vessel-model.js` / `vessel-drawer.js` labels ("⛤ pentacles")
   - README economy section
   - Constant `ESMS_ATOMS_PER_PENTACLE = 1_000` (keep `ESMS_ATOMS_PER_POOL_UNIT` as an alias for one release)
7. **Tests:**
   - property test: Σ entries = balance for random operation sequences
   - one test per earn/spend source, including "faucet credits exactly once"
   - `claim_profile` migration
   - mutation checks on no-negative and credit-once
   - gates: `cargo test`, `spacetime build`, `bun run test:all`
8. **Publish runbook** (with explicit approval): backup → `spacetime publish` → regenerate bindings → smoke queries → record in `docs/TESTNET_DEPLOYMENT.md`.

### Phase 5: the conversion bridge, pentacles ⇄ ESMS (Pentacles + ASOL)
1. **Withdraw (pentacles → Solana ESMS):**
   - `request_pentacle_withdrawal(atoms[4])` debits into a `pentacle_withdrawal { id, identity, wallet, atoms, state: Pending|Settled|Refunded, created_at }` row. The wallet must be verified. Cap per identity per day.
   - ASOL `POST /api/solana/pentacle-withdrawal { withdrawalId }` reuses the duel route's pattern: server-authoritative read, `claim_id = sha256(domain ‖ dbIdentity ‖ id ‖ created_at)`, then `claim_mint_esms` with **exactly the debited atoms** (no unit conversion, per E3).
   - A feeder/attestor reducer `confirm_pentacle_withdrawal(id, tx_sig)` settles it. `refund_pentacle_withdrawal(id)` fires only if the claim receipt PDA doesn't exist after the deadline.
2. **Deposit (Solana ESMS → pentacles):**
   - The user burns with `redeem_for_esms` (existing order receipt).
   - ASOL verifies the order receipt on-chain, then calls `deposit_pentacles(order_id, identity, atoms)`, one-shot per `order_id` (fixes G6; supersedes the unused `sync_solana_event` path).
3. **Duel rewards (E4):**
   - Pillar duels settle in pentacles from the round pot / loser stake.
   - Remove `DUEL_WIN_REWARD` minting, or keep it behind a flag set to off, with pair limits (F5).
4. **Tests:**
   - round-trip conservation: withdraw 12.3456 ⛤-atoms → minted atoms equal the debit
   - double settle / refund-after-settle rejected
   - deposit replay rejected
   - mutation checks

### Phase 6: Vessel v2, the whole economy on three surfaces
1. **Contract (ASOL `lib/vessel/contract.ts`, additive, still v1):**
   - `pentacles: { atoms: string[4], entries: PentacleEntry[] (recent), pendingWithdrawals: … } | null`
   - `arena: { tokens }` (renamed L5)
   - fixed `onchain` (F8)
   - optional `base` balances (E7)
   - `pillarPool` kept as deprecated
2. **Layers, labeled identically in the ASOL widget, Pentacles drawer and HackStation cockpit:** off-chain ledger ESMS (L1; Kitchen when unfrozen) · pentacles ⛤ (game) · on-chain ESMS (Solana, with slot) · arena tokens (not ESMS).
3. **Streams:** derived from `pentacle_entry.source` and the L1 source types. Tag every ledger row with its source ledger, so nothing is inferred.
4. **Actions:** the only non-handoff is **Request withdrawal** in the Pentacles drawer (a user-signed reducer call). Everything else stays a link.
5. **Economy registry:** a single table (doc + test) listing every source type / reducer with direction, ledger, cap and invariant. CI fails when a credit/debit site isn't registered: `grep` for `creditTokens`/`debit*`/pentacle entry sources vs the registry.

### Phase 7 (last): Kitchen unfreeze
- WTEN PR #849.
- Kitchen streams into Vessel v2.
- Yield harmonization (D3): resolve G8 duplicate source types across L1/L2.
- Decide which Kitchen rewards become pentacles or ESMS.
- Base rail sunset or bridge per E7.

---

## 6. Order and dependencies

```
Phase 3.1 (ASOL, HackStation) ── PRs ──┐
Phase 4  (Pentacles, pre-publish) ─────┼─> publish ─> Phase 5 (Pentacles + ASOL) ─> Phase 6 (all three) ─> Phase 7 (+ WTEN)
Decisions E1–E9 ───────────────────────┘
```
Phase 3.1 and Phase 4 can run in parallel. Nothing in Phase 5 or 6 should ship against an unpublished or paused database.
