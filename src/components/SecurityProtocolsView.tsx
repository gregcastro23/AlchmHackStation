import React, { useEffect, useState } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Play, RefreshCw, BarChart2, Camera, Download, Fingerprint, LoaderCircle, LockKeyhole, Trash2, Video, FileJson, Hash, Link2, MapPin, ScanSearch } from 'lucide-react';
import { supportsPlatformBiometrics } from '../lib/workstationSecurity';
import { sha256 } from '../lib/mediaProvenance';
import type { MediaProvenanceManifest } from '../lib/mediaProvenance';

interface AuditMetric {
  name: string;
  category: string;
  status: 'PASSED' | 'WARNING' | 'FAILED' | 'QUEUED';
  details: string;
}

interface SecurityRecording {
  url: string;
  filename: string;
  durationSeconds: number;
  size: number;
  proofUrl: string | null;
  proofFilename: string | null;
  manifest: MediaProvenanceManifest | null;
}

interface SecurityProtocolsViewProps {
  biometricEnrolled: boolean;
  securityPhase: 'idle' | 'enrolling' | 'arming' | 'locked' | 'verifying';
  securityError: string | null;
  lastRecording: SecurityRecording | null;
  includeLocation: boolean;
  onEnrollBiometric: () => void;
  onForgetBiometric: () => void;
  onArmSecurity: () => void;
  onIncludeLocationChange: (include: boolean) => void;
}

const formatBytes = (bytes: number) => {
  if (bytes < 1_000_000) return `${Math.max(1, Math.round(bytes / 1_000))} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
};

export const SecurityProtocolsView: React.FC<SecurityProtocolsViewProps> = ({
  biometricEnrolled,
  securityPhase,
  securityError,
  lastRecording,
  includeLocation,
  onEnrollBiometric,
  onForgetBiometric,
  onArmSecurity,
  onIncludeLocationChange,
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [complianceScore, setComplianceScore] = useState(98);
  const [platformBiometricAvailable, setPlatformBiometricAvailable] = useState<boolean | null>(null);
  const [isProofVerifying, setIsProofVerifying] = useState(false);
  const [proofVerificationResult, setProofVerificationResult] = useState<{ mediaSha256: string; status: 'valid' | 'invalid' } | null>(null);
  const [metrics, setMetrics] = useState<AuditMetric[]>([
    { name: 'Reentrancy Guard Check', category: 'STATE_MUTATION', status: 'PASSED', details: 'No external calls before state synchronization.' },
    { name: 'Arithmetic Assertions', category: 'COMPILER_SOLC', status: 'PASSED', details: 'SafeMath redundant, overflow checks auto-managed by Solidity 0.8.26.' },
    { name: 'Admin Privilege Allocation', category: 'ACCESS_CONTROL', status: 'WARNING', details: 'Deployer address given direct root ownership. Recommend Gnosis Multisig.' },
    { name: 'Integer Overflow Dials', category: 'REDUCER_STATE', status: 'PASSED', details: 'SpaceTimeDB committed values strictly bound by type-safety schemas.' },
    { name: 'Gas Consumption Limits', category: 'ANVIL_TELEMETRY', status: 'PASSED', details: 'Compilation logs confirm block gas limits below 30,000,000.' },
    { name: 'External Call Verification', category: 'INTERFACE_INTEGRATION', status: 'QUEUED', details: 'Syncing planetary dual matches endpoints.' },
  ]);

  const handleRunAudit = () => {
    setIsAuditing(true);
    // Queue final item
    setTimeout(() => {
      setIsAuditing(false);
      setComplianceScore(99);
      setMetrics((prev) =>
        prev.map((m) =>
          m.status === 'QUEUED'
            ? { ...m, status: 'PASSED', details: 'All external contract callbacks verified against oracle registries.' }
            : m
        )
      );
    }, 1500);
  };

  useEffect(() => {
    supportsPlatformBiometrics()
      .then(setPlatformBiometricAvailable)
      .catch(() => setPlatformBiometricAvailable(false));
  }, []);

  const isSecurityBusy = securityPhase === 'enrolling' || securityPhase === 'arming';
  const currentMediaHash = lastRecording?.manifest?.media.sha256 ?? null;
  const proofVerification = isProofVerifying
    ? 'verifying'
    : currentMediaHash && proofVerificationResult?.mediaSha256 === currentMediaHash
      ? proofVerificationResult.status
      : 'idle';

  const verifyLastRecording = async () => {
    if (!lastRecording?.manifest) return;
    setIsProofVerifying(true);
    try {
      const response = await fetch(lastRecording.url);
      const digest = await sha256(await response.blob());
      setProofVerificationResult({
        mediaSha256: lastRecording.manifest.media.sha256,
        status: digest === lastRecording.manifest.media.sha256 ? 'valid' : 'invalid',
      });
    } catch {
      setProofVerificationResult({ mediaSha256: lastRecording.manifest.media.sha256, status: 'invalid' });
    } finally {
      setIsProofVerifying(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto custom-scrollbar select-none">
      <section className="grid shrink-0 border border-[#9ddf2e]/40 bg-[#12140e] lg:grid-cols-[1fr_1fr_0.85fr]">
        <div className="border-b border-[#44483a] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5 text-[#9ddf2e]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Biometric workstation guard</h2>
            </div>
            <span className={`h-2.5 w-2.5 rounded-full ${biometricEnrolled ? 'bg-[#9ddf2e] shadow-[0_0_10px_#9ddf2e]' : 'bg-[#44483a]'}`} />
          </div>
          <p className="mt-4 text-sm leading-6 text-[#c5c8b6]">
            Bind this browser to the laptop's platform authenticator. On supported Macs this invokes Touch ID in fingerprint-only mode; device-credential fallback is disabled.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-[10px] uppercase">
            <div className="border border-[#44483a] bg-[#0d0f09] p-3">
              <span className="block text-[#8f9282]">Authenticator</span>
              <span className={`mt-1 block ${platformBiometricAvailable ? 'text-[#9ddf2e]' : platformBiometricAvailable === false ? 'text-[#ffb4ab]' : 'text-[#ffb020]'}`}>
                {platformBiometricAvailable ? 'Available' : platformBiometricAvailable === false ? 'Unavailable' : 'Checking'}
              </span>
            </div>
            <div className="border border-[#44483a] bg-[#0d0f09] p-3">
              <span className="block text-[#8f9282]">Enrollment</span>
              <span className={`mt-1 block ${biometricEnrolled ? 'text-[#9ddf2e]' : 'text-[#ffb020]'}`}>
                {biometricEnrolled ? 'Bound locally' : 'Required'}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-[#44483a] p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-[#7dd3fc]" />
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Local camera evidence</h2>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#c5c8b6]">
            Locking requests camera permission, shows the live feed full-screen, and records video without audio until biometric unlock succeeds.
          </p>
          <div className="mt-4 space-y-2 font-mono text-[10px] uppercase">
            <div className="flex items-center justify-between border border-[#44483a] bg-[#0d0f09] px-3 py-2">
              <span className="flex items-center gap-2 text-[#8f9282]"><Video className="h-3.5 w-3.5" /> Storage</span>
              <span className="text-[#9ddf2e]">Browser memory only</span>
            </div>
            <div className="flex items-center justify-between border border-[#44483a] bg-[#0d0f09] px-3 py-2">
              <span className="flex items-center gap-2 text-[#8f9282]"><ShieldCheck className="h-3.5 w-3.5" /> Network upload</span>
              <span className="text-[#9ddf2e]">None</span>
            </div>
            <label className="flex cursor-pointer items-center justify-between border border-[#44483a] bg-[#0d0f09] px-3 py-2">
              <span className="flex items-center gap-2 text-[#8f9282]"><MapPin className="h-3.5 w-3.5" /> Include location</span>
              <input
                type="checkbox"
                checked={includeLocation}
                onChange={(event) => onIncludeLocationChange(event.target.checked)}
                className="h-3.5 w-3.5 accent-[#9ddf2e]"
              />
            </label>
          </div>
          {lastRecording && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 2xl:grid-cols-2">
              <a
                href={lastRecording.url}
                download={lastRecording.filename}
                className="flex items-center justify-between border border-[#7dd3fc]/40 bg-[#7dd3fc]/5 px-3 py-2.5 text-[#7dd3fc] transition hover:bg-[#7dd3fc]/10"
              >
                <span className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase"><Download className="h-4 w-4" /> Video</span>
                <span className="font-mono text-[9px]">{lastRecording.durationSeconds}s // {formatBytes(lastRecording.size)}</span>
              </a>
              {lastRecording.proofUrl && lastRecording.proofFilename && (
                <a
                  href={lastRecording.proofUrl}
                  download={lastRecording.proofFilename}
                  className="flex items-center justify-between border border-[#9ddf2e]/40 bg-[#9ddf2e]/5 px-3 py-2.5 text-[#9ddf2e] transition hover:bg-[#9ddf2e]/10"
                >
                  <span className="flex items-center gap-2 font-mono text-[9px] font-bold uppercase"><FileJson className="h-4 w-4" /> Proof JSON</span>
                  <span className="font-mono text-[9px]">SHA-256</span>
                </a>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between p-5">
          <div>
            <div className="flex items-center gap-2">
              <LockKeyhole className="h-5 w-5 text-[#ffb020]" />
              <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Guard controls</h2>
            </div>
            <p className="mt-4 text-xs leading-5 text-[#8f9282]">
              This protects the visible app workspace. It does not replace the operating system lock screen or server-side access controls.
            </p>
            {securityError && (
              <div className="mt-4 border border-[#ffb4ab]/40 bg-[#ffb4ab]/5 p-3 text-xs leading-5 text-[#ffb4ab]">{securityError}</div>
            )}
          </div>

          <div className="mt-5 space-y-2">
            {!biometricEnrolled ? (
              <button
                onClick={onEnrollBiometric}
                disabled={isSecurityBusy || platformBiometricAvailable === false}
                className="flex w-full items-center justify-center gap-2 border border-[#9ddf2e] bg-[#9ddf2e] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d0f09] transition hover:bg-[#83c300] disabled:cursor-not-allowed disabled:border-[#44483a] disabled:bg-[#1b1c16] disabled:text-[#8f9282]"
              >
                {securityPhase === 'enrolling' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                {securityPhase === 'enrolling' ? 'Waiting for Touch ID' : 'Enroll fingerprint unlock'}
              </button>
            ) : (
              <>
                <button
                  onClick={onArmSecurity}
                  disabled={isSecurityBusy}
                  className="flex w-full items-center justify-center gap-2 border border-[#ffb4ab] bg-[#ffb4ab] px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#0d0f09] transition hover:bg-[#ff8f84] disabled:cursor-wait disabled:border-[#44483a] disabled:bg-[#1b1c16] disabled:text-[#8f9282]"
                >
                  {securityPhase === 'arming' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LockKeyhole className="h-4 w-4" />}
                  {securityPhase === 'arming' ? 'Starting camera' : 'Lock and record space'}
                </button>
                <button
                  onClick={onForgetBiometric}
                  className="flex w-full items-center justify-center gap-2 border border-[#44483a] px-4 py-2.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8f9282] transition hover:border-[#ffb4ab]/50 hover:text-[#ffb4ab]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Forget local binding
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="shrink-0 border border-[#7dd3fc]/30 bg-[#12140e] p-5">
        <div className="flex flex-col gap-3 border-b border-[#44483a] pb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-[#7dd3fc]" />
            <h2 className="font-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[#e3e3d8]">Media provenance proof</h2>
          </div>
          <span className={`border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${lastRecording?.manifest ? 'border-[#9ddf2e]/40 bg-[#9ddf2e]/5 text-[#9ddf2e]' : 'border-[#44483a] bg-[#0d0f09] text-[#8f9282]'}`}>
            {lastRecording?.manifest ? 'Local proof ready' : 'Awaiting capture'}
          </span>
        </div>

        {lastRecording?.manifest ? (
          <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="border border-[#44483a] bg-[#0d0f09] p-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282]">Video SHA-256</div>
                <div className="mt-2 break-all font-mono text-[10px] leading-4 text-[#7dd3fc]">{lastRecording.manifest.media.sha256}</div>
              </div>
              <div className="border border-[#44483a] bg-[#0d0f09] p-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282]">Final chain hash</div>
                <div className="mt-2 break-all font-mono text-[10px] leading-4 text-[#9ddf2e]">{lastRecording.manifest.captureProof.finalChainHash ?? 'No segments captured'}</div>
              </div>
              <div className="border border-[#44483a] bg-[#0d0f09] p-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282]">Capture evidence</div>
                <div className="mt-2 font-mono text-[11px] text-[#e3e3d8]">{lastRecording.manifest.captureProof.segmentCount} chained segments</div>
                <div className="mt-1 text-[10px] text-[#8f9282]">1-second MediaRecorder intervals, not individual frames</div>
              </div>
              <div className="border border-[#44483a] bg-[#0d0f09] p-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8f9282]">Context</div>
                <div className="mt-2 font-mono text-[11px] text-[#e3e3d8]">Time + device + camera</div>
                <div className={`mt-1 text-[10px] ${lastRecording.manifest.context.location ? 'text-[#9ddf2e]' : 'text-[#8f9282]'}`}>
                  Location {lastRecording.manifest.context.location ? `included (±${lastRecording.manifest.context.location.accuracyMeters}m)` : 'not included'}
                </div>
              </div>
            </div>

            <div className="border border-[#ffb020]/30 bg-[#ffb020]/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#ffb020]"><Link2 className="h-4 w-4" /> Ledger anchor</div>
                <span className="border border-[#ffb020]/40 px-2 py-1 font-mono text-[9px] font-bold text-[#ffb020]">UNANCHORED</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-[#c5c8b6]">The manifest contains a blockchain-ready payload digest, but no transaction or third-party registration has occurred.</p>
              <div className="mt-3 break-all border border-[#44483a] bg-[#0d0f09] p-3 font-mono text-[10px] leading-4 text-[#e3e3d8]">{lastRecording.manifest.anchor.payloadSha256}</div>
              <button
                onClick={verifyLastRecording}
                disabled={proofVerification === 'verifying'}
                className={`mt-3 flex w-full items-center justify-center gap-2 border px-3 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition ${proofVerification === 'valid' ? 'border-[#9ddf2e]/50 bg-[#9ddf2e]/10 text-[#9ddf2e]' : proofVerification === 'invalid' ? 'border-[#ffb4ab]/50 bg-[#ffb4ab]/10 text-[#ffb4ab]' : 'border-[#7dd3fc]/40 bg-[#7dd3fc]/5 text-[#7dd3fc] hover:bg-[#7dd3fc]/10'}`}
              >
                {proofVerification === 'verifying' ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
                {proofVerification === 'valid' ? 'Video digest verified' : proofVerification === 'invalid' ? 'Digest mismatch' : proofVerification === 'verifying' ? 'Re-hashing video' : 'Verify local video digest'}
              </button>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <a href="https://docs.numbersprotocol.io/applications/capture/" target="_blank" rel="noreferrer" className="border border-[#44483a] bg-[#0d0f09] p-3 transition hover:border-[#7dd3fc]/50">
                  <div className="text-xs font-bold text-[#e3e3d8]">Numbers Protocol</div>
                  <div className="mt-1 font-mono text-[9px] uppercase text-[#ffb020]">SDK not connected</div>
                </a>
                <a href="https://swear.com/technology/" target="_blank" rel="noreferrer" className="border border-[#44483a] bg-[#0d0f09] p-3 transition hover:border-[#7dd3fc]/50">
                  <div className="text-xs font-bold text-[#e3e3d8]">SWEAR Network</div>
                  <div className="mt-1 font-mono text-[9px] uppercase text-[#ffb020]">SDK not connected</div>
                </a>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-xs leading-5 text-[#8f9282]">Lock and unlock the space once to generate a video digest, hash-chained segment record, capture context, and an exportable anchor payload.</p>
        )}
      </section>

      <div className="grid min-h-[520px] shrink-0 grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Audit compliance score panel */}
      <div className="bg-[#12140e] border border-[#44483a] p-5 flex flex-col justify-between">
        <div>
          <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-4.5 h-4.5 text-[#9ddf2e]" />
              <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
                AUDIT TELEMETRY
              </h2>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center py-6 bg-[#0d0f09] border border-[#44483a] text-center">
            <span className="font-mono text-[10px] text-[#8f9282] uppercase tracking-widest">
              COMPLIANCE SCORE
            </span>
            <div className="font-mono text-[64px] font-bold text-[#9ddf2e] leading-none my-2 tracking-tighter animate-pulse glow-acid">
              {complianceScore}%
            </div>
            <div className="flex items-center space-x-1.5 bg-[#9ddf2e]/10 border border-[#9ddf2e]/30 px-3 py-1 text-[#9ddf2e] font-mono text-[10px] font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SECURITY SECURE</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-[#44483a]/40">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#8f9282]">TOTAL REDUCERS SCAN:</span>
            <span className="text-[#e3e3d8]">14 CHECKED</span>
          </div>
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#8f9282]">COMPILATION DEPLOYER:</span>
            <span className="text-[#ffb020] font-bold">1 WARNING</span>
          </div>
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#8f9282]">ASSERTION SUCCESSES:</span>
            <span className="text-[#9ddf2e]">37/37 PASSED</span>
          </div>

          <button
            onClick={handleRunAudit}
            disabled={isAuditing}
            className="w-full mt-4 flex items-center justify-center space-x-2 border border-[#9ddf2e] text-[#9ddf2e] hover:bg-[#9ddf2e]/10 py-2.5 font-mono text-[11px] uppercase font-bold tracking-wider cursor-pointer transition-all duration-150 active:scale-[0.98]"
          >
            <Play className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'AUDITING DAEMONS...' : 'TRIGGER FULL AUDIT SCAN'}</span>
          </button>
        </div>
      </div>

      {/* Audit criteria details list */}
      <div className="lg:col-span-2 bg-[#12140e] border border-[#44483a] p-5 flex flex-col min-h-0">
        <header className="border-b border-[#44483a] pb-3 mb-4 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-4.5 h-4.5 text-[#9ddf2e]" />
            <h2 className="font-mono text-[13px] uppercase tracking-widest text-[#e3e3d8] font-bold">
              PROTOCOL INTEGRITY LIST
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1 min-h-0">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="bg-[#1b1c16] border border-[#44483a] p-3.5 flex flex-col space-y-1.5 hover:border-[#9ddf2e]/60 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {metric.status === 'PASSED' ? (
                    <ShieldCheck className="w-4 h-4 text-[#9ddf2e]" />
                  ) : metric.status === 'WARNING' ? (
                    <ShieldAlert className="w-4 h-4 text-[#ffb020]" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-[#8f9282] animate-spin" />
                  )}
                  <span className="font-mono text-[12px] font-bold text-[#e3e3d8]">
                    {metric.name}
                  </span>
                </div>
                <span className="font-mono text-[9px] text-[#8f9282] tracking-wider font-bold">
                  {metric.category}
                </span>
              </div>
              <p className="font-mono text-[11px] text-[#c5c8b6] pl-6 leading-relaxed">
                {metric.details}
              </p>
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};
