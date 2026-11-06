import { describe, it, expect, vi } from "vitest";
import {
  parseRetryAfterMs,
  parseEntryPersona,
  prepareBattleRequest,
} from "@/lib/battle/entry";
import * as registry from "@/lib/platforms/registry";

describe("Battle Entry Helpers", () => {
  describe("parseRetryAfterMs", () => {
    const now = 1000000;

    it("parses numeric seconds and clamps between 0 and 30,000ms", () => {
      // 5 seconds -> 5000ms
      expect(parseRetryAfterMs("5", now)).toBe(5000);
      expect(parseRetryAfterMs("1", now)).toBe(1000);
      expect(parseRetryAfterMs("0", now)).toBe(0);

      // Clamps to 30000ms if > 30s
      expect(parseRetryAfterMs("60", now)).toBe(30000);

      // Negative seconds clamp to 0
      expect(parseRetryAfterMs("-10", now)).toBe(0);
    });

    it("parses HTTP date string and clamps correctly", () => {
      const futureDate = new Date(now + 12000).toUTCString();
      expect(parseRetryAfterMs(futureDate, now)).toBe(12000);

      const pastDate = new Date(now - 5000).toUTCString();
      expect(parseRetryAfterMs(pastDate, now)).toBe(0);
    });

    it("defaults to 5000ms for null, empty, or malformed Retry-After headers", () => {
      expect(parseRetryAfterMs(null, now)).toBe(5000);
      expect(parseRetryAfterMs("", now)).toBe(5000);
      expect(parseRetryAfterMs("not-a-number", now)).toBe(5000);
    });
  });

  describe("parseEntryPersona", () => {
    it("returns valid personas as-is", () => {
      expect(parseEntryPersona("savage_dev")).toBe("savage_dev");
      expect(parseEntryPersona("silicon_valley_vc")).toBe("silicon_valley_vc");
      expect(parseEntryPersona("ufc_announcer")).toBe("ufc_announcer");
      expect(parseEntryPersona("hype_man")).toBe("hype_man");
    });

    it("falls back to savage_dev for unknown, invalid, or null values", () => {
      expect(parseEntryPersona("unknown")).toBe("savage_dev");
      expect(parseEntryPersona(null)).toBe("savage_dev");
      expect(parseEntryPersona(undefined)).toBe("savage_dev");
      expect(parseEntryPersona(123)).toBe("savage_dev");
      expect(parseEntryPersona({})).toBe("savage_dev");
    });
  });

  describe("prepareBattleRequest", () => {
    it("prepares valid request body for live Codeforces platform", () => {
      const req = prepareBattleRequest({
        platform: "codeforces",
        u1: "tourist",
        u2: "Petr",
        persona: "savage_dev",
      });
      expect(req).toEqual({
        platform: "codeforces",
        u1: "tourist",
        u2: "Petr",
        persona: "savage_dev",
      });
    });

    it("prepares valid request body for live LeetCode platform", () => {
      const req = prepareBattleRequest({
        platform: "leetcode",
        u1: "neetcode",
        u2: "larryny",
        persona: "savage_dev",
      });
      expect(req).toEqual({
        platform: "leetcode",
        u1: "neetcode",
        u2: "larryny",
        persona: "savage_dev",
      });
    });

    it("prepares valid request body for live GitHub platform", () => {
      const req = prepareBattleRequest({
        platform: "github",
        u1: "torvalds",
        u2: "antirez",
        persona: "savage_dev",
      });
      expect(req).toEqual({
        platform: "github",
        u1: "torvalds",
        u2: "antirez",
        persona: "savage_dev",
      });
    });

    it("rejects non-live platforms without constructing an API request", () => {
      vi.spyOn(registry, "isBattleEnabled").mockReturnValueOnce(false);
      expect(() =>
        prepareBattleRequest({
          platform: "github",
          u1: "alice",
          u2: "bob",
          persona: "savage_dev",
        })
      ).toThrow(/not currently live/i);

      // CodeChef is now live and succeeds
      const ccReq = prepareBattleRequest({
        platform: "codechef",
        u1: "akulsareen",
        u2: "gennady",
        persona: "savage_dev",
      });
      expect(ccReq.platform).toBe("codechef");
    });
  });
});
