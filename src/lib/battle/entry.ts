import type { Platform } from "@/lib/platforms/contracts";
import type { RoastPersona } from "@/lib/ai/schemas";
import { isBattleEnabled } from "@/lib/platforms/registry";

const VALID_PERSONAS = new Set<RoastPersona>([
  "savage_dev",
  "silicon_valley_vc",
  "ufc_announcer",
  "hype_man",
]);

export function parseRetryAfterMs(value: string | null, nowMs: number): number {
  if (!value || typeof value !== "string" || !value.trim()) {
    return 5000;
  }

  const trimmed = value.trim();

  // Try parsing as integer seconds
  const numericSeconds = Number(trimmed);
  if (!isNaN(numericSeconds)) {
    const ms = numericSeconds * 1000;
    return Math.min(30000, Math.max(0, ms));
  }

  // Try parsing as HTTP-Date
  const parsedDate = Date.parse(trimmed);
  if (!isNaN(parsedDate)) {
    const diff = parsedDate - nowMs;
    return Math.min(30000, Math.max(0, diff));
  }

  return 5000;
}

export function parseEntryPersona(value: unknown): RoastPersona {
  if (typeof value === "string" && VALID_PERSONAS.has(value as RoastPersona)) {
    return value as RoastPersona;
  }
  return "savage_dev";
}

export interface PreparedBattleRequest {
  platform: Platform;
  u1: string;
  u2: string;
  persona: RoastPersona;
  regionOverride?: string;
}

export function prepareBattleRequest(params: {
  platform: Platform;
  u1: string;
  u2: string;
  persona: RoastPersona;
  regionOverride?: string;
}): PreparedBattleRequest {
  if (!isBattleEnabled(params.platform)) {
    throw new Error(
      `Platform ${params.platform} is not currently live for battles.`
    );
  }

  return {
    platform: params.platform,
    u1: params.u1,
    u2: params.u2,
    persona: params.persona,
    ...(params.regionOverride && params.regionOverride !== "auto"
      ? { regionOverride: params.regionOverride }
      : {}),
  };
}
