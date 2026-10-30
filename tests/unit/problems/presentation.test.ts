import { describe, it, expect } from "vitest";
import {
  getProblemStatementUrl,
  getProblemTags,
  isProblemSetAvailable,
  filterProblems,
  type ProblemSet,
  type RatingFilter,
  type ProblemSort,
} from "@/lib/problems/presentation";
import type { SolvedProblem } from "@/lib/platforms/contracts";
import type { OverlapResult } from "@/lib/battle/types";

describe("Problem Presentation Helpers", () => {
  describe("getProblemStatementUrl", () => {
    it("accepts valid HTTPS official Codeforces URLs", () => {
      expect(
        getProblemStatementUrl({
          url: "https://codeforces.com/contest/123/problem/A",
        })
      ).toBe("https://codeforces.com/contest/123/problem/A");

      expect(
        getProblemStatementUrl({
          url: "https://codeforces.com/problemset/problem/123/B",
        })
      ).toBe("https://codeforces.com/problemset/problem/123/B");
    });

    it("accepts valid HTTPS official LeetCode URLs", () => {
      expect(
        getProblemStatementUrl({
          url: "https://leetcode.com/problems/two-sum/",
        })
      ).toBe("https://leetcode.com/problems/two-sum/");
    });

    it("accepts valid HTTPS official CodeChef URLs", () => {
      expect(
        getProblemStatementUrl({
          url: "https://www.codechef.com/problems/BINADD",
        })
      ).toBe("https://www.codechef.com/problems/BINADD");
    });

    it("constructs canonical LeetCode URL when id starts with LC:", () => {
      expect(
        getProblemStatementUrl({
          id: "LC:trapping-rain-water",
        })
      ).toBe("https://leetcode.com/problems/trapping-rain-water/");
    });

    it("constructs canonical CodeChef URL when id starts with CC:", () => {
      expect(
        getProblemStatementUrl({
          id: "CC:BINADD",
        })
      ).toBe("https://www.codechef.com/problems/BINADD");
    });

    it("constructs official statement URL when url is missing but contestId and index are valid", () => {
      expect(
        getProblemStatementUrl({
          contestId: 1850,
          index: "C",
        })
      ).toBe("https://codeforces.com/contest/1850/problem/C");
    });

    it("rejects javascript:, foreign hosts, negative/zero contest IDs, and dangerous characters", () => {
      expect(
        getProblemStatementUrl({
          url: "javascript:alert(1)",
        })
      ).toBeNull();

      expect(
        getProblemStatementUrl({
          url: "http://insecure-site.com/problem/1/A",
        })
      ).toBeNull();

      expect(
        getProblemStatementUrl({
          url: "https://malicious.com/codeforces.com",
        })
      ).toBeNull();

      expect(
        getProblemStatementUrl({
          contestId: -5,
          index: "A",
        })
      ).toBeNull();

      expect(
        getProblemStatementUrl({
          contestId: 0,
          index: "A",
        })
      ).toBeNull();

      expect(
        getProblemStatementUrl({
          contestId: 100,
          index: "../../etc/passwd",
        })
      ).toBeNull();

      expect(getProblemStatementUrl({})).toBeNull();
    });
  });

  describe("getProblemTags", () => {
    it("returns tags when present, or an empty list when absent/null", () => {
      expect(getProblemTags({ tags: ["dp", "math"] })).toEqual(["dp", "math"]);
      expect(getProblemTags({})).toEqual([]);
      expect(getProblemTags({ tags: undefined })).toEqual([]);
    });
  });

  describe("isProblemSetAvailable", () => {
    it("allows common set on both definitive and non-definitive overlap", () => {
      const definitive: OverlapResult = {
        common: [],
        player1Exclusive: [],
        player2Exclusive: [],
        dnaPercentage: 50,
        isDefinitive: true,
        totalUnionCount: 10,
        commonCount: 5,
      };

      const partial: OverlapResult = {
        common: [],
        player1Exclusive: [],
        player2Exclusive: [],
        dnaPercentage: null,
        isDefinitive: false,
        totalUnionCount: 10,
        commonCount: 5,
      };

      expect(isProblemSetAvailable(definitive, "common")).toBe(true);
      expect(isProblemSetAvailable(partial, "common")).toBe(true);
    });

    it("allows exclusive sets only when overlap is definitive", () => {
      const definitive: OverlapResult = {
        common: [],
        player1Exclusive: [],
        player2Exclusive: [],
        dnaPercentage: 50,
        isDefinitive: true,
        totalUnionCount: 10,
        commonCount: 5,
      };

      const partial: OverlapResult = {
        common: [],
        player1Exclusive: [],
        player2Exclusive: [],
        dnaPercentage: null,
        isDefinitive: false,
        totalUnionCount: 10,
        commonCount: 5,
      };

      expect(isProblemSetAvailable(definitive, "p1")).toBe(true);
      expect(isProblemSetAvailable(definitive, "p2")).toBe(true);

      expect(isProblemSetAvailable(partial, "p1")).toBe(false);
      expect(isProblemSetAvailable(partial, "p2")).toBe(false);
    });
  });

  describe("filterProblems", () => {
    const sampleProblems: SolvedProblem[] = [
      {
        id: "CF:1A",
        platform: "codeforces",
        contestId: 1,
        index: "A",
        name: "Theatre Square",
        rating: 1000,
        tags: ["math"],
        acceptedAt: 100000,
        url: "https://codeforces.com/contest/1/problem/A",
      },
      {
        id: "CF:158B",
        platform: "codeforces",
        contestId: 158,
        index: "B",
        name: "Taxi",
        rating: 1600,
        tags: ["greedy", "math"],
        acceptedAt: 100001,
        url: "https://codeforces.com/contest/158/problem/B",
      },
      {
        id: "CF:4C",
        platform: "codeforces",
        contestId: 4,
        index: "C",
        name: "Registration System",
        rating: 2200,
        tags: ["data structures", "hashing"],
        acceptedAt: 100002,
        url: "https://codeforces.com/contest/4/problem/C",
      },
      {
        id: "CF:999Z",
        platform: "codeforces",
        contestId: 999,
        index: "Z",
        name: "Unknown Legend",
        rating: undefined,
        tags: ["special"],
        acceptedAt: 100003,
        url: "https://codeforces.com/contest/999/problem/Z",
      },
    ];

    it("filters by query matching name, id, or tags", () => {
      const byName = filterProblems(sampleProblems, {
        query: "taxi",
        rating: "all",
        sort: "name-asc",
      });
      expect(byName.map((p) => p.id)).toEqual(["CF:158B"]);

      const byId = filterProblems(sampleProblems, {
        query: "1a",
        rating: "all",
        sort: "name-asc",
      });
      expect(byId.map((p) => p.id)).toEqual(["CF:1A"]);

      const byTag = filterProblems(sampleProblems, {
        query: "hashing",
        rating: "all",
        sort: "name-asc",
      });
      expect(byTag.map((p) => p.id)).toEqual(["CF:4C"]);
    });

    it("filters by rating boundaries correctly: easy (<1600), hard (1600-2199), master (>=2200), unrated", () => {
      const easy = filterProblems(sampleProblems, {
        query: "",
        rating: "easy",
        sort: "name-asc",
      });
      expect(easy.map((p) => p.id)).toEqual(["CF:1A"]);

      const hard = filterProblems(sampleProblems, {
        query: "",
        rating: "hard",
        sort: "name-asc",
      });
      expect(hard.map((p) => p.id)).toEqual(["CF:158B"]);

      const master = filterProblems(sampleProblems, {
        query: "",
        rating: "master",
        sort: "name-asc",
      });
      expect(master.map((p) => p.id)).toEqual(["CF:4C"]);

      const unrated = filterProblems(sampleProblems, {
        query: "",
        rating: "unrated",
        sort: "name-asc",
      });
      expect(unrated.map((p) => p.id)).toEqual(["CF:999Z"]);
    });

    it("sorts deterministically and keeps the source array immutable", () => {
      const originalCopy = [...sampleProblems];

      const sortedDesc = filterProblems(sampleProblems, {
        query: "",
        rating: "all",
        sort: "rating-desc",
      });

      // 2200 -> 1600 -> 1000 -> unrated
      expect(sortedDesc.map((p) => p.id)).toEqual([
        "CF:4C",
        "CF:158B",
        "CF:1A",
        "CF:999Z",
      ]);

      const sortedAsc = filterProblems(sampleProblems, {
        query: "",
        rating: "all",
        sort: "rating-asc",
      });

      // 1000 -> 1600 -> 2200 -> unrated
      expect(sortedAsc.map((p) => p.id)).toEqual([
        "CF:1A",
        "CF:158B",
        "CF:4C",
        "CF:999Z",
      ]);

      // Verify original array was not mutated
      expect(sampleProblems).toEqual(originalCopy);
    });
  });
});
