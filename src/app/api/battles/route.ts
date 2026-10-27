import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { executeBattleFlow, getBattleSnapshot } from "@/lib/battle/service";
import { CreateBattleRequestSchema } from "@/lib/battle/validation";
import { defaultIdempotencyStore } from "@/lib/storage/battle-store";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => null);

    if (!rawBody || typeof rawBody !== "object") {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const parseResult = CreateBattleRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Validation failed.";
      return NextResponse.json(
        { error: `Invalid battle request: ${firstError}` },
        { status: 400 }
      );
    }

    const { u1, u2, persona, platform } = parseResult.data;

    // Compute request digest and identify idempotency key
    const canonicalPayload = JSON.stringify({
      u1: u1.toLowerCase(),
      u2: u2.toLowerCase(),
      persona,
      platform,
    });
    const requestDigest = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
    const clientKey = req.headers.get("idempotency-key");
    const idempotencyKey = clientKey || `auto:${requestDigest}`;

    // Atomically reserve attempt in idempotency store
    const outcome = await defaultIdempotencyStore.reserve(idempotencyKey, requestDigest);

    if (outcome === "mismatch") {
      return NextResponse.json(
        { error: "Idempotency key reused with conflicting request parameters." },
        { status: 409 }
      );
    }

    if (outcome === "in_flight") {
      return NextResponse.json(
        { error: "Battle generation already in progress for this request. Please wait." },
        { status: 429, headers: { "Retry-After": "5" } }
      );
    }

    if (outcome === "completed") {
      const record = await defaultIdempotencyStore.get(idempotencyKey);
      if (record?.snapshotId) {
        const existing = await getBattleSnapshot(record.snapshotId);
        if (existing) {
          return NextResponse.json(
            { id: existing.id, snapshot: existing },
            { status: 200, headers: { "X-Idempotent-Replay": "true" } }
          );
        }
      }
      // If snapshot was lost, fall through to re-generate
    }

    try {
      const snapshot = await executeBattleFlow({
        u1,
        u2,
        persona,
        platform,
      });

      await defaultIdempotencyStore.complete(idempotencyKey, snapshot.id);
      return NextResponse.json({ id: snapshot.id, snapshot }, { status: 201 });
    } catch (flowErr) {
      const msg = flowErr instanceof Error ? flowErr.message : "Generation failed";
      await defaultIdempotencyStore.fail(idempotencyKey, msg);
      throw flowErr;
    }
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : "Failed to generate battle.";
    const lower = rawMessage.toLowerCase();

    let status = 500;
    let userFacingMessage = rawMessage;

    if (lower.includes("not found") || lower.includes("no such handle") || lower.includes("does not exist")) {
      status = 404;
      userFacingMessage = rawMessage;
    } else if (lower.includes("rate limit") || lower.includes("call limit") || lower.includes("quota exhausted") || rawMessage.includes("429") || rawMessage.includes("403")) {
      status = 429;
      userFacingMessage = lower.includes("github")
        ? "GitHub API rate limit reached (60 requests/hour unauthenticated). Add a GITHUB_TOKEN to .env.local to increase the quota to 5,000/hr."
        : rawMessage;
    } else if (
      lower.includes("fetch failed") ||
      lower.includes("enotfound") ||
      lower.includes("econnrefused") ||
      lower.includes("etimedout") ||
      lower.includes("network") ||
      lower.includes("operation not permitted") ||
      lower.includes("certificate")
    ) {
      status = 503;
      userFacingMessage = `Network error: Unable to reach ${rawMessage.includes("GitHub") ? "GitHub" : "platform"} API. The local dev process cannot make outbound internet connections. Run "npm run dev" directly in your local terminal.`;
    }

    return NextResponse.json({ error: userFacingMessage }, { status });
  }
}
