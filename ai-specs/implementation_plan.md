# Implementation Plan: Private Nanopayments Dashboard

We will implement a new interactive **Private Nanopayments** module within the AlchmHackStation developer console. This dashboard will demonstrate the end-to-end integration required for the collaborative Dynamic + Arc + Unlink bounty:
1. **Dynamic Login & Wallet Connection**
2. **Unlink Account Registration & ZK-Shielding (arc-testnet)**
3. **Private Withdrawal to a fresh Payer EOA**
4. **Circle Gateway x402 Nanopayment (arcTestnet) using the Payer EOA**

---

## User Review Required

> [!IMPORTANT]
> The new module will be added as a first-class tab in the side menu (using the `ShieldCheck` icon, labeled `Private Nanopayments`).
>
> By default, it will operate in **Interactive Simulation Mode** displaying real-time cryptographic details (ZK-proof parameters, EIP-3009 signatures, transaction hashes, and status logs) while allowing live environment key configuration (Dynamic Environment ID, Unlink API Key, Payer EOA credentials) for operators to test against live testnet environments.

---

## Proposed Changes

### Layout & Navigation

#### [MODIFY] [SidebarDrawer.tsx](../src/components/SidebarDrawer.tsx)
- Import `ShieldCheck` from `lucide-react`.
- Add `private-nanopayments` as a navigation tab in the `navItems` roster.

#### [MODIFY] [App.tsx](../src/App.tsx)
- Import the new `PrivateNanopayments` component.
- Mount the component when `activeTab === 'private-nanopayments'`.

---

### Components

#### [NEW] [PrivateNanopayments.tsx](../src/components/PrivateNanopayments.tsx)
Create a multi-step builder UI using the premium dark-obsidian / acid-green theme:
- **Header**: Status indicators (Dynamic Connection, Unlink Registration, Circle Gateway Deposit, Settlement Chain: `arc-testnet`).
- **Flow Control Panel**:
  - **Step 1: Dynamic Auth**: Simulated login / wallet connection. Provides field to enter a real `Dynamic Environment ID`.
  - **Step 2: Unlink Shielding**: Shows Bech32m private address (`unlink1...`). Interactive buttons to:
    - Faucet request testnet USDC.
    - Deposit/shield USDC into the private pool.
    - Check shielded balances.
  - **Step 3: Private Withdrawal**: Input for a fresh destination wallet (Payer EOA) and withdrawal amount. Performs private withdrawal (with ZK-proof status tracker).
  - **Step 4: Circle Gateway x402**: Connects the Payer EOA, makes a gateway deposit, and executes a nanopayment (EIP-3009 signing and HTTP 402 negotiation).
- **Log Terminal**: A dedicated panel showing real-time step-by-step console logs with simulated transaction hashes (`tx_...`), gas usage (0 USDC on Gateway!), and cryptographic details.

---

## Verification Plan

### Automated Build Verification
- Verify that TypeScript compile succeeds using `bun run build`.

### Manual Verification
- Navigate to the **Private Nanopayments** tab.
- Walk through the interactive simulation step-by-step:
  1. Click **Connect Wallet via Dynamic** -> Verify status updates.
  2. Click **Request Testnet USDC** -> Verify faucet logs and balance increase.
  3. Click **Shield Funds (Deposit)** -> Verify shielding animation and private balance update.
  4. Click **Withdraw Privately** -> Verify ZK-proof generation animation and EOA balance increase.
  5. Click **Settle x402 Nanopayment** -> Verify HTTP 402 negotiation, EIP-3009 signing logs, and successful resource acquisition.
