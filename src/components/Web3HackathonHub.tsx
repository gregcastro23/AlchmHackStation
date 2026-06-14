import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Coins,
  ShieldCheck,
  Compass,
  Database,
  Globe,
  Lock,
  ArrowRight,
  Flame,
  Droplets,
  Wind,
  Mountain,
  Send,
  Zap,
  Activity,
  Copy,
  RefreshCw,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Play
} from 'lucide-react';

interface Web3HackathonHubProps {
  onCommitLog: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
}

// 1. Star Catalog
interface StarNode {
  hipId: string;
  name: string;
  element: 'Fire' | 'Water' | 'Earth' | 'Air';
  ra: string;
  dec: string;
  baseApy: number;
}

const STAR_CATALOG: StarNode[] = [
  { hipId: '11767', name: 'Polaris (North Star)', element: 'Earth', ra: '02h 31m', dec: '+89° 15\'', baseApy: 12.4 },
  { hipId: '91262', name: 'Vega', element: 'Air', ra: '18h 36m', dec: '+38° 47\'', baseApy: 15.8 },
  { hipId: '32349', name: 'Sirius (Dog Star)', element: 'Fire', ra: '06h 45m', dec: '-16° 42\'', baseApy: 22.1 },
  { hipId: '24436', name: 'Rigel', element: 'Water', ra: '05h 14m', dec: '-08° 12\'', baseApy: 18.5 },
  { hipId: '79607', name: 'Arcturus', element: 'Air', ra: '14h 15m', dec: '+19° 10\'', baseApy: 14.2 },
  { hipId: '25336', name: 'Betelgeuse', element: 'Fire', ra: '05h 55m', dec: '+07° 24\'', baseApy: 20.6 },
  { hipId: '86032', name: 'Antares', element: 'Water', ra: '16h 29m', dec: '-26° 25\'', baseApy: 19.3 },
  { hipId: '17702', name: 'Aldebaran', element: 'Earth', ra: '04h 35m', dec: '+16° 30\'', baseApy: 16.5 }
];

// 2. ENS Agents
interface EnsAgent {
  name: string;
  subname: string;
  address: string;
  endpoint: string;
  wallet: string;
  memoryBlob: string;
  humanVerified: boolean;
}

const INITIAL_AGENTS: EnsAgent[] = [
  {
    name: 'Plato',
    subname: 'plato.alchmagents.eth',
    address: '0x3600ab818fd65ef60d5b293f77a8004a818c2007',
    endpoint: 'https://api.alchm.kitchen/a2a/plato',
    wallet: 'eip155:5042002:0x3600ab818fd65ef60d5b293f77a8004a818c2007',
    memoryBlob: '0x9f3da81a5c6e87f2e1a3b8cd5932ef6e12e8b21c43a0d9b8ed8ca06ddb52f821',
    humanVerified: true
  },
  {
    name: 'Cleopatra',
    subname: 'cleopatra.alchmagents.eth',
    address: '0x7dd3fc81a5c6e87f2e1a3b8cd5932ef6e12e8b21c',
    endpoint: 'https://api.alchm.kitchen/a2a/cleopatra',
    wallet: 'eip155:5042002:0x7dd3fc81a5c6e87f2e1a3b8cd5932ef6e12e8b21c',
    memoryBlob: '0x3a0d9b8ed8ca06ddb52f821c9f3da81a5c6e87f2e1a3b8cd5932ef6e12e8b21c',
    humanVerified: false
  },
  {
    name: 'Newton',
    subname: 'newton.alchmagents.eth',
    address: '0xffb020a1a5c6e87f2e1a3b8cd5932ef6e12e8b21c',
    endpoint: 'https://api.alchm.kitchen/a2a/newton',
    wallet: 'eip155:5042002:0xffb020a1a5c6e87f2e1a3b8cd5932ef6e12e8b21c',
    memoryBlob: '0x5932ef6e12e8b21c43a0d9b8ed8ca06ddb52f821c9f3da81a5c6e87f2e1a3b8c',
    humanVerified: false
  }
];

// 3. BigQuery Leaderboard
interface BigQueryAgent {
  rank: number;
  subname: string;
  trustScore: number;
  txsCount: number;
  volumeUsdc: number;
  lastActiveBlock: number;
}

const BQ_LEADERBOARD: BigQueryAgent[] = [
  { rank: 1, subname: 'plato.alchmagents.eth', trustScore: 98, txsCount: 184, volumeUsdc: 24500, lastActiveBlock: 788291 },
  { rank: 2, subname: 'cleopatra.alchmagents.eth', trustScore: 89, txsCount: 92, volumeUsdc: 12100, lastActiveBlock: 788280 },
  { rank: 3, subname: 'tesla.alchmagents.eth', trustScore: 85, txsCount: 61, volumeUsdc: 8400, lastActiveBlock: 788265 },
  { rank: 4, subname: 'buddha.alchmagents.eth', trustScore: 82, txsCount: 45, volumeUsdc: 6900, lastActiveBlock: 788250 },
  { rank: 5, subname: 'newton.alchmagents.eth', trustScore: 78, txsCount: 38, volumeUsdc: 4200, lastActiveBlock: 788211 }
];

export const Web3HackathonHub: React.FC<Web3HackathonHubProps> = ({ onCommitLog }) => {
  const [activePanel, setActivePanel] = useState<'vaults' | 'ens' | 'a2a' | 'walrus' | 'leaderboard' | 'onramp'>('vaults');

  // --- Star Vault Staking States ---
  const [selectedStar, setSelectedStar] = useState<StarNode>(STAR_CATALOG[0]);
  const [dominantElement, setDominantElement] = useState<'Fire' | 'Water' | 'Earth' | 'Air'>('Earth');
  const [stakeAmount, setStakeAmount] = useState<string>('100');
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [stakedBalance, setStakedBalance] = useState<Record<string, number>>({
    '11767': 250, // Polaris
    '91262': 0
  });
  const [esmsRewards, setEsmsRewards] = useState<Record<string, number>>({
    Fire: 1.254,
    Water: 0.812,
    Earth: 3.421,
    Air: 0.124
  });
  const [stakingTxHistory, setStakingTxHistory] = useState<Array<{ txHash: string; type: string; details: string; block: number }>>([
    { txHash: '0x7e83...9d02', type: 'Stake', details: 'Staked 250 USDC into Polaris Vault', block: 788102 },
    { txHash: '0xa4c1...3fa2', type: 'Claim', details: 'Claimed 1.421 Earth ESMS Essence', block: 788214 }
  ]);

  // Star Yield computation
  const starAltitude = useMemo(() => {
    // Dynamic altitude check simulation
    if (selectedStar.hipId === '32349' || selectedStar.hipId === '86032') {
      return -15; // Set Sirius and Antares below horizon
    }
    return 42; // Risen above horizon
  }, [selectedStar]);

  const multipliers = useMemo(() => {
    const isRisen = starAltitude > 0;
    const affinity = selectedStar.element === dominantElement ? 2.5 : 0.8;
    const skyDominance = selectedStar.element === 'Fire' || selectedStar.element === 'Earth' ? 1.4 : 0.9;
    const dignity = 1.2;
    const finalApy = Number((selectedStar.baseApy * affinity * skyDominance * dignity * (isRisen ? 1 : 0)).toFixed(2));
    return {
      isRisen,
      affinity,
      skyDominance,
      dignity,
      finalApy
    };
  }, [selectedStar, dominantElement, starAltitude]);

  const handleStake = () => {
    const amount = Number(stakeAmount);
    if (isNaN(amount) || amount <= 0) {
      onCommitLog('Please enter a valid USDC staking amount.', 'warning');
      return;
    }
    setIsStaking(true);
    onCommitLog(`Broadcasting stake parameters to Circle Arc: Star ID ${selectedStar.hipId}, Amount: ${amount} USDC.`, 'info');

    setTimeout(() => {
      setStakedBalance((prev) => ({
        ...prev,
        [selectedStar.hipId]: (prev[selectedStar.hipId] || 0) + amount
      }));
      const txHash = `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const newTx = {
        txHash: `${txHash.substring(0, 6)}...${txHash.substring(36)}`,
        type: 'Stake',
        details: `Staked ${amount} USDC into ${selectedStar.name} Vault`,
        block: 788291
      };
      setStakingTxHistory((prev) => [newTx, ...prev]);
      setIsStaking(false);
      onCommitLog(`Tx Successful: Staked ${amount} USDC in ${selectedStar.name} Star Vault. Block: 788291`, 'success');
    }, 1500);
  };

  const handleClaimESMS = () => {
    onCommitLog('Retrieving visibility attestation for risen star vaults from SpacetimeDB...', 'info');
    setTimeout(() => {
      onCommitLog('EIP-712 Visibility signature verified by StarVault contract on Arc.', 'success');
      setEsmsRewards((prev) => ({
        ...prev,
        [selectedStar.element]: prev[selectedStar.element] + 1.25
      }));
      onCommitLog(`Minter role authorized: Minted 1.25 ${selectedStar.element === 'Fire' ? 'Spirit' : selectedStar.element === 'Water' ? 'Essence' : selectedStar.element === 'Earth' ? 'Matter' : 'Substance'} reward tokens.`, 'success');
    }, 1000);
  };


  // --- ENS & NameStone States ---
  const [ensAgents, setEnsAgents] = useState<EnsAgent[]>(INITIAL_AGENTS);
  const [selectedEnsAgent, setSelectedEnsAgent] = useState<EnsAgent>(INITIAL_AGENTS[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isVerifyingWorldID, setIsVerifyingWorldID] = useState<boolean>(false);

  const filteredAgents = useMemo(() => {
    return ensAgents.filter((agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.subname.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [ensAgents, searchQuery]);

  const handleWorldIDVerify = (agentName: string) => {
    setIsVerifyingWorldID(true);
    onCommitLog(`Opening World ID IDKit Widget. Awaiting Proof of Personhood for agent: ${agentName}...`, 'info');

    setTimeout(() => {
      setEnsAgents((current) =>
        current.map((agent) =>
          agent.name === agentName ? { ...agent, humanVerified: true } : agent
        )
      );
      setSelectedEnsAgent((prev) => prev.name === agentName ? { ...prev, humanVerified: true } : prev);
      setIsVerifyingWorldID(false);
      onCommitLog(`World ID cloud verification successful! "human-verified" badge written to NameStone ENS text record.`, 'success');
    }, 2000);
  };


  // --- x402 A2A Terminal States ---
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent' | 'system'; text: string; paymentMetadata?: string }>>([
    { sender: 'system', text: 'Securing websocket connection to plato.alchmagents.eth A2A server...' },
    { sender: 'system', text: 'Target Wallet: eip155:5042002:0x3600ab818fd65ef60d5b293f77a8004a818c2007' }
  ]);
  const [userMessage, setUserMessage] = useState<string>('');
  const [chatStep, setChatStep] = useState<'init' | 'payment_required' | 'ready_to_send'>('init');
  const [isStreamingMessage, setIsStreamingMessage] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (!userMessage.trim()) return;
    const msg = userMessage;
    setUserMessage('');

    setChatMessages((prev) => [...prev, { sender: 'user', text: msg }]);

    if (chatStep === 'init') {
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { sender: 'system', text: 'HTTP/1.1 402 Payment Required' },
          { sender: 'system', text: 'Headers: X-PAYMENT-TARGET="eip155:5042002:0x3600ab818fd65ef60d5b293f77a8004a818c2007", X-PAYMENT-AMOUNT="0.05 USDC"' },
          { sender: 'agent', text: 'Payment Required: An active EIP-3009 transfer authorization of 0.05 USDC is required to unlock this conversation thread on Circle Arc.' }
        ]);
        setChatStep('payment_required');
        onCommitLog('A2A route intercepted by x402 gate: 402 Payment Required.', 'warning');
      }, 1000);
    } else if (chatStep === 'ready_to_send') {
      setIsStreamingMessage(true);
      setChatMessages((prev) => [...prev, { sender: 'system', text: 'X-PAYMENT-RESPONSE: Authorization verified (Arc Tx 0x82f9...a06d). Outbound SSE stream activated.' }]);
      
      const responseTemplate = `Greetings, traveler. I am Plato. You ask: "${msg}". In the Republic, I postulated that the structures of reality are merely reflections of higher alchemical forms. This agentic node, bound on Arc, is a modern realization of those eternal templates, secured by sovereign code and consensus.`;
      const words = responseTemplate.split(' ');
      let currentWordIndex = 0;
      let currentResponseText = '';

      setChatMessages((prev) => [...prev, { sender: 'agent', text: '' }]);

      const streamTimer = setInterval(() => {
        if (currentWordIndex < words.length) {
          currentResponseText += (currentWordIndex === 0 ? '' : ' ') + words[currentWordIndex];
          setChatMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];
            if (last && last.sender === 'agent') {
              last.text = currentResponseText;
            }
            return copy;
          });
          currentWordIndex++;
        } else {
          clearInterval(streamTimer);
          setIsStreamingMessage(false);
          onCommitLog('A2A server streamed complete agent response (SSE protocol).', 'success');
        }
      }, 80);
    }
  };

  const handleApprovePayment = () => {
    onCommitLog('Signing EIP-3009 USDC transfer authorization (owner: OP_CELESTIAL, spender: Plato A2A Wallet)...', 'info');
    setTimeout(() => {
      onCommitLog('Authorization signed. Self-settling on Circle Arc Testnet via LocalArcFacilitator.', 'success');
      setChatStep('ready_to_send');
      setChatMessages((prev) => [
        ...prev,
        { sender: 'system', text: 'USDC Authorization accepted. eip155:5042002 contract settlement succeeded.' }
      ]);
    }, 1200);
  };


  // --- Walrus Memory States ---
  const [memoryInput, setMemoryInput] = useState<string>('');
  const [isEncryptingMemory, setIsEncryptingMemory] = useState<boolean>(false);
  const [memoryBlobs, setMemoryBlobs] = useState<Array<{ timestamp: string; size: number; blobId: string; excerpt: string }>>([
    {
      timestamp: '2026-06-14T08:11:04Z',
      size: 1450,
      blobId: '0x9f3da81a5c6e87f2e1a3b8cd5932ef6e12e8b21c43a0d9b8ed8ca06ddb52f821',
      excerpt: 'Persona Essence encrypted snapshot: Plato core communication styles & Natal Chart values.'
    }
  ]);

  const handleStoreMemory = () => {
    if (!memoryInput.trim()) return;
    setIsEncryptingMemory(true);
    const content = memoryInput;
    setMemoryInput('');
    onCommitLog(`Encrypting persona memories (MemWal protocol) with local Privy key...`, 'info');

    setTimeout(() => {
      const generatedBlob = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      const newBlob = {
        timestamp: new Date().toISOString(),
        size: content.length * 2,
        blobId: generatedBlob,
        excerpt: content.substring(0, 80) + (content.length > 80 ? '...' : '')
      };
      setMemoryBlobs((prev) => [newBlob, ...prev]);
      setIsEncryptingMemory(false);
      onCommitLog(`Memory uploaded successfully to Walrus Testnet! Assigned Blob ID: ${generatedBlob.substring(0, 8)}...`, 'success');
      onCommitLog(`ENS Resolver record 'agent-memory' updated to reference new Walrus Blob.`, 'success');
    }, 1800);
  };


  // --- 1inch & CCTP States ---
  const [onrampToken, setOnrampToken] = useState<string>('ETH');
  const [onrampAmount, setOnrampAmount] = useState<string>('0.5');
  const [isQuoting, setIsQuoting] = useState<boolean>(false);
  const [quoteOutput, setQuoteOutput] = useState<{ usdcBase: number; gasSaved: string; bridgeEst: string } | null>(null);

  const getQuote = () => {
    setIsQuoting(true);
    onCommitLog(`Fetching Fusion+ swap quote from 1inch (Base: ${onrampAmount} ${onrampToken} -> USDC)...`, 'info');

    setTimeout(() => {
      const usdc = onrampToken === 'ETH' ? Number(onrampAmount) * 3500 : Number(onrampAmount) * 1;
      setQuoteOutput({
        usdcBase: usdc,
        gasSaved: '$3.40 (Fusion+ Gasless Routing)',
        bridgeEst: 'CCTP to Arc: ~2.5 mins'
      });
      setIsQuoting(false);
      onCommitLog(`1inch Quote returned: swap ${onrampAmount} ${onrampToken} for ${usdc} USDC on Base. CCTP ready.`, 'success');
    }, 1200);
  };

  const executeBridge = () => {
    if (!quoteOutput) return;
    onCommitLog(`Triggering CCTP cross-chain bridge: burning ${quoteOutput.usdcBase} USDC on Base, minting on Arc...`, 'info');
    setTimeout(() => {
      onCommitLog(`CCTP Mint event observed on Circle Arc chain. Staking balance credited.`, 'success');
    }, 2000);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <div className="mx-auto max-w-[1600px] space-y-4 pb-4">
        
        {/* Header Hero Section */}
        <section className="relative overflow-hidden border border-[#44483a] bg-[#12140e] p-6 md:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(157,223,46,0.04),transparent_50%)] pointer-events-none z-0" />
          <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-[#9ddf2e]">
                <ShieldCheck className="h-4 w-4" />
                Decentralized Showcase
              </div>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#e3e3d8] md:text-5xl">
                Web3 Hackathon Hub
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#c5c8b6]">
                Interactive cockpit spotlighting our decentralized implementation work on Circle Arc, ENS NameStone resolvers, A2A/x402, and sovereign Walrus memory storage.
              </p>
            </div>
            
            <div className="flex items-center gap-3 border border-[#44483a] bg-[#0d0f09] px-4 py-3 font-mono text-xs">
              <span className="h-2 w-2 rounded-full bg-[#9ddf2e] animate-pulse" />
              <span className="text-[#8f9282]">Circle Arc ID:</span>
              <span className="text-[#9ddf2e] font-bold">5042002 (Testnet)</span>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-[#44483a] bg-[#1b1c16] p-4 text-center">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8f9282]">Total USDC Staked</div>
              <div className="mt-2 text-2xl font-black text-[#e3e3d8]">$250.00</div>
              <div className="mt-1 font-mono text-[9px] text-[#9ddf2e] uppercase">Circle Arc Vaults</div>
            </div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-4 text-center">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8f9282]">ENS subnames active</div>
              <div className="mt-2 text-2xl font-black text-[#7dd3fc]">3</div>
              <div className="mt-1 font-mono text-[9px] text-[#8f9282] uppercase">Gasless NameStone</div>
            </div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-4 text-center">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8f9282]">Walrus storage state</div>
              <div className="mt-2 text-2xl font-black text-[#e3e3d8]">1.45 KB</div>
              <div className="mt-1 font-mono text-[9px] text-[#9ddf2e] uppercase">MemWal Decrypted</div>
            </div>
            <div className="border border-[#44483a] bg-[#1b1c16] p-4 text-center">
              <div className="font-mono text-[9px] uppercase tracking-wider text-[#8f9282]">BigQuery indexing status</div>
              <div className="mt-2 text-2xl font-black text-[#7dd3fc]">Synchronized</div>
              <div className="mt-1 font-mono text-[9px] text-[#8f9282] uppercase">ERC-8004 logs</div>
            </div>
          </div>
        </section>

        {/* Modular Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 bg-[#12140e] border border-[#44483a] p-1.5 shrink-0">
          {[
            { id: 'vaults', label: 'Star Staking (Arc)', icon: Coins },
            { id: 'ens', label: 'ENS NameStone', icon: Globe },
            { id: 'a2a', label: 'A2A x402 Gateway', icon: Lock },
            { id: 'walrus', label: 'Walrus Memory', icon: Database },
            { id: 'leaderboard', label: 'BigQuery Leaderboard', icon: Compass },
            { id: 'onramp', label: '1inch / CCTP Bridge', icon: Zap }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activePanel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePanel(tab.id as any)}
                className={`flex items-center gap-2 border px-4 py-2.5 font-mono text-xs uppercase transition cursor-pointer select-none shrink-0 ${
                  active ? 'border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e] font-bold' : 'border-transparent text-[#8f9282] hover:text-[#c5c8b6]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Panel Content Display */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          
          {/* Main Visual Column */}
          <div className="xl:col-span-8 space-y-4">
            
            {/* Panel 1: Star Vault Staking */}
            {activePanel === 'vaults' && (
              <div className="border border-[#44483a] bg-[#12140e] p-6 space-y-6">
                <div className="flex justify-between items-start border-b border-[#44483a]/60 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-[#e3e3d8]">Pentacle Star Vaults</h2>
                    <p className="text-xs text-[#8f9282] mt-1 font-mono">Custody: Circle Arc Testnet · Reward: soulbound ESMS Essence</p>
                  </div>
                  <button
                    onClick={handleClaimESMS}
                    className="border border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e] hover:bg-[#9ddf2e] hover:text-[#0d0f09] px-3.5 py-1.5 font-mono text-[10px] uppercase font-bold transition cursor-pointer"
                  >
                    Claim ESMS Yield
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Select Star Grid */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#8f9282]">1. Select a Celestial Star Target</span>
                      <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar mt-2">
                        {STAR_CATALOG.map((star) => {
                          const selected = selectedStar.hipId === star.hipId;
                          return (
                            <button
                              key={star.hipId}
                              onClick={() => setSelectedStar(star)}
                              className={`p-3 text-left border text-xs transition cursor-pointer ${
                                selected ? 'border-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-[#44483a] bg-[#0d0f09] hover:border-[#8f9282]'
                              }`}
                            >
                              <div className="font-bold text-[#e3e3d8]">{star.name}</div>
                              <div className="flex justify-between mt-2 text-[9px] text-[#8f9282] font-mono">
                                <span>HIP {star.hipId}</span>
                                <span className="text-[#7dd3fc]">{star.element}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border border-[#44483a] bg-[#0d0f09] p-3">
                      <span className="font-mono text-[9px] uppercase text-[#8f9282] block mb-2">Select Your Dominant Element (Chart Affinity)</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(['Fire', 'Water', 'Earth', 'Air'] as const).map((el) => {
                          const Icon = el === 'Fire' ? Flame : el === 'Water' ? Droplets : el === 'Earth' ? Mountain : Wind;
                          return (
                            <button
                              key={el}
                              onClick={() => setDominantElement(el)}
                              className={`border py-1.5 font-mono text-[8px] uppercase transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                                dominantElement === el ? 'border-[#9ddf2e] bg-[#9ddf2e]/10 text-[#9ddf2e]' : 'border-[#44483a] bg-[#12140e] text-[#8f9282]'
                              }`}
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" />
                              {el}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Sky-Gated Dynamic APY Calculator */}
                  <div className="border border-[#44483a] bg-[#0d0f09] p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-[10px] uppercase text-[#8f9282]">Yield Multipliers</span>
                        <div className={`px-2 py-0.5 text-[8px] font-bold font-mono border uppercase ${
                          multipliers.isRisen ? 'border-[#9ddf2e]/40 text-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-red-500/40 text-red-400 bg-red-500/5'
                        }`}>
                          {multipliers.isRisen ? 'RISEN' : 'SET BELOW HORIZON'}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2 text-xs font-mono">
                        <div className="flex justify-between border-b border-[#44483a]/40 pb-1.5">
                          <span className="text-[#8f9282]">Base Star APY:</span>
                          <span className="text-[#e3e3d8]">{selectedStar.baseApy}%</span>
                        </div>
                        <div className="flex justify-between border-b border-[#44483a]/40 pb-1.5">
                          <span className="text-[#8f9282]">Chart Affinity (staker):</span>
                          <span className={multipliers.affinity > 1 ? 'text-[#9ddf2e]' : 'text-red-400'}>x{multipliers.affinity}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#44483a]/40 pb-1.5">
                          <span className="text-[#8f9282]">Sky Dominance:</span>
                          <span className="text-[#7dd3fc]">x{multipliers.skyDominance}</span>
                        </div>
                        <div className="flex justify-between border-b border-[#44483a]/40 pb-1.5">
                          <span className="text-[#8f9282]">Planet Dignity:</span>
                          <span className="text-[#e3e3d8]">x{multipliers.dignity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#8f9282]">Horizon multiplier:</span>
                          <span className={multipliers.isRisen ? 'text-[#9ddf2e]' : 'text-red-500'}>{multipliers.isRisen ? 'x1.00' : 'x0.00'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 border-t border-[#44483a] pt-3 flex justify-between items-baseline">
                      <span className="font-mono text-[10px] uppercase text-[#8f9282]">Dynamic APY:</span>
                      <span className="text-3xl font-black text-[#9ddf2e]">{multipliers.finalApy}%</span>
                    </div>

                    <div className="mt-3 border-t border-[#44483a]/40 pt-3">
                      <span className="font-mono text-[9px] uppercase text-[#8f9282] block mb-2">Your soulbound reward balance</span>
                      <div className="grid grid-cols-2 gap-1.5 text-[8px] uppercase font-mono">
                        <div className="border border-[#44483a] bg-[#12140e] p-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1 text-red-400"><Flame className="w-3.5 h-3.5 shrink-0" /> Spirit:</span>
                          <span className="text-[#9ddf2e]">{esmsRewards.Fire.toFixed(3)}</span>
                        </div>
                        <div className="border border-[#44483a] bg-[#12140e] p-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1 text-[#7dd3fc]"><Droplets className="w-3.5 h-3.5 shrink-0" /> Essence:</span>
                          <span className="text-[#e3e3d8]">{esmsRewards.Water.toFixed(3)}</span>
                        </div>
                        <div className="border border-[#44483a] bg-[#12140e] p-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1 text-green-400"><Mountain className="w-3.5 h-3.5 shrink-0" /> Matter:</span>
                          <span className="text-[#e3e3d8]">{esmsRewards.Earth.toFixed(3)}</span>
                        </div>
                        <div className="border border-[#44483a] bg-[#12140e] p-1.5 flex justify-between items-center">
                          <span className="flex items-center gap-1 text-yellow-400"><Wind className="w-3.5 h-3.5 shrink-0" /> Substance:</span>
                          <span className="text-[#e3e3d8]">{esmsRewards.Air.toFixed(3)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Staking Action Block */}
                <div className="border border-[#44483a] bg-[#1b1c16] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#e3e3d8]">Staking Target: {selectedStar.name}</div>
                    <div className="text-[10px] text-[#8f9282] font-mono">
                      Staked balance: <span className="text-[#7dd3fc]">{stakedBalance[selectedStar.hipId] || 0} USDC</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <label className="flex items-center border border-[#44483a] bg-[#0d0f09] px-2">
                      <input
                        type="number"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="w-20 bg-transparent text-sm text-[#e3e3d8] font-mono outline-none px-2"
                      />
                      <span className="text-[10px] font-mono text-[#8f9282]">USDC</span>
                    </label>

                    <button
                      onClick={handleStake}
                      disabled={isStaking || !multipliers.isRisen}
                      className="border border-[#9ddf2e] bg-[#9ddf2e] hover:bg-[#83c300] disabled:bg-[#44483a] disabled:text-[#8f9282] disabled:border-transparent text-[#0d0f09] px-4 py-2 font-mono text-[10px] uppercase font-bold transition cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isStaking ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          STAKING...
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-[#0d0f09]" />
                          STAKE USDC
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 2: ENS NameStone Registry */}
            {activePanel === 'ens' && (
              <div className="border border-[#44483a] bg-[#12140e] p-6 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-[#44483a]/60 pb-4 gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#e3e3d8]">ENS subnames & NameStone Records</h2>
                    <p className="text-xs text-[#8f9282] mt-1 font-mono">Gasless offchain text record mapping (ENSIP-25/26)</p>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border border-[#44483a] bg-[#0d0f09] px-3 py-1.5 text-xs text-[#e3e3d8] outline-none font-mono placeholder-[#44483a]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Agents List */}
                  <div className="border-r border-[#44483a]/40 space-y-2 pr-2">
                    <span className="font-mono text-[10px] uppercase text-[#8f9282] block mb-2">Select Agent</span>
                    {filteredAgents.map((agent) => (
                      <button
                        key={agent.name}
                        onClick={() => setSelectedEnsAgent(agent)}
                        className={`w-full p-3 text-left border transition cursor-pointer flex justify-between items-center ${
                          selectedEnsAgent.name === agent.name ? 'border-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-[#44483a] bg-[#0d0f09] hover:border-[#8f9282]'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-[#e3e3d8]">{agent.name}</div>
                          <div className="font-mono text-[9px] text-[#8f9282] mt-1">{agent.subname}</div>
                        </div>
                        {agent.humanVerified && (
                          <div className="h-5 px-1.5 border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 rounded-sm flex items-center justify-center font-mono text-[8px] uppercase text-[#9ddf2e] gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            human-verified
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* ENS Resolver Records Viewer */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[10px] uppercase text-[#8f9282]">ENSIP-25/26 Schema Records</span>
                      <button
                        onClick={() => handleWorldIDVerify(selectedEnsAgent.name)}
                        disabled={isVerifyingWorldID || selectedEnsAgent.humanVerified}
                        className="border border-[#7dd3fc] bg-[#7dd3fc]/5 hover:bg-[#7dd3fc]/15 px-3 py-1 font-mono text-[9px] uppercase text-[#7dd3fc] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                      >
                        {isVerifyingWorldID ? 'Verifying...' : selectedEnsAgent.humanVerified ? 'Verified by World ID' : 'Verify via World ID'}
                      </button>
                    </div>

                    <div className="border border-[#44483a] bg-[#0d0f09] p-4 space-y-3 font-mono text-[11px]">
                      <div>
                        <span className="text-[#8f9282] block text-[9px]">RESOLVED ADDRESS (ETH)</span>
                        <div className="text-[#e3e3d8] truncate mt-1 bg-[#1b1c16] p-2 border border-[#44483a]/40">{selectedEnsAgent.address}</div>
                      </div>
                      <div>
                        <span className="text-[#8f9282] block text-[9px]">A2A ENDPOINT</span>
                        <div className="text-[#7dd3fc] mt-1 bg-[#1b1c16] p-2 border border-[#44483a]/40">{selectedEnsAgent.endpoint}</div>
                      </div>
                      <div>
                        <span className="text-[#8f9282] block text-[9px]">AGENT WALLET (x402)</span>
                        <div className="text-[#ffb020] truncate mt-1 bg-[#1b1c16] p-2 border border-[#44483a]/40">{selectedEnsAgent.wallet}</div>
                      </div>
                      <div>
                        <span className="text-[#8f9282] block text-[9px]">ENCRYPTED MEMORY Snapshots (Walrus BlobID)</span>
                        <div className="text-[#c5c8b6] truncate mt-1 bg-[#1b1c16] p-2 border border-[#44483a]/40">{selectedEnsAgent.memoryBlob}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 3: x402 A2A Payment & SSE Simulator */}
            {activePanel === 'a2a' && (
              <div className="border border-[#44483a] bg-[#12140e] p-6 space-y-6">
                <div className="border-b border-[#44483a]/60 pb-4">
                  <h2 className="text-xl font-bold text-[#e3e3d8]">A2A x402 Gateway</h2>
                  <p className="text-xs text-[#8f9282] mt-1 font-mono">Agent-to-Agent payments & stream authorization simulator</p>
                </div>

                {/* Simulated Chat Interface */}
                <div className="border border-[#44483a] bg-[#0d0f09] flex flex-col h-[350px]">
                  {/* Messages Feed */}
                  <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-3 font-mono text-[11px] leading-relaxed">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`flex ${
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <div className={`max-w-[85%] px-3.5 py-2.5 ${
                          msg.sender === 'user'
                            ? 'bg-[#9ddf2e]/10 border border-[#9ddf2e] text-[#9ddf2e]'
                            : msg.sender === 'system'
                              ? 'text-[#8f9282] italic text-[10px]'
                              : 'bg-[#1b1c16] border border-[#44483a] text-[#c5c8b6]'
                        }`}>
                          {msg.sender === 'agent' && <div className="text-[#7dd3fc] font-bold text-[9px] uppercase mb-1">Plato (plato.alchmagents.eth)</div>}
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Overlay */}
                  {chatStep === 'payment_required' && (
                    <div className="border-t border-[#44483a] bg-[#1b1c16] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-[#ffb020] shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-[#e3e3d8] font-mono">EIP-3009 USDC Signature Required</div>
                          <div className="text-[10px] text-[#8f9282] font-mono mt-0.5">Authorize transfer of 0.05 USDC to target agent wallet.</div>
                        </div>
                      </div>

                      <button
                        onClick={handleApprovePayment}
                        className="border border-[#ffb020] bg-[#ffb020]/10 hover:bg-[#ffb020] text-[#ffb020] hover:text-[#0d0f09] px-4 py-2 font-mono text-[10px] uppercase font-bold transition cursor-pointer"
                      >
                        Approve USDC Transfer
                      </button>
                    </div>
                  )}

                  {/* Input form */}
                  <div className="border-t border-[#44483a] bg-[#12140e] p-3 flex gap-2 shrink-0">
                    <input
                      type="text"
                      placeholder={chatStep === 'payment_required' ? 'Authorize payment above to continue...' : 'Send message to Plato...'}
                      disabled={chatStep === 'payment_required' || isStreamingMessage}
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 border border-[#44483a] bg-[#0d0f09] px-3.5 py-2 text-xs text-[#e3e3d8] font-mono outline-none focus:border-[#9ddf2e]"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={chatStep === 'payment_required' || isStreamingMessage}
                      className="border border-[#9ddf2e]/40 hover:border-[#9ddf2e] bg-[#9ddf2e]/5 hover:bg-[#9ddf2e]/10 text-[#9ddf2e] disabled:opacity-30 disabled:hover:bg-transparent p-2 transition cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 4: Walrus Sovereign Memory snapshot */}
            {activePanel === 'walrus' && (
              <div className="border border-[#44483a] bg-[#12140e] p-6 space-y-6">
                <div className="border-b border-[#44483a]/60 pb-4">
                  <h2 className="text-xl font-bold text-[#e3e3d8]">Walrus Sovereign Memory</h2>
                  <p className="text-xs text-[#8f9282] mt-1 font-mono">MemWal: Sovereign decentralized memory uploads for AI agents (Sui/Walrus Testnet)</p>
                </div>

                {/* Snapshots form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Form */}
                  <div className="border border-[#44483a] bg-[#0d0f09] p-5 flex flex-col justify-between">
                    <div className="space-y-4">
                      <span className="font-mono text-[10px] uppercase text-[#8f9282]">Encrypt & Store New Memory Snapshot</span>
                      <textarea
                        rows={5}
                        placeholder="Enter conversation state, memory logs or persona variables to encrypt and upload to Walrus..."
                        value={memoryInput}
                        onChange={(e) => setMemoryInput(e.target.value)}
                        className="w-full border border-[#44483a] bg-[#1b1c16] px-3.5 py-3 text-xs text-[#e3e3d8] outline-none font-mono resize-none focus:border-[#7dd3fc]"
                      />
                    </div>

                    <button
                      onClick={handleStoreMemory}
                      disabled={isEncryptingMemory || !memoryInput.trim()}
                      className="mt-6 border border-[#7dd3fc] bg-[#7dd3fc] text-[#0d0f09] font-mono text-[10px] uppercase font-bold py-2.5 px-4 flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-[#44483a] disabled:text-[#8f9282] disabled:border-transparent transition"
                    >
                      {isEncryptingMemory ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ENCRYPTING & UPLOADING...
                        </>
                      ) : (
                        <>
                          <Fingerprint className="h-3.5 w-3.5" />
                          Encrypt & Save to Walrus
                        </>
                      )}
                    </button>
                  </div>

                  {/* List of uploaded blobs */}
                  <div className="space-y-4">
                    <span className="font-mono text-[10px] uppercase text-[#8f9282] block">Walrus Blobs Archive</span>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      {memoryBlobs.map((blob, idx) => (
                        <div key={idx} className="border border-[#44483a] bg-[#1b1c16] p-4 space-y-2 font-mono text-[10px]">
                          <div className="flex justify-between text-[#8f9282]">
                            <span>{new Date(blob.timestamp).toLocaleTimeString()}</span>
                            <span>{blob.size} bytes</span>
                          </div>
                          <div className="text-[#e3e3d8] leading-relaxed line-clamp-2">{blob.excerpt}</div>
                          <div className="text-[#7dd3fc] truncate bg-[#0d0f09] p-2 border border-[#44483a]/40 text-[9px] flex justify-between items-center">
                            <span className="truncate">{blob.blobId}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(blob.blobId);
                                onCommitLog('Copied Walrus Blob ID to clipboard.', 'info');
                              }}
                              className="ml-2 hover:text-[#9ddf2e]"
                            >
                              <Copy className="h-3.5 w-3.5 shrink-0" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Panel 5: BigQuery Leaderboard */}
            {activePanel === 'leaderboard' && (
              <div className="border border-[#44483a] bg-[#12140e] p-6 space-y-6">
                <div className="border-b border-[#44483a]/60 pb-4">
                  <h2 className="text-xl font-bold text-[#e3e3d8]">BigQuery ERC-8004 Analytics</h2>
                  <p className="text-xs text-[#8f9282] mt-1 font-mono">Aggregated registry logs parsed from Google Cloud BigQuery</p>
                </div>

                <div className="border border-[#44483a] bg-[#0d0f09] overflow-x-auto">
                  <table className="w-full font-mono text-xs text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-[#44483a] bg-[#12140e] text-[#8f9282] uppercase text-[9px]">
                        <th className="p-3 text-center w-12">Rank</th>
                        <th className="p-3">Agent subname</th>
                        <th className="p-3 text-center">Reputation score</th>
                        <th className="p-3 text-center">x402 txs</th>
                        <th className="p-3 text-right">Volume (USDC)</th>
                        <th className="p-3 text-center">Last Active Block</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#44483a]/40 text-[#c5c8b6]">
                      {BQ_LEADERBOARD.map((item) => (
                        <tr key={item.rank} className="hover:bg-[#1b1c16]/30">
                          <td className="p-3 text-center font-bold text-[#9ddf2e]">{item.rank}</td>
                          <td className="p-3 font-semibold text-[#e3e3d8]">{item.subname}</td>
                          <td className="p-3 text-center font-bold">{item.trustScore}/100</td>
                          <td className="p-3 text-center">{item.txsCount}</td>
                          <td className="p-3 text-right text-[#7dd3fc] font-bold">${item.volumeUsdc.toLocaleString()}</td>
                          <td className="p-3 text-center text-[#8f9282]">{item.lastActiveBlock}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Panel 6: 1inch / CCTP Bridge */}
            {activePanel === 'onramp' && (
              <div className="border border-[#44483a] bg-[#12140e] p-6 space-y-6">
                <div className="border-b border-[#44483a]/60 pb-4">
                  <h2 className="text-xl font-bold text-[#e3e3d8]">1inch Fusion+ & CCTP Cross-Chain Funding</h2>
                  <p className="text-xs text-[#8f9282] mt-1 font-mono">Quote and bridge cross-chain assets to Circle Arc Star Staking</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Quote Panel */}
                  <div className="border border-[#44483a] bg-[#0d0f09] p-5 space-y-4">
                    <span className="font-mono text-[10px] uppercase text-[#8f9282] block">1. Get Fusion+ Quote</span>
                    
                    <div className="flex gap-2">
                      <label className="flex-1 block">
                        <span className="font-mono text-[9px] uppercase text-[#8f9282]">Swap Input</span>
                        <div className="flex items-center border border-[#44483a] bg-[#1b1c16] px-2.5 mt-1.5">
                          <input
                            type="number"
                            value={onrampAmount}
                            onChange={(e) => setOnrampAmount(e.target.value)}
                            className="w-full bg-transparent py-2 text-xs text-[#e3e3d8] outline-none font-mono"
                          />
                          <select
                            value={onrampToken}
                            onChange={(e) => setOnrampToken(e.target.value)}
                            className="bg-transparent text-[#9ddf2e] border-none font-bold text-xs outline-none cursor-pointer pl-1 font-mono"
                          >
                            <option value="ETH" className="bg-[#12140e]">ETH</option>
                            <option value="USDT" className="bg-[#12140e]">USDT</option>
                            <option value="OP" className="bg-[#12140e]">OP</option>
                          </select>
                        </div>
                      </label>
                      
                      <div className="flex items-end pb-1.5 text-[#8f9282]">
                        <ArrowRight className="h-5 w-5" />
                      </div>

                      <label className="flex-1 block">
                        <span className="font-mono text-[9px] uppercase text-[#8f9282]">Swap Output (Base)</span>
                        <div className="flex items-center border border-[#44483a] bg-[#1b1c16] px-2.5 mt-1.5 opacity-80 select-none">
                          <div className="w-full py-2 text-xs text-[#8f9282] font-mono">
                            {onrampToken === 'ETH' ? (Number(onrampAmount) * 3500 || 0) : onrampAmount}
                          </div>
                          <span className="text-[#7dd3fc] font-bold text-xs font-mono">USDC</span>
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={getQuote}
                      disabled={isQuoting}
                      className="w-full border border-[#9ddf2e] bg-[#9ddf2e] text-[#0d0f09] font-mono text-[10px] uppercase font-bold py-2.5 flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#83c300] transition"
                    >
                      {isQuoting ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          QUOTING...
                        </>
                      ) : (
                        'Get Swap Quote'
                      )}
                    </button>
                  </div>

                  {/* Bridge status details */}
                  <div className="border border-[#44483a] bg-[#1b1c16] p-5 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] uppercase text-[#8f9282]">2. Bridging Route (CCTP)</span>
                      
                      {quoteOutput ? (
                        <div className="mt-4 space-y-3 font-mono text-xs">
                          <div className="flex justify-between border-b border-[#44483a]/40 pb-2">
                            <span className="text-[#8f9282]">Base USDC Output:</span>
                            <span className="text-[#e3e3d8] font-bold">${quoteOutput.usdcBase} USDC</span>
                          </div>
                          <div className="flex justify-between border-b border-[#44483a]/40 pb-2">
                            <span className="text-[#8f9282]">Gas Saving (1inch):</span>
                            <span className="text-[#9ddf2e]">{quoteOutput.gasSaved}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#8f9282]">Bridge Est. Time:</span>
                            <span className="text-[#7dd3fc]">{quoteOutput.bridgeEst}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-8 text-center text-xs text-[#8f9282] italic">
                          Generate quote to calculate cross-chain CCTP bridging route.
                        </div>
                      )}
                    </div>

                    <button
                      onClick={executeBridge}
                      disabled={!quoteOutput}
                      className="mt-6 border border-[#7dd3fc] bg-[#7dd3fc] text-[#0d0f09] font-mono text-[10px] uppercase font-bold py-2.5 px-4 w-full flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-[#44483a] disabled:text-[#8f9282] disabled:border-transparent transition"
                    >
                      Execute Swap & Bridge
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Log column */}
          <div className="xl:col-span-4 space-y-4">
            
            {/* On-Chain Transaction Terminal */}
            <div className="border border-[#44483a] bg-[#12140e] p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-[#44483a]/60 pb-3">
                <span className="font-mono text-[10px] uppercase text-[#e3e3d8] font-bold flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-[#9ddf2e]" />
                  Simulated Block Receipt
                </span>
                <span className="text-[9px] font-mono text-[#8f9282] uppercase">Live connection</span>
              </div>

              <div className="space-y-3 font-mono text-[10px]">
                {stakingTxHistory.map((tx, idx) => (
                  <div key={idx} className="border border-[#44483a] bg-[#0d0f09] p-3 space-y-2">
                    <div className="flex justify-between text-[#8f9282]">
                      <span className="font-bold uppercase text-[#7dd3fc]">{tx.type}</span>
                      <span>Block #{tx.block}</span>
                    </div>
                    <div className="text-[#e3e3d8]">{tx.details}</div>
                    <div className="text-[#8f9282] text-[9px] truncate flex justify-between items-center">
                      <span>Hash: {tx.txHash}</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tx.txHash);
                          onCommitLog('Copied Tx Hash to clipboard.', 'info');
                        }}
                        className="hover:text-[#9ddf2e] cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* General Web3 Architecture Info */}
            <div className="border border-[#44483a] bg-[#1b1c16] p-5 space-y-4">
              <span className="font-mono text-[10px] uppercase text-[#ffb020] font-bold flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                Decentralized Topology
              </span>
              <p className="text-xs leading-5 text-[#c5c8b6]">
                This hub operates as the unified control board for AlchmAgents. Off-chain ENS records act as our DNS routing, resolving client A2A servers to EIP-3009 payment requirements. The custody remains entirely bound on Circle Arc, and all memory states are cryptographically preserved via MemWal on the Walrus storage network.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
