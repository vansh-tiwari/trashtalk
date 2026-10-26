import {
  CodeforcesEvidence,
  CodeforcesProfile,
  ContestRatingChange,
  FetchContext,
  SolvedProblem,
} from "./contracts";
import { PlatformStats } from "@/types";
import { codeforcesThrottler, fetchWithTimeout, defaultEvidenceCache } from "./http";

interface CFResponse<T> {
  status: "OK" | "FAILED";
  comment?: string;
  result?: T;
}

interface CFUserRaw {
  handle: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  organization?: string;
  contribution: number;
  rank?: string;
  rating?: number;
  maxRank?: string;
  maxRating?: number;
  lastOnlineTimeSeconds: number;
  registrationTimeSeconds: number;
  friendOfCount: number;
  avatar: string;
  titlePhoto: string;
}

interface CFSubmissionRaw {
  id: number;
  contestId?: number;
  creationTimeSeconds: number;
  relativeTimeSeconds?: number;
  problem: {
    contestId?: number;
    problemsetName?: string;
    index: string;
    name: string;
    type?: string;
    points?: number;
    rating?: number;
    tags: string[];
  };
  verdict?: string;
  passedTestCount?: number;
  timeConsumedMillis?: number;
  memoryConsumedBytes?: number;
}

interface CFRatingChangeRaw {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

export async function fetchCodeforcesEvidence(
  handle: string,
  context: FetchContext = {}
): Promise<CodeforcesEvidence> {
  const cleanHandle = handle.trim();
  const timeoutMs = context.timeoutMs ?? 8000;
  const maxSubmissions = context.maxSubmissions ?? 1000;
  const fetchedAt = new Date().toISOString();
  const cacheKey = `cf:${cleanHandle.toLowerCase()}`;
  const cached = defaultEvidenceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // 1. Fetch User Profile
  let profileRaw: CFUserRaw | null = null;
  try {
    const infoUrl = `https://codeforces.com/api/user.info?handles=${encodeURIComponent(cleanHandle)}`;
    const infoRes = await codeforcesThrottler.schedule(() =>
      fetchWithTimeout(infoUrl, {}, timeoutMs)
    );

    if (infoRes.status === 429) {
      return {
        platform: "codeforces",
        handle: cleanHandle,
        status: "rate_limited",
        fetchedAt,
        coverage: { historyAvailability: "unavailable", isComplete: false, totalSubmissionsFetched: 0, totalAcceptedSolved: 0 },
        error: "Codeforces API rate limit exceeded.",
      };
    }

    const infoData: CFResponse<CFUserRaw[]> = await infoRes.json().catch(() => ({ status: "FAILED" }));

    if (infoData.status !== "OK" || !infoData.result || infoData.result.length === 0) {
      const comment = infoData.comment || "";
      const commentLower = comment.toLowerCase();
      if (
        commentLower.includes("not found") ||
        commentLower.includes("no such handle") ||
        infoRes.status === 400 ||
        infoRes.status === 404
      ) {
        return {
          platform: "codeforces",
          handle: cleanHandle,
          status: "not_found",
          fetchedAt,
          coverage: { historyAvailability: "unavailable", isComplete: false, totalSubmissionsFetched: 0, totalAcceptedSolved: 0 },
          error: `User "${cleanHandle}" not found on Codeforces.`,
        };
      }
      if (
        commentLower.includes("call limit") ||
        commentLower.includes("limit exceeded") ||
        infoRes.status === 429
      ) {
        return {
          platform: "codeforces",
          handle: cleanHandle,
          status: "rate_limited",
          fetchedAt,
          coverage: { historyAvailability: "unavailable", isComplete: false, totalSubmissionsFetched: 0, totalAcceptedSolved: 0 },
          error: "Codeforces call limit exceeded.",
        };
      }
      return {
        platform: "codeforces",
        handle: cleanHandle,
        status: "unavailable",
        fetchedAt,
        coverage: { historyAvailability: "unavailable", isComplete: false, totalSubmissionsFetched: 0, totalAcceptedSolved: 0 },
        error: comment || `Codeforces API returned HTTP ${infoRes.status}`,
      };
    }

    profileRaw = infoData.result[0];
  } catch (err: unknown) {
    return {
      platform: "codeforces",
      handle: cleanHandle,
      status: "unavailable",
      fetchedAt,
      coverage: { historyAvailability: "unavailable", isComplete: false, totalSubmissionsFetched: 0, totalAcceptedSolved: 0 },
      error: err instanceof Error ? err.message : "Network error fetching Codeforces profile.",
    };
  }

  // 2. Normalize Profile
  const profile: CodeforcesProfile = {
    handle: profileRaw.handle,
    displayName:
      profileRaw.firstName && profileRaw.lastName
        ? `${profileRaw.firstName} ${profileRaw.lastName}`
        : profileRaw.firstName || profileRaw.handle,
    rank: profileRaw.rank,
    maxRank: profileRaw.maxRank,
    rating: profileRaw.rating,
    maxRating: profileRaw.maxRating,
    avatarUrl: profileRaw.titlePhoto || profileRaw.avatar,
    country: profileRaw.country,
    organization: profileRaw.organization,
    contribution: profileRaw.contribution ?? 0,
    friendCount: profileRaw.friendOfCount ?? 0,
  };

  // 3. Fetch Submissions (History)
  const solvedMap = new Map<string, SolvedProblem>();
  let totalSubmissionsFetched = 0;
  let isComplete = false;
  let historyAvailability: import("./contracts").HistoryAvailability = "unavailable";
  let oldestObservedTimestamp: number | undefined = undefined;

  try {
    const statusUrl = `https://codeforces.com/api/user.status?handle=${encodeURIComponent(
      cleanHandle
    )}&from=1&count=${maxSubmissions}`;
    const statusRes = await codeforcesThrottler.schedule(() =>
      fetchWithTimeout(statusUrl, {}, timeoutMs)
    );

    if (statusRes.ok) {
      const statusData: CFResponse<CFSubmissionRaw[]> = await statusRes
        .json()
        .catch(() => ({ status: "FAILED" }));

      if (statusData.status === "OK" && Array.isArray(statusData.result)) {
        totalSubmissionsFetched = statusData.result.length;
        if (totalSubmissionsFetched >= maxSubmissions) {
          historyAvailability = "partial";
          isComplete = false;
        } else {
          historyAvailability = "complete";
          isComplete = true;
        }

        if (statusData.result.length > 0) {
          oldestObservedTimestamp = statusData.result[statusData.result.length - 1].creationTimeSeconds;
        }

        for (const sub of statusData.result) {
          if (sub.verdict === "OK" && sub.problem) {
            const contestId = sub.problem.contestId ?? sub.contestId;
            const index = sub.problem.index;
            const problemId = contestId
              ? `CF:${contestId}${index}`
              : `CF:${sub.problem.problemsetName || "gym"}:${index}`;

            const url = contestId
              ? `https://codeforces.com/contest/${contestId}/problem/${index}`
              : `https://codeforces.com/problemsets/acmsguru/problem/99999/${index}`;

            const existing = solvedMap.get(problemId);
            if (!existing || sub.creationTimeSeconds < existing.acceptedAt) {
              solvedMap.set(problemId, {
                id: problemId,
                platform: "codeforces",
                contestId,
                index,
                name: sub.problem.name,
                rating: sub.problem.rating,
                tags: sub.problem.tags || [],
                acceptedAt: sub.creationTimeSeconds,
                url,
              });
            }
          }
        }
      } else {
        historyAvailability = "unavailable";
        isComplete = false;
      }
    } else {
      historyAvailability = "unavailable";
      isComplete = false;
    }
  } catch (err) {
    historyAvailability = "unavailable";
    isComplete = false;
  }

  // 4. Fetch Rating History
  let contestHistory: ContestRatingChange[] = [];
  try {
    const ratingUrl = `https://codeforces.com/api/user.rating?handle=${encodeURIComponent(cleanHandle)}`;
    const ratingRes = await codeforcesThrottler.schedule(() =>
      fetchWithTimeout(ratingUrl, {}, timeoutMs)
    );

    if (ratingRes.ok) {
      const ratingData: CFResponse<CFRatingChangeRaw[]> = await ratingRes.json().catch(() => ({ status: "FAILED" }));
      if (ratingData.status === "OK" && ratingData.result) {
        contestHistory = ratingData.result.map((r) => ({
          contestId: r.contestId,
          contestName: r.contestName,
          rank: r.rank,
          oldRating: r.oldRating,
          newRating: r.newRating,
          ratingUpdateTimeSeconds: r.ratingUpdateTimeSeconds,
        }));
      }
    }
  } catch {
    // Rating history optional fallback
  }

  const solvedProblems = Array.from(solvedMap.values());
  const status: import("./contracts").EvidenceStatus = historyAvailability === "unavailable" ? "partial" : "ok";

  const evidence: CodeforcesEvidence = {
    platform: "codeforces",
    handle: profile.handle,
    status,
    fetchedAt,
    profile,
    contestHistory,
    solvedProblems,
    coverage: {
      historyAvailability,
      isComplete,
      totalSubmissionsFetched,
      totalAcceptedSolved: solvedProblems.length,
      oldestObservedTimestamp,
    },
  };

  if (evidence.status === "ok") {
    defaultEvidenceCache.set(cacheKey, evidence);
  }

  return evidence;
}

// Retain legacy adapter export for components during transition
export async function fetchCodeforcesProfile(handle: string): Promise<PlatformStats | null> {
  const evidence = await fetchCodeforcesEvidence(handle);
  if (evidence.status !== "ok" || !evidence.profile) return null;

  return {
    platform: "codeforces",
    handle: evidence.profile.handle,
    avatarUrl: evidence.profile.avatarUrl,
    profileUrl: `https://codeforces.com/profile/${evidence.profile.handle}`,
    rating: evidence.profile.rating || 0,
    maxRating: evidence.profile.maxRating || 0,
    rankTitle: evidence.profile.rank || "unrated",
    problemsSolved: {
      total: evidence.solvedProblems?.length || 0,
    },
    metrics: {
      Rating: evidence.profile.rating || "Unrated",
      "Max Rating": evidence.profile.maxRating || "Unrated",
      Rank: evidence.profile.rank || "Unrated",
      "Max Rank": evidence.profile.maxRank || "Unrated",
      Contribution: evidence.profile.contribution,
      Friends: evidence.profile.friendCount,
      Organization: evidence.profile.organization || "None",
      Country: evidence.profile.country || "Global",
    },
  };
}
