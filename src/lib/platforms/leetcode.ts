import {
  FetchContext,
  LeetcodeEvidence,
  LeetcodeProfile,
  LeetcodeTagStat,
  SolvedProblem,
} from "./contracts";
import { PlatformStats } from "@/types";
import {
  defaultEvidenceCache,
  fetchWithTimeout,
  LEETCODE_GRAPHQL_HEADERS,
  leetcodeThrottler,
} from "./http";

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql";

const USER_EVIDENCE_QUERY = `
query getLeetCodeUserEvidence($username: String!, $recentLimit: Int!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
      reputation
    }
    submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
      }
    }
    tagProblemCounts {
      advanced { tagName tagSlug problemsSolved }
      intermediate { tagName tagSlug problemsSolved }
      fundamental { tagName tagSlug problemsSolved }
    }
    userCalendar {
      submissionCalendar
    }
  }
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    topPercentage
    badge {
      name
    }
  }
  userContestRankingHistory(username: $username) {
    attended
    rating
    ranking
    contest {
      title
      startTime
    }
  }
  recentAcSubmissionList(username: $username, limit: $recentLimit) {
    id
    title
    titleSlug
    timestamp
  }
}
`;

interface RawGraphQLResponse {
  data?: {
    matchedUser?: {
      username: string;
      profile?: {
        realName?: string;
        userAvatar?: string;
        ranking?: number;
        reputation?: number;
      };
      submitStatsGlobal?: {
        acSubmissionNum?: Array<{
          difficulty: string;
          count: number;
        }>;
      };
      tagProblemCounts?: {
        advanced?: Array<{ tagName: string; tagSlug: string; problemsSolved: number }>;
        intermediate?: Array<{ tagName: string; tagSlug: string; problemsSolved: number }>;
        fundamental?: Array<{ tagName: string; tagSlug: string; problemsSolved: number }>;
      };
      userCalendar?: {
        submissionCalendar?: string;
      };
    } | null;
    userContestRanking?: {
      attendedContestsCount?: number;
      rating?: number;
      globalRanking?: number;
      topPercentage?: number;
      badge?: {
        name?: string;
      };
    } | null;
    userContestRankingHistory?: Array<{
      attended?: boolean;
      rating?: number;
      ranking?: number;
      contest?: {
        title?: string;
        startTime?: number;
      };
    }> | null;
    recentAcSubmissionList?: Array<{
      id: string;
      title: string;
      titleSlug: string;
      timestamp: string;
    }> | null;
  };
  errors?: Array<{ message: string }>;
}

export async function fetchLeetcodeEvidence(
  handle: string,
  context: FetchContext = {}
): Promise<LeetcodeEvidence> {
  const cleanHandle = handle.trim();
  const timeoutMs = context.timeoutMs ?? 10000;
  const fetchedAt = new Date().toISOString();
  const cacheKey = `lc:${cleanHandle.toLowerCase()}`;

  const cached = defaultEvidenceCache.get(cacheKey) as LeetcodeEvidence | null;
  if (cached) {
    return cached;
  }

  const dummyCoverage = {
    historyAvailability: "unavailable" as const,
    isComplete: false,
    isCompleteSolveList: false,
    solveListLimit: 20,
    totalSubmissionsFetched: 0,
    totalAcceptedSolved: 0,
  };

  try {
    const res = await leetcodeThrottler.schedule(() =>
      fetchWithTimeout(
        LEETCODE_GRAPHQL_URL,
        {
          method: "POST",
          headers: LEETCODE_GRAPHQL_HEADERS,
          body: JSON.stringify({
            query: USER_EVIDENCE_QUERY,
            variables: {
              username: cleanHandle,
              recentLimit: 20,
            },
          }),
        },
        timeoutMs
      )
    );

    if (res.status === 429) {
      return {
        platform: "leetcode",
        handle: cleanHandle,
        status: "rate_limited",
        fetchedAt,
        coverage: dummyCoverage,
        error: "LeetCode API rate limit exceeded.",
      };
    }

    if (!res.ok) {
      return {
        platform: "leetcode",
        handle: cleanHandle,
        status: "unavailable",
        fetchedAt,
        coverage: dummyCoverage,
        error: `LeetCode API returned HTTP ${res.status}.`,
      };
    }

    const json: RawGraphQLResponse = await res.json();
    const matched = json.data?.matchedUser;

    if (!matched) {
      return {
        platform: "leetcode",
        handle: cleanHandle,
        status: "not_found",
        fetchedAt,
        coverage: dummyCoverage,
        error: `User "${cleanHandle}" not found on LeetCode.`,
      };
    }

    // 1. Difficulty breakdown
    const submissions = matched.submitStatsGlobal?.acSubmissionNum || [];
    let total = 0;
    let easy = 0;
    let medium = 0;
    let hard = 0;

    for (const sub of submissions) {
      if (sub.difficulty === "All") total = sub.count;
      if (sub.difficulty === "Easy") easy = sub.count;
      if (sub.difficulty === "Medium") medium = sub.count;
      if (sub.difficulty === "Hard") hard = sub.count;
    }

    // 2. Contest ranking & peak extraction (strictly attended: true)
    const contest = json.data?.userContestRanking;
    const history = json.data?.userContestRankingHistory || [];
    const contestsAttended = contest?.attendedContestsCount ?? 0;

    let rating: number | undefined = undefined;
    let maxRating: number | undefined = undefined;
    let rank = "Unrated";

    if (contestsAttended > 0) {
      let attendedPeak = 0;
      for (const entry of history) {
        if (entry.attended && typeof entry.rating === "number" && entry.rating > attendedPeak) {
          attendedPeak = Math.round(entry.rating);
        }
      }

      const currentRating = contest?.rating ? Math.round(contest.rating) : undefined;
      rating = currentRating;
      maxRating = Math.max(attendedPeak, currentRating ?? 0) || undefined;

      if (contest?.badge?.name) {
        rank = contest.badge.name;
      } else if (typeof rating === "number" && rating >= 1600) {
        rank = "Contender";
      } else {
        rank = "Competitor";
      }
    }

    const profile: LeetcodeProfile = {
      handle: matched.username,
      displayName: matched.profile?.realName || matched.username,
      realName: matched.profile?.realName,
      avatarUrl: matched.profile?.userAvatar,
      ranking: matched.profile?.ranking,
      contestRanking: contest?.globalRanking,
      reputation: matched.profile?.reputation,
      rating,
      maxRating,
      contestsAttended,
      rank,
      totalSolved: total,
      easySolved: easy,
      mediumSolved: medium,
      hardSolved: hard,
    };

    // 3. 180-Day Velocity from submissionCalendar
    const nowSec = Math.floor(Date.now() / 1000);
    const cutoffSec = nowSec - 180 * 86400;
    let recent180dSubmissions = 0;
    let recent180dActiveDays = 0;

    const calendarRaw = matched.userCalendar?.submissionCalendar;
    if (calendarRaw) {
      try {
        const parsed = JSON.parse(calendarRaw) as Record<string, number>;
        for (const [timestampStr, count] of Object.entries(parsed)) {
          const ts = parseInt(timestampStr, 10);
          if (!isNaN(ts) && ts >= cutoffSec) {
            recent180dActiveDays++;
            recent180dSubmissions += Number(count) || 0;
          }
        }
      } catch {
        // Quiet fallback if invalid JSON
      }
    }

    // 4. Flatten tagStats
    const tagStats: LeetcodeTagStat[] = [];
    const rawTags = matched.tagProblemCounts;
    if (rawTags) {
      const allRaw = [
        ...(rawTags.fundamental || []),
        ...(rawTags.intermediate || []),
        ...(rawTags.advanced || []),
      ];
      for (const t of allRaw) {
        tagStats.push({
          tagName: t.tagName,
          tagSlug: t.tagSlug,
          problemsSolved: t.problemsSolved,
        });
      }
    }

    // 5. Recent AC deduplication by titleSlug (latest timestamp kept)
    const recentList = json.data?.recentAcSubmissionList || [];
    const dedupedMap = new Map<string, { id: string; title: string; titleSlug: string; timestamp: number }>();

    for (const item of recentList) {
      const ts = parseInt(item.timestamp, 10) || 0;
      const existing = dedupedMap.get(item.titleSlug);
      if (!existing || ts > existing.timestamp) {
        dedupedMap.set(item.titleSlug, {
          id: item.id,
          title: item.title,
          titleSlug: item.titleSlug,
          timestamp: ts,
        });
      }
    }

    const solvedProblems: SolvedProblem[] = Array.from(dedupedMap.values()).map((p) => ({
      id: `LC:${p.titleSlug}`,
      platform: "leetcode",
      index: p.titleSlug,
      name: p.title,
      acceptedAt: p.timestamp,
      url: `https://leetcode.com/problems/${p.titleSlug}/`,
      tags: [],
    }));

    const evidence: LeetcodeEvidence = {
      platform: "leetcode",
      handle: matched.username,
      status: "ok",
      fetchedAt,
      profile,
      solvedProblems,
      tagStats,
      submissionCalendar: calendarRaw,
      recent180dSubmissions,
      recent180dActiveDays,
      coverage: {
        historyAvailability: "complete",
        isComplete: true,
        isCompleteSolveList: false,
        solveListLimit: 20,
        totalSubmissionsFetched: solvedProblems.length,
        totalAcceptedSolved: total,
        note: "Problem overlap computed from last 20 public AC submissions; lifetime totals power the 5-axis score.",
      },
    };

    defaultEvidenceCache.set(cacheKey, evidence);
    return evidence;
  } catch (err: unknown) {
    return {
      platform: "leetcode",
      handle: cleanHandle,
      status: "unavailable",
      fetchedAt,
      coverage: dummyCoverage,
      error: err instanceof Error ? err.message : "Failed to fetch LeetCode evidence.",
    };
  }
}

/**
 * Backward compatibility helper for legacy profile consumers
 */
export async function fetchLeetCodeProfile(username: string): Promise<PlatformStats | null> {
  const evidence = await fetchLeetcodeEvidence(username);
  if (evidence.status !== "ok" || !evidence.profile) return null;

  const p = evidence.profile;
  return {
    platform: "leetcode",
    handle: p.handle,
    avatarUrl: p.avatarUrl,
    profileUrl: `https://leetcode.com/${p.handle}`,
    rating: p.rating,
    maxRating: p.maxRating,
    rankTitle: p.rank,
    problemsSolved: {
      total: p.totalSolved,
      easy: p.easySolved,
      medium: p.mediumSolved,
      hard: p.hardSolved,
    },
    metrics: {
      "Total Solved": p.totalSolved,
      Easy: p.easySolved,
      Medium: p.mediumSolved,
      Hard: p.hardSolved,
      Ranking: p.ranking ? `#${p.ranking}` : "N/A",
      "Contest Rating": p.rating || "Unrated",
      Reputation: p.reputation ?? 0,
    },
  };
}
