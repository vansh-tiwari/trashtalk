import {
  CodechefEvidence,
  CodeforcesEvidence,
  GithubEvidence,
  LeetcodeEvidence,
  Platform,
  PlatformEvidence,
} from "../platforms/contracts";
import { BattleVerdict, PlayerScore, RadarAxes } from "./types";
import {
  scoreGithubBattle,
  computeGithubPlayerAxes,
  calculateGithubCompositeScore,
} from "./github-scoring";

const SCORING_VERSION = "2.0.0";
const ONE_HUNDRED_EIGHTY_DAYS_SEC = 180 * 24 * 60 * 60;

export function computeCodeforcesPlayerAxes(evidence: CodeforcesEvidence): PlayerScore {
  const profile = evidence.profile;
  const rating = profile?.rating ?? 0;
  const maxRating = profile?.maxRating ?? rating;
  const solvedProblems = evidence.solvedProblems ?? [];
  const solvedCount = solvedProblems.length;

  const nowSec = Math.floor(Date.now() / 1000);
  const cutoffSec = nowSec - ONE_HUNDRED_EIGHTY_DAYS_SEC;

  let recentAcceptedCount = 0;
  const tagsSet = new Set<string>();

  for (const prob of solvedProblems) {
    if (prob.acceptedAt >= cutoffSec) {
      recentAcceptedCount++;
    }
    for (const tag of prob.tags) {
      tagsSet.add(tag.toLowerCase());
    }
  }

  // 1. Algorithmic Grit: depth and difficulty of rated problems solved
  const ratedProblems = solvedProblems
    .filter((p) => typeof p.rating === "number" && p.rating > 0)
    .map((p) => p.rating as number)
    .sort((a, b) => b - a);

  let depthRating = 0;
  if (ratedProblems.length > 0) {
    // 90th percentile depth (top 10% hardest problems solved)
    const p90Index = Math.floor(ratedProblems.length * 0.1);
    depthRating = ratedProblems[p90Index] || ratedProblems[0];
  } else if (maxRating > 0) {
    depthRating = Math.round(maxRating * 0.65);
  }

  // Calibrate depthRating: 800 -> ~8, 1600 -> ~38, 2400 -> ~69, 3200+ -> 100
  const algorithmicGrit = depthRating > 0
    ? Math.min(100, Math.max(0, Math.round(((depthRating - 600) / (3200 - 600)) * 100)))
    : 0;

  // 2. Contest Peak: official contest performance / peak rating
  const contestPeak = Math.min(100, Math.max(0, Math.round((maxRating / 3500) * 100)));

  // 3. Solve Volume: breadth of unique problems accepted
  const solveVolume = Math.min(100, Math.max(0, Math.round((solvedCount / 1000) * 100)));

  // 4. Recent Velocity: solves accepted in last 180 days
  const recentVelocity = Math.min(100, Math.max(0, Math.round((recentAcceptedCount / 150) * 100)));

  // 5. Topic Breadth: distinct problem tags mastered
  const topicBreadth = Math.min(100, Math.max(0, Math.round((tagsSet.size / 25) * 100)));

  const axes: RadarAxes = {
    algorithmicGrit,
    contestPeak,
    solveVolume,
    recentVelocity,
    topicBreadth,
  };

  // Weighted total: Grit 30%, Contest 25%, Volume 20%, Velocity 15%, Breadth 10%
  const total = Math.round(
    algorithmicGrit * 0.3 +
    contestPeak * 0.25 +
    solveVolume * 0.2 +
    recentVelocity * 0.15 +
    topicBreadth * 0.1
  );

  return {
    handle: evidence.handle,
    total,
    axes,
    metrics: {
      rating,
      maxRating,
      solvedCount,
      recentAcceptedCount,
      distinctTagsCount: tagsSet.size,
    },
  };
}

// Backward-compatible alias
export const computePlayerAxes = computeCodeforcesPlayerAxes;

export function computeLeetcodePlayerAxes(evidence: LeetcodeEvidence): PlayerScore {
  const profile = evidence.profile;
  const rating = profile?.rating ?? 0;
  const maxRating = profile?.maxRating ?? (rating > 0 ? rating : 0);
  const totalSolved = profile?.totalSolved ?? 0;
  const easySolved = profile?.easySolved ?? 0;
  const mediumSolved = profile?.mediumSolved ?? 0;
  const hardSolved = profile?.hardSolved ?? 0;

  // 1. Algorithmic Grit (30%)
  // Hard depth up to 75 Hards = 55 pts, Medium depth up to 250 Mediums = 30 pts
  // Hard density against non-easy solves (hard / (hard + med)) = up to 15 pts (>= 25% hard = 15 pts)
  const hardDepth = Math.min(55, Math.round((hardSolved / 75) * 55));
  const medDepth = Math.min(30, Math.round((mediumSolved / 250) * 30));
  const nonEasy = hardSolved + mediumSolved;
  const hardDensity = nonEasy >= 20
    ? Math.min(15, Math.round(((hardSolved / nonEasy) / 0.25) * 15))
    : Math.min(5, hardSolved);
  const algorithmicGrit = Math.min(100, hardDepth + medDepth + hardDensity);

  // 2. Contest Peak (25%)
  // For rated users (contestsAttended > 0 and maxRating > 0):
  // Scale from 1200 baseline to 3200 ceiling with a 25 pt floor for stepping into the arena:
  let contestPeak = 0;
  if (profile?.contestsAttended && profile.contestsAttended > 0 && maxRating > 0) {
    if (maxRating >= 1200) {
      contestPeak = Math.min(100, 40 + Math.round(((maxRating - 1200) / (3200 - 1200)) * 60));
    } else {
      contestPeak = Math.max(25, Math.min(40, Math.round(((maxRating - 800) / (1200 - 800)) * 15 + 25)));
    }
  } else {
    // Unrated proxy strictly capped at 40 (equivalent to 1200 rating baseline)
    contestPeak = Math.min(40, Math.round(((hardSolved * 4 + mediumSolved * 1) / 400) * 40));
  }

  // 3. Solve Volume (20%)
  const solveVolume = Math.min(100, Math.round((totalSolved / 1000) * 100));

  // 4. Recent Velocity (15%)
  const activeDays = evidence.recent180dActiveDays ?? 0;
  const subs = evidence.recent180dSubmissions ?? 0;
  const dayPts = Math.min(60, Math.round((activeDays / 60) * 60));
  const subPts = Math.min(40, Math.round((subs / 200) * 40));
  const recentVelocity = (activeDays > 0 || subs > 0)
    ? Math.min(100, dayPts + subPts)
    : Math.min(20, (evidence.solvedProblems?.length ?? 0) * 2);

  // 5. Topic Breadth (10%)
  // Qualified tags with at least 3 solves
  const qualifiedTags = (evidence.tagStats ?? []).filter((t) => t.problemsSolved >= 3).length;
  const topicBreadth = Math.min(100, Math.round((qualifiedTags / 25) * 100));

  const axes: RadarAxes = {
    algorithmicGrit,
    contestPeak,
    solveVolume,
    recentVelocity,
    topicBreadth,
  };

  // Weighted total: Grit 30%, Contest 25%, Volume 20%, Velocity 15%, Breadth 10%
  const total = Math.round(
    algorithmicGrit * 0.3 +
    contestPeak * 0.25 +
    solveVolume * 0.2 +
    recentVelocity * 0.15 +
    topicBreadth * 0.1
  );

  return {
    handle: evidence.handle,
    total,
    axes,
    metrics: {
      rating,
      maxRating,
      solvedCount: totalSolved,
      recentAcceptedCount: subs,
      distinctTagsCount: qualifiedTags,
    },
  };
}

export function buildVerdictFromScores(
  player1Score: PlayerScore,
  player2Score: PlayerScore,
  platformLabel: string
): BattleVerdict {
  const isMirrorMatch = player1Score.handle.toLowerCase() === player2Score.handle.toLowerCase();
  const margin = Math.abs(player1Score.total - player2Score.total);

  if (isMirrorMatch || player1Score.total === player2Score.total) {
    return {
      outcome: "draw",
      winnerHandle: null,
      loserHandle: null,
      isMirrorMatch,
      margin: 0,
      reasoning: isMirrorMatch
        ? `Mirror match: ${player1Score.handle} fought against their own ${platformLabel} profile.`
        : `Evenly matched showdown: Both players achieved an identical composite battle score of ${player1Score.total}.`,
      scoringVersion: SCORING_VERSION,
      player1Score,
      player2Score,
    };
  }

  const p1Wins = player1Score.total > player2Score.total;
  const winner = p1Wins ? player1Score : player2Score;
  const loser = p1Wins ? player2Score : player1Score;

  const factors: string[] = [];
  if (winner.axes.contestPeak > loser.axes.contestPeak) factors.push("Contest Peak");
  if (winner.axes.algorithmicGrit > loser.axes.algorithmicGrit) factors.push("Algorithmic Grit");
  if (winner.axes.solveVolume > loser.axes.solveVolume) factors.push("Solve Volume");
  if (winner.axes.recentVelocity > loser.axes.recentVelocity) factors.push("Recent Velocity");
  if (winner.axes.topicBreadth > loser.axes.topicBreadth) factors.push("Topic Breadth");

  const primaryFactors = factors.slice(0, 2).join(" and ") || "Balanced Metrics";

  return {
    outcome: "win",
    winnerHandle: winner.handle,
    loserHandle: loser.handle,
    isMirrorMatch: false,
    margin,
    reasoning: `${winner.handle} outperformed ${loser.handle} driven by superiority in ${primaryFactors} (${winner.total} vs ${loser.total} pts).`,
    scoringVersion: SCORING_VERSION,
    player1Score,
    player2Score,
  };
}

export function scoreCodeforcesBattle(
  p1: CodeforcesEvidence,
  p2: CodeforcesEvidence
): BattleVerdict {
  const p1Unavailable =
    p1.status === "unavailable" ||
    p1.status === "not_found" ||
    p1.coverage?.historyAvailability === "unavailable";
  const p2Unavailable =
    p2.status === "unavailable" ||
    p2.status === "not_found" ||
    p2.coverage?.historyAvailability === "unavailable";

  if (p1Unavailable || p2Unavailable) {
    const errorDetails: string[] = [];
    if (p1Unavailable) {
      errorDetails.push(
        `Player 1 (${p1.handle}): ${p1.status} (history ${p1.coverage?.historyAvailability ?? "missing"})`
      );
    }
    if (p2Unavailable) {
      errorDetails.push(
        `Player 2 (${p2.handle}): ${p2.status} (history ${p2.coverage?.historyAvailability ?? "missing"})`
      );
    }

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
      reasoning: "Insufficient evidence to evaluate battle.",
      scoringVersion: SCORING_VERSION,
      player1Score: dummyScore(p1.handle),
      player2Score: dummyScore(p2.handle),
      error: `Cannot compute battle result due to missing data: ${errorDetails.join(", ")}`,
    };
  }

  const player1Score = computeCodeforcesPlayerAxes(p1);
  const player2Score = computeCodeforcesPlayerAxes(p2);
  return buildVerdictFromScores(player1Score, player2Score, "Codeforces");
}

export function scoreLeetcodeBattle(
  p1: LeetcodeEvidence,
  p2: LeetcodeEvidence
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
      reasoning: "Insufficient evidence to evaluate battle.",
      scoringVersion: SCORING_VERSION,
      player1Score: dummyScore(p1.handle),
      player2Score: dummyScore(p2.handle),
      error: `Cannot compute battle result due to missing data: ${errorDetails.join(", ")}`,
    };
  }

  const player1Score = computeLeetcodePlayerAxes(p1);
  const player2Score = computeLeetcodePlayerAxes(p2);
  return buildVerdictFromScores(player1Score, player2Score, "LeetCode");
}

export function scoreBattle(
  platform: Platform,
  p1: PlatformEvidence,
  p2: PlatformEvidence
): BattleVerdict {
  if (platform === "github") {
    // Dynamic import avoidance; scoreGithubBattle is re-exported below
    return scoreGithubBattle(p1 as GithubEvidence, p2 as GithubEvidence);
  }
  if (platform === "leetcode") {
    return scoreLeetcodeBattle(p1 as LeetcodeEvidence, p2 as LeetcodeEvidence);
  }
  if (platform === "codechef") {
    return scoreCodechefBattle(p1 as CodechefEvidence, p2 as CodechefEvidence);
  }
  return scoreCodeforcesBattle(p1 as CodeforcesEvidence, p2 as CodeforcesEvidence);
}

export { scoreGithubBattle, computeGithubPlayerAxes, calculateGithubCompositeScore };

export function computeCodechefPlayerAxes(evidence: CodechefEvidence): PlayerScore {
  const profile = evidence.profile;
  const rating = profile?.rating ?? 0;
  const maxRating = profile?.highestRating ?? (rating > 0 ? rating : 0);
  const stars = profile?.stars;
  const totalSolved = profile?.totalSolved ?? (evidence.solvedProblems?.length ?? 0);

  // 1. Algorithmic Grit (30%)
  // Base grit derived from rating scale (1000 -> 0, 2800 -> 100)
  const gritRating = maxRating >= 1000
    ? Math.min(100, Math.max(0, Math.round(((maxRating - 1000) / (2800 - 1000)) * 100)))
    : 0;

  // Star tiers establish reliable floors for Grit
  let starFloor = 0;
  if (stars === 7) starFloor = 92;
  else if (stars === 6) starFloor = 80;
  else if (stars === 5) starFloor = 65;
  else if (stars === 4) starFloor = 50;
  else if (stars === 3) starFloor = 35;
  else if (stars === 2) starFloor = 20;
  else if (stars === 1) starFloor = 10;

  const algorithmicGrit = Math.min(100, Math.max(starFloor, gritRating));

  // 2. Contest Peak (25%)
  // Normalized against 3,200 CodeChef ceiling
  const contestPeak = Math.min(100, Math.max(0, Math.round((maxRating / 3200) * 100)));

  // 3. Solve Volume (20%)
  // Normalized against 1,000 solves
  const solveVolume = Math.min(100, Math.max(0, Math.round((totalSolved / 1000) * 100)));

  // 4. Recent Velocity (15%)
  const recentSubmissions = evidence.recent180dSubmissions ?? 0;
  const recentActiveDays = evidence.recent180dActiveDays ?? 0;
  const recentVelocity = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        Math.min(70, (recentSubmissions / 50) * 70) +
        Math.min(30, (recentActiveDays / 15) * 30)
      )
    )
  );

  // 5. Topic Breadth (10%)
  // Contest experience and breadth across formats
  const contestsCount = profile?.contestsParticipated ?? evidence.contestHistory?.length ?? 0;
  const topicBreadth = Math.min(100, Math.max(0, Math.round((contestsCount / 40) * 100)));

  const axes: RadarAxes = {
    algorithmicGrit,
    contestPeak,
    solveVolume,
    recentVelocity,
    topicBreadth,
  };

  const total = Math.round(
    algorithmicGrit * 0.3 +
    contestPeak * 0.25 +
    solveVolume * 0.2 +
    recentVelocity * 0.15 +
    topicBreadth * 0.1
  );

  return {
    handle: evidence.handle,
    total,
    axes,
    metrics: {
      rating,
      maxRating,
      solvedCount: totalSolved,
      recentAcceptedCount: recentSubmissions,
      distinctTagsCount: topicBreadth > 0 ? Math.round(topicBreadth / 5) : 0,
    },
  };
}

export function scoreCodechefBattle(
  p1: CodechefEvidence,
  p2: CodechefEvidence
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
      reasoning: "Insufficient evidence to evaluate battle.",
      scoringVersion: SCORING_VERSION,
      player1Score: dummyScore(p1.handle),
      player2Score: dummyScore(p2.handle),
      error: `Cannot compute battle result due to missing data: ${errorDetails.join(", ")}`,
    };
  }

  const player1Score = computeCodechefPlayerAxes(p1);
  const player2Score = computeCodechefPlayerAxes(p2);
  return buildVerdictFromScores(player1Score, player2Score, "CodeChef");
}
