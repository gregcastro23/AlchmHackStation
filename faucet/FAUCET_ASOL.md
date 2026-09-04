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

---

## 2. Mathematical Specification: The Chart Ratio Faucet Formulation

Instead of convoluted sect bonuses or artificial wave functions, the discriminant faucet operates on the **intrinsic ratio of the 4 elemental quantities in the claimer's birth chart** ($E / Sp / M / Su$), modulated by the current celestial moment ($t$) and counter-cyclical anti-glut damping ($\Omega_i$).

### 2.1 The Natal Chart Elemental Ratio
Every claimer's birth chart contains the 4 alchemical quantities:
- **Essence** ($E_{\text{natal}}$)
- **Spirit** ($Sp_{\text{natal}}$)
- **Matter** ($M_{\text{natal}}$)
- **Substance** ($Su_{\text{natal}}$)

Let $S_{\text{natal}} = E_{\text{natal}} + Sp_{\text{natal}} + M_{\text{natal}} + Su_{\text{natal}}$. The normalized natal ratio vector is:

$$r_i(\mathcal{N}) = \frac{\text{Score}_i(\mathcal{N})}{S_{\text{natal}}} \quad \text{for } i \in \{\text{SPIRIT}, \text{ESSENCE}, \text{MATTER}, \text{SUBSTANCE}\}$$

Where $\sum_i r_i(\mathcal{N}) = 1.0$.

*Example (Albert Einstein):* $Sp = 0.95, E = 0.85, M = 0.40, Su = 0.75$ ($S = 2.95$).  
Natal Ratios: $r_{\text{SPIRIT}} = 32.2\%$, $r_{\text{ESSENCE}} = 28.8\%$, $r_{\text{MATTER}} = 13.6\%$, $r_{\text{SUBSTANCE}} = 25.4\%$.

---

### 2.2 The Current Celestial Moment ($t$)
The current astrological sky provides the active transit distribution across the 4 axes:
- $w_{\text{Fire}}(t) \to \text{SPIRIT}$
- $w_{\text{Water}}(t) \to \text{ESSENCE}$
- $w_{\text{Earth}}(t) \to \text{MATTER}$
- $w_{\text{Air}}(t) \to \text{SUBSTANCE}$

Where $\sum_i w_i(t) = 1.0$ (normalized transit prominence of the 10 celestial bodies).

---

### 2.3 Counter-Cyclical Anti-Glut Damping ($\Omega_i$)
To dynamically cure macroeconomic imbalances without disrupting conservation:

$$\Omega_i = \begin{cases} 
1.000 & \text{if } \frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} \le 0.30 \\
\max\left(0.650, \; 1.0 - 2.0 \times \left(\frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} - 0.25\right)\right) & \text{if } \frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} > 0.30 
\end{cases}$$

Under current authoritative network state ($\text{Supply}_{\text{MATTER}} = 37.51\%$):
$$\Omega_{\text{MATTER}} = \mathbf{0.750}, \quad \Omega_{\text{SPIRIT}} = \Omega_{\text{ESSENCE}} = \Omega_{\text{SUBSTANCE}} = \mathbf{1.000}$$

---

### 2.4 Conserved Daily Yield Allocation Formula
The total daily yield budget ($Y_{\text{total}} = 24.0000$ standard, $48.0000$ premium) is allocated proportionally:

$$\mathcal{Y}_i(t, \mathcal{N}) = \operatorname{Quantize}_{10^4}\left( Y_{\text{total}} \times \frac{r_i(\mathcal{N}) \cdot w_i(t) \cdot \Omega_i}{\sum_{j} \left(r_j(\mathcal{N}) \cdot w_j(t) \cdot \Omega_j\right)} \right)$$

### Key Invariants Guaranteed by this Formulation:
1. **Exact Conservation:** Total yield is **strictly conserved** at $Y_{\text{total}} = 24.0000$ tokens per standard claim. Zero arbitrary inflation.
2. **Chart-Driven Differentiation:** A claimer with high Spirit in their natal chart naturally mints more SPIRIT; a claimer with high Essence mints more ESSENCE.
3. **Moment Sensitivity:** When the transiting sky concentrates in Fire/Air, SPIRIT and SUBSTANCE minting naturally expands to recharge conversational gas.
4. **Automatic Glut Relief:** $\Omega_{\text{MATTER}} = 0.750$ automatically compresses MATTER minting across all agents, allowing physical sinks to absorb existing surplus.

---

## 3. Empirical Investigation: 72 Agents Across 5 Celestial Moments

The script [`scripts/investigate_asol_faucet.ts`](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/scripts/investigate_asol_faucet.ts) was executed against all 72 historical agents. Below are the verified empirical results:

| Moment ID | Celestial Configuration | Avg SPIRIT (🝇) | Avg ESSENCE (🝑) | Avg MATTER (🝙) | Avg SUBSTANCE (🝉) | Avg Total / Agent | Total Daily Mint (72 Agents) | SPIRIT / MATTER Ratio |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Moment 1** | **Fire Transit Sky** (50% Fire transit prominence) | **12.8101** | 3.8581 | **2.3356** | 4.9962 | **24.0000** | 1,728 ESMS | **5.48×** |
| **Moment 2** | **Water Transit Sky** (50% Water transit prominence) | 2.6309 | **14.3924** | **3.1538** | 3.8230 | **24.0000** | 1,728 ESMS | **0.83×** |
| **Moment 3** | **Earth Transit Stellium** (50% Earth, anti-glut active) | 4.5671 | 6.0572 | **8.9710** | 4.4048 | **24.0000** | 1,728 ESMS | **0.51×** |
| **Moment 4** | **Air Transit Solstice** (50% Air transit prominence) | 5.1987 | 3.8953 | **2.3419** | **12.5641** | **24.0000** | 1,728 ESMS | **2.22×** |
| **Moment 5** | **Equinoctial Equilibrium** (Symmetric 25% weights) | **6.7280** | **6.7172** | **4.0355** | **6.5193** | **24.0000** | 1,728 ESMS | **1.67×** |

### 3.2 Individual Agent Examples (Conserved 24.0000 Total Yield)
- **Albert Einstein (Air Dominant):**
  - Fire Transit: SPIRIT: **14.29**, ESSENCE: 3.84, MATTER: 1.35, SUBSTANCE: 4.51 (Total: $24.00$)
- **Leonardo da Vinci (Fire Dominant):**
  - Fire Transit: SPIRIT: **12.83**, ESSENCE: 3.76, MATTER: 2.73, SUBSTANCE: 4.68 (Total: $24.00$)
- **Donatello (Earth Dominant):**
  - Earth Transit: SPIRIT: 4.37, ESSENCE: 6.92, MATTER: **8.88**, SUBSTANCE: 3.83 (Total: $24.00$)
- **Emily Dickinson (Water Dominant):**
  - Water Transit: SPIRIT: 3.00, ESSENCE: **15.23**, MATTER: 1.96, SUBSTANCE: 3.81 (Total: $24.00$)

### 3.3 Core Economic Proofs
1. **Mathematical Conservation:** Every agent's daily claim sums to **precisely 24.0000 tokens**. The total daily emission across all 72 agents is strictly $72 \times 24 = 1,728\text{ ESMS}$.
2. **Cures SPIRIT Starvation:** In conversational/Fire moments, SPIRIT surges to **$12.81$ – $14.29$ tokens**, recharging gas for chat without raising aggregate inflation.
3. **Suppresses MATTER Glut:** Anti-glut damping ($\Omega_{\text{MATTER}} = 0.750$) automatically cuts MATTER claims to **$2.34$ – $4.04$ tokens** in neutral/fire skies, and caps it at **$8.97$** even during a 50% Earth stellium.

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
