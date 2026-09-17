# Steering addendum: pentacles as the Jing currency

**Applies to:** `docs/PHASE4_ECONOMY_AND_PENTACLES_PLAN.md`. Where they conflict, this addendum wins.

**Code state checked 2026-09-17:**
- **Pentacles:** `main` = `0910f7e` (#67). No pentacle ledger yet.
- **ASOL:** `feat/esms-attestation` (`6f8a3e1`, `3c59744`), unpushed. Phase 3.1 not started.
- **HackStation:** `feat/amm-sync` (`e56873d`), unpushed.

---

## 0. What the user decided

| # | Decision | Effect on the plan |
|---|---|---|
| E1 | The intermediary quantity is **pentacles (⛤)** | Adopted |
| E2 | **Merge `jing_pool.esms` and `pillar_pool.esms`** into one pentacle balance; pillar pools exist to make Jings resolve correctly | Adopted (Phase 4) |
| E4 | Pentacles are **earned in Jing duels and by playing Pentacles**. No ESMS is minted per duel win. | **Supersedes Phase 3 Workstream A's per-win mint** |
| New | Pentacles convert **to and from ESMS in the Vessel**, at a **user-specific rate** from the live ESMS ticker and a **birth-chart gate** | Replaces plan §5 Phase 5 (withdrawal bridge) |
| New | alchm.kitchen achievements keep paying **ESMS directly**. The Kitchen never pays pentacles. | Confirms the WTEN freeze scope |
| E6 | **Rework the ASOL shop**; don't just rename `pentacles` → `sigils` | Replaces plan §3 collision fix and E6 |
| New | ESMS keeps paying for **agent operations on ASOL** | Unchanged |
| Question | Are pentacles needed by the web3 infrastructure? | **No.** See §5 |

---

## 1. The three quantities

| Quantity | Earned from | Spent on | Lives in | On-chain? |
|---|---|---|---|---|
| **ESMS**: Spirit, Essence, Matter, Substance | Kitchen achievements and yields (direct), Agents yields, Stripe bundles, **pentacle conversion** | ASOL agent operations, ASOL shop, **conversion into pentacles** | Kitchen ledger (source of truth) mirrored by ASOL `token_balances`; optionally Solana Token-2022 via `/api/esms/claim` | Yes, as today |
| **Pentacles ⛤** | Jing duels (including 14-Pillars resolution), Pentacles gameplay, **ESMS conversion** | Jing and pillar casts, duel stakes, **conversion into ESMS** | Pentacles SpacetimeDB only | **No** |
| **Arena tokens** (`player.tokens`) | Word duels, Stardex, AR capture, anomaly locks | Sieges, adding stars | Pentacles SpacetimeDB | No; not convertible (E5 name still open) |

---

## 2. Shape of a pentacle balance

**Recommendation P1: element-colored pentacles.** One quantity (⛤) held in four colors: Spirit ⛤, Essence ⛤, Matter ⛤, Substance ⛤.
- **Headline:** the Vessel and UIs show the total ⛤ and the per-element breakdown.
- **Why:** Jing and pillar resolution work on a per-element vector. Pool transfers obey Σ|Δ| ≤ q per element, and circuit power uses `natal[k] × pools[k] / POOL_BASELINE`. A single colorless balance would force a redesign of duel resolution, which contradicts E2's purpose.
- **Conversion is same-element only:** Spirit ⛤ ↔ Spirit ESMS, and so on. Cross-element moves stay with gameplay and the ESMS AMM. That removes a whole class of rate-arbitrage loops.
- **Storage (plan E3):** `pentacle_balance.free_atoms` and `bound_atoms`, both `[u64; 4]`, with 1 ⛤ = 1,000 pentacle atoms. Circuit math stays f64 in flight and is quantized on write.

**P1 must be confirmed before the Phase 4 schema is frozen.**

---

## 3. The conversion rate (`PENTACLE_RATE_V1`)

### 3.1 Inputs
- **Ticker:** Kitchen's canonical price index, served by ASOL `GET /api/economy/price-index` through `lib/economy/canonical-price-index`.
  - **Per token:** `index`, a **dimensionless index point, not USD**, plus `compositeIndex` = plain mean of the four token indices (WTEN `src/lib/economy/priceIndex.ts:435`), `bucketStartUtc` and `degraded`.
  - **No fallback price:** the route publishes none, and conversion must not invent one.
- **Gate:** new. Computed per identity, per element, from the natal chart (§3.3).

### 3.2 Formula
Let `V⛤ = compositeIndex / 10`, the value of one pentacle in index points. At par (all four indices equal, gate = 1), 10 ⛤ = 1 ESMS, matching the game peg (starter 80 ⛤ ≈ 8 ESMS; one cast = 10 ⛤ ≈ 1 ESMS).

```
⛤ → ESMS (element k):  esms_k  = floor_atoms( ⛤_k × V⛤ / index_k × gate_k )
ESMS → ⛤ (element k):  ⛤_k    = floor_atoms( esms_k × index_k / V⛤ × gate_k )
```

**Invariant R1 (no round-trip profit):** for any element and one price snapshot, ESMS → ⛤ → ESMS returns at most the input, because `gate_k² ≤ 1` and both legs floor.
- **Why the gate must be a haircut:** it must lie in `[G_MIN, 1]`. A gate above 1 in either direction lets a loop, directly or through the AMM, mint value.
- **Enforcement:** a property test in TypeScript and Rust over random charts, indices and amounts, plus a mutation check (allow `gate > 1`; the test must fail).

**Invariant R2 (floor toward the system):** every conversion output is floored to atoms. Dust stays unconverted and is recorded on the conversion row.

### 3.3 Gate (`PENTACLE_GATE_V1`)
- **Formula:** `s_k = natalEsms_k / Σ natalEsms` (dignity-weighted natal ESMS, `natal_esms` in `alchm-astro-core/src/circuit.rs`, TS twin `natalEsms` in ASOL `lib/alchemical-circuit.ts`, already matched between the two). Then `gate_k = G_MIN + (1 − G_MIN) × s_k / max_j s_j`. The user's strongest natal element converts at 1.0; weaker elements take a bounded haircut.
- **Where it's computed:** in **Pentacles**. `natal_chart` is private to its owner (`tables.rs:58`), so ASOL can't read it over the SQL API. Compute the gate when a chart is committed and store it in `pentacle_gate { identity, gates: [f64; 4], version }`. Make that table private, with ASOL reading it using the module-owner/feeder token. The chart is immutable once committed, so users can't re-roll their gate.
- **Parity:** the same golden vectors (chart → gates → rates) are asserted in `cargo test` and ASOL vitest.
- **Open decisions:**
  - **P2:** `G_MIN` (recommend **0.85**) and a conversion fee (recommend **0 bps** in V1, since the haircut already prevents loops).
  - **P3:** no committed chart → gates all `G_MIN` (recommended) or conversion disabled.

### 3.4 Quote rules
- **Refuse when the ticker isn't trustworthy:** `live !== true`, `degraded !== null`, or a stale `bucketStartUtc` (older than one bucket).
- **Quotes:** single-use, expiring at `min(120 s, end of bucket)`, storing every input (indices, composite, gates, gate version, amounts, outputs, dust).
- **Caps (P4):** per identity, per UTC day, per direction; plus a minimum amount per conversion.

---

## 4. Conversion execution (Vessel "Convert")

### 4.1 Which ESMS ledger
- **Kitchen is authoritative** for off-chain ESMS (ASOL `lib/alchm-debit-sync.ts`). Its `POST /api/economy/sync-credit` and `/sync-debit` already take an `idempotencyKey`: replay → 409; `sync-debit` insufficient funds → 402.
- **No WTEN code change is needed.** Confirm the production deployment has this behavior before relying on it.
- **Prerequisite P9 (ledger duality).** ASOL agent spends debit ASOL's local `token_balances` in a transaction (`EconomyService.debitOperation`), and credits sync to Kitchen **fire-and-forget**. A conversion credited only at Kitchen may not be spendable on ASOL until the mirrors agree; one credited only locally may never reach Kitchen. Before Phase 5 ships, choose one:
  - **(a) Recommended:** conversions write Kitchen first (idempotent), then the ASOL mirror with the same key.
  - **(b)** ASOL reads spendable balances from Kitchen.

  Never use fire-and-forget for a conversion.

### 4.2 Orchestration: ASOL runs it; Pentacles holds pentacles
**Auth:** session or desktop key. Identity resolves via `verified_solana_wallet`, the same pattern as `vessel/summary` and the duel route.

**New Pentacles reducers**, feeder or module-owner only, each one-shot per `conversion_id`, with table `pentacle_conversion { id, identity, direction, pentacle_atoms[4], esms_atoms[4], quote_hash, state: Escrowed|Settled|Refunded, created_at }`:
- `escrow_pentacles_for_conversion(identity, id, atoms)`: debits **free** atoms only.
- `settle_pentacle_conversion(id)`
- `refund_pentacle_conversion(id)`
- `credit_pentacles_from_conversion(identity, id, atoms)`

**⛤ → ESMS**
1. `POST /api/vessel/convert/quote` stores a quote.
2. `POST /api/vessel/convert/execute { quoteId }` runs:
   1. `escrow_pentacles_for_conversion` (fails on insufficient free atoms).
   2. Kitchen `sync-credit` with key `pentacle_conv:<id>`, source `pentacle_conversion` (and the ASOL mirror, per P9).
   3. On 200 or 409 → `settle_pentacle_conversion`. On any other definitive failure → `refund_pentacle_conversion`.

**ESMS → ⛤**
1. Kitchen `sync-debit` with key `pentacle_conv:<id>`. A 402 ends the conversion cleanly.
2. `credit_pentacles_from_conversion`, retried idempotently.
3. Only if the reducer **definitively** rejects: `sync-credit` refund with key `pentacle_conv_refund:<id>`.

**Reconciler:** escrows older than T are resolved by checking Kitchen for the idempotency key → settle or refund, **never both**. Tests cover crash-between-steps for every step.

**Chain:** unchanged. ESMS ↔ Solana still goes through `/api/esms/claim` and the shop's burn rail. Pentacles never touch the chain.

---

## 5. Do pentacles need to exist on-chain? No.

| Web3 component | Needs pentacles? |
|---|---|
| Four Token-2022 ESMS mints (NonTransferable + PermanentDelegate) | No |
| `claim_mint_esms`, `redeem_esms`, `redeem_for_esms`, receipt PDAs | No: conversions settle in the off-chain ESMS ledger; chain moves stay ESMS |
| Constellation AMM (6 pairs over 4 elements, visibility attestation) | No. A 5th asset would add 4 pools, a 5th mint, and a second cross-element path competing with the AMM. |
| StarVault staking, Ed25519 attestor | No |

**Why pentacles stay off-chain:**
- **Rates are personal.** Conversion rates depend on a gate per chart. A transferable ⛤ token would be routed through whichever holder has the best gate, and a NonTransferable one adds nothing over SpacetimeDB state.
- **Gameplay needs speed.** It needs gasless, sub-second, high-frequency writes.
- **Cost.** An on-chain ⛤ means a program upgrade, IDL, audit and AMM redesign for no current user benefit.
- **Supply stays auditable.** On-chain supply remains ESMS-only.

**Revisit only if** pentacles must be portable beyond Pentacles and ASOL, verifiable by third parties, or used as on-chain collateral. The shape then would be a NonTransferable 5th mint whose conversion instruction verifies an Ed25519-signed quote. That's Phase 8+ at the earliest.

**Consequence for Phase 3:**
- **Retire the per-win ESMS mint** in `app/api/solana/duel-attestation`. Don't fix F1 by tuning the reward; remove the minting path. The route's server-authoritative duel reading and wallet checks can move into the conversion routes.
- **F3/F4 lessons carry over:** fail closed on DB identity; use a dedicated claim table with a pending-before-mint lock; no swallowed writes.
- **Keep `amm-quote`** once F2 is fixed; the ESMS AMM stays.

---

## 6. Phase 4 rewire list (replaces plan §5 Phase 4, step 3)

**Bound vs free (P6, recommended).** Sign-in grants and starter balances are **bound**: spendable in play, **not convertible**. Everything won or converted in is **free**. Spending draws down bound atoms first. Without this, the 80 ⛤ starter and the daily faucet become a sybil-farmable ESMS mint once conversion ships: every new account with a chart could convert them.

| Kind | Source | Code today | Credits |
|---|---|---|---|
| Earn | Jing round-pot shares | `record_round_play` / `round_pot_share` | free |
| Earn | Jing and pillar duel outcomes (zero-sum transfers), escrow refunds | `cast_jing`, `counter_jing`, `counter_pillar`, `answer_pillar`, `cancel_pillar_duel`, `sweep_stale_pillar_duels` | free (a transfer keeps the loser's bound/free mix? **P10**; recommend the winner receives free) |
| Earn | Melee round yield | `melee_settle` | free |
| Earn | Zone-capture bounty | `apply_control` | free |
| Earn | Decan dividends (E8 → pay in pentacles) | `settle_decan_boundary` (records only today) | free |
| Earn | Daily sign-in faucet (P5: keep, credited **once**) | `claim_daily_faucet` → `compute_faucet_pool_credit` | **bound** |
| Earn | Starter 80 ⛤ | `ensure_jing_pool` / `ensure_pillar_pool` | **bound** |
| Earn | ESMS → ⛤ conversion | new `credit_pentacles_from_conversion` | free |
| Spend | Jing cast/counter (10 ⛤), pillar cast escrow (10 ⛤) | `drain_pool`, `cast_pillar` | bound first |
| Spend | ⛤ → ESMS conversion | new `escrow_pentacles_for_conversion` | free only |
| Remove | Direct on-chain → pool credit that bypasses the rate | `sync_solana_event` → `apply_esms_event_to_jing_pool` (never called by the feeder) | delete the credit; on-chain ESMS reaches pentacles only through the ledger and conversion |
| Migrate | Guest → profile claim | `claim_profile` (moves jing today, **not** pillar) | move `pentacle_balance`, entries, gate |

**Unchanged:** `jing_pool.sacred7` (stats, not currency); `player.tokens`.

**Tests:**
- **Faucet credits exactly once.**
- **Conservation:** Σ `pentacle_entry` = balance, as a property test.
- **Bound atoms are never convertible.**
- **Mutation checks** on credit-once, bound-first spend, and free-only escrow.

**Also in Phase 4:** the `pentacle_gate` table and gate V1, plus the conversion reducers and table, built and tested but not called until Phase 5.

---

## 7. ASOL shop rework (replaces rename to `sigils`)

**Today:** 7 items in `lib/shop/catalog.ts`.
- **ESMS bundle:** 1 (`tokens`, Stripe/USD).
- **`apothecary`:** 3 (elixir, boost, catalyst).
- **`pentacles`:** 3 (`unlock-philosophers-stone`, `star-vessel-ignition`, `elemental-reservoir-expansion`).
- **Prices:** an ESMS basket plus USD cents.
- **Settlement:** Solana `redeem_for_esms` burn, Base ERC-1155 burn, or USDC/card (`app/api/shop/purchase`).
- **Effects:** none of the six digital item ids is read anywhere outside the catalog, so buying one unlocks no product behavior yet. Confirm by reading the entitlement write in the purchase route.

**Principles:**
1. **The shop sells agent-side value for ESMS,** because ESMS operates agents. Every item has a concrete effect consumed in code, plus a registry test that every item id has a consumer. No decorative items.
2. **Pentacles aren't a shop currency in V1 (P7).** Users convert ⛤ → ESMS in the Vessel first. One conversion point keeps rate logic in one place.
3. **Default settlement is the off-chain ESMS ledger,** the same path agent operations use (idempotent by `orderId`). The on-chain burn stays an optional rail for holders of on-chain ESMS. The Base rail follows E7 (still open).
4. **Replace kind `pentacles` with categories by effect:**
   - **`tokens`:** ESMS bundles (keep).
   - **`agent-capacity`:** forge slots, synastry pairing slots, EV-reset bundles, model-tier access. Consumers: `app/api/create-agent`, `app/api/agents/unified`, `lib/premium/entitlements`.
   - **`agent-consumables`:** give the apothecary items real, time-boxed effects (e.g. a discount on `AGENT_OPERATION_COSTS`, extra council rounds), or remove them.
   - **Map or drop the three current `pentacles` items.** Keep old ids resolvable for existing purchases.
5. **Don't sell conversion capacity** (higher caps or better gates) without an explicit economic decision; it undermines R1 and P4.

---

## 8. Decisions still needed

| # | Decision | Recommendation |
|---|---|---|
| P1 | Element-colored pentacles, same-element conversion | **Yes** (blocks Phase 4 schema) |
| P2 | `G_MIN`, fee | **0.85, 0 bps** |
| P3 | No chart → gate | **All `G_MIN`** |
| P4 | Conversion caps (per identity, per UTC day, per direction; minimum amount) | Set numbers before Phase 5 |
| P5 | Keep daily faucet (in pentacles) | **Yes, credited once** |
| P6 | Bound vs free pentacles | **Yes** |
| P7 | Pentacle-priced items in ASOL shop | **No in V1** |
| P8 | `V⛤ = compositeIndex / 10` | **Yes** (composite is the mean of the four indices) |
| P9 | ESMS ledger for conversions (Kitchen vs ASOL mirror) | **Kitchen first, then mirror, same key** |
| P10 | Bound/free mix of transferred duel pentacles | **Winner receives free** |
| E5, E7, E9 | `player.tokens` name; canonical chain; peg/caps review | Still open from the plan |

---

## 9. Revised sequence

| Phase | Repos | Scope |
|---|---|---|
| **3.1** | ASOL, HackStation | Plan §1.2 fixes **minus F1**: remove the per-win ESMS mint instead. Fix F2 (real simulation or `null`), F3/F4 patterns, F6–F12. Push PRs; don't merge without approval. |
| **4** | Pentacles, before `spacetime publish` | Step 0 (verify no live `faucet_transaction` / `pillar_pool` rows), then the pentacle ledger with bound/free (§6), `claim_profile`, decan dividends, removal of `sync_solana_event` credit, `pentacle_gate` + gate V1 golden vectors, conversion reducers and table (unused yet). Publish runbook with approval. |
| **4.5** | ASOL | Resolve P9. Add `lib/pentacles/rate.ts` (rate V1, same golden vectors, R1/R2 property tests), quote and execute routes, reconciler, ticker freshness rules, caps. Mutation checks: `gate > 1`, rounding up, settle-and-refund, bound conversion. |
| **5** | ASOL widget, Pentacles drawer, HackStation cockpit | **Vessel Convert.** User-initiated in the ASOL widget and Pentacles drawer; read-only in the HackStation cockpit. The panel shows the per-element gate, index snapshot with bucket, expiry, floored output and dust, caps remaining, and bound vs free ⛤. When the index is degraded or stale, show "conversion unavailable", never an estimate. The Vessel contract adds `pentacles: { free, bound, gates, recentEntries, pendingConversions }`; `pillarPool` is deprecated. |
| **6** | ASOL | Shop rework (§7) |
| **7** (last) | + WTEN | Kitchen unfreeze: Kitchen achievements stay ESMS-direct, yield harmonization (G8), PR #849, E7 Base rail |
