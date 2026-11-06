import type { Platform } from "./contracts";
import { getPlatformConfig } from "./registry";

/**
 * Returns pure, serializable CSS variable declarations for a given platform.
 * Keeps platform identity and surface colors distinct from winner, draw, or error semantics.
 */
export function getPlatformCssVariables(platform: Platform): Record<string, string> {
  const config = getPlatformConfig(platform);
  const theme = config.theme;

  return {
    "--platform-accent": theme.accent,
    "--platform-accent-hover": theme.accentHover,
    "--platform-accent-ink": theme.accentInk,
    "--platform-player1-surface": theme.player1Surface,
    "--platform-player1-ink": theme.player1Ink,
    "--platform-player1-chart": theme.player1Chart,
    "--platform-player2-surface": theme.player2Surface,
    "--platform-player2-ink": theme.player2Ink,
    "--platform-player2-chart": theme.player2Chart,
    // Aliases mapped for player surfaces and charts in battle results
    "--player-one": theme.player1Surface,
    "--player-one-ink": theme.player1Ink,
    "--player-two": theme.player2Surface,
    "--player-two-ink": theme.player2Ink,
    "--chart-stroke-1": theme.player1Chart,
    "--chart-stroke-2": theme.player2Chart,
  };
}
