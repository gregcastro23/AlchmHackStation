# Stitch Master Prompt: Web3-Oriented Landing Page Revamp

Create a production-ready Next.js React (`app/page.tsx`) + Tailwind CSS landing page for **AlchmAgents**, completely revamping the interface to focus on our Web3 on-chain agentic economy and the **Pentacle Star Vaults** staking system.

The layout must transition from a generic AI presentation to a dark-premium, high-fidelity Web3 console. It should feel like an immersive, volumetric portal for operators tracking on-chain agents and staking capital on celestial targets.

---

## Visual Aesthetics & Design System

Use this exact alchemical-cyberpunk palette:
*   **Page Background:** Deep space black `bg-[#050506]`
*   **Card/Panel Backgrounds:** Volumetric glassmorphic panels `bg-[#0A0A0B]/90` with titanium borders `border-[#23262B]` or `border-[#C0C0C5]/10` and subtle backdrop blurring.
*   **Primary Accent (System Active):** Acid-toxic green `text-[#9ddf2e]` / `bg-[#9ddf2e]` / `border-[#9ddf2e]`
*   **Telemetry Cyan:** `text-[#7dd3fc]` for connection stats and endpoints.
*   **Occult Gold:** `text-[#facc15]` for ratings, Sacred 7, and star alignment.
*   **Alert Red:** `text-[#ff7b72]` for payment requests and horizon blockers.
*   **Typography:** Compact technical headings (`uppercase tracking-[0.16em]`) in sans-serif, and monospace (`font-mono`) for contract addresses, transaction hashes, A2A endpoints, and Walrus Blob IDs.

---

## Section-by-Section Component Rebuild

### 1. Hero Spotlight: The Agentic Economy
*   **The Thesis:** Rework the hero text to announce the core integration:
    > "A World ID‑verified human operates gasless ENS‑named agents that settle x402 USDC on Circle Arc, store encrypted memory on Walrus, and earn elemental yield gated by the live sky."
*   **Live Web3 Stats Strip:** Replace generic stats with real on-chain parameters:
    *   `CIRCLE ARC RPC: ONLINE`
    *   `NAMESTONE ENCODER: EIP-7930 VALID`
    *   `MEMWAL STORAGE: 1.45 KB`
    *   `BIGQUERY REPUTATION LOGS: SYNCED (BLOCK 788291)`

### 2. Interactive Flagship: Pentacle Star Vaults
Build a live staking widget directly on the landing page:
*   **Interactive Sky Altitude Calculator:** Let users select a star (e.g. Polaris, Vega, Sirius) and select their natal dominant element (Fire, Water, Earth, Air).
*   **Staking Multipliers:** Display a live APY breakdown showing `Base APY × Chart Affinity (conjunct element) × Sky Dominance × Horizon Visibility`.
*   **Dynamic Horizon State:** If the star is risen (altitude > 0), APY glows acid green. If set below the horizon, show a warning badge: `YIELD BLOCKED: STAR BELOW HORIZON`.
*   **Interactive Stake Form:** Input field to stake USDC, a **Stake USDC** button that plays a simulated loader (Approving, Broadcasting on Arc, Staking Completed), and appends a mock transaction block receipt with a clickable hash.
*   **ESMS Balance Vault:** Visual display of their minted soulbound rewards (Spirit, Essence, Matter, Substance) with Lucide element icons (`Flame`, `Droplets`, `Mountain`, `Wind`).

### 3. Identity Portal: NameStone subnames & World ID
Create a card displaying a sample agent resolver profile:
*   **ENS Card Address:** `plato.alchmagents.eth` mapped to `0x3600...2007`.
*   **ENSIP-25/26 Records Viewer:** Interactive key-value table:
    *   `agent-endpoint[a2a]`: `https://api.alchm.kitchen/a2a/plato` (cyan)
    *   `agent-wallet[x402]`: `eip155:5042002:0x3600...` (gold)
    *   `agent-memory`: `blobId:0x9f3d...821c` (gray)
    *   `human-verified`: Badge displaying `UNVERIFIED` until the user clicks the World ID button.
*   **World ID Verification Simulator:** Click a button to trigger a simulated World ID IDKit handshake, changing the badge to an acid-green `Verified Human` mark and generating a mock ZK proof.

### 4. Communication Gate: A2A x402 Payments
An interactive chat terminal mockup:
*   **Step 1:** User types a question for Plato.
*   **Step 2:** The console intercepts the message with `402 Payment Required` and details of EIP-3009 USDC authorization.
*   **Step 3:** Click **Approve USDC (0.05)**, showing an Arc testnet hash and opening an SSE (Server-Sent Events) stream that types Plato's philosophical response character-by-character.

### 5. BigQuery Leaderboard: The On-Chain Registry
A structured, compact table showing reputation rankings parsed from the mainnet ERC-8004 registry:
*   Columns: Rank, Subname, Trust Score, Transaction Count, Volume (USDC), Last Active Block.
*   Row indicators: Highlight Plato and Cleopatra at ranks #1 and #2 with active status tags.

### 6. CCTP Onramp Calculator
A tool letting users input Base/Arbitrum assets to calculate a 1inch Fusion+ swap quote, showing how it routes gaslessly to Base USDC and burns/mints via Circle CCTP to reach Arc.

---

## Technical Specifications & Code Quality
*   **State Control:** All simulated actions (staking, claiming, A2A payments, World ID, Walrus uploads) must transition state cleanly using standard React `useState` and `useMemo` hooks.
*   **Zero Placeholders:** Provide realistic mock data in static constants (block heights, tx hashes, Sui blob identifiers, star longitude angles) so the page renders fully complete.
*   **Lucide Icons:** Utilize Lucide-react components (`Coins`, `Flame`, `Droplets`, `Wind`, `Mountain`, `ShieldCheck`, `Zap`, `Fingerprint`, `Globe`, `Activity`, `Database`, `Lock`) for visual telemetry.
*   **Layout:** Keep layouts compact and scannable. Avoid oversized SaaS graphics, focusing instead on high-density information arrays and developer command boards.
