/**
 * Token-2022 Active Transaction Builder & PDA Resolver
 * Handles fresh keypair generation, ExtraAccountMetaList PDA derivation,
 * strict instruction ordering, and RPC simulation/execution.
 */

import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  type TransactionInstruction,
} from '@solana/web3.js';
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
import { PROGRAM_IDS, PDA_SEEDS } from '../types/hackstation';

export type ElementalType = 'Fire' | 'Water' | 'Earth' | 'Air';

export interface Token2022DeployConfig {
  element: ElementalType;
  symbol: string;
  name: string;
  decimals: number;
  uri: string;
  payerPublicKey: PublicKey;
  hookProgramId?: PublicKey;
}

export interface BuiltToken2022Transaction {
  transaction: Transaction;
  mintKeypair: Keypair;
  extraAccountMetaListPda?: PublicKey;
  pdaBump?: number;
  mintLen: number;
  totalSpace: number;
  rentExemptionLamports: number;
  instructions: TransactionInstruction[];
}

export interface SimulationResult {
  success: boolean;
  err: any;
  unitsConsumed?: number;
  logs?: string[];
  mintAddress: string;
  extraAccountMetaListPda?: string;
  sha256Digest?: string;
}

/**
 * Generate a fresh mint keypair
 */
export function generateMintKeypair(): Keypair {
  return Keypair.generate();
}

/**
 * Derive ExtraAccountMetaList PDA matching ['extra-account-metas', mintKeypair.publicKey]
 */
export function deriveExtraAccountMetaListPDA(
  mint: PublicKey,
  hookProgramId: PublicKey = new PublicKey(PROGRAM_IDS.TOKEN2022_TRANSFER_HOOK)
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(PDA_SEEDS.EXTRA_ACCOUNT_METAS), mint.toBuffer()],
    hookProgramId
  );
}

/**
 * Build the active Token-2022 deployment transaction with strict instruction ordering
 */
export async function buildToken2022MintTransaction(
  connection: Connection,
  config: Token2022DeployConfig,
  mintKeypair: Keypair = generateMintKeypair()
): Promise<BuiltToken2022Transaction> {
  const payer = config.payerPublicKey;
  const mint = mintKeypair.publicKey;
  const instructions: TransactionInstruction[] = [];

  const hookId = config.hookProgramId || new PublicKey(PROGRAM_IDS.TOKEN2022_TRANSFER_HOOK);
  let extraAccountMetaListPda: PublicKey | undefined;
  let pdaBump: number | undefined;

  // Metadata pack preparation
  const metaData = {
    updateAuthority: payer,
    mint: mint,
    name: config.name,
    symbol: config.symbol,
    uri: config.uri,
    additionalMetadata: [['Element', config.element]] as Array<[string, string]>,
  };

  const metadataBytes = pack(metaData).length;
  const metadataLen = TYPE_SIZE + LENGTH_SIZE + metadataBytes;

  let extensions: ExtensionType[] = [];
  const extensionInstructions: TransactionInstruction[] = [];

  switch (config.symbol.toUpperCase()) {
    case 'SPIRIT':
    case 'IGNIS': {
      // Fire: TransferHook + MetadataPointer
      const [pda, bump] = deriveExtraAccountMetaListPDA(mint, hookId);
      extraAccountMetaListPda = pda;
      pdaBump = bump;

      extensions = [ExtensionType.TransferHook, ExtensionType.MetadataPointer];
      extensionInstructions.push(
        createInitializeTransferHookInstruction(mint, payer, hookId, TOKEN_2022_PROGRAM_ID),
        createInitializeMetadataPointerInstruction(mint, payer, mint, TOKEN_2022_PROGRAM_ID)
      );
      break;
    }
    case 'ESSENCE':
    case 'AQUA': {
      // Water: MetadataPointer (ZK confidential metadata)
      extensions = [ExtensionType.MetadataPointer];
      extensionInstructions.push(
        createInitializeMetadataPointerInstruction(mint, payer, mint, TOKEN_2022_PROGRAM_ID)
      );
      break;
    }
    case 'MATTER':
    case 'TERRA': {
      // Earth: NonTransferable + MetadataPointer
      extensions = [ExtensionType.NonTransferable, ExtensionType.MetadataPointer];
      extensionInstructions.push(
        createInitializeNonTransferableMintInstruction(mint, TOKEN_2022_PROGRAM_ID),
        createInitializeMetadataPointerInstruction(mint, payer, mint, TOKEN_2022_PROGRAM_ID)
      );
      break;
    }
    case 'SUBSTANCE':
    case 'AETH':
    case 'AETHER': {
      // Air: PermanentDelegate + InterestBearingConfig (18.2% APY = 1820 bps) + MetadataPointer
      extensions = [
        ExtensionType.PermanentDelegate,
        ExtensionType.InterestBearingConfig,
        ExtensionType.MetadataPointer,
      ];
      extensionInstructions.push(
        createInitializePermanentDelegateInstruction(mint, payer, TOKEN_2022_PROGRAM_ID),
        createInitializeInterestBearingMintInstruction(mint, payer, 1820, TOKEN_2022_PROGRAM_ID),
        createInitializeMetadataPointerInstruction(mint, payer, mint, TOKEN_2022_PROGRAM_ID)
      );
      break;
    }
    default: {
      extensions = [ExtensionType.MetadataPointer];
      extensionInstructions.push(
        createInitializeMetadataPointerInstruction(mint, payer, mint, TOKEN_2022_PROGRAM_ID)
      );
    }
  }

  // 1. Calculate space and rent
  const mintLen = getMintLen(extensions);
  const totalSpace = mintLen + metadataLen;
  const rentExemptionLamports = await connection.getMinimumBalanceForRentExemption(totalSpace);

  // 2. Strict instruction ordering:
  // Step A: SystemProgram.createAccount
  instructions.push(
    SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: mint,
      space: mintLen, // Must be mintLen so initializeMint succeeds
      lamports: rentExemptionLamports, // Must provide headroom for metadata extension expansion
      programId: TOKEN_2022_PROGRAM_ID,
    })
  );

  // Step B: Extension initialization instructions (must precede initializeMint)
  instructions.push(...extensionInstructions);

  // Step C: Initialize Mint
  instructions.push(
    createInitializeMintInstruction(
      mint,
      config.decimals,
      payer,
      payer,
      TOKEN_2022_PROGRAM_ID
    )
  );

  // Step D: Initialize Token Metadata Extension
  instructions.push(
    createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID,
      metadata: mint,
      updateAuthority: payer,
      mint: mint,
      mintAuthority: payer,
      name: metaData.name,
      symbol: metaData.symbol,
      uri: metaData.uri,
    })
  );

  const tx = new Transaction().add(...instructions);
  tx.feePayer = payer;

  return {
    transaction: tx,
    mintKeypair,
    extraAccountMetaListPda,
    pdaBump,
    mintLen,
    totalSpace,
    rentExemptionLamports,
    instructions,
  };
}

/**
 * Simulate the Token-2022 deployment transaction against the Solana cluster
 */
export async function simulateToken2022Deploy(
  connection: Connection,
  built: BuiltToken2022Transaction,
  payerSigner?: Keypair
): Promise<SimulationResult> {
  const { blockhash } = await connection.getLatestBlockhash();
  built.transaction.recentBlockhash = blockhash;

  if (payerSigner) {
    built.transaction.sign(payerSigner, built.mintKeypair);
  } else {
    // Partial sign with mint keypair for browser wallets
    built.transaction.partialSign(built.mintKeypair);
  }

  const sim = await connection.simulateTransaction(built.transaction, undefined, false);
  const isSuccess = sim.value.err === null;

  return {
    success: isSuccess,
    err: sim.value.err,
    unitsConsumed: sim.value.unitsConsumed,
    logs: sim.value.logs || [],
    mintAddress: built.mintKeypair.publicKey.toBase58(),
    extraAccountMetaListPda: built.extraAccountMetaListPda?.toBase58(),
  };
}
