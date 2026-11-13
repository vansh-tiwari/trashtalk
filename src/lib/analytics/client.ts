"use client";

import { track as vercelTrack } from "@vercel/analytics/react";

export type ArenaEventPayload = Record<string, string | number | boolean | null>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      targetOrAction: string | Date,
      params?: Record<string, unknown>
    ) => void;
  }
}

/**
 * Fires an analytics event to both Vercel Web Analytics and Google Analytics 4 (when configured).
 * Safe to call in any client handler; no-ops gracefully during SSR or when blocked by extensions.
 */
export function trackArenaEvent(name: string, properties?: ArenaEventPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    vercelTrack(name, properties);
  } catch {
    // Ignore if blocked by client extension
  }

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, properties ?? {});
    }
  } catch {
    // Ignore if GA is not configured
  }
}
