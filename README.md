# AlchmHackStation - The App Making App
### CookingWithCastro LLC MVP Launchpad

AlchmHackStation is a live ETHGlobal hackathon mission-control room for taking an idea to a working demo. The default ETHGlobal New York 2026 space combines track selection, official event guidance, a rules-aware submission checklist, a project launchpad, a visible agent crew, proof feeds, an operator console, and structured handoffs across Antigravity, Claude Code, Stitch, Codex, v0, and Vercel.

The market bar is current agentic builder behavior: Replit-style task boards and checkpoints, v0/Lovable/Bolt-style prompt-to-app shipping, Devin/Codex-style command centers, and Claude Code-style tool-aware exports. HackStation's angle is multiplayer demo velocity: agents, proofs, and the pitch arc in one surface.

## Core Features

- **ETHGlobal Hackathon Space**: The default first screen is purpose-built for ETHGlobal New York 2026 (June 12-14). Hackers choose one of the three build paths (`From Scratch`, `Extend Open Source`, or `Ship a Feature`), save a project name and pitch, track submission requirements, review the five judging criteria, and jump directly into the forge, mission board, contract console, security audit, or shipping tools. Event setup and checklist progress persist locally in the browser.
- **Rules-aware build guidance**: Surfaces the operational rules that matter while building: frequent version-control history, clear separation of reused and new work, AI and spec artifact attribution, up to three partner prize selections, the optional 2-4 minute/720p demo video, and the 4-minute demo plus 3-minute Q&A judging format. Official Hacker Dashboard, Info Center, rules, resources, and NYC guide links remain one click away.
- **Biometric Workstation Guard**: Enrolls the browser with the laptop's WebAuthn platform authenticator (Touch ID on supported Macs), then provides a top-bar `LOCK SPACE` action. Locking explicitly requests camera permission, displays a visible full-screen camera feed, and records video without audio in browser memory until platform user verification succeeds. The clip is never uploaded and can be downloaded locally from Security Protocols after unlock. This is an app-level privacy screen, not a replacement for the operating system lock screen or server-side authorization.
- **Media Provenance Proofs**: Each security recording produces a companion `alchm.media-provenance.v1` JSON file with a final video SHA-256 digest, a hash chain over one-second recording segments, capture timestamps, camera and browser context, a hashed biometric credential binding, and optional user-approved location. The app can re-hash the local video to detect a mismatch and exports a blockchain-ready anchor digest. The proof is labeled `UNANCHORED` until an actual Numbers Protocol Capture/ERC-7053 or SWEAR SDK integration signs or writes it to a ledger; it is not presented as C2PA or SWEAR-certified evidence.
- **Overmind — live agentic build authority** *(real AI)*: Bind your own Anthropic API key (stored in this browser only, sent solely to api.anthropic.com, never logged) and Overmind comes online as a genuine agent — a manual streaming tool-use loop on the official `@anthropic-ai/sdk` with adaptive thinking. Pick any model from a live-discovered catalog (`/v1/models` probe doubles as the key health check; Claude Opus 4.8 default). The agent commands five tools that drive the real app: `decompose_idea` (runs the deterministic planner), `forge_swarm` (launches a live Swarm Nexus build under a chosen orchestration pattern), `set_stack`, `read_station_state`, and `open_module`. Every text delta streams into the directive feed, every tool call renders as it executes, and a live meter tracks tokens and dollar spend per model pricing. Without a key, the rest of the station still runs fully simulated.
- **Swarm Nexus — The Crucible** *(flagship builder)*: Type a freeform product idea and a deterministic decomposition engine breaks it into a dependency-aware task graph, detects its domains (auth, payments, realtime, AI, web3, commerce, data, social, media, geo), and recommends a stack. The plan is then dispatched across a live, physics-driven swarm of six model-specialized agents (Architect/Opus, Builder/Codex, Designer/Stitch, Sentinel/Gemini, Herald/Sonnet, Captain/Vercel) rendered on a 60fps HTML5 Canvas. Data particles flow along force-directed edges, agents light up as they process, and a live HUD computes throughput, token rate, swarm coherence, and resolution from real simulation state. Five 2026 orchestration patterns — **swarm, fan-out, pipeline, supervisor, debate** — actually re-wire the topology and scheduling. Drag agents, click the core to ignite, and watch an idea reach a "shipped" terminal state.
- **Polyglot Foundry — 15 first-class languages**: TypeScript, JavaScript, Rust, Python, Go, Java, Kotlin, Swift, C#, C/C++, Ruby, PHP, Elixir, Zig, and Solidity, each with its real toolchain and test command (Rust → cargo + rustc / `cargo test`, Python → uv + CPython / `pytest`, Solidity → Foundry / `forge test`…). The swarm planner detects languages from idea text on word boundaries and injects language-specific tasks — a Rust idea gets cargo workspace scaffolding, a WASM bridge, and a clippy + borrow-checker Sentinel audit; web3 ideas automatically pull Solidity in as a companion contract language. Select the core language in the App Builder Configurator's language matrix, via the `languages` console command, or let Overmind's `set_stack` tool choose the language for the job.
- **Mission Control**: Demo readiness, active agent crew, task board, proof feed, market signals, and launch actions.
- **Integration Operations**: Auth health, bounded CLI probes, operator-confirmed reauthentication, a Stitch-to-v0-to-Claude-to-Codex build relay, and provider-neutral context packets.
- **Usage & Limits**: Monthly and daily budgets, rate envelopes, warning thresholds, hard stops, downgrade policies, spend forecasts, and per-agent allocations.
- **Model Accounts**: Provider workspaces, vault references, connection health, credential rotation posture, default accounts, and stable model aliases.
- **Routing & Guardrails**: Provider fallback chains, queue controls, semantic caching, privacy checks, approval gates, circuit breakers, and audit events.
- **App Configurator Deck**: Real-time stack customization allowing developers to toggle between frameworks (`Vite React`, `Next.js`, `Tauri V2`), styling engines (`Tailwind v4`, `Vanilla CSS`), and databases (`SpaceTimeDB`, `PostgreSQL`, `SQLite`).
- **Claude Design visual-to-code compiler**: Code synthesizer panel bridging Figma visual schemas directly to React functional components and hot-reloading changes into the active workspace.
- **Node Topology Visualizer**: SVG peer lattice tracking network syncs, latencies, and rounds.
- **Smart Contract Security Auditor**: Static security analyser checklist scoring contract safety thresholds.
- **Orchestrator Terminal feed**: Live stdout logger executing compiler commands, sidecar instances, and deployment logs.
- **Multi-Service Code Exporters**:
  - Mission payloads include readiness, stack, crew, logs, and deployment state.
  - `EXPORT TO CLAUDE` syncs prompt parameters for Claude Code CLI.
  - `EXPORT TO AGY` compiles JSON outputs for Antigravity agents.
  - `EXPORT TO CODEX` generates component blueprint JSONs for Codex engines.
  - The `v0 Bridge` packages existing files, constraints, locked paths, proof requirements, and budget into a reusable handoff contract.

## Development Stack

- **Runtime**: Bun Engine
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 + Hanken Grotesk typography
- **Iconography**: Lucide React

## Deployment & Build Preparation

### 1. Verification Build

```bash
bun run build
```

### 2. Packaging the Deployment Bundle

```bash
bun run package
```

This script automates:

1. Building production assets to `dist/`.
2. Extracting dynamic variables from `DESIGN.md`.
3. Creating a deployable package in `outputs/deploy_bundle/` containing optimized assets, design resources, and `deploy_manifest.json`.

## Demo Commands

Inside the operator console:

- `nexus` (or `forge idea`) opens Swarm Nexus — The Crucible.
- `overmind` (or `ai`) opens the Overmind agentic build authority.
- `languages` (or `langs`) lists all 15 armed language toolchains and the active core language.
- `ship demo` runs the demo build sequence.
- `readiness` prints the current readiness score and blocker.
- `agent swarm` syncs the mission crew telemetry.
- `usage report` opens the usage control plane and prints budget telemetry.
- `model accounts` opens the provider account vault.
- `route health` opens the routing and guardrails module.
- `integration status` opens the integration operations center.
- `auth watch` opens auth monitoring and recovery controls.
- `v0 handoff` opens the context-packet builder.

## CLI Authentication Watch

```bash
bun run auth:check
bun run auth:watch --interval=300
```

The watcher probes only provider-supported status commands, applies bounded timeouts, redacts command output, and never prints token values. Antigravity and Stitch remain manual browser-session checks until a stable scriptable status contract is available. Reauthentication is staged for operator confirmation instead of being launched silently.


## Model Operations Integration

The current controls are an interactive frontend simulation backed by typed contracts in `src/lib/modelOps.ts`. Production adapters should:

1. Resolve provider secret references only on the server.
2. Store organization, workspace, agent, and per-run limits separately.
3. Ingest provider usage and rate-limit headers into a normalized usage snapshot.
4. Record every account, budget, routing, approval, and secret-reference mutation in the audit stream.
5. Fail closed when account ownership, policy state, or approval state cannot be verified.

## Use of AI Tools & Spec-Driven Development (ETHGlobal Rules Compliant)

In compliance with the **ETHGlobal New York 2026 Use of AI Tools** and **Spec-Driven Development** rules, this project was developed using a spec-driven, agentic pair-programming workflow directed by the hacker team. 

All planning files, prompts, execution checklists, and walkthroughs generated during the hackathon are version-controlled and located in the [ai-specs/](./ai-specs/) directory:

1. **Integration Research Notes**: [integration_research_notes.md](./ai-specs/integration_research_notes.md) - Deep-dive on Dynamic, Unlink, and Circle Gateway APIs, plus security best practices for timing-obfuscated private withdrawals.
2. **Implementation Plan**: [implementation_plan.md](./ai-specs/implementation_plan.md) - Technical architecture design and proposed code modifications approved by the team.
3. **Execution Checklist**: [task.md](./ai-specs/task.md) - Living list of implementation tasks tracked step-by-step.
4. **Verification Walkthrough**: [walkthrough.md](./ai-specs/walkthrough.md) - Full walkthrough of modifications, visual screenshots, and verified build output.
5. **Assets**: [ai-specs/assets/](./ai-specs/assets/) - Screenshots and animated recordings proving visual execution and successful integration flows.
