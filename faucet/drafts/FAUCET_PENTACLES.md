# Pentacles (SpacetimeDB Cloud Client) — Astrological Faucet Specification (`Faucet.md`)

> **Target Repository:** `Pentacles` (`~/Spacetimedbhackathon/Pentacles` / `~/Pentacles`)  
> **Status:** Draft Implementation Specification  
> **Protocol Standard:** ADR-014 (Discriminant Astrological Faucet & Reconciled Elemental Sinks)  
> **Canonical Protocol Coins:** **SPIRIT**, **ESSENCE**, **MATTER**, **SUBSTANCE**  
> **Accrual Ledger:** SpacetimeDB Cloud (`cookingwithcastrollc` module)  
> **Staking Contract:** `StarVault.sol` (Circle Arc Testnet / Solana Anchor Program)  
> **AMM Liquidity Pairs:** 6 Constellation Pools (30 bps routing fee)  
> **Sky Map Architecture:** 11 Pentacle Zones (1 Crown, 5 Spires, 5 Houses)  

---

## ⚠️ CANONICAL TOKEN IDENTITY MANDATE

The Alchm protocol operates with **EXACTLY FOUR CANONICAL TOKENS**. Their names must **NEVER VARY, BE ABBREVIATED, OR BE CONFUSED WITH ASTRONOMICAL ELEMENTS OR RETIRED PLACEHOLDERS**:

1. 🪙 **SPIRIT** (Symbol: `SPIRIT` | Glyph: `🝇` | Pinned Devnet Mint: `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ`)
2. 🪙 **ESSENCE** (Symbol: `ESSENCE` | Glyph: `🝑` | Pinned Devnet Mint: `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf`)
3. 🪙 **MATTER** (Symbol: `MATTER` | Glyph: `🝙` | Pinned Devnet Mint: `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4`)
4. 🪙 **SUBSTANCE** (Symbol: `SUBSTANCE` | Glyph: `🝉` | Pinned Devnet Mint: `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa`)

Under NO circumstances should any coin ever be called a "Fire token", "Water token", "Earth token", or "Air token", nor referred to by legacy placeholders ("Ignis", "Aqua", "Terra", "Aeth"). The terms Fire, Water, Earth, and Air denote the cosmological qualities of the celestial transit and natal birth chart that modulate the mint rate of the four canonical tokens, but the minted assets are strictly and exclusively **SPIRIT**, **ESSENCE**, **MATTER**, and **SUBSTANCE**.

---

## 1. Executive Summary & Staking Topography

`Pentacles` is the real-time celestial visualization, star-vault staking, and multi-coin liquidity engine of the Alchm protocol.

In this surface:
1. **USDC Staking on Celestial Stars:** Users stake USDC on individual fixed stars (e.g., Sirius, Vega, Polaris, Arcturus, Aldebaran, Antares).
2. **Deterministic Token Accrual:** Yield accrues continuously in the star's corresponding canonical token:
   - Sirius / Antares $\to$ Yields **SPIRIT**
   - Vega / Canopus $\to$ Yields **ESSENCE**
   - Polaris / Spica $\to$ Yields **MATTER**
   - Arcturus / Rigel $\to$ Yields **SUBSTANCE**
3. **11-Zone Pentacle Sky Map:** The sky is partitioned into 11 zones (1 central Crown, 5 Spires, 5 Houses), tinted by transiting planetary dominance and local star elevation.
4. **Constellation AMM Routing:** Zero-escrow atomic swaps between the 4 canonical coins are mediated across 6 constellation pools via SpacetimeDB reducers.

---

## 2. The Multiplicative Staking Faucet Formulation

In `Pentacles`, the continuous yield rate per USDC staked on star $s$ by staker $u$ at instant $t$ is formulated as:

$$\mathcal{Y}_{\text{daily}}(s, u, t) = \text{BASE\_DAILY\_RATE} \times \mathcal{Z}_{\text{dom}}(s, t) \times \mathcal{A}_{\text{chart}}(s, \mathcal{N}_u) \times \mathcal{P}_{\text{dignity}}(s, t) \times \mathcal{V}_{\text{vis}}(s, t) \times \Omega_i$$

### 2.1 Formula Parameters

1. **$\text{BASE\_DAILY\_RATE}$:** $0.0006$ tokens per USDC per day ($\approx 21.9\%$ baseline APR).
2. **Zone Dominance $\mathcal{Z}_{\text{dom}}(s, t) \in [0.50, 2.00]$:**
   - Evaluates the share of transiting planets whose sign and elemental affinity reinforce the star's affiliated token axis.
3. **Staker Chart Affinity $\mathcal{A}_{\text{chart}}(s, \mathcal{N}_u) \in [0.50, 2.50]$:**
   - Reads the staker's natal chart record from SpacetimeDB table `user_natal_charts`:
     $$\mathcal{A}_{\text{chart}} = 0.75 + 0.50 \cdot \mathbf{1}_{\{\text{dominantElement} = \text{Element}(s)\}} + 0.50 \cdot \left(\frac{\text{Score}_{\text{Element}(s)}}{100}\right) + 0.50 \cdot \kappa$$
4. **Planet Dignity $\mathcal{P}_{\text{dignity}}(s, t) \in [1.00, 2.00]$:**
   - Dignity bonus from transiting planets conjunct the star's sign ($1.0 + \sum |dignity| \times 0.1$).
5. **Star Visibility $\mathcal{V}_{\text{vis}}(s, t) \in \{0, 1\}$:**
   - Derived from real-time observer coordinates $(\text{lat}, \text{lon})$ and star coordinates $(\text{ra}, \text{dec})$:
     $$\mathcal{V}_{\text{vis}} = 1 \iff \text{Altitude}(s, t) > 0^\circ \quad (\text{Star above horizon})$$
6. **Anti-Glut Damping Factor $\Omega_i \in [0.65, 1.00]$:**
   - When staking stars that yield **MATTER** (e.g. Polaris), if global MATTER supply exceeds $30\%$, yield is suppressed by up to $35\%$ ($\Omega_{\text{MATTER}} = 0.75$).

---

## 3. SpacetimeDB Reducer Specification

Yield claims and AMM swaps are committed directly through SpacetimeDB reducers:

### 3.1 `request_yield_claim_reducer`
- **Inputs:** `staker_address: Identity`, `star_id: u32`, `staked_amount: u64`, `client_timestamp: u64`
- **Validation:**
  - Asserts that star altitude is above horizon ($\mathcal{V}_{\text{vis}} = 1$).
  - Evaluates live transit planets from `ephemeris_state` table.
  - Queries `user_natal_charts` for staker affinity $\mathcal{A}_{\text{chart}}$.
  - Queries `global_economy_state` to apply anti-glut coefficient $\Omega_i$.
- **State Mutation:**
  - Computes exact $10^6$ micro-token integer yield for **SPIRIT**, **ESSENCE**, **MATTER**, or **SUBSTANCE**.
  - Emits `yield_claim_approved` event with cryptographic digest.

### 3.2 `confirm_yield_claim_reducer`
- **Inputs:** `claim_id: u64`, `attestation_signature: Vec<u8>`
- **Validation:**
  - Verifies Ed25519 attestation signature matches protocol authority.
- **State Mutation:**
  - Credits the user's `staker_elemental_balances` table for the specific canonical token.
  - Dispatches WebSocket update to `AlchmHackStation` and `AlchmAgentsSolana`.

---

## 4. Reconciled Constellation AMM Sinks & Routing Fees

`Pentacles` executes zero-escrow atomic swaps between the 4 canonical coins across 6 constellation pools:

```
                          THE 6 CONSTELLATION POOLS
                          
         Pool 0: SPIRIT ⟷ ESSENCE          Pool 3: ESSENCE ⟷ MATTER
         Pool 1: SPIRIT ⟷ MATTER           Pool 4: ESSENCE ⟷ SUBSTANCE
         Pool 2: SPIRIT ⟷ SUBSTANCE        Pool 5: MATTER ⟷ SUBSTANCE
```

### 4.1 AMM Routing Fee Invariant
- **Standard Protocol Fee:** $30\text{ bps}$ ($0.30\%$) deducted from input atoms.
- **Custody Model:** Zero-custody. Input token is burned via `PermanentDelegate`, output token is minted via `ProgramConfig` authority.
- **Invariant Conservation:** Relative elemental index parities ($10^4$ lossless integer scaling):
  $$\text{OutAtoms} = \frac{\text{InAtomsWithFee} \times \text{Index}_{\text{In}}}{\text{Index}_{\text{Out}}}$$

### 4.2 Sacred Geometry & Energy Harmonic Sinks
When stakers configure celestial defense shields or calibrate harmonic resonators:
- **`sacred_geometry_design`:** Consumes **$2.00$ SPIRIT, $4.00$ ESSENCE, $2.00$ MATTER, $4.00$ SUBSTANCE** ($12.00$ tokens total).
- **`energy_harmonic_calibration`:** Consumes **$3.00$ SPIRIT, $3.00$ ESSENCE, $3.00$ MATTER, $3.00$ SUBSTANCE** ($12.00$ tokens total).

---

## 5. Verification & Telemetry Matrix

To verify the discriminant faucet within `Pentacles`:

```bash
# 1. Run SpacetimeDB Staking Reducer Tests
spacetime call cookingwithcastrollc test_yield_claim_harness

# 2. Assert Star Altitude Visibility Gating
spacetime call cookingwithcastrollc verify_star_visibility_filter

# 3. Assert MATTER Anti-Glut Suppression
spacetime call cookingwithcastrollc assert_anti_glut_damping 29116 77614

# 4. Verify AMM 30 bps Fee Invariant Across the 6 Coin Pairs
bun test test/amm-constellation-routing.spec.ts
```
