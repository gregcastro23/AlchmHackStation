import fs from 'fs';
import { Keypair, Connection, Transaction, SystemProgram, PublicKey } from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
  ExtensionType,
  getMintLen,
  TYPE_SIZE,
  LENGTH_SIZE,
  createInitializeTransferHookInstruction,
  createInitializeMetadataPointerInstruction,
  createInitializeNonTransferableMintInstruction,
  createInitializePermanentDelegateInstruction,
  createInitializeInterestBearingMintInstruction,
  createInitializeMintInstruction,
} from '@solana/spl-token';
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { ARWEAVE_ELEMENTAL_MANIFESTS } from '../src/data/arweaveManifests';

async function main() {
  const secret = JSON.parse(fs.readFileSync('/Users/cookingwithcastro/.config/solana/id.json', 'utf-8'));
  const payer = Keypair.fromSecretKey(Uint8Array.from(secret));
  const conn = new Connection('https://api.devnet.solana.com', 'confirmed');
  const hookProgramId = new PublicKey('Hook1gNisFeeResoLver111111111111111111111111');
  const { blockhash } = await conn.getLatestBlockhash();

  const elementConfigs = [
    {
      symbol: 'SPIRIT',
      name: 'Spirit Reagent',
      uri: 'https://arweave.net/qR8v7_Spirit_Alchm_Elemental_Proof_v2.json',
      decimals: 4,
      extensions: [ExtensionType.TransferHook, ExtensionType.MetadataPointer],
      setup: (tx: Transaction, mint: PublicKey) => {
        tx.add(
          createInitializeTransferHookInstruction(mint, payer.publicKey, hookProgramId, TOKEN_2022_PROGRAM_ID),
          createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID)
        );
      },
    },
    {
      symbol: 'ESSENCE',
      name: 'Essence Dissolution Reagent',
      uri: 'https://arweave.net/wT2x9_Essence_Stealth_Reagent_v2.json',
      decimals: 4,
      extensions: [ExtensionType.MetadataPointer],
      setup: (tx: Transaction, mint: PublicKey) => {
        tx.add(createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID));
      },
    },
    {
      symbol: 'MATTER',
      name: 'Matter Coagulation Seal',
      uri: 'https://arweave.net/eM4k1_Matter_Soulbound_Badge_v2.json',
      decimals: 4,
      extensions: [ExtensionType.NonTransferable, ExtensionType.MetadataPointer],
      setup: (tx: Transaction, mint: PublicKey) => {
        tx.add(
          createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
          createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID)
        );
      },
    },
    {
      symbol: 'SUBSTANCE',
      name: 'Substance Dynamic Yield Matrix',
      uri: 'https://arweave.net/aL9p4_Substance_Dynamic_Staking_v2.json',
      decimals: 4,
      extensions: [ExtensionType.PermanentDelegate, ExtensionType.InterestBearingConfig, ExtensionType.MetadataPointer],
      setup: (tx: Transaction, mint: PublicKey) => {
        tx.add(
          createInitializePermanentDelegateInstruction(mint, payer.publicKey, TOKEN_2022_PROGRAM_ID),
          createInitializeInterestBearingMintInstruction(mint, payer.publicKey, 1820, TOKEN_2022_PROGRAM_ID),
          createInitializeMetadataPointerInstruction(mint, payer.publicKey, mint, TOKEN_2022_PROGRAM_ID)
        );
      },
    },
  ];

  console.log('[SIM] Testing all 4 elemental Token-2022 mint configurations on Devnet...');
  let allSuccess = true;

  for (const cfg of elementConfigs) {
    const mintKeypair = Keypair.generate();
    const metaData = {
      updateAuthority: payer.publicKey,
      mint: mintKeypair.publicKey,
      name: cfg.name,
      symbol: cfg.symbol,
      uri: cfg.uri,
      additionalMetadata: [],
    };

    const mintLen = getMintLen(cfg.extensions);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metaData).length;
    const totalSpace = mintLen + metadataLen;
    const lamports = await conn.getMinimumBalanceForRentExemption(totalSpace);

    const tx = new Transaction();
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      })
    );

    cfg.setup(tx, mintKeypair.publicKey);

    tx.add(
      createInitializeMintInstruction(
        mintKeypair.publicKey,
        cfg.decimals,
        payer.publicKey,
        payer.publicKey,
        TOKEN_2022_PROGRAM_ID
      ),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        metadata: mintKeypair.publicKey,
        updateAuthority: payer.publicKey,
        mint: mintKeypair.publicKey,
        mintAuthority: payer.publicKey,
        name: metaData.name,
        symbol: metaData.symbol,
        uri: metaData.uri,
      })
    );

    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = blockhash;
    tx.sign(payer, mintKeypair);

    const sim = await conn.simulateTransaction(tx);
    const passed = sim.value.err === null;
    console.log(`[SIM] ${cfg.symbol.padEnd(5)} -> err: ${sim.value.err === null ? '0x0 (SUCCESS)' : JSON.stringify(sim.value.err)} | CU: ${sim.value.unitsConsumed}`);
    if (!passed) {
      allSuccess = false;
      console.error(sim.value.logs);
    }
  }

  if (allSuccess) {
    console.log('\n[PASS] All 4 elemental Token-2022 mints simulate with 0x0 error on Devnet!');
  } else {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
