# Privy Agent Wallets Configuration

This file contains the configuration details and addresses of the active Privy agent wallets setup for the workstation developer agent.

## Wallet Coordinates
* **Ethereum Address**: `0xBE1c39552dAc524e5365A0C57878BdA3C3a407E0`
* **Solana Address**: `FJ9T3qnNmnkzu8KbfYw2WsTeymFCeH2Rzsh2xjvYzmMB`
* **Setup Date**: 2026-06-13 (ETHGlobal NYC 2026 Hackathon)

---

## Command Reference

### List Wallets
Verify active session coordinates:
```bash
pnpm --package=@privy-io/agent-wallet-cli dlx privy-agent-wallet list-wallets
```

### Sign Personal Message (EVM)
```bash
pnpm --package=@privy-io/agent-wallet-cli dlx privy-agent-wallet rpc --json '{
  "method": "personal_sign",
  "params": {
    "message": "Hello from my alchemical builder agent!"
  }
}'
```

### Send Base Transaction (EVM)
```bash
pnpm --package=@privy-io/agent-wallet-cli dlx privy-agent-wallet rpc --json '{
  "method": "eth_sendTransaction",
  "caip2": "eip155:8453",
  "params": {
    "transaction": {
      "to": "0xRecipientAddress",
      "value": "0x2386F26FC10000"
    }
  }
}'
```

### Fund Wallet
To add funds to the agent wallet session:
```bash
pnpm --package=@privy-io/agent-wallet-cli dlx privy-agent-wallet fund
```

### Request Paid API Resource (x402 / MPP)
Make micro-payments on demand (USDC on Base):
```bash
pnpm --package=@privy-io/agent-wallet-cli dlx privy-agent-wallet fetch-x402 "https://x402-gateway-production.up.railway.app/api/crypto/trending" --max-value 1500
```
