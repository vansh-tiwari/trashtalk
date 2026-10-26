export type Platform = "codeforces" | "github" | "leetcode" | "codechef";

export type EvidenceStatus = "ok" | "not_found" | "rate_limited" | "unavailable" | "partial";

export interface SolvedProblem {
  id: string; // Platform-scoped ID, e.g. "CF:1A" or "LC:two-sum"
  platform: Platform;
  contestId?: number;
  index: string;
  name: string;
  rating?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  tags: string[];
  acceptedAt: number; // Unix timestamp in seconds
  url: string;
}

export interface ContestRatingChange {
  contestId: number;
  contestName: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingUpdateTimeSeconds: number;
}

export interface CodeforcesProfile {
  handle: string;
  displayName?: string;
  rank?: string;
  maxRank?: string;
  rating?: number;
  maxRating?: number;
  avatarUrl?: string;
  country?: string;
  organization?: string;
  contribution: number;
  friendCount: number;
}

export type HistoryAvailability = "complete" | "partial" | "unavailable";

export interface EvidenceCoverage {
  historyAvailability: HistoryAvailability;
  isComplete: boolean;
  isCompleteSolveList?: boolean; // true for CF (unless truncated), false for LC (recent 20 only)
  solveListLimit?: number;      // e.g. 20 for LC
  totalSubmissionsFetched: number;
  totalAcceptedSolved: number;
  oldestObservedTimestamp?: number;
  note?: string;
}

export type CodeforcesCoverage = EvidenceCoverage;

export interface CodeforcesEvidence {
  platform: "codeforces";
  handle: string;
  status: EvidenceStatus;
  fetchedAt: string;
  profile?: CodeforcesProfile;
  contestHistory?: ContestRatingChange[];
  solvedProblems?: SolvedProblem[];
  coverage: CodeforcesCoverage;
  error?: string;
}

export interface LeetcodeTagStat {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
}

export interface LeetcodeProfile {
  handle: string;
  displayName?: string;
  realName?: string;
  avatarUrl?: string;
  ranking?: number;        // Global solve ranking
  contestRanking?: number; // Global contest ranking
  reputation?: number;
  rating?: number;         // Current contest rating (undefined if unrated)
  maxRating?: number;      // Peak attended contest rating (undefined if unrated)
  contestsAttended: number;
  rank?: string;           // "Guardian" | "Knight" | "Contender" | "Competitor" | "Unrated"
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
}

export interface LeetcodeEvidence {
  platform: "leetcode";
  handle: string;
  status: EvidenceStatus;
  fetchedAt: string;
  profile?: LeetcodeProfile;
  contestHistory?: ContestRatingChange[];
  solvedProblems?: SolvedProblem[]; // Up to 20 unique recent AC problems
  tagStats?: LeetcodeTagStat[];     // Flattened from fundamental, intermediate, advanced
  submissionCalendar?: string;      // Raw JSON map from userProfileCalendar
  recent180dSubmissions?: number;   // Summed from submissionCalendar over last 180 days
  recent180dActiveDays?: number;    // Count of active days in last 180 days
  coverage: EvidenceCoverage;
  error?: string;
}

export interface CodechefProfile {
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  countryName?: string;
  countryCode?: string;
  userType?: "Student" | "Professional";
  organisation?: string;
  proPlan?: string;
  rating?: number;
  highestRating?: number;
  stars?: number;
  starString?: string; // e.g. "5★"
  division?: 1 | 2 | 3 | 4 | null;
  globalRank?: number | null;
  countryRank?: number | null;
  contestsParticipated: number;
  ratedContestsCount?: number;
  totalSolved: number;
  listedSolvedCount: number;
  dsaRating?: number | null;
  dsaHighestRating?: number | null;
  dsaGlobalRank?: number | "Inactive" | null;
  dsaCountryRank?: number | "Inactive" | null;
}

export interface CodechefEvidence {
  platform: "codechef";
  handle: string;
  status: EvidenceStatus;
  fetchedAt: string;
  profile?: CodechefProfile;
  contestHistory?: ContestRatingChange[];
  solvedProblems?: SolvedProblem[];
  submissionCalendar?: string;
  recent180dSubmissions?: number;
  recent180dActiveDays?: number;
  coverage: EvidenceCoverage;
  error?: string;
}

export interface GithubRepo {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  stars: number;
  forks: number;
  language?: string;
  isFork: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface GithubProfile {
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  company?: string;
  location?: string;
  blog?: string;
  publicRepos: number;
  publicGists: number;
  followers: number;
  following: number;
  createdAt: string;
  totalStars: number;
  totalForks: number;
  languages: { name: string; repoCount: number }[];
  topRepos: GithubRepo[];
}

export interface GithubEvidence {
  platform: "github";
  handle: string;
  status: EvidenceStatus;
  fetchedAt: string;
  profile?: GithubProfile;
  contestHistory?: ContestRatingChange[];
  solvedProblems?: SolvedProblem[]; // Non-fork repositories mapped as "trophies" with rating = stars
  recentContributions?: number;     // Recent public event count
  recentActiveDays?: number;
  submissionCalendar?: string;
  coverage: EvidenceCoverage;
  error?: string;
}

export type PlatformEvidence = CodeforcesEvidence | LeetcodeEvidence | CodechefEvidence | GithubEvidence;

export interface FetchContext {
  timeoutMs?: number;
  maxSubmissions?: number;
}
