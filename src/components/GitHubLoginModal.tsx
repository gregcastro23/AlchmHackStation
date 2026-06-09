import React, { useState } from 'react';
import { Key, ShieldAlert, Cpu, ArrowRight, CheckCircle2 } from 'lucide-react';

interface GitHubLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (username: string, avatarUrl: string) => void;
}

export const GitHubLoginModal: React.FC<GitHubLoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authStep, setAuthStep] = useState<'IDLE' | 'AUTHORIZING' | 'SUCCESS'>('IDLE');
  const [logs, setLogs] = useState<string[]>([]);

  const handleClose = () => {
    setAuthStep('IDLE');
    setLogs([]);
    onClose();
  };

  if (!isOpen) return null;

  const handleAuthorize = () => {
    setAuthStep('AUTHORIZING');
    const logsSequence = [
      'operator@alchm ~ % initiating oauth token request...',
      'handshaking via secure ssl with api.github.com...',
      'exchange parameters: client_id: alchm_cli_9d, response_type: code',
      'scopes authorized: read:user, write:database_reducers, read:repos',
      'verifying authorization signature against anvil keys...',
      'oauth authorization binding committed!',
    ];

    logsSequence.forEach((log, index) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, log]);
        if (index === logsSequence.length - 1) {
          setTimeout(() => {
            setAuthStep('SUCCESS');
            setTimeout(() => {
              setAuthStep('IDLE');
              setLogs([]);
              onLoginSuccess(
                'cookingwithcastro',
                'https://api.dicebear.com/7.x/pixel-art/svg?seed=castro&backgroundColor=12140e'
              );
            }, 1000);
          }, 600);
        }
      }, (index + 1) * 350);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="w-full max-w-[480px] bg-[#12140e] border border-[#9ddf2e]/30 shadow-[0_0_50px_rgba(157,223,46,0.1)] relative">
        {/* Title bar */}
        <div className="border-b border-[#44483a] bg-[#1b1c16] px-4 py-2.5 flex items-center justify-between font-mono text-[11px] text-[#c5c8b6]">
          <div className="flex items-center space-x-1.5">
            <Key className="w-3.5 h-3.5 text-[#9ddf2e]" />
            <span className="tracking-wider uppercase">GITHUB OPERATOR CONNECT</span>
          </div>
          <button
            onClick={handleClose}
            className="hover:text-white transition-colors cursor-pointer"
            disabled={authStep === 'AUTHORIZING'}
          >
            [ESC] CANCEL
          </button>
        </div>

        {/* Content body */}
        <div className="p-6">
          {authStep === 'IDLE' && (
            <div className="space-y-6">
              {/* Telemetry Visual Node Handshake Diagram */}
              <div className="flex items-center justify-between bg-[#0d0f09] border border-[#44483a] p-4 text-center">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 border border-[#8f9282] bg-[#12140e] flex items-center justify-center">
                    <Key className="w-5 h-5 text-[#e3e3d8]" />
                  </div>
                  <span className="font-mono text-[10px] text-[#c5c8b6] uppercase">GitHub</span>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
                  <div className="w-full border-t border-dashed border-[#44483a] relative">
                    <div className="w-2.5 h-2.5 bg-[#9ddf2e] absolute top-1/2 left-0 -translate-y-1/2 rounded-full animate-[ping_1.5s_infinite]" />
                  </div>
                  <span className="font-mono text-[9px] text-[#9ddf2e] mt-1 bg-[#1b1c16] px-1.5 py-0.5 border border-[#44483a]/40">
                    OAUTH_PORT_8545
                  </span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 border border-[#9ddf2e] bg-[#12140e] flex items-center justify-center glow-acid">
                    <Cpu className="w-5 h-5 text-[#9ddf2e]" />
                  </div>
                  <span className="font-mono text-[10px] text-[#9ddf2e] uppercase font-bold">ALCHM_CLI</span>
                </div>
              </div>

              {/* Warnings and Scopes */}
              <div className="border border-[#44483a]/60 bg-[#1b1c16]/50 p-4 space-y-3 font-mono text-[12px] text-[#c5c8b6]">
                <div className="flex items-start space-x-2 text-[#ffb4ab]">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="uppercase text-[10px] tracking-wider font-bold">Security Privileges Requested</span>
                </div>
                <ul className="space-y-1.5 text-[11px] list-disc list-inside">
                  <li>Read profile details <span className="text-[#8f9282]">(user:email)</span></li>
                  <li>Write smart contract artifacts <span className="text-[#8f9282]">(repo:write)</span></li>
                  <li>Inject secure build secrets <span className="text-[#8f9282]">(admin:keys)</span></li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={handleClose}
                  className="flex-1 py-2.5 border border-[#44483a] text-[#c5c8b6] hover:bg-[#1b1c16] hover:text-white transition-colors cursor-pointer font-mono text-[12px] tracking-wide"
                >
                  ABORT SESSION
                </button>
                <button
                  onClick={handleAuthorize}
                  className="flex-1 py-2.5 border border-[#9ddf2e] text-[#9ddf2e] hover:bg-[#9ddf2e]/10 transition-colors cursor-pointer font-mono text-[12px] tracking-wide font-bold flex items-center justify-center space-x-2"
                >
                  <span>AUTHORIZE DEPLOY</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {authStep === 'AUTHORIZING' && (
            <div className="space-y-4">
              <div className="bg-[#0d0f09] border border-[#44483a] p-4 h-[180px] font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="flex space-x-1.5">
                    <span className="text-[#9ddf2e]">{'>'}</span>
                    <span className={log.includes('signature') || log.includes('scopes') ? 'text-[#7dd3fc]' : 'text-[#c5c8b6]'}>
                      {log}
                    </span>
                  </div>
                ))}
                <div className="flex items-center space-x-2 text-[#9ddf2e] animate-pulse pt-2">
                  <span className="w-1.5 h-3 bg-[#9ddf2e] block animate-pulse"></span>
                  <span>SYNCING WITH REMOTE HANDSHAKE...</span>
                </div>
              </div>
              <div className="w-full bg-[#1b1c16] h-1 border border-[#44483a] overflow-hidden">
                <div className="h-full bg-[#9ddf2e] animate-[pulse_1.5s_infinite]" style={{ width: `${(logs.length / 6) * 100}%` }}></div>
              </div>
            </div>
          )}

          {authStep === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
              <CheckCircle2 className="w-12 h-12 text-[#9ddf2e] animate-bounce glow-acid" />
              <div className="space-y-1">
                <h3 className="font-mono text-[14px] text-white font-bold uppercase tracking-wider">
                  AUTHORIZATION SUCCESSFUL
                </h3>
                <p className="font-mono text-[11px] text-[#c5c8b6]">
                  Profile synced to: <span className="text-[#9ddf2e] font-bold">cookingwithcastro</span>
                </p>
                <p className="font-mono text-[9px] text-[#8f9282] uppercase mt-2">
                  Session Token Saved to Local Storage (Simulated)
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
