"use client";

import { useState, useEffect, useCallback } from "react";
import type { VisitorGeoContext, RecentBoutSummary } from "./context";
import type { BattleSnapshot } from "@/lib/storage/contracts";

const LOCAL_BOUTS_KEY = "trashtalk:recent_bouts:v2";
const LOCAL_DIALECT_KEY = "trashtalk:roast_dialect:v2";
const RINGSIDE_EVENT = "trashtalk:ringside-updated";
const MAX_BOUTS = 6;

export function getSavedDialectPreference(): string {
  if (typeof window === "undefined") return "auto";
  try {
    return window.localStorage.getItem(LOCAL_DIALECT_KEY) || "auto";
  } catch {
    return "auto";
  }
}

export function saveDialectPreference(dialectCode: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_DIALECT_KEY, dialectCode);
    window.dispatchEvent(new CustomEvent(RINGSIDE_EVENT));
  } catch {
    // Ignore storage quota errors
  }
}

export function getLocalRecentBouts(): RecentBoutSummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_BOUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_BOUTS);
  } catch {
    return [];
  }
}

export function mergeRecentBouts(
  localBouts: RecentBoutSummary[],
  serverBouts: RecentBoutSummary[]
): RecentBoutSummary[] {
  const map = new Map<string, RecentBoutSummary>();
  for (const b of [...localBouts, ...serverBouts]) {
    if (b && typeof b.id === "string" && b.u1 && b.u2) {
      const existing = map.get(b.id);
      if (!existing || Date.parse(b.createdAt) > Date.parse(existing.createdAt)) {
        map.set(b.id, b);
      }
    }
  }
  return Array.from(map.values())
    .sort((a, b) => (Date.parse(b.createdAt) || 0) - (Date.parse(a.createdAt) || 0))
    .slice(0, MAX_BOUTS);
}

export async function recordRecentBout(bout: RecentBoutSummary): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalRecentBouts();
    const merged = mergeRecentBouts([bout], current);
    window.localStorage.setItem(LOCAL_BOUTS_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent(RINGSIDE_EVENT));
  } catch {
    // ignore storage errors
  }

  try {
    await fetch("/api/ringside", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bout),
    });
  } catch {
    // Offline or network error: localStorage copy already saved
  }
}

export function recordBoutFromSnapshot(snapshot: BattleSnapshot): void {
  if (!snapshot || !snapshot.id) return;
  const summary: RecentBoutSummary = {
    id: snapshot.id,
    platform: snapshot.platform,
    u1: snapshot.player1.handle,
    u2: snapshot.player2.handle,
    winnerHandle: snapshot.verdict.winnerHandle,
    margin: snapshot.verdict.margin,
    p1Score: snapshot.player1.score.total,
    p2Score: snapshot.player2.score.total,
    createdAt: new Date().toISOString(),
  };
  void recordRecentBout(summary);
}

export async function clearAllRecentBouts(): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(LOCAL_BOUTS_KEY);
    window.dispatchEvent(new CustomEvent(RINGSIDE_EVENT));
  } catch {
    // ignore
  }

  try {
    await fetch("/api/ringside", { method: "DELETE" });
  } catch {
    // ignore offline error
  }
}

export function formatLocalRingsideClock(timezone?: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone || undefined,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZoneName: "short",
    });
    return formatter.format(now).toUpperCase();
  } catch {
    const now = new Date();
    return `${String(now.getUTCHours()).padStart(2, "0")}:${String(
      now.getUTCMinutes()
    ).padStart(2, "0")} UTC`;
  }
}

export function useRingsideContext() {
  const [geo, setGeo] = useState<VisitorGeoContext | null>(null);
  const [recentBouts, setRecentBouts] = useState<RecentBoutSummary[]>([]);
  const [dialectPref, setDialectPrefState] = useState<string>("auto");
  const [clockText, setClockText] = useState<string>("");

  const syncFromLocalAndServer = useCallback(async () => {
    const savedPref = getSavedDialectPreference();
    setDialectPrefState(savedPref);
    const localList = getLocalRecentBouts();
    setRecentBouts(localList);

    const tz =
      typeof Intl !== "undefined" && Intl.DateTimeFormat
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "UTC";
    const lang = typeof navigator !== "undefined" ? navigator.language : "en-US";
    setClockText(formatLocalRingsideClock(tz));

    try {
      const params = new URLSearchParams({
        tz,
        lang,
        dialect: savedPref,
      });
      const res = await fetch(`/api/ringside?${params.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.geo) {
        setGeo(data.geo);
        setClockText(formatLocalRingsideClock(data.geo.timezone || tz));
      }
      if (Array.isArray(data?.recentBouts)) {
        const merged = mergeRecentBouts(getLocalRecentBouts(), data.recentBouts);
        setRecentBouts(merged);
        try {
          window.localStorage.setItem(LOCAL_BOUTS_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
    } catch {
      // Offline fallback works from local state
    }
  }, []);

  useEffect(() => {
    void syncFromLocalAndServer();

    const handleCustomUpdate = () => {
      setDialectPrefState(getSavedDialectPreference());
      setRecentBouts(getLocalRecentBouts());
    };

    window.addEventListener(RINGSIDE_EVENT, handleCustomUpdate);
    const timer = window.setInterval(() => {
      setClockText((prev) => {
        const tz =
          typeof Intl !== "undefined" && Intl.DateTimeFormat
            ? Intl.DateTimeFormat().resolvedOptions().timeZone
            : "UTC";
        return formatLocalRingsideClock( tz) || prev;
      });
    }, 30000);

    return () => {
      window.removeEventListener(RINGSIDE_EVENT, handleCustomUpdate);
      window.clearInterval(timer);
    };
  }, [syncFromLocalAndServer]);

  const setDialectPreference = useCallback((code: string) => {
    saveDialectPreference(code);
    setDialectPrefState(code);
  }, []);

  const clearHistory = useCallback(async () => {
    setRecentBouts([]);
    await clearAllRecentBouts();
  }, []);

  return {
    geo,
    recentBouts,
    dialectPref,
    clockText,
    setDialectPreference,
    clearHistory,
  };
}
