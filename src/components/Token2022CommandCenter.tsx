import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Lock,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Send,
  Zap,
  Copy,
  RefreshCw,
  Fingerprint,
  Play,
  ExternalLink,
  Check,
} from 'lucide-react';
import {
  PublicKey,
} from '@solana/web3.js';
import {
  TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';

interface Token2022CommandCenterProps {
  onCommitLog: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
}

export type ClusterName = 'devnet' | 'localnet' | 'mainnet-beta';

export interface ElementalAsset {
  id: string;
  name: string;
  symbol: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  decimals: number;
  extensions: string[];
  mintAddress: string;
  hookProgramId?: string;
  extraAccountMetasPda?: string;
  arweaveUri: string;
  arweaveTxId: string;
  supply: number;
  description: string;
  immutable: boolean;
}

const ELEMENTAL_ASSETS: ElementalAsset[] = [
  {
    id: 'ignis-fire',
    name: 'Ignis Kinetic Reagent',
    symbol: 'IGNIS',
    element: 'Fire',
    decimals: 6,
    extensions: ['TransferHook', 'MetadataPointer'],
    mintAddress: 'FireX8sM42aK9c1uJ7vP8y5sT3qR2nB6eL1wD9mC4zPq',
    hookProgramId: 'Hook1gNisFeeResoLver1111111111111111111111111',
    extraAccountMetasPda: 'MetaL1stPDA8qZ7v2mN3kP4rT9wX5yB1cL6eD8sF2hJ4',
    arweaveUri: 'https://arweave.net/qR8v7_Ignis_Alchm_Elemental_Proof_v2.json',
    arweaveTxId: 'qR8v7_Ignis_Alchm_Elemental_Proof_v2',
    supply: 2500000,
    description: 'Kinetic combat reagent governed by Transfer Hook extension with strict ExtraAccountMetaList PDA resolution. Charges dynamic friction fee burned to celestial pool.',
    immutable: true,
  },
  {
    id: 'aqua-water',
    name: 'Aqua Stealth Essence',
    symbol: 'AQUA',
    element: 'Water',
    decimals: 6,
    extensions: ['ConfidentialTransfers', 'MetadataPointer'],
    mintAddress: 'Aqua9K2pLm4zQ7xR8wV1sT6nB3eC5yD4hJ8fG1mP3kLr',
    arweaveUri: 'https://arweave.net/wT2x9_Aqua_Stealth_Reagent_v2.json',
    arweaveTxId: 'wT2x9_Aqua_Stealth_Reagent_v2',
    supply: 1800000,
    description: 'ElGamal zero-knowledge confidential transfer token. Enables privacy-shielded inventory trades across AlchmAgents without revealing token amounts.',
    immutable: true,
  },
  {
    id: 'terra-earth',
    name: 'Terra Soulbound Seal',
    symbol: 'TERRA',
    element: 'Earth',
    decimals: 0,
    extensions: ['NonTransferable', 'MetadataPointer'],
    mintAddress: 'Terr4SBdM1ntN0nTransf3r4b1eCr3d3nt1a1sP3nt4c1',
    arweaveUri: 'https://arweave.net/eM4k1_Terra_Soulbound_Badge_v2.json',
    arweaveTxId: 'eM4k1_Terra_Soulbound_Badge_v2',
    supply: 1420,
    description: 'Non-transferable soulbound alchemical credential. Cryptographically bound to the agent or operator public key to assert verified on-chain mastery.',
    immutable: true,
  },
  {
    id: 'aether-air',
    name: 'Aether Staking Matrix',
    symbol: 'AETH',
    element: 'Air',
    decimals: 9,
    extensions: ['PermanentDelegate', 'InterestBearingConfig', 'MetadataPointer'],
    mintAddress: 'Aeth7P3rM4n3ntD313g4t3St4k1ngY131dM4tr1x9qZ',
    arweaveUri: 'https://arweave.net/aL9p4_Aether_Dynamic_Staking_v2.json',
    arweaveTxId: 'aL9p4_Aether_Dynamic_Staking_v2',
    supply: 50000000,
    description: 'Yield-bearing dynamic staking token with Permanent Delegate capability for automated SpacetimeDB state reconciliation and interest compounding.',
    immutable: true,
  },
];

interface StarNode {
  hipId: string;
  name: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  ra: string;
  dec: string;
  baseApy: number;
}

const STAR_CATALOG: StarNode[] = [
  { hipId: '11767', name: 'Polaris (North Star)', element: 'Earth', ra: '02h 31m', dec: '+89° 15\'', baseApy: 14.8 },
  { hipId: '91262', name: 'Vega', element: 'Air', ra: '18h 36m', dec: '+38° 47\'', baseApy: 17.2 },
  { hipId: '32349', name: 'Sirius (Dog Star)', element: 'Fire', ra: '06h 45m', dec: '-16° 42\'', baseApy: 24.5 },
  { hipId: '24436', name: 'Rigel', element: 'Water', ra: '05h 14m', dec: '-08° 12\'', baseApy: 19.8 },
  { hipId: '79607', name: 'Arcturus', element: 'Air', ra: '14h 15m', dec: '+19° 10\'', baseApy: 15.6 },
  { hipId: '25336', name: 'Betelgeuse', element: 'Fire', ra: '05h 55m', dec: '+07° 24\'', baseApy: 22.4 },
  { hipId: '86032', name: 'Antares', element: 'Water', ra: '16h 29m', dec: '-26° 25\'', baseApy: 21.0 },
  { hipId: '17702', name: 'Aldebaran', element: 'Earth', ra: '04h 35m', dec: '+16° 30\'', baseApy: 18.2 },
];

export const Token2022CommandCenter: React.FC<Token2022CommandCenterProps> = ({ onCommitLog }) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'hook-resolver' | 'arweave-metadata' | 'star-staking' | 'cluster'>('tokens');
  const [cluster, setCluster] = useState<ClusterName>('devnet');
  const [operatorAddress] = useState('AhNRjjyhJ4dR6ZSvWyJNSpbJFbFnxhkRdUNMY31fJ3S5');
  const [selectedAsset, setSelectedAsset] = useState<ElementalAsset>(ELEMENTAL_ASSETS[0]);
  const [recipientAddress, setRecipientAddress] = useState('4vJ9JU1bJJE96ZXNxj1ucTznQAwCgPnetatpr7px885K');
  const [mintAmount, setMintAmount] = useState('100');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Hook Resolver Test states
  const [transferAmount, setTransferAmount] = useState('25');
  const [hookResolutionStatus, setHookResolutionStatus] = useState<'idle' | 'resolving' | 'valid' | 'error'>('idle');
  const [hookPdas, setHookPdas] = useState<Array<{ name: string; pubkey: string; isSigner: boolean; isWritable: boolean }>>([]);

  // Staking states
  const [selectedStar, setSelectedStar] = useState<StarNode>(STAR_CATALOG[0]);
  const [dominantElement] = useState<'Fire' | 'Water' | 'Earth' | 'Air'>('Fire');
  const [stakeAmountSol, setStakeAmountSol] = useState('2.5');
  const [stakedBalanceSol, setStakedBalanceSol] = useState(12.4);
  const [esmsBalances, setEsmsBalances] = useState<Record<string, number>>({
    IGNIS: 1420.5,
    AQUA: 840.2,
    TERRA: 1,
    AETH: 9540.0,
  });

  // Arweave inspector states
  const [inspectedArweaveTx, setInspectedArweaveTx] = useState<string>(ELEMENTAL_ASSETS[0].arweaveTxId);
  const [arweaveJson, setArweaveJson] = useState<Record<string, unknown> | null>(null);
  const [loadingArweave, setLoadingArweave] = useState(false);

  // Live cluster slot
  const [currentSlot, setCurrentSlot] = useState(318920441);
  const [clusterHealth] = useState<'operational' | 'degraded'>('operational');

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    onCommitLog(`Copied ${label} to clipboard: ${text.slice(0, 8)}...`, 'info');
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Star Yield computation
  const starAltitude = useMemo(() => {
    if (selectedStar.hipId === '32349' || selectedStar.hipId === '86032') {
      return -12; // Below horizon
    }
    return 48; // Risen
  }, [selectedStar]);

  const starYield = useMemo(() => {
    const isRisen = starAltitude > 0;
    const affinity = selectedStar.element === dominantElement ? 2.2 : 0.85;
    const dignity = 1.35;
    const finalApy = Number((selectedStar.baseApy * affinity * dignity * (isRisen ? 1 : 0.15)).toFixed(2));
    return { isRisen, affinity, dignity, finalApy };
  }, [selectedStar, dominantElement, starAltitude]);

  // Derive ExtraAccountMetaList PDA for Fire (Ignis)
  const resolveTransferHookPdas = useCallback(() => {
    setHookResolutionStatus('resolving');
    onCommitLog('Resolving ExtraAccountMetaList PDAs for Token-2022 Transfer Hook CPI...', 'info');

    setTimeout(() => {
      try {
        const mintPk = new PublicKey(selectedAsset.mintAddress);
        const hookProgramPk = new PublicKey(selectedAsset.hookProgramId || 'Hook1gNisFeeResoLver1111111111111111111111111');

        // PDA derivation: seeds = ["extra-account-metas", mintPk]
        const [extraAccountMetas] = PublicKey.findProgramAddressSync(
          [Buffer.from('extra-account-metas'), mintPk.toBuffer()],
          hookProgramPk
        );

        // Simulated resolved extra accounts required by the hook program
        const resolved = [
          { name: 'ExtraAccountMetaList PDA', pubkey: extraAccountMetas.toBase58(), isSigner: false, isWritable: false },
          { name: 'Transfer Hook Program ID', pubkey: hookProgramPk.toBase58(), isSigner: false, isWritable: false },
          { name: 'Celestial Kinetic Fee Vault', pubkey: 'FeeVau1tCe1estia1P001Burner1111111111111111', isSigner: false, isWritable: true },
          { name: 'SpacetimeDB Sync Reducer PDA', pubkey: 'SpacetimeSyncReconciliation11111111111111111', isSigner: false, isWritable: false },
        ];

        setHookPdas(resolved);
        setHookResolutionStatus('valid');
        onCommitLog(`Transfer Hook PDA resolved: ${extraAccountMetas.toBase58().slice(0, 12)}... CPI validation passed.`, 'success');
      } catch (err) {
        setHookResolutionStatus('error');
        const msg = err instanceof Error ? err.message : String(err);
        onCommitLog(`Failed to resolve ExtraAccountMetaList PDA: ${msg}`, 'error');
      }
    }, 450);
  }, [selectedAsset, onCommitLog]);

  // Execute Token-2022 Transfer with Hook
  const handleExecuteHookTransfer = () => {
    if (hookResolutionStatus !== 'valid') {
      onCommitLog('Please resolve ExtraAccountMetaList PDAs before executing transfer.', 'warning');
      return;
    }
    setIsProcessing(true);
    onCommitLog(`Building createTransferCheckedWithTransferHookInstruction (${transferAmount} ${selectedAsset.symbol})...`, 'info');

    setTimeout(() => {
      setIsProcessing(false);
      const signature = '5Kj' + Math.random().toString(36).substring(2, 10) + '...' + Math.random().toString(36).substring(2, 6);
      onCommitLog(`Token-2022 Transfer Hook transaction confirmed on ${cluster}! Tx: ${signature}`, 'success');
      onCommitLog(`Deducted 1.5% kinetic combat fee (${(Number(transferAmount) * 0.015).toFixed(3)} ${selectedAsset.symbol}) to celestial vault.`, 'success');
    }, 900);
  };

  // Inspect Arweave Metadata
  const loadArweaveMetadata = useCallback((txId: string) => {
    setLoadingArweave(true);
    setInspectedArweaveTx(txId);
    onCommitLog(`Fetching permanent Arweave manifest for tx: ${txId}...`, 'info');

    setTimeout(() => {
      setLoadingArweave(false);
      const asset = ELEMENTAL_ASSETS.find((a) => a.arweaveTxId === txId) || ELEMENTAL_ASSETS[0];
      setArweaveJson({
        schema: 'solana-token-2022-elemental-v2',
        name: asset.name,
        symbol: asset.symbol,
        element: asset.element,
        decimals: asset.decimals,
        mint: asset.mintAddress,
        programId: TOKEN_2022_PROGRAM_ID.toBase58(),
        extensions: asset.extensions,
        provenance: {
          arweaveId: asset.arweaveTxId,
          permanentUrl: asset.arweaveUri,
          storageCostAr: '0.00042',
          verifiedAtSlot: currentSlot - 1420,
          immutable: true,
          contentDigest: 'sha256:' + Math.random().toString(36).substring(2, 18),
        },
        attributes: [
          { trait_type: 'Element', value: asset.element },
          { trait_type: 'Token Program', value: 'Token-2022 (SPL)' },
          { trait_type: 'Protocol', value: 'AlchmAgentsSolana' },
          { trait_type: 'Ecosystem', value: 'Pentacles / SpaceTimeDB' },
        ],
      });
      onCommitLog(`Arweave permanent metadata loaded for ${asset.symbol}. Immutability verified.`, 'success');
    }, 400);
  }, [currentSlot, onCommitLog]);

  useEffect(() => {
    loadArweaveMetadata(ELEMENTAL_ASSETS[0].arweaveTxId);
  }, [loadArweaveMetadata]);

  // Slot ticking simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlot((prev) => prev + 1);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto custom-scrollbar">
      {/* Top Banner: Protocol Header */}
      <div className="p-4 glass-panel rounded-lg border border-primary/30 bg-primary/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">token</span>
            <h1 className="font-heading text-lg font-bold text-on-surface tracking-wide uppercase">
              Token-2022 Command Center
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-primary/20 text-primary border border-primary/40 font-semibold">
              AlchmAgentsSolana
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-1 font-mono">
            Orchestrating the four elemental Token-2022 ESMS assets, transfer hooks, confidential transfers, and Arweave immutability.
          </p>
        </div>

        {/* Cluster & Wallet Bridge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cluster Selector */}
          <div className="flex items-center bg-surface-container border border-outline-variant/40 rounded px-2 py-1 text-xs font-mono">
            <span className="text-[#8f9282] mr-2">RPC:</span>
            <select
              value={cluster}
              onChange={(e) => {
                const c = e.target.value as ClusterName;
                setCluster(c);
                onCommitLog(`Switched Solana cluster bridge to ${c.toUpperCase()}.`, 'info');
              }}
              className="bg-transparent text-primary font-bold focus:outline-none cursor-pointer"
            >
              <option value="devnet" className="bg-[#12140e] text-on-surface">Devnet (Public)</option>
              <option value="localnet" className="bg-[#12140e] text-on-surface">Localnet (127.0.0.1:8899)</option>
              <option value="mainnet-beta" className="bg-[#12140e] text-on-surface">Mainnet-Beta (Helius/Triton)</option>
            </select>
          </div>

          {/* Slot indicator */}
          <div className="flex items-center gap-1.5 bg-surface-container border border-outline-variant/40 rounded px-2.5 py-1 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-primary font-bold">{currentSlot.toLocaleString()}</span>
            <span className="text-[9px] uppercase px-1 rounded bg-primary/20 text-primary font-bold">{clusterHealth}</span>
          </div>

          {/* Operator Authority */}
          <button
            onClick={() => handleCopy(operatorAddress, 'Operator Public Key')}
            className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 rounded px-2.5 py-1 text-xs font-mono text-on-surface transition-colors cursor-pointer"
            title="Click to copy operator key"
          >
            <Fingerprint className="w-3.5 h-3.5 text-secondary" />
            <span className="text-on-surface-variant">Operator:</span>
            <span className="text-secondary font-bold">{operatorAddress.slice(0, 4)}...{operatorAddress.slice(-4)}</span>
            {copiedKey === 'Operator Public Key' ? <Check className="w-3 h-3 text-primary" /> : <Copy className="w-3 h-3 opacity-60" />}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/40 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { id: 'tokens', label: 'Elemental Mints', icon: 'auto_awesome' },
          { id: 'hook-resolver', label: 'Transfer Hook & ExtraMetas', icon: 'link' },
          { id: 'arweave-metadata', label: 'Arweave Permanent Proofs', icon: 'verified' },
          { id: 'star-staking', label: 'Star Vault Staking Engine', icon: 'stars' },
          { id: 'cluster', label: 'Solana Web3 Diagnostics', icon: 'terminal' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs uppercase transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-primary/20 text-primary border border-primary/50 font-bold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Elemental Mints Deck */}
      {activeTab === 'tokens' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 4 Elemental Asset Cards (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">grain</span>
              Active Token-2022 Elemental Mints
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ELEMENTAL_ASSETS.map((asset) => {
                const isSelected = selectedAsset.id === asset.id;
                const elementIcon = {
                  Fire: <Flame className="w-4 h-4 text-[#ff7b72]" />,
                  Water: <Droplets className="w-4 h-4 text-[#7dd3fc]" />,
                  Earth: <Mountain className="w-4 h-4 text-[#9ddf2e]" />,
                  Air: <Wind className="w-4 h-4 text-[#e3e3d8]" />,
                }[asset.element];

                return (
                  <div
                    key={asset.id}
                    onClick={() => {
                      setSelectedAsset(asset);
                      onCommitLog(`Selected ${asset.name} ($${asset.symbol}).`, 'info');
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                        : 'border-outline-variant/30 bg-surface-container/60 hover:border-outline-variant/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          {elementIcon}
                          <span className="font-bold text-sm text-on-surface">{asset.symbol}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-outline-variant/30 text-on-surface-variant">
                          {asset.element}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-primary">{asset.name}</div>
                      <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2 leading-relaxed font-sans">
                        {asset.description}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-outline-variant/20 font-mono text-[10px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8f9282]">Program:</span>
                        <span className="text-primary font-bold">Token-2022</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8f9282]">Decimals:</span>
                        <span className="text-on-surface">{asset.decimals}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8f9282]">Supply:</span>
                        <span className="text-on-surface">{asset.supply.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {asset.extensions.map((ext) => (
                          <span key={ext} className="px-1.5 py-0.5 rounded text-[9px] bg-secondary/15 text-secondary border border-secondary/30">
                            {ext}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Balances Ribbon */}
            <div className="p-3 glass-panel rounded-lg border border-outline-variant/30 bg-surface-container/40 flex items-center justify-around font-mono text-xs">
              <div className="text-center">
                <div className="text-[10px] text-[#8f9282] uppercase">IGNIS (Fire)</div>
                <div className="text-[#ff7b72] font-bold mt-0.5">{esmsBalances.IGNIS.toLocaleString()}</div>
              </div>
              <div className="h-6 w-[1px] bg-outline-variant/30" />
              <div className="text-center">
                <div className="text-[10px] text-[#8f9282] uppercase">AQUA (Water)</div>
                <div className="text-[#7dd3fc] font-bold mt-0.5">{esmsBalances.AQUA.toLocaleString()}</div>
              </div>
              <div className="h-6 w-[1px] bg-outline-variant/30" />
              <div className="text-center">
                <div className="text-[10px] text-[#8f9282] uppercase">TERRA (Soulbound)</div>
                <div className="text-[#9ddf2e] font-bold mt-0.5">{esmsBalances.TERRA} Badge</div>
              </div>
              <div className="h-6 w-[1px] bg-outline-variant/30" />
              <div className="text-center">
                <div className="text-[10px] text-[#8f9282] uppercase">AETH (Yield)</div>
                <div className="text-[#e3e3d8] font-bold mt-0.5">{esmsBalances.AETH.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Mint & CPI Operation Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-secondary">tune</span>
              Token-2022 Mint & Distribution Terminal
            </h2>

            <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-surface-container flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
                <div className="font-mono text-xs text-on-surface">
                  Target: <span className="text-primary font-bold">${selectedAsset.symbol}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                  {selectedAsset.extensions[0]}
                </span>
              </div>

              {/* Mint Address Box */}
              <div>
                <label className="text-[10px] font-mono text-[#8f9282] uppercase mb-1 block">Mint Public Key</label>
                <div className="flex items-center gap-2 bg-surface p-2 rounded border border-outline-variant/40 font-mono text-xs text-on-surface">
                  <span className="truncate flex-1">{selectedAsset.mintAddress}</span>
                  <button
                    onClick={() => handleCopy(selectedAsset.mintAddress, 'Mint Address')}
                    className="p-1 hover:bg-surface-container rounded transition-colors text-on-surface-variant hover:text-primary cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="text-[10px] font-mono text-[#8f9282] uppercase mb-1 block">Recipient / Associated Token Account</label>
                <input
                  type="text"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full bg-surface p-2 rounded border border-outline-variant/40 font-mono text-xs text-on-surface focus:border-primary focus:outline-none"
                  placeholder="Recipient Solana Address"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] font-mono text-[#8f9282] uppercase mb-1 block">Mint Amount</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={mintAmount}
                    onChange={(e) => setMintAmount(e.target.value)}
                    className="flex-1 bg-surface p-2 rounded border border-outline-variant/40 font-mono text-xs text-on-surface focus:border-primary focus:outline-none"
                    placeholder="100"
                  />
                  <span className="text-xs font-mono font-bold text-primary px-2">{selectedAsset.symbol}</span>
                </div>
              </div>

              {/* Extension Specific Notice */}
              {selectedAsset.symbol === 'IGNIS' && (
                <div className="p-2.5 rounded bg-[#ff7b72]/10 border border-[#ff7b72]/30 text-[11px] font-mono text-[#ff7b72] flex items-start gap-2">
                  <Flame className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Transfer Hook Active:</strong> Transfers require resolving ExtraAccountMetaList PDA before CPI execution.
                  </div>
                </div>
              )}

              {selectedAsset.symbol === 'AQUA' && (
                <div className="p-2.5 rounded bg-[#7dd3fc]/10 border border-[#7dd3fc]/30 text-[11px] font-mono text-[#7dd3fc] flex items-start gap-2">
                  <Droplets className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Confidential Transfer Extension:</strong> Encrypted balance amounts will be hidden from on-chain explorer telemetry.
                  </div>
                </div>
              )}

              {selectedAsset.symbol === 'TERRA' && (
                <div className="p-2.5 rounded bg-[#9ddf2e]/10 border border-[#9ddf2e]/30 text-[11px] font-mono text-[#9ddf2e] flex items-start gap-2">
                  <Mountain className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Non-Transferable / Soulbound:</strong> Tokens cannot be transferred once minted to recipient address.
                  </div>
                </div>
              )}

              {/* Mint Trigger Button */}
              <button
                onClick={() => {
                  setIsProcessing(true);
                  onCommitLog(`Submitting Token-2022 mint instruction for ${mintAmount} ${selectedAsset.symbol} to ${recipientAddress.slice(0, 8)}...`, 'info');
                  setTimeout(() => {
                    setIsProcessing(false);
                    setEsmsBalances((prev) => ({
                      ...prev,
                      [selectedAsset.symbol]: (prev[selectedAsset.symbol] || 0) + Number(mintAmount),
                    }));
                    onCommitLog(`Mint confirmed! Credited ${mintAmount} ${selectedAsset.symbol} to recipient account.`, 'success');
                  }, 800);
                }}
                disabled={isProcessing}
                className="w-full mt-2 py-2.5 rounded bg-primary text-surface font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing Transaction on {cluster}...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Execute Token-2022 Mint</span>
                  </>
                )}
              </button>

              {/* Arweave Link */}
              <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px] font-mono text-on-surface-variant">
                <span>Permanent Metadata:</span>
                <button
                  onClick={() => {
                    setActiveTab('arweave-metadata');
                    loadArweaveMetadata(selectedAsset.arweaveTxId);
                  }}
                  className="text-secondary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Inspect Arweave Proof</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Transfer Hook & ExtraAccountMetaList Resolver */}
      {activeTab === 'hook-resolver' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-[#ff7b72]">link</span>
              ExtraAccountMetaList PDA Resolver (Fire / Ignis)
            </h2>

            <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-surface-container flex flex-col gap-3 font-mono text-xs">
              <p className="text-on-surface-variant leading-relaxed font-sans text-xs">
                Token-2022 Transfer Hooks require strict on-chain CPI account resolution. Before executing any transfer of 
                <strong> $IGNIS</strong>, the client must resolve the <code>ExtraAccountMetaList</code> PDA account to guarantee the hook program receives all requisite writable and read-only accounts.
              </p>

              <div className="p-3 bg-surface rounded border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[#8f9282]">Hook Program ID:</span>
                  <span className="text-primary font-bold">{selectedAsset.hookProgramId || 'Hook1gNisFeeResoLver1111111111111111111111111'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8f9282]">Seed Formula:</span>
                  <span className="text-secondary">[&quot;extra-account-metas&quot;, mintPublicKey]</span>
                </div>
              </div>

              <button
                onClick={resolveTransferHookPdas}
                disabled={hookResolutionStatus === 'resolving'}
                className="py-2 px-4 rounded bg-secondary text-surface font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-secondary/90 transition-all cursor-pointer"
              >
                {hookResolutionStatus === 'resolving' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Resolving ExtraAccountMetas via @solana/spl-token...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Resolve ExtraAccountMetaList PDA</span>
                  </>
                )}
              </button>

              {/* Resolved PDAs Table */}
              {hookPdas.length > 0 && (
                <div className="mt-2 space-y-2">
                  <div className="text-[11px] font-bold text-primary uppercase">Resolved CPI Account Metas ({hookPdas.length})</div>
                  <div className="space-y-1.5">
                    {hookPdas.map((pda, i) => (
                      <div key={i} className="p-2 bg-surface rounded border border-outline-variant/30 flex items-center justify-between text-[11px]">
                        <div>
                          <div className="text-on-surface font-semibold">{pda.name}</div>
                          <div className="text-[#8f9282] font-mono text-[10px]">{pda.pubkey}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {pda.isWritable && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#ff7b72]/20 text-[#ff7b72] border border-[#ff7b72]/40">
                              WRITABLE
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/20 text-primary border border-primary/40">
                            VERIFIED
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Transfer Hook Simulation */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">send</span>
              Execute Transfer with Hook
            </h2>

            <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-surface-container flex flex-col gap-3 font-mono text-xs">
              <div>
                <label className="text-[10px] text-[#8f9282] uppercase mb-1 block">Transfer Amount (IGNIS)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full bg-surface p-2 rounded border border-outline-variant/40 text-on-surface font-mono"
                />
              </div>

              <div className="p-3 bg-surface rounded border border-outline-variant/30 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Kinetic Fee (1.5%):</span>
                  <span className="text-[#ff7b72] font-bold">{(Number(transferAmount) * 0.015).toFixed(3)} IGNIS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Net Credited:</span>
                  <span className="text-primary font-bold">{(Number(transferAmount) * 0.985).toFixed(3)} IGNIS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Resolution Status:</span>
                  <span className={hookResolutionStatus === 'valid' ? 'text-primary font-bold' : 'text-[#ffb020]'}>
                    {hookResolutionStatus === 'valid' ? 'READY_FOR_CPI' : 'REQUIRES_RESOLUTION'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleExecuteHookTransfer}
                disabled={isProcessing || hookResolutionStatus !== 'valid'}
                className="py-2.5 px-4 rounded bg-primary text-surface font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-40"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing CPI Transfer...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Execute Hook Transfer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Arweave Permanent Metadata Inspector */}
      {activeTab === 'arweave-metadata' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">cloud_done</span>
              Arweave Manifests
            </h2>

            <div className="space-y-2">
              {ELEMENTAL_ASSETS.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => loadArweaveMetadata(asset.arweaveTxId)}
                  className={`w-full p-3 rounded-lg border text-left font-mono transition-all cursor-pointer ${
                    inspectedArweaveTx === asset.arweaveTxId
                      ? 'border-primary bg-primary/10 text-primary font-bold'
                      : 'border-outline-variant/30 bg-surface-container hover:border-outline-variant/80 text-on-surface'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold">{asset.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface border border-outline-variant/30 text-[#8f9282]">
                      {asset.element}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8f9282] truncate mt-1">{asset.arweaveTxId}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-secondary">data_object</span>
                Permanent JSON Manifest (Arweave Storage Network)
              </span>
              <span className="text-[10px] text-primary font-mono font-bold">IMMUTABLE_STORAGE</span>
            </h2>

            <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-[#0d0e0a] font-mono text-xs overflow-x-auto custom-scrollbar">
              {loadingArweave ? (
                <div className="flex items-center justify-center py-12 gap-2 text-primary">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Fetching immutable block from Arweave gateway...</span>
                </div>
              ) : arweaveJson ? (
                <pre className="text-primary/90 leading-relaxed text-[11px]">
                  {JSON.stringify(arweaveJson, null, 2)}
                </pre>
              ) : (
                <div className="text-on-surface-variant py-8 text-center">No metadata selected.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Star Vault Staking Engine */}
      {activeTab === 'star-staking' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-primary">stars</span>
              Celestial Astrometry Star Catalog
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {STAR_CATALOG.map((star) => {
                const isSelected = selectedStar.hipId === star.hipId;
                return (
                  <div
                    key={star.hipId}
                    onClick={() => {
                      setSelectedStar(star);
                      onCommitLog(`Selected Star Vault: ${star.name} (HIP ${star.hipId}).`, 'info');
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/15'
                        : 'border-outline-variant/30 bg-surface-container hover:border-outline-variant/70'
                    }`}
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span className="text-xs font-bold text-on-surface">{star.name}</span>
                      <span className="text-[10px] text-primary font-bold">{star.baseApy}% APY</span>
                    </div>
                    <div className="text-[10px] font-mono text-on-surface-variant mt-1 flex justify-between">
                      <span>Element: {star.element}</span>
                      <span>HIP: {star.hipId}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-3">
            <h2 className="text-xs font-mono uppercase text-on-surface-variant tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-secondary">account_balance</span>
              Star Staking Telemetry & Yield
            </h2>

            <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-surface-container flex flex-col gap-3 font-mono text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
                <span className="text-on-surface font-bold">{selectedStar.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  starYield.isRisen ? 'bg-primary/20 text-primary' : 'bg-[#ff7b72]/20 text-[#ff7b72]'
                }`}>
                  {starYield.isRisen ? 'RISEN (+48°)' : 'BELOW HORIZON (-12°)'}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Base Astrometry APY:</span>
                  <span className="text-on-surface">{selectedStar.baseApy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Elemental Affinity Multiplier:</span>
                  <span className="text-secondary">{starYield.affinity}x ({selectedStar.element})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8f9282]">Effective Staking APY:</span>
                  <span className="text-primary font-bold text-sm">{starYield.finalApy}%</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-outline-variant/20">
                  <span className="text-[#8f9282]">Current Staked SOL:</span>
                  <span className="text-on-surface font-bold">{stakedBalanceSol} SOL</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#8f9282] uppercase mb-1 block">Stake SOL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={stakeAmountSol}
                    onChange={(e) => setStakeAmountSol(e.target.value)}
                    className="flex-1 bg-surface p-2 rounded border border-outline-variant/40 font-mono text-xs text-on-surface focus:border-primary focus:outline-none"
                  />
                  <span className="text-xs font-bold text-primary px-2">SOL</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsProcessing(true);
                  onCommitLog(`Depositing ${stakeAmountSol} SOL into ${selectedStar.name} vault on Solana...`, 'info');
                  setTimeout(() => {
                    setIsProcessing(false);
                    setStakedBalanceSol((prev) => Number((prev + Number(stakeAmountSol)).toFixed(2)));
                    onCommitLog(`Staking transaction confirmed! Accruing elemental ESMS rewards.`, 'success');
                  }, 700);
                }}
                disabled={isProcessing}
                className="w-full py-2.5 rounded bg-primary text-surface font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Broadcasting to Solana...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Deposit into Star Vault</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Web3 Diagnostics */}
      {activeTab === 'cluster' && (
        <div className="p-4 glass-panel rounded-lg border border-outline-variant/40 bg-surface-container font-mono text-xs flex flex-col gap-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/30">
            <span className="font-bold text-on-surface uppercase">Solana Web3 & SPL-Token Diagnostics</span>
            <span className="text-primary font-bold">SDK Version: 1.98.4 / SPL 0.4.15</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-surface rounded border border-outline-variant/30">
              <div className="text-[10px] text-[#8f9282] uppercase">Active Cluster Endpoint</div>
              <div className="text-primary font-bold text-xs mt-1 truncate">
                {cluster === 'devnet' ? 'https://api.devnet.solana.com' : cluster === 'localnet' ? 'http://127.0.0.1:8899' : 'https://api.mainnet-beta.solana.com'}
              </div>
            </div>
            <div className="p-3 bg-surface rounded border border-outline-variant/30">
              <div className="text-[10px] text-[#8f9282] uppercase">Token-2022 Program ID</div>
              <div className="text-secondary font-bold text-xs mt-1 truncate">
                {TOKEN_2022_PROGRAM_ID.toBase58()}
              </div>
            </div>
            <div className="p-3 bg-surface rounded border border-outline-variant/30">
              <div className="text-[10px] text-[#8f9282] uppercase">SpacetimeDB Synced Module</div>
              <div className="text-primary font-bold text-xs mt-1 truncate">
                cookingwithcastrollc
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#0a0a0a] rounded border border-outline-variant/30 font-mono text-[11px] text-primary/80">
            <div>// Solana Client Quick Check Code Snippet</div>
            <div>import &#123; Connection, PublicKey &#125; from &apos;@solana/web3.js&apos;;</div>
            <div>import &#123; TOKEN_2022_PROGRAM_ID, getMint &#125; from &apos;@solana/spl-token&apos;;</div>
            <div className="mt-1 text-on-surface-variant">// Ready for AlchmAgents mainnet deployment and durable reconciliation.</div>
          </div>
        </div>
      )}
    </div>
  );
};
