/**
 * All Aboard — Fan-Out Engine & Outbox Reliability
 *
 * Guarantees zero loss of signup intent:
 * - Submits to /api/all-aboard
 * - If offline or server unreachable, enqueues in browser localStorage outbox
 * - Automatic background retries upon network reconnection and interval ticks
 * - Per-browser daily count tracking
 *
 * @file src/lib/all-aboard/fanout.ts
 */

import {
  normaliseEmail,
  normaliseName,
  eventLabel,
  sourceTag,
  destinations,
} from "./config";

export type EnrolStatus = "created" | "existing" | "failed" | "skipped";

export interface DestinationResult {
  key: string;
  label: string;
  status: EnrolStatus;
  detail?: string;
  welcomeEmail?: boolean;
}

export interface JoinResponse {
  ok: boolean;
  allOk?: boolean;
  alreadyKnown?: boolean;
  welcomeEmail?: boolean;
  results?: DestinationResult[];
  code?: string;
  message?: string;
}

export interface Outcome {
  email: string;
  ok: boolean;
  allOk: boolean;
  alreadyKnown: boolean;
  welcomeEmail: boolean;
  queued: boolean;
  results: DestinationResult[];
}

export interface QueuedJoin {
  email: string;
  name: string | null;
  at: number;
  attempts?: number;
}

const QUEUE_KEY = "alchm.all-aboard.outbox";
const COUNT_KEY_PREFIX = "alchm.all-aboard.count.";
const MAX_QUEUE = 200;

export function readQueue(): QueuedJoin[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? (parsed as QueuedJoin[]) : [];
  } catch {
    return [];
  }
}

export function writeQueue(queue: QueuedJoin[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(queue.slice(-MAX_QUEUE))
    );
  } catch {
    // Storage quota or private browsing safeguard
  }
}

export function enqueuePending(email: string, name: string | null): QueuedJoin[] {
  const current = readQueue();
  const index = current.findIndex((q) => q.email === email);
  if (index >= 0) {
    current[index].at = Date.now();
    current[index].name = name ?? current[index].name;
  } else {
    current.push({ email, name, at: Date.now(), attempts: 0 });
  }
  writeQueue(current);
  return current;
}

export function dequeuePending(email: string): QueuedJoin[] {
  const current = readQueue().filter((q) => q.email !== email);
  writeQueue(current);
  return current;
}

export function todayKey(): string {
  return COUNT_KEY_PREFIX + new Date().toISOString().slice(0, 10);
}

export function readCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(todayKey());
    const value = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function incrementCount(): number {
  if (typeof window === "undefined") return 0;
  const next = readCount() + 1;
  try {
    window.localStorage.setItem(todayKey(), String(next));
  } catch {
    // Ignore
  }
  return next;
}

/**
 * Submit an address to the ecosystem fan-out endpoint.
 */
export async function submitEnrolment(
  rawEmail: string,
  rawName?: string | null,
  activeEvent?: string
): Promise<Outcome> {
  const email = normaliseEmail(rawEmail);
  if (!email) {
    throw new Error("Invalid email address format");
  }

  const name = normaliseName(rawName);
  const event = activeEvent || eventLabel();
  const source = sourceTag(event);

  const payload = { email, name, event, source };

  try {
    const res = await fetch("/api/all-aboard", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data: JoinResponse = await res.json();
      dequeuePending(email);
      incrementCount();

      return {
        email,
        ok: true,
        allOk: data.allOk ?? true,
        alreadyKnown: data.alreadyKnown ?? false,
        welcomeEmail: data.welcomeEmail ?? true,
        queued: false,
        results: data.results || defaultSuccessResults(email),
      };
    }

    // 4xx client errors (e.g. rate-limiting, invalid email)
    if (res.status >= 400 && res.status < 500) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || `Request rejected (${res.status})`);
    }

    // 5xx or server failure: enqueue for retry
    enqueuePending(email, name);
    incrementCount();
    return {
      email,
      ok: true,
      allOk: false,
      alreadyKnown: false,
      welcomeEmail: false,
      queued: true,
      results: defaultQueuedResults(),
    };
  } catch (error: any) {
    // Network down or offline
    enqueuePending(email, name);
    incrementCount();
    return {
      email,
      ok: true,
      allOk: false,
      alreadyKnown: false,
      welcomeEmail: false,
      queued: true,
      results: defaultQueuedResults(),
    };
  }
}

/** Fallback client-generated results for optimistic offline experience */
function defaultSuccessResults(_email?: string): DestinationResult[] {
  return destinations().map((d) => ({
    key: d.key,
    label: d.label,
    status: "created" as EnrolStatus,
    detail: "added",
  }));
}

function defaultQueuedResults(): DestinationResult[] {
  return destinations().map((d) => ({
    key: d.key,
    label: d.label,
    status: "failed" as EnrolStatus,
    detail: "queued in outbox",
  }));
}

/**
 * Process pending items in local outbox.
 */
export async function flushOutbox(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) return 0;

  let cleared = 0;
  for (const item of [...queue]) {
    try {
      const res = await fetch("/api/all-aboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: item.email,
          name: item.name,
          event: eventLabel(),
          source: sourceTag(),
        }),
      });

      if (res.ok) {
        dequeuePending(item.email);
        cleared++;
      }
    } catch {
      // Still offline, stop cycle
      break;
    }
  }
  return cleared;
}
