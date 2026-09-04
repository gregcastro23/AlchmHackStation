# Canonical Multi-Repository Orchestration Prompt: Astrological Faucet Specification (`Faucet.md`)

> **Usage:** Copy and execute this prompt in each of the three protocol repositories (`AlchmAgentsSolana`, `WhatToEatNext`, and `Pentacles`) to generate or audit their localized `Faucet.md`.  
> **Mandate:** All three repository specifications must agree **completely, unilaterally, and deterministically** on astronomical formulas, parameter definitions, safety corridors, and accounting invariants.  
> **CRITICAL TOKEN IDENTITY RULE:** The protocol's 4 canonical token names are strictly **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**. They must **NEVER VARY** or be substituted with element names ("Fire", "Water", "Earth", "Air") or obsolete placeholders ("Ignis", "Aqua", "Terra", "Aeth").

---

```markdown
You are tasked with generating the authoritative, canonical `Faucet.md` for this repository to implement ADR-014: Discriminant Astrological Faucet & Reconciled Elemental Sinks.

### ⚠️ CANONICAL TOKEN IDENTITY & MULTI-TIER SYMBOL MANDATE (NEVER VARY TOKEN NAMES)
The Alchm protocol operates with exactly four canonical tokens across all repositories, smart contracts, and user interfaces. Because specialized alchemical fonts may not render on all client devices, three standard symbol tiers are defined:

| # | Canonical Token | Primary Glyph | Triangular Variant | Unicode Fallback | Atomic Code | Pinned Devnet Mint | Cosmological Element |
| :-: | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
| 1 | **SPIRIT** | `🝇` (U+1F747) | `🜂` (U+1F702) | `△` / `▲` | `[SPRT]` | `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ` | **Fire** |
| 2 | **ESSENCE** | `🝑` (U+1F751) | `🜄` (U+1F704) | `▽` / `▼` | `[ESNC]` | `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf` | **Water** |
| 3 | **MATTER** | `🝙` (U+1F759) | `🜃` (U+1F703) | `⯛` / `▽—` | `[MATR]` | `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4` | **Earth** |
| 4 | **SUBSTANCE** | `🝉` (U+1F749) | `🜁` (U+1F701) | `⯙` / `△—` | `[SUBS]` | `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa` | **Air** |

Under NO circumstances may token names ever vary, be abbreviated, or be conflated with the underlying cosmological elements (Fire, Water, Earth, Air). "Fire", "Water", "Earth", and "Air" refer solely to transit aspects and natal affinities that modulate the mint rate of **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**. Where primary alchemical glyphs cannot be displayed, triangular variants (`🜂`, `🜄`, `🜃`, `🜁`) or UTF-8 shape fallbacks (`△`, `▽`, `⯛`, `⯙`) MUST be used.

---

### 1. Core Background & Architectural Reality
The legacy ESMS faucet dispensed a flat, symmetrical yield of 6.0 tokens per coin (`DAILY_ESMS_YIELD = 24`, 6 SPIRIT, 6 ESSENCE, 6 MATTER, 6 SUBSTANCE) to every account. Coupled with asymmetric operational burn rates (where conversational AI aggressively vaporizes SPIRIT at +50% markup while MATTER has near-zero computational sinks), this resulted in a severe 2.75x macroeconomic distortion (MATTER: 29.1k vs SPIRIT: 10.6k).

This repository must replace the blind symmetrical faucet with a **Discriminant Astrological Faucet** where daily claim yields are a continuous mathematical function of:
1. **The Claimer's Birth Chart ($\mathcal{N}$):** The proportional ratio of the 4 alchemical quantities ($E / Sp / M / Su$) in the minter's verified natal chart:
   $$r_i(\mathcal{N}) = \frac{\text{Score}_i(\mathcal{N})}{E + Sp + M + Su} \quad \text{where } \sum_i r_i(\mathcal{N}) = 1.0$$
2. **The Current Celestial Moment ($t$):** Live transit distribution $w_i(t)$ across Fire (SPIRIT), Water (ESSENCE), Earth (MATTER), and Air (SUBSTANCE), where $\sum_i w_i(t) = 1.0$.
3. **Counter-Cyclical Anti-Glut Damping ($\Omega_i$):** Suppressing minting by up to 35% when an elemental coin's circulating supply exceeds 30% of total supply (currently damping MATTER at $\Omega_{\text{MATTER}} = 0.750$).

---

### 2. Unilateral Mathematical Contract
The document must specify and adhere to the exact canonical formula for each coin $i \in \{\text{SPIRIT}, \text{ESSENCE}, \text{MATTER}, \text{SUBSTANCE}\}$:

$$\mathcal{Y}_i(t, \mathcal{N}_u) = \operatorname{Quantize}_{10^4}\left( Y_{\text{total}} \times \frac{r_i(\mathcal{N}_u) \cdot w_i(t) \cdot \Omega_i}{\sum_{j} \left(r_j(\mathcal{N}_u) \cdot w_j(t) \cdot \Omega_j\right)} \right)$$

- $Y_{\text{total}} = 24.0000$ (Standard) or $48.0000$ (Premium) tokens total per claim.
- $r_i(\mathcal{N}_u) = \text{Score}_i / (E + Sp + M + Su)$: Intrinsic chart ratio vector. (Neutral default without birth chart = $0.2500$).
- $w_i(t)$: Live celestial transit weights across the 4 axes ($\sum w_i = 1.0$).
- $\Omega_{\text{MATTER}} = 0.750$: Anti-glut damping when global MATTER share > 30% (currently 37.51%).
- **Strict Conservation Guarantee:** The sum across all 4 coins is **strictly conserved at 24.0000** (Standard) or **48.0000** (Premium). Zero arbitrary inflation or drift.

---

### 3. Repository-Specific Focus Areas
- **For `AlchmAgentsSolana` (ASOL):** Focus on the authoritative **72 historical agents** (`lib/agents/historical/` and `prisma.historical_agents`: Socrates, Einstein, Da Vinci, Newton, Curie, etc.), each possessing verified natal birth charts, alchemical element vectors, and Monica constants. Calibrate daily claims via `agentActionService.runDailyYieldForAgents()` across varied astronomical moments, reconciling `UNIFIED_CHAT_BASE_COST` (0.25 each of SPIRIT, ESSENCE, MATTER, SUBSTANCE), and Token-2022 Devnet on-chain mint reflection.
- **For `WhatToEatNext` (WTEN / alchm.kitchen):** Focus on human culinary user charts, seasonal ingredient transits, balancing MATTER sinks (nutritional verification 1.50, recipe feasibility 2.00, pantry sync 1.00), and restaurant redemption rails ($0.01/token).
- **For `Pentacles` (SpacetimeDB Cloud):** Focus on SpacetimeDB reducers (`request_yield_claim`, `confirm_yield_claim`), the 11-zone pentacle sky map, star altitude visibility, and 30 bps constellation AMM liquidity routing fees across the 6 coin pairs.

---

### 4. Output Deliverable
Generate `Faucet.md` at the root of the repository with full mathematical proofs, TypeScript/Rust interface contracts, test matrix vectors, and operational verification commands, strictly adhering to the 4 canonical token names: **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.
```
