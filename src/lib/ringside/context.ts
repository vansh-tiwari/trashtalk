import { resolveGlobalRegion, GlobalRegionInfo } from "@/lib/ai/global-regions";
import type { Platform } from "@/lib/platforms/contracts";

export interface RoastDialectOption {
  code: string;
  label: string;
  shortLabel: string;
  regionHint: string;
}

export const ROAST_DIALECT_OPTIONS: RoastDialectOption[] = [
  { code: "auto", label: "Auto-Detect (IP)", shortLabel: "AUTO", regionHint: "Geo IP" },
  { code: "en", label: "English", shortLabel: "ENGLISH", regionHint: "Global" },
  { code: "hi", label: "Hinglish", shortLabel: "HINGLISH", regionHint: "IN" },
  { code: "te", label: "Teluglish", shortLabel: "TELUGLISH", regionHint: "HYD · IN" },
  { code: "ta", label: "Tanglish", shortLabel: "TANGLISH", regionHint: "MAA · IN" },
  { code: "es", label: "Español", shortLabel: "ESPAÑOL", regionHint: "LATAM · ES" },
  { code: "pt", label: "Português", shortLabel: "PORTUGUÊS", regionHint: "BR" },
  { code: "fr", label: "Français", shortLabel: "FRANÇAIS", regionHint: "FR" },
  { code: "de", label: "Deutsch", shortLabel: "DEUTSCH", regionHint: "DE" },
  { code: "ru", label: "Русский", shortLabel: "РУССКИЙ", regionHint: "CF" },
];

export interface VisitorGeoContext {
  city: string;
  countryCode: string;
  timezone: string;
  datelineLocation: string;
  detectedRegion: GlobalRegionInfo;
  activeRegion: GlobalRegionInfo;
}

export interface RecentBoutSummary {
  id: string;
  platform: Platform;
  u1: string;
  u2: string;
  winnerHandle: string | null;
  margin: number;
  p1Score?: number;
  p2Score?: number;
  createdAt: string;
}

const TIMEZONE_CITY_MAP: Record<string, { city: string; country: string }> = {
  "asia/kolkata": { city: "BENGALURU", country: "IN" },
  "asia/calcutta": { city: "BENGALURU", country: "IN" },
  "america/new_york": { city: "NEW YORK", country: "US" },
  "america/los_angeles": { city: "SAN FRANCISCO", country: "US" },
  "america/chicago": { city: "CHICAGO", country: "US" },
  "america/mexico_city": { city: "MEXICO CITY", country: "MX" },
  "america/sao_paulo": { city: "SÃO PAULO", country: "BR" },
  "america/buenos_aires": { city: "BUENOS AIRES", country: "AR" },
  "america/bogota": { city: "BOGOTÁ", country: "CO" },
  "europe/london": { city: "LONDON", country: "GB" },
  "europe/paris": { city: "PARIS", country: "FR" },
  "europe/berlin": { city: "BERLIN", country: "DE" },
  "europe/madrid": { city: "MADRID", country: "ES" },
  "europe/moscow": { city: "MOSCOW", country: "RU" },
  "europe/warsaw": { city: "WARSAW", country: "PL" },
  "asia/tokyo": { city: "TOKYO", country: "JP" },
  "asia/singapore": { city: "SINGAPORE", country: "SG" },
  "asia/dubai": { city: "DUBAI", country: "AE" },
};

function readHeader(
  headers: Headers | Record<string, string | string[] | undefined> | null | undefined,
  key: string
): string {
  if (!headers) return "";
  if (typeof (headers as Headers).get === "function") {
    return (headers as Headers).get(key) || "";
  }
  const rec = headers as Record<string, string | string[] | undefined>;
  const val = rec[key] ?? rec[key.toLowerCase()];
  if (Array.isArray(val)) return val[0] || "";
  return val || "";
}

function safeDecodeCity(raw: string): string {
  if (!raw) return "";
  try {
    return decodeURIComponent(raw).replace(/\+/g, " ").trim().toUpperCase();
  } catch {
    return raw.trim().toUpperCase();
  }
}

export function resolveVisitorGeoContext(params: {
  headers?: Headers | Record<string, string | string[] | undefined> | null;
  clientTimezone?: string | null;
  clientLang?: string | null;
  overrideLang?: string | null;
}): VisitorGeoContext {
  const { headers, clientTimezone, clientLang, overrideLang } = params;

  const rawCity = readHeader(headers, "x-vercel-ip-city");
  const rawCountry = readHeader(headers, "x-vercel-ip-country").toUpperCase().trim();
  const rawTz = readHeader(headers, "x-vercel-ip-timezone").trim();

  const timezone = rawTz || clientTimezone?.trim() || "UTC";
  const tzLower = timezone.toLowerCase();
  const tzFallback = TIMEZONE_CITY_MAP[tzLower];

  const detectedRegion = resolveGlobalRegion(headers, null, timezone, clientLang);
  const effectiveOverride =
    overrideLang && overrideLang !== "auto" ? overrideLang : null;
  const activeRegion = resolveGlobalRegion(
    headers,
    effectiveOverride,
    timezone,
    clientLang
  );

  let city = safeDecodeCity(rawCity);
  let countryCode = rawCountry || detectedRegion.countryCode || "US";

  if (!city) {
    if (tzFallback) {
      city = tzFallback.city;
      if (!rawCountry) countryCode = tzFallback.country;
    } else if (timezone.includes("/")) {
      const parts = timezone.split("/");
      city = parts[parts.length - 1].replace(/_/g, " ").toUpperCase();
    } else {
      city = "RINGSIDE BUREAU";
    }
  }

  const datelineLocation =
    city === "RINGSIDE BUREAU" ? `${city} · ${countryCode}` : `${city}, ${countryCode}`;

  return {
    city,
    countryCode,
    timezone,
    datelineLocation,
    detectedRegion,
    activeRegion,
  };
}

/**
 * Computes a privacy-safe, non-reversible daily salted 24-character hex digest of the visitor's IP.
 * Raw IP addresses are never stored or exposed to clients.
 */
export function hashVisitorIp(
  headers?: Headers | Record<string, string | string[] | undefined> | null
): string {
  const forwarded = readHeader(headers, "x-forwarded-for");
  const realIp = readHeader(headers, "x-real-ip");
  const cfIp = readHeader(headers, "cf-connecting-ip");

  const rawIp =
    (forwarded ? forwarded.split(",")[0].trim() : "") ||
    realIp.trim() ||
    cfIp.trim() ||
    "local-ringside";

  const dayBucket = new Date().toISOString().slice(0, 10);
  const secretSalt = process.env.RINGSIDE_IP_SALT || "trashtalk-v2-ringside-salt";
  const input = `${rawIp}:${dayBucket}:${secretSalt}`;

  // Deterministic 3x 32-bit FNV-1a lanes -> 24 hex characters (zero Node/crypto bundle dependency)
  const seeds = [0x811c9dc5, 0x9e3779b9, 0x85ebca6b];
  let out = "";
  for (let s = 0; s < seeds.length; s++) {
    let h = seeds[s] >>> 0;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i) + s * 31;
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    out += h.toString(16).padStart(8, "0");
  }
  return out.slice(0, 24);
}

const MAX_BOUTS_PER_CORNER = 6;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CornerRecord {
  updatedAt: number;
  bouts: RecentBoutSummary[];
}

export class RingsideHistoryStore {
  private memory: Map<string, CornerRecord>;

  constructor(_unusedPath?: string | null) {
    this.memory = new Map<string, CornerRecord>();
  }

  getRecentBouts(ipHash: string): RecentBoutSummary[] {
    const rec = this.memory.get(ipHash);
    if (!rec) return [];
    const now = Date.now();
    if (now - rec.updatedAt >= TTL_MS) {
      this.memory.delete(ipHash);
      return [];
    }
    return rec.bouts.filter((b) => {
      const ts = Date.parse(b.createdAt);
      return Number.isNaN(ts) || now - ts < TTL_MS;
    });
  }

  recordBout(ipHash: string, bout: RecentBoutSummary): RecentBoutSummary[] {
    const existing = this.getRecentBouts(ipHash);
    const filtered = existing.filter((item) => item.id !== bout.id);
    const updated = [bout, ...filtered].slice(0, MAX_BOUTS_PER_CORNER);

    this.memory.set(ipHash, {
      updatedAt: Date.now(),
      bouts: updated,
    });
    return updated;
  }

  clearBouts(ipHash: string): void {
    this.memory.delete(ipHash);
  }
}

const globalForRingside = globalThis as unknown as {
  __trashtalkRingsideStore?: RingsideHistoryStore;
};

export const defaultRingsideHistoryStore =
  globalForRingside.__trashtalkRingsideStore ||
  (globalForRingside.__trashtalkRingsideStore = new RingsideHistoryStore());
