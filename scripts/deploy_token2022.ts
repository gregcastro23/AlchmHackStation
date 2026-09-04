#!/usr/bin/env bun
/**
 * AlchmHackStation: Token-2022 Elemental Mint Deployment Tool
 * Usage:
 *   bun scripts/deploy_token2022.ts --element SPIRIT [--broadcast]
 */

import fs from 'fs';
import path from 'path';
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js';
import {
  buildToken2022MintTransaction,
  simulateToken2022Deploy,
  deriveExtraAccountMetaListPDA,
  type ElementalType,
} from '../src/lib/token2022Builder';
import { fetchAndValidateArweaveMetadata } from '../src/lib/arweaveValidator';
import { ARWEAVE_ELEMENTAL_MANIFESTS } from '../src/data/arweaveManifests';
import { PROGRAM_IDS } from '../src/types/hackstation';

async function main() {
  const args = process.argv.slice(2);
  let elementSymbol = 'SPIRIT';
  let broadcast = false;
  let clusterUrl = 'https://api.devnet.solana.com';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--element' && args[i + 1]) {
      elementSymbol = args[++i].toUpperCase();
    } else if (args[i] === '--broadcast') {
      broadcast = true;
    } else if (args[i] === '--localnet') {
      clusterUrl = 'http://127.0.0.1:8899';
    }
  }

  console.log('╔═══════════════════════════════════════════════════════════════════╗');
  console.log('║        ALCHMHACKSTATION: TOKEN-2022 ELEMENTAL PIPELINE            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════╝');
  console.log(`[CONFIG] Target Element: ${elementSymbol}`);
  console.log(`[CONFIG] Cluster: ${clusterUrl}`);
  console.log(`[CONFIG] Mode: ${broadcast ? 'LIVE ON-CHAIN BROADCAST' : 'DEVNET SIMULATION (0x0 Check)'}`);

  // 1. Step 1: Pre-flight Arweave Verification (Milestone M1)
  console.log('\n[STEP 1] Running Pre-flight Arweave Metadata Verification...');
  const matchingManifestEntry = Object.entries(ARWEAVE_ELEMENTAL_MANIFESTS).find(
    ([, m]) =>
      m.symbol.toUpperCase() === elementSymbol ||
      (elementSymbol === 'IGNIS' && m.symbol === 'SPIRIT') ||
      (elementSymbol === 'AQUA' && m.symbol === 'ESSENCE') ||
      (elementSymbol === 'TERRA' && m.symbol === 'MATTER') ||
      ((elementSymbol === 'AETH' || elementSymbol === 'AETHER') && m.symbol === 'SUBSTANCE')
  );

  if (!matchingManifestEntry) {
    console.error(`[ERROR] No metadata manifest found for element symbol: ${elementSymbol}`);
    process.exit(1);
  }

  const [arweaveUri, manifest] = matchingManifestEntry;
  const arweaveCheck = await fetchAndValidateArweaveMetadata(arweaveUri);

  if (!arweaveCheck.valid || arweaveCheck.statusCode !== 200) {
    console.error(`[ERROR] Arweave verification failed for ${elementSymbol}:`, arweaveCheck.errors);
    process.exit(1);
  }

  console.log(`✓ Arweave Manifest Status: HTTP 200 OK`);
  console.log(`✓ SHA-256 Digest: ${arweaveCheck.sha256}`);
  console.log(`✓ Asset Name: "${manifest.name}" | Attributes: ${manifest.attributes.length}`);

  // 2. Step 2: Keypair and Connection Setup
  const keypairPath = path.resolve(process.env.HOME || '', '.config/solana/id.json');
  if (!fs.existsSync(keypairPath)) {
    console.error(`[ERROR] Operator Solana keypair not found at ${keypairPath}`);
    process.exit(1);
  }

  const secret = JSON.parse(fs.readFileSync(keypairPath, 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(secret));
  const connection = new Connection(clusterUrl, 'confirmed');

  const balance = await connection.getBalance(payer.publicKey);
  console.log(`\n[STEP 2] Operator Account: ${payer.publicKey.toBase58()}`);
  console.log(`✓ Operator Devnet Balance: ${(balance / 1e9).toFixed(4)} SOL`);

  // 3. Step 3: Transaction Building & PDA Derivation (Milestone M2)
  console.log('\n[STEP 3] Generating Fresh Mint Keypair & Deriving PDAs...');
  const elementMap: Record<string, { element: ElementalType; decimals: number }> = {
    SPIRIT: { element: 'Fire', decimals: 4 },
    ESSENCE: { element: 'Water', decimals: 4 },
    MATTER: { element: 'Earth', decimals: 4 },
    SUBSTANCE: { element: 'Air', decimals: 4 },
    // Backwards-compatibility aliases
    IGNIS: { element: 'Fire', decimals: 4 },
    AQUA: { element: 'Water', decimals: 4 },
    TERRA: { element: 'Earth', decimals: 4 },
    AETH: { element: 'Air', decimals: 4 },
    AETHER: { element: 'Air', decimals: 4 },
  };

  const elInfo = elementMap[elementSymbol] || { element: 'Fire', decimals: 4 };

  const built = await buildToken2022MintTransaction(connection, {
    element: elInfo.element,
    symbol: manifest.symbol,
    name: manifest.name,
    decimals: elInfo.decimals,
    uri: arweaveUri,
    payerPublicKey: payer.publicKey,
    hookProgramId: new PublicKey(PROGRAM_IDS.TOKEN2022_TRANSFER_HOOK),
  });

  const mintPubkey = built.mintKeypair.publicKey.toBase58();
  console.log(`✓ Fresh Mint Public Key: ${mintPubkey}`);

  if (built.extraAccountMetaListPda) {
    console.log(`✓ ExtraAccountMetaList PDA: ${built.extraAccountMetaListPda.toBase58()} (Bump: ${built.pdaBump})`);
  }
  console.log(`✓ Space Allocated: Mint ${built.mintLen} bytes | Total with Metadata ${built.totalSpace} bytes`);
  console.log(`✓ Rent Exemption: ${(built.rentExemptionLamports / 1e9).toFixed(6)} SOL`);
  console.log(`✓ Instructions Queued: ${built.instructions.length}`);

  // 4. Step 4: Devnet Simulation (Milestone M3)
  console.log('\n[STEP 4] Executing RPC Simulation on Cluster...');
  const sim = await simulateToken2022Deploy(connection, built, payer);

  if (!sim.success) {
    console.error(`[ERROR] Simulation failed with error:`, sim.err);
    console.error('Simulation logs:\n', sim.logs?.join('\n'));
    process.exit(1);
  }

  console.log(`✓ Simulation Status: 0x0 SUCCESS (Error: null)`);
  console.log(`✓ Compute Units Consumed: ${sim.unitsConsumed}`);

  // 5. Step 5: Broadcast (if flag set)
  if (broadcast) {
    console.log('\n[STEP 5] Broadcasting Transaction Live to Devnet...');
    try {
      const txSig = await sendAndConfirmTransaction(
        connection,
        built.transaction,
        [payer, built.mintKeypair],
        { commitment: 'confirmed' }
      );
      console.log(`\n🎉 TRANSACTION CONFIRMED ON SOLANA DEVNET!`);
      console.log(`✓ Transaction Signature: ${txSig}`);
      console.log(`✓ Solscan URL: https://solscan.io/tx/${txSig}?cluster=devnet`);
      console.log(`✓ Mint Account: https://solscan.io/token/${mintPubkey}?cluster=devnet`);
    } catch (err: any) {
      console.error(`[ERROR] Broadcast error: ${err?.message}`);
      process.exit(1);
    }
  } else {
    console.log('\n[NOTE] Simulation complete. To broadcast live on-chain, pass --broadcast');
  }

  console.log('\n[PIPELINE COMPLETE] Token-2022 pipeline operational.');
}

main().catch((err) => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
