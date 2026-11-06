import { BattleVerdict, OverlapResult, PlayerScore } from "../battle/types";
import { CommentaryResult, RoastPersona } from "../ai/schemas";
import { Platform } from "../platforms/contracts";

export interface BattleSnapshotPlayer {
  handle: string;
  displayName: string;
  avatarUrl?: string;
  rank?: string;
  maxRank?: string;
  score: PlayerScore;
  activityLevels?: number[];
}

export interface GithubRepositoryCard {
  name: string;
  fullName?: string;
  description?: string;
  stars: number;
  forks: number;
  language?: string;
  url: string;
}

export interface GithubDeveloperMetadata {
  bio?: string;
  company?: string;
  location?: string;
  followers: number;
  following: number;
  publicRepos: number;
  totalStars: number;
  totalForks: number;
  createdAt: string;
  languages: { name: string; repoCount: number }[];
  topRepos: GithubRepositoryCard[];
}

export interface GithubBattleMetadata {
  player1: GithubDeveloperMetadata;
  player2: GithubDeveloperMetadata;
}

export interface BattleSnapshot {
  id: string; // Canonical battle ID
  createdAt: string;
  platform: Platform;
  persona: RoastPersona;
  player1: BattleSnapshotPlayer;
  player2: BattleSnapshotPlayer;
  verdict: BattleVerdict;
  overlap: OverlapResult;
  commentary: CommentaryResult;
  englishCommentary?: CommentaryResult;
  regionInfo?: {
    countryCode: string;
    languageCode: string;
    languageName: string;
    toggleLabel: string;
    isEnglishDefault?: boolean;
  };
  isSample?: boolean;
  coverageNote?: string;
  githubMetadata?: GithubBattleMetadata;
}

export interface BattleStore {
  get(id: string): Promise<BattleSnapshot | null>;
  create(snapshot: BattleSnapshot): Promise<void>;
  save?(snapshot: BattleSnapshot): Promise<void>; // Alias to create
  has(id: string): Promise<boolean>;
  listRecent?(limit?: number): Promise<BattleSnapshot[]>;
}

export type IdempotencyStatus = "pending" | "completed" | "failed";

export interface IdempotencyRecord {
  key: string;
  requestDigest: string;
  status: IdempotencyStatus;
  snapshotId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReservationOutcome = "reserved" | "in_flight" | "completed" | "mismatch";

export interface IdempotencyStore {
  reserve(key: string, requestDigest: string): Promise<ReservationOutcome>;
  complete(key: string, snapshotId: string): Promise<void>;
  fail(key: string, error: string): Promise<void>;
  get(key: string): Promise<IdempotencyRecord | null>;
}
