import { useEffect, useRef, useState } from 'react';
import { Camera, Fingerprint, LoaderCircle, LockKeyhole, ShieldCheck, Video } from 'lucide-react';

interface WorkstationLockOverlayProps {
  stream: MediaStream;
  startedAt: number;
  isVerifying: boolean;
  error: string | null;
  onUnlock: () => void;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainder = (seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
};

export const WorkstationLockOverlay: React.FC<WorkstationLockOverlayProps> = ({
  stream,
  startedAt,
  isVerifying,
  error,
  onUnlock,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const updateElapsed = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    updateElapsed();
    const interval = window.setInterval(updateElapsed, 1000);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  return (
    <div className="fixed inset-0 z-[200] flex min-h-screen items-center justify-center overflow-y-auto bg-[#060704] p-4 text-[#c5c8b6]">
      <div className="absolute inset-0 eth-orbit-grid opacity-50" />
      <div className="relative z-10 grid w-full max-w-6xl overflow-hidden border border-[#9ddf2e]/50 bg-[#0d0f09] shadow-[0_0_80px_rgba(157,223,46,0.12)] lg:grid-cols-[1.25fr_0.75fr]">
        <section className="relative min-h-[360px] overflow-hidden border-b border-[#44483a] bg-black lg:min-h-[640px] lg:border-b-0 lg:border-r">
          <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          <div className="absolute left-4 top-4 flex items-center gap-2 border border-[#ffb4ab]/60 bg-black/70 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffb4ab]">
            <span className="h-2 w-2 rounded-full bg-[#ff5a52] animate-pulse" />
            REC // {formatDuration(elapsed)}
          </div>
          <div className="absolute right-4 top-4 flex items-center gap-2 border border-[#44483a] bg-black/70 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#e3e3d8]">
            <Camera className="h-3.5 w-3.5 text-[#7dd3fc]" />
            Local camera
          </div>
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#9ddf2e]">Visible security recording</div>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#e3e3d8]">
              Video remains in this browser session and is never uploaded. Recording stops immediately after the workstation is unlocked.
            </p>
          </div>
        </section>

        <section className="flex flex-col justify-between p-6 md:p-8">
          <div>
            <div className="flex h-14 w-14 items-center justify-center border border-[#9ddf2e] bg-[#9ddf2e]/10">
              <LockKeyhole className="h-6 w-6 text-[#9ddf2e]" />
            </div>
            <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.24em] text-[#8f9282]">Alchm ETHStation</div>
            <h1 className="mt-3 text-4xl font-bold tracking-[-0.04em] text-[#e3e3d8]">Space secured</h1>
            <p className="mt-4 text-sm leading-6 text-[#c5c8b6]">
              The build room is hidden behind this local workstation guard. Use the laptop's platform biometric authenticator to restore access.
            </p>

            <div className="mt-7 space-y-2 font-mono text-[10px] uppercase">
              <div className="flex items-center justify-between border border-[#44483a] bg-[#12140e] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[#8f9282]"><Video className="h-3.5 w-3.5" /> Camera</span>
                <span className="text-[#ffb4ab]">Recording locally</span>
              </div>
              <div className="flex items-center justify-between border border-[#44483a] bg-[#12140e] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[#8f9282]"><ShieldCheck className="h-3.5 w-3.5" /> Upload</span>
                <span className="text-[#9ddf2e]">Disabled</span>
              </div>
              <div className="flex items-center justify-between border border-[#44483a] bg-[#12140e] px-3 py-2.5">
                <span className="flex items-center gap-2 text-[#8f9282]"><Fingerprint className="h-3.5 w-3.5" /> Unlock</span>
                <span className="text-[#7dd3fc]">Fingerprint only</span>
              </div>
            </div>
          </div>

          <div className="mt-10">
            {error && (
              <div className="mb-3 border border-[#ffb4ab]/40 bg-[#ffb4ab]/5 p-3 text-xs leading-5 text-[#ffb4ab]">{error}</div>
            )}
            <button
              onClick={onUnlock}
              disabled={isVerifying}
              className="flex w-full items-center justify-center gap-3 border border-[#9ddf2e] bg-[#9ddf2e] px-5 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[#0d0f09] transition hover:bg-[#83c300] disabled:cursor-wait disabled:border-[#44483a] disabled:bg-[#1b1c16] disabled:text-[#8f9282]"
            >
              {isVerifying ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Fingerprint className="h-5 w-5" />}
              {isVerifying ? 'Waiting for verification' : 'Unlock with fingerprint'}
            </button>
            <p className="mt-3 text-center text-[10px] leading-4 text-[#8f9282]">
              Device credential fallback is disabled. Only fingerprint verification will restore access.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
