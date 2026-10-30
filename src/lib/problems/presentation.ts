import type { SolvedProblem } from "@/lib/platforms/contracts";
import type { OverlapResult } from "@/lib/battle/types";

export type ProblemSet = "common" | "p1" | "p2";
export type RatingFilter = "all" | "master" | "hard" | "easy" | "unrated";
export type ProblemSort = "rating-desc" | "rating-asc" | "name-asc";

const SAFE_INDEX_REGEX = /^[A-Za-z0-9_-]+$/;

export function getProblemStatementUrl(problem: Partial<SolvedProblem>): string | null {
  if (problem.url && typeof problem.url === "string") {
    try {
      const parsed = new URL(problem.url);
      if (
        parsed.protocol === "https:" &&
        (parsed.hostname === "codeforces.com" ||
          parsed.hostname === "www.codeforces.com" ||
          parsed.hostname === "leetcode.com" ||
          parsed.hostname === "www.leetcode.com" ||
          parsed.hostname === "codechef.com" ||
          parsed.hostname === "www.codechef.com")
      ) {
        return problem.url;
      }
    } catch {
      // Invalid URL
    }
    return null;
  }

  // Handle LeetCode ID: LC:slug
  if (problem.id && typeof problem.id === "string" && problem.id.startsWith("LC:")) {
    const slug = problem.id.slice(3).trim();
    if (SAFE_INDEX_REGEX.test(slug)) {
      return `https://leetcode.com/problems/${slug}/`;
    }
  }

  // Handle CodeChef ID: CC:code
  if (problem.id && typeof problem.id === "string" && problem.id.startsWith("CC:")) {
    const code = problem.id.slice(3).trim();
    if (SAFE_INDEX_REGEX.test(code)) {
      return `https://www.codechef.com/problems/${code}`;
    }
  }

  if (
    typeof problem.contestId === "number" &&
    Number.isInteger(problem.contestId) &&
    problem.contestId > 0 &&
    typeof problem.index === "string" &&
    SAFE_INDEX_REGEX.test(problem.index)
  ) {
    return `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`;
  }

  return null;
}

export function getProblemTags(problem: Partial<SolvedProblem>): string[] {
  return Array.isArray(problem.tags) ? problem.tags : [];
}

export function isProblemSetAvailable(overlap: OverlapResult, set: ProblemSet): boolean {
  if (set === "common") {
    return Boolean(overlap?.common);
  }
  if (overlap?.isDefinitive) {
    return true;
  }
  if (set === "p1") {
    return Boolean(overlap?.player1Exclusive && overlap.player1Exclusive.length > 0);
  }
  return Boolean(overlap?.player2Exclusive && overlap.player2Exclusive.length > 0);
}

export function filterProblems(
  problems: readonly SolvedProblem[],
  options: { query: string; rating: RatingFilter; sort: ProblemSort }
): SolvedProblem[] {
  const q = options.query.trim().toLowerCase();

  const filtered = problems.filter((problem) => {
    // 1. Query filter
    if (q) {
      const nameMatch = problem.name?.toLowerCase().includes(q) ?? false;
      const idMatch = problem.id?.toLowerCase().includes(q) ?? false;
      const tags = getProblemTags(problem);
      const tagMatch = tags.some((t) => t.toLowerCase().includes(q));
      if (!nameMatch && !idMatch && !tagMatch) {
        return false;
      }
    }

    // 2. Rating filter
    const r = problem.rating;
    const hasRating = typeof r === "number" && !isNaN(r) && r > 0;

    switch (options.rating) {
      case "master":
        return hasRating && r >= 2200;
      case "hard":
        return hasRating && r >= 1600 && r <= 2199;
      case "easy":
        return hasRating && r < 1600;
      case "unrated":
        return !hasRating;
      case "all":
      default:
        return true;
    }
  });

  return filtered.sort((a, b) => {
    if (options.sort === "rating-desc") {
      const aHas = typeof a.rating === "number" && a.rating > 0;
      const bHas = typeof b.rating === "number" && b.rating > 0;
      if (aHas && bHas) {
        const diff = (b.rating as number) - (a.rating as number);
        if (diff !== 0) return diff;
      } else if (aHas && !bHas) {
        return -1;
      } else if (!aHas && bHas) {
        return 1;
      }
      return (a.name || "").localeCompare(b.name || "");
    }

    if (options.sort === "rating-asc") {
      const aHas = typeof a.rating === "number" && a.rating > 0;
      const bHas = typeof b.rating === "number" && b.rating > 0;
      if (aHas && bHas) {
        const diff = (a.rating as number) - (b.rating as number);
        if (diff !== 0) return diff;
      } else if (aHas && !bHas) {
        return -1;
      } else if (!aHas && bHas) {
        return 1;
      }
      return (a.name || "").localeCompare(b.name || "");
    }

    return (a.name || "").localeCompare(b.name || "");
  });
}
