import { GithubEvidence } from "../platforms/contracts";
import { compareSolved } from "./overlap";
import { OverlapResult } from "./types";

export function computeGithubOverlap(
  p1Evidence: GithubEvidence,
  p2Evidence: GithubEvidence
): OverlapResult {
  const p1Repos = p1Evidence.solvedProblems ?? [];
  const p2Repos = p2Evidence.solvedProblems ?? [];

  // Convert languages to tag format for Cosine Similarity
  const t1 = (p1Evidence.profile?.languages ?? []).map((l) => ({
    tagSlug: l.name.toLowerCase(),
    problemsSolved: l.repoCount,
  }));
  const t2 = (p2Evidence.profile?.languages ?? []).map((l) => ({
    tagSlug: l.name.toLowerCase(),
    problemsSolved: l.repoCount,
  }));

  return compareSolved(p1Repos, p2Repos, true, true, t1, t2);
}
