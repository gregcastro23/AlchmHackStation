import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  appendHistory,
  cacheVessel,
  ESMS_META,
  fetchVessel,
  readCachedVessel,
  readHistory,
  STREAM_KEYS,
  STREAM_META,
  streamTotal,
  vesselTotal,
} from '../lib/alchmVessel';
import type {
  AlchmVesselState,
  EsmsTuple,
  TotalPoint,
  VesselSourceKey,
  VesselStreamKey,
} from '../lib/alchmVessel';
import { spacetimedbSocket } from '../lib/spacetimedbSocket';

// ============================================================================
// The Alchm Vessel — master treasury cockpit.
// Aggregates the operator's ESMS holdings and inflow streams across Agents,
// the Kitchen ledger and the Pentacles arena. Read-only: master actions hand
// off to the real flows that move tokens; the Vessel itself never does.
// ============================================================================

type SyncState = 'loading' | 'live' | 'reconnecting' | 'unconfigured' | 'error';

interface AlchmVesselProps {
  onCommitLog?: (text: string, type?: 'default' | 'info' | 'success' | 'warning' | 'error') => void;
  onRouteToAmm?: () => void;
}

const POLL_MS = 20_000;
const EVENT_MIN_GAP_MS = 4_000;
const RELEVANT_REDUCER = /pillar|jing|duel|melee|trick|meld|stake|vault|yield|quest|claim/i;

const SOURCE_LABEL: Record<VesselSourceKey, string> = {
  kitchenLedger: 'Kitchen ledger (alchm.kitchen)',
  agentsArena: 'Agents arena (agents.alchm.kitchen)',
  spacetimedb: 'Pentacles SpacetimeDB',
  priceIndex: 'Canonical price index',
};

const fmt = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });
const stat = (n: number | null | undefined) => (n === null || n === undefined ? '—' : fmt(n));

// ── Alembic flask visualizer ────────────────────────────────────────────────

// Heaviest element settles lowest: Matter, Essence, Substance, Spirit.
const LAYER_ORDER = [2, 1, 3, 0] as const;

function flaskPath(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const cx = w / 2;
  const bulbR = Math.min(w * 0.36, h * 0.34);
  const bulbCy = h - bulbR - h * 0.06;
  const neckW = bulbR * 0.34;
  const neckTop = h * 0.08;
  const shoulder = Math.asin(neckW / bulbR);
  ctx.beginPath();
  ctx.moveTo(cx - neckW, neckTop);
  ctx.lineTo(cx - neckW, bulbCy - bulbR * Math.cos(shoulder));
  ctx.arc(cx, bulbCy, bulbR, -Math.PI / 2 - shoulder, -Math.PI / 2 + shoulder, true);
  ctx.lineTo(cx + neckW, neckTop);
  ctx.closePath();
  return { cx, bulbR, bulbCy, neckW, neckTop };
}

const AlembicFlask: React.FC<{ balances: EsmsTuple; halo: boolean }> = ({ balances, halo }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const shares = useMemo(() => {
    const total = balances.reduce((a, b) => a + b, 0);
    return balances.map((b) => (total > 0 ? b / total : 0));
  }, [balances]);
  const sharesRef = useRef(shares);
  const haloRef = useRef(halo);
  const staticRedrawRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      if (width === 0 || height === 0) return;
      const geo = flaskPath(ctx, width, height);

      ctx.save();
      ctx.clip();
      const fillTop = geo.bulbCy - geo.bulbR * 0.72;
      const fillBottom = geo.bulbCy + geo.bulbR;
      const span = fillBottom - fillTop;
      const current = sharesRef.current;
      const hasLiquid = current.some((s) => s > 0);

      if (hasLiquid) {
        let base = fillBottom;
        LAYER_ORDER.forEach((idx, order) => {
          const share = current[idx];
          if (share <= 0) return;
          const top = base - span * share;
          const color = ESMS_META[idx].color;
          // Wave amplitude scales with the element's share of the vessel.
          const amp = reduceMotion ? 0 : 1.5 + share * 7;
          const phase = t / (900 + order * 260) + order * 1.7;

          ctx.beginPath();
          ctx.moveTo(0, base);
          for (let x = 0; x <= width; x += 6) {
            ctx.lineTo(x, top + Math.sin(x / 22 + phase) * amp);
          }
          ctx.lineTo(width, base);
          ctx.closePath();
          const grad = ctx.createLinearGradient(0, top, 0, base);
          grad.addColorStop(0, `${color}cc`);
          grad.addColorStop(1, `${color}55`);
          ctx.fillStyle = grad;
          ctx.fill();

          if (!reduceMotion) {
            // A few rising motes per layer — the swirl of the retort.
            const motes = 2 + Math.round(share * 6);
            for (let i = 0; i < motes; i++) {
              const seed = idx * 97 + i * 31;
              const mx = geo.cx - geo.bulbR * 0.8 + ((seed * 53) % 100) / 100 * geo.bulbR * 1.6;
              const cycle = ((t / (2600 + (seed % 900)) + seed / 13) % 1 + 1) % 1;
              const my = base - (base - top) * cycle;
              ctx.beginPath();
              ctx.arc(mx + Math.sin(t / 700 + seed) * 4, my, 1.4, 0, Math.PI * 2);
              ctx.fillStyle = `${color}`;
              ctx.globalAlpha = 0.25 + 0.5 * (1 - cycle);
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }
          base = top;
        });
      }
      ctx.restore();

      // Glass: outline plus a specular highlight.
      flaskPath(ctx, width, height);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = haloRef.current ? 'rgba(250, 204, 21, 0.75)' : 'rgba(204, 255, 128, 0.45)';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(geo.cx, geo.bulbCy, geo.bulbR * 0.82, Math.PI * 1.08, Math.PI * 1.32);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    const loop = (t: number) => {
      if (!document.hidden) draw(t);
      frame = requestAnimationFrame(loop);
    };

    // Resizing clears the bitmap, so always repaint one frame immediately —
    // rAF may not fire while the page is hidden.
    const paintNow = () => draw(reduceMotion ? 0 : performance.now());
    resize();
    paintNow();
    const observer = new ResizeObserver(() => {
      resize();
      paintNow();
    });
    observer.observe(canvas);
    if (reduceMotion) staticRedrawRef.current = paintNow;
    else frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      staticRedrawRef.current = null;
    };
  }, []);

  // The animated loop reads these refs every frame; a static (reduced-motion)
  // frame only needs repainting when the holdings or halo change.
  useEffect(() => {
    sharesRef.current = shares;
    haloRef.current = halo;
    staticRedrawRef.current?.();
  }, [shares, halo]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[260px]"
      role="img"
      aria-label={`Alembic holdings: ${ESMS_META.map((m, i) => `${m.label} ${Math.round(shares[i] * 100)}%`).join(', ')}`}
    />
  );
};

// ── Small pieces ────────────────────────────────────────────────────────────

const Sparkline: React.FC<{ points: TotalPoint[] }> = ({ points }) => {
  if (points.length < 2) {
    return <span className="text-[10px] text-on-surface-variant/60 font-mono">collecting sync history…</span>;
  }
  const values = points.map((p) => p.total);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const d = points
    .map((p, i) => `${(i / (points.length - 1)) * 100},${28 - ((p.total - min) / range) * 26}`)
    .join(' ');
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="w-full h-8" aria-label="Observed Vessel total across syncs">
      <polyline points={d} fill="none" stroke="#ccff80" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const EsmsBars: React.FC<{ esms: EsmsTuple }> = ({ esms }) => {
  const max = Math.max(...esms, 0);
  return (
    <div className="space-y-2">
      {ESMS_META.map((m, i) => (
        <div key={m.key} className="grid grid-cols-[88px_1fr_88px] items-center gap-2 text-xs font-mono">
          <span style={{ color: m.color }}>{m.label}</span>
          <div className="h-2 rounded bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded transition-all duration-700"
              style={{ width: max > 0 ? `${(esms[i] / max) * 100}%` : '0%', backgroundColor: m.color }}
            />
          </div>
          <span className="text-right text-on-surface">{fmt(esms[i])}</span>
        </div>
      ))}
    </div>
  );
};

function streamFacts(vessel: AlchmVesselState, key: VesselStreamKey): Array<[string, string]> {
  const s = vessel.streams;
  switch (key) {
    case 'jingDuels':
      return [
        ['Ledger credits', `${s.jingDuels.ledgerEntries} rows (duel_yield)`],
        ['Agents Jing rounds recorded', stat(s.jingDuels.agentDuelsRecorded)],
        ['Pentacles arena wins', `${stat(s.jingDuels.arenaWins)} of ${stat(s.jingDuels.arenaResolved)} resolved`],
      ];
    case 'staking':
      return [
        ['Ledger credits', `${s.staking.ledgerEntries} rows (daily, streak, sky drops)`],
        ['Login resonance streak', s.staking.streakDays === null ? '—' : `${s.staking.streakDays} days`],
        ['StarVault accrual', s.staking.starVaultAccrued === null ? 'not aggregated server-side yet' : fmt(s.staking.starVaultAccrued)],
      ];
    case 'pentaclesMelee':
      return [
        ['Ledger credits', s.pentaclesMelee.ledgerEntries ? `${s.pentaclesMelee.ledgerEntries} rows` : 'tricks & melds are not credited to the ledger yet'],
        ['Arena tokens', stat(s.pentaclesMelee.arenaTokens)],
        ['Word duel wins', stat(s.pentaclesMelee.wordWins)],
        [
          '14 Pillars pool (game units, 10 = 1.0 ESMS)',
          s.pentaclesMelee.pillarPool ? s.pentaclesMelee.pillarPool.map((v, i) => `${ESMS_META[i].label[0]} ${fmt(v)}`).join(' · ') : '—',
        ],
      ];
    case 'kitchenAchievements':
      return [
        ['Ledger credits', `${s.kitchenAchievements.ledgerEntries} rows (quests, logs)`],
        ['Achievements unlocked', stat(s.kitchenAchievements.achievementsUnlocked)],
        ['Quests completed', stat(s.kitchenAchievements.questsCompleted)],
      ];
  }
}

// ── Component ───────────────────────────────────────────────────────────────

export const AlchmVessel: React.FC<AlchmVesselProps> = ({ onCommitLog, onRouteToAmm }) => {
  const [vessel, setVessel] = useState<AlchmVesselState | null>(() => readCachedVessel());
  const [sync, setSync] = useState<SyncState>('loading');
  const [missing, setMissing] = useState<string[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [history, setHistory] = useState<TotalPoint[]>(() => readHistory());
  const [activeStream, setActiveStream] = useState<VesselStreamKey>('jingDuels');
  const vesselRef = useRef(vessel);
  const lastFetchRef = useRef(0);
  const inFlightRef = useRef(false);
  const logRef = useRef(onCommitLog);

  useEffect(() => {
    logRef.current = onCommitLog;
  }, [onCommitLog]);

  const refresh = useCallback(async (reason: string) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    lastFetchRef.current = Date.now();
    const result = await fetchVessel();
    inFlightRef.current = false;

    if (result.kind === 'ok') {
      vesselRef.current = result.vessel;
      setVessel(result.vessel);
      cacheVessel(result.vessel);
      setHistory((h) => appendHistory(h, { t: result.vessel.lastSyncedAt, total: vesselTotal(result.vessel) }));
      setSync('live');
      setLastError(null);
      if (reason !== 'poll') logRef.current?.(`[VESSEL] Synced treasury (${reason}).`, 'success');
    } else if (result.kind === 'unconfigured') {
      setMissing(result.missing);
      setSync('unconfigured');
    } else {
      setLastError(result.message);
      setSync(vesselRef.current ? 'reconnecting' : 'error');
      if (reason !== 'poll') logRef.current?.(`[VESSEL] Sync failed: ${result.message}`, 'warning');
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(() => void refresh('open'), 0);
    const interval = setInterval(() => {
      if (!document.hidden) void refresh('poll');
    }, POLL_MS);

    // Reward-bearing reducers anywhere in the realm trigger an early resync.
    let pending: ReturnType<typeof setTimeout> | null = null;
    const offEvents = spacetimedbSocket.onReducerEvent((event) => {
      if (event.isSimulated || !RELEVANT_REDUCER.test(event.reducerName) || pending) return;
      const wait = Math.max(0, EVENT_MIN_GAP_MS - (Date.now() - lastFetchRef.current));
      pending = setTimeout(() => {
        pending = null;
        void refresh(`reducer ${event.reducerName}`);
      }, wait);
    });

    return () => {
      clearTimeout(initial);
      clearInterval(interval);
      offEvents();
      if (pending) clearTimeout(pending);
    };
  }, [refresh]);

  const balances = useMemo<EsmsTuple>(
    () =>
      vessel
        ? [vessel.balances.spirit, vessel.balances.essence, vessel.balances.matter, vessel.balances.substance]
        : [0, 0, 0, 0],
    [vessel],
  );
  const total = vessel ? vesselTotal(vessel) : 0;

  const feed = useMemo(() => {
    if (!vessel) return [];
    const ledgerRows = vessel.ledger.map((e) => ({
      id: `l:${e.id}`,
      t: new Date(e.createdAt).getTime(),
      tag: STREAM_META[e.stream] ?? STREAM_META.other,
      text: e.description || e.sourceType.replace(/_/g, ' '),
      value: `${fmt(e.amount)} ${e.tokenType}`,
    }));
    const clashRows = vessel.streams.jingDuels.recentClashes.map((c) => ({
      id: `c:${c.duelId}`,
      t: c.timestamp,
      tag: c.source === 'pentacles' ? STREAM_META.pentaclesMelee : STREAM_META.jingDuels,
      text: `${c.kind} · ${c.opponent}`,
      value: c.won === true ? 'won' : c.won === false ? 'lost' : 'recorded',
    }));
    return [...ledgerRows, ...clashRows].sort((a, b) => b.t - a.t).slice(0, 20);
  }, [vessel]);

  const openExternal = (url: string, label: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    onCommitLog?.(`[VESSEL] Handed off to ${label}.`, 'info');
  };

  const halo = sync === 'reconnecting';

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-surface-container border border-outline-variant/30 rounded-xl">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl">science</span>
          <div>
            <h2 className="text-sm font-bold text-on-surface">The Alchm Vessel · Great Alembic Treasury</h2>
            <p className="text-xs text-on-surface-variant">
              Elemental holdings and inflow streams across Agents, the Kitchen, and the Pentacles arena
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded border font-mono text-[10px] uppercase tracking-wider ${
              sync === 'live'
                ? 'border-primary/40 text-primary'
                : sync === 'reconnecting'
                  ? 'border-tertiary-container/60 text-tertiary-container animate-pulse'
                  : sync === 'loading'
                    ? 'border-outline-variant text-on-surface-variant'
                    : 'border-error/50 text-error'
            }`}
            title={lastError ?? undefined}
          >
            {sync === 'live' ? 'Live' : sync === 'reconnecting' ? 'Reconnecting · cached' : sync === 'loading' ? 'Syncing' : sync === 'unconfigured' ? 'Not configured' : 'Unreachable'}
          </span>
          <button
            type="button"
            onClick={() => void refresh('manual')}
            className="px-2 py-1 rounded border border-outline-variant/50 text-on-surface-variant hover:text-primary hover:border-primary/40 font-mono text-[10px] uppercase cursor-pointer flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">sync</span> Refresh
          </button>
        </div>
      </div>

      {sync === 'unconfigured' && (
        <div className="p-4 rounded-xl border border-tertiary-container/40 bg-tertiary-container/5 text-xs text-on-surface-variant space-y-2">
          <p className="text-on-surface font-bold">Connect the Vessel to the operator treasury</p>
          <p>
            Add these to <code className="font-mono text-primary">.env.local</code> in AlchmHackStation and restart{' '}
            <code className="font-mono">bun run dev</code>. They stay server-side in the dev proxy.
          </p>
          <p>
            The desktop API key (<code className="font-mono">alchm_desktop_…</code>, valid 30 days) comes from signing in at{' '}
            <code className="font-mono">agents.alchm.kitchen/profile?desktopLink=true</code>: it is the{' '}
            <code className="font-mono">apiKey</code> in the “Open desktop” link. Issuing one retires the previous Alchm Desktop
            key.
          </p>
          <ul className="font-mono text-tertiary-container list-disc pl-5">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p>
            Optional: <code className="font-mono">ALCHM_AGENTS_URL</code> (defaults to https://agents.alchm.kitchen). The target
            must be running the <code className="font-mono">/api/vessel/summary</code> route.
          </p>
        </div>
      )}

      {sync === 'error' && !vessel && (
        <div className="p-4 rounded-xl border border-error/40 bg-error-container/10 text-xs text-error">
          The Vessel could not be read: {lastError}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,360px)_1fr] gap-4">
        {/* Alembic + metrics */}
        <div
          className={`relative rounded-2xl border bg-surface-container-low/70 backdrop-blur p-4 transition-shadow ${
            halo ? 'border-tertiary-container/60 shadow-[0_0_32px_rgba(255,203,86,0.18)]' : 'border-outline-variant/30'
          }`}
        >
          <AlembicFlask balances={balances} halo={halo} />
          <div className="grid grid-cols-2 gap-2 mt-2">
            {ESMS_META.map((m, i) => (
              <div key={m.key} className="rounded-lg bg-surface-container px-2 py-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono uppercase">
                  <span style={{ color: m.color }}>{m.label}</span>
                  <span className="text-on-surface-variant">{m.element}</span>
                </div>
                <div className="font-mono text-sm text-on-surface">{fmt(balances[i])}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 min-w-0">
          {/* Aggregate metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-3">
              <div className="font-label-caps text-label-caps text-on-surface-variant">Total ESMS</div>
              <div className="font-mono text-xl text-primary mt-1">{vessel ? fmt(total) : '—'}</div>
              <Sparkline points={history} />
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-3">
              <div className="font-label-caps text-label-caps text-on-surface-variant">USD equivalent</div>
              <div className="font-mono text-xl text-on-surface mt-1">
                {vessel?.balances.totalUsdEquivalent != null ? `$${vessel.balances.totalUsdEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">
                {vessel?.balances.usdRail
                  ? `redeem rail $${vessel.balances.usdRail.perTokenUsd}/token${vessel.balances.usdRail.source ? ` · ${vessel.balances.usdRail.source}` : ''}`
                  : 'no USD redeem rail published'}
              </div>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-3">
              <div className="font-label-caps text-label-caps text-on-surface-variant">Resonance streak</div>
              <div className="font-mono text-xl text-on-surface mt-1">
                {vessel?.streams.staking.streakDays != null ? `${vessel.streams.staking.streakDays}d` : '—'}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">daily login yields</div>
            </div>
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-3">
              <div className="font-label-caps text-label-caps text-on-surface-variant">Arena record</div>
              <div className="font-mono text-xl text-on-surface mt-1">
                {vessel ? `${stat(vessel.streams.jingDuels.arenaWins)} / ${stat(vessel.streams.jingDuels.arenaResolved)}` : '—'}
              </div>
              <div className="text-[10px] text-on-surface-variant mt-1">Pentacles duels won / resolved</div>
            </div>
          </div>

          {/* Stream inspector */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-3">
            <div className="flex flex-wrap gap-1 mb-3" role="tablist" aria-label="Inflow streams">
              {STREAM_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={activeStream === key}
                  onClick={() => setActiveStream(key)}
                  className={`px-3 py-1.5 rounded font-mono text-[11px] uppercase border cursor-pointer transition-colors ${
                    activeStream === key
                      ? 'bg-primary/10 text-primary border-primary/40'
                      : 'text-on-surface-variant border-outline-variant/40 hover:border-secondary/50'
                  }`}
                >
                  {STREAM_META[key].label}
                  {vessel && (
                    <span className="ml-2 text-on-surface/70">{fmt(streamTotal(vessel.streams[key].ledgerEsms))}</span>
                  )}
                </button>
              ))}
            </div>
            {vessel ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" role="tabpanel">
                <EsmsBars esms={vessel.streams[activeStream].ledgerEsms} />
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-xs">
                  {streamFacts(vessel, activeStream).map(([k, v]) => (
                    <React.Fragment key={k}>
                      <dt className="text-on-surface-variant">{k}</dt>
                      <dd className="font-mono text-on-surface">{v}</dd>
                    </React.Fragment>
                  ))}
                </dl>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant">No Vessel snapshot yet.</p>
            )}
          </div>

          {/* Master actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => openExternal('https://alchm.kitchen/feed', 'Kitchen transmutation')}
              className="px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary font-mono text-xs uppercase cursor-pointer hover:bg-primary/20 flex items-center gap-1.5"
              title="Opens the Kitchen transmutation flow; the Vessel never moves tokens itself"
            >
              <span className="material-symbols-outlined text-[16px]">auto_fix_high</span> Transmute Yields ↗
            </button>
            <button
              type="button"
              onClick={() => {
                onRouteToAmm?.();
                onCommitLog?.('[VESSEL] Routing to Bespoke AMM & Topology.', 'info');
              }}
              className="px-3 py-2 rounded-lg border border-secondary/40 bg-secondary/10 text-secondary font-mono text-xs uppercase cursor-pointer hover:bg-secondary/20 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span> Route via Bespoke AMM
            </button>
            <button
              type="button"
              onClick={() => openExternal('https://agents.alchm.kitchen/account', 'Agents on-chain claim')}
              className="px-3 py-2 rounded-lg border border-tertiary-container/40 bg-tertiary-container/10 text-tertiary-container font-mono text-xs uppercase cursor-pointer hover:bg-tertiary-container/20 flex items-center gap-1.5"
              title="Opens the Agents on-chain ESMS claim flow"
            >
              <span className="material-symbols-outlined text-[16px]">link</span> On-Chain Sync ↗
            </button>
          </div>
        </div>
      </div>

      {/* Transaction & transmutation ledger */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(260px,340px)] gap-4">
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-3">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Transaction & transmutation ledger</h3>
          {feed.length === 0 ? (
            <p className="text-xs text-on-surface-variant">No ledger activity or clashes recorded yet.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/20">
              {feed.map((row) => (
                <li key={row.id} className="flex items-center gap-3 py-2 text-xs">
                  <span
                    className="px-1.5 py-0.5 rounded border font-mono text-[10px] uppercase shrink-0"
                    style={{ color: row.tag.color, borderColor: `${row.tag.color}66` }}
                  >
                    [{row.tag.tag}]
                  </span>
                  <span className="flex-1 min-w-0 truncate text-on-surface">{row.text}</span>
                  <span className="font-mono text-on-surface-variant shrink-0">{row.value}</span>
                  <span className="font-mono text-[10px] text-on-surface-variant/60 shrink-0 hidden sm:inline">
                    {row.t ? new Date(row.t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-outline-variant/30 bg-surface-container p-3 text-xs">
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">Sources</h3>
          {vessel ? (
            <ul className="space-y-2">
              {(Object.keys(SOURCE_LABEL) as VesselSourceKey[]).map((key) => {
                const source = vessel.sources[key];
                return (
                  <li key={key}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${source?.ok ? 'bg-primary' : 'bg-error'}`} />
                      <span className="text-on-surface">{SOURCE_LABEL[key]}</span>
                    </div>
                    {source?.detail && <p className="pl-4 text-on-surface-variant break-words">{source.detail}</p>}
                  </li>
                );
              })}
              <li className="pt-2 border-t border-outline-variant/20 font-mono text-on-surface-variant">
                {vessel.walletAddress ? `wallet ${vessel.walletAddress.slice(0, 4)}…${vessel.walletAddress.slice(-4)}` : 'no verified Solana wallet'}
                <br />
                synced {new Date(vessel.lastSyncedAt).toLocaleTimeString()}
              </li>
            </ul>
          ) : (
            <p className="text-on-surface-variant">Waiting for the first sync.</p>
          )}
        </div>
      </div>
    </div>
  );
};
