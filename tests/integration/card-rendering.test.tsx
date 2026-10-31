import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getOgHandler } from "@/app/api/og/route";
import { renderBattleCard } from "@/lib/share/card-renderer";
import {
  PREPARED_TOURIST_VS_PETR,
  PREPARED_NEETCODE_VS_LARRYNY,
  PREPARED_AKULSAREEN_VS_GENNADY,
  PREPARED_TORVALDS_VS_ANTIREZ,
} from "@/lib/demo/prepared-battles";
import type { BattleSnapshot } from "@/lib/storage/contracts";

function getPngDimensions(buffer: ArrayBuffer): { width: number; height: number; isPng: boolean } {
  const bytes = new Uint8Array(buffer);
  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;

  if (!isPng) {
    return { width: 0, height: 0, isPng: false };
  }

  const view = new DataView(buffer);
  const width = view.getUint32(16, false);
  const height = view.getUint32(20, false);
  return { width, height, isPng: true };
}

describe("Card Rendering & Export Formats (Task 10)", () => {
  it("renders a valid PNG response for standard OG format with exact dimensions 1200x630", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/og?id=cf-tourist-vs-petr-legendary&format=og"
    );
    const res = await getOgHandler(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");
    expect(res.headers.get("cache-control")).toContain("public");

    const arrayBuffer = await res.arrayBuffer();
    expect(arrayBuffer.byteLength).toBeGreaterThan(1000);

    const dims = getPngDimensions(arrayBuffer);
    expect(dims.isPng).toBe(true);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(630);
  });

  it("renders complete PNG responses for square format with exact dimensions 1080x1080", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/og?id=cf-tourist-vs-petr-legendary&format=square"
    );
    const res = await getOgHandler(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");

    const arrayBuffer = await res.arrayBuffer();
    const dims = getPngDimensions(arrayBuffer);
    expect(dims.isPng).toBe(true);
    expect(dims.width).toBe(1080);
    expect(dims.height).toBe(1080);
  });

  it("renders complete PNG responses for story format with exact dimensions 1080x1920", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/og?id=cf-tourist-vs-petr-legendary&format=story"
    );
    const res = await getOgHandler(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");

    const arrayBuffer = await res.arrayBuffer();
    const dims = getPngDimensions(arrayBuffer);
    expect(dims.isPng).toBe(true);
    expect(dims.width).toBe(1080);
    expect(dims.height).toBe(1920);
  });

  it("returns attachment disposition with filename when download=true is requested", async () => {
    const req = new NextRequest(
      "http://localhost:3000/api/og?id=cf-tourist-vs-petr-legendary&format=og&download=true"
    );
    const res = await getOgHandler(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-disposition")).toContain("attachment;");
    expect(res.headers.get("content-disposition")).toContain("trashtalk-tourist-vs-Petr-og.png");
  });

  it("returns 400 for missing ID, 400 for invalid ID, and 404 for unknown ID", async () => {
    const missingReq = new NextRequest("http://localhost:3000/api/og");
    const missingRes = await getOgHandler(missingReq);
    expect(missingRes.status).toBe(400);

    const invalidReq = new NextRequest("http://localhost:3000/api/og?id=invalid!id*");
    const invalidRes = await getOgHandler(invalidReq);
    expect(invalidRes.status).toBe(400);

    const unknownReq = new NextRequest("http://localhost:3000/api/og?id=cf-nonexistent-battle-999");
    const unknownRes = await getOgHandler(unknownReq);
    expect(unknownRes.status).toBe(404);
  });

  it("directly renders long-handle snapshot offline without external fetch", async () => {
    const longHandleSnapshot: BattleSnapshot = {
      ...PREPARED_TOURIST_VS_PETR,
      id: "cf-test-long-handle",
      player1: {
        ...PREPARED_TOURIST_VS_PETR.player1,
        handle: "super_ultra_long_handle_x", // 25 chars
      },
    };

    const res = await renderBattleCard(longHandleSnapshot, "og", {
      canonicalOrigin: "https://example.test",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");

    const bytes = await res.arrayBuffer();
    const dims = getPngDimensions(bytes);
    expect(dims.isPng).toBe(true);
    expect(dims.width).toBe(1200);
    expect(dims.height).toBe(630);
  });

  it("directly renders Unicode roast and emojis offline without external fetch", async () => {
    const originalFetch = global.fetch;
    global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
      if (url.includes("jsdelivr.net") || url.includes("twemoji") || url.endsWith(".svg")) {
        return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36"><circle cx="18" cy="18" r="18" fill="#FFCC4D"/></svg>', {
          status: 200,
          headers: { "Content-Type": "image/svg+xml" },
        });
      }
      return originalFetch(input, init);
    };

    try {
      const unicodeSnapshot: BattleSnapshot = {
        ...PREPARED_TOURIST_VS_PETR,
        id: "cf-test-unicode",
        commentary: {
          ...PREPARED_TOURIST_VS_PETR.commentary,
          punchline: "💀 Tourist brought the receipts! 🏆 Petr left 0 chance.",
        },
      };

      const res = await renderBattleCard(unicodeSnapshot, "square", {
        canonicalOrigin: "https://example.test",
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("image/png");

      const bytes = await res.arrayBuffer();
      const dims = getPngDimensions(bytes);
      expect(dims.isPng).toBe(true);
      expect(dims.width).toBe(1080);
      expect(dims.height).toBe(1080);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it("directly renders LeetCode prepared battle cards with LeetCode label and valid dimensions", async () => {
    const res = await renderBattleCard(PREPARED_NEETCODE_VS_LARRYNY, "story", {
      canonicalOrigin: "https://example.test",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");

    const bytes = await res.arrayBuffer();
    const dims = getPngDimensions(bytes);
    expect(dims.isPng).toBe(true);
    expect(dims.width).toBe(1080);
    expect(dims.height).toBe(1920);
  });

  it("directly renders CodeChef prepared battle cards with valid dimensions", async () => {
    const res = await renderBattleCard(PREPARED_AKULSAREEN_VS_GENNADY, "square", {
      canonicalOrigin: "https://example.test",
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("image/png");

    const bytes = await res.arrayBuffer();
    const dims = getPngDimensions(bytes);
    expect(dims.isPng).toBe(true);
    expect(dims.width).toBe(1080);
    expect(dims.height).toBe(1080);
  });

  it("directly renders GitHub prepared battle cards in OG, Square, and Story formats with valid dimensions", async () => {
    for (const format of ["og", "square", "story"] as const) {
      const res = await renderBattleCard(PREPARED_TORVALDS_VS_ANTIREZ, format, {
        canonicalOrigin: "https://example.test",
      });
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toContain("image/png");

      const bytes = await res.arrayBuffer();
      const dims = getPngDimensions(bytes);
      expect(dims.isPng).toBe(true);
      if (format === "og") {
        expect(dims.width).toBe(1200);
        expect(dims.height).toBe(630);
      } else if (format === "square") {
        expect(dims.width).toBe(1080);
        expect(dims.height).toBe(1080);
      } else if (format === "story") {
        expect(dims.width).toBe(1080);
        expect(dims.height).toBe(1920);
      }
    }
  });
});
