import { describe, expect, it } from "vitest";
import { resolveGlobalRegion, DEFAULT_GLOBAL_REGION } from "@/lib/ai/global-regions";

describe("Global Region & Locale Detection", () => {
  it("defaults to Sarcastic Senior Dev English when no headers are provided", () => {
    const region = resolveGlobalRegion();
    expect(region.languageCode).toBe("en");
    expect(region.toggleLabel).toBe("ENGLISH");
    expect(region.isEnglishDefault).toBe(true);
  });

  it("detects Mexico from x-vercel-ip-country MX", () => {
    const headers = new Headers({ "x-vercel-ip-country": "MX" });
    const region = resolveGlobalRegion(headers);
    expect(region.countryCode).toBe("MX");
    expect(region.languageCode).toBe("es");
    expect(region.toggleLabel).toBe("ESPAÑOL");
    expect(region.isEnglishDefault).toBe(false);
    expect(region.culturalPromptGuidance).toContain("taquero programador");
  });

  it("detects France from x-vercel-ip-country FR", () => {
    const headers = new Headers({ "x-vercel-ip-country": "FR" });
    const region = resolveGlobalRegion(headers);
    expect(region.countryCode).toBe("FR");
    expect(region.languageCode).toBe("fr");
    expect(region.toggleLabel).toBe("FRANÇAIS");
    expect(region.isEnglishDefault).toBe(false);
    expect(region.culturalPromptGuidance).toContain("pisseur de code");
  });

  it("detects Germany from accept-language de-DE", () => {
    const headers = new Headers({ "accept-language": "de-DE,de;q=0.9,en;q=0.8" });
    const region = resolveGlobalRegion(headers);
    expect(region.languageCode).toBe("de");
    expect(region.toggleLabel).toBe("DEUTSCH");
    expect(region.isEnglishDefault).toBe(false);
    expect(region.culturalPromptGuidance).toContain("Spaghetti-Code");
  });

  it("detects Brazil from x-vercel-ip-country BR", () => {
    const headers = new Headers({ "x-vercel-ip-country": "BR" });
    const region = resolveGlobalRegion(headers);
    expect(region.languageCode).toBe("pt");
    expect(region.toggleLabel).toBe("PORTUGUÊS");
    expect(region.isEnglishDefault).toBe(false);
    expect(region.culturalPromptGuidance).toContain("gambiarra");
  });

  it("detects Eastern Europe / Russia from x-vercel-ip-country RU", () => {
    const headers = new Headers({ "x-vercel-ip-country": "RU" });
    const region = resolveGlobalRegion(headers);
    expect(region.languageCode).toBe("ru");
    expect(region.toggleLabel).toBe("РУССКИЙ");
    expect(region.isEnglishDefault).toBe(false);
  });

  it("detects Telangana / Hyderabad from IN with region TG", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "IN",
      "x-vercel-ip-country-region": "TG",
    });
    const region = resolveGlobalRegion(headers);
    expect(region.languageCode).toBe("te");
    expect(region.toggleLabel).toBe("TELUGLISH");
    expect(region.isEnglishDefault).toBe(false);
    expect(region.culturalPromptGuidance).toContain("Ameerpet");
  });

  it("detects Tamil Nadu from IN with region TN", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "IN",
      "x-vercel-ip-country-region": "TN",
    });
    const region = resolveGlobalRegion(headers);
    expect(region.languageCode).toBe("ta");
    expect(region.toggleLabel).toBe("TANGLISH");
    expect(region.isEnglishDefault).toBe(false);
    expect(region.culturalPromptGuidance).toContain("OMR");
  });

  it("detects Pan-India (Hinglish) from general IN", () => {
    const headers = new Headers({
      "x-vercel-ip-country": "IN",
      "x-vercel-ip-country-region": "DL",
    });
    const region = resolveGlobalRegion(headers);
    expect(region.languageCode).toBe("hi");
    expect(region.toggleLabel).toBe("HINGLISH");
    expect(region.isEnglishDefault).toBe(false);
    expect(region.culturalPromptGuidance).toContain("3 LPA");
  });

  it("supports explicit query / override parameter", () => {
    const region = resolveGlobalRegion(null, "mexico");
    expect(region.languageCode).toBe("es");
    expect(region.toggleLabel).toBe("ESPAÑOL");
  });
});
