# Stitch Master Prompt: AlchmHackStation Tauri App UX/UI Redesign

Create a production-ready React + Tailwind UI for **AlchmHackStation**, redesigning the interface as an immersive Tauri desktop application. The redesigned cockpit should function as a generic workspace manager, letting users open/create any project path, bind git repositories, run static code diagnostics, and archive finished projects to a retrospective archive registry.

Use the visual language and color token system from the AlchmHackStation design system:
- obsidian backgrounds, titanium-gray borders, acid-green active states, cyan telemetry, and amber warnings.

---

## 1. Top System Status Bar

Full-width top bar (height around `56px` to `64px`).
- **Left**: `AlchmHackStation` identity.
- **Center**: Compact status badges indicating active toolchains and system indicators:
  * `TAURI V2 RUNNING` (desktop IPC bound)
  * `ACTIVE WORKSPACE: [Project Path / Name]`
  * `TELEMETRY ONLINE`
- **Right**:
  * Block height / Local Time.
  * Active session pulse dot.
  * `LOCK SPACE` biometric security controls.

---

## 2. Navigational Structure

Use a left-hand sidebar layout (`SidebarDrawer`) supporting the following tabs:
1. **Web3 Hackathon Hub**: Interactive cockpit for Circle Arc, NameStone ENS resolvers, A2A x402 payment simulators, and Walrus storage.
2. **Active Workstation**: The generic workspace control deck.
3. **Hackathon History**: Retrospective archive containing permanent records of completed sessions (pre-loaded with ETHGlobal NY 2026 data).
4. **Swarm Nexus**: 60fps canvas force-directed graph simulator.
5. **Overmind AI**: Authentic Anthropic API key console and manual tools.
6. **Operator Console**: Interactive terminal shell and sidecar controls.

---

## 3. Active Workstation Redesign Specs

The **Active Workstation** view must be split into functional components:

### A. Initialization & Setup Deck (Workspace Setup)
- Forms to input/configure:
  * **Event Name** (e.g. "ETHGlobal London 2026")
  * **Project Name** (e.g. "Cosmic Shield")
  * **Objective Summary**
  * **Project Folder Path** (folder input simulation)
- **Checklist Template Selector**: Cards to choose starter checklists (*Full-Stack*, *Integration*, *Feature*, or *Custom*).

### B. GitHub Repository Manager
- A dedicated area inside the active workspace to add, view, and remove linked GitHub repositories.
- Display each repository with:
  * Repository name (e.g., `gregcastro23/AlchmHackStation`).
  * Monospace branch indicators (e.g., `[main]`, `[dev]`).
  * Live status (e.g., `Synchronized`, `Awaiting commit push`).
  * Action buttons to remove or view commit logs.

### C. Project Diagnostics & Telemetry Scorecard
- A creative visual panel showing the **Diagnostics Scan Engine** results.
- **Overall Rating Dial**: Big telemetry score indicator (0-100 scale) in acid-green (score >80), amber (60-80), or red (score <60) with custom radial glow.
- **Sub-Category Scorecards**:
  * **Security**: Evaluates exposed API keys, lock setups, and permission boundaries.
  * **Performance**: Scans database Btree indexes and bundle size limits.
  * **Test Coverage**: Ratios of completed test cases.
  * **Git Health**: Validates repository sync rates.
- **Identified Weak Points Feed**:
  * Color-coded checklist details detailing security flaws, performance optimizations, or missing tests.
  * *Critical (Red)*: e.g., "O(N) full-table scans detected on card.owner table. Add Btree indexes."
  * *Warning (Yellow)*: e.g., "No GitHub repository bound to this project workspace."
  * *Info (Blue)*: e.g., "Verification test coverage is currently at 45%."
- **Run Diagnostics Scan Control**:
  * Button with scanner loading spinner.
  * Simulated scanning console log stream detailing the file scan sequence.

### D. Session Archiver Block
- Inputs to detail "Key Accomplishments".
- "Archive & Complete" action that saves the current project configuration, accomplishments list, and finalized scores into the Retrospective Archive.

---

## 4. Retrospective Archive Specs (History View)

The **Hackathon History** tab provides long-term logs:
- **Left column**: List of all archived hackathons with quick stats (overall rating, date, project name).
- **Right column**: Dedicated retrospective detail sheet:
  * Clear overview of objective, focus track, stack, and dates.
  * Key accomplishments bullet points.
  * Completed task checklist breakdown.
  * Collapsible Retrospective Q&A specs.
  * JSON record exporter (triggers file downloads).

---

## Final Output Requirements

Pasteable React + Tailwind components (`HackathonSpace.tsx`, `HistoryView.tsx`, `SidebarDrawer.tsx`, `App.tsx`) structured cleanly. Monospace typography (`font-mono`) should be used for paths, repos, hashes, and terminal logs; sans-serif (`font-sans`) for headings and controls. Accent colors should be applied conservatively to guide user attention.
