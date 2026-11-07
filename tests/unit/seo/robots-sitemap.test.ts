import { describe, it, expect } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("Search Engine Directives: robots.txt & sitemap.xml (Items 7 & 8)", () => {
  it("generates correct robots.txt directives", () => {
    const rules = robots();
    expect(rules).toBeDefined();
    expect(rules.rules).toBeDefined();
    expect(rules.sitemap).toContain("/sitemap.xml");

    const userAgentRule = Array.isArray(rules.rules) ? rules.rules[0] : rules.rules;
    expect(userAgentRule).toBeDefined();
    expect(userAgentRule.allow).toBeDefined();
    expect(userAgentRule.disallow).toBeDefined();
  });

  it("generates comprehensive sitemap with static and legendary battle routes", () => {
    const entries = sitemap();
    expect(entries.length).toBeGreaterThan(5);

    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.endsWith("/") || u.includes("trashtalk"))).toBe(true);
    expect(urls.some((u) => u.includes("/battle"))).toBe(true);
    expect(urls.some((u) => u.includes("/evolution"))).toBe(true);
    expect(urls.some((u) => u.includes("/roast"))).toBe(true);
    expect(urls.some((u) => u.includes("/privacy"))).toBe(true);
    expect(urls.some((u) => u.includes("tourist-vs-petr"))).toBe(true);
    expect(urls.some((u) => u.includes("torvalds-vs-antirez"))).toBe(true);
  });
});
