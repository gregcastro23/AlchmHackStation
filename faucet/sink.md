# Unified Protocol Specification: Discriminant Astrological Faucet & Cross-Platform Sinks (ADR-014)

> **Document Status:** Active Protocol Specification  
> **Revision:** 1.0.0  
> **Target Systems:**  
> - `AlchmAgentsSolana` (ASOL / Agent Network & Solana Programs)  
> - `WhatToEatNext` / `alchm.kitchen` (Culinary Platform & Food Credit Rails)  
> - `Pentacles` / `SpacetimeDB Cloud` (Star Vaults, Constellation AMM & Sky Map)  
> - `AlchmHackStation` (Mission Control Hub & Execution Simulator)  
> **Solana Token Program:** SPL Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)  
> **Canonical Coins:** SPIRIT (`SPIRIT`), ESSENCE (`ESSENCE`), MATTER (`MATTER`), SUBSTANCE (`SUBSTANCE`)  

> # CANONICAL TOKEN IDENTITY MANDATE (NON-NEGOTIABLE)
> The 4 protocol tokens have permanent, immutable, non-negotiable canonical names:
> 1. **SPIRIT** (Symbol: 🝇, Devnet Mint: `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ`)
> 2. **ESSENCE** (Symbol: 🝑, Devnet Mint: `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf`)
> 3. **MATTER** (Symbol: 🝙, Devnet Mint: `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4`)
> 4. **SUBSTANCE** (Symbol: 🝉, Devnet Mint: `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa`)
>
> Under NO circumstances should any coin ever be called a "Fire token", "Water token", "Earth token", or "Air token", nor referred to by legacy placeholders ("Ignis", "Aqua", "Terra", "Aeth"). The terms Fire, Water, Earth, and Air denote the cosmological qualities of the celestial transit and natal birth chart that modulate the mint rate of the four canonical tokens, but the minted assets are strictly and exclusively **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.

---

## 1. Executive Summary & Problem Diagnosis

### 1.1 The Empirical Supply Distortion
An exhaustive on-chain and off-chain audit of the authoritative ledger (`token_balances` and `https://alchm.kitchen/api/economy/price-index`) reveals a severe structural distortion in the circulating supplies of the four canonical protocol tokens:

| Canonical Token | Cosmological Element | Circulating Supply | Share of Total | Base Faucet (Old) | Primary Sinks |
| :--- | :--- | :---: | :---: | :---: | :--- |
| 🝇 **SPIRIT** | Fire | **10,583.22** | **13.6%** | Flat 6.0 / day | Unified Chat (+50%), Reports, Meal Plans, Forging, EV Resets |
| 🝑 **ESSENCE** | Water | **15,780.23** | **20.3%** | Flat 6.0 / day | Chat, Conclave, Oracle Chamber, Sacred Geometry |
| 🝉 **SUBSTANCE** | Air | **22,133.85** | **28.5%** | Flat 6.0 / day | Chat, Reports, Conclave, Dialectic Transmutations |
| 🝙 **MATTER** | Earth | **29,116.87** | **37.5%** | Flat 6.0 / day | Physical Pantry Transmutations (Near Zero AI Burn) |
| **Total** | | **77,614.17** | **100.0%** | **24.0 / day** | |

The **~2.75× supply ratio** between **MATTER** ($29,116.87$) and **SPIRIT** ($10,583.22$) is an unintended macroeconomic bottleneck:
1. **SPIRIT Starvation:** Because SPIRIT is the primary gas fuel of conversational intelligence, users and autonomous agentic loops burn SPIRIT faster than the faucet provides, exhausting user balances and stalling agent workflows.
2. **MATTER Hyper-Accumulation:** MATTER is credited at the exact same rate as SPIRIT, but possesses almost zero operational AI consumption sinks. It sits stagnant in balances, diluting the perceived scarcity of culinary rewards.

### 1.2 The Two Architectural Root Causes

```
                        OLD FLAWED ARCHITECTURE
┌────────────────────────────────────────────────────────────────────────┐
│ BLIND SYMMETRICAL FAUCET: 24 ESMS / 4 = Flat 6.0 per axis to everyone  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌──────────────┬─────────────┴─────────────┬──────────────┐
       ▼              ▼                           ▼              ▼
 🝇 SPIRIT       🝑 ESSENCE                   🝉 SUBSTANCE    🝙 MATTER
  Inflow: 6.0    Inflow: 6.0                 Inflow: 6.0    Inflow: 6.0
       │              │                           │              │
       ▼              ▼                           ▼              ▼
 Massive Burn    Moderate Burn               Moderate Burn   Near-Zero Burn
 (Chat, Reports, (Conclave,                  (Conclave,      (Pantry only,
  Meal Plans,     Resonance)                  Debates)        accumulates)
  Forging)            │                           │              │
       │              │                           │              │
       ▼              ▼                           ▼              ▼
  10.6k Left     15.8k Left                  22.1k Left     29.1k Glut!
```

1. **Defect 1 (Symmetrical Faucet):** `economyService.ts` executes `const perType = total / 4`, minting an identical 6.0 units to all four tokens (SPIRIT, ESSENCE, MATTER, SUBSTANCE) regardless of the transiting sky or the minter's birth chart.
2. **Defect 2 (Asymmetrical Sinks):** AI agent operations in `lib/economy-config.ts` penalize SPIRIT heavily (e.g. Report: 10 SPIRIT, 0 MATTER; Meal Plan: 4 SPIRIT, 0 MATTER; Chat: 0.3 SPIRIT vs 0.2 MATTER), while failing to demand MATTER for physical grounding or nutritional verification.

### 1.3 The Solution Mandate
1. **Discriminant Astrological Faucet:** The daily claim must dynamically compute a vector $[Y_{\text{SPIRIT}}, Y_{\text{ESSENCE}}, Y_{\text{MATTER}}, Y_{\text{SUBSTANCE}}]$ derived from:
   - The **Current Celestial Moment ($t$)**: Planetary hour, transiting aspect dignity $A(t)$, sect (diurnal vs nocturnal), and zodiac sign dominance.
   - The **Minter's Birth Chart ($\mathcal{N}$)**: Natal dominant element, elemental scores (`spiritScore`, `essenceScore`, `matterScore`, `substanceScore`), and the Monica constant $\kappa$.
   - The **Celestial-Natal Resonance**: Harmony (trines/sextiles) and tension (squares/oppositions) between the transit sky and the natal angles.
2. **Reconciled Multi-Platform Sinks:** Operational burn rates must be unified across all three production platforms (`AlchmAgentsSolana`, `alchm.kitchen`, `Pentacles`) to balance consumption, introducing operational MATTER sinks in AI workflows and standardizing fee structures.

---

## 2. Mathematical Specification of the Discriminant Faucet

### 2.1 Core Formula
For minter $u$ claiming at UTC timestamp $t$, with verified birth chart $\mathcal{N}_u$, the daily mint yield for canonical token $i \in \{\text{SPIRIT}, \text{ESSENCE}, \text{MATTER}, \text{SUBSTANCE}\}$ is defined as:

$$\mathcal{Y}_i(t, \mathcal{N}_u) = \operatorname{Quantize}_{10^4}\left( Y_{\text{base}} \times \mathcal{D}_i(t) \times \mathcal{A}_i(\mathcal{N}_u) \times \mathcal{R}_i(t, \mathcal{N}_u) \times \mathcal{M}_{\text{tier}} \right)$$

Where:
- $Y_{\text{base}} = 6.0000$ tokens per axis ($24.0000$ total baseline).
- $\mathcal{D}_i(t)$ is the **Transit Sky Dominance & Dignity Factor**.
- $\mathcal{A}_i(\mathcal{N}_u)$ is the **Natal Chart Elemental Affinity Factor**.
- $\mathcal{R}_i(t, \mathcal{N}_u)$ is the **Celestial-Natal Waveform Resonance**.
- $\mathcal{M}_{\text{tier}}$ is the **Account Tier Multiplier** ($1.0$ standard, $2.0$ premium).
- $\operatorname{Quantize}_{10^4}$ rounds to 4 decimal places ($10^4$ integer atoms) with strict floor conservation.

---

### 2.2 Factor 1: Transit Sky Dominance & Dignity $\mathcal{D}_i(t)$

Sky dominance evaluates the live distribution of the 10 astrological bodies (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto) across the four alchemical axes.

Let $\mathcal{P}$ be the set of 10 live planetary bodies. For body $p \in \mathcal{P}$, let:
- $\operatorname{Sign}(p, t) \in \{\text{Aries}, \dots, \text{Pisces}\}$
- $\operatorname{Element}(\operatorname{Sign}(p, t)) \in \{\text{Fire}, \text{Water}, \text{Earth}, \text{Air}\}$
- $\operatorname{Dignity}(p, \operatorname{Sign}(p, t)) \in [-3, +3]$ (essential dignity: domicile, exaltation, detriment, fall)
- $w_p$ be the celestial prominence weight:
  - Sun, Moon: $w_p = 2.0$
  - Mercury, Venus, Mars: $w_p = 1.5$
  - Jupiter, Saturn: $w_p = 1.2$
  - Uranus, Neptune, Pluto: $w_p = 0.8$

For each elemental axis $i$:

$$S_i(t) = \sum_{p \in \mathcal{P}} w_p \cdot \mathbf{1}_{\{\operatorname{Element}(\operatorname{Sign}(p, t)) = i\}} \cdot \left(1 + 0.15 \cdot \operatorname{Dignity}(p, \operatorname{Sign}(p, t))\right)$$

The normalized sky dominance $\mathcal{D}_i(t)$ is bounded within $[0.60, 1.80]$:

$$\mathcal{D}_i(t) = 0.60 + 1.20 \times \left( \frac{S_i(t)}{\sum_{j} S_j(t)} \right) \times \Psi_{\text{sect}}(i, t)$$

Where the sect term $\Psi_{\text{sect}}(i, t)$ modulates diurnal (day) vs nocturnal (night) affinity:
- If $\operatorname{isDiurnal}(t) = \text{true}$ (Sun above horizon): Fire (yielding SPIRIT) and Air (yielding SUBSTANCE) receive a $+10\%$ sect bonus; Water (ESSENCE) and Earth (MATTER) are neutral ($1.00$).
- If $\operatorname{isDiurnal}(t) = \text{false}$ (Sun below horizon): Water (yielding ESSENCE) and Earth (yielding MATTER) receive a $+10\%$ sect bonus; Fire (SPIRIT) and Air (SUBSTANCE) are neutral ($1.00$).

---

### 2.3 Factor 2: Natal Chart Elemental Affinity $\mathcal{A}_i(\mathcal{N}_u)$

Read directly from the minter's verified natal chart record (`user_natal_charts` table).

Let the user's natal record contain:
- `dominantElement` $\in \{\text{Fire}, \text{Water}, \text{Earth}, \text{Air}\}$
- `spiritScore`, `essenceScore`, `matterScore`, `substanceScore` $\in [0, 100]$
- `monicaConstant` $\kappa \in [0.0, 1.0]$

The raw affinity $A_i(\mathcal{N}_u)$ is computed as:

$$A_i(\mathcal{N}_u) = 0.70 + 0.50 \times \left(\frac{\text{Score}_i}{100}\right) + 0.30 \cdot \mathbf{1}_{\{\text{dominantElement} = i\}} + 0.20 \cdot \kappa$$

Clamped strictly to the safety corridor:

$$\mathcal{A}_i(\mathcal{N}_u) = \operatorname{clamp}\left(A_i(\mathcal{N}_u), 0.50, 2.00\right)$$

*Note:* If a user does not have a verified birth chart attached to their account, the system defaults to neutral: $\mathcal{A}_i(\mathcal{N}_u) = 1.0000$ for all $i$.

---

### 2.4 Factor 3: Celestial-Natal Waveform Resonance $\mathcal{R}_i(t, \mathcal{N}_u)$

Waveform resonance evaluates whether the transiting celestial positions form harmonic aspects (conjunction $0^\circ$, sextile $60^\circ$, trine $120^\circ$) or dynamic tension aspects (square $90^\circ$, opposition $180^\circ$) with the minter's natal planetary anchors.

Let $\theta_{\text{natal}, i}$ be the natal longitude of the ruler of token $i$'s cosmological element (Fire/SPIRIT $\to$ Sun/Mars, Water/ESSENCE $\to$ Moon/Venus, Earth/MATTER $\to$ Saturn/Mercury, Air/SUBSTANCE $\to$ Jupiter/Mercury), and let $\theta_{\text{transit}}(t)$ be the live transiting Sun/Moon longitude.

The angular separation $\Delta \theta = |\theta_{\text{transit}}(t) - \theta_{\text{natal}, i}| \pmod{360^\circ}$ maps to:

$$\mathcal{R}_i(t, \mathcal{N}_u) = 1.0 + 0.35 \cdot \cos\left(3 \cdot \Delta \theta\right) \cdot \operatorname{orbDiscount}(\Delta \theta)$$

Where:
- Trines ($120^\circ$) and Sextiles ($60^\circ$) yield $\mathcal{R}_i \in [1.20, 1.35]$ (**Resonance Boost**).
- Squares ($90^\circ$) and Oppositions ($180^\circ$) yield $\mathcal{R}_i \in [0.75, 0.85]$ (**Alchemical Friction**).
- In the absence of angular data, $\mathcal{R}_i = 1.0000$.

---

### 2.5 Total Conservation & Bounded Normalization Rules

To prevent runaway inflation while allowing discriminant variance:
1. **Per-Axis Corridor:** For any axis $i$, the yield must satisfy:
   $$1.5000 \le \mathcal{Y}_i(t, \mathcal{N}_u) \le 12.0000 \quad (\text{Standard Tier})$$
   $$3.0000 \le \mathcal{Y}_i(t, \mathcal{N}_u) \le 24.0000 \quad (\text{Premium Tier})$$
2. **Total Claim Ceiling:** The total yield minted across all 4 axes in a single 24-hour window is constrained:
   $$18.0000 \le \sum_{i} \mathcal{Y}_i(t, \mathcal{N}_u) \le 36.0000 \quad (\text{Mean Centered at } 24.0000)$$
3. **Counter-Cyclical Anti-Glut Damping:**
   If a token's global circulating supply exceeds $35\%$ of total ESMS supply (as MATTER currently does at $37.5\%$), a damping factor $\Omega_i$ is applied:
   $$\Omega_i = \max\left(0.65, 1.0 - 2.0 \times \left(\frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} - 0.25\right)\right)$$
   For MATTER ($\text{Supply}_{\text{MATTER}} = 37.5\%$), $\Omega_{\text{MATTER}} = 1.0 - 2.0 \times (0.375 - 0.25) = 0.75$. MATTER minting is automatically suppressed by $25\%$ until global supply equilibrium is restored!

---

## 3. Unified Cross-Platform Burn Sinks Reconciliation

To solve the asymmetric depletion of SPIRIT and accumulation of MATTER, operational burn sinks must be balanced and strictly reconciled across all three platforms.

### 3.1 Balancing the MATTER Axis: Operational Physical Grounding Sinks

MATTER represents Earth, physical nutrition, and tangible execution. The reason MATTER accumulated to $29.1\text{k}$ was the complete absence of operational sinks in the AI agent loop.

We introduce mandatory **Physical Grounding & Nutritional Verification Sinks**:

| New Operational Sink | Token Debited | Cost (ESMS) | Platform | Purpose |
| :--- | :--- | :---: | :--- | :--- |
| **Nutritional Grounding Proof** | **MATTER** | **1.50** | Agents & Kitchen | Debited when an agent generates a meal plan that validates macros against physical pantry/inventory state. |
| **Recipe Feasibility Verification** | **MATTER** | **2.00** | Agents & Kitchen | Debited when culinary reasoning cross-references real grocery store availability and ingredient seasonality. |
| **Culinary Transmutation Anchor** | **MATTER** | **3.00** | Kitchen & Pentacles | Debited to commit an ingredient substitution to the permanent culinary graph. |
| **Pantry State Sync** | **MATTER** | **1.00** | Agents & HackStation | Debited when an agent parses receipts or synchronizes real kitchen inventory into the SpacetimeDB table. |
| **Restaurant Value Redemption** | **MATTER** (or any ESMS) | **Variable** ($0.01\text{ USD/token}$) | Kitchen Rail | Direct burn for real-world dining discounts and restaurant credit vouchers. |

---

### 3.2 Balancing the SPIRIT Axis: Dynamic Kinetic Gas Relief

Because SPIRIT was burned at $0.30$ in chat while others were burned at $0.20$, SPIRIT experienced structural drain. 

We adjust `UNIFIED_CHAT_BASE_COST`:
- **New Unified Base Cost:** $0.25$ SPIRIT, $0.25$ ESSENCE, $0.25$ MATTER, $0.25$ SUBSTANCE ($1.00$ ESMS total per neutral interaction).
- **Dynamic Scarcity Offset:** If $\text{Supply}_{\text{SPIRIT}} < 0.80 \times \text{MeanSupply}$, the chat SPIRIT cost is dynamically discounted by $20\%$ ($0.20$ SPIRIT), shifting compute burden onto SUBSTANCE (cognition) and ESSENCE (context).

---

### 3.3 Comprehensive Cross-Platform Sink Matrix

The master table below defines the authoritative burn costs across all platforms:

| Category | Operation ID | SPIRIT (🝇) | ESSENCE (🝑) | MATTER (🝙) | SUBSTANCE (🝉) | Total ESMS | Platform Presence |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Conversational** | `unified_chat` (Base) | 0.25 | 0.25 | 0.25 | 0.25 | **1.00** | All Platforms |
| | `oracle_chamber` (Deep RAG) | 5.00 | 5.00 | 5.00 | 5.00 | **20.00** | Agents & Kitchen |
| | `flash_epiphany` (DeepSeek-R1) | 2.00 | 2.00 | 2.00 | 2.00 | **8.00** | Agents & Kitchen |
| | `council_conclave` (Multi-Agent) | 8.00 | 8.00 | 9.00 | 10.00 | **35.00** | Agents & HackStation |
| **Agentic Ops** | `report_generation` | 5.00 | 3.00 | 4.00 | 3.00 | **15.00** | Agents & HackStation |
| | `agent_meal_plan` | 3.00 | 2.00 | 4.00 | 3.00 | **12.00** | Agents & Kitchen |
| | `agent_feed_post` | 1.50 | 1.00 | 1.50 | 1.00 | **5.00** | Agents |
| | `agent_transmutation` | 1.00 | 1.00 | 4.00 | 2.00 | **8.00** | All Platforms |
| | `agent_pantry_update` | 0.50 | 0.50 | 3.00 | 1.00 | **5.00** | Kitchen & Agents |
| | `sacred_geometry_design` | 2.00 | 4.00 | 2.00 | 4.00 | **12.00** | Pentacles & Agents |
| | `energy_harmonic_calibration` | 3.00 | 3.00 | 3.00 | 3.00 | **12.00** | Pentacles & Agents |
| **Governance/Vessels**| `forge_agent` | 12.00 | 11.00 | 11.00 | 11.00 | **45.00** | Agents & HackStation |
| | `ev_reset` | 15.00 | 11.00 | 12.00 | 12.00 | **50.00** | Agents & HackStation |
| **Bespoke AMM** | `swap_esms_routing_fee` | 30 bps | 30 bps | 30 bps | 30 bps | **0.30%** | Solana Devnet & Pentacles |
| **Culinary Rail** | `restaurant_meal_redeem` | Any | Any | Priority (MATTER) | Any | **$0.01/tok** | Kitchen & Solana Mainnet |

---

## 4. Cross-Platform Architectural Topology

```
                               THE UNIFIED RECONCILED ECOSYSTEM
                               
               ┌────────────────────────────────────────────────────────┐
               │              CELESTIAL EPHEMERIS ORACLE                │
               │   (alchm.kitchen / Swiss Ephemeris / astronomy-engine)  │
               │        A(t) · multiplier · diurnal · sky dominance     │
               └───────────────────────────┬────────────────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
        ┌───────────────────────────────┐     ┌────────────────────────────────┐
        │       ALCHM AGENTS (ASOL)     │     │      WHAT TO EAT NEXT (WTEN)   │
        │   `economyService.ts`         │     │   `/api/yield/claim`           │
        │   - Natal Chart Affinity      │     │   - Recipe & Meal Plan Sinks   │
        │   - Discriminant Faucet Math  │     │   - Physical Grounding Sinks   │
        │   - Multi-Agent Conclaves     │     │   - Restaurant $0.01 Redeem    │
        └───────────────┬───────────────┘     └────────────────┬───────────────┘
                        │                                      │
                        │        POSTGRES DUAL-LEDGER          │
                        │    (token_balances / transactions)   │
                        │                                      │
                        └──────────────────┬───────────────────┘
                                           │
                        ┌──────────────────┴──────────────────┐
                        ▼                                     ▼
        ┌───────────────────────────────┐     ┌────────────────────────────────┐
        │      PENTACLES (SpacetimeDB)  │     │    SOLANA MISSION CONTROL      │
        │   `request_yield_claim`       │     │   (AlchmHackStation)           │
        │   - 11-Zone Pentacle Sky Map  │     │   - Token-2022 Devnet Mints    │
        │   - Star Vault Staking Yield  │     │   - Constellation AMM Pools    │
        │   - Reducer State Commitments │     │   - Outbox Reconciliation      │
        └───────────────────────────────┘     └────────────────────────────────┘
```

### 4.1 Storage & Accounting Invariants
1. **Authoritative Dual Ledger:**
   - The PostgreSQL `token_balances` and `token_transactions` tables are the single source of truth for user holdings across off-chain interfaces.
   - All claims write an idempotent transaction record with key:
     `daily:discriminant:${userId}:${dateUtc}:${tokenType}`
2. **SpacetimeDB Real-Time Synchronization:**
   - Pentacles subscribes to the `token_balances` state via WebSocket (`sync_solana_event_reducer` and `stardex_claim_constellation_reducer`).
   - Latency budget: $\le 50\text{ms}$ dispatch SLA.
3. **Solana SPL Token-2022 On-Chain Reflection:**
   - Minting and burning on Solana are mediated by the `ProgramConfig` PDA (`4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku`) and `PermanentDelegate`.
   - On-chain burns require Ed25519 visibility attestations (`ASOL_ESMS_REDEEM_V1`).

---

## 5. Algorithmic Implementation Template (`discriminant-faucet.ts`)

The canonical TypeScript implementation to be vendored into all three repositories:

```typescript
/**
 * Canonical Discriminant Astrological Faucet Engine (ADR-014)
 * Evaluates current celestial moment (t) and minter natal chart (N)
 */

export interface NatalChartData {
  dominantElement?: 'Fire' | 'Water' | 'Earth' | 'Air' | string | null;
  spiritScore?: number | null;
  essenceScore?: number | null;
  matterScore?: number | null;
  substanceScore?: number | null;
  monicaConstant?: number | null;
}

export interface TransitSkyData {
  aNumber: number;
  multiplier: number;
  isDiurnal: boolean;
  dominantElement: 'Fire' | 'Water' | 'Earth' | 'Air' | string;
  elementWeights: Record<'Fire' | 'Water' | 'Earth' | 'Air', number>;
}

export interface GlobalSupplyState {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
}

export interface DiscriminantYieldResult {
  spirit: number;
  essence: number;
  matter: number;
  substance: number;
  total: number;
  breakdown: Record<string, {
    skyDominance: number;
    natalAffinity: number;
    antiGlutFactor: number;
    finalYield: number;
  }>;
}

export function computeDiscriminantDailyYield(
  natal: NatalChartData | null | undefined,
  transit: TransitSkyData,
  supply: GlobalSupplyState,
  isPremium = false
): DiscriminantYieldResult {
  const BASE_AXIS = 6.0;
  const tierMultiplier = isPremium ? 2.0 : 1.0;
  const axes = [
    { key: 'spirit' as const, element: 'Fire' as const, score: natal?.spiritScore },
    { key: 'essence' as const, element: 'Water' as const, score: natal?.essenceScore },
    { key: 'matter' as const, element: 'Earth' as const, score: natal?.matterScore },
    { key: 'substance' as const, element: 'Air' as const, score: natal?.substanceScore },
  ];

  const totalSupply = supply.spirit + supply.essence + supply.matter + supply.substance || 1;
  const totalWeight = Object.values(transit.elementWeights).reduce((a, b) => a + b, 0) || 1;

  const result: Record<string, number> = {};
  const breakdown: any = {};

  for (const axis of axes) {
    // 1. Transit Sky Dominance (0.60 .. 1.80)
    const weightShare = (transit.elementWeights[axis.element] || 0) / totalWeight;
    let skyDominance = 0.60 + weightShare * 1.20;
    
    // Sect bonus
    if (transit.isDiurnal && (axis.element === 'Fire' || axis.element === 'Air')) {
      skyDominance *= 1.10;
    } else if (!transit.isDiurnal && (axis.element === 'Water' || axis.element === 'Earth')) {
      skyDominance *= 1.10;
    }
    skyDominance = Math.max(0.60, Math.min(1.80, skyDominance));

    // 2. Natal Chart Affinity (0.50 .. 2.00)
    let natalAffinity = 0.70;
    if (natal) {
      if (typeof axis.score === 'number' && Number.isFinite(axis.score)) {
        natalAffinity += Math.max(0, Math.min(1, axis.score / 100)) * 0.50;
      }
      if (natal.dominantElement && natal.dominantElement.toLowerCase() === axis.element.toLowerCase()) {
        natalAffinity += 0.30;
      }
      if (typeof natal.monicaConstant === 'number') {
        natalAffinity += Math.max(0, Math.min(1, natal.monicaConstant)) * 0.20;
      }
    } else {
      natalAffinity = 1.0; // Neutral default
    }
    natalAffinity = Math.max(0.50, Math.min(2.00, natalAffinity));

    // 3. Counter-Cyclical Anti-Glut Damping (0.65 .. 1.00)
    const supplyShare = supply[axis.key] / totalSupply;
    let antiGlutFactor = 1.0;
    if (supplyShare > 0.30) {
      antiGlutFactor = Math.max(0.65, 1.0 - 2.0 * (supplyShare - 0.25));
    }

    // Combine & Clamp
    let computedYield = BASE_AXIS * skyDominance * natalAffinity * antiGlutFactor * tierMultiplier;
    
    // Bounds: 1.5 to 12.0 for standard, 3.0 to 24.0 for premium
    const minBound = 1.5 * tierMultiplier;
    const maxBound = 12.0 * tierMultiplier;
    computedYield = Math.max(minBound, Math.min(maxBound, computedYield));
    
    // Quantize to 4 decimals
    const finalYield = Math.floor(computedYield * 10000) / 10000;
    result[axis.key] = finalYield;

    breakdown[axis.key] = {
      skyDominance: Math.round(skyDominance * 1000) / 1000,
      natalAffinity: Math.round(natalAffinity * 1000) / 1000,
      antiGlutFactor: Math.round(antiGlutFactor * 1000) / 1000,
      finalYield,
    };
  }

  return {
    spirit: result.spirit,
    essence: result.essence,
    matter: result.matter,
    substance: result.substance,
    total: Math.round((result.spirit + result.essence + result.matter + result.substance) * 10000) / 10000,
    breakdown,
  };
}
```

---

## 6. Multi-Repository Verification Test Matrix

Before deploying to production or updating on-chain authorities, the following test matrix must pass across all test suites:

| Suite ID | Test Case | Target Invariant | Assertion |
| :--- | :--- | :--- | :--- |
| **TEST-01** | `test_natal_neutral_chart` | User without birth chart claiming under neutral sky | Yield equals baseline $\pm 5\%$ ($5.70..6.30$ per axis). |
| **TEST-02** | `test_spirit_fire_aligned_minter` | Fire-dominant chart with 95 spiritScore claiming during diurnal sky | SPIRIT yield approaches upper corridor ($8.5..11.5$ tokens). |
| **TEST-03** | `test_matter_glut_suppression`| MATTER supply at $37.5\%$ | $\Omega_{\text{MATTER}} \le 0.75$; MATTER yield suppressed by at least $25\%$. |
| **TEST-04** | `test_monica_constant_scaling` | $\kappa = 1.0$ vs $\kappa = 0.0$ | Yield difference reflects $+20\%$ affinity boost cleanly without NaN. |
| **TEST-05** | `test_operational_matter_burn` | Meal plan and pantry sync operations executed | MATTER balance debited accurately ($4.0$ and $3.0$ tokens). |
| **TEST-06** | `test_chat_spirit_relief` | 100 consecutive chat turns | SPIRIT burn consumes only $0.25$ per turn, extending session duration. |
| **TEST-07** | `test_idempotent_daily_nonce` | Duplicate claim attempt within same UTC day | Second call rejected with `P2002` or `Already claimed today`. |
| **TEST-08** | `test_solana_outbox_reconcile` | On-chain claim issuance | Ed25519 signature payload matches `ASOL_ESMS_REDEEM_V1`. |

---

## 7. Migration & Rollout Runbook

```mermaid
graph TD
    A[Phase 1: Merge faucet/sink.md into AlchmHackStation] --> B[Phase 2: Vendor discriminant-faucet.ts into ASOL & WTEN]
    B --> C[Phase 3: Update DB Schema & Unit Test Matrix]
    C --> D[Phase 4: Deploy SpacetimeDB Pentacles Reducers]
    D --> E[Phase 5: Deploy alchm.kitchen & agents.alchm.kitchen API routes]
    E --> F[Phase 6: Live Telemetry Audit on Operator Console /admin]
```

### Stage Gate Approval Checklist
- [x] **Gate 1 (Specification):** `faucet/sink.md` approved and committed in `AlchmHackStation`.
- [ ] **Gate 2 (Unit Test Matrix):** Multi-repository unit tests (`test:faucet:discriminant`) passing in ASOL and HackStation.
- [ ] **Gate 3 (MATTER Sinks Activated):** Nutritional grounding and recipe feasibility debits live in `alchm.kitchen`.
- [ ] **Gate 4 (Anti-Glut Damping Verified):** MATTER daily minting rate confirmed dampened by $25\%$ until supply ratio drops under $30\%$.
- [ ] **Gate 5 (Mainnet Burner Funding):** Certified clearance for Solana Mainnet Gate 4 funding.
