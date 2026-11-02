import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { executeBattleFlow, getBattleSnapshot } from "@/lib/battle/service";
import { MemoryBattleStore } from "@/lib/storage/battle-store";
import { PREPARED_AKULSAREEN_VS_GENNADY } from "@/lib/demo/prepared-battles";
import { CreateBattleRequestSchema } from "@/lib/battle/validation";

const akulsareenHtml = fs.readFileSync(
  path.join(process.cwd(), "tests/fixtures/codechef/akulsareen.html"),
  "utf-8"
);

describe("CodeChef Battle Lifecycle & Storage Integration", () => {
  let mockStore: MemoryBattleStore;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStore = new MemoryBattleStore();
  });

  it("validates 'codechef' as a valid platform in CreateBattleRequestSchema", () => {
    const valid = CreateBattleRequestSchema.safeParse({
      u1: "akulsareen",
      u2: "gennady",
      platform: "codechef",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.platform).toBe("codechef");
    }
  });

  it("successfully retrieves the prepared offline CodeChef demo without network calls", async () => {
    const snapshot = await getBattleSnapshot("cc-akulsareen-vs-gennady-legendary", mockStore);
    expect(snapshot).toBeDefined();
    expect(snapshot?.platform).toBe("codechef");
    expect(snapshot?.player1.handle).toBe("akulsareen");
    expect(snapshot?.player2.handle).toBe("gennady");
    expect(snapshot?.verdict.outcome).toBe("win");
    expect(snapshot?.verdict.winnerHandle).toBe("gennady");
  });

  it("executes full battle flow for CodeChef and persists snapshot to store", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (url) => {
      const urlStr = url.toString();
      if (urlStr.includes("akulsareen")) {
        return {
          ok: true,
          status: 200,
          text: async () => akulsareenHtml,
        } as Response;
      }
      // Return a 7-star fixture for gennady
      const gennadyHtml = akulsareenHtml
        .replace(/akulsareen/g, "gennady")
        .replace(/5★/g, "7★")
        .replace(/2103/g, "2950")
        .replace(/2260/g, "3100");
      return {
        ok: true,
        status: 200,
        text: async () => gennadyHtml,
      } as Response;
    });

    const snapshot = await executeBattleFlow({
      u1: "akulsareen",
      u2: "gennady",
      platform: "codechef",
      store: mockStore,
    });

    expect(snapshot).toBeDefined();
    expect(snapshot.platform).toBe("codechef");
    expect(snapshot.id).toMatch(/^cc-akulsareen-vs-gennady-/);
    expect(snapshot.player1.handle).toBe("akulsareen");
    expect(snapshot.player2.handle).toBe("gennady");
    expect(snapshot.verdict.scoringVersion).toBe("2.0.0");

    const saved = await mockStore.get(snapshot.id);
    expect(saved).toBeDefined();
    expect(saved?.id).toBe(snapshot.id);
  });
});
