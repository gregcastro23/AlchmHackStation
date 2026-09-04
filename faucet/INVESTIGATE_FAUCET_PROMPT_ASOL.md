# Canonical ASOL Investigation Prompt: Chart-Ratio Astrological Faucet

> **Target Repository:** `AlchmAgentsSolana` (`/Users/GregCastro/ASOL/alchm-agents-solana`)  
> **Home Base Specification:** [`faucet/FAUCET_ASOL.md`](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/faucet/FAUCET_ASOL.md)  
> **Authoritative Standard:** ADR-014 (Chart-Ratio Discriminant Faucet & Reconciled Elemental Sinks)  

---

## ⚠️ MANDATORY CANONICAL TOKEN IDENTITIES & SYMBOL TIERS

The protocol operates with **EXACTLY FOUR CANONICAL TOKENS**. Their names must **NEVER VARY, BE ABBREVIATED, OR BE CONFLATED WITH ELEMENT NAMES**:

| # | Canonical Token | Primary Glyph | Triangular Variant | Unicode Fallback | Atomic Code | Pinned Devnet Mint Address |
| :-: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | **SPIRIT** | `🝇` (U+1F747) | `🜂` (U+1F702) | `△` / `▲` | `[SPRT]` | `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ` |
| 2 | **ESSENCE** | `🝑` (U+1F751) | `🜄` (U+1F704) | `▽` / `▼` | `[ESNC]` | `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf` |
| 3 | **MATTER** | `🝙` (U+1F759) | `🜃` (U+1F703) | `⯛` / `▽—` | `[MATR]` | `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4` |
| 4 | **SUBSTANCE** | `🝉` (U+1F749) | `🜁` (U+1F701) | `⯙` / `△—` | `[SUBS]` | `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa` |

Under NO circumstances shall tokens be called "Fire tokens", "Water tokens", "Earth tokens", or "Air tokens", nor referred to by legacy placeholders ("Ignis", "Aqua", "Terra", "Aeth"). Where primary glyphs cannot be displayed, triangular variants (`🜂`, `🜄`, `🜃`, `🜁`) or UTF-8 fallbacks (`△`, `▽`, `⯛`, `⯙`) MUST be used.

---

## STREAMLINED PROMPT FOR `AlchmAgentsSolana`

*Copy and paste the block below into an agent session running inside `/Users/GregCastro/ASOL/alchm-agents-solana`:*

```markdown
# TASK: Implement Chart-Ratio Astrological Faucet across the 72 Historical Agents (ADR-014)

You are calibrating and deploying the canonical ADR-014 Discriminant Astrological Faucet in `AlchmAgentsSolana`.

### 1. The Real Codebase Context
- The authoritative agent fleet consists of the **72 Historical Agents** exported in `lib/agents/historical/index.ts` (stored in PostgreSQL table `historical_agents`).
- Every agent has an authentic birth chart (`consciousness.natalChart`) with `alchemicalElements` (`spirit`, `essence`, `matter`, `substance`) and `dominantElement`.
- The automated hourly cron (`/api/cron/agents/claim-yield` -> `agentActionService.runDailyYieldForAgents()`) currently executes a blind symmetrical split in `claimYieldForAgent`:
  `const perAxis = totalYield / TOKEN_TYPES.length` (flat 6.0 of each coin).
- This flat faucet caused a 2.75x supply distortion on the network: **MATTER ($29.1\text{k}$) accumulated as a stagnant surplus**, while **SPIRIT ($10.6\text{k}$) suffered continuous depletion** because AI chat burns SPIRIT at 0.30 vs 0.20 for others.

### 2. The Clean Chart Ratio Formulation (No Sect Hacks, Exact Conservation)
Instead of arbitrary sect bonus multipliers, daily claims must be determined by the **proportional ratio of the 4 quantities in the claimer's birth chart** ($E / Sp / M / Su$), modulated by the current celestial moment ($t$) and counter-cyclical anti-glut damping ($\Omega_{\text{MATTER}} = 0.750$):

1. **Natal Chart Ratio Vector:**
   $$r_i(\mathcal{N}) = \frac{\text{Score}_i(\mathcal{N})}{E + Sp + M + Su} \quad \text{where } \sum_i r_i(\mathcal{N}) = 1.0$$

2. **Celestial Moment Transit Weights ($w_i(t)$):**
   Active sky distribution across Fire (SPIRIT), Water (ESSENCE), Earth (MATTER), and Air (SUBSTANCE) where $\sum_i w_i(t) = 1.0$.

3. **Anti-Glut Damping ($\Omega_i$):**
   $\Omega_{\text{MATTER}} = 0.750$ (derived from MATTER supply > 30%), $\Omega_{\text{SPIRIT}} = \Omega_{\text{ESSENCE}} = \Omega_{\text{SUBSTANCE}} = 1.000$.

4. **Conserved Daily Allocation:**
   $$\mathcal{Y}_i(t, \mathcal{N}) = Y_{\text{total}} \times \frac{r_i(\mathcal{N}) \cdot w_i(t) \cdot \Omega_i}{\sum_{j} \left(r_j(\mathcal{N}) \cdot w_j(t) \cdot \Omega_j\right)}$$
   Where $Y_{\text{total}} = 24.0000$ (Standard) or $48.0000$ (Premium).
   *Total yield is strictly conserved at 24.0000 tokens per claim.*

### 3. Implementation Steps
1. Create `lib/services/discriminant-faucet.ts` implementing `computeDiscriminantDailyYield` using this clean proportional ratio formulation.
2. Update `claimYieldForAgent(userId)` in `lib/services/agent-action-service.ts`:
   - Ingest the agent's natal chart ratios from `user_profiles` or `historical_agents`.
   - Call `computeDiscriminantDailyYield`.
   - Distribute the exact resulting amounts (`spirit`, `essence`, `matter`, `substance`) into `TokenBalance` and `TokenTransaction`.
3. Update `lib/economy-config.ts`:
   - Restructure `UNIFIED_CHAT_BASE_COST` to a balanced $0.25$ per token ($1.00$ total).
   - Add operational MATTER sinks (`nutritionalGroundingProof`: 1.50, `recipeFeasibilityVerification`: 2.00, `pantryStateSync`: 1.00).
4. Create and run `scripts/simulate-historical-faucet.ts`:
   - Ingest all 72 historical agents.
   - Simulate claims across 5 distinct celestial moments (Fire Sky, Water Sky, Earth Stellium, Air Solstice, Equinox).
   - Verify that every agent's total is exactly 24.0000, SPIRIT yield expands to 12.8+ during Fire transits, and MATTER yield is compressed to 2.3 – 4.0 during Fire/Air and capped at 8.9 during Earth stelliums.
```
