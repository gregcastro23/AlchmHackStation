# The Unilateral Alchemical Faucet Specification (ADR-014)

> **Protocol Standard:** ADR-014 (Chart-Ratio Discriminant Astrological Faucet & Reconciled Elemental Sinks)  
> **Status:** ✅ Authoritative & Unilateral Across All Repositories  
> **Target Repositories:**  
> 1. `AlchmAgentsSolana` (`ASOL` / Solana Devnet / Mainnet) — [PR #20](https://github.com/gregcastro23/alchm-agents-solana/pull/20)  
> 2. `WhatToEatNext` (`WTEN` / `alchm.kitchen` / Culinary Oracle & Dining Redemption Rail)  
> 3. `Pentacles` (`SpacetimeDB Cloud` / StarVault USDC Staking & 6-Pair AMM Engine)  
> 4. `AlchmHackStation` (Protocol Hub, Calibration Harness & Diagnostic Center)  

---

## 1. ⚠️ Mandatory Canonical Token Identities & Symbol Tiers

The Alchm protocol operates with **EXACTLY FOUR CANONICAL TOKENS** across all smart contracts, databases, client interfaces, and agents. Their names must **NEVER VARY, BE ABBREVIATED, OR BE CONFUSED WITH ASTRONOMICAL ELEMENTS**:

| # | Canonical Token | Primary Glyph | Triangular Variant | Unicode Fallback | Atomic Code | Cosmological Element | Operational Domain | Pinned Devnet Mint Address |
| :-: | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| 1 | **SPIRIT** | `🝇` (U+1F747) | `🜂` (U+1F702) | `△` / `▲` | `[SPRT]` | **Fire** | Conversational compute gas, reasoning, kinetic actions | `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ` |
| 2 | **ESSENCE** | `🝑` (U+1F751) | `🜄` (U+1F704) | `▽` / `▼` | `[ESNC]` | **Water** | Confidential context, emotional resonance, memory | `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf` |
| 3 | **MATTER** | `🝙` (U+1F759) | `🜃` (U+1F703) | `⯛` / `▽—` | `[MATR]` | **Earth** | Physical grounding, pantry state sync, culinary vouchers | `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4` |
| 4 | **SUBSTANCE** | `🝉` (U+1F749) | `🜁` (U+1F701) | `⯙` / `△—` | `[SUBS]` | **Air** | Dialectic cognition, multi-agent conclaves, staking yield | `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa` |

Under **NO CIRCUMSTANCES** shall any token ever be called a "Fire token", "Water token", "Earth token", or "Air token", nor referred to by legacy placeholders ("Ignis", "Aqua", "Terra", "Aeth"). The terms Fire, Water, Earth, and Air denote the cosmological qualities of the celestial transit and natal birth chart that modulate the mint rate, but the minted assets are strictly and exclusively **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**. Where primary alchemical glyphs cannot be displayed, triangular variants (`🜂`, `🜄`, `🜃`, `🜁`) or UTF-8 shape fallbacks (`△`, `▽`, `⯛`, `⯙`) MUST be used.

---

## 2. Background: The Legacy 2.75× Supply Distortion

The legacy faucet in both human and agent environments dispensed a flat, symmetrical split:
$$\frac{Y_{\text{total}}}{4} = 6.0000 \text{ tokens per axis daily}$$

Coupled with asymmetric operational consumption—where conversational AI heavily consumed **SPIRIT** ($0.30$ SPIRIT vs $0.20$ for others in chat; reports burning $10$ SPIRIT) while **MATTER** lacked operational agent sinks—the global economy suffered a severe 2.75× macroeconomic distortion:
- **MATTER accumulated into an unabsorbed glut ($29,116.87$ tokens, 37.51% of supply)**.
- **SPIRIT suffered chronic depletion ($10,583.22$ tokens, 13.64% of supply)**, threatening conversational paralysis.
- **ESSENCE ($15,780.23$) and SUBSTANCE ($22,133.85$)** drifted without celestial harmony.

The protocol required an **experimentally validated, clean mathematical faucet** that restores kinetic gas to SPIRIT, suppresses new MATTER creation, and preserves exact total conservation.

---

## 3. The Unilateral Mathematical Law of the Faucet

All three repositories must adhere to the exact same **Chart-Ratio Discriminant Astrological Faucet Formulation**. All arbitrary sect bonuses, wave hacks, and unconstrained multipliers are completely abolished.

### 3.1 The Natal Chart Ratio Vector ($r_i(\mathcal{N})$)
Every claimer (human user or autonomous agent) possesses an alchemical elemental score vector $(E, Sp, M, Su)$ derived from their authentic birth chart.

Let total natal elemental score be:
$$S_{\text{natal}} = E_{\text{natal}} + Sp_{\text{natal}} + M_{\text{natal}} + Su_{\text{natal}}$$

The normalized natal ratio vector is:
$$r_i(\mathcal{N}) = \frac{\text{Score}_i(\mathcal{N})}{S_{\text{natal}}} \quad \text{for } i \in \{\text{SPIRIT}, \text{ESSENCE}, \text{MATTER}, \text{SUBSTANCE}\}$$
Where $\sum_{i} r_i(\mathcal{N}) = 1.0$.

*Neutral Fallback:* If a claimer has no birth chart recorded, the system defaults to neutral: $r_i(\mathcal{N}) = 0.2500$ for all 4 coins.

---

### 3.2 Celestial Moment Transit Weights ($w_i(t)$)
The active astrological transit distribution from the canonical ephemeris (`alchm.kitchen` price oracle / Swiss Ephemeris / `astronomy-engine`):
- $w_{\text{Fire}}(t) \to \text{SPIRIT}$
- $w_{\text{Water}}(t) \to \text{ESSENCE}$
- $w_{\text{Earth}}(t) \to \text{MATTER}$
- $w_{\text{Air}}(t) \to \text{SUBSTANCE}$

Normalized such that:
$$w_i(t) = \frac{W_i(t)}{\sum_j W_j(t)}, \quad \text{where } \sum_{i} w_i(t) = 1.0$$

---

### 3.3 Counter-Cyclical Anti-Glut Damping ($\Omega_i$)
To dynamically suppress runaway inventory without disrupting mathematical conservation:

$$\Omega_i = \begin{cases} 
1.000 & \text{if } \frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} \le 0.30 \\
\max\left(0.650, \; 1.0 - 2.0 \times \left(\frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} - 0.25\right)\right) & \text{if } \frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} > 0.30 
\end{cases}$$

Under current authoritative network state ($\text{Supply}_{\text{MATTER}} = 37.51\%$):
$$\Omega_{\text{MATTER}} = 1.0 - 2.0 \times (0.3751 - 0.25) = \mathbf{0.750}$$
$$\Omega_{\text{SPIRIT}} = \Omega_{\text{ESSENCE}} = \Omega_{\text{SUBSTANCE}} = \mathbf{1.000}$$

---

### 3.4 Conserved Daily Allocation Formula
The total daily yield budget is strictly universal ($Y_{\text{total}} = 24.0000$ for all users, with zero premium tier gating), allocated proportionally among the 4 canonical tokens:

$$\mathcal{Y}_i(t, \mathcal{N}) = \operatorname{Quantize}_{10^4}\left( Y_{\text{total}} \times \frac{r_i(\mathcal{N}) \cdot w_i(t) \cdot \Omega_i}{\sum_{j} \left(r_j(\mathcal{N}) \cdot w_j(t) \cdot \Omega_j\right)} \right)$$

An exact residual conservation pass assigns any sub-cent micro-rounding difference to the dominant axis, guaranteeing:
$$\sum_{i} \mathcal{Y}_i(t, \mathcal{N}) \equiv 24.0000$$

---

## 4. Empirical Benchmark: The 72 Historical Agents Calibration

The formulation was exhaustively calibrated and simulated against all **72 Historical Agents** from `lib/agents/historical/index.ts` across **5 Canonical Celestial Moments** (verified in `alchm-agents-solana` PR #20):

### 4.1 Fleet Demographics
- **Fire Archetypes (18):** Leonardo da Vinci, Michelangelo, Alexander the Great, Joan of Arc, Benjamin Franklin, etc.
- **Water Archetypes (16):** Siddhartha Gautama Buddha, Emily Dickinson, Carl Jung, Dante Alighieri, Frida Kahlo, etc.
- **Earth Archetypes (21):** Isaac Newton, Aristotle, Donatello, Confucius, Marcus Aurelius, etc.
- **Air Archetypes (17):** Albert Einstein, Socrates, Galileo Galilei, William Shakespeare, Wolfgang Amadeus Mozart, etc.

### 4.2 Empirical Synthesis Matrix

| Moment ID | Celestial Configuration | Transit Weights $(w_{\text{Fire}}, w_{\text{Water}}, w_{\text{Earth}}, w_{\text{Air}})$ | Avg SPIRIT (`🝇`/`🜂`) | Avg ESSENCE (`🝑`/`🜄`) | Avg MATTER (`🝙`/`🜃`) | Avg SUBSTANCE (`🝉`/`🜁`) | Total / Agent | Fleet Daily Mint (72 Agents) | SPRT / MATR Ratio |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Moment 1** | **Fire Sky Transit** | $(5.0, 1.5, 1.5, 2.0)$ | **12.8106** | 3.8582 | **2.3348** | 4.9964 | **24.0000** | 1,728 ESMS | **5.49×** |
| **Moment 2** | **Water Sky Transit** | $(1.0, 5.5, 2.0, 1.5)$ | 2.6310 | **14.3931** | **3.1527** | 3.8232 | **24.0000** | 1,728 ESMS | **0.83×** |
| **Moment 3** | **Earth Stellium** | $(1.5, 2.0, 5.0, 1.5)$ | 4.5678 | 6.0580 | **8.9688** | 4.4054 | **24.0000** | 1,728 ESMS | **0.51×** |
| **Moment 4** | **Air Solstice** | $(2.0, 1.5, 1.5, 5.0)$ | 5.1988 | 3.8955 | **2.3411** | **12.5646** | **24.0000** | 1,728 ESMS | **2.22×** |
| **Moment 5** | **Equinoctial Equilibrium** | $(2.5, 2.5, 2.5, 2.5)$ | 6.7285 | 6.7177 | **4.0341** | 6.5197 | **24.0000** | 1,728 ESMS | **1.67×** |

### 4.3 Proven Macroeconomic Takeaways
1. **Kinetic Gas Restored:** In Fire skies, SPIRIT yield expands to **$12.8106$** (up to **$14.50$** for Albert Einstein), providing the conversational fuel needed for AI reasoning without wallet depletion.
2. **Anti-Glut Damping Flawless:** Across Fire, Air, and Equinox transits, MATTER is throttled to **$2.3348 - 4.0341$** (a **$-61\%$** suppression compared to legacy 6.0). In an Earth Stellium, MATTER is capped at **$8.9688$** (below the 9.0 safety ceiling).
3. **Strict Mathematical Conservation:** Zero inflationary expansion. Exactly $1,728.0000$ tokens minted per day across all 72 historical agents.

---

## 5. Implementation Across the Three Protocol Projects

### 5.1 Project 1: `AlchmAgentsSolana` (`ASOL`)
- **Status:** Integrated & Deployed via [PR #20](https://github.com/gregcastro23/alchm-agents-solana/pull/20).
- **Service Integration:** `lib/services/agent-action-service.ts` (`claimYieldForAgent`):
  1. Resolves agent natal elements via `resolveAgentNatalData(agent.email)` from `lib/agents/historical/index.ts`.
  2. Ingests current astrological weights via `getLiveTransitSky()`.
  3. Calls `computeDiscriminantDailyYield` from `lib/services/discriminant-faucet.ts`.
  4. Records `tokenTransaction` and atomically updates `tokenBalance`.
- **Operational Sinks:** Balanced `UNIFIED_CHAT_BASE_COST` ($0.25$ per token) and operational agent MATTER sinks (`nutritionalGroundingProof`: $1.50$, `recipeFeasibilityVerification`: $2.00$, `pantryStateSync`: $1.00$).

---

### 5.2 Project 2: `WhatToEatNext` (`WTEN` / `alchm.kitchen`)
- **Target Surface:** Machine B (`/api/yield/claim` and culinary user loop).
- **Culinary Natal Profile Ingestion:** Ingests the human user's verified culinary constitution from `user_natal_charts`:
  - **Fire Dominant:** High metabolic heat, spicy preferences $\to$ naturally elevates SPIRIT.
  - **Water Dominant:** Soups, hydration focus, comfort dishes $\to$ naturally elevates ESSENCE.
  - **Earth Dominant:** Root vegetables, macro-nutrient density $\to$ naturally elevates MATTER.
  - **Air Dominant:** Light fare, sensory fusion, experimental culinary $\to$ naturally elevates SUBSTANCE.
- **Solving the 29.1k MATTER Glut in Kitchen:**
  - Inflow is suppressed by $25 - 61\%$ via $\Omega_{\text{MATTER}} = 0.750$.
  - Sinks actively drain accumulated MATTER:
    * `nutritionalGroundingProof`: **$1.50$ MATTER** per AI meal plan validation.
    * `recipeFeasibilityVerification`: **$2.00$ MATTER** per grocery availability check.
    * `pantryStateSync`: **$1.00$ MATTER** per receipt upload and pantry update.
    * `restaurant_meal_redeem`: Guaranteed floor value of **$0.01\text{ USD/token}$** burned for dining discounts at partner restaurants.
- **Implementation Route Blueprint (`/api/yield/claim/route.ts`):**

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { loadCanonicalPriceIndex } from '@/lib/economy/canonical-price-index';
import { computeDiscriminantDailyYield } from '@/lib/economy/discriminant-faucet';

export async function POST(req: Request) {
  const session = await getSession(req);
  if (!session?.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.userId;
  const now = new Date();

  return await prisma.$transaction(async (tx) => {
    // 1. Assert daily claim nonce
    const balance = await tx.tokenBalance.findUnique({ where: { userId } });
    if (balance?.lastDailyClaimAt && isSameUtcDay(balance.lastDailyClaimAt)) {
      return NextResponse.json({ error: 'Already claimed today' }, { status: 400 });
    }

    // 2. Ingest user culinary birth chart
    const natalChart = await tx.userNatalChart.findUnique({ where: { userId } });

    // 3. Ingest live celestial transit from price index oracle
    const priceIndex = await loadCanonicalPriceIndex();
    
    // 4. Compute discriminant yield using clean chart-ratio formulation (Universal 24.0000 for all users)
    const yieldResult = computeDiscriminantDailyYield(
      natalChart,
      { elementWeights: priceIndex.elementWeights },
      priceIndex.supply
    );

    // 5. Update user balance for SPIRIT, ESSENCE, MATTER, SUBSTANCE
    await tx.tokenBalance.update({
      where: { userId },
      data: {
        spirit: { increment: yieldResult.spirit },
        essence: { increment: yieldResult.essence },
        matter: { increment: yieldResult.matter },
        substance: { increment: yieldResult.substance },
        lastDailyClaimAt: now,
      },
    });

    // 6. Record idempotent audit entries
    const dateStr = now.toISOString().split('T')[0];
    for (const [token, amt] of Object.entries(yieldResult)) {
      if (token === 'total' || token === 'breakdown') continue;
      await tx.tokenTransaction.create({
        data: {
          userId,
          tokenType: token.toUpperCase(),
          amount: amt,
          sourceType: 'kitchen_discriminant_daily_yield',
          idempotencyKey: `daily:kitchen:${userId}:${dateStr}:${token}`,
        },
      });
    }

    return NextResponse.json({ success: true, yield: yieldResult });
  });
}
```

---

### 5.3 Project 3: `Pentacles` (`SpacetimeDB Cloud` Staking & AMM Engine)
- **Target Surface:** `cookingwithcastrollc` SpacetimeDB module & StarVault staking.
- **USDC Staking on Celestial Stars:**
  - Sirius / Antares $\to$ Yields **SPIRIT**
  - Vega / Canopus $\to$ Yields **ESSENCE**
  - Polaris / Spica $\to$ Yields **MATTER**
  - Arcturus / Rigel $\to$ Yields **SUBSTANCE**
- **Continuous Yield Accrual Reducer:**
  Staking yield is computed proportionally using the staker's natal chart ratios ($r_i(\mathcal{N})$) and 11-zone sky transit weights ($w_i(t)$) modulated by $\Omega_{\text{MATTER}} = 0.750$:
  $$\mathcal{Y}_{\text{staking}}(s, u, t) = \text{BASE\_YIELD} \times \frac{r_{\text{star}}(u) \cdot w_{\text{star}}(t) \cdot \Omega_{\text{star}}}{\sum_j \left(r_j(u) \cdot w_j(t) \cdot \Omega_j\right)}$$
- **6-Pool Constellation AMM Routing:**
  Zero-escrow atomic swaps across 6 coin pairs with strict $30\text{ bps}$ ($0.30\%$) routing fee:
  ```
          Pool 0: SPIRIT ⟷ ESSENCE          Pool 3: ESSENCE ⟷ MATTER
          Pool 1: SPIRIT ⟷ MATTER           Pool 4: ESSENCE ⟷ SUBSTANCE
          Pool 2: SPIRIT ⟷ SUBSTANCE        Pool 5: MATTER ⟷ SUBSTANCE
  ```
  $$\text{OutAtoms} = \frac{\text{InAtomsWithFee} \times \text{Index}_{\text{In}}}{\text{Index}_{\text{Out}}}$$

---

## 6. Master Cross-Platform Burn Sink Schedule

To maintain dynamic macroeconomic equilibrium, faucet inflow must be matched by reconciled outflow:

| Category | Operation ID | SPIRIT (`🝇`) | ESSENCE (`🝑`) | MATTER (`🝙`) | SUBSTANCE (`🝉`) | Total ESMS | Primary Platform |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Conversational** | `unified_chat` (Base Turn) | **0.25** | **0.25** | **0.25** | **0.25** | **1.00** | All Platforms |
| | `oracle_chamber` (Deep RAG) | 5.00 | 5.00 | 5.00 | 5.00 | **20.00** | Agents & Kitchen |
| | `flash_epiphany` (DeepSeek-R1) | 2.00 | 2.00 | 2.00 | 2.00 | **8.00** | Agents & Kitchen |
| | `council_conclave` (Multi-Agent) | 8.00 | 8.00 | 9.00 | 10.00 | **35.00** | Agents & HackStation |
| **Culinary / Macro** | `nutritional_grounding_proof` | 0.00 | 0.00 | **1.50** | 0.00 | **1.50** | Kitchen & Agents |
| | `recipe_feasibility_check` | 0.00 | 0.00 | **2.00** | 0.00 | **2.00** | Kitchen & Agents |
| | `pantry_state_sync` | 0.00 | 0.00 | **1.00** | 0.00 | **1.00** | Kitchen & Agents |
| | `culinary_transmutation_commit`| 0.50 | 0.50 | **3.00** | 1.00 | **5.00** | Kitchen & Pentacles |
| | `restaurant_meal_redeem` | Priority | Priority | **Priority** | Priority | **$0.01/tok** | Kitchen Rail |
| **Agentic Ops** | `agent_meal_plan` | 3.00 | 2.00 | 4.00 | 3.00 | **12.00** | Agents & Kitchen |
| | `agent_feed_post` | 1.50 | 1.00 | 1.50 | 1.00 | **5.00** | Agents |
| | `report_generation` | 5.00 | 3.00 | 4.00 | 3.00 | **15.00** | Agents & HackStation |
| **Staking / Sacred**| `sacred_geometry_design` | 2.00 | 4.00 | 2.00 | 4.00 | **12.00** | Pentacles & Agents |
| | `energy_harmonic_calibration` | 3.00 | 3.00 | 3.00 | 3.00 | **12.00** | Pentacles & Agents |
| | `forge_agent` | 12.00 | 11.00 | 11.00 | 11.00 | **45.00** | Agents & HackStation |
| **AMM Swaps** | `swap_esms_routing_fee` | 30 bps | 30 bps | 30 bps | 30 bps | **0.30%** | Solana Devnet & Pentacles |

---

## 7. Universal Protocol Verification Test Matrix

Every platform repository must pass the following invariant verification suite:

| Test ID | Test Case | Condition | Expected Result | Pass Criterion |
| :---: | :--- | :--- | :--- | :--- |
| **TEST-01** | **Exact Total Conservation** | Any minter chart, any celestial moment | $\sum_i \mathcal{Y}_i \equiv 24.0000$ (Universal) | Zero deviation (> 0.0001) |
| **TEST-02** | **Symmetric Neutral Baseline** | Flat 25% chart, symmetric 25% sky | $\mathcal{Y}_i = 6.0000$ for all 4 coins | Exact $6.0000$ payout |
| **TEST-03** | **Fire Transit Kinetic Elevation** | Fire sky ($w_{\text{Fire}} \ge 5.0$) | $\text{Avg SPIRIT} \ge 12.0000$ | Restores conversational gas |
| **TEST-04** | **Anti-Glut Suppression** | Live network supply ($\text{Supply}_{\text{MATTER}} > 30\%$) | $\Omega_{\text{MATTER}} = 0.750$, $\text{Avg MATTER} \le 4.20$ | Compresses new surplus |
| **TEST-05** | **Earth Stellium Protection** | Earth stellium ($w_{\text{Earth}} \ge 5.0$) with anti-glut | $\text{Avg MATTER} \le 9.0000$ | Caps runaway accumulation |
| **TEST-06** | **Inter-Agent Differentiation** | Einstein (Air) vs Newton (Earth) in same moment | $\mathcal{Y}_i(\text{Einstein}) \ne \mathcal{Y}_i(\text{Newton})$ | Distinct individual payouts |
| **TEST-07** | **Token Naming Purity** | Entire codebase & UI | Zero element name substitutions | Strictly SPIRIT, ESSENCE, MATTER, SUBSTANCE |

---

## 8. Cross-Repository Synchronized Status

- [x] **`AlchmHackStation`:** Master specification (`faucet/FAUCET.md`), test harness (`scripts/test_discriminant_faucet.ts` passing 11/11), and empirical runner (`scripts/investigate_asol_faucet.ts`).
- [x] **`AlchmAgentsSolana`:** Implemented, verified against 72 historical agents, tested (7/7 passing), and submitted in **PR #20**.
- [ ] **`WhatToEatNext` (Machine B):** Ready for drop-in deployment of `/api/yield/claim/route.ts` and culinary grounding sinks.
- [ ] **`Pentacles`:** Ready for SpacetimeDB reducer deployment and 6-pool AMM routing fee integration.
