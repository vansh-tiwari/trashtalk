import { DevProfile, Platform, PlatformStats } from "@/types";
import { fetchGitHubProfile } from "./github";
import { fetchLeetCodeProfile } from "./leetcode";
import { fetchCodeforcesProfile } from "./codeforces";
import { fetchCodeChefProfile } from "./codechef";

export async function fetchPlatformData(
  platform: Platform,
  handle: string
): Promise<PlatformStats | null> {
  const cleanHandle = handle.trim();
  if (!cleanHandle) return null;

  switch (platform) {
    case "github":
      return fetchGitHubProfile(cleanHandle);
    case "leetcode":
      return fetchLeetCodeProfile(cleanHandle);
    case "codeforces":
      return fetchCodeforcesProfile(cleanHandle);
    case "codechef":
      return fetchCodeChefProfile(cleanHandle);
    default:
      return null;
  }
}

export function buildDevProfile(
  username: string,
  platformStats: PlatformStats[]
): DevProfile {
  const platforms: Partial<Record<Platform, PlatformStats>> = {};
  for (const stat of platformStats) {
    platforms[stat.platform] = stat;
  }

  // Derive composite scores
  const cfRating = platforms.codeforces?.rating || 0;
  const ccRating = platforms.codechef?.rating || 0;
  const lcRating = platforms.leetcode?.rating || 0;
  const lcSolved = platforms.leetcode?.problemsSolved?.total || 0;
  const ccSolved = platforms.codechef?.problemsSolved?.total || 0;
  const ghRepos = (platforms.github?.metrics?.["Public Repos"] as number) || 0;
  const ghFollowers = (platforms.github?.metrics?.Followers as number) || 0;

  // 1. Algorithmic Grit (0 - 100)
  const algoScore = Math.min(
    100,
    Math.round(
      (cfRating > 0 ? (cfRating / 3000) * 45 : 0) +
      (lcSolved > 0 ? Math.min(35, (lcSolved / 600) * 35) : 0) +
      (ccRating > 0 ? (ccRating / 2500) * 20 : 0)
    )
  );

  // 2. Git Consistency (0 - 100)
  const gitScore = Math.min(
    100,
    Math.round(
      Math.min(60, ghRepos * 3) +
      Math.min(40, ghFollowers * 2)
    )
  );

  // 3. Contest Performance (0 - 100)
  const maxContest = Math.max(cfRating, ccRating, lcRating);
  const contestScore = maxContest > 0 ? Math.min(100, Math.round((maxContest / 2800) * 100)) : 10;

  // 4. Velocity (0 - 100)
  const totalSolved = lcSolved + ccSolved;
  const velocityScore = Math.min(100, Math.max(15, Math.round((totalSolved / 800) * 100)));

  // 5. Stack Breadth (0 - 100)
  const platformCount = Object.keys(platforms).length;
  const breadthScore = Math.min(100, platformCount * 25);

  const bestAvatar =
    platforms.github?.avatarUrl ||
    platforms.leetcode?.avatarUrl ||
    platforms.codeforces?.avatarUrl ||
    platforms.codechef?.avatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  return {
    username,
    displayName:
      (platforms.github?.raw as Record<string, string>)?.name ||
      username,
    avatarUrl: bestAvatar,
    bio: (platforms.github?.raw as Record<string, string>)?.bio || undefined,
    country: (platforms.codeforces?.metrics?.Country as string) || undefined,
    platforms,
    compositeScore: {
      algorithmicGrit: Math.max(15, algoScore),
      gitConsistency: Math.max(10, gitScore),
      contestPerformance: Math.max(15, contestScore),
      velocity: Math.max(15, velocityScore),
      stackBreadth: Math.max(25, breadthScore),
    },
  };
}
