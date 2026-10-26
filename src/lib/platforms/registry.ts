import type { Platform } from "./contracts";

export type { Platform } from "./contracts";

export type PlatformStatus = "live" | "next" | "planned";

export interface PlatformTheme {
  accent: string;
  accentHover: string;
  accentInk: string;
  player1Surface: string;
  player1Ink: string;
  player1Chart: string;
  player2Surface: string;
  player2Ink: string;
  player2Chart: string;
}

export interface PlatformConfig {
  id: Platform;
  label: string;
  status: PlatformStatus;
  availabilityLabel: string;
  theme: PlatformTheme;
  emphasis: readonly string[];
  layout: "contest" | "solving" | "repositories";
}

export const PLATFORM_ORDER: readonly Platform[] = [
  "codeforces",
  "leetcode",
  "github",
  "codechef",
] as const;

export const PLATFORM_REGISTRY: Readonly<Record<Platform, PlatformConfig>> = {
  codeforces: {
    id: "codeforces",
    label: "Codeforces",
    status: "live",
    availabilityLabel: "live",
    theme: {
      accent: "#304BFF",
      accentHover: "#243ACB",
      accentInk: "#FFFFFF",
      player1Surface: "#304BFF",
      player1Ink: "#FFFFFF",
      player1Chart: "#304BFF",
      player2Surface: "#FF5A2A",
      player2Ink: "#111214",
      player2Chart: "#BE3815",
    },
    emphasis: ["Rating", "peak", "solves", "overlap", "five axes"],
    layout: "contest",
  },
  leetcode: {
    id: "leetcode",
    label: "LeetCode",
    status: "live",
    availabilityLabel: "live",
    theme: {
      accent: "#FFCA3A",
      accentHover: "#E9B323",
      accentInk: "#111214",
      player1Surface: "#FFCA3A",
      player1Ink: "#111214",
      player1Chart: "#946800",
      player2Surface: "#273442",
      player2Ink: "#FFFFFF",
      player2Chart: "#273442",
    },
    emphasis: ["difficulty breakdown", "solving activity", "shared problems"],
    layout: "solving",
  },
  github: {
    id: "github",
    label: "GitHub",
    status: "live",
    availabilityLabel: "live",
    theme: {
      accent: "#91F5C2",
      accentHover: "#6BDEA5",
      accentInk: "#111214",
      player1Surface: "#91F5C2",
      player1Ink: "#111214",
      player1Chart: "#1B7C4E",
      player2Surface: "#273442",
      player2Ink: "#FFFFFF",
      player2Chart: "#273442",
    },
    emphasis: ["repositories", "contributions", "languages"],
    layout: "repositories",
  },
  codechef: {
    id: "codechef",
    label: "CodeChef",
    status: "live",
    availabilityLabel: "live",
    theme: {
      accent: "#ED714B",
      accentHover: "#D95F3A",
      accentInk: "#111214",
      player1Surface: "#ED714B",
      player1Ink: "#111214",
      player1Chart: "#B03D1B",
      player2Surface: "#F4CFA2",
      player2Ink: "#111214",
      player2Chart: "#85511A",
    },
    emphasis: ["rating", "stars", "contest history"],
    layout: "contest",
  },
} as const;

export function getPlatformConfig(id: Platform): PlatformConfig {
  return PLATFORM_REGISTRY[id] ?? PLATFORM_REGISTRY.codeforces;
}

export function parsePlatform(value: unknown): Platform {
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized in PLATFORM_REGISTRY) {
      return normalized as Platform;
    }
  }
  return "codeforces";
}

export function isBattleEnabled(id: Platform): boolean {
  return PLATFORM_REGISTRY[id]?.status === "live";
}
