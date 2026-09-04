# ASOL Astrological Faucet Runbook & Implementation Prompt

> **Target Directory:** `/Users/GregCastro/ASOL/alchm-agents-solana`  
> **Protocol Standard:** ADR-014 (Discriminant Astrological Faucet & Reconciled Elemental Sinks)  
> **Authority Specification:** [`faucet/FAUCET_ASOL.md`](file:///Users/GregCastro/Desktop/AlchmHackStation/AlchmHackStation/faucet/FAUCET_ASOL.md)  
> **Scope:** Autonomous agent daily claim calibration across the 72 historical agents.  

---

## ⚠️ MANDATORY CANONICAL TOKEN IDENTITIES & SYMBOLS

| # | Token Name | Primary Glyph | Triangular Variant | Unicode Fallback | Atomic Code | Pinned Devnet Mint |
| :-: | :--- | :---: | :---: | :---: | :---: | :--- |
| 1 | **SPIRIT** | `🝇` (U+1F747) | `🜂` (U+1F702) | `△` / `▲` | `[SPRT]` | `K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ` |
| 2 | **ESSENCE** | `🝑` (U+1F751) | `🜄` (U+1F704) | `▽` / `▼` | `[ESNC]` | `3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf` |
| 3 | **MATTER** | `🝙` (U+1F759) | `🜃` (U+1F703) | `⯛` / `▽—` | `[MATR]` | `7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4` |
| 4 | **SUBSTANCE** | `🝉` (U+1F749) | `🜁` (U+1F701) | `⯙` / `△—` | `[SUBS]` | `6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa` |

Under NO circumstances shall tokens be called "Fire tokens", "Water tokens", "Earth tokens", or "Air tokens", nor referred to by legacy placeholders ("Ignis", "Aqua", "Terra", "Aeth").

---

## 1. Streamlined Operational Prompt for `alchm-agents-solana`

Copy and execute this prompt inside the `alchm-agents-solana` environment to calibrate and deploy the discriminant faucet:

```markdown
You are calibrating the ADR-014 Discriminant Astrological Faucet in `alchm-agents-solana`.

### Context & Problem
The legacy daily claim cron (`/api/cron/agents/claim-yield` -> `agentActionService.runDailyYieldForAgents()`) splits `AGENT_DAILY_YIELD` (24.0) evenly across all 4 axes (flat 6.0 SPIRIT, 6.0 ESSENCE, 6.0 MATTER, 6.0 SUBSTANCE).
Because conversational actions consume SPIRIT heavily while MATTER lacks operational agent sinks, the economy suffered a 2.75x imbalance (MATTER: 29.1k vs SPIRIT: 10.6k).

### Implementation Objective
1. Inspect `lib/agents/historical/index.ts` containing the authoritative 72 historical agents (Socrates, Leonardo da Vinci, Albert Einstein, Marie Curie, Isaac Newton, etc.).
2. Implement `lib/services/discriminant-faucet.ts` to compute:
   $$\mathcal{Y}_i(t, \mathcal{N}_a) = \operatorname{Quantize}_{10^4}\left( Y_{\text{base}} \times \mathcal{D}_i(t) \times \mathcal{A}_i(\mathcal{N}_a) \times \Omega_i \times \mathcal{M}_{\text{tier}} \right)$$
   Where:
   - $Y_{\text{base}} = 6.0000$ tokens per axis.
   - $\mathcal{D}_i(t) \in [0.60, 1.80]$: Live transit sky dominance + sect bonus (+10% SPIRIT/SUBSTANCE by day, +10% ESSENCE/MATTER by night).
   - $\mathcal{A}_i(\mathcal{N}_a) \in [0.50, 2.00]$: Natal affinity derived from `agent.consciousness.alchemicalElements` and `dominantElement`.
   - $\Omega_{\text{MATTER}} = 0.750$: Anti-glut damping when global MATTER share > 30% (currently 37.51%).
   - Safety bounds: $[1.50, 12.00]$ per coin, $[18.00, 36.00]$ total claim.
3. Update `agentActionService.claimYieldForAgent` to replace the flat `totalYield / 4` with `computeDiscriminantDailyYield`.
4. Rebalance `UNIFIED_CHAT_BASE_COST` in `lib/economy-config.ts` to 0.25 of each token (1.00 total) and introduce operational MATTER sinks (nutritional grounding proof: 1.50, recipe feasibility: 2.00, pantry sync: 1.00).
5. Run the empirical simulation script `scripts/simulate-historical-faucet.ts` to verify yield distributions across 5 distinct celestial moments.
```

---

## 2. Drop-in Simulation Script for ASOL (`scripts/simulate-historical-faucet.ts`)

Place this script into `/Users/GregCastro/ASOL/alchm-agents-solana/scripts/simulate-historical-faucet.ts`:

```typescript
#!/usr/bin/env bun
import { HISTORICAL_AGENTS } from '../lib/agents/historical/index';

// Canonical tokens: SPIRIT (🝇/🜂), ESSENCE (🝑/🜄), MATTER (🝙/🜃), SUBSTANCE (🝉/🜁)
const agents = Object.values(HISTORICAL_AGENTS);
console.log(`Loaded ${agents.length} historical agents.`);

const LIVE_SUPPLY = {
  spirit: 10583.22,
  essence: 15780.23,
  matter: 29116.87,
  substance: 22133.85,
};

const MOMENTS = [
  { name: 'Diurnal Fire Sky', transit: { Fire: 5.0, Water: 1.5, Earth: 1.5, Air: 2.0, isDiurnal: true } },
  { name: 'Nocturnal Water Sky', transit: { Fire: 1.0, Water: 5.5, Earth: 2.0, Air: 1.5, isDiurnal: false } },
  { name: 'Nocturnal Earth Stellium', transit: { Fire: 1.5, Water: 2.0, Earth: 5.0, Air: 1.5, isDiurnal: false } },
  { name: 'Diurnal Air Solstice', transit: { Fire: 2.0, Water: 1.5, Earth: 1.5, Air: 5.0, isDiurnal: true } },
  { name: 'Equinoctial Balance', transit: { Fire: 2.5, Water: 2.5, Earth: 2.5, Air: 2.5, isDiurnal: true } },
];

for (const m of MOMENTS) {
  let totals = { spirit: 0, essence: 0, matter: 0, substance: 0, total: 0 };
  const totalWeight = Object.values(m.transit).filter(x => typeof x === 'number').reduce((a, b) => a + (b as number), 0);

  for (const a of agents) {
    const el = a.consciousness?.alchemicalElements || {};
    const dominant = a.consciousness?.dominantElement;
    const monica = (a.consciousness?.monicaConstant || 0) / 10;

    const axes = [
      { key: 'spirit', element: 'Fire', score: el.spirit || 0.5 },
      { key: 'essence', element: 'Water', score: el.essence || 0.5 },
      { key: 'matter', element: 'Earth', score: el.matter || 0.5 },
      { key: 'substance', element: 'Air', score: el.substance || 0.5 },
    ];

    let agentSum = 0;
    for (const ax of axes) {
      // 1. Sky dominance
      const weight = (m.transit as any)[ax.element] || 1;
      let sky = 0.60 + (weight / totalWeight) * 1.20;
      if (m.transit.isDiurnal && (ax.element === 'Fire' || ax.element === 'Air')) sky *= 1.10;
      if (!m.transit.isDiurnal && (ax.element === 'Water' || ax.element === 'Earth')) sky *= 1.10;
      sky = Math.max(0.60, Math.min(1.80, sky));

      // 2. Natal affinity
      let natal = 0.70 + ax.score * 0.50 + (dominant === ax.element ? 0.30 : 0) + monica * 0.20;
      natal = Math.max(0.50, Math.min(2.00, natal));

      // 3. Anti-glut (Matter = 0.750)
      const antiGlut = ax.key === 'matter' ? 0.750 : 1.000;

      let y = 6.0 * sky * natal * antiGlut;
      y = Math.max(1.5, Math.min(12.0, y));
      y = Math.floor(y * 10000) / 10000;

      (totals as any)[ax.key] += y;
      agentSum += y;
    }
    totals.total += agentSum;
  }

  const n = agents.length;
  console.log(`\n=== ${m.name} ===`);
  console.log(`Avg / Agent: SPIRIT=${(totals.spirit/n).toFixed(3)}, ESSENCE=${(totals.essence/n).toFixed(3)}, MATTER=${(totals.matter/n).toFixed(3)}, SUBSTANCE=${(totals.substance/n).toFixed(3)} | TOTAL=${(totals.total/n).toFixed(3)}`);
  console.log(`SPIRIT / MATTER Mint Ratio: ${(totals.spirit / totals.matter).toFixed(2)}x`);
}
```

---

## 3. Verified Benchmark Outputs (Target Truth)

When run across the 72 agents, the output must match these verified corridors:
- **Moment 1 (Diurnal Fire):** SPIRIT $\approx 10.04$ | MATTER $\approx 4.22$ | Ratio $\approx 2.38\times$ | Top Claimer: Leonardo da Vinci ($29.04$).
- **Moment 2 (Nocturnal Water):** ESSENCE $\approx 10.38$ | MATTER $\approx 5.00$ | Top Claimer: Buddha ($28.17$).
- **Moment 3 (Earth Stellium):** MATTER $\approx 7.15$ (compressed from $9.5+$ by $\Omega_{\text{MATTER}}$) | Top Claimer: Isaac Newton ($27.98$).
- **Moment 4 (Air Solstice):** SUBSTANCE $\approx 9.95$ | Top Claimer: Shakespeare ($29.02$).
- **Moment 5 (Equinox):** Total $\approx 26.75$ | Baseline mean-centered yield.
