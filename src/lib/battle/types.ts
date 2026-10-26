import { SolvedProblem } from "../platforms/contracts";

export interface RadarAxes {
  algorithmicGrit: number; // 0 - 100 (Max rating & 90th percentile depth)
  solveVolume: number;     // 0 - 100 (Total accepted unique problems)
  contestPeak: number;     // 0 - 100 (Contest performance / peak)
  recentVelocity: number;  // 0 - 100 (Submissions accepted in last 180 days)
  topicBreadth: number;    // 0 - 100 (Distinct problem tags mastered)
}

export interface PlayerScore {
  handle: string;
  total: number; // 0 - 100
  axes: RadarAxes;
  metrics: {
    rating: number;
    maxRating: number;
    solvedCount: number;
    recentAcceptedCount: number;
    distinctTagsCount: number;
  };
}

export type BattleOutcome = "win" | "draw" | "insufficient_data";

export interface BattleVerdict {
  outcome: BattleOutcome;
  winnerHandle: string | null;
  loserHandle: string | null;
  isMirrorMatch: boolean;
  margin: number;
  reasoning: string;
  scoringVersion: string;
  player1Score: PlayerScore;
  player2Score: PlayerScore;
  error?: string;
}

export interface OverlapResult {
  common: SolvedProblem[];
  player1Exclusive: SolvedProblem[];
  player2Exclusive: SolvedProblem[];
  dnaPercentage: number | null; // Jaccard index: |A ∩ B| / |A ∪ B| * 100, null if unavailable
  isDefinitive: boolean;       // True only if both players' histories are complete
  totalUnionCount: number;
  commonCount: number;
}
