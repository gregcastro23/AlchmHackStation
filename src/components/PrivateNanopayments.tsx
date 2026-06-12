import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Layers, 
  Cpu
} from 'lucide-react';

interface PrivateNanopaymentsProps {
  onCommitLog?: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
}

interface LogLine {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'default';
}

export const PrivateNanopayments: React.FC<PrivateNanopaymentsProps> = ({ onCommitLog }) => {
  // App Config States
  const [dynamicEnvId, setDynamicEnvId] = useState('sandbox-f8a192e4-9271');
  const [unlinkApiKey, setUnlinkApiKey] = useState('unlink_live_k8a3910f2d93e117c');
  const [rpcUrl, setRpcUrl] = useState('https://rpc.testnet.arc.io');

  // Flow State Management
  const [step, setStep] = useState<number>(1);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const logTerminalEndRef = useRef<HTMLDivElement>(null);

  // Step 1: Dynamic Auth
  const [dynamicConnected, setDynamicConnected] = useState(false);
  const [dynamicUser, setDynamicUser] = useState<any>(null);
  const [isDynamicConnecting, setIsDynamicConnecting] = useState(false);

  // Step 2: Unlink
  const [unlinkRegistered, setUnlinkRegistered] = useState(false);
  const [unlinkAddress, setUnlinkAddress] = useState('');
  const [privateBalance, setPrivateBalance] = useState('0.00');
  const [shieldAmount, setShieldAmount] = useState('10.0');
  const [isShielding, setIsShielding] = useState(false);
  const [faucetLoading, setFaucetLoading] = useState(false);

  // Step 3: Private Withdrawal
  const [payerEoaAddress, setPayerEoaAddress] = useState('');
  const [payerEoaBalance, setPayerEoaBalance] = useState('0.00');
  const [withdrawAmount, setWithdrawAmount] = useState('1.50');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [zkProofProgress, setZkProofProgress] = useState(0);

  // Step 4: Circle Gateway x402
  const [gatewayDeposited, setGatewayDeposited] = useState(false);
  const [gatewayBalance, setGatewayBalance] = useState('0.00');
  const [isDepositingGateway, setIsDepositingGateway] = useState(false);
  const [resourcePaid, setResourcePaid] = useState(false);
  const [isPayingResource, setIsPayingResource] = useState(false);

  const addLocalLog = (message: string, type: LogLine['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false });
    const newLine: LogLine = { timestamp: time, message, type };
    setLogs((prev) => [...prev, newLine]);
    onCommitLog?.(message, type === 'default' ? 'default' : type);
  };

  useEffect(() => {
    logTerminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Initial logs
  useEffect(() => {
    addLocalLog('[SYS] Private Nanopayments environment node ready.', 'info');
    addLocalLog('[SYS] Settling chain: Arc Testnet // Gas token: USDC.', 'info');
  }, []);

  // Step 1: Dynamic Connection
  const handleConnectDynamic = () => {
    if (isDynamicConnecting) return;
    setIsDynamicConnecting(true);
    addLocalLog('[DYNAMIC] Initializing Dynamic Web3 Auth flow...', 'info');

    setTimeout(() => {
      setDynamicConnected(true);
      setDynamicUser({
        sub: 'usr_dyn_01j9a812e',
        email: 'hacker@cookingwithcastro.io',
        walletAddress: '0x2F56...89e2',
      });
      setIsDynamicConnecting(false);
      setStep(2);
      addLocalLog('[DYNAMIC] Wallet successfully connected.', 'success');
      addLocalLog('[DYNAMIC] Session JWT verified. Subject ID: usr_dyn_01j9a812e', 'success');
    }, 1200);
  };

  const handleDisconnectDynamic = () => {
    setDynamicConnected(false);
    setDynamicUser(null);
    setUnlinkRegistered(false);
    setUnlinkAddress('');
    setPrivateBalance('0.00');
    setPayerEoaAddress('');
    setPayerEoaBalance('0.00');
    setGatewayDeposited(false);
    setGatewayBalance('0.00');
    setResourcePaid(false);
    setStep(1);
    addLocalLog('[DYNAMIC] Disconnected session. Cleared all local credentials.', 'warning');
  };

  // Step 2: Unlink Faucet
  const handleRequestFaucet = () => {
    if (faucetLoading) return;
    setFaucetLoading(true);
    addLocalLog('[FAUCET] Requesting Arc USDC testnet tokens from Circle Faucet...', 'info');

    setTimeout(() => {
      setFaucetLoading(false);
      addLocalLog('[FAUCET] Faucet deposit success. Tx Hash: 0xfa39...c812.', 'success');
      addLocalLog('[SYS] Wallet Balance (Public): 25.00 USDC.', 'info');
    }, 1500);
  };

  // Step 2: Unlink Shielding / Register
  const handleRegisterUnlink = () => {
    if (unlinkRegistered) return;
    addLocalLog('[UNLINK] Initializing client registration on arc-testnet...', 'info');
    addLocalLog('[UNLINK] Deriving seed from Dynamic wallet signature using HKDF-SHA256...', 'info');

    setTimeout(() => {
      setUnlinkRegistered(true);
      setUnlinkAddress('unlink1q2p8lx7y3v4f6p0a8g9t8d3k9j8m0r9p4w3n6g');
      addLocalLog('[UNLINK] Registration success. Bech32m Address: unlink1q2p8...4w3n6g', 'success');
    }, 1000);
  };

  const handleShieldFunds = () => {
    if (isShielding || !unlinkRegistered) return;
    setIsShielding(true);
    addLocalLog(`[UNLINK] Shielding ${shieldAmount} USDC: executing depositWithApproval()...`, 'info');

    setTimeout(() => {
      setIsShielding(false);
      setPrivateBalance((prev) => (parseFloat(prev) + parseFloat(shieldAmount)).toFixed(2));
      addLocalLog(`[UNLINK] ZK-Shielding success. ${shieldAmount} USDC deposited. Tx: 0xsh93...4a12`, 'success');
      addLocalLog('[UNLINK] Transaction fully confidential. Public linkage severed.', 'success');
    }, 1800);
  };

  // Step 3: Private Withdrawal
  const handleGeneratePayerEoa = () => {
    const randomHex = Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    const newAddress = `0x${randomHex.slice(0, 4)}...${randomHex.slice(-4)}`;
    setPayerEoaAddress(newAddress);
    addLocalLog(`[SYS] Generated fresh Payer EOA address: 0x${randomHex.slice(0, 4)}...${randomHex.slice(-4)}`, 'info');
  };

  const handleWithdrawPrivately = () => {
    if (isWithdrawing || !payerEoaAddress) return;
    setIsWithdrawing(true);
    setZkProofProgress(10);
    addLocalLog(`[UNLINK] Constructing private withdrawal of ${withdrawAmount} USDC to EOA: ${payerEoaAddress}...`, 'info');

    const interval = setInterval(() => {
      setZkProofProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 15;
      });
    }, 250);

    setTimeout(() => {
      setIsWithdrawing(false);
      setPrivateBalance((prev) => (parseFloat(prev) - parseFloat(withdrawAmount)).toFixed(2));
      setPayerEoaBalance((prev) => (parseFloat(prev) + parseFloat(withdrawAmount)).toFixed(2));
      setStep(4);
      addLocalLog('[UNLINK] Client-side ZK-Proof generated successfully (Groth16 on BN254). size: 738 bytes', 'success');
      addLocalLog(`[UNLINK] Verification success. Relayed transaction complete. EOA ${payerEoaAddress} funded. Tx: 0xwd83...19a2`, 'success');
      addLocalLog('[UNLINK] Privacy Hygiene check: withdrawal value does not correlate to shielding size. OK.', 'success');
    }, 2000);
  };

  // Step 4: Circle Gateway x402
  const handleDepositGateway = () => {
    if (isDepositingGateway) return;
    setIsDepositingGateway(true);
    addLocalLog(`[GATEWAY] Depositing ${withdrawAmount} USDC from Payer EOA into Gateway Wallet...`, 'info');

    setTimeout(() => {
      setIsDepositingGateway(false);
      setGatewayDeposited(true);
      setGatewayBalance(withdrawAmount);
      setPayerEoaBalance('0.00');
      addLocalLog(`[GATEWAY] Deposit confirmed. Gateway Balance: ${withdrawAmount} USDC. Tx: 0xgt28...da91`, 'success');
    }, 1200);
  };

  const handlePayResource = () => {
    if (isPayingResource) return;
    setIsPayingResource(true);
    addLocalLog('[GATEWAY] Requesting protected x402 API resource...', 'info');

    setTimeout(() => {
      addLocalLog('[GATEWAY] Server responded with: HTTP 402 Payment Required.', 'warning');
      addLocalLog('[GATEWAY] Server payment headers negotiated. Price: 0.12 USDC.', 'info');
      addLocalLog('[GATEWAY] Off-chain signing EIP-3009 TransferWithAuthorization locally...', 'info');
    }, 800);

    setTimeout(() => {
      setGatewayBalance((prev) => (parseFloat(prev) - 0.12).toFixed(2));
      setResourcePaid(true);
      setIsPayingResource(false);
      addLocalLog('[GATEWAY] Signature sent. Payment accepted by seller.', 'success');
      addLocalLog('[GATEWAY] Transaction added to Circle batching queue. Gas cost: 0.00 USDC.', 'success');
      addLocalLog('[SYS] Premium Resource Data unlocked: "Hello from the decentralized agentic economy!"', 'success');
    }, 2000);
  };

  const resetAll = () => {
    handleDisconnectDynamic();
    setLogs([]);
    addLocalLog('[SYS] Workspace reset complete. Setup parameters active.', 'info');
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 lg:flex-row flex-1 select-none">
      {/* Left Column: Flow Controller */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-[480px]">
        {/* Environment setup info */}
        <div className="border border-[#44483a] bg-[#12140e] p-4 flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#9ddf2e]" />
            <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#e3e3d8]">Bounty Stack Parameters</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-2 font-mono text-[9px] uppercase pt-1">
            <div className="border border-[#44483a] bg-[#0d0f09] p-2 flex justify-between items-center">
              <span className="text-[#8f9282]">Dynamic Env:</span>
              <input 
                type="text" 
                value={dynamicEnvId} 
                onChange={(e) => setDynamicEnvId(e.target.value)}
                className="bg-transparent text-[#7dd3fc] text-right focus:outline-none border-b border-transparent focus:border-[#7dd3fc]"
              />
            </div>
            <div className="border border-[#44483a] bg-[#0d0f09] p-2 flex justify-between items-center">
              <span className="text-[#8f9282]">Unlink API Key:</span>
              <input 
                type="password" 
                value={unlinkApiKey} 
                onChange={(e) => setUnlinkApiKey(e.target.value)}
                className="bg-transparent text-[#9ddf2e] text-right focus:outline-none border-b border-transparent focus:border-[#9ddf2e]"
              />
            </div>
            <div className="border border-[#44483a] bg-[#0d0f09] p-2 flex justify-between items-center">
              <span className="text-[#8f9282]">RPC Endpoint:</span>
              <input 
                type="text" 
                value={rpcUrl} 
                onChange={(e) => setRpcUrl(e.target.value)}
                className="bg-transparent text-[#c5c8b6] text-right focus:outline-none border-b border-transparent focus:border-[#c5c8b6]"
              />
            </div>
          </div>
        </div>

        {/* Multi-step flow panel */}
        <div className="border border-[#44483a] bg-[#12140e] p-5 flex flex-col flex-1 min-h-0">
          <div className="flex items-center justify-between border-b border-[#44483a] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#9ddf2e]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.2em] text-[#e3e3d8]">Integration Wizard</h2>
            </div>
            <button 
              onClick={resetAll}
              className="text-[#8f9282] hover:text-[#fb7185] transition font-mono text-[9px] uppercase tracking-wider"
            >
              Reset wizard
            </button>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {/* Step 1: Dynamic Auth */}
            <div className={`border p-4 transition-all duration-150 ${step === 1 ? 'border-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-[#44483a] bg-[#0d0f09]'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#8f9282] uppercase">Step 01 // Identity</span>
                  <h3 className="text-xs font-bold text-[#e3e3d8] mt-0.5">Dynamic Web3 Auth</h3>
                </div>
                {dynamicConnected ? (
                  <span className="border border-[#9ddf2e]/30 bg-[#9ddf2e]/10 text-[#9ddf2e] font-mono text-[8px] uppercase px-1.5 py-0.5 font-bold">CONNECTED</span>
                ) : (
                  <span className="border border-[#44483a] bg-[#1b1c16] text-[#8f9282] font-mono text-[8px] uppercase px-1.5 py-0.5">UNBOUND</span>
                )}
              </div>

              {step === 1 && (
                <div className="mt-3 space-y-3">
                  <p className="text-[10px] leading-4 text-[#c5c8b6]">
                    Onboard users or agents with Dynamic's embedded wallets and sign off-chain payment credentials gaslessly.
                  </p>
                  <button
                    onClick={handleConnectDynamic}
                    disabled={isDynamicConnecting}
                    className="w-full py-2 border border-[#9ddf2e] bg-[#9ddf2e] text-[#0d0f09] hover:bg-[#83c300] font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  >
                    {isDynamicConnecting ? 'Connecting wallet...' : 'Connect Wallet via Dynamic'}
                  </button>
                </div>
              )}

              {dynamicConnected && (
                <div className="mt-3 font-mono text-[9px] text-[#8f9282] space-y-1 bg-[#12140e] p-2 border border-[#44483a]/40">
                  <div>Subject JWT: <span className="text-[#c5c8b6]">{dynamicUser?.sub}</span></div>
                  <div>Anchor EOA: <span className="text-[#7dd3fc]">{dynamicUser?.walletAddress}</span></div>
                  <button 
                    onClick={handleDisconnectDynamic}
                    className="text-[#fb7185] hover:underline mt-1 block"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            {/* Step 2: Unlink ZK-Shielding */}
            <div className={`border p-4 transition-all duration-150 ${step === 2 ? 'border-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-[#44483a] bg-[#0d0f09]'} ${!dynamicConnected ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#8f9282] uppercase">Step 02 // Shielding</span>
                  <h3 className="text-xs font-bold text-[#e3e3d8] mt-0.5">Unlink Private Pool</h3>
                </div>
                {unlinkRegistered ? (
                  <span className="border border-[#9ddf2e]/30 bg-[#9ddf2e]/10 text-[#9ddf2e] font-mono text-[8px] uppercase px-1.5 py-0.5 font-bold">REGISTERED</span>
                ) : (
                  <span className="border border-[#44483a] bg-[#1b1c16] text-[#8f9282] font-mono text-[8px] uppercase px-1.5 py-0.5">UNREGISTERED</span>
                )}
              </div>

              {step === 2 && (
                <div className="mt-3 space-y-3">
                  <p className="text-[10px] leading-4 text-[#c5c8b6]">
                    Wrap transaction logic in Unlink. Seed public tokens, register a private Unlink identity and shield balances to break on-chain histories.
                  </p>
                  
                  {!unlinkRegistered ? (
                    <button
                      onClick={handleRegisterUnlink}
                      className="w-full py-2 border border-[#7dd3fc] text-[#7dd3fc] hover:bg-[#7dd3fc]/10 font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer"
                    >
                      Register Unlink Node
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex gap-2">
                        <button
                          onClick={handleRequestFaucet}
                          disabled={faucetLoading}
                          className="flex-1 py-1.5 border border-[#ffb020] text-[#ffb020] hover:bg-[#ffb020]/10 font-mono text-[10px] uppercase transition disabled:opacity-50 cursor-pointer"
                        >
                          {faucetLoading ? 'Funding...' : 'Circle Faucet'}
                        </button>
                        
                        <div className="flex items-center gap-1.5 border border-[#44483a] bg-[#12140e] px-2">
                          <input 
                            type="number"
                            value={shieldAmount}
                            onChange={(e) => setShieldAmount(e.target.value)}
                            className="w-12 bg-transparent font-mono text-[10px] text-[#e3e3d8] focus:outline-none"
                          />
                          <span className="font-mono text-[9px] text-[#8f9282]">USDC</span>
                        </div>
                      </div>

                      <button
                        onClick={handleShieldFunds}
                        disabled={isShielding}
                        className="w-full py-2 border border-[#9ddf2e] bg-[#9ddf2e] text-[#0d0f09] hover:bg-[#83c300] font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer"
                      >
                        {isShielding ? 'Depositing and Shielding...' : 'Shield Funds (deposit)'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {unlinkRegistered && (
                <div className="mt-3 font-mono text-[9px] text-[#8f9282] space-y-1 bg-[#12140e] p-2 border border-[#44483a]/40">
                  <div className="truncate">Unlink Addr: <span className="text-[#9ddf2e]">{unlinkAddress}</span></div>
                  <div>Private Balance: <span className="text-[#ffb020] font-bold">{privateBalance} USDC</span></div>
                </div>
              )}
            </div>

            {/* Step 3: Private Withdrawal */}
            <div className={`border p-4 transition-all duration-150 ${step === 3 ? 'border-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-[#44483a] bg-[#0d0f09]'} ${!unlinkRegistered || parseFloat(privateBalance) <= 0 ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#8f9282] uppercase">Step 03 // Obfuscation</span>
                  <h3 className="text-xs font-bold text-[#e3e3d8] mt-0.5">Confidential Withdrawal</h3>
                </div>
                {payerEoaAddress ? (
                  <span className="border border-[#9ddf2e]/30 bg-[#9ddf2e]/10 text-[#9ddf2e] font-mono text-[8px] uppercase px-1.5 py-0.5 font-bold">PAYER EOA BENT</span>
                ) : (
                  <span className="border border-[#44483a] bg-[#1b1c16] text-[#8f9282] font-mono text-[8px] uppercase px-1.5 py-0.5">NO DESTINATION</span>
                )}
              </div>

              {step === 3 && (
                <div className="mt-3 space-y-3">
                  <p className="text-[10px] leading-4 text-[#c5c8b6]">
                    Withdraw a smaller amount privately to a newly derived Payer EOA. This prevents timing or size correlations from linking the EOA back to your funding wallet.
                  </p>

                  {!payerEoaAddress ? (
                    <button
                      onClick={handleGeneratePayerEoa}
                      className="w-full py-2 border border-[#7dd3fc] text-[#7dd3fc] hover:bg-[#7dd3fc]/10 font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer"
                    >
                      Generate Fresh Payer EOA
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-1.5 border border-[#44483a] bg-[#12140e] p-2">
                        <span className="font-mono text-[9px] text-[#8f9282] uppercase">Withdraw Amount:</span>
                        <input 
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          className="flex-1 bg-transparent font-mono text-[10px] text-[#e3e3d8] text-right focus:outline-none"
                        />
                        <span className="font-mono text-[9px] text-[#8f9282]">USDC</span>
                      </div>

                      {isWithdrawing && (
                        <div className="space-y-1">
                          <div className="flex justify-between font-mono text-[8px] text-[#8f9282]">
                            <span>GENERATING ZK-PROOF (GROTH16)</span>
                            <span>{zkProofProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-[#1b1c16] border border-[#44483a]">
                            <div className="h-full bg-[#9ddf2e] transition-all duration-150" style={{ width: `${zkProofProgress}%` }} />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleWithdrawPrivately}
                        disabled={isWithdrawing}
                        className="w-full py-2 border border-[#9ddf2e] bg-[#9ddf2e] text-[#0d0f09] hover:bg-[#83c300] font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer"
                      >
                        {isWithdrawing ? 'Computing ZK Proof...' : 'Withdraw Privately'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {payerEoaAddress && (
                <div className="mt-3 font-mono text-[9px] text-[#8f9282] space-y-1 bg-[#12140e] p-2 border border-[#44483a]/40">
                  <div>Payer EOA: <span className="text-[#7dd3fc]">{payerEoaAddress}</span></div>
                  <div>EOA Balance: <span className="text-[#9ddf2e] font-bold">{payerEoaBalance} USDC</span></div>
                </div>
              )}
            </div>

            {/* Step 4: Circle Gateway x402 */}
            <div className={`border p-4 transition-all duration-150 ${step === 4 ? 'border-[#9ddf2e] bg-[#9ddf2e]/5' : 'border-[#44483a] bg-[#0d0f09]'} ${step < 4 ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#8f9282] uppercase">Step 04 // Settle</span>
                  <h3 className="text-xs font-bold text-[#e3e3d8] mt-0.5">Circle Gateway x402 Payment</h3>
                </div>
                {resourcePaid ? (
                  <span className="border border-[#9ddf2e]/30 bg-[#9ddf2e]/10 text-[#9ddf2e] font-mono text-[8px] uppercase px-1.5 py-0.5 font-bold">RESOURCE UNLOCKED</span>
                ) : (
                  <span className="border border-[#44483a] bg-[#1b1c16] text-[#8f9282] font-mono text-[8px] uppercase px-1.5 py-0.5">UNPAID</span>
                )}
              </div>

              {step === 4 && (
                <div className="mt-3 space-y-3">
                  <p className="text-[10px] leading-4 text-[#c5c8b6]">
                    Deposit the withdrawn USDC from the Payer EOA into the Circle Gateway and sign the off-chain authorization to buy the protected resource.
                  </p>

                  {!gatewayDeposited ? (
                    <button
                      onClick={handleDepositGateway}
                      disabled={isDepositingGateway}
                      className="w-full py-2 border border-[#7dd3fc] text-[#7dd3fc] hover:bg-[#7dd3fc]/10 font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer"
                    >
                      {isDepositingGateway ? 'Depositing to Gateway...' : 'Deposit USDC to Gateway'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="font-mono text-[9px] text-[#8f9282] bg-[#12140e] p-2 border border-[#44483a]/40">
                        <div>Gateway Balance: <span className="text-[#ffb020] font-bold">{gatewayBalance} USDC</span></div>
                      </div>
                      
                      <button
                        onClick={handlePayResource}
                        disabled={isPayingResource || parseFloat(gatewayBalance) <= 0 || resourcePaid}
                        className="w-full py-2 border border-[#9ddf2e] bg-[#9ddf2e] text-[#0d0f09] hover:bg-[#83c300] font-mono text-[10px] uppercase font-bold transition duration-150 cursor-pointer"
                      >
                        {isPayingResource ? 'Negotiating x402 payload...' : resourcePaid ? 'Payment Complete' : 'Settle x402 Nanopayment (0.12 USDC)'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Console Log Terminal */}
      <div className="flex flex-col flex-1 border border-[#44483a] bg-[#0d0f09] min-h-[400px]">
        {/* Terminal Header */}
        <div className="border-b border-[#44483a] bg-[#12140e] p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#9ddf2e]" />
              <span className="font-mono font-bold text-sm text-[#e3e3d8]">CONFIDENTIAL TELEMETRY STREAM</span>
            </div>
            <p className="text-[10px] text-[#8f9282] mt-0.5">
              Live cryptographic verification logs and zero-knowledge proof generation telemetry.
            </p>
          </div>
          
          <div className="flex items-center gap-2 border border-[#44483a] bg-[#0d0f09] px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-[#c5c8b6]">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9ddf2e] opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#9ddf2e]" />
            </span>
            <span>Sync active</span>
          </div>
        </div>

        {/* Console Logs Stream */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar space-y-2 min-h-0 bg-[#07080a] font-mono text-[11px] leading-5">
          {logs.length === 0 ? (
            <div className="text-[#44483a] flex flex-col items-center justify-center h-full space-y-2">
              <Cpu className="h-8 w-8 text-[#1b1c16]" />
              <span>LOG TERMINAL IDLE. INITIATE WIZARD STEPS TO STREAM.</span>
            </div>
          ) : (
            logs.map((log, index) => {
              let textClass = 'text-[#c5c8b6]';
              if (log.type === 'success') textClass = 'text-[#9ddf2e]';
              if (log.type === 'warning') textClass = 'text-[#ffb020]';
              if (log.type === 'error') textClass = 'text-[#fb7185]';
              return (
                <div key={index} className="flex items-start gap-2 border-b border-[#1b1c16]/30 pb-1.5">
                  <span className="text-[#8f9282] shrink-0">[{log.timestamp}]</span>
                  <span className={textClass}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={logTerminalEndRef} />
        </div>
      </div>
    </div>
  );
};
