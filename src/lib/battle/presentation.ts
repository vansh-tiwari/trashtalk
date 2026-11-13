import { BattleSnapshot } from "../storage/contracts";
import { formatNum } from "./formatters";
import { PlayerScore } from "./types";
import { getPlatformConfig } from "../platforms/registry";

export type EvidenceState = "supported" | "partial" | "unknown";

export interface MetricCell {
  kind: "value" | "unavailable";
  value?: number | string;
  formatted: string;
  reason?: string;
}

export interface MetricRow {
  key: string;
  label: string;
  p1: MetricCell;
  p2: MetricCell;
  advantage: "p1" | "p2" | "tie" | "none";
  delta?: string | null;
}

export interface BattleViewModel {
  id: string;
  createdAt: string;
  formattedDate: string;
  platform: string;
  persona: string;
  isMirrorMatch: boolean;
  isSample: boolean;

  // Identity
  p1: {
    handle: string;
    avatarUrl?: string;
    rank?: string;
    score: number;
    rating?: number;
    maxRating?: number;
    subtitle?: string;
  };
  p2: {
    handle: string;
    avatarUrl?: string;
    rank?: string;
    score: number;
    rating?: number;
    maxRating?: number;
    subtitle?: string;
  };

  // Outcome & Policy
  outcome: "win" | "draw" | "insufficient_data";
  winnerHandle: string | null;
  loserHandle: string | null;
  winnerLabel: string;
  margin: number;
  reasoning: string;

  // Compatibility & Truthfulness
  evidenceState: EvidenceState;
  hasAuthoritativeStamp: boolean;
  scoreLabel: string;
  outcomeHeaderLabel: string;
  warningMessage: string | null;

  // Data Comparison Rows
  metrics: MetricRow[];

  // DNA & Overlap Summary
  dnaPercentage: number | null;
  dnaFormatted: string;
  isDefinitiveOverlap: boolean;
  commonCount: number;
  p1ExclusiveCount: number | null;
  p2ExclusiveCount: number | null;

  // Commentary
  punchline: string;
  headToHeadRoast: string;
  player1Roast: string;
  player2Roast: string;
  commentarySource: "ai" | "local";
}

export function toBattleViewModel(snapshot: BattleSnapshot): BattleViewModel {
  const { verdict, overlap, commentary, player1, player2 } = snapshot;

  // Detect evidence state
  let evidenceState: EvidenceState = "supported";
  if (verdict.outcome === "insufficient_data") {
    evidenceState = "partial";
  } else if (!overlap.isDefinitive) {
    if (verdict.scoringVersion === "1.0.0") {
      evidenceState = "unknown";
    } else {
      evidenceState = "partial";
    }
  }

  // Apply Snapshot Compatibility Policy
  let hasAuthoritativeStamp = false;
  let scoreLabel = "Score";
  let outcomeHeaderLabel = "MATCH VERDICT";
  let warningMessage: string | null = null;

  if (evidenceState === "unknown") {
    scoreLabel = "Recorded score";
    outcomeHeaderLabel = "RECORDED RESULT";
    warningMessage = "Coverage not recorded; this comparison cannot be independently verified.";
    hasAuthoritativeStamp = false;
  } else if (evidenceState === "partial" && verdict.outcome === "win") {
    scoreLabel = "Recorded score";
    outcomeHeaderLabel = "RECORDED RESULT";
    warningMessage = "Incomplete submission history; recorded outcome is not validated against lifetime solves.";
    hasAuthoritativeStamp = false;
  } else if (verdict.outcome === "win") {
    hasAuthoritativeStamp = true;
    outcomeHeaderLabel = "WINNER DECIDED";
  } else if (verdict.outcome === "draw") {
    outcomeHeaderLabel = "HONORABLE DRAW";
  } else {
    outcomeHeaderLabel = "INSUFFICIENT EVIDENCE";
    warningMessage = "Submission history was unavailable or truncated; an authoritative winner could not be verified.";
  }

  const p1Score = verdict.player1Score;
  const p2Score = verdict.player2Score;

  // Aligned Comparison Rows
  const metrics: MetricRow[] =
    snapshot.platform === "github"
      ? [
          createMetricRow(
            "stars",
            "Total Stars",
            p1Score.metrics.rating,
            p2Score.metrics.rating
          ),
          createMetricRow(
            "topRepo",
            "Top Project Stars",
            snapshot.githubMetadata?.player1.topRepos[0]?.stars ?? p1Score.metrics.maxRating,
            snapshot.githubMetadata?.player2.topRepos[0]?.stars ?? p2Score.metrics.maxRating
          ),
          createMetricRow(
            "repos",
            "Original Repos",
            p1Score.metrics.solvedCount,
            p2Score.metrics.solvedCount
          ),
          createMetricRow(
            "cadence",
            "Shipping Events (90d)",
            p1Score.metrics.recentAcceptedCount,
            p2Score.metrics.recentAcceptedCount
          ),
          createMetricRow(
            "followers",
            "Community (Followers)",
            snapshot.githubMetadata?.player1.followers ??
              (p1Score.axes.recentVelocity >= 100 ? 150 : Math.round(p1Score.axes.recentVelocity * 1.5)),
            snapshot.githubMetadata?.player2.followers ??
              (p2Score.axes.recentVelocity >= 100 ? 150 : Math.round(p2Score.axes.recentVelocity * 1.5))
          ),
          createMetricRow(
            "languages",
            "Languages Mastered",
            p1Score.metrics.distinctTagsCount,
            p2Score.metrics.distinctTagsCount
          ),
          createMetricRow(
            "composite",
            "Arena Score",
            p1Score.total,
            p2Score.total,
            true
          ),
        ]
      : [
          createMetricRow(
            "rating",
            "Current Rating",
            p1Score.metrics.rating,
            p2Score.metrics.rating
          ),
          createMetricRow(
            "peak",
            "Contest Peak",
            p1Score.metrics.maxRating,
            p2Score.metrics.maxRating
          ),
          createMetricRow(
            "solves",
            evidenceState === "supported" ? "Unique Solves" : "Observed Solves",
            p1Score.metrics.solvedCount,
            p2Score.metrics.solvedCount
          ),
          createMetricRow(
            "velocity",
            "180-Day Velocity",
            p1Score.metrics.recentAcceptedCount,
            p2Score.metrics.recentAcceptedCount
          ),
          createMetricRow(
            "breadth",
            "Topic Breadth",
            p1Score.metrics.distinctTagsCount,
            p2Score.metrics.distinctTagsCount
          ),
          createMetricRow(
            "grit",
            "Algorithmic Grit",
            p1Score.axes.algorithmicGrit,
            p2Score.axes.algorithmicGrit,
            true
          ),
          createMetricRow(
            "composite",
            scoreLabel,
            p1Score.total,
            p2Score.total,
            true
          ),
        ];

  // Date formatting
  let formattedDate = "Recorded Match";
  try {
    const d = new Date(snapshot.createdAt);
    if (!isNaN(d.getTime())) {
      formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      });
    }
  } catch {
    // keep fallback
  }

  // DNA
  const dnaFormatted = overlap.dnaPercentage !== null ? `${overlap.dnaPercentage}%` : "N/A";

  // Platform config & label
  const platformConfig = getPlatformConfig(snapshot.platform);
  const platformLabel = platformConfig.label;

  const formatPlayerSubtitle = (score: PlayerScore, rank?: string): string => {
    const rating = score.metrics?.rating;
    const maxRating = score.metrics?.maxRating;
    const solved = score.metrics?.solvedCount ?? 0;

    if (snapshot.platform === "github") {
      const stars = rating ? `${formatNum(rating)} stars` : "";
      if (rank) {
        return `${rank} · ${stars}`;
      }
      return `${stars} · ${formatNum(solved)} repos`;
    }

    if (snapshot.platform === "leetcode") {
      if (!rating || rating === 0) {
        return `${formatNum(solved)} solved`;
      }
      const peakStr = maxRating && maxRating !== rating ? ` (peak ${formatNum(maxRating)})` : "";
      return `${formatNum(rating)} rating${peakStr}`;
    }

    if (snapshot.platform === "codechef") {
      if (!rating || rating === 0) {
        return `${formatNum(solved)} solved`;
      }
      const starPrefix = rank ? `${rank} · ` : "";
      const peakStr = maxRating && maxRating !== rating ? ` (peak ${formatNum(maxRating)})` : "";
      return `${starPrefix}${formatNum(rating)} rating${peakStr}`;
    }

    const peakStr = maxRating && maxRating !== rating ? ` (peak ${formatNum(maxRating)})` : "";
    return `${formatNum(rating ?? 0)} rating${peakStr}`;
  };

  return {
    id: snapshot.id,
    createdAt: snapshot.createdAt,
    formattedDate,
    platform: platformLabel,
    persona: snapshot.persona,
    isMirrorMatch: verdict.isMirrorMatch,
    isSample:
      snapshot.isSample ??
      (snapshot.id === "cf-tourist-vs-petr-legendary" ||
        snapshot.id === "lc-neetcode-vs-larryny-legendary" ||
        snapshot.id === "cc-akulsareen-vs-gennady-legendary" ||
        snapshot.id === "gh-torvalds-vs-antirez-legendary"),

    p1: {
      handle: player1.handle,
      avatarUrl: player1.avatarUrl,
      rank: player1.rank,
      score: p1Score.total,
      rating: p1Score.metrics.rating,
      maxRating: p1Score.metrics.maxRating,
      subtitle: formatPlayerSubtitle(p1Score, player1.rank),
    },
    p2: {
      handle: player2.handle,
      avatarUrl: player2.avatarUrl,
      rank: player2.rank,
      score: p2Score.total,
      rating: p2Score.metrics.rating,
      maxRating: p2Score.metrics.maxRating,
      subtitle: formatPlayerSubtitle(p2Score, player2.rank),
    },

    outcome: verdict.outcome,
    winnerHandle: verdict.winnerHandle,
    loserHandle: verdict.loserHandle,
    winnerLabel:
      verdict.outcome === "draw"
        ? "Draw (No Winner)"
        : verdict.outcome === "insufficient_data"
        ? "Insufficient Evidence"
        : `@${verdict.winnerHandle}`,
    margin: verdict.margin,
    reasoning: verdict.reasoning,

    evidenceState,
    hasAuthoritativeStamp,
    scoreLabel,
    outcomeHeaderLabel,
    warningMessage,

    metrics,

    dnaPercentage: overlap.dnaPercentage,
    dnaFormatted,
    isDefinitiveOverlap: overlap.isDefinitive,
    commonCount: overlap.commonCount,
    p1ExclusiveCount: overlap.isDefinitive ? overlap.player1Exclusive.length : null,
    p2ExclusiveCount: overlap.isDefinitive ? overlap.player2Exclusive.length : null,

    punchline: commentary.punchline,
    headToHeadRoast: commentary.headToHeadRoast,
    player1Roast: commentary.player1Roast,
    player2Roast: commentary.player2Roast,
    commentarySource: commentary.source,
  };
}

function createMetricRow(
  key: string,
  label: string,
  v1: number | undefined,
  v2: number | undefined,
  isPercentOrPoints = false
): MetricRow {
  if (v1 === undefined || v2 === undefined) {
    return {
      key,
      label,
      p1: v1 !== undefined ? { kind: "value", value: v1, formatted: String(v1) } : { kind: "unavailable", formatted: "—", reason: "Data unavailable" },
      p2: v2 !== undefined ? { kind: "value", value: v2, formatted: String(v2) } : { kind: "unavailable", formatted: "—", reason: "Data unavailable" },
      advantage: "none",
      delta: null,
    };
  }

  let advantage: "p1" | "p2" | "tie" = "tie";
  let delta: string | null = null;

  if (v1 > v2) {
    advantage = "p1";
    delta = `+${v1 - v2}${isPercentOrPoints ? " pts" : ""}`;
  } else if (v2 > v1) {
    advantage = "p2";
    delta = `+${v2 - v1}${isPercentOrPoints ? " pts" : ""}`;
  }

  return {
    key,
    label,
    p1: { kind: "value", value: v1, formatted: formatNum(v1) },
    p2: { kind: "value", value: v2, formatted: formatNum(v2) },
    advantage,
    delta,
  };
}
