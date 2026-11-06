/**
 * Shared Fight Night visual and brand color tokens.
 * Single source of truth across CSS variables, Tailwind, charts, platform previews, and PNG card rendering.
 * Spec §Color system: 2026-10-26-fight-night-color-motion-design.md
 */

export const BRAND_COLORS = {
  canvas: "#F2F2F0",
  paper2: "#E7E7E3",
  surface: "#FFFFFF",
  ink: "#111214",
  secondaryInk: "#5E6066",
  muted: "#5E6066",
  rule: "#DADAD6",
  action: "#D82A26",
  actionHover: "#B8201C",
  brand: "#D82A26",
  punchRed: "#D82A26",
  darkRed: "#B8201C",
  strokeRed: "#FF5A52",
  winner: "#FFFFFF",
  darkBg: "#15171B",
  darkText: "#F4F4F4",
  darkMuted: "#A3A6AE",
  focus: "#D82A26",
} as const;

export type BrandColorKey = keyof typeof BRAND_COLORS;

