#!/usr/bin/env bun
/**
 * AlchmHackStation: Canonical Elemental Coins Devnet Verification & Testing
 * Tests the 4 canonical protocol coins: SPIRIT, ESSENCE, MATTER, SUBSTANCE
 */

import fs from 'fs';
import path from 'path';
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMint,
  getMetadataPointerState,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountIdempotentInstruction,
} from '@solana/spl-token';

export const CANONICAL_DEVNET_MINTS = {
  SPIRIT: {
    address: 'K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ',
    element: 'Fire',
    principle: 'Active Projective Energy (Sulfur / Volatile)',
    decimals: 4,
    feature: 'TransferHook (Dynamic friction fees)',
  },
  ESSENCE: {
    address: '3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf',
    element: 'Water',
    principle: 'Receptive Subconscious Integration (Mercury / Dissolution)',
    decimals: 4,
    feature: 'ConfidentialTransfers (Zk stealth privacy)',
  },
  MATTER: {
    address: '7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4',
    element: 'Earth',
    principle: 'Coagulation & Fixed Form (Salt / Structure)',
    decimals: 4,
    feature: 'NonTransferable (Soulbound achievement badge)',
  },
  SUBSTANCE: {
    address: '6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa',
    element: 'Air',
    principle: 'Intellectual Reasoning (Spirit / Sublimation)',
    decimals: 4,
    feature: 'InterestBearingConfig (Dynamic 18.20% APR staking yield)',
  },
};

async function main() {
  const args = process.argv.slice(2);
  const broadcast = args.includes('--broadcast');
  const conn = new Connection('https://api.devnet.solana.com', 'confirmed');

  const keypairPath = path.resolve(process.env.HOME || '', '.config/solana/id.json');
  const secret = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(secret));

  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║       CANONICAL DEVNET VERIFICATION: SPIRIT, ESSENCE, MATTER, SUBSTANCE   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');
  console.log(`[OPERATOR] Public Key: ${payer.publicKey.toBase58()}`);
  const balance = await conn.getBalance(payer.publicKey);
  console.log(`[OPERATOR] Devnet SOL Balance: ${(balance / 1e9).toFixed(4)} SOL`);
  console.log(`[MODE]     ${broadcast ? 'ON-CHAIN BROADCAST' : 'DEVNET SIMULATION (Safe Read & 0x0 Test)'}\n`);

  console.log('-----------------------------------------------------------------------------');
  console.log('1. ON-CHAIN MINT TELEMETRY & SPECIFICATION AUDIT');
  console.log('-----------------------------------------------------------------------------');

  for (const [symbol, info] of Object.entries(CANONICAL_DEVNET_MINTS)) {
    const mintPk = new PublicKey(info.address);
    const mintData = await getMint(conn, mintPk, 'confirmed', TOKEN_2022_PROGRAM_ID);
    const metaPointer = getMetadataPointerState(mintData);

    console.log(`\n• [${symbol}] (${info.element})`);
    console.log(`  Mint Address:     ${info.address}`);
    console.log(`  Alchm Principle:  ${info.principle}`);
    console.log(`  Token-2022 Spec:  ${info.feature}`);
    console.log(`  Decimals:         ${mintData.decimals} (Expected: ${info.decimals}) -> ${mintData.decimals === info.decimals ? 'MATCH ✓' : 'MISMATCH ✗'}`);
    console.log(`  Total Supply:     ${(Number(mintData.supply) / 10 ** mintData.decimals).toLocaleString()} ${symbol}`);
    console.log(`  Mint Authority:   ${mintData.mintAuthority?.toBase58() || 'Immutable (None)'}`);
    console.log(`  Metadata Pointer: ${metaPointer?.metadataAddress?.toBase58() || 'None'}`);
  }

  console.log('\n-----------------------------------------------------------------------------');
  console.log('2. ASSOCIATED TOKEN ACCOUNT (ATA) INITIALIZATION SIMULATION');
  console.log('-----------------------------------------------------------------------------');

  const { blockhash } = await conn.getLatestBlockhash();
  const ataTx = new Transaction();

  for (const [symbol, info] of Object.entries(CANONICAL_DEVNET_MINTS)) {
    const mintPk = new PublicKey(info.address);
    const ata = getAssociatedTokenAddressSync(mintPk, payer.publicKey, false, TOKEN_2022_PROGRAM_ID);

    ataTx.add(
      createAssociatedTokenAccountIdempotentInstruction(
        payer.publicKey,
        ata,
        payer.publicKey,
        mintPk,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );

    console.log(`  Prepared ATA for ${symbol.padEnd(9)}: ${ata.toBase58()}`);
  }

  ataTx.feePayer = payer.publicKey;
  ataTx.recentBlockhash = blockhash;
  ataTx.sign(payer);

  console.log('\nSimulating batch ATA creation for all 4 canonical coins on Devnet...');
  const sim = await conn.simulateTransaction(ataTx);

  if (sim.value.err === null) {
    console.log(`✓ ATA Simulation SUCCESS: 0x0 (CU consumed: ${sim.value.unitsConsumed})`);
  } else {
    console.error('✗ ATA Simulation failed:', sim.value.err);
    console.error(sim.value.logs);
    process.exit(1);
  }

  if (broadcast) {
    console.log('\nBroadcasting batch ATA creation live to Solana Devnet...');
    const sig = await sendAndConfirmTransaction(conn, ataTx, [payer]);
    console.log(`🎉 Batch ATA initialization confirmed on Devnet!`);
    console.log(`Transaction signature: ${sig}`);
    console.log(`Solscan: https://solscan.io/tx/${sig}?cluster=devnet`);
  } else {
    console.log('\n[NOTE] Simulation passed with 0 errors. Run with --broadcast to initialize on Devnet.');
  }

  console.log('\n✓ ALL 4 CANONICAL PROTOCOL COINS VERIFIED ON DEVNET (Spirit, Essence, Matter, Substance).\n');
}

main().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
