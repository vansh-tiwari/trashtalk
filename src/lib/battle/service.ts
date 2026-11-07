import { generateCommentary } from "../ai/roast-engine";
import { RoastPersona } from "../ai/schemas";
import { resolveGlobalRegion, DEFAULT_GLOBAL_REGION } from "../ai/global-regions";
import { formatNum } from "./formatters";
import { fetchCodeforcesEvidence } from "../platforms/codeforces";
import { fetchLeetcodeEvidence } from "../platforms/leetcode";
import { fetchCodechefEvidence } from "../platforms/codechef";
import { fetchGithubEvidence } from "../platforms/github";
import { Platform } from "../platforms/contracts";
import { compareSolved, computeGithubOverlap } from "./overlap";
import {
  scoreCodeforcesBattle,
  scoreLeetcodeBattle,
  scoreCodechefBattle,
  scoreGithubBattle,
} from "./scoring";
import {
  buildActivityLevelsFromLeetcodeCalendar,
  buildActivityLevelsFromTimestamps,
} from "./activity";
import { defaultBattleStore } from "../storage/battle-store";
import { BattleSnapshot, BattleStore } from "../storage/contracts";
import { parseBattleIdDetails } from "./validation";
import {
  PREPARED_TOURIST_VS_PETR,
  PREPARED_NEETCODE_VS_LARRYNY,
  PREPARED_AKULSAREEN_VS_GENNADY,
  PREPARED_TORVALDS_VS_ANTIREZ,
} from "../demo/prepared-battles";

export interface ExecuteBattleParams {
  u1: string;
  u2: string;
  persona?: RoastPersona;
  platform?: Platform;
  store?: BattleStore;
  apiKey?: string;
  headers?: Headers | Record<string, string | string[] | undefined> | null;
  regionOverride?: string | null;
  requestedId?: string;
}

export async function executeBattleFlow({
  u1,
  u2,
  persona = "savage_dev",
  platform = "codeforces",
  store = defaultBattleStore,
  apiKey,
  headers,
  regionOverride,
  requestedId,
}: ExecuteBattleParams): Promise<BattleSnapshot> {
  const cleanU1 = u1.trim();
  const cleanU2 = u2.trim();

  if (!cleanU1 || !cleanU2) {
    throw new Error("Both Player 1 and Player 2 usernames are required.");
  }

  const regionInfo = resolveGlobalRegion(headers, regionOverride);
  const uuidSuffix = crypto.randomUUID().slice(0, 12);

  if (platform === "leetcode") {
    // 1. Concurrently fetch LeetCode evidence for both players
    const [e1, e2] = await Promise.all([
      fetchLeetcodeEvidence(cleanU1),
      fetchLeetcodeEvidence(cleanU2),
    ]);

    if (e1.status !== "ok") {
      throw new Error(e1.error || `Player 1 (${cleanU1}) is unavailable on LeetCode.`);
    }

    if (e2.status !== "ok") {
      throw new Error(e2.error || `Player 2 (${cleanU2}) is unavailable on LeetCode.`);
    }

    // 2. Compute deterministic LeetCode verdict
    const verdict = scoreLeetcodeBattle(e1, e2);

    // 3. Compute problem overlap with tag cosine fallback
    const overlap = compareSolved(
      e1.solvedProblems,
      e2.solvedProblems,
      e1.coverage.isCompleteSolveList ?? false,
      e2.coverage.isCompleteSolveList ?? false,
      e1.tagStats,
      e2.tagStats
    );

    // 4. Generate commentary locked to verdict
    const commentary = await generateCommentary({
      p1Evidence: e1,
      p2Evidence: e2,
      verdict,
      persona,
      platform: "leetcode",
      apiKey,
      regionInfo,
    });

    const englishCommentary = regionInfo.isEnglishDefault
      ? commentary
      : await generateCommentary({
          p1Evidence: e1,
          p2Evidence: e2,
          verdict,
          persona,
          platform: "leetcode",
          apiKey,
          regionInfo: DEFAULT_GLOBAL_REGION,
        });

    const canonicalId = requestedId || `lc-${cleanU1.toLowerCase()}-vs-${cleanU2.toLowerCase()}-${uuidSuffix}`;

    const p1Activity = buildActivityLevelsFromLeetcodeCalendar(e1.submissionCalendar);
    const p2Activity = buildActivityLevelsFromLeetcodeCalendar(e2.submissionCalendar);

    const snapshot: BattleSnapshot = {
      id: canonicalId,
      createdAt: new Date().toISOString(),
      platform: "leetcode",
      persona,
      coverageNote:
        "Problem overlap computed from last 20 public AC submissions; lifetime totals power the 5-axis score.",
      player1: {
        handle: e1.handle,
        displayName: e1.profile?.displayName || e1.handle,
        avatarUrl: e1.profile?.avatarUrl,
        rank: e1.profile?.rank,
        maxRank: e1.profile?.rank,
        score: verdict.player1Score,
        activityLevels: p1Activity,
      },
      player2: {
        handle: e2.handle,
        displayName: e2.profile?.displayName || e2.handle,
        avatarUrl: e2.profile?.avatarUrl,
        rank: e2.profile?.rank,
        maxRank: e2.profile?.rank,
        score: verdict.player2Score,
        activityLevels: p2Activity,
      },
      verdict,
      overlap,
      commentary,
      englishCommentary,
      regionInfo: {
        countryCode: regionInfo.countryCode,
        languageCode: regionInfo.languageCode,
        languageName: regionInfo.languageName,
        toggleLabel: regionInfo.toggleLabel,
        isEnglishDefault: regionInfo.isEnglishDefault,
      },
    };

    await store.create(snapshot);
    return snapshot;
  }

  if (platform === "codechef") {
    // 1. Concurrently fetch CodeChef evidence for both players
    const [e1, e2] = await Promise.all([
      fetchCodechefEvidence(cleanU1),
      fetchCodechefEvidence(cleanU2),
    ]);

    if (e1.status !== "ok") {
      throw new Error(e1.error || `Player 1 (${cleanU1}) is unavailable on CodeChef.`);
    }

    if (e2.status !== "ok") {
      throw new Error(e2.error || `Player 2 (${cleanU2}) is unavailable on CodeChef.`);
    }

    // 2. Compute deterministic CodeChef verdict
    const verdict = scoreCodechefBattle(e1, e2);

    // 3. Compute problem overlap
    const overlap = compareSolved(
      e1.solvedProblems,
      e2.solvedProblems,
      e1.coverage.isCompleteSolveList ?? false,
      e2.coverage.isCompleteSolveList ?? false
    );

    // 4. Generate commentary locked to verdict
    const commentary = await generateCommentary({
      p1Evidence: e1,
      p2Evidence: e2,
      verdict,
      persona,
      platform: "codechef",
      apiKey,
      regionInfo,
    });

    const englishCommentary = regionInfo.isEnglishDefault
      ? commentary
      : await generateCommentary({
          p1Evidence: e1,
          p2Evidence: e2,
          verdict,
          persona,
          platform: "codechef",
          apiKey,
          regionInfo: DEFAULT_GLOBAL_REGION,
        });

    const canonicalId = requestedId || `cc-${cleanU1.toLowerCase()}-vs-${cleanU2.toLowerCase()}-${uuidSuffix}`;

    const p1Timestamps = (e1.solvedProblems ?? [])
      .map((p) => p.acceptedAt)
      .filter((t): t is number => typeof t === "number");
    const p2Timestamps = (e2.solvedProblems ?? [])
      .map((p) => p.acceptedAt)
      .filter((t): t is number => typeof t === "number");
    const p1Activity = buildActivityLevelsFromTimestamps(p1Timestamps);
    const p2Activity = buildActivityLevelsFromTimestamps(p2Timestamps);

    const snapshot: BattleSnapshot = {
      id: canonicalId,
      createdAt: new Date().toISOString(),
      platform: "codechef",
      persona,
      coverageNote:
        "Problem overlap computed from public contest solves; practice-only solves are omitted on CodeChef profiles.",
      player1: {
        handle: e1.handle,
        displayName: e1.profile?.displayName || e1.handle,
        avatarUrl: e1.profile?.avatarUrl,
        rank: e1.profile?.starString || (e1.profile?.stars ? `${e1.profile.stars}★` : undefined),
        maxRank: e1.profile?.starString || (e1.profile?.stars ? `${e1.profile.stars}★` : undefined),
        score: verdict.player1Score,
        activityLevels: p1Activity,
      },
      player2: {
        handle: e2.handle,
        displayName: e2.profile?.displayName || e2.handle,
        avatarUrl: e2.profile?.avatarUrl,
        rank: e2.profile?.starString || (e2.profile?.stars ? `${e2.profile.stars}★` : undefined),
        maxRank: e2.profile?.starString || (e2.profile?.stars ? `${e2.profile.stars}★` : undefined),
        score: verdict.player2Score,
        activityLevels: p2Activity,
      },
      verdict,
      overlap,
      commentary,
      englishCommentary,
      regionInfo: {
        countryCode: regionInfo.countryCode,
        languageCode: regionInfo.languageCode,
        languageName: regionInfo.languageName,
        toggleLabel: regionInfo.toggleLabel,
        isEnglishDefault: regionInfo.isEnglishDefault,
      },
    };

    await store.create(snapshot);
    return snapshot;
  }

  if (platform === "github") {
    // 1. Concurrently fetch GitHub evidence for both players
    const [e1, e2] = await Promise.all([
      fetchGithubEvidence(cleanU1),
      fetchGithubEvidence(cleanU2),
    ]);

    if (e1.status !== "ok") {
      throw new Error(e1.error || `Player 1 (${cleanU1}) is unavailable on GitHub.`);
    }

    if (e2.status !== "ok") {
      throw new Error(e2.error || `Player 2 (${cleanU2}) is unavailable on GitHub.`);
    }

    // 2. Compute deterministic GitHub verdict
    const verdict = scoreGithubBattle(e1, e2);

    // 3. Compute GitHub Tech Stack DNA overlap
    const overlap = computeGithubOverlap(e1, e2);

    // 4. Generate commentary locked to verdict
    const commentary = await generateCommentary({
      p1Evidence: e1,
      p2Evidence: e2,
      verdict,
      persona,
      platform: "github",
      apiKey,
      regionInfo,
    });

    const englishCommentary = regionInfo.isEnglishDefault
      ? commentary
      : await generateCommentary({
          p1Evidence: e1,
          p2Evidence: e2,
          verdict,
          persona,
          platform: "github",
          apiKey,
          regionInfo: DEFAULT_GLOBAL_REGION,
        });

    const canonicalId = requestedId || `gh-${cleanU1.toLowerCase()}-vs-${cleanU2.toLowerCase()}-${uuidSuffix}`;

    const p1Timestamps = (e1.solvedProblems ?? [])
      .map((p) => p.acceptedAt)
      .filter((t): t is number => typeof t === "number");
    const p2Timestamps = (e2.solvedProblems ?? [])
      .map((p) => p.acceptedAt)
      .filter((t): t is number => typeof t === "number");
    const p1Activity = buildActivityLevelsFromTimestamps(p1Timestamps);
    const p2Activity = buildActivityLevelsFromTimestamps(p2Timestamps);

    const buildDevMetadata = (p?: typeof e1.profile) => ({
      bio: p?.bio,
      company: p?.company,
      location: p?.location,
      followers: p?.followers ?? 0,
      following: p?.following ?? 0,
      publicRepos: p?.publicRepos ?? 0,
      totalStars: p?.totalStars ?? 0,
      totalForks: p?.totalForks ?? 0,
      createdAt: p?.createdAt ?? new Date().toISOString(),
      languages: p?.languages ?? [],
      topRepos: (p?.topRepos ?? []).map((r) => ({
        name: r.name,
        fullName: r.fullName,
        description: r.description,
        stars: r.stars,
        forks: r.forks,
        language: r.language,
        url: r.url,
      })),
    });

    const githubMetadata = {
      player1: buildDevMetadata(e1.profile),
      player2: buildDevMetadata(e2.profile),
    };

    const snapshot: BattleSnapshot = {
      id: canonicalId,
      createdAt: new Date().toISOString(),
      platform: "github",
      persona,
      coverageNote:
        "Stack DNA computed from public repository languages and top original projects.",
      player1: {
        handle: e1.handle,
        displayName: e1.profile?.displayName || e1.handle,
        avatarUrl: e1.profile?.avatarUrl,
        rank: e1.profile?.followers !== undefined ? `${formatNum(e1.profile.followers)} followers` : undefined,
        maxRank: e1.profile?.followers !== undefined ? `${formatNum(e1.profile.followers)} followers` : undefined,
        score: verdict.player1Score,
        activityLevels: p1Activity,
      },
      player2: {
        handle: e2.handle,
        displayName: e2.profile?.displayName || e2.handle,
        avatarUrl: e2.profile?.avatarUrl,
        rank: e2.profile?.followers !== undefined ? `${formatNum(e2.profile.followers)} followers` : undefined,
        maxRank: e2.profile?.followers !== undefined ? `${formatNum(e2.profile.followers)} followers` : undefined,
        score: verdict.player2Score,
        activityLevels: p2Activity,
      },
      verdict,
      overlap,
      commentary,
      englishCommentary,
      regionInfo: {
        countryCode: regionInfo.countryCode,
        languageCode: regionInfo.languageCode,
        languageName: regionInfo.languageName,
        toggleLabel: regionInfo.toggleLabel,
        isEnglishDefault: regionInfo.isEnglishDefault,
      },
      githubMetadata,
    };

    await store.create(snapshot);
    return snapshot;
  }

  // Codeforces Battle Flow (default)
  const [e1, e2] = await Promise.all([
    fetchCodeforcesEvidence(cleanU1),
    fetchCodeforcesEvidence(cleanU2),
  ]);

  if (e1.status !== "ok") {
    throw new Error(e1.error || `Player 1 (${cleanU1}) is unavailable on Codeforces.`);
  }

  if (e2.status !== "ok") {
    throw new Error(e2.error || `Player 2 (${cleanU2}) is unavailable on Codeforces.`);
  }

  const verdict = scoreCodeforcesBattle(e1, e2);

  const overlap = compareSolved(
    e1.solvedProblems,
    e2.solvedProblems,
    e1.coverage.isComplete,
    e2.coverage.isComplete
  );

  const commentary = await generateCommentary({
    p1Evidence: e1,
    p2Evidence: e2,
    verdict,
    persona,
    platform: "codeforces",
    apiKey,
    regionInfo,
  });

  const englishCommentary = regionInfo.isEnglishDefault
    ? commentary
    : await generateCommentary({
        p1Evidence: e1,
        p2Evidence: e2,
        verdict,
        persona,
        platform: "codeforces",
        apiKey,
        regionInfo: DEFAULT_GLOBAL_REGION,
      });

  const canonicalId = requestedId || `cf-${cleanU1.toLowerCase()}-vs-${cleanU2.toLowerCase()}-${uuidSuffix}`;

  const p1Timestamps = (e1.solvedProblems ?? [])
    .map((p) => p.acceptedAt)
    .filter((t): t is number => typeof t === "number");
  const p2Timestamps = (e2.solvedProblems ?? [])
    .map((p) => p.acceptedAt)
    .filter((t): t is number => typeof t === "number");
  const p1Activity = buildActivityLevelsFromTimestamps(p1Timestamps);
  const p2Activity = buildActivityLevelsFromTimestamps(p2Timestamps);

  const snapshot: BattleSnapshot = {
    id: canonicalId,
    createdAt: new Date().toISOString(),
    platform: "codeforces",
    persona,
    player1: {
      handle: e1.handle,
      displayName: e1.profile?.displayName || e1.handle,
      avatarUrl: e1.profile?.avatarUrl,
      rank: e1.profile?.rank,
      maxRank: e1.profile?.maxRank,
      score: verdict.player1Score,
      activityLevels: p1Activity,
    },
    player2: {
      handle: e2.handle,
      displayName: e2.profile?.displayName || e2.handle,
      avatarUrl: e2.profile?.avatarUrl,
      rank: e2.profile?.rank,
      maxRank: e2.profile?.maxRank,
      score: verdict.player2Score,
      activityLevels: p2Activity,
    },
    verdict,
    overlap,
    commentary,
    englishCommentary,
    regionInfo: {
      countryCode: regionInfo.countryCode,
      languageCode: regionInfo.languageCode,
      languageName: regionInfo.languageName,
      toggleLabel: regionInfo.toggleLabel,
      isEnglishDefault: regionInfo.isEnglishDefault,
    },
  };

  try {
    await store.create(snapshot);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("already exists") && !msg.includes("Create-only")) {
      throw err;
    }
  }

  return snapshot;
}

export async function getBattleSnapshot(
  id: string,
  store: BattleStore = defaultBattleStore,
  headers?: Headers | Record<string, string | string[] | undefined> | null
): Promise<BattleSnapshot | null> {
  if (id === "cf-tourist-vs-petr-legendary") {
    return PREPARED_TOURIST_VS_PETR;
  }
  if (id === "lc-neetcode-vs-larryny-legendary") {
    return PREPARED_NEETCODE_VS_LARRYNY;
  }
  if (id === "cc-akulsareen-vs-gennady-legendary") {
    return PREPARED_AKULSAREEN_VS_GENNADY;
  }
  if (id === "gh-torvalds-vs-antirez-legendary") {
    return PREPARED_TORVALDS_VS_ANTIREZ;
  }

  // 1. Try local or configured persistent store
  const existing = await store.get(id);
  if (existing) {
    return existing;
  }

  // 2. Serverless fallback: On-demand reconstruction
  // On platforms like Vercel, separate lambda functions do not share local /tmp filesystem.
  // Reconstruct the battle dynamically from the canonical battle ID so /battle/[id] never 404s.
  const details = parseBattleIdDetails(id);
  if (details) {
    try {
      const reconstructed = await executeBattleFlow({
        u1: details.u1,
        u2: details.u2,
        platform: details.platform,
        store,
        requestedId: id,
        headers,
      });
      return reconstructed;
    } catch (err) {
      console.error(`[TrashTalk] On-demand battle reconstruction failed for "${id}":`, err);
      return null;
    }
  }

  return null;
}
