# AlchmHackStation - The App Making App
### CookingWithCastro LLC MVP Launchpad

AlchmHackStation is a live hackathon mission-control room for taking an idea to a working demo. It combines a visible agent crew, task board, proof feed, readiness scorecard, operator console, design bridge, integration operations center, and structured handoffs across Antigravity, Claude Code, Stitch, Codex, v0, and Vercel.

The market bar is current agentic builder behavior: Replit-style task boards and checkpoints, v0/Lovable/Bolt-style prompt-to-app shipping, Devin/Codex-style command centers, and Claude Code-style tool-aware exports. HackStation's angle is multiplayer demo velocity: agents, proofs, and the pitch arc in one surface.

## Core Features

- **Mission Control**: Default first screen with demo readiness, active agent crew, task board, proof feed, market signals, and launch actions.
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
