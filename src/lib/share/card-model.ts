import type { BattleSnapshot } from "../storage/contracts";
import { type BattleCopy, buildBattleCopy } from "../battle/copy";
import { type PlatformConfig, getPlatformConfig } from "../platforms/registry";
import { type CardFormat, getCanonicalBattleUrl } from "./client";
import { formatNum } from "../battle/formatters";

export type { CardFormat } from "./client";

export const CARD_DIMENSIONS: Record<CardFormat, { width: number; height: number }> = {
  og: { width: 1200, height: 630 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
};

export interface BattleCardPlayer {
  handle: string;
  initials: string;
  score: number;
}

export interface KillerReceipt {
  label: string;
  p1Formatted: string;
  p2Formatted: string;
  leaderHandle: string | null;
  delta: string;
}

export interface BattleCardModel {
  copy: BattleCopy;
  player1: BattleCardPlayer;
  player2: BattleCardPlayer;
  platform: PlatformConfig;
  canonicalUrl: string;
  formattedDate: string;
  killerReceipt?: KillerReceipt | null;
  winnerHandle?: string | null;
  loserHandle?: string | null;
  margin?: number;
}

export function getPlayerInitials(handle: string): string {
  const clean = handle.replace(/^@+/, "").trim();
  if (!clean) return "??";
  return clean.slice(0, 2).toUpperCase();
}

/**
 * Computes the standout killer stat / receipt between the two players.
 */
export function computeKillerReceipt(snapshot: BattleSnapshot): KillerReceipt | null {
  const isGithub = snapshot.platform === "github";
  const m1 = snapshot.player1.score.metrics;
  const m2 = snapshot.player2.score.metrics;

  if (isGithub && m1 && m2) {
    const r1 = m1.rating || 0;
    const r2 = m2.rating || 0;
    const starDiff = Math.abs(r1 - r2);
    if (starDiff > 0) {
      return {
        label: "TOTAL STARS",
        p1Formatted: `${formatNum(r1)} stars`,
        p2Formatted: `${formatNum(r2)} stars`,
        leaderHandle: r1 > r2 ? snapshot.player1.handle : snapshot.player2.handle,
        delta: `+${formatNum(starDiff)} STARS`,
      };
    }

    const repos1 = m1.solvedCount || 0;
    const repos2 = m2.solvedCount || 0;
    const repoDiff = Math.abs(repos1 - repos2);
    if (repoDiff > 0) {
      return {
        label: "ORIGINAL REPOS",
        p1Formatted: `${formatNum(repos1)} repos`,
        p2Formatted: `${formatNum(repos2)} repos`,
        leaderHandle: repos1 > repos2 ? snapshot.player1.handle : snapshot.player2.handle,
        delta: `+${formatNum(repoDiff)} REPOS`,
      };
    }
  }

  if (m1 && m2) {
    const peak1 = m1.maxRating || 0;
    const peak2 = m2.maxRating || 0;
    const peakDiff = Math.abs(peak1 - peak2);
    if (peakDiff > 0) {
      return {
        label: "PEAK RATING",
        p1Formatted: `${formatNum(peak1)} PEAK`,
        p2Formatted: `${formatNum(peak2)} PEAK`,
        leaderHandle: peak1 > peak2 ? snapshot.player1.handle : snapshot.player2.handle,
        delta: `+${formatNum(peakDiff)} PEAK`,
      };
    }

    const solves1 = m1.solvedCount || 0;
    const solves2 = m2.solvedCount || 0;
    const solveDiff = Math.abs(solves1 - solves2);
    if (solveDiff > 0) {
      return {
        label: "TOTAL SOLVES",
        p1Formatted: `${formatNum(solves1)} solves`,
        p2Formatted: `${formatNum(solves2)} solves`,
        leaderHandle: solves1 > solves2 ? snapshot.player1.handle : snapshot.player2.handle,
        delta: `+${formatNum(solveDiff)} SOLVES`,
      };
    }
  }

  const margin = snapshot.verdict.margin;
  if (margin > 0 && snapshot.verdict.winnerHandle) {
    return {
      label: "SCORE MARGIN",
      p1Formatted: `${snapshot.player1.score.total} pts`,
      p2Formatted: `${snapshot.player2.score.total} pts`,
      leaderHandle: snapshot.verdict.winnerHandle,
      delta: `+${margin} PTS`,
    };
  }

  return null;
}

/**
 * Builds data model for share card rendering across all three formats.
 * Consumes the shared short roast and outcome copy from buildBattleCopy.
 */
export function buildBattleCardModel(
  snapshot: BattleSnapshot,
  origin: string
): BattleCardModel {
  // Always use English commentary for exportable social cards to ensure global understandability
  const cardSnapshot = snapshot.englishCommentary
    ? { ...snapshot, commentary: snapshot.englishCommentary }
    : snapshot;
  const copy = buildBattleCopy(cardSnapshot);
  const platform = getPlatformConfig(snapshot.platform);
  const canonicalUrl = getCanonicalBattleUrl(origin, snapshot.id);
  const killerReceipt = computeKillerReceipt(snapshot);

  let formattedDate = "recorded match";
  try {
    const d = new Date(snapshot.createdAt);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  } catch {
    formattedDate = "recorded match";
  }

  return {
    copy,
    player1: {
      handle: snapshot.player1.handle,
      initials: getPlayerInitials(snapshot.player1.handle),
      score: snapshot.player1.score.total,
    },
    player2: {
      handle: snapshot.player2.handle,
      initials: getPlayerInitials(snapshot.player2.handle),
      score: snapshot.player2.score.total,
    },
    platform,
    canonicalUrl,
    formattedDate,
    killerReceipt,
    winnerHandle: snapshot.verdict.winnerHandle,
    loserHandle: snapshot.verdict.loserHandle,
    margin: snapshot.verdict.margin,
  };
}
