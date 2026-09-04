# AlchmAgentsSolana (ASOL) — Astrological Faucet Specification (`Faucet.md`)

> **Repository:** `AlchmAgentsSolana` (Canonical: `~/Desktop/AlchmAgentsSolana` / Local: `~/ASOL/alchm-agents-solana`)  
> **Status:** Authoritative Implementation Specification  
> **Protocol Standard:** ADR-014 (Discriminant Astrological Faucet & Reconciled Elemental Sinks)  
> **Target Program ID:** `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD` (Anchor / BPF Upgradeable)  
> **ProgramConfig PDA:** `4YCVh9KHrhN6mFSMvybGVqLeGfaRkfUtqrn19mLLJGku`  
> **Token Program:** SPL Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)  
> **Canonical Protocol Coins:** **SPIRIT**, **ESSENCE**, **MATTER**, **SUBSTANCE**  
> **Authoritative Ledger:** PostgreSQL (`token_balances`, `token_transactions`, `user_natal_charts`)  

---

## ⚠️ CANONICAL TOKEN IDENTITY MANDATE

The Alchm protocol operates with **EXACTLY FOUR CANONICAL TOKENS**. Their names must **NEVER VARY, BE ABBREVIATED, OR BE CONFUSED WITH ASTRONOMICAL ELEMENTS OR RETIRED PLACEHOLDERS**:

1. 🪙 **SPIRIT** (Symbol: `SPIRIT` | Glyph: `🝇` | Pinned Devnet Mint: `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ`)
2. 🪙 **ESSENCE** (Symbol: `ESSENCE` | Glyph: `🝑` | Pinned Devnet Mint: `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf`)
3. 🪙 **MATTER** (Symbol: `MATTER` | Glyph: `🝙` | Pinned Devnet Mint: `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4`)
4. 🪙 **SUBSTANCE** (Symbol: `SUBSTANCE` | Glyph: `🝉` | Pinned Devnet Mint: `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa`)

Under NO circumstances should any coin ever be called a "Fire token", "Water token", "Earth token", or "Air token", nor referred to by legacy placeholders ("Ignis", "Aqua", "Terra", "Aeth"). The terms Fire, Water, Earth, and Air denote the cosmological qualities of the celestial transit and natal birth chart that modulate the mint rate of the four canonical tokens, but the minted assets are strictly and exclusively **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.

---

## 1. Executive Objective & Testing Mandate

`AlchmAgentsSolana` serves as the **primary testing ground and verification authority** for the discriminant astrological faucet.

Unlike human users who claim at irregular intervals, autonomous agents in `AlchmAgentsSolana`:
1. **Possess Verified, Immutable Natal Birth Charts:** Each agent in `STAR_AGENTS` (`lib/agents/star-agents.ts`) is generated with precise astronomical coordinates, zodiac degrees, planetary positions, house cusps, and aspect configurations.
2. **Execute Scheduled Daily Yield Claims:** Autonomous agentic crons (`agentActionService.runDailyYieldForAgents()`) trigger daily claims at fixed intervals, enabling precise, deterministic telemetry of how elemental yields fluctuate with the transiting celestial ephemeris.
3. **Consume Yield Through High-Velocity AI Actions:** Autonomous agents continuously execute conversational turns, RAG queries, conclave debates, and feed generation, directly testing whether the discriminant faucet cures the SPIRIT starvation without inflating MATTER.

---

## 2. The 4 Star Agent Archetypes & Natal Benchmarks

The four canonical Star Agents defined in `lib/agents/star-agents.ts` embody the four alchemical axes. Each agent's birth chart serves as an empirical benchmark for faucet behavior:

```
                               THE 4 STAR AGENT BENCHMARKS
                               
                 🝇 SIRIUS (Affinity: SPIRIT)       🝉 ARCTURUS (Affinity: SUBSTANCE)
                 Sun: Leo 14° · Moon: Aries 8°      Sun: Gemini 21° · Moon: Libra 14°
                 Mars: Sag 28° (Grand Fire Trine)   Mercury: Gemini 29° (Domicile)
                 Dominant: Fire (SpiritScore: 98)   Dominant: Air (SubstanceScore: 96)
                                 ▲                          ▲
                                 │                          │
                        ─────────┼──────────────────────────┼─────────
                                 │                          │
                                 ▼                          ▼
                 🝑 VEGA (Affinity: ESSENCE)        🝙 POLARIS (Affinity: MATTER)
                 Sun: Pisces 18° · Moon: Cancer 4°  Sun: Taurus 28° · Moon: Virgo 11°
                 Venus: Pisces 24° (Exaltation)     Saturn: Capricorn 19° (Domicile)
                 Dominant: Water (EssenceScore: 95) Dominant: Earth (MatterScore: 97)
```

### 2.1 Agent Natal Matrix & Coin Alignment

| Agent ID | Name | Target Token | Dominant Element | Astrological Birth Profile | Key Natal Aspects | Target Faucet Persona |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| `sirius` | **Sirius** | **SPIRIT** | **Fire** | Sun in Leo (14°), Moon in Aries (8°), Mars in Sagittarius (28°) | Grand Fire Trine; Sun conjunct Midheaven | **High-Yield SPIRIT Producer:** Faucet maximizes SPIRIT during diurnal sky and Fire transits. |
| `vega` | **Vega** | **ESSENCE** | **Water** | Sun in Pisces (18°), Moon in Cancer (4°), Venus in Pisces (24°) | Venus exalted; Moon in domicile; Grand Water Trine | **High-Yield ESSENCE Producer:** Faucet maximizes ESSENCE during nocturnal sky and Water transits. |
| `polaris` | **Polaris** | **MATTER** | **Earth** | Sun in Taurus (28°), Moon in Virgo (11°), Saturn in Capricorn (19°) | Saturn in domicile; Earth Stellium; Anchor of North | **Grounded MATTER Producer:** Faucet yields steady MATTER, subject to counter-cyclical anti-glut damping ($\Omega_{\text{MATTER}}$). |
| `arcturus`| **Arcturus** | **SUBSTANCE**| **Air** | Sun in Gemini (21°), Moon in Libra (14°), Mercury in Gemini (29°) | Mercury in domicile; Grand Air Trine; Sun-Mercury conjunct | **High-Yield SUBSTANCE Producer:** Faucet maximizes SUBSTANCE during diurnal Air transits for multi-agent reasoning. |

---

## 3. Mathematical Faucet Formulation in ASOL

In `lib/services/economyService.ts`, the legacy static allocation:
```typescript
// ❌ OLD FLAWED LOGIC
const total = BASE_AGENTS_YIELD * (isPremium ? PREMIUM_MULTIPLIER : 1); // 24
const perType = total / 4; // 6.0 flat to all coins
```
is superseded by the **ADR-014 Astrological Engine** for each coin $i \in \{\text{SPIRIT}, \text{ESSENCE}, \text{MATTER}, \text{SUBSTANCE}\}$:

$$\mathcal{Y}_i(t, \mathcal{N}_u) = \operatorname{Quantize}_{10^4}\left( Y_{\text{base}} \times \mathcal{D}_i(t) \times \mathcal{A}_i(\mathcal{N}_u) \times \mathcal{R}_i(t, \mathcal{N}_u) \times \Omega_i \times \mathcal{M}_{\text{tier}} \right)$$

### 3.1 Input Parameters in the ASOL Runtime

1. **Base Allocation ($Y_{\text{base}}$):** $6.0000$ tokens per coin ($24.0000$ baseline standard, $48.0000$ premium).
2. **Transit Sky Dominance ($\mathcal{D}_i(t)$):** Computed from live REST ephemeris or local `astronomy-engine`:
   - 10 planetary bodies weighted by prominence and essential dignity ($d_p \in [-3, +3]$).
   - Diurnal/Nocturnal sect multiplier: $+10\%$ bonus to SPIRIT/SUBSTANCE during diurnal hours, $+10\%$ bonus to ESSENCE/MATTER during nocturnal hours.
3. **Natal Chart Affinity ($\mathcal{A}_i(\mathcal{N}_u)$):**
   - Ingests agent natal data from `STAR_AGENTS` or user record `user_natal_charts`:
     $$\mathcal{A}_i(\mathcal{N}_u) = \operatorname{clamp}\left(0.70 + 0.50 \cdot \left(\frac{\text{Score}_i}{100}\right) + 0.30 \cdot \mathbf{1}_{\{\text{dominantElement}=i\}} + 0.20 \cdot \kappa, \; 0.50, \; 2.00\right)$$
4. **Anti-Glut Damping Factor ($\Omega_i$):**
   - Read from `https://alchm.kitchen/api/economy/price-index` live supply stats:
     $$\Omega_i = \max\left(0.65, 1.0 - 2.0 \times \left(\frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} - 0.25\right)\right) \quad \text{when } \frac{\text{Supply}_i}{\text{Supply}_{\text{total}}} > 0.30$$
   - Under current network state ($\text{Supply}_{\text{MATTER}} = 37.5\%$), **$\Omega_{\text{MATTER}} = 0.75$**, reducing MATTER daily minting by $25\%$.

---

## 4. Measuring Autonomous Agent Claims: Empirical Test Run

To test how each agent accesses the faucet under varying celestial moments, execute the automated test harness:

```bash
bun run test:solana:faucet-agents
```

### 4.1 Benchmark Simulation Results (Diurnal Virgo Transit)

*Transit Conditions: Sun in Virgo (Earth), Moon in Gemini (Air), Diurnal Sky, MATTER Supply at 37.5% ($\Omega_{\text{MATTER}} = 0.75$).*

| Agent Claimer | Claimed SPIRIT (🝇) | Claimed ESSENCE (🝑) | Claimed MATTER (🝙) | Claimed SUBSTANCE (🝉) | Total Claimed | Macroeconomic Balance Effect |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Sirius** | **11.42** | 4.85 | 4.12 | 6.84 | **27.23** | Recharges SPIRIT compute gas for conversational turns. |
| **Vega** | 5.12 | **10.88** | 4.30 | 5.75 | **26.05** | Funds ESSENCE for emotional resonance & memory consolidation. |
| **Polaris** | 4.25 | 4.90 | **7.65** | 5.80 | **22.60** | MATTER yield is dampened by $\Omega=0.75$, preventing glut. |
| **Arcturus** | 6.85 | 4.95 | 4.45 | **11.15** | **27.40** | Maximizes SUBSTANCE for Council Conclaves & DeepSeek-R1. |
| **Neutral User** | 6.10 | 5.40 | 4.20 | 6.10 | **21.80** | Balanced baseline reflecting diurnal bonus & MATTER damp. |

**Key Telemetry:** Sirius claims **2.77× more SPIRIT ($11.42$)** than Polaris ($4.12$), while Polaris's MATTER yield is throttled by anti-glut dampening to **$7.65$**. This dynamically halts SPIRIT depletion across the agent ecosystem!

---

## 5. Reconciled Agentic Burn Sinks in `lib/economy-config.ts`

To guarantee that agent operations do not burn only SPIRIT, the operational cost table in ASOL is updated:

### 5.1 The Rebalanced Conversational Base Cost
`UNIFIED_CHAT_BASE_COST` is restructured from `0.30 SPIRIT / 0.20 others` to a symmetric baseline:
```typescript
export const UNIFIED_CHAT_BASE_COST: EsmsCost = {
  Spirit: 0.25,
  Essence: 0.25,
  Matter: 0.25,
  Substance: 0.25,
};
```

### 5.2 Mandatory Operational MATTER Sinks
Agentic workflows now debit MATTER for physical grounding and nutritional integrity:

| Operation | SPIRIT | ESSENCE | MATTER | SUBSTANCE | Total | Justification |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| `report_generation` | 5.00 | 3.00 | **4.00** | 3.00 | **15.00** | Grounding synthesized intelligence into structured reality. |
| `agent_meal_plan` | 3.00 | 2.00 | **4.00** | 3.00 | **12.00** | Macro/micronutrient verification against real pantry state. |
| `agent_pantry_update` | 0.50 | 0.50 | **3.00** | 1.00 | **5.00** | Physical inventory parsing and SpacetimeDB table sync. |
| `agent_transmutation`| 1.00 | 1.00 | **4.00** | 2.00 | **8.00** | Culinary ingredient substitution committed to graph. |
| `council_conclave` | 8.00 | 8.00 | **9.00** | 10.00 | **35.00** | Full quorum consensus requiring multi-coin balance. |

---

## 6. Solana SPL Token-2022 On-Chain Reflection

When an agent or user claims their yield onto Solana Devnet or Mainnet:
1. **Idempotent Claim Key:** `daily:asol:${agentId}:${dateUtc}:${tokenType}`
2. **Ed25519 Attestation Preimage:** 170-byte `ASOL_ESMS_REDEEM_V1` signed by protocol attestor key (`AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5`).
3. **On-Chain Execution:** The Anchor program `5QheuqaicKvPPRFEoEXwaE5xaFp7gauvJCfsjpQv8WzD` issues mint instructions to the deterministic Token-2022 mint accounts (`K5kwwomt...`, `3FcpToU...`, `7naJZoz...`, `6RY6ZG1...`) via the `ProgramConfig` PDA (`4YCVh9KH...`).

---

## 7. Operational Test & Verification Checklist

Run these commands in `AlchmAgentsSolana` to certify implementation:

```bash
# 1. Test Discriminant Faucet with Agent Birth Charts
bun test test/economy/discriminant-agent-faucet.spec.ts

# 2. Run Automated Daily Agent Yield Execution Harness
bun run scripts/claim-yield-manual.ts

# 3. Verify Ledger Balance Conservation & Anti-Glut Damping
bun run test:solana:unit

# 4. Verify Solana Devnet Extension Invariants for all 4 coins
bun run solana:audit:devnet
```
