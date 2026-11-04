import { GithubEvidence } from "../platforms/contracts";
import { BattleVerdict, PlayerScore, RadarAxes } from "./types";
import { buildVerdictFromScores } from "./scoring";

const SCORING_VERSION = "2.0.0";

export interface GithubPlayerAxes {
  grit: number;     // Star Gravity (30%)
  peak: number;     // Shipping Cadence (25%)
  volume: number;   // Repo Depth (20%)
  velocity: number; // Community Footprint (15%)
  breadth: number;  // Tech Stack Breadth (10%)
}

export function computeGithubPlayerAxes(evidence: GithubEvidence): GithubPlayerAxes {
  const profile = evidence.profile;
  const totalStars = profile?.totalStars ?? 0;
  const recentEvents = evidence.recentContributions ?? 0;
  const publicRepos = profile?.publicRepos ?? 0;
  const followers = profile?.followers ?? 0;
  const distinctLanguages = profile?.languages?.length ?? 0;

  // 1. Star Gravity (30%): sqrt(stars) * 4.5 -> ~500 stars = 100
  const grit = totalStars > 0 ? Math.min(100, Math.round(Math.sqrt(totalStars) * 4.5)) : 0;

  // 2. Shipping Cadence (25%): recent events in past 90d -> 60 events = 100
  const peak = Math.min(100, Math.round((recentEvents / 60) * 100));

  // 3. Repo Depth (20%): original repos -> 25 repos = 100
  const volume = Math.min(100, Math.round((publicRepos / 25) * 100));

  // 4. Community Footprint (15%): followers -> 150 followers = 100
  const velocity = Math.min(100, Math.round((followers / 150) * 100));

  // 5. Tech Stack Breadth (10%): distinct languages -> 7 languages = 100
  const breadth = Math.min(100, Math.round((distinctLanguages / 7) * 100));

  return { grit, peak, volume, velocity, breadth };
}

export function calculateGithubCompositeScore(axes: GithubPlayerAxes): number {
  return Math.round(
    axes.grit * 0.3 +
    axes.peak * 0.25 +
    axes.volume * 0.2 +
    axes.velocity * 0.15 +
    axes.breadth * 0.1
  );
}

export function computeGithubPlayerScore(evidence: GithubEvidence): PlayerScore {
  const axes = computeGithubPlayerAxes(evidence);
  const total = calculateGithubCompositeScore(axes);

  const radarAxes: RadarAxes = {
    algorithmicGrit: axes.grit,
    contestPeak: axes.peak,
    solveVolume: axes.volume,
    recentVelocity: axes.velocity,
    topicBreadth: axes.breadth,
  };

  return {
    handle: evidence.handle,
    total,
    axes: radarAxes,
    metrics: {
      rating: evidence.profile?.totalStars ?? 0,
      maxRating: evidence.profile?.totalStars ?? 0,
      solvedCount: evidence.profile?.publicRepos ?? 0,
      recentAcceptedCount: evidence.recentContributions ?? 0,
      distinctTagsCount: evidence.profile?.languages?.length ?? 0,
    },
  };
}

export function scoreGithubBattle(
  p1: GithubEvidence,
  p2: GithubEvidence
): BattleVerdict {
  const p1Unavailable = p1.status === "unavailable" || p1.status === "not_found";
  const p2Unavailable = p2.status === "unavailable" || p2.status === "not_found";

  if (p1Unavailable || p2Unavailable) {
    const errorDetails: string[] = [];
    if (p1Unavailable) errorDetails.push(`Player 1 (${p1.handle}): ${p1.status}`);
    if (p2Unavailable) errorDetails.push(`Player 2 (${p2.handle}): ${p2.status}`);

    const dummyScore = (handle: string): PlayerScore => ({
      handle,
      total: 0,
      axes: { algorithmicGrit: 0, contestPeak: 0, solveVolume: 0, recentVelocity: 0, topicBreadth: 0 },
      metrics: { rating: 0, maxRating: 0, solvedCount: 0, recentAcceptedCount: 0, distinctTagsCount: 0 },
    });

    return {
      outcome: "insufficient_data",
      winnerHandle: null,
      loserHandle: null,
      isMirrorMatch: false,
      margin: 0,
      reasoning: "Insufficient evidence to evaluate GitHub battle.",
      scoringVersion: SCORING_VERSION,
      player1Score: dummyScore(p1.handle),
      player2Score: dummyScore(p2.handle),
      error: `Cannot compute battle result due to missing data: ${errorDetails.join(", ")}`,
    };
  }

  const player1Score = computeGithubPlayerScore(p1);
  const player2Score = computeGithubPlayerScore(p2);
  return buildVerdictFromScores(player1Score, player2Score, "GitHub");
}
