# Canonical Multi-Repository Orchestration Prompt: Astrological Faucet Specification (`Faucet.md`)

> **Usage:** Copy and execute this prompt in each of the three protocol repositories (`AlchmAgentsSolana`, `WhatToEatNext`, and `Pentacles`) to generate or audit their localized `Faucet.md`.  
> **Mandate:** All three repository specifications must agree **completely, unilaterally, and deterministically** on astronomical formulas, parameter definitions, safety corridors, and accounting invariants.  
> **CRITICAL TOKEN IDENTITY RULE:** The protocol's 4 canonical token names are strictly **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**. They must **NEVER VARY** or be substituted with element names ("Fire", "Water", "Earth", "Air") or obsolete placeholders ("Ignis", "Aqua", "Terra", "Aeth").

---

```markdown
You are tasked with generating the authoritative, canonical `Faucet.md` for this repository to implement ADR-014: Discriminant Astrological Faucet & Reconciled Elemental Sinks.

### ⚠️ CANONICAL TOKEN IDENTITY MANDATE (NEVER VARY TOKEN NAMES)
The Alchm protocol operates with exactly four canonical tokens across all repositories, smart contracts, and user interfaces:
1. **SPIRIT** (Glyph: 🝇 | Decimals: 4 | Pinned Devnet Mint: `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ`)
2. **ESSENCE** (Glyph: 🝑 | Decimals: 4 | Pinned Devnet Mint: `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf`)
3. **MATTER** (Glyph: 🝙 | Decimals: 4 | Pinned Devnet Mint: `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4`)
4. **SUBSTANCE** (Glyph: 🝉 | Decimals: 4 | Pinned Devnet Mint: `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa`)

Under NO circumstances may token names ever vary, be abbreviated, or be conflated with the underlying astronomical elements (Fire, Water, Earth, Air). "Fire", "Water", "Earth", and "Air" refer solely to transit aspects and natal affinities that modulate the mint rate of **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.

---

### 1. Core Background & Architectural Reality
The legacy ESMS faucet dispensed a flat, symmetrical yield of 6.0 tokens per coin (`DAILY_ESMS_YIELD = 24`, 6 SPIRIT, 6 ESSENCE, 6 MATTER, 6 SUBSTANCE) to every account. Coupled with asymmetric operational burn rates (where conversational AI aggressively vaporizes SPIRIT at +50% markup while MATTER has near-zero computational sinks), this resulted in a severe 2.75x macroeconomic distortion (MATTER: 29.1k vs SPIRIT: 10.6k).

This repository must replace the blind symmetrical faucet with a **Discriminant Astrological Faucet** where daily claim yields are a continuous mathematical function of:
1. **The Current Moment ($t$):** Live celestial transit dignity, planetary hour, diurnal/nocturnal sect, and zodiac sign distribution from the canonical ephemeris.
2. **The Claimer's Birth Chart ($\mathcal{N}$):** The minter's verified natal dominant element, elemental scores (`spiritScore`, `essenceScore`, `matterScore`, `substanceScore`), and Monica constant ($\kappa$).
3. **Counter-Cyclical Anti-Glut Damping ($\Omega_i$):** Suppressing minting by up to 35% when an elemental coin's circulating supply exceeds 30% of total supply (currently damping MATTER at 0.75x).

---

### 2. Unilateral Mathematical Contract
The document must specify and adhere to the exact canonical formula for each coin $i \in \{\text{SPIRIT}, \text{ESSENCE}, \text{MATTER}, \text{SUBSTANCE}\}$:

$$\mathcal{Y}_i(t, \mathcal{N}_u) = \operatorname{Quantize}_{10^4}\left( Y_{\text{base}} \times \mathcal{D}_i(t) \times \mathcal{A}_i(\mathcal{N}_u) \times \mathcal{R}_i(t, \mathcal{N}_u) \times \Omega_i \times \mathcal{M}_{\text{tier}} \right)$$

- $Y_{\text{base}} = 6.0000$ tokens per coin ($24.0000$ baseline total).
- $\mathcal{D}_i(t) \in [0.60, 1.80]$: Transit Sky Dominance based on 10 planetary bodies, essential dignities $d_p \in [-3, +3]$, and Diurnal/Nocturnal sect ($+10\%$ to SPIRIT/SUBSTANCE by day, $+10\%$ to ESSENCE/MATTER by night).
- $\mathcal{A}_i(\mathcal{N}_u) \in [0.50, 2.00]$: Natal Affinity ($0.70 + 0.50 \cdot (\text{Score}_i/100) + 0.30 \cdot \mathbf{1}_{\{\text{dominantElement}=i\}} + 0.20 \cdot \kappa$). Neutral default without birth chart = $1.0000$.
- $\mathcal{R}_i(t, \mathcal{N}_u) \in [0.75, 1.35]$: Celestial-Natal Waveform Resonance (trines/sextiles $+20..+35\%$, squares/oppositions $0.75..0.85\times$).
- $\Omega_i \in [0.65, 1.00]$: Anti-Glut Damping: $\max(0.65, 1.0 - 2.0 \times (\text{SupplyShare}_i - 0.25))$ when $\text{SupplyShare}_i > 0.30$.
- $\mathcal{M}_{\text{tier}} \in \{1.0, 2.0\}$: Standard (1.0) vs Premium (2.0) account tier.
- Bounded Safety Corridors:
  - Standard Tier: $[1.5000, 12.0000]$ tokens per coin; $[18.0000, 36.0000]$ total per claim.
  - Premium Tier: $[3.0000, 24.0000]$ tokens per coin; $[36.0000, 72.0000]$ total per claim.

---

### 3. Repository-Specific Focus Areas
- **For `AlchmAgentsSolana` (ASOL):** Focus on autonomous agent birth charts (`STAR_AGENTS`: Sirius $\to$ SPIRIT, Vega $\to$ ESSENCE, Polaris $\to$ MATTER, Arcturus $\to$ SUBSTANCE), testing agent daily claims via `agentActionService.ts`, and reconciling `UNIFIED_CHAT_BASE_COST` (0.25 each of SPIRIT, ESSENCE, MATTER, SUBSTANCE) with Solana SPL Token-2022 mints.
- **For `WhatToEatNext` (WTEN / alchm.kitchen):** Focus on human culinary user charts, seasonal ingredient transits, balancing MATTER sinks (nutritional verification 1.50, recipe feasibility 2.00, pantry sync 1.00), and restaurant redemption rails ($0.01/token).
- **For `Pentacles` (SpacetimeDB Cloud):** Focus on SpacetimeDB reducers (`request_yield_claim`, `confirm_yield_claim`), the 11-zone pentacle sky map, star altitude visibility, and 30 bps constellation AMM liquidity routing fees across the 6 coin pairs.

---

### 4. Output Deliverable
Generate `Faucet.md` at the root of the repository with full mathematical proofs, TypeScript/Rust interface contracts, test matrix vectors, and operational verification commands, strictly adhering to the 4 canonical token names: **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.
```
