import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fetchCodechefEvidence, deriveCodechefStarsAndDivision } from "@/lib/platforms/codechef";

const akulsareenHtml = fs.readFileSync(
  path.join(process.cwd(), "tests/fixtures/codechef/akulsareen.html"),
  "utf-8"
);
const unratedHtml = fs.readFileSync(
  path.join(process.cwd(), "tests/fixtures/codechef/unrated.html"),
  "utf-8"
);
const notFoundHtml = fs.readFileSync(
  path.join(process.cwd(), "tests/fixtures/codechef/not-found.html"),
  "utf-8"
);

describe("CodeChef Adapter Evidence Fetching", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles a 404 / user not found with status: not_found", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 404,
      text: async () => notFoundHtml,
    } as Response);

    const result = await fetchCodechefEvidence("non_existent_cc_user_123");
    expect(result.status).toBe("not_found");
    expect(result.profile).toBeUndefined();
    expect(result.solvedProblems).toBeUndefined();
  });

  it("handles user not found message in 200 response HTML with status: not_found", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => notFoundHtml,
    } as Response);

    const result = await fetchCodechefEvidence("missing_handle");
    expect(result.status).toBe("not_found");
  });

  it("handles 429 rate limit cleanly", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 429,
      text: async () => "Too Many Requests",
    } as Response);

    const result = await fetchCodechefEvidence("rate_limited_user");
    expect(result.status).toBe("rate_limited");
    expect(result.error).toContain("rate limit");
  });

  it("handles Cloudflare or server blocking cleanly with status: unavailable", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 403,
      text: async () => "Attention Required! | Cloudflare",
    } as Response);

    const result = await fetchCodechefEvidence("blocked_user");
    expect(result.status).toBe("unavailable");
  });

  it("parses real public profile fixture (akulsareen) with full fidelity", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => akulsareenHtml,
    } as Response);

    const result = await fetchCodechefEvidence("akulsareen");
    expect(result.status).toBe("ok");
    expect(result.platform).toBe("codechef");
    expect(result.handle).toBe("akulsareen");

    const profile = result.profile;
    expect(profile).toBeDefined();
    expect(profile?.rating).toBe(2103);
    // Highest rating takes peak across eras (2260)
    expect(profile?.highestRating).toBe(2260);
    expect(profile?.stars).toBe(5);
    expect(profile?.starString).toBe("5★");
    expect(profile?.division).toBe(1);
    expect(profile?.globalRank).toBe(563);
    expect(profile?.countryRank).toBe(403);
    expect(profile?.countryName).toBe("India");
    expect(profile?.userType).toBe("Professional");
    expect(profile?.organisation).toContain("Birla Institute of Technology");
    expect(profile?.contestsParticipated).toBe(54);
    expect(profile?.totalSolved).toBe(359);
    expect(profile?.listedSolvedCount).toBe(12);

    // DSA rating parsed as inactive
    expect(profile?.dsaGlobalRank).toBe("Inactive");
    expect(profile?.dsaCountryRank).toBe("Inactive");

    // Coverage verifies listed solves vs total solved
    expect(result.coverage.isCompleteSolveList).toBe(false);
    expect(result.coverage.totalAcceptedSolved).toBe(359);

    // Solved problems array correctly itemized
    expect(result.solvedProblems).toBeDefined();
    expect(result.solvedProblems?.length).toBe(12);
    const prob1 = result.solvedProblems?.find((p) => p.name === "Problem One");
    expect(prob1).toBeDefined();
    expect(prob1?.id).toBe("CC:PROB1");
    expect(prob1?.url).toBe("https://www.codechef.com/problems/PROB1");

    // Contest history extracted from embedded all_rating
    expect(result.contestHistory).toBeDefined();
    expect(result.contestHistory?.length).toBeGreaterThan(0);
    const cook110 = result.contestHistory?.find((c) => c.contestName === "Cook-Off 110");
    expect(cook110).toBeDefined();
    expect(cook110?.newRating).toBe(2260);
    expect(cook110?.rank).toBe(45);
  });

  it("parses unrated user fixture gracefully without NaN or crashing", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: async () => unratedHtml,
    } as Response);

    const result = await fetchCodechefEvidence("newbie_coder");
    expect(result.status).toBe("ok");
    expect(result.profile?.rating).toBeUndefined();
    expect(result.profile?.highestRating).toBeUndefined();
    expect(result.profile?.contestsParticipated).toBe(0);
    expect(result.profile?.totalSolved).toBe(0);
    expect(result.profile?.stars).toBeUndefined();
    expect(result.solvedProblems?.length).toBe(0);
  });

  it("correctly derives stars and division across ratings", () => {
    expect(deriveCodechefStarsAndDivision(undefined)).toEqual({ stars: undefined, division: null });
    expect(deriveCodechefStarsAndDivision(1200)).toEqual({ stars: 1, division: 4 });
    expect(deriveCodechefStarsAndDivision(1450)).toEqual({ stars: 2, division: 3 });
    expect(deriveCodechefStarsAndDivision(1650)).toEqual({ stars: 3, division: 3 });
    expect(deriveCodechefStarsAndDivision(1850)).toEqual({ stars: 4, division: 2 });
    expect(deriveCodechefStarsAndDivision(2100)).toEqual({ stars: 5, division: 1 });
    expect(deriveCodechefStarsAndDivision(2350)).toEqual({ stars: 6, division: 1 });
    expect(deriveCodechefStarsAndDivision(2600)).toEqual({ stars: 7, division: 1 });
  });
});
