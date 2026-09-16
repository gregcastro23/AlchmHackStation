// ============================================================================
// AlchmHackStation — Alchm Vessel client
// Reads the operator's cross-app treasury through the dev-server proxy
// (/api/vessel/summary → agents.alchm.kitchen, see vite.config.ts). The
// contract mirrors alchm-agents-solana lib/vessel/contract.ts (v1).
//
// The cockpit never estimates: unreachable stats are null, a failed refresh
// keeps the last snapshot as "reconnecting", and nothing here moves ESMS.
// ============================================================================

export type EsmsTuple = [number, number, number, number];
export type VesselStreamKey = 'jingDuels' | 'staking' | 'pentaclesMelee' | 'kitchenAchievements';
export type VesselSourceKey = 'kitchenLedger' | 'agentsArena' | 'spacetimedb' | 'priceIndex';

export interface VesselLedgerEntry {
  id: string;
  stream: VesselStreamKey | 'other';
  sourceType: string;
  tokenType: string;
  amount: number;
  description: string | null;
  createdAt: string;
}

export interface VesselClash {
  duelId: string;
  source: 'agents' | 'pentacles';
  kind: string;
  opponent: string;
  won: boolean | null;
  timestamp: number;
}

export interface AlchmVesselState {
  version: 1;
  walletAddress: string | null;
  spacetimeIdentity: string | null;
  lastSyncedAt: number;
  balances: {
    spirit: number;
    essence: number;
    matter: number;
    substance: number;
    totalUsdEquivalent: number | null;
    usdRail: { perTokenUsd: number; source: string | null } | null;
  };
  streams: {
    jingDuels: {
      ledgerEsms: EsmsTuple;
      ledgerEntries: number;
      agentDuelsRecorded: number | null;
      arenaWins: number | null;
      arenaResolved: number | null;
      recentClashes: VesselClash[];
    };
    staking: {
      ledgerEsms: EsmsTuple;
      ledgerEntries: number;
      streakDays: number | null;
      starVaultAccrued: number | null;
    };
    pentaclesMelee: {
      ledgerEsms: EsmsTuple;
      ledgerEntries: number;
      arenaTokens: number | null;
      wordWins: number | null;
      /** Pentacles game pool units: tenths of an ESMS (circuit baseline 80 = 8.0 ESMS). */
      pillarPool: EsmsTuple | null;
    };
    kitchenAchievements: {
      ledgerEsms: EsmsTuple;
      ledgerEntries: number;
      achievementsUnlocked: number | null;
      questsCompleted: number | null;
    };
  };
  ledger: VesselLedgerEntry[];
  sources: Record<VesselSourceKey, { ok: boolean; detail?: string }>;
}

export type VesselFetchResult =
  | { kind: 'ok'; vessel: AlchmVesselState }
  | { kind: 'unconfigured'; missing: string[] }
  | { kind: 'error'; message: string };

export const ESMS_META = [
  { key: 'spirit', label: 'Spirit', element: 'Fire', color: '#EF4444' },
  { key: 'essence', label: 'Essence', element: 'Water', color: '#38BDF8' },
  { key: 'matter', label: 'Matter', element: 'Earth', color: '#4ADE80' },
  { key: 'substance', label: 'Substance', element: 'Air', color: '#FACC15' },
] as const;

export const STREAM_META: Record<VesselStreamKey | 'other', { label: string; tag: string; color: string }> = {
  jingDuels: { label: 'Jing Duels', tag: 'Jing', color: '#EF4444' },
  staking: { label: 'Staking & Yields', tag: 'StarVault', color: '#4ADE80' },
  pentaclesMelee: { label: 'Melee Tricks & Melds', tag: 'Pentacles', color: '#FACC15' },
  kitchenAchievements: { label: 'Kitchen Achievements', tag: 'Kitchen', color: '#38BDF8' },
  other: { label: 'Ledger', tag: 'Ledger', color: '#94A3B8' },
};

export const STREAM_KEYS: VesselStreamKey[] = ['jingDuels', 'staking', 'pentaclesMelee', 'kitchenAchievements'];

export function isVesselState(value: unknown): value is AlchmVesselState {
  const v = value as AlchmVesselState;
  return Boolean(
    v &&
      v.version === 1 &&
      v.balances &&
      v.streams &&
      STREAM_KEYS.every((k) => Array.isArray(v.streams[k]?.ledgerEsms)),
  );
}

export function vesselTotal(vessel: AlchmVesselState): number {
  const b = vessel.balances;
  return Math.round((b.spirit + b.essence + b.matter + b.substance) * 1e4) / 1e4;
}

export function streamTotal(esms: EsmsTuple): number {
  return Math.round(esms.reduce((a, b) => a + b, 0) * 1e4) / 1e4;
}

export async function fetchVessel(signal?: AbortSignal): Promise<VesselFetchResult> {
  try {
    const res = await fetch('/api/vessel/summary', { signal, cache: 'no-store' });
    const body = await res.json().catch(() => null);
    if (res.status === 503 && body?.configured === false) {
      return { kind: 'unconfigured', missing: Array.isArray(body.missing) ? body.missing : [] };
    }
    if (!res.ok || !body?.ok || !isVesselState(body.vessel)) {
      return { kind: 'error', message: body?.error || `HTTP ${res.status}` };
    }
    return { kind: 'ok', vessel: body.vessel };
  } catch (err) {
    return { kind: 'error', message: err instanceof Error ? err.message : String(err) };
  }
}

// Operator-local snapshot + observed-total history for the sparkline. Every
// point is a real synced total; storage failures just disable the fallback.
const CACHE_KEY = 'hackstation:vessel:v1';
const HISTORY_KEY = 'hackstation:vessel:history:v1';
const HISTORY_LIMIT = 60;

export function readCachedVessel(): AlchmVesselState | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
    return isVesselState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function cacheVessel(vessel: AlchmVesselState): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(vessel));
  } catch {
    // storage unavailable
  }
}

export interface TotalPoint {
  t: number;
  total: number;
}

export function readHistory(): TotalPoint[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((p) => Number.isFinite(p?.t) && Number.isFinite(p?.total)) : [];
  } catch {
    return [];
  }
}

/** Append a synced total, skipping unchanged consecutive values. */
export function appendHistory(history: TotalPoint[], point: TotalPoint): TotalPoint[] {
  const last = history[history.length - 1];
  const next = last && last.total === point.total ? history : [...history, point].slice(-HISTORY_LIMIT);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
  return next;
}
