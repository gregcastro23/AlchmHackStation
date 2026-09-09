/**
 * Standalone Client-Side Ephemeris Calculator
 *
 * Provides real-time and birth-moment celestial approximations directly in the browser,
 * eliminating the need for remote Python microservices for the standalone Cloudflare deployment.
 */

import { SIGN_NAMES, ChartPosition } from "./astrologyMath";

// Mean orbital elements (J2000 epoch)
interface BodyOrbital {
  body: number;
  name: string;
  L0: number; // Mean longitude at epoch (degrees)
  dailyMotion: number; // Degrees per day
}

const BODIES_ORBITAL: BodyOrbital[] = [
  { body: 0, name: "Sun", L0: 280.46, dailyMotion: 0.9856474 },
  { body: 1, name: "Moon", L0: 218.32, dailyMotion: 13.176396 },
  { body: 2, name: "Mercury", L0: 252.25, dailyMotion: 4.092334 },
  { body: 3, name: "Venus", L0: 181.98, dailyMotion: 1.60213 },
  { body: 4, name: "Mars", L0: 355.43, dailyMotion: 0.52402 },
  { body: 5, name: "Jupiter", L0: 34.35, dailyMotion: 0.083085 },
  { body: 6, name: "Saturn", L0: 50.08, dailyMotion: 0.033444 },
  { body: 7, name: "Uranus", L0: 314.05, dailyMotion: 0.011726 },
  { body: 8, name: "Neptune", L0: 304.35, dailyMotion: 0.005981 },
  { body: 9, name: "Pluto", L0: 238.93, dailyMotion: 0.003964 },
  { body: 10, name: "Chiron", L0: 45.12, dailyMotion: 0.0194 },
];

const J2000_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

export function calculateEphemerisPositions(date: Date = new Date()): ChartPosition[] {
  const daysSinceEpoch = (date.getTime() - J2000_MS) / (1000 * 60 * 60 * 24);

  return BODIES_ORBITAL.map((b) => {
    const rawLon = ((b.L0 + b.dailyMotion * daysSinceEpoch) % 360 + 360) % 360;
    const sign = Math.floor(rawLon / 30);
    return {
      body: b.body,
      sign,
      eclLon: rawLon,
      retrograde: false,
    };
  });
}

export function calculateAscendant(date: Date = new Date(), latitude: number = 40.7128, longitude: number = -74.006): number {
  // Approximate Greenwich Mean Sidereal Time (GMST)
  const d = (date.getTime() - J2000_MS) / (1000 * 60 * 60 * 24);
  const utHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  let gmst = 18.697374558 + 24.06570982441908 * d;
  gmst = ((gmst % 24) + 24) % 24;

  const lst = ((gmst + longitude / 15) % 24 + 24) % 24; // Local Sidereal Time in hours
  const ramc = lst * 15; // Right Ascension of Midheaven (degrees)

  const eps = 23.439; // Obliquity of the ecliptic in degrees
  const epsRad = (eps * Math.PI) / 180;
  const latRad = (latitude * Math.PI) / 180;
  const ramcRad = (ramc * Math.PI) / 180;

  // Standard ascendant formula
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);
  let asc = (Math.atan2(y, x) * 180) / Math.PI;
  asc = ((asc % 360) + 360) % 360;

  return Math.round(asc * 100) / 100;
}
