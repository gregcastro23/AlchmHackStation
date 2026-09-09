/**
 * Alchm Astrology & Elemental Math Core — Standalone Cloudflare Edition
 *
 * Pure TypeScript implementation guaranteeing bit-level differential parity (1e-9)
 * with Pentacles math.js (Pentacles/src/alchm-chart/math.js) and dignity.js.
 */

export interface WeightsConfig {
  chartRuler: number;
  sun: number;
  moon: number;
  innerPlanets: number;
  outerPlanets: number;
}

export const DEFAULT_WEIGHTS: WeightsConfig = {
  chartRuler: 2.2,
  sun: 1.8,
  moon: 1.8,
  innerPlanets: 1.2,
  outerPlanets: 0.8,
};

export const PLANET_NAMES = [
  "Sun",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Chiron",
] as const;

export const PLANET_GLYPHS = [
  "☉",
  "☽",
  "☿",
  "♀",
  "♂",
  "♃",
  "♄",
  "♅",
  "♆",
  "♇",
  "⚷",
] as const;

export const SIGN_NAMES = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export const SIGN_GLYPHS = [
  "♈",
  "♉",
  "♊",
  "♋",
  "♌",
  "♍",
  "♎",
  "♏",
  "♐",
  "♑",
  "♒",
  "♓",
] as const;

export const ESMS_NAMES = ["Spirit", "Essence", "Matter", "Substance"] as const;
export type EsmsName = (typeof ESMS_NAMES)[number];

export const ELEMENT_NAMES = ["Fire", "Water", "Earth", "Air"] as const;
export type ElementName = (typeof ELEMENT_NAMES)[number];

export const ESMS_COLORS: Record<EsmsName, string> = {
  Spirit: "#e0a23a",
  Essence: "#4aa3d8",
  Matter: "#5fb37a",
  Substance: "#b98cd6",
};

export const ESMS_COLORS_ARRAY = [
  "#e0a23a", // Spirit (Fire)
  "#4aa3d8", // Essence (Water)
  "#5fb37a", // Matter (Earth)
  "#b98cd6", // Substance (Air)
] as const;

export const SIGN_RULERS = [4, 3, 2, 1, 0, 2, 3, 9, 5, 6, 7, 8] as const;

export const DOMICILES: Record<number, number[]> = {
  0: [4],
  1: [3],
  2: [2, 5],
  3: [1, 6],
  4: [0, 7],
  5: [8, 11],
  6: [9, 10],
  7: [10],
  8: [11],
  9: [7],
};

export const EXALTATIONS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 5,
  3: 11,
  4: 9,
  5: 3,
  6: 6,
  7: 7,
  8: 3,
  9: 4,
};

export const DETRIMENTS: Record<number, number[]> = Object.fromEntries(
  Object.entries(DOMICILES).map(([b, signs]) => [
    b,
    signs.map((s) => (s + 6) % 12),
  ])
);

export const FALLS: Record<number, number> = Object.fromEntries(
  Object.entries(EXALTATIONS).map(([b, s]) => [b, (s + 6) % 12])
);

export type DignityName = "Domicile" | "Exaltation" | "Neutral" | "Detriment" | "Fall";

export function dignityType(body: number, sign: number): DignityName {
  if (body < 0 || body > 9) return "Neutral";
  const b = body | 0;
  const s = ((sign | 0) % 12 + 12) % 12;

  if (DOMICILES[b]?.includes(s)) return "Domicile";
  if (EXALTATIONS[b] === s) return "Exaltation";
  if (DETRIMENTS[b]?.includes(s)) return "Detriment";
  if (FALLS[b] === s) return "Fall";
  return "Neutral";
}

export function dignityScore(body: number, sign: number): number {
  const type = dignityType(body, sign);
  switch (type) {
    case "Domicile": return 5;
    case "Exaltation": return 3;
    case "Detriment": return -3;
    case "Fall": return -5;
    default: return 0;
  }
}

// ── Case-Insensitive Normalization Lookup Maps ──────────────────────────────
const norm = (s: string) => s.trim().toLowerCase();
const SIGN_INDEX = new Map<string, number>(
  SIGN_NAMES.map((n, i) => [norm(n), i])
);
const PLANET_INDEX = new Map<string, number>(
  PLANET_NAMES.map((n, i) => [norm(n), i])
);

export function resolveSignIndex(sign: unknown): number {
  if (typeof sign === "number" && Number.isFinite(sign)) {
    return ((Math.floor(sign) % 12) + 12) % 12;
  }
  if (typeof sign === "string") {
    const idx = SIGN_INDEX.get(norm(sign));
    if (idx !== undefined) return idx;
  }
  return -1;
}

export function resolvePlanetIndex(planet: unknown): number {
  if (typeof planet === "number" && Number.isFinite(planet)) {
    const p = Math.floor(planet);
    return p >= 0 && p <= 10 ? p : -1;
  }
  if (typeof planet === "string") {
    const idx = PLANET_INDEX.get(norm(planet));
    if (idx !== undefined) return idx;
  }
  return -1;
}

export const SIGN_ELEMENT_MAP: ElementName[] = [
  "Fire",  // Aries
  "Earth", // Taurus
  "Air",   // Gemini
  "Water", // Cancer
  "Fire",  // Leo
  "Earth", // Virgo
  "Air",   // Libra
  "Water", // Scorpio
  "Fire",  // Sagittarius
  "Earth", // Capricorn
  "Air",   // Aquarius
  "Water", // Pisces
];

export const ELEMENT_OF_SIGN = (sign: number): ElementName =>
  SIGN_ELEMENT_MAP[((sign % 12) + 12) % 12];

export function planetElement(body: number): ElementName {
  if (body === 0) return "Fire"; // Sun
  if (body === 1) return "Water"; // Moon
  if (body === 2) return "Air"; // Mercury
  if (body === 3) return "Earth"; // Venus
  if (body === 4) return "Fire"; // Mars
  if (body === 5) return "Air"; // Jupiter
  if (body === 6) return "Earth"; // Saturn
  if (body === 7) return "Air"; // Uranus
  if (body === 8) return "Water"; // Neptune
  if (body === 9) return "Water"; // Pluto
  return "Water"; // Chiron and other bodies
}

export function chartRuler(ascDeg: number | null | undefined): number {
  if (ascDeg === null || ascDeg === undefined || isNaN(ascDeg)) return 7; // Uranus default
  const normalized = ((ascDeg % 360) + 360) % 360;
  const sign = Math.floor(normalized / 30);
  return SIGN_RULERS[sign] ?? 7;
}

export const FULL_WHEEL_MINUTES = 21600;
export const SIGN_MINUTES = 1800;

export const arcMinutesToDegrees = (arcMinutes: number): number => {
  const normMin = ((arcMinutes % FULL_WHEEL_MINUTES) + FULL_WHEEL_MINUTES) % FULL_WHEEL_MINUTES;
  return normMin / 60;
};

export const signAndMinToAbsMin = (sign: number, minInSign: number): number => {
  const s = ((sign % 12) + 12) % 12;
  const m = Math.max(0, Math.min(SIGN_MINUTES - 1, minInSign));
  return s * SIGN_MINUTES + m;
};

export function house_of_cusps(
  cusps: number[] | readonly number[],
  absMinutes: number
): number {
  const M = FULL_WHEEL_MINUTES;
  const L = ((absMinutes % M) + M) % M;

  for (let i = 0; i < 12; i++) {
    const a = ((cusps[i] % M) + M) % M;
    const b = ((cusps[(i + 1) % 12] % M) + M) % M;

    if (a < b) {
      if (L >= a && L < b) return i + 1;
    } else {
      if (L >= a || L < b) return i + 1;
    }
  }
  return 1;
}

export type HouseClassification = "angular" | "succedent" | "cadent";

export function houseClass(house: number | null | undefined): HouseClassification {
  if (!house || house < 1 || house > 12) return "succedent";
  if ([1, 4, 7, 10].includes(house)) return "angular";
  if ([2, 5, 8, 11].includes(house)) return "succedent";
  return "cadent";
}

export const SAL1_BY_CLASS: Record<HouseClassification, number> = {
  angular: 1.0,
  succedent: 0.6,
  cadent: 0.3,
};

const clamp = (val: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, val));

export interface ElementalComposition {
  Fire: number;
  Water: number;
  Earth: number;
  Air: number;
}

export function elementalComposition(
  body: number,
  sign: number,
  dignityScoreVal: number = 0
): ElementalComposition {
  const comp = { Fire: 12, Water: 12, Earth: 12, Air: 12 };
  comp[ELEMENT_OF_SIGN(sign)] += 40;
  comp[planetElement(body)] += 24;
  comp[ELEMENT_OF_SIGN(sign)] += Math.max(0, dignityScoreVal || 0) * 2;
  const sum = comp.Fire + comp.Water + comp.Earth + comp.Air;
  return {
    Fire: (comp.Fire / sum) * 100,
    Water: (comp.Water / sum) * 100,
    Earth: (comp.Earth / sum) * 100,
    Air: (comp.Air / sum) * 100,
  };
}

export const compToEsms = (
  c: ElementalComposition
): [number, number, number, number] => [c.Fire, c.Water, c.Earth, c.Air];

export interface ChartPosition {
  body: number;
  sign: number;
  house?: number | null;
  dignity?: { score?: number } | null;
  retrograde?: boolean;
  eclLon?: number;
}

export interface ChartInput {
  asc?: number | null;
  positions: ChartPosition[];
}

export function blendedBodyWeight(
  pos: ChartPosition,
  rulerBody: number,
  weights?: WeightsConfig
): number {
  const W = weights || DEFAULT_WEIGHTS;
  const cls = houseClass(pos.house);
  const dignScore =
    pos.dignity && typeof pos.dignity.score === "number"
      ? pos.dignity.score
      : dignityScore(pos.body, pos.sign);
  const dignFactor = clamp(1 + 0.08 * dignScore, 0.6, 1.4);
  const sal1 = SAL1_BY_CLASS[cls] * dignFactor;
  const sal2 =
    (pos.body === rulerBody ? W.chartRuler : 1) *
    (pos.body === 0
      ? W.sun
      : pos.body === 1
      ? W.moon
      : pos.body >= 2 && pos.body <= 4
      ? W.innerPlanets
      : W.outerPlanets);
  return sal1 * sal2;
}

export interface BlendedSmesResult {
  raw: [number, number, number, number];
  pct: [number, number, number, number];
  weights: Record<number, number>;
  ruler: number;
}

export function blendedSMES(
  chart: ChartInput,
  weights?: WeightsConfig,
  compOf?: (body: number, sign: number, dignityScoreVal: number) => ElementalComposition
): BlendedSmesResult {
  const comp = compOf || elementalComposition;
  const ruler = chartRuler(chart.asc);
  const raw: [number, number, number, number] = [0, 0, 0, 0];
  const wByBody: Record<number, number> = {};

  for (const p of chart.positions) {
    if (!p || typeof p.body !== "number") continue;
    const w = blendedBodyWeight(p, ruler, weights);
    wByBody[p.body] = w;
    if (w <= 0) continue;
    const dScore =
      p.dignity && typeof p.dignity.score === "number"
        ? p.dignity.score
        : dignityScore(p.body, p.sign);
    const esms = compToEsms(comp(p.body, p.sign, dScore));
    for (let e = 0; e < 4; e++) {
      raw[e] += w * esms[e];
    }
  }

  const sum = raw[0] + raw[1] + raw[2] + raw[3] || 1;
  const pct: [number, number, number, number] = [
    (raw[0] / sum) * 100,
    (raw[1] / sum) * 100,
    (raw[2] / sum) * 100,
    (raw[3] / sum) * 100,
  ];

  return { raw, pct, weights: wByBody, ruler };
}

export interface PlanetaryContributionRow {
  body: number;
  name: string;
  glyph: string;
  weight: number;
  relativeWeightPct: number;
  comp: [number, number, number, number];
  isRuler: boolean;
  retrograde: boolean;
}

export interface ConsensusGaugeViewModel {
  raw: [number, number, number, number];
  pct: [number, number, number, number];
  dominantIndex: number;
  dominantName: EsmsName;
  dominantElement: ElementName;
  dominantGlyph: string;
  dominantPct: number;
  dominantVibe: string;
  rulerBody: number;
  rulerName: string;
  rulerGlyph: string;
  isFixture: boolean;
  contributions: PlanetaryContributionRow[];
}

export function buildGaugeViewModel(
  chart: ChartInput,
  isFixture: boolean = false,
  weights?: WeightsConfig,
  compOf?: (body: number, sign: number, dignityScoreVal: number) => ElementalComposition
): ConsensusGaugeViewModel {
  const comp = compOf || elementalComposition;
  const smes = blendedSMES(chart, weights, comp);
  const ruler = smes.ruler;

  const byBody = Object.fromEntries(chart.positions.map((p) => [p.body, p]));
  const bodies = Object.keys(byBody)
    .map(Number)
    .sort((a, b) => (smes.weights[b] || 0) - (smes.weights[a] || 0));

  const maxWeight = Math.max(...bodies.map((b) => smes.weights[b] || 0), 1);

  const contributions: PlanetaryContributionRow[] = bodies.map((body) => {
    const p = byBody[body];
    const dign =
      p?.dignity && typeof p.dignity.score === "number"
        ? p.dignity.score
        : dignityScore(body, p?.sign ?? 0);
    const sign = p?.sign ?? 0;
    const compValues = compToEsms(comp(body, sign, dign));
    const sum = compValues[0] + compValues[1] + compValues[2] + compValues[3] || 1;
    const normalizedComp: [number, number, number, number] = [
      (compValues[0] / sum) * 100,
      (compValues[1] / sum) * 100,
      (compValues[2] / sum) * 100,
      (compValues[3] / sum) * 100,
    ];
    const w = smes.weights[body] || 0;
    return {
      body,
      name: PLANET_NAMES[body] ?? `Body ${body}`,
      glyph: PLANET_GLYPHS[body] ?? "✦",
      weight: w,
      relativeWeightPct: (w / maxWeight) * 100,
      comp: normalizedComp,
      isRuler: body === ruler,
      retrograde: Boolean(p?.retrograde),
    };
  });

  const dominantIndex = smes.pct.indexOf(Math.max(...smes.pct));
  const dominantName = ESMS_NAMES[dominantIndex] ?? "Matter";
  const dominantElement = ELEMENT_NAMES[dominantIndex] ?? "Earth";
  const dominantGlyphs = ["🜂", "🜄", "🜃", "🜁"];
  const vibes = [
    "energetic & visionary",
    "fluid & intuitive",
    "grounded & enduring",
    "expressive & conceptual",
  ];

  return {
    raw: smes.raw,
    pct: smes.pct,
    dominantIndex,
    dominantName,
    dominantElement,
    dominantGlyph: dominantGlyphs[dominantIndex] ?? "🜃",
    dominantPct: Math.round(smes.pct[dominantIndex] ?? 25),
    dominantVibe: vibes[dominantIndex] ?? "balanced & adaptive",
    rulerBody: ruler,
    rulerName: PLANET_NAMES[ruler] ?? "Ruler",
    rulerGlyph: PLANET_GLYPHS[ruler] ?? "✦",
    isFixture,
    contributions,
  };
}

export const CANONICAL_REFERENCE_CHART: ChartInput = {
  asc: 308, // Aquarius Ascendant -> Ruler Uranus (7)
  positions: [
    { body: 0, sign: 5, house: 8, dignity: { score: 0 } }, // Sun in Virgo
    { body: 2, sign: 5, house: 8, dignity: { score: 4 } }, // Mercury in Virgo (exalted)
    { body: 8, sign: 11, house: 1, dignity: { score: 5 }, retrograde: true }, // Neptune in Pisces ℞
    { body: 7, sign: 1, house: 3, dignity: { score: 1 } }, // Uranus in Taurus (ruler)
    { body: 1, sign: 9, house: 12, dignity: { score: -2 } }, // Moon in Capricorn
    { body: 3, sign: 6, house: 9, dignity: { score: 5 } }, // Venus in Libra
    { body: 4, sign: 2, house: 4, dignity: { score: 0 } }, // Mars in Gemini
    { body: 5, sign: 2, house: 4, dignity: { score: -2 } }, // Jupiter in Gemini
    { body: 6, sign: 11, house: 1, dignity: { score: 0 }, retrograde: true }, // Saturn in Pisces ℞
    { body: 9, sign: 9, house: 12, dignity: { score: 1 }, retrograde: true }, // Pluto in Capricorn ℞
    { body: 10, sign: 0, house: 2, dignity: { score: 0 }, retrograde: true }, // Chiron in Aries ℞
  ],
};

// ── Adapter Function ────────────────────────────────────────────────────────
export interface AdaptedChartResult {
  chart: ChartInput;
  isFixture: boolean;
  unresolvedCount: number;
}

export interface AdaptChartOptions {
  houseSystem?: "Placidus" | "WholeSign";
}

export function adaptKitchenChartToMath(
  storedChart: any,
  options?: AdaptChartOptions
): AdaptedChartResult {
  if (!storedChart || typeof storedChart !== "object") {
    return {
      chart: CANONICAL_REFERENCE_CHART,
      isFixture: true,
      unresolvedCount: 0,
    };
  }

  let ascDeg: number | null = null;
  const rawAsc =
    storedChart.ascendantDeg ??
    storedChart.ascendant ??
    storedChart.ascendantSign ??
    storedChart.planetaryPositions?.Ascendant ??
    storedChart.planetaryPositions?.ascendant;

  if (typeof rawAsc === "number" && Number.isFinite(rawAsc)) {
    ascDeg = rawAsc > 360 ? rawAsc / 60 : rawAsc;
  } else if (rawAsc != null) {
    const ascSignVal = typeof rawAsc === "object" ? (rawAsc as any).sign : rawAsc;
    const ascSignIdx = resolveSignIndex(ascSignVal);
    if (ascSignIdx >= 0) {
      ascDeg = ascSignIdx * 30 + 15;
    }
  }

  interface RawEntry {
    name: string;
    sign: any;
    house?: number | null;
    dignity?: any;
    retrograde?: boolean;
    position?: number;
  }
  const rawEntries: RawEntry[] = [];

  if (Array.isArray(storedChart.planets) && storedChart.planets.length > 0) {
    for (const p of storedChart.planets) {
      if (p && (p.name || p.planet)) {
        rawEntries.push({
          name: p.name || p.planet,
          sign: p.sign,
          house: p.house,
          dignity: p.dignity,
          retrograde: p.retrograde ?? p.isRetrograde,
          position: p.position ?? p.exactLongitude ?? p.degree,
        });
      }
    }
  } else if (
    storedChart.planetaryPositions &&
    typeof storedChart.planetaryPositions === "object"
  ) {
    for (const [name, val] of Object.entries(storedChart.planetaryPositions)) {
      if (name.toLowerCase() === "ascendant") continue;
      if (typeof val === "string") {
        rawEntries.push({ name, sign: val });
      } else if (val && typeof val === "object") {
        const v = val as any;
        rawEntries.push({
          name,
          sign: v.sign,
          house: v.house,
          dignity: v.dignity,
          retrograde: v.retrograde ?? v.isRetrograde,
          position: v.position ?? v.exactLongitude ?? v.degree,
        });
      }
    }
  } else {
    for (const name of PLANET_NAMES) {
      const val = storedChart[name] ?? storedChart[name.toLowerCase()];
      if (typeof val === "string") {
        rawEntries.push({ name, sign: val });
      } else if (val && typeof val === "object") {
        rawEntries.push({
          name,
          sign: val.sign,
          house: val.house,
          dignity: val.dignity,
          retrograde: val.retrograde ?? val.isRetrograde,
          position: val.position ?? val.exactLongitude ?? val.degree,
        });
      }
    }
  }

  const positions: ChartPosition[] = [];
  const seenBodies = new Set<number>();
  let unresolvedCount = 0;

  const ascSignIdx = ascDeg != null ? Math.floor(ascDeg / 30) % 12 : -1;
  const isWholeSign = options?.houseSystem === "WholeSign" && ascSignIdx >= 0;

  for (const p of rawEntries) {
    const bodyIdx = resolvePlanetIndex(p.name);
    if (bodyIdx < 0 || seenBodies.has(bodyIdx)) continue;

    const signIdx = resolveSignIndex(p.sign);
    if (signIdx < 0) {
      unresolvedCount++;
      continue;
    }

    seenBodies.add(bodyIdx);
    const score =
      typeof p.dignity?.score === "number"
        ? p.dignity.score
        : typeof p.dignity === "number"
        ? p.dignity
        : dignityScore(bodyIdx, signIdx);

    let houseNum: number | null = null;
    if (isWholeSign) {
      houseNum = ((signIdx - ascSignIdx + 12) % 12) + 1;
    } else if (typeof p.house === "number" && p.house >= 1 && p.house <= 12) {
      houseNum = p.house;
    }

    positions.push({
      body: bodyIdx,
      sign: signIdx,
      house: houseNum,
      dignity: { score },
      retrograde: Boolean(p.retrograde),
      eclLon: typeof p.position === "number" ? p.position : signIdx * 30 + 15,
    });
  }

  if (unresolvedCount > 0 || positions.length < 5 || ascDeg === null) {
    return {
      chart: CANONICAL_REFERENCE_CHART,
      isFixture: true,
      unresolvedCount,
    };
  }

  return {
    chart: { asc: ascDeg, positions },
    isFixture: false,
    unresolvedCount: 0,
  };
}
