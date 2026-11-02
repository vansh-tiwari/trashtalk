import { parse } from "node-html-parser";
import {
  CodechefEvidence,
  CodechefProfile,
  ContestRatingChange,
  EvidenceCoverage,
  FetchContext,
  SolvedProblem,
} from "./contracts";
import { PlatformStats } from "@/types";
import {
  codechefThrottler,
  CODECHEF_HEADERS,
  defaultEvidenceCache,
  fetchWithTimeout,
} from "./http";

export const CC_HANDLE_REGEX = /^[A-Za-z0-9_.]{3,30}$/;

export function parseRelaxedJson<T = any>(raw: string): T | null {
  try {
    return JSON.parse(raw);
  } catch {
    try {
      // Step 1: Remove trailing commas before } or ]
      let sanitized = raw.replace(/,\s*([}\]])/g, "$1");
      // Step 2: Quote unquoted object keys (e.g. { code: -> { "code":)
      sanitized = sanitized.replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":');
      // Step 3: Replace single-quoted string values with double quotes
      sanitized = sanitized.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, '"$1"');
      return JSON.parse(sanitized);
    } catch {
      return null;
    }
  }
}

export function deriveCodechefStarsAndDivision(
  rating?: number | null
): { stars: number | undefined; division: 1 | 2 | 3 | 4 | null } {
  if (typeof rating !== "number" || isNaN(rating) || rating <= 0) {
    return { stars: undefined, division: null };
  }
  if (rating >= 2500) return { stars: 7, division: 1 };
  if (rating >= 2200) return { stars: 6, division: 1 };
  if (rating >= 2000) return { stars: 5, division: 1 };
  if (rating >= 1800) return { stars: 4, division: 2 };
  if (rating >= 1600) return { stars: 3, division: 3 };
  if (rating >= 1400) return { stars: 2, division: 3 };
  return { stars: 1, division: 4 };
}

function parseCodechefDate(dateStr?: string): number {
  if (!dateStr) return Math.floor(Date.now() / 1000);
  // Format: "YYYY-MM-DD HH:mm:ss" in IST (+05:30)
  const normalized = dateStr.includes("T")
    ? dateStr
    : `${dateStr.replace(" ", "T")}+05:30`;
  const ms = Date.parse(normalized);
  if (!isNaN(ms)) {
    return Math.floor(ms / 1000);
  }
  return Math.floor(Date.now() / 1000);
}

export async function fetchCodechefEvidence(
  handle: string,
  context?: FetchContext
): Promise<CodechefEvidence> {
  const cleanHandle = handle.trim();
  const nowIso = new Date().toISOString();

  const emptyCoverage: EvidenceCoverage = {
    historyAvailability: "unavailable",
    isComplete: false,
    isCompleteSolveList: false,
    totalSubmissionsFetched: 0,
    totalAcceptedSolved: 0,
  };

  // Syntax validation
  if (
    !CC_HANDLE_REGEX.test(cleanHandle) ||
    cleanHandle.includes("..") ||
    cleanHandle.includes("/") ||
    cleanHandle.includes("\\")
  ) {
    return {
      platform: "codechef",
      handle: cleanHandle,
      status: "not_found",
      fetchedAt: nowIso,
      coverage: emptyCoverage,
      error: "Invalid CodeChef username syntax.",
    };
  }

  // Cache lookup
  const cacheKey = `codechef:${cleanHandle.toLowerCase()}`;
  const cached = defaultEvidenceCache.get(cacheKey) as CodechefEvidence | null;
  if (cached) {
    return cached;
  }

  const url = `https://www.codechef.com/users/${encodeURIComponent(cleanHandle)}`;

  let res: Response;
  let html: string;

  try {
    res = await codechefThrottler.schedule(() =>
      fetchWithTimeout(
        url,
        {
          headers: CODECHEF_HEADERS,
        },
        context?.timeoutMs ?? 15000
      )
    );

    if (res.status === 404) {
      return {
        platform: "codechef",
        handle: cleanHandle,
        status: "not_found",
        fetchedAt: nowIso,
        coverage: emptyCoverage,
        error: `CodeChef user '${cleanHandle}' does not exist.`,
      };
    }

    if (res.status === 429) {
      return {
        platform: "codechef",
        handle: cleanHandle,
        status: "rate_limited",
        fetchedAt: nowIso,
        coverage: emptyCoverage,
        error: "CodeChef rate limit reached. Please wait a moment.",
      };
    }

    if (res.status === 403) {
      return {
        platform: "codechef",
        handle: cleanHandle,
        status: "unavailable",
        fetchedAt: nowIso,
        coverage: emptyCoverage,
        error: "CodeChef profile temporarily unavailable or blocked.",
      };
    }

    html = await res.text();
  } catch (err: any) {
    return {
      platform: "codechef",
      handle: cleanHandle,
      status: "unavailable",
      fetchedAt: nowIso,
      coverage: emptyCoverage,
      error: err?.message || "Network error fetching CodeChef profile.",
    };
  }

  // Check for soft 404 or Cloudflare challenge in body
  if (
    html.includes("Could not find page") ||
    html.includes("User not found") ||
    html.includes("User does not exist")
  ) {
    return {
      platform: "codechef",
      handle: cleanHandle,
      status: "not_found",
      fetchedAt: nowIso,
      coverage: emptyCoverage,
      error: `CodeChef user '${cleanHandle}' does not exist.`,
    };
  }

  if (
    html.includes("Cloudflare") &&
    (html.includes("Attention Required!") || html.includes("Just a moment..."))
  ) {
    return {
      platform: "codechef",
      handle: cleanHandle,
      status: "unavailable",
      fetchedAt: nowIso,
      coverage: emptyCoverage,
      error: "CodeChef security challenge encountered.",
    };
  }

  // 1. Embedded JS array extraction
  let contestHistory: ContestRatingChange[] = [];
  let peakContestRating = 0;
  const contestDateMap = new Map<string, number>();

  const allRatingMatch = html.match(/var\s+all_rating\s*=\s*(\[[\s\S]*?\]);/);
  if (allRatingMatch) {
    try {
      const rawAllRating = parseRelaxedJson<Array<{
        code?: string;
        getname?: string;
        rating?: string | number;
        change?: string | number;
        rank?: string | number;
        end_date?: string;
      }>>(allRatingMatch[1]);

      if (Array.isArray(rawAllRating)) {
        for (let i = 0; i < rawAllRating.length; i++) {
          const item = rawAllRating[i];
          const newRating = parseInt(String(item.rating || 0), 10) || 0;
          const delta = parseInt(String(item.change || 0), 10) || 0;
          const oldRating = newRating - delta;
          const rank = parseInt(String(item.rank || 0), 10) || 0;
          const contestCode = item.code || `CONTEST_${i}`;
          const contestName = item.getname || contestCode;
          const ratingUpdateTimeSeconds = parseCodechefDate(item.end_date);

          if (item.code) {
            contestDateMap.set(item.code, ratingUpdateTimeSeconds);
          }

          if (newRating > peakContestRating) {
            peakContestRating = newRating;
          }

          contestHistory.push({
            contestId: i + 1,
            contestName,
            rank,
            oldRating,
            newRating,
            ratingUpdateTimeSeconds,
          });
        }
      }
    } catch {
      // Quiet fallback if JSON parsing fails
    }
  }

  // 2. DOM Parsing via node-html-parser
  const root = parse(html);

  // Avatar URL
  const imgElem = root.querySelector(".profile-image img, header img, img[src*='user-images']");
  let avatarUrl = imgElem?.getAttribute("src");
  if (avatarUrl && avatarUrl.startsWith("/")) {
    avatarUrl = `https://www.codechef.com${avatarUrl}`;
  }

  // Display Name & Handle
  const nameElem = root.querySelector(".user-details h1, .user-name");
  let rawName = nameElem?.text?.trim() || cleanHandle;
  // Strip star prefix (e.g. "5★akulsareen" -> "akulsareen")
  rawName = rawName.replace(/^\d+★\s*/, "").trim();
  const displayName = rawName || cleanHandle;

  // Country
  const countryNameElem = root.querySelector(".user-country-name");
  const countryName = countryNameElem?.text?.trim() || undefined;

  const flagImg = root.querySelector(".user-country-flag img");
  let countryCode: string | undefined = undefined;
  const flagSrc = flagImg?.getAttribute("src") || "";
  const flagMatch = flagSrc.match(/\/([a-z]{2})\.png/i);
  if (flagMatch) {
    countryCode = flagMatch[1].toUpperCase();
  }

  // User type & Organisation
  const userTypeElem = root.querySelector(".user-type");
  let userType: "Student" | "Professional" | undefined = undefined;
  if (userTypeElem?.text?.includes("Professional")) {
    userType = "Professional";
  } else if (userTypeElem?.text?.includes("Student")) {
    userType = "Student";
  }

  const orgElem = root.querySelector(".organization");
  const organisation = orgElem?.text?.trim() || undefined;

  // Rating and Highest Rating
  const ratingNumberElem = root.querySelector(".rating-number");
  const rawRatingText = ratingNumberElem?.text?.trim() || "";
  const numericRating = /^\d+$/.test(rawRatingText) ? parseInt(rawRatingText, 10) : undefined;

  const highestRatingMatch = html.match(/Highest Rating\s*(\d+)/i);
  const textHighestRating = highestRatingMatch ? parseInt(highestRatingMatch[1], 10) : undefined;
  const highestRating = Math.max(textHighestRating ?? 0, peakContestRating, numericRating ?? 0) || undefined;

  const { stars, division } = deriveCodechefStarsAndDivision(numericRating);
  const starString = stars ? `${stars}★` : undefined;

  // Ranks
  const globalRankMatch = html.match(/href="\/ratings\/all"[^>]*><strong>(\d+)<\/strong>/i);
  const globalRank = globalRankMatch ? parseInt(globalRankMatch[1], 10) : null;

  const countryRankMatch = html.match(/href="\/ratings\/all\?filterBy=Country[^"]*"[^>]*><strong>(\d+)<\/strong>/i);
  const countryRank = countryRankMatch ? parseInt(countryRankMatch[1], 10) : null;

  // DSA Rating / Inactive status
  let dsaGlobalRank: number | "Inactive" | null = null;
  let dsaCountryRank: number | "Inactive" | null = null;
  if (html.includes("dsa-ranks") || html.includes("dsa-status")) {
    if (html.includes("Inactive")) {
      dsaGlobalRank = "Inactive";
      dsaCountryRank = "Inactive";
    }
  }

  // Contests Participated
  const contestsCountMatch = html.match(/No\.\s*of\s*Contests\s*Participated:\s*(\d+)/i);
  const contestsParticipated = contestsCountMatch
    ? parseInt(contestsCountMatch[1], 10)
    : contestHistory.length;

  // Total Solved Count
  const solvedMatch = html.match(/Total\s+Problems\s+Solved:\s*(\d+)/i);
  const totalSolved = solvedMatch ? parseInt(solvedMatch[1], 10) : 0;

  // 3. Extract Solved Problems
  const solvedProblemsMap = new Map<string, SolvedProblem>();
  const fullySolvedSection = root.querySelector(".problems-content .content:not(.partially-solved)");

  if (fullySolvedSection) {
    const contestParagraphs = fullySolvedSection.querySelectorAll("p");
    for (const p of contestParagraphs) {
      const strongElem = p.querySelector("strong");
      const contestCodeMatch = strongElem?.text?.match(/([A-Za-z0-9_]+):/);
      const contestCode = contestCodeMatch ? contestCodeMatch[1] : undefined;
      const contestTimestamp = contestCode
        ? contestDateMap.get(contestCode) ?? 0
        : 0;

      const links = p.querySelectorAll("a[href*='/problems/']");
      for (const link of links) {
        const href = link.getAttribute("href") || "";
        const probCodeMatch = href.match(/\/problems\/([A-Za-z0-9_]+)/);
        if (probCodeMatch) {
          const probCode = probCodeMatch[1];
          const probName = link.text?.trim() || probCode;

          if (!solvedProblemsMap.has(probCode)) {
            solvedProblemsMap.set(probCode, {
              id: `CC:${probCode}`,
              platform: "codechef",
              index: probCode,
              name: probName,
              tags: [],
              acceptedAt: contestTimestamp,
              url: `https://www.codechef.com/problems/${probCode}`,
            });
          }
        }
      }
    }
  }

  const solvedProblems = Array.from(solvedProblemsMap.values());
  const listedSolvedCount = solvedProblems.length;

  // 4. Calculate 180-Day Velocity
  const nowSec = Math.floor(Date.now() / 1000);
  const cutoff180d = nowSec - 180 * 86400;

  let recent180dSubmissions = 0;
  let recent180dActiveDays = 0;

  for (const prob of solvedProblems) {
    if (prob.acceptedAt >= cutoff180d) {
      recent180dSubmissions++;
    }
  }

  for (const contest of contestHistory) {
    if (contest.ratingUpdateTimeSeconds >= cutoff180d) {
      recent180dActiveDays++;
    }
  }

  const profile: CodechefProfile = {
    handle: cleanHandle,
    displayName,
    avatarUrl,
    countryName,
    countryCode,
    userType,
    organisation,
    rating: numericRating,
    highestRating,
    stars,
    starString,
    division,
    globalRank,
    countryRank,
    contestsParticipated,
    totalSolved,
    listedSolvedCount,
    dsaGlobalRank,
    dsaCountryRank,
  };

  const coverage: EvidenceCoverage = {
    historyAvailability: contestHistory.length > 0 ? "complete" : "unavailable",
    isComplete: listedSolvedCount >= totalSolved,
    isCompleteSolveList: listedSolvedCount >= totalSolved,
    totalSubmissionsFetched: listedSolvedCount,
    totalAcceptedSolved: totalSolved,
    note:
      listedSolvedCount < totalSolved
        ? "CodeChef public profiles only list contest solves; practice-only solves are omitted."
        : undefined,
  };

  const evidence: CodechefEvidence = {
    platform: "codechef",
    handle: cleanHandle,
    status: "ok",
    fetchedAt: nowIso,
    profile,
    contestHistory,
    solvedProblems,
    recent180dSubmissions,
    recent180dActiveDays,
    coverage,
  };

  defaultEvidenceCache.set(cacheKey, evidence, 30 * 60 * 1000); // 30 min cache
  return evidence;
}

// Backward-compatible wrapper for legacy callers
export async function fetchCodeChefProfile(handle: string): Promise<PlatformStats | null> {
  const evidence = await fetchCodechefEvidence(handle);
  if (evidence.status !== "ok" || !evidence.profile) {
    return null;
  }
  const prof = evidence.profile;
  return {
    platform: "codechef",
    handle: prof.handle,
    avatarUrl: prof.avatarUrl,
    profileUrl: `https://www.codechef.com/users/${prof.handle}`,
    rating: prof.rating,
    maxRating: prof.highestRating,
    rankTitle: prof.starString || "1★",
    problemsSolved: {
      total: prof.totalSolved,
    },
    metrics: {
      Rating: prof.rating || "Unrated",
      "Highest Rating": prof.highestRating || "Unrated",
      Stars: prof.starString || "Unrated",
      "Global Rank": prof.globalRank ? `#${prof.globalRank}` : "N/A",
      "Country Rank": prof.countryRank ? `#${prof.countryRank}` : "N/A",
      "Problems Solved": prof.totalSolved,
    },
  };
}
