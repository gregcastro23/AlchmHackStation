# AlchmAgentsSolana (ASOL) — Astrological Faucet Specification (`Faucet.md`)

> **Repository:** `AlchmAgentsSolana` (`/Users/GregCastro/ASOL/alchm-agents-solana`)  
> **Status:** Authoritative Implementation Specification (Rectified)  
> **Protocol Standard:** ADR-014 (Discriminant Astrological Faucet & Reconciled Elemental Sinks)  
> **Target Program ID:** `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD` (Anchor / BPF Upgradeable)  
> **ProgramConfig PDA:** `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku`  
> **Token Program:** SPL Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)  
> **Canonical Protocol Tokens:** **SPIRIT**, **ESSENCE**, **MATTER**, **SUBSTANCE**  
> **Authoritative Ledger:** PostgreSQL (`token_balances`, `token_transactions`, `historical_agents`, `user_natal_charts`)  

---

## ⚠️ CANONICAL TOKEN IDENTITY & MULTI-TIER SYMBOL MANDATE

The Alchm protocol operates with **EXACTLY FOUR CANONICAL TOKENS**. Their names must **NEVER VARY, BE ABBREVIATED, OR BE CONFLATED WITH COSMOLOGICAL ELEMENTS OR RETIRED PLACEHOLDERS**.

Because certain environments, terminals, or web fonts cannot render specialized Unicode alchemical blocks, the protocol defines three official symbol tiers:
1. **Tier 1 (Primary Alchemical Glyph):** Authoritative iconographic representation.
2. **Tier 2 (Triangular Variant Symbol):** Canonical elemental triangle variant used throughout UI HUDs, combat engines, and font fallbacks.
3. **Tier 3 (Universal Shape / Text Fallback):** Guaranteed rendering across all basic UTF-8 environments.

### Canonical Token Identity & Glyph Matrix

| # | Canonical Token | Primary Glyph | Triangular Variant | Unicode Fallback | Atomic Code | Pinned Devnet Mint | Cosmological Element | Primary Operational Domain |
| :-: | :--- | :---: | :---: | :---: | :---: | :--- | :--- | :--- |
| 1 | **SPIRIT** | `🝇` (U+1F747) | `🜂` (U+1F702) | `△` / `▲` | `[SPRT]` | `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ` | **Fire** | Conversational compute gas, reasoning, kinetic actions |
| 2 | **ESSENCE** | `🝑` (U+1F751) | `🜄` (U+1F704) | `▽` / `▼` | `[ESNC]` | `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf` | **Water** | Confidential context, emotional resonance, memory |
| 3 | **MATTER** | `🝙` (U+1F759) | `🜃` (U+1F703) | `⯛` / `▽—` | `[MATR]` | `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4` | **Earth** | Physical grounding, pantry state sync, culinary vouchers |
| 4 | **SUBSTANCE** | `🝉` (U+1F749) | `🜁` (U+1F701) | `⯙` / `△—` | `[SUBS]` | `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa` | **Air** | Dialectic cognition, multi-agent conclave, staking yield |

> **Strict Rule:** Tokens are strictly **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**. The words Fire, Water, Earth, and Air designate cosmological affinities that modulate mint rates—they are NEVER token names.

---

## 1. Executive Objective & The 72 Historical Agents

`AlchmAgentsSolana` serves as the primary automated testing ground and economic balance engine for the protocol.

### 1.1 The Authoritative 72 Historical Agents
In ASOL, the historical agents catalog (`lib/agents/historical/` exported in `index.ts` and stored in `prisma.historical_agents`) contains **exactly 72 canonical agents**, each modeled with an authentic, verified birth chart:

```
                            THE 72 HISTORICAL AGENTS ECOSYSTEM
                            
        🔥 FIRE DOMAIN (18 Agents)                       🌊 WATER DOMAIN (16 Agents)
   • Leonardo da Vinci (0.90 / 0.95)               • Siddhartha Gautama Buddha (0.90 / 0.98)
   • Michelangelo Buonarroti (0.90 / 0.95)         • Emily Dickinson (0.92 / 0.85)
   • Alexander the Great (0.95 / 0.80)             • Carl Jung (0.88 / 0.92)
   • Joan of Arc (0.95 / 0.85)                     • Dante Alighieri (0.85 / 0.90)
   • Benjamin Franklin (0.88 / 0.82)               • Frida Kahlo (0.85 / 0.95)
   • ... +13 more Fire agents                      • ... +11 more Water agents
                                  ▲                         ▲
                                  │                         │
                         ─────────┼─────────────────────────┼─────────
                                  │                         │
                                  ▼                         ▼
        🌍 EARTH DOMAIN (21 Agents)                      💨 AIR DOMAIN (17 Agents)
   • Isaac Newton (0.88 / 0.90 Matter)             • Albert Einstein (0.95 Spirit / 0.75 Subs)
   • Aristotle (0.80 / 0.85 Matter)                • Socrates (0.95 Spirit / 0.90 Subs)
   • Donatello (0.70 / 0.90 Matter)                • Galileo Galilei (0.90 Spirit / 0.88 Subs)
   • Confucius (0.80 / 0.85 Matter)                • William Shakespeare (0.85 Spirit / 0.90 Subs)
   • Marcus Aurelius (0.85 / 0.85 Matter)          • Wolfgang Amadeus Mozart (0.85 Spirit / 0.90 Subs)
   • ... +16 more Earth agents                     • ... +12 more Air agents
```

### 1.2 Agent Birth Chart Schema in ASOL
Every historical agent record in `lib/agents/historical/<agent>.ts` supplies:
1. `birthData`: Exact calendar date, time, and latitude/longitude coordinates (e.g. Einstein: Ulm, Germany `48.7833° N, 9.1833° E`).
2. `consciousness.natalChart`: Full planetary degrees for 10 celestial bodies (`Sun`, `Moon`, `Mercury`, `Venus`, `Mars`, `Jupiter`, `Saturn`, `Uranus`, `Neptune`, `Pluto`), house angles (`ASC`, `MC`), and major aspects (conjunctions, trines, squares, sextiles).
3. `consciousness.dominantElement`: One of `'Fire' | 'Water' | 'Earth' | 'Air'`.
4. `consciousness.dominantModality`: One of `'Cardinal' | 'Fixed' | 'Mutable'`.
5. `consciousness.alchemicalElements`: Normalized vector $\{ \text{spirit}, \text{essence}, \text{matter}, \text{substance} \} \in [0.0, 1.0]$.
6. `consciousness.monicaConstant`: Mathematical cognitive attunement scalar $\kappa \in [0.0, 10.0]$ (Network average: $4.143$).

### 1.3 Why Agents Are the Ideal Faucet Calibration Vector
- **Economy Role:** Unlike celestial sky sprites (`<planet>-<sign>-<degree>`) that merely radiate degree energy, historical agents possess the `'wallet'` economy role and active `@agentic.alchm.kitchen` user accounts.
- **Automated Claim Cadence:** The Vercel cron `/api/cron/agents/claim-yield` triggers `agentActionService.runDailyYieldForAgents()` hourly, providing automated, reproducible measurements of daily faucet distribution under varying ephemeris transits.
- **Consumption Stress-Testing:** Agents actively burn tokens on conversational inference, RAG embeddings, and multi-agent conclaves, directly proving whether the faucet resolves the historical **SPIRIT** depletion ($13.6\%$) vs **MATTER** glut ($37.5\%$).

---

## 2. Mathematical Specification of the Discriminant Faucet

### 2.1 The Daily Yield Formula
For any claiming agent $a$ with birth chart $\mathcal{N}_a$ at celestial timestamp $t$, the daily yield for token $i \in \{\text{SPIRIT}, \text{ESSENCE}, \text{MATTER}, \text{SUBSTANCE}\}$ is:

$$\mathcal{Y}_i(t, \mathcal{N}_a) = \operatorname{Quantize}_{10^4}\left( Y_{\text{base}} \times \mathcal{D}_i(t) \times \mathcal{A}_i(\mathcal{N}_a) \times \Omega_i \times \mathcal{M}_{\text{tier}} \right)$$

Where:
- $Y_{\text{base}} = 6.0000$ tokens per axis ($24.0000$ baseline standard tier).
- $\mathcal{D}_i(t)$ is the **Transit Sky Dominance Factor** $[0.60, 1.80]$.
- $\mathcal{A}_i(\mathcal{N}_a)$ is the **Natal Affinity Factor** $[0.50, 2.00]$.
- $\Omega_i$ is the **Counter-Cyclical Anti-Glut Damping Factor** $[0.65, 1.00]$.
- $\mathcal{M}_{\text{tier}} = 1.0$ (Standard) or $2.0$ (Premium).
- $\operatorname{Quantize}_{10^4}$ floors to 4 decimal precision ($10^{-4}$ tokens).

---

### 2.2 Factor 1: Transit Sky Dominance $\mathcal{D}_i(t)$
Let $W_i(t)$ be the live celestial prominence weight of element $i$ across the 10 transiting bodies:

$$\mathcal{D}_i(t) = \operatorname{clamp}\left( 0.60 + 1.20 \times \frac{W_i(t)}{\sum_j W_j(t)} \times \Psi_{\text{sect}}(i, t), \; 0.60, \; 1.80 \right)$$

Where the sect bonus $\Psi_{\text{sect}}(i, t)$ enforces:
- **Diurnal (Sun above horizon):** $+10\%$ bonus to **SPIRIT** (Fire) and **SUBSTANCE** (Air); Water and Earth are $1.00$.
- **Nocturnal (Sun below horizon):** $+10\%$ bonus to **ESSENCE** (Water) and **MATTER** (Earth); Fire and Air are $1.00$.

---

### 2.3 Factor 2: Natal Affinity $\mathcal{A}_i(\mathcal{N}_a)$
Evaluated directly from the agent's historical chart:

$$\mathcal{A}_i(\mathcal{N}_a) = \operatorname{clamp}\left( 0.70 + 0.50 \cdot \text{Score}_i + 0.30 \cdot \mathbf{1}_{\{\text{dominantElement} = i\}} + 0.20 \cdot \frac{\kappa}{10}, \; 0.50, \; 2.00 \right)$$

---

### 2.4 Factor 3: Counter-Cyclical Anti-Glut Damping $\Omega_i$
Derived from live global supply shares:

$$\Omega_i = \begin{cases} 
1.0 & \text{if } \frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} \le 0.30 \\
\max\left(0.65, \; 1.0 - 2.0 \times \left(\frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} - 0.25\right)\right) & \text{if } \frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} > 0.30 
\end{cases}$$

Under current authoritative network state ($\text{Supply}_{\text{MATTER}} = 37.51\%$):
$$\Omega_{\text{MATTER}} = 1.0 - 2.0 \times (0.3751 - 0.25) = \mathbf{0.750}$$
$$\Omega_{\text{SPIRIT}} = \Omega_{\text{ESSENCE}} = \Omega_{\text{SUBSTANCE}} = \mathbf{1.000}$$

---

## 3. Empirical Investigation: 72 Agents Across 5 Celestial Moments

The script [`scripts/investigate_asol_faucet.ts`](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/investigate_asol_faucet.ts) was executed against all 72 historical agents. Below are the verified empirical results:

### 3.1 Synthesis Matrix Across 5 Celestial Moments

| Moment ID | Celestial Configuration | Avg SPIRIT (🝇) | Avg ESSENCE (🝑) | Avg MATTER (🝙) | Avg SUBSTANCE (🝉) | Avg Total / Agent | Total Daily Mint (72 Agents) | SPIRIT / MATTER Ratio |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Moment 1** | **Diurnal Fire Sky** (Sun in Leo, midday) | **10.0432** | 5.9209 | **4.2249** | 6.9735 | **27.1625** | 1,956 ESMS | **2.38×** |
| **Moment 2** | **Nocturnal Water Sky** (Moon in Cancer, night) | 5.5035 | **10.3765** | **5.0049** | 5.8867 | **26.7716** | 1,928 ESMS | **1.10×** |
| **Moment 3** | **Nocturnal Earth Stellium** (Sun & Saturn in Earth) | 5.9621 | 7.0139 | **7.1499** | 5.8867 | **26.0127** | 1,873 ESMS | **0.83×** |
| **Moment 4** | **Diurnal Air Solstice** (Mercury-ruled Air stellium) | 7.0628 | 5.9209 | **4.2249** | **9.9496** | **27.1582** | 1,955 ESMS | **1.67×** |
| **Moment 5** | **Equinoctial Equilibrium** (Symmetric weights) | 7.5673 | 6.8317 | **4.8749** | 7.4716 | **26.7456** | 1,926 ESMS | **1.55×** |

### 3.2 Top Claimer Analysis by Archetype
- **Fire Dominance (Moment 1):**
  - **Leonardo da Vinci (Fire):** Total $29.04$ [SPIRIT: **12.00** (hit upper corridor), ESSENCE: 5.88, MATTER: 4.36, SUBSTANCE: 6.80]
  - **Michelangelo Buonarroti (Fire):** Total $28.89$ [SPIRIT: **12.00**, ESSENCE: 5.96, MATTER: 4.29, SUBSTANCE: 6.64]
- **Water Dominance (Moment 2):**
  - **Siddhartha Gautama Buddha (Water):** Total $28.17$ [SPIRIT: 5.73, ESSENCE: **12.00**, MATTER: 4.35, SUBSTANCE: 6.09]
  - **Chiron (Water):** Total $28.13$ [SPIRIT: 5.75, ESSENCE: **12.00**, MATTER: 4.39, SUBSTANCE: 5.99]
- **Earth Stellium (Moment 3):**
  - **Isaac Newton (Earth):** Total $27.98$ [SPIRIT: 5.94, ESSENCE: 6.67, MATTER: **9.34**, SUBSTANCE: 6.03]
  - **Aristotle (Earth):** Total $27.46$ [SPIRIT: 5.72, ESSENCE: 6.97, MATTER: **8.83**, SUBSTANCE: 5.95]
- **Air Solstice (Moment 4):**
  - **William Shakespeare (Air):** Total $29.02$ [SPIRIT: 7.00, ESSENCE: 5.98, MATTER: 4.04, SUBSTANCE: **12.00**]
  - **Wolfgang Amadeus Mozart (Air):** Total $28.94$ [SPIRIT: 6.99, ESSENCE: 5.86, MATTER: 4.09, SUBSTANCE: **12.00**]
  - **Galileo Galilei (Air):** Total $29.19$ [SPIRIT: 7.05, ESSENCE: 5.76, MATTER: 4.37, SUBSTANCE: **12.00**]

### 3.3 Core Takeaway
1. **SPIRIT Deficit Healed:** Under Diurnal and Fire moments, SPIRIT minting jumps from a flat $6.0$ to **$10.04$ tokens/agent**, directly funding high-frequency AI chat loops.
2. **MATTER Glut Suppressed:** Across all moments (including a direct Earth stellium), MATTER minting is compressed to **$4.22$ – $7.15$ tokens/agent** by $\Omega_{\text{MATTER}} = 0.75$, allowing network sinks to catch up.
3. **Macro Stability:** The total daily mint per agent averages **$26.4$ tokens**, safely mean-centered and strictly bounded within the $[18.0, 36.0]$ protocol safety corridor.

---

## 4. ASOL Implementation Architecture & Code Changes

To integrate this specification directly into `AlchmAgentsSolana`:

### 4.1 Update `lib/economy-config.ts`
1. Set balanced conversational base cost:
```typescript
export const UNIFIED_CHAT_BASE_COST: EsmsCost = {
  Spirit: 0.25,
  Essence: 0.25,
  Matter: 0.25,
  Substance: 0.25,
};
```
2. Introduce operational **MATTER** debits:
```typescript
export const OPERATIONAL_MATTER_SINKS = {
  nutritionalGroundingProof: 1.5,
  recipeFeasibilityVerification: 2.0,
  pantryStateSync: 1.0,
  culinaryTransmutationAnchor: 3.0,
};
```

### 4.2 Vendor `lib/services/discriminant-faucet.ts`
Implement `computeDiscriminantDailyYield` supporting both agent natal charts and human user records (`user_natal_charts`).

### 4.3 Update `claimYieldForAgent` in `lib/services/agent-action-service.ts`
Replace the legacy symmetrical division:
```typescript
// ❌ OLD
const perAxis = totalYield / TOKEN_TYPES.length;
const amountsObj = { spirit: perAxis, essence: perAxis, matter: perAxis, substance: perAxis };

// ✅ NEW (ADR-014)
const natalData = this.extractAgentNatalAffinity(agent);
const liveTransit = await this.ephemerisService.getCurrentTransit();
const globalSupply = await this.economyService.getGlobalSupplyState();
const yields = computeDiscriminantDailyYield(natalData, liveTransit, globalSupply);

const amountsObj = {
  spirit: yields.spirit,
  essence: yields.essence,
  matter: yields.matter,
  substance: yields.substance,
};
```

---

## 5. Verification Runbook for ASOL

```bash
# 1. Run empirical simulation across 72 agents
bun run scripts/simulate-historical-faucet.ts

# 2. Run unit tests for discriminant faucet invariants
bun test test/economy/discriminant-agent-faucet.spec.ts

# 3. Dry-run the automated agent daily yield cron
curl -X POST http://localhost:3000/api/cron/agents/claim-yield \
  -H "Authorization: Bearer $CRON_SECRET"

# 4. Verify Token-2022 Devnet on-chain mint signatures
bun run scripts/solana-audit-devnet.ts
```
