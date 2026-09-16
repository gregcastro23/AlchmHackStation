/**
 * All Aboard — Unified Destination Configuration
 *
 * The All-Aboard onboarding portal is the front gate for the entire Alchm ecosystem.
 * One email entered once enrolls the seeker across the interlocking triad:
 *
 *   1. alchm.kitchen        (Culinary Sanctum & Gastronomy) — Recipes tuned to the sky
 *   2. agents.alchm.kitchen (Planetary Agents)              — Autonomous celestial intelligence
 *   3. pentacles.alchm.kitchen (Pentacles Arena)           — Real-time SpacetimeDB celestial deck battles
 *
 * Each site receives a signed POST payload to create/link user rows.
 * Public views omit internal endpoints and secrets.
 *
 * @file src/lib/all-aboard/config.ts
 */

export type DestinationKey = "kitchen" | "agents" | "pentacles";

export interface Destination {
  key: DestinationKey;
  label: string;
  tagline: string;
  href: string;
  endpoint: string;
  secret: string | null;
  configured: boolean;
  element: "fire" | "mercury" | "pentacle";
  accentColor: string;
  badge: string;
}

export interface PublicDestination {
  key: DestinationKey;
  label: string;
  tagline: string;
  href: string;
  configured: boolean;
  element: "fire" | "mercury" | "pentacle";
  accentColor: string;
  badge: string;
}

const trimSlash = (value: string): string => value.replace(/\/+$/, "");

const firstEnv = (...names: string[]): string | null => {
  if (typeof process !== "undefined" && process.env) {
    for (const name of names) {
      const val = process.env[name];
      if (val && val.trim().length > 0) return val.trim();
    }
  }
  // Vite client import.meta.env support
  const metaEnv = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
  if (metaEnv) {
    for (const name of names) {
      const val = metaEnv[name];
      if (val && typeof val === "string" && val.trim().length > 0) return val.trim();
    }
  }
  return null;
};

/**
 * Resolve the active event or campaign name.
 * Priority:
 * 1. URL Query Parameter `?event=...`
 * 2. `VITE_ALL_ABOARD_EVENT` or `ALL_ABOARD_EVENT`
 * 3. Default: "Alchm Convergence"
 */
export function eventLabel(): string {
  if (typeof window !== "undefined" && window.location?.search) {
    try {
      const params = new URLSearchParams(window.location.search);
      const queryEvent = params.get("event") || params.get("e");
      if (queryEvent && queryEvent.trim()) {
        return queryEvent.trim();
      }
    } catch {
      // Fallback
    }
  }
  return (
    firstEnv("VITE_ALL_ABOARD_EVENT", "ALL_ABOARD_EVENT") ?? "Alchm Convergence"
  );
}

/** The `source` tag written to databases alongside the email. */
export function sourceTag(event = eventLabel()): string {
  const slug = event
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `all-aboard:${slug}` : "all-aboard:convergence";
}

/**
 * Resolve the triad of destinations.
 */
export function destinations(): Destination[] {
  const sharedSecret = firstEnv(
    "ALCHM_SYNC_SECRET",
    "ALCHM_KITCHEN_SYNC_SECRET",
    "INTERNAL_API_SECRET"
  );

  const kitchenBase = trimSlash(
    firstEnv("ALCHM_KITCHEN_URL", "VITE_ALCHM_KITCHEN_URL") ??
      "https://alchm.kitchen"
  );
  const agentsBase = trimSlash(
    firstEnv("ALCHM_AGENTS_URL", "VITE_ALCHM_AGENTS_URL") ??
      "https://agents.alchm.kitchen"
  );
  const pentaclesBase = trimSlash(
    firstEnv("ALCHM_PENTACLES_URL", "VITE_ALCHM_PENTACLES_URL") ??
      "https://pentacles.alchm.kitchen"
  );

  const kitchenPath =
    firstEnv("ALCHM_KITCHEN_WAITLIST_PATH") ?? "/api/waitlist";
  const agentsPath = firstEnv("ALCHM_AGENTS_WAITLIST_PATH") ?? "/api/waitlist";
  const pentaclesPath =
    firstEnv("ALCHM_PENTACLES_WAITLIST_PATH") ?? "/api/waitlist";

  const kitchenSecret =
    firstEnv("ALCHM_KITCHEN_SYNC_SECRET") ?? sharedSecret ?? null;
  const agentsSecret =
    firstEnv("ALCHM_AGENTS_SYNC_SECRET") ?? sharedSecret ?? null;
  const pentaclesSecret =
    firstEnv("ALCHM_PENTACLES_SYNC_SECRET") ?? sharedSecret ?? null;

  return [
    {
      key: "kitchen",
      label: "alchm.kitchen",
      tagline: "Culinary Sanctum & Gastronomy — cook by the sky over your head.",
      href: kitchenBase,
      endpoint: `${kitchenBase}${kitchenPath}`,
      secret: kitchenSecret,
      configured: Boolean(kitchenBase),
      element: "fire",
      accentColor: "#ef4444",
      badge: "Culinary Sanctum",
    },
    {
      key: "agents",
      label: "agents.alchm.kitchen",
      tagline: "Planetary Agents — autonomous intelligence council attuned to your chart.",
      href: agentsBase,
      endpoint: `${agentsBase}${agentsPath}`,
      secret: agentsSecret,
      configured: Boolean(agentsBase),
      element: "mercury",
      accentColor: "#38bdf8",
      badge: "Planetary Intelligence",
    },
    {
      key: "pentacles",
      label: "pentacles.alchm.kitchen",
      tagline: "Pentacles Arena — celestial deck battles & SpacetimeDB multiplayer state.",
      href: pentaclesBase,
      endpoint: `${pentaclesBase}${pentaclesPath}`,
      secret: pentaclesSecret,
      configured: Boolean(pentaclesBase),
      element: "pentacle",
      accentColor: "#fbbf24",
      badge: "Celestial Arena",
    },
  ];
}

/** Strip internal endpoints and secrets for public browser usage. */
export function toPublic(destination: Destination): PublicDestination {
  return {
    key: destination.key,
    label: destination.label,
    tagline: destination.tagline,
    href: destination.href,
    configured: destination.configured,
    element: destination.element,
    accentColor: destination.accentColor,
    badge: destination.badge,
  };
}

/**
 * Pragmatic email validation.
 * Permissive on RFC specifics while rejecting typo characters.
 */
const EMAIL_PATTERN =
  /^[^\s@,;:<>()[\]\\"]+@[^\s@,;:<>()[\]\\"]+\.[A-Za-z]{2,}$/;

export const MAX_EMAIL_LENGTH = 254;
export const MAX_NAME_LENGTH = 80;

export function normaliseEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/^<|>$/g, "").toLowerCase();
  if (cleaned.length === 0 || cleaned.length > MAX_EMAIL_LENGTH) return null;
  if (!EMAIL_PATTERN.test(cleaned)) return null;
  return cleaned;
}

export function normaliseName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const cleaned = raw.trim().replace(/\s+/g, " ").slice(0, MAX_NAME_LENGTH);
  return cleaned.length > 0 ? cleaned : null;
}
