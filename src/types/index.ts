export type Platform = "github" | "leetcode" | "codeforces" | "codechef";

export interface PlatformStats {
  platform: Platform;
  handle: string;
  avatarUrl?: string;
  profileUrl: string;
  rating?: number;
  maxRating?: number;
  rankTitle?: string;
  problemsSolved?: {
    total: number;
    easy?: number;
    medium?: number;
    hard?: number;
  };
  metrics: Record<string, string | number>;
  raw?: Record<string, unknown>;
}

export interface DevProfile {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio?: string;
  country?: string;
  organization?: string;
  platforms: Partial<Record<Platform, PlatformStats>>;
  compositeScore: {
    algorithmicGrit: number; // 0 - 100
    gitConsistency: number;   // 0 - 100
    stackBreadth: number;     // 0 - 100
    contestPerformance: number; // 0 - 100
    velocity: number;         // 0 - 100
  };
}

export type RoastPersona = "savage_dev" | "silicon_valley_vc" | "ufc_announcer" | "hype_man";

export interface BattleComparisonResult {
  player1: DevProfile;
  player2: DevProfile;
  roast: {
    persona: RoastPersona;
    headToHeadRoast: string;
    player1Roast: string;
    player2Roast: string;
    winner: {
      username: string;
      title: string;
      punchline: string;
      reasoning: string;
    };
  };
  timestamp: string;
}
