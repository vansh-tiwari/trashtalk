import { describe, it, expect } from "vitest";
import { parseBattleIdDetails } from "@/lib/battle/validation";

describe("parseBattleIdDetails", () => {
  it("correctly parses Codeforces battle IDs with hex and legendary suffixes", () => {
    expect(parseBattleIdDetails("cf-tourist-vs-petr-legendary")).toEqual({
      platform: "codeforces",
      u1: "tourist",
      u2: "petr",
    });

    expect(parseBattleIdDetails("cf-tourist-vs-petr-a1b2c3d4e5f6")).toEqual({
      platform: "codeforces",
      u1: "tourist",
      u2: "petr",
    });

    expect(parseBattleIdDetails("cf-ecnerwala-vs-benq-0ed40e2a-b04")).toEqual({
      platform: "codeforces",
      u1: "ecnerwala",
      u2: "benq",
    });
  });

  it("correctly parses LeetCode battle IDs with hyphenated usernames", () => {
    expect(
      parseBattleIdDetails("lc-govindam_123-vs-vansh-tiwari-af200d98-1fc")
    ).toEqual({
      platform: "leetcode",
      u1: "govindam_123",
      u2: "vansh-tiwari",
    });

    expect(
      parseBattleIdDetails("lc-neetcode-vs-larryny-legendary")
    ).toEqual({
      platform: "leetcode",
      u1: "neetcode",
      u2: "larryny",
    });
  });

  it("correctly parses GitHub and CodeChef battle IDs", () => {
    expect(
      parseBattleIdDetails("gh-torvalds-vs-antirez-abcdef123456")
    ).toEqual({
      platform: "github",
      u1: "torvalds",
      u2: "antirez",
    });

    expect(
      parseBattleIdDetails("cc-akulsareen-vs-gennady-123456789012")
    ).toEqual({
      platform: "codechef",
      u1: "akulsareen",
      u2: "gennady",
    });
  });

  it("returns null for non-battle strings or missing vs separator", () => {
    expect(parseBattleIdDetails("not-a-battle-id")).toBeNull();
    expect(parseBattleIdDetails("cf--vs-petr")).toBeNull();
    expect(parseBattleIdDetails("cf-tourist-against-petr")).toBeNull();
    expect(parseBattleIdDetails("")).toBeNull();
  });
});
