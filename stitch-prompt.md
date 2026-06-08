# Stitch Master Prompt: AlchmHackStation React/Tailwind UI

Create a production-ready React + Tailwind single-page app UI for **AlchmHackStation**, an immersive velocity command center for Ethereum developers. The interface must be an actual usable app screen, not a landing page. It should feel like a native-performance alchemical operator station for Unity, Tauri, SpaceTimeDB, Bun, Foundry, Vercel sync, and live terminal telemetry.

Use the visual language and content system from the AlchmHackStation technical spec slide deck:

- Dark-premium command center aesthetic.
- Obsidian/near-black backgrounds, titanium-gray borders, acid-green active states.
- Cinematic but restrained technical dashboard, not a generic SaaS dashboard.
- Volumetric/depth feeling through subtle panel layering, hairline borders, and glow only where state is active.
- No decorative gradient blobs, marketing hero sections, or oversized explainer cards.

## Core Visual System

Use this exact palette from the source spec and translate it into Tailwind arbitrary values:

- Page background: `bg-[#050506]`
- Main app shell / slide-panel background: `bg-[#0A0A0B]`
- Deep panel background: `bg-[#101114]` or `bg-[#0D0F12]`
- Raised panel background: `bg-[#15171B]`
- Primary text: `text-[#F5F5F5]`
- Body text: `text-[#C0C0C5]`
- Muted text: `text-[#888888]`, `text-[#777E86]`, `text-[#525861]`
- Acid-green active/accent: `text-[#DEFF9A]`, `bg-[#DEFF9A]`, `border-[#DEFF9A]`
- Acid-green secondary: `#A3E635`
- Titanium/rule borders: `border-[#C0C0C5]/10`, `border-[#23262B]`, `border-[#30343A]`
- Cyan telemetry accent: `#7DD3FC`
- Amber warning accent: `#FDE68A`
- Error/failure accent: `#FB7185`

Suggested Tailwind tokens/classes:

- Body: `min-h-screen bg-[#050506] text-[#C0C0C5] antialiased`
- Main shell: `bg-[#0A0A0B] border border-[#DEFF9A]/10 shadow-2xl shadow-black/70`
- Panels: `bg-[#101114]/90 border border-[#C0C0C5]/10`
- Active panels/buttons: `border-[#DEFF9A]/60 bg-[#DEFF9A]/10 text-[#DEFF9A] shadow-[0_0_24px_rgba(222,255,154,0.16)]`
- Terminal panels: `bg-black/40 border border-[#30343A] text-[#C0C0C5]`
- Dividers/grid lines: `border-[#23262B]`

Use subtle background texture:

- Full app background can include a barely visible technical grid using Tailwind pseudo-elements or absolutely positioned divs.
- Add very subtle radial/accent glows only as low-opacity system lighting, e.g. `bg-[radial-gradient(circle_at_10%_10%,rgba(222,255,154,0.05),transparent_45%),radial-gradient(circle_at_90%_90%,rgba(192,192,197,0.05),transparent_45%)]`.
- Do not make the UI a one-note green theme. Green is the active system signal; titanium gray and deep black should dominate.

## Typography

Use a clear separation between interface copy and machine telemetry:

- General UI text: sans-serif, inspired by the source spec's `Urbanist`. Use Tailwind `font-sans`; headings should be uppercase or compact, high-confidence, and slightly technical.
- Terminal logs, metrics, reducer names, addresses, env hashes, latency values: monospace, inspired by the source spec's `JetBrains Mono`. Use `font-mono`.
- Headings: `tracking-wide uppercase`, `font-semibold` or `font-bold`, `text-[#F5F5F5]`.
- Kicker labels and system status text: `font-mono text-[11px] uppercase tracking-[0.12em] text-[#DEFF9A]`.
- Body copy: concise and scannable, `text-sm text-[#C0C0C5]`.
- Avoid large marketing copy. This is a dense working command center.

## Required App Layout

Build one first-screen application layout with this strict structure:

### 1. Top System Status Bar

Full-width top bar, height around `56px` to `64px`, fixed within the app shell.

Include:

- Left: app identity `AlchmHackStation` with `Alchm` in acid green and `HackStation` in white.
- Center: compact status chips:
  - `TAURI V2 CORE`
  - `UNITY WEBGL READY`
  - `SPACETIMEDB LIVE`
  - `FOUNDRY IDLE` or `FOUNDRY BUILDING`
  - `VERCEL SYNCED`
- Right: operator/session area:
  - network selector, e.g. `ETHGLOBAL NY // LOCAL`
  - block height or timestamp
  - small circular active pulse indicator

Visual details:

- `bg-[#0A0A0B]/95 border-b border-[#23262B]`
- Active chips: `border-[#DEFF9A]/40 text-[#DEFF9A] bg-[#DEFF9A]/5`
- Inactive chips: `border-[#C0C0C5]/10 text-[#777E86]`

### 2. Main Two-Column Alchemical Altar Layout

Below the status bar, split the main content into two columns:

- Left Orchestration column: exactly 40% width on desktop, `lg:w-[40%]`
- Right Execution & Logs column: exactly 60% width on desktop, `lg:w-[60%]`
- On mobile, stack columns vertically with the top status bar preserved.
- Overall layout: `flex flex-col lg:flex-row gap-4 p-4 h-[calc(100vh-64px)] overflow-hidden`

The left column is for control and orchestration. The right column is for execution visualization and live telemetry.

## Left Column: Orchestration

The left column must include these modules in vertical order:

### A. Foundry Control Deck

A premium control module for Foundry commands.

Content:

- Module header: `FOUNDRY CONTROL DECK`
- Small sublabel: `Bun sidecar orchestration // sub-second forge loops`
- Primary command buttons:
  - `forge build`
  - `forge test`
  - `forge script`
  - `anvil`
- Include one primary active button: `RUN BUILD` with acid-green active state.
- Include small status metrics:
  - `last build 0.5s`
  - `tests 42/42`
  - `gas delta -8.2%`
  - `compiler solc 0.8.26`

Visual:

- Panel class: `rounded-lg bg-[#101114] border border-[#C0C0C5]/10 p-4`
- Active command: `bg-[#DEFF9A] text-black hover:bg-[#A3E635]`
- Secondary command buttons: `border border-[#30343A] bg-[#0A0A0B] text-[#C0C0C5] hover:border-[#DEFF9A]/50 hover:text-[#DEFF9A]`
- Metrics use `font-mono text-xs`.

### B. Environment Sync Module

A Vercel/environment state synchronization module.

Content:

- Header: `ENVIRONMENT SYNC`
- Reducer-style status line: `on_vercel_sync() -> Active Env-Hash Mapping`
- Show environment rows:
  - `LOCAL` with hash `env_4c29`
  - `PREVIEW` with hash `env_a81f`
  - `PRODUCTION` with hash `env_9d02`
- Each row should include:
  - small status dot
  - env name
  - env hash
  - synced/dirty/locked state
- Add a compact action row:
  - `Pull`
  - `Diff`
  - `Push`
  - `Seal`

Visual:

- Use thin table-like rows, not chunky cards.
- Active synced row: acid-green status dot.
- Dirty/warning row: amber dot.
- Locked/production row: titanium border and muted text.
- Reducer line: `font-mono text-[12px] text-[#7DD3FC]`.

### C. SpaceTimeDB Reducer Feed

A compact state-reducer feed based on the deck schema.

Rows:

- `Deployments` -> `on_forge_deploy()` -> `Verified contract address`
- `EnvState` -> `on_vercel_sync()` -> `Active env-hash mapping`
- `ActivityLog` -> `on_terminal_io()` -> `3D trace visual event`
- `GasMetrics` -> `on_block_trace()` -> `PBR heatmap density`

Visual:

- Use `font-mono` for reducer functions.
- Use acid-green or cyan left rails to indicate live reducers.
- Keep it dense and readable.

## Right Column: Execution & Logs

The right column must include a 60/40 vertical split:

- Top: Unity WebGL / Alchemical Altar visualization placeholder, around 58-62% height.
- Bottom: Live Stdout Stream terminal and execution logs, around 38-42% height.

### A. Unity WebGL Placeholder / Alchemical Altar

This is the primary visual surface of the app. It should look like a native Unity WebGL render viewport inside the React app.

Content:

- Header: `UNITY WEBGL ALTAR`
- Small status: `Cinematic state visualization // live trace render`
- Main placeholder visualization:
  - central circular altar orb/ring
  - label inside: `ALTAR`
  - connected event nodes around it:
    - `block_trace`
    - `forge_deploy`
    - `terminal_io`
    - `gas_metrics`
  - top-right badges: `TX OK`, `GAS`, `LIVE`
- Add a right-side or lower mini legend titled `SIGNAL GRAMMAR`:
  - `Obsidian depth` -> state logs
  - `Acid tx-traces` -> successful transactions
  - `PBR heatmaps` -> gas density

Visual:

- Viewport background: `bg-[#0D0F12] border border-[#30343A]`
- Central altar ring: `border-[#DEFF9A] bg-[#DEFF9A]/10 shadow-[0_0_40px_rgba(222,255,154,0.18)]`
- Event node boxes: `bg-[#101114] border border-[#30343A]`
- Connected lines can be CSS borders or absolute divs in cyan/acid.
- Keep it obviously a placeholder for Unity WebGL, but polished enough for a pitch demo.

### B. Live Stdout Stream Terminal

A terminal-style live stream module.

Content:

- Header: `LIVE STDOUT STREAM`
- Subheader: `on_terminal_io() // Bun sidecar`
- Include streaming log rows with timestamps and colored severity tags:
  - `[23:41:08] bun run forge build`
  - `[23:41:08] compiling 37 contracts with solc 0.8.26`
  - `[23:41:09] gas snapshot delta -8.2%`
  - `[23:41:09] deployment reducer emitted verified address`
  - `[23:41:10] spacetime sync committed ActivityLog row`
- Add a command input strip at the bottom:
  - prompt: `operator@alchm ~ %`
  - command placeholder: `forge test --gas-report`

Visual:

- `font-mono text-xs`
- Terminal background: `bg-black/50 border border-[#30343A]`
- Success tag: `text-[#DEFF9A]`
- Info tag: `text-[#7DD3FC]`
- Warning tag: `text-[#FDE68A]`
- Error tag: `text-[#FB7185]`
- Cursor indicator: tiny acid-green block.

## Interaction States

Make the UI feel alive, even if data is mocked:

- Active pulse on `SPACETIMEDB LIVE`.
- Hover states on Foundry command buttons.
- Selected command should glow subtly.
- Terminal stream should look scrollable with a thin custom scrollbar.
- Environment rows should have status dots and state labels.
- Unity viewport can include slow CSS pulse/glow animations around the central altar.

Use motion sparingly:

- `animate-pulse` only for active status dots and central altar glow.
- No bouncy animations, no playful motion.

## Component Architecture

Generate clean React components:

- `App`
- `TopStatusBar`
- `FoundryControlDeck`
- `EnvironmentSyncModule`
- `ReducerFeed`
- `UnityAltarViewport`
- `LiveStdoutStream`
- small reusable components:
  - `StatusChip`
  - `MetricTile`
  - `CommandButton`
  - `ReducerRow`
  - `TerminalLine`

Keep data arrays in the component file for easy editing. Use realistic mocked data from the spec.

## Layout Precision

Desktop:

- App should fit a full browser viewport.
- Top bar fixed height.
- Main content should avoid page scroll where possible; internal modules may scroll.
- Left column: `lg:w-[40%]`
- Right column: `lg:w-[60%]`
- Gap: `gap-4`
- Outer padding: `p-4`

Mobile:

- Stack modules vertically.
- Preserve the status bar at top.
- Right-column Unity placeholder should still be visible, not collapsed.
- Terminal can scroll internally.

## Tone and Copy

Use concise operator-console language. Avoid marketing sections and explanatory paragraphs.

Preferred labels:

- `IMMERSIVE VELOCITY COMMAND CENTER`
- `NATIVE STATE MACHINE`
- `SECURE IPC BRIDGE`
- `BUN SIDECAR`
- `FOUNDRY CONTROL DECK`
- `SPACETIMEDB LIVE`
- `ALCHEMICAL ALTAR`
- `AWAITING OPERATOR INPUT`

Do not add a landing-page hero, feature marketing cards, pricing, testimonials, or generic app navigation. The first screen is the app.

## Final Output Requirements

Generate a React + Tailwind UI that can be pasted into a modern Vite/React or Next.js project. Use only standard React and Tailwind classes unless a small icon library is available. If icons are used, keep them minimal and technical.

The result should look like a dark, premium, high-fidelity Ethereum development cockpit:

- obsidian canvas
- titanium panel edges
- acid-green active states
- cyan telemetry
- monospace logs and reducer names
- strict 40/60 Alchemical Altar layout
- real app controls for Foundry, Vercel/env sync, SpaceTimeDB reducers, Unity WebGL placeholder, and live stdout stream
