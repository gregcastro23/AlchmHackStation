/**
 * Canonical Arweave Metadata Manifests for Elemental Token-2022 Assets
 * Conforms to Metaplex Token Metadata Standard / SPL Token-2022 Metadata Extension Schema
 * Canonical ASOL Coins: Spirit (Fire), Essence (Water), Matter (Earth), Substance (Air)
 */

export interface ArweaveMetadataAttribute {
  trait_type: string;
  value: string | number;
}

export interface ArweaveMetadataManifest {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: ArweaveMetadataAttribute[];
  properties: {
    category: 'elemental_reagent' | 'credential' | 'matrix';
    files: Array<{ uri: string; type: string }>;
    creators: Array<{ address: string; share: number }>;
    extensions: {
      types: string[];
      [key: string]: any;
    };
  };
}

export const ARWEAVE_ELEMENTAL_MANIFESTS: Record<string, ArweaveMetadataManifest> = {
  'https://arweave.net/qR8v7_Spirit_Alchm_Elemental_Proof_v2.json': {
    name: 'Spirit',
    symbol: 'SPIRIT',
    description: 'Elemental Spirit token of the Alchm protocol representing the Fire axis (Sun / Volatile). Governs projective dynamic energy, creative initiative, and JEPA latent persona drive vectors.',
    image: '/tokens/spirit.svg',
    external_url: 'https://alchmagents.com/metadata/spirit.json',
    attributes: [
      { trait_type: 'Element', value: 'Fire' },
      { trait_type: 'Decimals', value: 4 },
      { trait_type: 'Soulbound', value: 'Non-Transferable' },
      { trait_type: 'BurnAuthority', value: 'Permissioned' },
      { trait_type: 'Extension', value: 'TransferHook' },
      { trait_type: 'Extension', value: 'MetadataPointer' },
      { trait_type: 'Kinetic Fee Basis Points', value: 150 },
      { trait_type: 'Kinetic Fee Percent', value: '1.5%' },
      { trait_type: 'Hook Authority', value: 'Hook1gNisFeeResoLver111111111111111111111111' },
      { trait_type: 'PDA Derivation Seed', value: 'extra-account-metas' },
      { trait_type: 'Pinned Devnet PDA', value: 'K5kwwomtWYydxJacA7bC5yUEW9TtEuVqBKBoqAWLmhQ' },
    ],
    properties: {
      category: 'elemental_reagent',
      files: [{ uri: '/tokens/spirit.svg', type: 'image/svg+xml' }],
      creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
      extensions: {
        types: ['TransferHook', 'MetadataPointer', 'TransferFeeConfig'],
        transferFeeBasisPoints: 150,
        maxFee: 5000000,
        hookProgramId: 'Hook1gNisFeeResoLver111111111111111111111111',
      },
    },
  },
  'https://arweave.net/wT2x9_Essence_Alchm_Elemental_Proof_v2.json': {
    name: 'Essence',
    symbol: 'ESSENCE',
    description: 'Elemental Essence token of the Alchm protocol representing the Water axis (Moon / Dissolution). Governs receptive emotional resonance, subconscious integration, and JEPA latent persona attunement vectors.',
    image: '/tokens/essence.svg',
    external_url: 'https://alchmagents.com/metadata/essence.json',
    attributes: [
      { trait_type: 'Element', value: 'Water' },
      { trait_type: 'Decimals', value: 4 },
      { trait_type: 'Soulbound', value: 'Non-Transferable' },
      { trait_type: 'BurnAuthority', value: 'Permissioned' },
      { trait_type: 'Extension', value: 'ConfidentialTransfers' },
      { trait_type: 'Extension', value: 'MetadataPointer' },
      { trait_type: 'Encryption Mode', value: 'Twisted ElGamal 64-bit' },
      { trait_type: 'Proof System', value: 'Bulletproofs ZK Sigma' },
      { trait_type: 'Pinned Devnet PDA', value: '3FcpToU7bj4sLD687uecbesEjzjxBfqYn2EcBXJKPaCf' },
    ],
    properties: {
      category: 'elemental_reagent',
      files: [{ uri: '/tokens/essence.svg', type: 'image/svg+xml' }],
      creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
      extensions: {
        types: ['ConfidentialTransfers', 'MetadataPointer'],
        autoApproveNewAccounts: false,
      },
    },
  },
  'https://arweave.net/eM4k1_Matter_Alchm_Elemental_Proof_v2.json': {
    name: 'Matter',
    symbol: 'MATTER',
    description: 'Elemental Matter token of the Alchm protocol representing the Earth axis (Saturn / Coagulation). Governs structural stability, systematic execution, and JEPA latent persona discipline vectors.',
    image: '/tokens/matter.svg',
    external_url: 'https://alchmagents.com/metadata/matter.json',
    attributes: [
      { trait_type: 'Element', value: 'Earth' },
      { trait_type: 'Decimals', value: 4 },
      { trait_type: 'Soulbound', value: 'Non-Transferable' },
      { trait_type: 'BurnAuthority', value: 'Permissioned' },
      { trait_type: 'Extension', value: 'NonTransferable' },
      { trait_type: 'Extension', value: 'MetadataPointer' },
      { trait_type: 'Transferability', value: 'Soulbound (Non-Transferable)' },
      { trait_type: 'Star Vault Anchor', value: 'star-vault' },
      { trait_type: 'Pinned Devnet PDA', value: '7naJZozLrknDF3dguAdEWn7Z4MviUkXitjhaAt57Vkb4' },
    ],
    properties: {
      category: 'credential',
      files: [{ uri: '/tokens/matter.svg', type: 'image/svg+xml' }],
      creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
      extensions: {
        types: ['NonTransferable', 'MetadataPointer'],
        soulbound: true,
      },
    },
  },
  'https://arweave.net/aL9p4_Substance_Alchm_Elemental_Proof_v2.json': {
    name: 'Substance',
    symbol: 'SUBSTANCE',
    description: 'Elemental Substance token of the Alchm protocol representing the Air axis (Mercury / Sublimation). Governs dialectic agility, intellectual framing, and JEPA latent persona reasoning vectors.',
    image: '/tokens/substance.svg',
    external_url: 'https://alchmagents.com/metadata/substance.json',
    attributes: [
      { trait_type: 'Element', value: 'Air' },
      { trait_type: 'Decimals', value: 4 },
      { trait_type: 'Soulbound', value: 'Non-Transferable' },
      { trait_type: 'BurnAuthority', value: 'Permissioned' },
      { trait_type: 'Extension', value: 'PermanentDelegate' },
      { trait_type: 'Extension', value: 'InterestBearingConfig' },
      { trait_type: 'Extension', value: 'MetadataPointer' },
      { trait_type: 'Base APY', value: '18.2%' },
      { trait_type: 'Rate Basis Points', value: 1820 },
      { trait_type: 'State Reconciliation Engine', value: 'SpacetimeDB Cloud (cookingwithcastrollc)' },
      { trait_type: 'Pinned Devnet PDA', value: '6RY6ZG1eJQ2uEvpyA6XK74WyF1MpTYbw97hdhELqDUsa' },
    ],
    properties: {
      category: 'matrix',
      files: [{ uri: '/tokens/substance.svg', type: 'image/svg+xml' }],
      creators: [{ address: 'AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5', share: 100 }],
      extensions: {
        types: ['PermanentDelegate', 'InterestBearingConfig', 'MetadataPointer'],
        rateBasisPoints: 1820,
      },
    },
  },
};

// Aliases for backward compatibility
const SYMBOL_ALIASES: Record<string, string> = {
  IGNIS: 'SPIRIT',
  AQUA: 'ESSENCE',
  TERRA: 'MATTER',
  AETH: 'SUBSTANCE',
  AETHER: 'SUBSTANCE',
};

/**
 * Helper to retrieve manifest by symbol or URI
 */
export function getManifestBySymbolOrUri(key: string): ArweaveMetadataManifest | undefined {
  if (ARWEAVE_ELEMENTAL_MANIFESTS[key]) {
    return ARWEAVE_ELEMENTAL_MANIFESTS[key];
  }
  let upper = key.toUpperCase();
  if (SYMBOL_ALIASES[upper]) {
    upper = SYMBOL_ALIASES[upper];
  }
  return Object.values(ARWEAVE_ELEMENTAL_MANIFESTS).find(
    (m) =>
      m.symbol.toUpperCase() === upper ||
      m.name.toUpperCase() === upper ||
      m.name.toUpperCase().includes(upper)
  );
}
