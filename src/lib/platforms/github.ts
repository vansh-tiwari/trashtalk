import {
  FetchContext,
  GithubEvidence,
  GithubProfile,
  GithubRepo,
  SolvedProblem,
} from "./contracts";
import { PlatformStats } from "@/types";
import {
  defaultEvidenceCache,
  fetchWithTimeout,
  GITHUB_API_HEADERS,
  githubThrottler,
} from "./http";

export interface GitHubUserData {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  company: string | null;
  location: string | null;
  blog: string | null;
}

export function mapRepoToSolvedProblem(repo: GithubRepo): SolvedProblem {
  const stars = repo.stars;
  const difficulty: "Easy" | "Medium" | "Hard" =
    stars >= 1000 ? "Hard" : stars >= 50 ? "Medium" : "Easy";

  const tags: string[] = [];
  if (repo.language) tags.push(repo.language);
  tags.push(repo.isFork ? "fork" : "original");

  return {
    id: `GH:${repo.name}`,
    platform: "github",
    index: repo.name,
    name: repo.name,
    rating: repo.stars,
    difficulty,
    tags,
    acceptedAt: Math.floor(new Date(repo.updatedAt).getTime() / 1000),
    url: repo.url,
  };
}

function buildHeaders(): Record<string, string> {
  const headers = { ...GITHUB_API_HEADERS };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

export async function fetchGithubEvidence(
  username: string,
  context?: FetchContext
): Promise<GithubEvidence> {
  const cleanUsername = username.trim();
  const cacheKey = `gh_evidence:${cleanUsername.toLowerCase()}`;
  const cached = defaultEvidenceCache.get(cacheKey) as GithubEvidence | null;
  if (cached) return cached;

  const fetchedAt = new Date().toISOString();
  const headers = buildHeaders();
  const timeoutMs = context?.timeoutMs ?? 10000;

  try {
    // 1. Fetch user profile
    const userRes = await githubThrottler.schedule(() =>
      fetchWithTimeout(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, { headers }, timeoutMs)
    );

    if (userRes.status === 404) {
      return {
        platform: "github",
        handle: cleanUsername,
        status: "not_found",
        fetchedAt,
        coverage: {
          historyAvailability: "unavailable",
          isComplete: false,
          totalSubmissionsFetched: 0,
          totalAcceptedSolved: 0,
        },
        error: `GitHub user "${cleanUsername}" not found.`,
      };
    }

    if (userRes.status === 403) {
      const remaining = userRes.headers.get("x-ratelimit-remaining");
      return {
        platform: "github",
        handle: cleanUsername,
        status: "rate_limited",
        fetchedAt,
        coverage: {
          historyAvailability: "unavailable",
          isComplete: false,
          totalSubmissionsFetched: 0,
          totalAcceptedSolved: 0,
        },
        error: `Rate limit exceeded on GitHub API${remaining === "0" ? " (IP quota exhausted)" : ""}. Please retry shortly.`,
      };
    }

    if (!userRes.ok) {
      throw new Error(`GitHub API returned HTTP ${userRes.status}`);
    }

    const userData: GitHubUserData = await userRes.json();

    // 2. Concurrently fetch repositories and public events
    const [reposRes, eventsRes] = await Promise.all([
      githubThrottler.schedule(() =>
        fetchWithTimeout(
          `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/repos?sort=pushed&per_page=100`,
          { headers },
          timeoutMs
        )
      ).catch(() => null),
      githubThrottler.schedule(() =>
        fetchWithTimeout(
          `https://api.github.com/users/${encodeURIComponent(cleanUsername)}/events/public?per_page=100`,
          { headers },
          timeoutMs
        )
      ).catch(() => null),
    ]);

    const rawRepos: any[] = reposRes && reposRes.ok ? await reposRes.json().catch(() => []) : [];
    const rawEvents: any[] = eventsRes && eventsRes.ok ? await eventsRes.json().catch(() => []) : [];

    // Parse repositories
    const repos: GithubRepo[] = rawRepos.map((r) => ({
      id: String(r.id),
      name: r.name,
      fullName: r.full_name,
      description: r.description || undefined,
      url: r.html_url,
      stars: Number(r.stargazers_count) || 0,
      forks: Number(r.forks_count) || 0,
      language: r.language || undefined,
      isFork: Boolean(r.fork),
      updatedAt: r.updated_at || r.pushed_at || new Date().toISOString(),
      createdAt: r.created_at || new Date().toISOString(),
    }));

    // Only original repos count for trophies and star gravity
    const originalRepos = repos.filter((r) => !r.isFork);
    const totalStars = originalRepos.reduce((acc, r) => acc + r.stars, 0);
    const totalForks = originalRepos.reduce((acc, r) => acc + r.forks, 0);

    // Language aggregation across all public repos
    const langMap = new Map<string, number>();
    for (const r of repos) {
      if (r.language) {
        langMap.set(r.language, (langMap.get(r.language) || 0) + 1);
      }
    }
    const languages = Array.from(langMap.entries())
      .map(([name, repoCount]) => ({ name, repoCount }))
      .sort((a, b) => b.repoCount - a.repoCount);

    const sortedOriginalRepos = [...originalRepos].sort((a, b) => b.stars - a.stars);
    const solvedProblems: SolvedProblem[] = sortedOriginalRepos.map(mapRepoToSolvedProblem);

    // Recent activity counts from events
    const recentContributions = rawEvents.length;

    const profile: GithubProfile = {
      handle: userData.login,
      displayName: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || undefined,
      company: userData.company || undefined,
      location: userData.location || undefined,
      blog: userData.blog || undefined,
      publicRepos: userData.public_repos,
      publicGists: userData.public_gists,
      followers: userData.followers,
      following: userData.following,
      createdAt: userData.created_at,
      totalStars,
      totalForks,
      languages,
      topRepos: sortedOriginalRepos.slice(0, 10),
    };

    const evidence: GithubEvidence = {
      platform: "github",
      handle: userData.login,
      status: "ok",
      fetchedAt,
      profile,
      solvedProblems,
      recentContributions,
      coverage: {
        historyAvailability: "complete",
        isComplete: true,
        totalSubmissionsFetched: rawRepos.length,
        totalAcceptedSolved: solvedProblems.length,
      },
    };

    defaultEvidenceCache.set(cacheKey, evidence, 3600 * 1000);
    return evidence;
  } catch (err) {
    const isNetworkErr = err instanceof Error && (err.message.includes("fetch failed") || err.message.includes("ENOTFOUND"));
    return {
      platform: "github",
      handle: cleanUsername,
      status: "unavailable",
      fetchedAt,
      coverage: {
        historyAvailability: "unavailable",
        isComplete: false,
        totalSubmissionsFetched: 0,
        totalAcceptedSolved: 0,
      },
      error: isNetworkErr
        ? `Network fetch failed for GitHub user "${cleanUsername}". The dev server cannot connect to api.github.com.`
        : err instanceof Error ? err.message : "Failed to fetch GitHub profile.",
    };
  }
}

// Backward-compatible helper for aggregator.ts
export async function fetchGitHubProfile(username: string): Promise<PlatformStats | null> {
  const evidence = await fetchGithubEvidence(username);
  if (evidence.status !== "ok" || !evidence.profile) return null;

  return {
    platform: "github",
    handle: evidence.profile.handle,
    avatarUrl: evidence.profile.avatarUrl,
    profileUrl: `https://github.com/${evidence.profile.handle}`,
    metrics: {
      "Public Repos": evidence.profile.publicRepos,
      Followers: evidence.profile.followers,
      Following: evidence.profile.following,
      "Public Gists": evidence.profile.publicGists,
      Location: evidence.profile.location || "Earth",
      Company: evidence.profile.company || "Independent",
      Created: new Date(evidence.profile.createdAt).getFullYear(),
      Stars: evidence.profile.totalStars,
    },
    raw: evidence.profile as unknown as Record<string, unknown>,
  };
}
