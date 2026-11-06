import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCanonicalBattleUrl,
  getCardUrl,
  copyText,
  shareBattle,
  type CardFormat,
} from "@/lib/share/client";

describe("share client helpers", () => {
  describe("getCanonicalBattleUrl", () => {
    it("handles origin without trailing slash", () => {
      expect(getCanonicalBattleUrl("https://trashtalk.dev", "cf-123")).toBe(
        "https://trashtalk.dev/battle/cf-123"
      );
    });

    it("strips trailing slash from origin", () => {
      expect(getCanonicalBattleUrl("https://trashtalk.dev/", "cf-123")).toBe(
        "https://trashtalk.dev/battle/cf-123"
      );
      expect(getCanonicalBattleUrl("https://trashtalk.dev///", "cf-123")).toBe(
        "https://trashtalk.dev/battle/cf-123"
      );
    });

    it("handles empty origin as relative path", () => {
      expect(getCanonicalBattleUrl("", "cf-123")).toBe("/battle/cf-123");
    });

    it("encodes special characters in battle id", () => {
      expect(getCanonicalBattleUrl("https://trashtalk.dev", "user:1 vs user:2")).toBe(
        "https://trashtalk.dev/battle/user%3A1%20vs%20user%3A2"
      );
    });
  });

  describe("getCardUrl", () => {
    it("generates correct card URL for each format", () => {
      const formats: CardFormat[] = ["og", "square", "story"];
      for (const format of formats) {
        expect(getCardUrl("cf-sample-1", format)).toBe(
          `/api/og?id=cf-sample-1&format=${format}`
        );
      }
    });

    it("appends download parameter when download is true", () => {
      expect(getCardUrl("cf-sample-1", "og", true)).toBe(
        "/api/og?id=cf-sample-1&format=og&download=true"
      );
    });

    it("omits download parameter when download is false or undefined", () => {
      expect(getCardUrl("cf-sample-1", "og", false)).toBe(
        "/api/og?id=cf-sample-1&format=og"
      );
      expect(getCardUrl("cf-sample-1", "og")).toBe(
        "/api/og?id=cf-sample-1&format=og"
      );
    });

    it("encodes special characters in id", () => {
      expect(getCardUrl("a/b?c", "square")).toBe(
        "/api/og?id=a%2Fb%3Fc&format=square"
      );
    });
  });

  describe("copyText", () => {
    const originalNavigator = globalThis.navigator;

    afterEach(() => {
      Object.defineProperty(globalThis, "navigator", {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
      vi.restoreAllMocks();
    });

    it("successfully writes text to clipboard", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, "navigator", {
        value: {
          clipboard: { writeText: writeTextMock },
        },
        configurable: true,
        writable: true,
      });

      await expect(copyText("https://trashtalk.dev/battle/123")).resolves.toBeUndefined();
      expect(writeTextMock).toHaveBeenCalledWith("https://trashtalk.dev/battle/123");
    });

    it("propagates clipboard rejection", async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error("Permission denied"));
      Object.defineProperty(globalThis, "navigator", {
        value: {
          clipboard: { writeText: writeTextMock },
        },
        configurable: true,
        writable: true,
      });

      await expect(copyText("test")).rejects.toThrow("Permission denied");
    });

    it("rejects if clipboard API is unavailable", async () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {},
        configurable: true,
        writable: true,
      });

      await expect(copyText("test")).rejects.toThrow(/clipboard/i);
    });
  });

  describe("shareBattle", () => {
    const originalNavigator = globalThis.navigator;

    afterEach(() => {
      Object.defineProperty(globalThis, "navigator", {
        value: originalNavigator,
        configurable: true,
        writable: true,
      });
      vi.restoreAllMocks();
    });

    it("returns 'unsupported' when navigator.share is not available", async () => {
      Object.defineProperty(globalThis, "navigator", {
        value: {},
        configurable: true,
        writable: true,
      });

      const result = await shareBattle({
        title: "Match",
        text: "Roast",
        url: "https://trashtalk.dev/battle/1",
      });
      expect(result).toBe("unsupported");
    });

    it("returns 'shared' on successful native share", async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, "navigator", {
        value: { share: shareMock },
        configurable: true,
        writable: true,
      });

      const payload = {
        title: "Match",
        text: "Roast",
        url: "https://trashtalk.dev/battle/1",
      };
      const result = await shareBattle(payload);
      expect(result).toBe("shared");
      expect(shareMock).toHaveBeenCalledWith(payload);
    });

    it("returns 'cancelled' when share throws AbortError", async () => {
      const abortError = new Error("Share canceled");
      abortError.name = "AbortError";
      const shareMock = vi.fn().mockRejectedValue(abortError);

      Object.defineProperty(globalThis, "navigator", {
        value: { share: shareMock },
        configurable: true,
        writable: true,
      });

      const result = await shareBattle({
        title: "Match",
        text: "Roast",
        url: "https://trashtalk.dev/battle/1",
      });
      expect(result).toBe("cancelled");
    });

    it("propagates unexpected native share errors", async () => {
      const fatalError = new Error("Internal system error");
      fatalError.name = "NotAllowedError";
      const shareMock = vi.fn().mockRejectedValue(fatalError);

      Object.defineProperty(globalThis, "navigator", {
        value: { share: shareMock },
        configurable: true,
        writable: true,
      });

      await expect(
        shareBattle({
          title: "Match",
          text: "Roast",
          url: "https://trashtalk.dev/battle/1",
        })
      ).rejects.toThrow("Internal system error");
    });
  });
});
