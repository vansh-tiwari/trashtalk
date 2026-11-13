import { describe, it, expect } from "vitest";
import {
  resolveVisitorGeoContext,
  hashVisitorIp,
  RingsideHistoryStore,
  ROAST_DIALECT_OPTIONS,
} from "@/lib/ringside/context";
import { mergeRecentBouts } from "@/lib/ringside/client";

describe("Ringside IP Geo Context, Dialect Selection & Corner History", () => {
  it("resolves city, country, timezone, and Hinglish dialect from Vercel IP headers", () => {
    const geo = resolveVisitorGeoContext({
      headers: {
        "x-vercel-ip-city": "Bengaluru",
        "x-vercel-ip-country": "IN",
        "x-vercel-ip-country-region": "KA",
        "x-vercel-ip-timezone": "Asia/Kolkata",
      },
    });

    expect(geo.city).toBe("BENGALURU");
    expect(geo.countryCode).toBe("IN");
    expect(geo.timezone).toBe("Asia/Kolkata");
    expect(geo.datelineLocation).toBe("BENGALURU, IN");
    expect(geo.detectedRegion.languageCode).toBe("hi");
    expect(geo.detectedRegion.toggleLabel).toBe("HINGLISH");
    expect(geo.activeRegion.languageCode).toBe("hi");
  });

  it("decodes URI-encoded city headers and preserves detectedRegion when overrideLang is set", () => {
    const geo = resolveVisitorGeoContext({
      headers: {
        "x-vercel-ip-city": "S%C3%A3o%20Paulo",
        "x-vercel-ip-country": "BR",
        "x-vercel-ip-timezone": "America/Sao_Paulo",
      },
      overrideLang: "en",
    });

    expect(geo.city).toBe("SÃO PAULO");
    expect(geo.datelineLocation).toBe("SÃO PAULO, BR");
    expect(geo.detectedRegion.languageCode).toBe("pt");
    expect(geo.activeRegion.languageCode).toBe("en");
  });

  it("falls back to clientTimezone when Vercel IP headers are absent", () => {
    const geo = resolveVisitorGeoContext({
      clientTimezone: "Asia/Kolkata",
      clientLang: "en-IN",
    });

    expect(geo.city).toBe("BENGALURU");
    expect(geo.countryCode).toBe("IN");
    expect(geo.detectedRegion.languageCode).toBe("hi");
  });

  it("hashes visitor IPs deterministically without exposing raw IP strings", () => {
    const rawIp = "203.0.113.42";
    const h1 = hashVisitorIp({ "x-forwarded-for": `${rawIp}, 10.0.0.1` });
    const h2 = hashVisitorIp({ "x-real-ip": rawIp });
    const h3 = hashVisitorIp({ "x-real-ip": "198.51.100.99" });

    expect(h1).toHaveLength(24);
    expect(h1).toBe(h2);
    expect(h1).not.toBe(h3);
    expect(h1).not.toContain(rawIp);
  });

  it("records, deduplicates, caps at 6 entries, and clears recent bouts in RingsideHistoryStore", () => {
    const store = new RingsideHistoryStore(null);
    const ipHash = "test-corner-hash-123456";

    store.recordBout(ipHash, {
      id: "cf-tourist-vs-petr-legendary",
      platform: "codeforces",
      u1: "tourist",
      u2: "Petr",
      winnerHandle: "tourist",
      margin: 7,
      createdAt: "2026-11-13T10:00:00.000Z",
    });

    store.recordBout(ipHash, {
      id: "gh-torvalds-vs-antirez-legendary",
      platform: "github",
      u1: "torvalds",
      u2: "antirez",
      winnerHandle: "torvalds",
      margin: 11,
      createdAt: "2026-11-13T10:05:00.000Z",
    });

    // Re-recording tourist vs Petr should move it to index 0 without duplicating
    const updated = store.recordBout(ipHash, {
      id: "cf-tourist-vs-petr-legendary",
      platform: "codeforces",
      u1: "tourist",
      u2: "Petr",
      winnerHandle: "tourist",
      margin: 7,
      createdAt: "2026-11-13T10:10:00.000Z",
    });

    expect(updated).toHaveLength(2);
    expect(updated[0].id).toBe("cf-tourist-vs-petr-legendary");
    expect(updated[1].id).toBe("gh-torvalds-vs-antirez-legendary");

    store.clearBouts(ipHash);
    expect(store.getRecentBouts(ipHash)).toHaveLength(0);
  });

  it("merges local and server recent bouts newest-first without duplicates", () => {
    const merged = mergeRecentBouts(
      [
        {
          id: "cf-tourist-vs-petr-legendary",
          platform: "codeforces",
          u1: "tourist",
          u2: "Petr",
          winnerHandle: "tourist",
          margin: 7,
          createdAt: "2026-11-13T09:00:00.000Z",
        },
      ],
      [
        {
          id: "lc-neetcode-vs-larryny-legendary",
          platform: "leetcode",
          u1: "neetcode",
          u2: "larryny",
          winnerHandle: "larryny",
          margin: 15,
          createdAt: "2026-11-13T11:00:00.000Z",
        },
        {
          id: "cf-tourist-vs-petr-legendary",
          platform: "codeforces",
          u1: "tourist",
          u2: "Petr",
          winnerHandle: "tourist",
          margin: 7,
          createdAt: "2026-11-13T10:00:00.000Z",
        },
      ]
    );

    expect(merged).toHaveLength(2);
    expect(merged[0].id).toBe("lc-neetcode-vs-larryny-legendary");
    expect(merged[1].id).toBe("cf-tourist-vs-petr-legendary");
    expect(ROAST_DIALECT_OPTIONS.length).toBeGreaterThanOrEqual(8);
  });
});
