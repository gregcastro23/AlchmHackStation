# Implementation Plan: AlchmAgentsETH Submission & Cockpit Console

We will repurpose the developer console of the `AlchmHackStation` into a real-life **AlchmAgentsETH Submission & Cockpit Console**. Instead of generic app-building mocks or isolated nanopayments, the console will serve as the hacker cockpit to build, test, monitor, and submit the actual astrological agent platform `AlchmAgentsETH` located in the sibling folder `/Users/cookingwithcastro/Desktop/EthGlobalHackathon/AlchmAgentsETH-main`.

The console will integrate:
1. **Real-time Stack Monitoring**: Active process checks on port 3000 (Next.js frontend) and port 8000/8001 (FastAPI/Express backend).
2. **Foundry Smart Contract Operations**: Local execution of `forge build` and `forge test` inside `AlchmAgentsETH-main/contracts/`, surfacing compiler stdout and test pass rates.
3. **Python FastAPI Backend Test Suite**: Run `pytest` / `test_main.py` directly from the console to verify API endpoints and agent models.
4. **Live Celestial Energy Telemetry**: Real-time tracking of A# (Alchemical Number), SMES flows, Kinetics, and Thermodynamics (Heat, Entropy, Reactivity) via active API probes or direct astronomical calculations.
5. **RAG / Vector Database Syncing Status**: Check whether ChromaDB is running and verify the synchronization status of the 35 historical agents' embeddings.

---

## User Review Required

> [!IMPORTANT]
> The `Private Nanopayments` tab will be replaced by the **Planetary Agent Cockpit** (using the `Sparkles` or `Atom` icon). 
> The console will make active `/api/exec` calls to run commands in the sibling `/Users/cookingwithcastro/Desktop/EthGlobalHackathon/AlchmAgentsETH-main` folder.

> [!WARNING]
> Since executing commands like `forge test` or `pytest` can be resource-intensive in a 16GB M5 Mac environment, the dashboard will run them on-demand with visual indicators to prevent overlapping executions and memory overhead.

---

## Open Questions

> [!IMPORTANT]
> 1. **Server Management**: Do you want the dashboard to support *starting* and *stopping* the Next.js dev server and FastAPI backend directly from the console, or should it only monitor and report the status of already running services?
> 2. **Solidity Deployment**: Should we add a button to trigger live contract deployment scripts (e.g. using `forge script` to deploy `EsmsToken.sol` to Base Sepolia/Arc Testnet) or keep the scope restricted to compilation and unit tests?
> 3. **USDC Tokenomics & Privy Auth**: Do you want to keep a section in the dashboard to review local token balances (Spirit, Essence, Matter, Substance) and verify Privy login integrations, or focus entirely on astrological telemetry and backend services?

---

## Proposed Changes

### Configuration & Routing

#### [MODIFY] [vite.config.ts](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/vite.config.ts)
- Modify the `/api/exec` middleware to accept a custom `cwd` target or resolve the absolute path to `AlchmAgentsETH-main` when requested, ensuring commands run in the correct project directory.

#### [MODIFY] [SidebarDrawer.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/SidebarDrawer.tsx)
- Replace `private-nanopayments` (Private Nanopayments) in `navItems` with `planetary-cockpit` (Planetary Cockpit).
- Replace `ShieldCheck` icon with `Atom` or `Sparkles` icon.

#### [MODIFY] [App.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/App.tsx)
- Replace import of `PrivateNanopayments` with `PlanetaryCockpit`.
- Map the `planetary-cockpit` tab to render the new `PlanetaryCockpit` component.

---

### Components

#### [NEW] [PlanetaryCockpit.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/PlanetaryCockpit.tsx)
Create a new comprehensive console widget featuring:
- **System Stack Health Grid**:
  - Probes port 3000 (Next.js Dev), port 8000 (FastAPI), and port 8001 (WebSockets) in real-time.
  - Displays service latency, process IDs, and connection status.
- **Foundry Solidity Control Deck**:
  - Interactive buttons to run `forge build` and `forge test` in `/contracts`.
  - Live compiler output feed with error highlighting.
  - Test suite status (tests passed, gas reports, failures).
- **Planetary Agent Test Panel**:
  - Run `bun run test:chat` or individual FastAPI python endpoint tests (`pytest test_main.py`).
  - Stream live testing stdout directly into a scrollable terminal pane.
- **Live Celestial Energy Widgets**:
  - Real-time display of A# (Alchemical Number), SMES balances, Kinetic/Thermodynamic metrics.
  - Fetches from `/api/planetary-positions` or `/api/consciousness/live` if the backend is running; otherwise degrades gracefully to mock coordinates.
- **RAG & Sync Control Center**:
  - Displays sync status for the 35 historical agents.
  - Buttons to verify ChromaDB container and trigger `rag:ingest` or `sync:db` updates.

#### [DELETE] [PrivateNanopayments.tsx](file:///Users/cookingwithcastro/Desktop/AlchmHackStation/src/components/PrivateNanopayments.tsx)
- Delete the outdated mock private nanopayments component.

---

## Verification Plan

### Automated Build Verification
- Verify the Vite project builds successfully by executing:
  ```bash
  bun run build
  ```

### Manual Verification
- Launch the `AlchmHackStation` console.
- Navigate to the **Planetary Cockpit** tab.
- Verify that the **System Stack Health** correctly reports active listeners (e.g. starting uvicorn on port 8000 should switch FastAPI status to "ONLINE").
- Click **Run Solidity Tests** and verify that it compiles and runs Foundry tests for `EsmsToken.sol` in the sibling directory.
- Click **Run Backend Tests** and check that python test logs are streamed into the log pane.
- Verify that **Celestial Energy** metrics update dynamically.
