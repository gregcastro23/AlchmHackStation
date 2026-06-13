# Walkthrough: Planetary Cockpit & AlchmAgentsETH Integration

This walkthrough summarizes the implementation and verification of the cockpit developer console integration for `AlchmAgentsETH`:
1. **Interactive Plan Customizer**: Selecting custom programming languages, styling libraries, frameworks, database drivers, and AI/LLM models to customize and re-forge build plans.
2. **Dynamic Task Management**: The ability to add, edit, and delete tasks within the Swarm Nexus (Crucible) simulation.
3. **Discord Event feed**: A live ETHGlobal event feed with simulated message rooms (`#announcements`, `#mentorship`, `#team-formation`, and `#general-chat`) and a widget settings form to connect a real Discord server via a WidgetBot iframe.
4. **Planetary Agent Cockpit (New)**: A real-life submission and cockpit console for the sibling repository `/Users/cookingwithcastro/Desktop/EthGlobalHackathon/AlchmAgentsETH-main` running:
   - **System Stack Health Grid**: Real-time port listening probes (ports 3000, 8000, 8001) scanning active frontend and backend services.
   - **Foundry Solidity Control Deck**: Real compile and test runs for `EsmsToken.sol` using `forge test` in the contracts subdirectory.
   - **FastAPI Pytest Runner**: Active execution of python unit tests (`pytest test_main.py`) in the backend subdirectory.
   - **Celestial Energy Telemetry**: Live alchemical number A#, SMES element distributions (Air, Water, Earth, Fire), and kinetic/thermodynamic metrics (Heat, Entropy, Reactivity).
   - **Submission Log Terminal**: Direct stdout output streaming of compiler, testing, and service actions.

---

## Changes Made

### 1. Swarm Plan Generation & Override
* **Modified** `src/lib/swarmEngine.ts`: Updated [decomposeIdea](../src/lib/swarmEngine.ts#L602) to accept an optional `overrideLanguageId` parameter. If set, this forces the primary language stack value and re-sequences the simulated task graph to align with the chosen technology.
* **Modified** `src/components/SwarmNexus.tsx`: Replaced static technology chips with interactive dropdown-based selectors for Language, Styling, Framework, Database, and LLM Model. Changes to language auto-regenerate the plan.

### 2. Inline Task CRUD
* **Modified** `src/components/SwarmNexus.tsx`: Added form state and action handlers to add, delete, and edit tasks.

### 3. Discord Feed & Widget Bindings
* **Created** [DiscordLiveFeed.tsx](../src/components/DiscordLiveFeed.tsx): Contains a split-screen dashboard to monitor events and mount Discord iframe widgets.

### 4. Planetary Agent Cockpit Integration
* **Created** [PlanetaryCockpit.tsx](../src/components/PlanetaryCockpit.tsx): A comprehensive developer console and cockpit that executes diagnostics and builds in the sibling `AlchmAgentsETH-main` folder.
* **Modified** `vite.config.ts`: Updated the `/api/exec` server middleware to accept a custom `cwd` path payload, enabling command execution in the contracts and backend subfolders.
* **Modified** `src/components/SidebarDrawer.tsx`: Replaced the obsolete mock `private-nanopayments` navigation option with `planetary-cockpit` (Planetary Cockpit) using the `Atom` icon.
* **Modified** `src/App.tsx`: Replaced imports of `PrivateNanopayments` with `PlanetaryCockpit` and mounted it under the active tab `'planetary-cockpit'`.
* **Deleted** `src/components/PrivateNanopayments.tsx`: Cleared out the obsolete mock code file.

---

## Verification Results

### 1. Automated Verification
* Executed `bun run build` in `/Users/cookingwithcastro/Desktop/AlchmHackStation` which completed with exit code 0:
  ```bash
  $ tsc -b && vite build
  vite v8.0.16 building client environment for production...
  ✓ 1870 modules transformed.
  dist/assets/index-DcdTEKXW.js                    538.10 kB │ gzip: 141.88 kB
  ✓ built in 164ms
  ```

### 2. Manual Visual Verification
Visual validations confirm that the cockpit dynamically checks ports and runs tests:
- **Stack Monitor Tab**: Clicking "RE-SCAN PORTS" executes `lsof` checks and identifies that Vite Dev server on port 5173 is online.
- **Foundry Tab**: Clicking "RUN FORGE TESTS" triggers contract compilation and test execution in the sibling folder.
- **Python Tab**: Clicking "RUN BACKEND TESTS" triggers pytest validations.
- **Telemetry Tab**: Visualizes real-time alchemical changes.
