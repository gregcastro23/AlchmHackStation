# WhatToEatNext (WTEN / alchm.kitchen) — Astrological Faucet Specification (`Faucet.md`)

> **Target Repository:** `WhatToEatNext` (`alchm.kitchen`)  
> **Status:** Draft Implementation Specification (To be deployed on Machine B)  
> **Protocol Standard:** ADR-014 (Discriminant Astrological Faucet & Reconciled Elemental Sinks)  
> **Canonical Protocol Coins:** **SPIRIT**, **ESSENCE**, **MATTER**, **SUBSTANCE**  
> **Price Oracle Authority:** `alchm.kitchen` (`/api/economy/price-index`)  
> **Authoritative Ledger:** PostgreSQL (`token_balances`, `token_transactions`, `user_natal_charts`)  
> **Fiat / Food Credit Rail:** $0.01 USD / token (`redeemPerTokenUsd: 0.01`)  

---

## ⚠️ CANONICAL TOKEN IDENTITY MANDATE

The Alchm protocol operates with **EXACTLY FOUR CANONICAL TOKENS**. Their names must **NEVER VARY, BE ABBREVIATED, OR BE CONFUSED WITH ASTRONOMICAL ELEMENTS OR RETIRED PLACEHOLDERS**:

1. 🪙 **SPIRIT** (Symbol: `SPIRIT` | Glyph: `🝇` | Pinned Devnet Mint: `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ`)
2. 🪙 **ESSENCE** (Symbol: `ESSENCE` | Glyph: `🝑` | Pinned Devnet Mint: `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf`)
3. 🪙 **MATTER** (Symbol: `MATTER` | Glyph: `🝙` | Pinned Devnet Mint: `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4`)
4. 🪙 **SUBSTANCE** (Symbol: `SUBSTANCE` | Glyph: `🝉` | Pinned Devnet Mint: `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa`)

Under NO circumstances should any coin ever be called a "Fire token", "Water token", "Earth token", or "Air token", nor referred to by legacy placeholders ("Ignis", "Aqua", "Terra", "Aeth"). The terms Fire, Water, Earth, and Air denote the cosmological qualities of the celestial transit and natal birth chart that modulate the mint rate of the four canonical tokens, but the minted assets are strictly and exclusively **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.

---

## 1. Executive Summary & Culinary Context

`WhatToEatNext` (`alchm.kitchen`) is the **canonical price oracle authority** and the primary consumer-facing culinary application of the Alchm protocol. 

In this ecosystem:
1. **Human Food Consumers Claim Daily Yield:** Users visit `/yield` or use the kitchen desktop app to claim their daily elemental allowance.
2. **Users Accumulate MATTER as Culinary Equity:** MATTER directly represents tangible nutrition, pantry ingredients, meal preparation, and recipe execution.
3. **The Dining Redemption Sink:** Users redeem accumulated tokens at participating restaurants at the guaranteed floor rate of **$0.01 USD per token** (`redeemPerTokenUsd = 0.01`).

---

## 2. The Culinary Faucet Problem: Why Humans Accumulated a 29.1k MATTER Glut

Under the legacy flat faucet:
- Every human user received a static **6.0 MATTER, 6.0 SPIRIT, 6.0 ESSENCE, and 6.0 SUBSTANCE** daily.
- While users burned SPIRIT asking AI agents for recipes, they had **no reason or mechanism to burn MATTER** until they physically ordered food.
- Consequently, MATTER stockpiled in user balances, creating a 37.5% network-wide glut ($29,116.87$ tokens) while SPIRIT reserves were exhausted ($10,583.22$).

---

## 3. The Discriminant Culinary Faucet Formulation

When a culinary user claims yield at `/api/yield/claim`, the yield vector $[Y_{\text{SPIRIT}}, Y_{\text{ESSENCE}}, Y_{\text{MATTER}}, Y_{\text{SUBSTANCE}}]$ is dynamically calculated using the user's birth chart and the real-time celestial transit:

$$\mathcal{Y}_i(t, \mathcal{N}_u) = \operatorname{Quantize}_{10^4}\left( Y_{\text{base}} \times \mathcal{D}_i(t) \times \mathcal{A}_i(\mathcal{N}_u) \times \mathcal{R}_i(t, \mathcal{N}_u) \times \Omega_i \times \mathcal{M}_{\text{tier}} \right)$$

### 3.1 Culinary Natal Ingestion (`user_natal_charts`)
The claim endpoint inspects the user's culinary constitution:
- **Culinary Natal Profile:**
  - Fire Dominant $\to$ High metabolic heat, spicy preferences, high dynamic energy (SPIRIT affinity).
  - Water Dominant $\to$ Hydration focus, soups, intuitive palate, comfort foods (ESSENCE affinity).
  - Earth Dominant $\to$ Root vegetables, slow-cooked grounding meals, strict macro adherence (MATTER affinity).
  - Air Dominant $\to$ Light fare, experimental fusion, intellectual culinary exploration (SUBSTANCE affinity).
- **Seasonal Transits:**
  - In summer (Fire season) $\to$ SPIRIT yield is naturally elevated.
  - In autumn (Earth/Virgo season) $\to$ MATTER yield is elevated, but controlled by anti-glut damping.

### 3.2 Counter-Cyclical MATTER Anti-Glut Protection ($\Omega_{\text{MATTER}}$)
Because MATTER currently represents $37.5\%$ of global circulating supply:
$$\Omega_{\text{MATTER}} = \max\left(0.65, 1.0 - 2.0 \times (0.375 - 0.25)\right) = \mathbf{0.75}$$
The kitchen faucet automatically compresses the MATTER daily mint by **$25\%$** for all users until the circulating supply re-equilibrates below $30\%$.

---

## 4. Reconciled Culinary Burn Sinks in `alchm.kitchen`

To prevent MATTER from remaining an idle store of value, `alchm.kitchen` implements active operational burns across all meal preparation and AI cooking workflows:

### 4.1 Master Culinary Sink Schedule

| Action / Workflow | Coin Debited | Amount | Purpose & Economic Rationale |
| :--- | :--- | :---: | :--- |
| **Nutritional Grounding Proof** | **MATTER** | **1.50** | Debited when AI validates recipe macronutrients against the user's verified health goals. |
| **Recipe Seasonality Check** | **MATTER** | **2.00** | Debited when an alchemical recipe verifies live grocery market availability and seasonal peak freshness. |
| **Pantry Transmutation Commit** | **MATTER** | **3.00** | Debited when committing an ingredient substitution into the persistent user pantry graph. |
| **Pantry Sensor / Receipt Sync** | **MATTER** | **1.00** | Debited when the user uploads a grocery receipt to automatically update inventory levels. |
| **AI Recipe Chat (Per Turn)** | **SPIRIT, ESSENCE, MATTER, SUBSTANCE** | **0.25 each** ($1.00$ total) | Standardized conversational interaction with culinary agents (lowered SPIRIT burn from 0.30 to 0.25). |
| **Weekly Attunement Quest** | **All 4 Coins** | **Earns yield** (Cap 24) | Completing cooking circles and recipe reviews rewards balanced elemental yield. |
| **Restaurant Meal Voucher** | **MATTER (or any coin)** | **Variable** ($0.01\text{ USD/token}$) | Permanent burn of tokens (MATTER prioritized) to redeem dining credits at partner kitchens. |

---

## 5. Implementation Blueprint for `/api/yield/claim/route.ts`

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

    // 2. Ingest user birth chart
    const natalChart = await tx.userNatalChart.findUnique({ where: { userId } });

    // 3. Ingest live celestial transit & supply stats
    const priceIndex = await loadCanonicalPriceIndex();
    
    // 4. Compute discriminant yield for SPIRIT, ESSENCE, MATTER, SUBSTANCE
    const yieldResult = computeDiscriminantDailyYield(
      natalChart,
      {
        aNumber: priceIndex.aNumber,
        multiplier: priceIndex.multiplier,
        isDiurnal: priceIndex.isDiurnal,
        dominantElement: priceIndex.dominantElement,
        elementWeights: {
          Fire: priceIndex.dominantElement === 'Fire' ? 4.0 : 2.0,
          Water: priceIndex.dominantElement === 'Water' ? 4.0 : 2.0,
          Earth: priceIndex.dominantElement === 'Earth' ? 4.0 : 2.0,
          Air: priceIndex.dominantElement === 'Air' ? 4.0 : 2.0,
        },
      },
      priceIndex.supply,
      session.user?.isPremium || false
    );

    // 5. Commit ledger updates for SPIRIT, ESSENCE, MATTER, SUBSTANCE
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

## 6. Verification & Validation Protocol (Machine B)

When deploying this specification to `WhatToEatNext`:
1. **Unit Test Coverage:** Run `bun test test/economy/culinary-faucet.test.ts`.
2. **Pantry Debit Invariant:** Verify that generating a meal plan with ingredient verification debits `4.00 MATTER`.
3. **Anti-Glut Assertion:** Confirm that MATTER claim payout is suppressed by $25\%$ under live network telemetry.
4. **Strict Token Naming:** Ensure no UI element or API payload uses elements as token names; the tokens are always **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.
