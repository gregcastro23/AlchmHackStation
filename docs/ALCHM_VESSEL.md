# The Alchm Vessel — cross-app treasury

One read-only view of a player's ESMS holdings and the streams that filled them, rendered on four surfaces from one contract.

```
alchm.kitchen (WTEN)                agents.alchm.kitchen (ASOL)                 surfaces
────────────────────                ────────────────────────────                ────────
token_transactions ──► GET /api/economy/vessel ─┐
user_quest_progress                             ├─► GET /api/vessel/summary ─┬─► ASOL TokenHUD + /profile
AgentJingDuel, VerifiedSolanaWallet ────────────┤   (contract v1)            ├─► Pentacles "Alchm Vessel" drawer
Pentacles SpacetimeDB (public tables) ──────────┤                            └─► HackStation cockpit (dev proxy)
Kitchen canonical price index (USD rail) ───────┘
WTEN profile "Tokens" tab ◄── GET /api/economy/vessel (direct)
```

## Files

| Repo | File | Role |
| --- | --- | --- |
| WhatToEatNext | `src/lib/economy/vessel.ts` | Stream classifier (credit-only source types), 4-dp quantization |
| | `src/lib/economy/loadVesselLedger.ts` | Ledger + quest + streak read |
| | `src/app/api/economy/vessel/route.ts` | Session or `X-Sync-Secret` + `email`; rejects `userId` |
| | `src/components/economy/AlchmVesselKitchen.tsx` | Profile → Tokens tab |
| alchm-agents-solana (branch `feat/alchm-vessel`, worktree `ASOL/wt-alchm-vessel`, off `main`) | `lib/vessel/contract.ts` | `AlchmVesselState` v1 |
| | `lib/vessel/summary.ts`, `lib/vessel/spacetime-stats.ts` | Source readers + pure assembly |
| | `app/api/vessel/summary/route.ts` | Session or desktop API key (`lib/security/desktop-auth.ts`), wallet assertion, CORS allowlist |
| | `components/AlchmVesselWidget.tsx` | TokenHUD toggle (compact), profile (full) |
| Pentacles | `src/ui/vessel-model.js`, `src/ui/vessel-drawer.js` | Arena folio (own SpacetimeDB) + treasury folio |
| AlchmHackStation | `src/lib/alchmVessel.ts`, `src/components/AlchmVessel.tsx` | Default cockpit tab |
| | `vite.config.ts` → `/api/vessel/summary` | Dev-only server proxy holding the operator's desktop API key |

## Configuration

| Where | Variable | Notes |
| --- | --- | --- |
| HackStation `.env.local` | `ALCHM_DESKTOP_API_KEY` | An `alchm_desktop_…` key bound to the operator's Agents account (30-day expiry). Sign in at `agents.alchm.kitchen/profile?desktopLink=true` and take the `apiKey` from the "Open desktop" link. Issuing a key retires the previous Alchm Desktop key, so reuse the desktop companion's key if you run both. Server-side only. |
| | `ALCHM_AGENTS_URL` | Optional, defaults to `https://agents.alchm.kitchen`. |
| ASOL | `ALCHM_KITCHEN_SYNC_URL`, `ALCHM_KITCHEN_SYNC_SECRET` | ASOL → Kitchen only (already used by `/api/economy/balances`). No client holds this secret. |
| | `VESSEL_ORIGINS` | Optional extra CORS origins (comma-separated), e.g. `http://localhost:5173` for Pentacles dev. |
| | `NEXT_PUBLIC_SPACETIME_URI`, `NEXT_PUBLIC_SPACETIME_MODULE` | Which Pentacles database to read. Defaults to `cookingwithcastrollc`; the Pentacles client defaults to `pentacles1`, so confirm they match. |
| Pentacles | `VITE_AGENTS_ORIGIN` | Optional, defaults to `https://agents.alchm.kitchen` (already covered by the CSP `https://*.alchm.kitchen`). |

The WTEN route must be deployed before ASOL's `kitchenLedger` source works, and ASOL's route before Pentacles/HackStation treasury views work.

## Security invariants

- No surface can name another user: `userId` is rejected; `wallet` is an assertion checked against the caller's verified wallet (403 on mismatch); the HackStation proxy authenticates with a key bound to one account.
- A presented desktop key is the only credential considered: an invalid key or the unlinked `dev-desktop-token` gets 401 and never falls back to a cookie.
- Sync-secret comparisons are timing-safe. CORS credentials are echoed only for allowlisted origins.
- Offline caches are keyed per signed-in user and cleared on 401.
- The Vessel never mints, moves, or converts ESMS. "Transmute", "Route via AMM", and "On-Chain Sync" hand off to the existing flows (alchm.kitchen/feed, Token-2022 Hub → Bespoke AMM, agents.alchm.kitchen/account).

## Data coverage (what is real today)

| Stream | Backed by | Not yet tracked |
| --- | --- | --- |
| Jing & 14 Pillars duels | `duel_yield` ledger credits; Agents `AgentJingDuel` count; Pentacles `jing_duel`/`pillar_duel` wins | Agents Jing rows have no winner; `pillar_*` tables exist only once the module is republished |
| Staking & yields | `daily_yield`, `kitchen_daily_yield`, `agents_daily_yield`, `agents_yield`, `streak_bonus`, `transit_attunement`; streak | StarVault accrual (`star_stake` is private; on-chain positions not aggregated server-side); decan dividends |
| Pentacles melee | `player.tokens`, `word_wins`, `pillar_pool`, live `melee_seat` | Trick/meld/clean-sweep rewards are not persisted per player or credited to the ledger |
| Kitchen achievements | `quest_reward`, `group_chat_quest`, `alchemical_log`; `user_quest_progress` | — |
| USD value | Kitchen price index `railsUsd.redeemPerTokenUsd` | Shown as "—" whenever no rail is published; no APY is computed |

To add a stream source, write it as a credit with a new `source_type`, then add that type to `VESSEL_STREAM_SOURCES` in WTEN (the tests pin that no type maps to two streams).

## Tests

```bash
# WhatToEatNext
bun run jest src/lib/economy/__tests__/vessel.test.ts
# alchm-agents-solana (in the wt-alchm-vessel worktree; includes the spec's auth + agent duel suites)
bunx vitest run test/vessel test/jing-duels-auth.test.ts test/pillar-agent-duel.test.ts
# Pentacles (also part of test:client)
bun run test:vessel
```
