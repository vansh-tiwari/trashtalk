/**
 * Shared motion presets and policy resolution.
 * Durations and delays strictly match the Motion Storyboard in
 * docs/superpowers/specs/2026-10-26-fight-night-color-motion-design.md
 */

export type MotionMode = "full" | "reduced" | "paused";

/**
 * Pure helper resolving effective motion mode.
 * OS prefers-reduced-motion takes absolute priority over user pause toggle.
 */
export function resolveMotionMode(prefersReduced: boolean, paused: boolean): MotionMode {
  if (prefersReduced) return "reduced";
  if (paused) return "paused";
  return "full";
}

export interface MotionPresetItem {
  durationMs: number;
  durationSec: number;
  delayMs?: number;
  delaySec?: number;
}

export const MOTION_PRESETS = {
  headline: { durationMs: 450, durationSec: 0.45, delayMs: 0, delaySec: 0 },
  panelSlide: { durationMs: 500, durationSec: 0.5, delayMs: 150, delaySec: 0.15 },
  scoreCount: { durationMs: 850, durationSec: 0.85, delayMs: 250, delaySec: 0.25 },
  vsSlab: { durationMs: 380, durationSec: 0.38, delayMs: 450, delaySec: 0.45 },
  winnerStamp: { durationMs: 450, durationSec: 0.45, delayMs: 650, delaySec: 0.65 },
  roast: { durationMs: 420, durationSec: 0.42, delayMs: 600, delaySec: 0.6 },
  pairedBars: { durationMs: 650, durationSec: 0.65 },
  radar: { durationMs: 900, durationSec: 0.9 },
  overlap: { durationMs: 700, durationSec: 0.7 },
  sharePreview: { durationMs: 460, durationSec: 0.46 },
} as const;
