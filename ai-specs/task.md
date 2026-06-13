# Tasks: AlchmAgentsETH Submission & Cockpit Console

- [x] Update `vite.config.ts` to support directory-specific execution paths via `/api/exec`
- [x] Update navigation items in `src/components/SidebarDrawer.tsx` (replace Private Nanopayments with Planetary Cockpit)
- [x] Update imports and render logic in `src/App.tsx` (replace `PrivateNanopayments` with `PlanetaryCockpit`)
- [x] Create the new `src/components/PlanetaryCockpit.tsx` component
  - [x] Implement System Stack Health (Next.js, FastAPI, WebSockets)
  - [x] Implement Foundry Solidity Control Deck (`forge build`, `forge test`)
  - [x] Implement Backend Python Test Suite executor (`pytest`)
  - [x] Implement Live Celestial Energy metrics telemetry widget
  - [x] Implement RAG Sync & ChromaDB verification panel
- [x] Remove the obsolete `src/components/PrivateNanopayments.tsx` file
- [x] Build and verify the application compiles and runs correctly
