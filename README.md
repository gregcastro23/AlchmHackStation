# AlchmHackStation - The App Making App
### CookingWithCastro LLC MVP Launchpad

AlchmHackStation is a live hackathon mission-control room for taking an idea to a working demo. It combines a visible agent crew, task board, proof feed, readiness scorecard, operator console, design bridge, network view, and export payloads for Antigravity, Claude Code, and Codex.

The market bar is current agentic builder behavior: Replit-style task boards and checkpoints, v0/Lovable/Bolt-style prompt-to-app shipping, Devin/Codex-style command centers, and Claude Code-style tool-aware exports. HackStation's angle is multiplayer demo velocity: agents, proofs, and the pitch arc in one surface.

## Core Features

- **Mission Control**: Default first screen with demo readiness, active agent crew, task board, proof feed, market signals, and launch actions.
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
