import { z } from "zod";
import { BattleSnapshot } from "../storage/contracts";

/**
 * Safe Battle ID Grammar:
 * - Length: 3 to 160 characters
 * - Only ASCII alphanumeric characters, hyphens, and underscores: [a-zA-Z0-9_-]
 * - Strictly rejects all slashes, backslashes, dots, whitespace, and percent-encoded separators.
 */
export const BATTLE_ID_REGEX = /^[a-zA-Z0-9_-]{3,160}$/;

export const BattleIdSchema = z
  .string()
  .min(3, "Battle ID must be at least 3 characters.")
  .max(160, "Battle ID must not exceed 160 characters.")
  .regex(
    BATTLE_ID_REGEX,
    "Battle ID contains invalid characters. Only alphanumeric, hyphens, and underscores are allowed."
  );

export function parseBattleId(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error("Invalid battle ID: ID must be a string.");
  }

  // Reject URL-encoded separators or dots before/after decoding
  if (/%[0-9a-fA-F]{2}/.test(value)) {
    try {
      const decoded = decodeURIComponent(value);
      if (decoded !== value && !BATTLE_ID_REGEX.test(decoded)) {
        throw new Error("Invalid battle ID: Contains encoded path traversal or invalid characters.");
      }
    } catch {
      throw new Error("Invalid battle ID: Malformed URL encoding.");
    }
  }

  const result = BattleIdSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid battle ID: ${result.error.errors[0]?.message || "malformed ID"}`);
  }

  return result.data;
}

/**
 * Codeforces Handle Syntax Rules:
 * - Length: 2 to 24 characters
 * - Characters: Latin letters, digits, underscores, hyphens, dots
 * - Cannot start with a dot or contain double dots '..'
 * - Strictly no path characters, slashes, or whitespace
 */
export const CF_HANDLE_REGEX = /^[a-zA-Z0-9_-][a-zA-Z0-9_.-]{1,29}$/;

export const HandleSchema = z
  .string({
    required_error: "Developer handle is required.",
    invalid_type_error: "Developer handle must be a string.",
  })
  .trim()
  .min(2, "Developer handle must be at least 2 characters.")
  .max(30, "Developer handle cannot exceed 30 characters.")
  .refine(
    (val) => !val.includes("..") && !val.includes("/") && !val.includes("\\"),
    "Handle cannot contain path traversal characters."
  )
  .refine(
    (val) => CF_HANDLE_REGEX.test(val),
    "Handle contains invalid characters. Must consist of Latin letters, digits, '.', '_', or '-'."
  );

export const PersonaEnum = z.enum(
  ["savage_dev", "silicon_valley_vc", "ufc_announcer", "hype_man"],
  {
    errorMap: () => ({
      message:
        "Invalid persona. Must be one of: savage_dev, silicon_valley_vc, ufc_announcer, hype_man.",
    }),
  }
);

export const CreateBattleRequestSchema = z.object({
  u1: HandleSchema,
  u2: HandleSchema,
  persona: PersonaEnum.default("savage_dev"),
  platform: z
    .enum(["codeforces", "leetcode", "codechef", "github"], {
      errorMap: () => ({
        message: "Unsupported platform. Must be 'codeforces', 'leetcode', 'codechef', or 'github'.",
      }),
    })
    .default("codeforces"),
});

export type CreateBattleRequest = z.infer<typeof CreateBattleRequestSchema>;

/**
 * Runtime BattleSnapshot validation schema to guard against foreign/corrupt JSON.
 */
export const RadarAxesSchema = z.object({
  algorithmicGrit: z.number(),
  solveVolume: z.number(),
  contestPeak: z.number(),
  recentVelocity: z.number(),
  topicBreadth: z.number(),
});

export const PlayerScoreMetricsSchema = z.object({
  rating: z.number(),
  maxRating: z.number(),
  solvedCount: z.number(),
  recentAcceptedCount: z.number(),
  distinctTagsCount: z.number(),
});

export const PlayerScoreSchema = z.object({
  handle: z.string(),
  total: z.number(),
  axes: RadarAxesSchema,
  metrics: PlayerScoreMetricsSchema,
});

export const BattleSnapshotPlayerSchema = z.object({
  handle: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  rank: z.string().optional(),
  maxRank: z.string().optional(),
  score: PlayerScoreSchema,
  activityLevels: z.array(z.number()).optional(),
});

export const SolvedProblemSchema = z.object({
  id: z.string(),
  name: z.string(),
  platform: z.enum(["codeforces", "github", "leetcode", "codechef"]).optional(),
  contestId: z.number().optional(),
  index: z.string().optional(),
  rating: z.number().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).optional(),
  tags: z.array(z.string()).default([]),
  acceptedAt: z.number().optional(),
  url: z.string().optional(),
});

export const OverlapResultSchema = z.object({
  common: z.array(SolvedProblemSchema),
  player1Exclusive: z.array(SolvedProblemSchema),
  player2Exclusive: z.array(SolvedProblemSchema),
  dnaPercentage: z.number().nullable(),
  isDefinitive: z.boolean(),
  totalUnionCount: z.number(),
  commonCount: z.number(),
});

export const BattleVerdictSchema = z.object({
  outcome: z.enum(["win", "draw", "insufficient_data"]),
  winnerHandle: z.string().nullable(),
  loserHandle: z.string().nullable().optional(),
  isMirrorMatch: z.boolean(),
  margin: z.number(),
  reasoning: z.string(),
  scoringVersion: z.string(),
  player1Score: PlayerScoreSchema,
  player2Score: PlayerScoreSchema,
  error: z.string().optional(),
});

export const GithubRepositoryCardSchema = z.object({
  name: z.string(),
  fullName: z.string().optional(),
  description: z.string().optional(),
  stars: z.number(),
  forks: z.number(),
  language: z.string().optional(),
  url: z.string(),
});

export const GithubDeveloperMetadataSchema = z.object({
  bio: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  followers: z.number(),
  following: z.number(),
  publicRepos: z.number(),
  totalStars: z.number(),
  totalForks: z.number(),
  createdAt: z.string(),
  languages: z.array(z.object({ name: z.string(), repoCount: z.number() })),
  topRepos: z.array(GithubRepositoryCardSchema),
});

export const GithubBattleMetadataSchema = z.object({
  player1: GithubDeveloperMetadataSchema,
  player2: GithubDeveloperMetadataSchema,
});

export const BattleSnapshotSchema = z.object({
  id: BattleIdSchema,
  createdAt: z.string(),
  platform: z.enum(["codeforces", "leetcode", "codechef", "github"]),
  persona: PersonaEnum,
  player1: BattleSnapshotPlayerSchema,
  player2: BattleSnapshotPlayerSchema,
  verdict: BattleVerdictSchema,
  overlap: OverlapResultSchema,
  coverageNote: z.string().optional(),
  isSample: z.boolean().optional(),
  githubMetadata: GithubBattleMetadataSchema.optional(),
  commentary: z.object({
    source: z.enum(["ai", "local"]),
    persona: PersonaEnum,
    headToHeadRoast: z.string(),
    player1Roast: z.string(),
    player2Roast: z.string(),
    punchline: z.string(),
    winnerHandle: z.string().nullable(),
    promptVersion: z.string(),
  }),
});

export function safeParseBattleSnapshot(data: unknown): BattleSnapshot | null {
  const result = BattleSnapshotSchema.safeParse(data);
  if (!result.success) {
    return null;
  }
  return result.data as BattleSnapshot;
}
