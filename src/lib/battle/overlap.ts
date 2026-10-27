import { SolvedProblem } from "../platforms/contracts";
import { OverlapResult } from "./types";

export function calculateTagCosineSimilarity(
  t1: Array<{ tagSlug: string; problemsSolved: number }>,
  t2: Array<{ tagSlug: string; problemsSolved: number }>
): number {
  const map1 = new Map<string, number>();
  for (const t of t1) {
    if (t.problemsSolved > 0) map1.set(t.tagSlug, t.problemsSolved);
  }
  const map2 = new Map<string, number>();
  for (const t of t2) {
    if (t.problemsSolved > 0) map2.set(t.tagSlug, t.problemsSolved);
  }

  const allTags = new Set([...map1.keys(), ...map2.keys()]);
  if (allTags.size === 0) return 0;

  let dotProduct = 0;
  let mag1Sq = 0;
  let mag2Sq = 0;

  for (const tag of allTags) {
    const v1 = map1.get(tag) || 0;
    const v2 = map2.get(tag) || 0;
    dotProduct += v1 * v2;
    mag1Sq += v1 * v1;
    mag2Sq += v2 * v2;
  }

  if (mag1Sq === 0 || mag2Sq === 0) return 0;
  const mag1 = Math.sqrt(mag1Sq);
  const mag2 = Math.sqrt(mag2Sq);
  return Math.round((dotProduct / (mag1 * mag2)) * 100);
}

export function compareSolved(
  p1Problems: SolvedProblem[] = [],
  p2Problems: SolvedProblem[] = [],
  p1Complete = true,
  p2Complete = true,
  t1?: Array<{ tagSlug: string; problemsSolved: number }>,
  t2?: Array<{ tagSlug: string; problemsSolved: number }>
): OverlapResult {
  const p1Map = new Map<string, SolvedProblem>();
  for (const p of p1Problems) {
    p1Map.set(p.id, p);
  }

  const p2Map = new Map<string, SolvedProblem>();
  for (const p of p2Problems) {
    p2Map.set(p.id, p);
  }

  const common: SolvedProblem[] = [];
  const player1Exclusive: SolvedProblem[] = [];
  const player2Exclusive: SolvedProblem[] = [];

  // Sort helper: rating descending (unrated / 0 last), then id ascending
  const sortByDifficulty = (a: SolvedProblem, b: SolvedProblem) => {
    const rA = a.rating ?? -1;
    const rB = b.rating ?? -1;
    if (rB !== rA) return rB - rA;
    return a.id.localeCompare(b.id);
  };

  // Find common and p1 exclusives
  for (const [id, p1Item] of p1Map) {
    if (p2Map.has(id)) {
      common.push(p1Item);
    } else {
      player1Exclusive.push(p1Item);
    }
  }

  // Find p2 exclusives
  for (const [id, p2Item] of p2Map) {
    if (!p1Map.has(id)) {
      player2Exclusive.push(p2Item);
    }
  }

  common.sort(sortByDifficulty);
  player1Exclusive.sort(sortByDifficulty);
  player2Exclusive.sort(sortByDifficulty);

  const unionIds = new Set([...p1Map.keys(), ...p2Map.keys()]);
  const totalUnionCount = unionIds.size;
  const commonCount = common.length;

  const isDefinitive = p1Complete && p2Complete;

  let dnaPercentage: number | null = null;
  if (t1 && t2 && t1.length > 0 && t2.length > 0) {
    // When tag distributions are supplied (e.g. LeetCode), compute Tag Cosine Similarity
    dnaPercentage = calculateTagCosineSimilarity(t1, t2);
  } else if (totalUnionCount === 0 || !isDefinitive) {
    dnaPercentage = null;
  } else {
    dnaPercentage = Math.round((commonCount / totalUnionCount) * 100);
  }

  return {
    common,
    player1Exclusive,
    player2Exclusive,
    dnaPercentage,
    isDefinitive,
    totalUnionCount,
    commonCount,
  };
}

export { computeGithubOverlap } from "./github-overlap";
