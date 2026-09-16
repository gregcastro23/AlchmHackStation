import React, { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactElement } from "react";
import {
  destinations as getDestinations,
  toPublic,
  eventLabel,
  normaliseEmail,
} from "../../lib/all-aboard/config";
import type {
  PublicDestination,
  DestinationKey,
} from "../../lib/all-aboard/config";
import {
  submitEnrolment,
  readCount,
  readQueue,
  flushOutbox,
} from "../../lib/all-aboard/fanout";
import type {
  Outcome,
  DestinationResult,
  EnrolStatus,
} from "../../lib/all-aboard/fanout";
import "./all-aboard.css";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RESET_CLEAN_MS = 5500;
const RESET_DETAILED_MS = 9000;
const IDLE_AFTER_MS = 45000;
const OUTBOX_RETRY_MS = 60000;

// ---------------------------------------------------------------------------
// SVG Sigils & Marks
// ---------------------------------------------------------------------------

function FireSigil(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <polygon points="12,3.5 20.5,19.5 3.5,19.5" />
    </svg>
  );
}

function WaterSigil(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <polygon points="12,20.5 3.5,4.5 20.5,4.5" />
    </svg>
  );
}

function EarthSigil(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <polygon points="12,20.5 3.5,4.5 20.5,4.5" />
      <line x1="7.6" y1="12.6" x2="16.4" y2="12.6" />
    </svg>
  );
}

function AirSigil(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <polygon points="12,3.5 20.5,19.5 3.5,19.5" />
      <line x1="6.4" y1="15" x2="17.6" y2="15" />
    </svg>
  );
}

function PentacleSigil(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9.2" strokeWidth="1.2" />
      <polygon points="12,4.5 14.3,9.5 19.8,10.1 15.6,13.9 16.9,19.3 12,16.4 7.1,19.3 8.4,13.9 4.2,10.1 9.7,9.5" strokeWidth="1.2" />
    </svg>
  );
}

function MercuryMark(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" focusable="false">
      <path d="M8.4 3.2a3.6 3.6 0 0 0 7.2 0" />
      <circle cx="12" cy="11.4" r="4.2" />
      <line x1="12" y1="15.6" x2="12" y2="21.2" />
      <line x1="9.2" y1="18.6" x2="14.8" y2="18.6" />
    </svg>
  );
}

function DestinationMark({ element }: { element: "fire" | "mercury" | "pentacle" }): ReactElement {
  if (element === "fire") return <FireSigil />;
  if (element === "mercury") return <MercuryMark />;
  return <PentacleSigil />;
}

// ---------------------------------------------------------------------------
// Realm Inspection Modal
// ---------------------------------------------------------------------------

interface RealmModalProps {
  destination: PublicDestination | null;
  onClose: () => void;
}

function RealmModal({ destination, onClose }: RealmModalProps) {
  if (!destination) return null;

  const getDetails = (key: DestinationKey) => {
    switch (key) {
      case "kitchen":
        return {
          title: "Alchm Kitchen — Celestial Gastronomy",
          tag: "Sanctum of Sustenance",
          color: "#ef4444",
          bullets: [
            "Real-time celestial positioning calculated over your location.",
            "Dynamic dietary recipes tuned to planetary elements and transits.",
            "Personalized nutritional consensus linked to your natal temperament.",
          ],
        };
      case "agents":
        return {
          title: "Planetary Agents — Sovereign Consciousness",
          tag: "Autonomous Intelligence Council",
          color: "#38bdf8",
          bullets: [
            "Autonomous agents embodied with distinct planetary archetypes.",
            "Solana wallet-bound identity with cryptographic attestation.",
            "Multi-agent council consensus debates across market and cosmic events.",
          ],
        };
      case "pentacles":
        return {
          title: "Pentacles Arena — SpacetimeDB Deck Battles",
          tag: "Real-time Celestial Gaming",
          color: "#fbbf24",
          bullets: [
            "Multiplayer astrological tactical battles powered by SpacetimeDB.",
            "78-card Tarot & Decan synthesis seeded by exact celestial coordinates.",
            "Token-2022 on-chain settlement, staking, and deck progression.",
          ],
        };
    }
  };

  const details = getDetails(destination.key);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full bg-[#0d071a] border border-[var(--aa-line-hot)] rounded-2xl p-6 md:p-8 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/10"
              style={{ color: details.color, background: `${details.color}15` }}
            >
              <DestinationMark element={destination.element} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">{details.title}</h3>
              <p className="text-xs font-mono text-[var(--aa-violet)]">{details.tag}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg w-8 h-8 rounded-full flex items-center justify-center border border-white/10 hover:border-white/30 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <p className="text-sm text-gray-300 leading-relaxed mb-5">
          {destination.tagline}
        </p>

        <div className="space-y-2.5 mb-6">
          <div className="text-xs font-mono uppercase tracking-wider text-gray-400">Core Architecture</div>
          {details.bullets.map((b, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
              <span className="text-amber-400 mt-0.5">✦</span>
              <span>{b}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-xs font-mono text-gray-400">{destination.label}</span>
          <a
            href={destination.href}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-semibold rounded-lg text-black bg-gradient-to-r from-amber-300 to-amber-500 hover:brightness-110 transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            <span>Launch Realm</span>
            <span>↗</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface Props {
  initialEvent?: string;
  isEmbedded?: boolean;
}

export function AllAboardKiosk({ initialEvent, isEmbedded = false }: Props) {
  const [destinations, setDestinations] = useState<PublicDestination[]>(() =>
    getDestinations().map(toPublic)
  );
  const [event, setEvent] = useState<string>(() => initialEvent || eventLabel());
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [joinedToday, setJoinedToday] = useState(0);
  const [pendingQueue, setPendingQueue] = useState(0);
  const [idle, setIdle] = useState(false);
  const [inspectingRealm, setInspectingRealm] = useState<PublicDestination | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const idleTimer = useRef<number | null>(null);

  // Sync count and queue from localStorage
  const refreshMetrics = useCallback(() => {
    setJoinedToday(readCount());
    setPendingQueue(readQueue().length);
  }, []);

  useEffect(() => {
    refreshMetrics();

    // Outbox background flush interval
    const flushInterval = window.setInterval(async () => {
      const cleared = await flushOutbox();
      if (cleared > 0) refreshMetrics();
    }, OUTBOX_RETRY_MS);

    const onOnline = async () => {
      const cleared = await flushOutbox();
      if (cleared > 0) refreshMetrics();
    };

    window.addEventListener("online", onOnline);

    return () => {
      window.clearInterval(flushInterval);
      window.removeEventListener("online", onOnline);
    };
  }, [refreshMetrics]);

  // Check endpoint wiring status
  useEffect(() => {
    fetch("/api/all-aboard")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.destinations)) {
          setDestinations(data.destinations);
          if (data.event) setEvent(data.event);
        }
      })
      .catch(() => {
        // Dev offline fallback
      });
  }, []);

  // Idle attract timer
  const bumpIdle = useCallback(() => {
    setIdle(false);
    if (idleTimer.current) window.clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setIdle(true), IDLE_AFTER_MS);
  }, []);

  useEffect(() => {
    bumpIdle();
    const events = ["pointerdown", "keydown", "focusin", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, bumpIdle, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, bumpIdle));
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
    };
  }, [bumpIdle]);

  // Focus input automatically on mount
  useEffect(() => {
    if (!outcome) {
      inputRef.current?.focus();
    }
  }, [outcome]);

  // Hotkey support: Esc / Enter to advance
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (outcome && (e.key === "Escape" || e.key === "Enter")) {
        e.preventDefault();
        setOutcome(null);
        setEmail("");
        setName("");
        setError(null);
        refreshMetrics();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [outcome, refreshMetrics]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;

    const validated = normaliseEmail(email);
    if (!validated) {
      setError("Please enter a valid email address");
      inputRef.current?.focus();
      return;
    }

    setSending(true);
    setError(null);

    try {
      const res = await submitEnrolment(validated, name, event);
      setOutcome(res);
      refreshMetrics();

      // Auto-reset confirmation timer
      const timeoutMs = res.allOk ? RESET_CLEAN_MS : RESET_DETAILED_MS;
      window.setTimeout(() => {
        setOutcome((current) => {
          if (current?.email === res.email) {
            setEmail("");
            setName("");
            setError(null);
            return null;
          }
          return current;
        });
      }, timeoutMs);
    } catch (err: any) {
      setError(err.message || "Could not register address. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleReset = () => {
    setOutcome(null);
    setEmail("");
    setName("");
    setError(null);
    refreshMetrics();
  };

  const resetMs = outcome?.allOk ? RESET_CLEAN_MS : RESET_DETAILED_MS;

  return (
    <div className={`aa-root ${isEmbedded ? "aa-embedded rounded-2xl overflow-hidden" : ""}`} data-idle={idle}>
      {/* Sky Backdrop & Astrolabe Wheels */}
      <div className="aa-sky" aria-hidden="true">
        <div className="aa-nebula aa-nebula--violet" />
        <div className="aa-nebula aa-nebula--ember" />
        <div className="aa-nebula aa-nebula--teal" />
        <div className="aa-nebula aa-nebula--gold" />
        <div className="aa-stars aa-stars--far" />
        <div className="aa-stars aa-stars--near" />

        {/* Great Astrolabe Outer Wheel */}
        <svg className="aa-wheel" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="aa-wheel-outer" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="45%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#aa-wheel-outer)" strokeWidth="0.9" strokeLinecap="round">
            <circle cx="200" cy="200" r="198" />
            <circle cx="200" cy="200" r="176" strokeDasharray="1 9" />
            <circle cx="200" cy="200" r="140" />
            <rect x="94" y="94" width="212" height="212" />
            <circle cx="200" cy="200" r="106" />
            <polygon points="200,100 291,255 109,255" />
            <circle cx="200" cy="200" r="55" strokeDasharray="6 6" />
          </g>
        </svg>

        {/* Counter Astrolabe Wheel */}
        <svg className="aa-wheel aa-wheel--counter" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id="aa-wheel-inner" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#aa-wheel-inner)" strokeWidth="0.9" strokeLinecap="round">
            <circle cx="200" cy="200" r="198" />
            <circle cx="200" cy="200" r="150" strokeDasharray="2 8" />
            <polygon points="200,90 295,255 105,255" />
            <circle cx="200" cy="200" r="75" />
          </g>
        </svg>

        <div className="aa-vignette" />
      </div>

      {/* Main Kiosk Content Shell */}
      <main className="aa-shell">
        {/* Five Alchemical Sigils: Fire, Water, Earth, Air, and Pentacle */}
        <div className="aa-sigils" aria-label="Alchemical Elements">
          <span className="aa-sigil aa-sigil--fire" title="Fire"><FireSigil /></span>
          <span className="aa-sigil aa-sigil--water" title="Water"><WaterSigil /></span>
          <span className="aa-sigil aa-sigil--earth" title="Earth"><EarthSigil /></span>
          <span className="aa-sigil aa-sigil--air" title="Air"><AirSigil /></span>
          <span className="aa-sigil aa-sigil--pentacle" title="Quintessence & Celestial Pentacle"><PentacleSigil /></span>
        </div>

        <p className="aa-eyebrow">
          <span>✦</span>
          <span>The Alchm Ecosystem Triad</span>
          <span>✦</span>
        </p>

        <h1 className="aa-title">
          All <em>Aboard</em>
        </h1>

        <p className="aa-lede">
          Three realms, one transmission. Leave your email and you are enrolled across
          the entire Alchm ecosystem: <strong>alchm.kitchen</strong> for celestial gastronomy,{" "}
          <strong>agents.alchm.kitchen</strong> for planetary consciousness agents, and{" "}
          <strong>pentacles.alchm.kitchen</strong> for real-time SpacetimeDB card arena battles.
          No passwords, no friction — just an address.
        </p>

        {/* Email Entry Card */}
        <div className="aa-card">
          <form className="aa-form" onSubmit={handleSubmit} noValidate autoComplete="off">
            <div className="aa-field">
              <div className="aa-input-wrap">
                <input
                  ref={inputRef}
                  className="aa-input"
                  type="email"
                  inputMode="email"
                  name="alchm_join_address"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-form-type="other"
                  aria-label="Your email address"
                  aria-invalid={error ? "true" : "false"}
                  placeholder="seeker@alchm.kitchen"
                  value={email}
                  disabled={sending}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                />
              </div>

              <button className="aa-submit" type="submit" disabled={sending}>
                {sending ? (
                  <>
                    <span className="aa-spinner" aria-hidden="true" />
                    <span>Transmitting…</span>
                  </>
                ) : (
                  <>Count me in ✦</>
                )}
              </button>
            </div>

            <div className="aa-optional">
              <input
                className="aa-optional-input"
                type="text"
                name="alchm_join_caller"
                autoComplete="off"
                spellCheck={false}
                data-1p-ignore="true"
                data-lpignore="true"
                aria-label="Your first name or moniker (optional)"
                placeholder="First name or moniker — optional, makes greetings harmonious"
                value={name}
                disabled={sending}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
            </div>

            <p className="aa-error" role="alert">
              {error}
            </p>

            <p className="aa-fineprint">
              One welcome transmission from Greg and nothing unsolicited. Unsubscribe at any celestial moment.
            </p>
          </form>
        </div>

        {/* Triad Destination Cards (Kitchen, Agents, Pentacles) */}
        <div className="aa-dests">
          {destinations.map((dest) => (
            <div
              key={dest.key}
              className={`aa-dest aa-dest--${dest.key} cursor-pointer group`}
              onClick={() => setInspectingRealm(dest)}
            >
              <div className="aa-dest-header">
                <span className="aa-dest-mark" style={{ color: dest.accentColor, borderColor: `${dest.accentColor}40` }}>
                  <DestinationMark element={dest.element} />
                </span>
                <span className="aa-dest-badge">{dest.badge}</span>
              </div>

              <span className="aa-dest-name group-hover:text-amber-300 transition-colors">
                <span>{dest.label}</span>
                <span className="text-xs opacity-70">↗</span>
              </span>

              <span className="aa-dest-tag">{dest.tagline}</span>

              <div className="aa-dest-footer">
                <span className="aa-dest-state">
                  <span className={`aa-dot ${dest.configured ? "aa-dot--live" : "aa-dot--warn"}`} />
                  <span>{dest.configured ? "Live Triad" : "Staged"}</span>
                </span>
                <span className="text-[10px] text-amber-400/80 group-hover:underline">Inspect Details ✦</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Metrics & Dynamic Event Attribution */}
        <div className="aa-footer">
          <span className="aa-pill">
            <strong>alchm.kitchen/All-Aboard</strong>
          </span>
          <span className="aa-pill aa-pill--count">
            <strong>{joinedToday}</strong>
            <span>joined here today</span>
          </span>
          <span className="aa-pill aa-pill--event">
            <strong>Event:</strong>
            <span>{event}</span>
          </span>
          {pendingQueue > 0 && (
            <span className="aa-pill aa-pill--queued">
              <strong>{pendingQueue}</strong>
              <span>queued to sync</span>
            </span>
          )}
        </div>
      </main>

      {/* Confirmation Modal */}
      {outcome && (
        <ConfirmationOverlay
          outcome={outcome}
          destinations={destinations}
          resetMs={resetMs}
          onNext={handleReset}
        />
      )}

      {/* Realm Inspection Modal */}
      {inspectingRealm && (
        <RealmModal
          destination={inspectingRealm}
          onClose={() => setInspectingRealm(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirmation Modal
// ---------------------------------------------------------------------------

function statusNote(status: EnrolStatus, detail?: string): string {
  switch (status) {
    case "created":
      return "enrolled";
    case "existing":
      return "already aboard";
    case "skipped":
      return detail ?? "staged";
    default:
      return detail ?? "queued in outbox";
  }
}

interface ConfirmationProps {
  outcome: Outcome;
  destinations: PublicDestination[];
  resetMs: number;
  onNext: () => void;
}

function ConfirmationOverlay({ outcome, destinations, resetMs, onNext }: ConfirmationProps) {
  const rows: DestinationResult[] =
    outcome.results && outcome.results.length > 0
      ? outcome.results
      : destinations.map((d) => ({
          key: d.key,
          label: d.label,
          status: outcome.queued ? "failed" : "created",
          detail: outcome.queued ? "queued in outbox" : "enrolled",
        }));

  const headline = outcome.ok
    ? outcome.alreadyKnown
      ? "Already in Orbit"
      : "You're Aboard"
    : "Transmission Saved";

  return (
    <div className="aa-confirm" role="status" aria-live="polite">
      <div className="aa-seal">
        <span className="aa-seal-ring aa-seal-ring--outer" />
        <span className="aa-seal-ring aa-seal-ring--mid" />
        <span className="aa-seal-core" aria-hidden="true">
          {outcome.ok ? "✦" : "↻"}
        </span>
      </div>

      <h2 className="aa-confirm-title">{headline}</h2>

      <p className="aa-confirm-email">
        Coordinates for <strong>{outcome.email}</strong> verified across all three realms.
      </p>

      <div className="aa-manifest">
        {rows.map((row) => {
          const isOk = row.status === "created" || row.status === "existing";
          return (
            <div
              key={row.key}
              className={`aa-manifest-row ${isOk ? "aa-manifest-row--ok" : "aa-manifest-row--bad"}`}
            >
              <span className="aa-manifest-mark" aria-hidden="true">
                {isOk ? "✓" : "↻"}
              </span>
              <span className="aa-manifest-name">{row.label}</span>
              <span className="aa-manifest-note">{statusNote(row.status, row.detail)}</span>
            </div>
          );
        })}
      </div>

      <p className="aa-confirm-note">
        {outcome.queued
          ? "Saved securely in local storage — your transmission will auto-synchronize to the network as soon as connectivity resumes."
          : outcome.alreadyKnown
          ? "This address is already recognized across the Alchm triad. Welcome back to the sanctum."
          : "A welcome missive from Greg is en route to your inbox. The night sky is now aligned with your station."}
      </p>

      <div
        className="aa-countdown"
        style={{ "--aa-countdown-ms": `${resetMs}ms` } as CSSProperties}
      >
        <div className="aa-countdown-fill" />
      </div>

      <button className="aa-next" type="button" onClick={onNext}>
        Next seeker →
      </button>
    </div>
  );
}

export default AllAboardKiosk;
