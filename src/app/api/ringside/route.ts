import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  resolveVisitorGeoContext,
  hashVisitorIp,
  defaultRingsideHistoryStore,
} from "@/lib/ringside/context";
import { BattleIdSchema, HandleSchema } from "@/lib/battle/validation";

const RecordBoutSchema = z.object({
  id: BattleIdSchema,
  platform: z.enum(["codeforces", "leetcode", "codechef", "github"]),
  u1: HandleSchema,
  u2: HandleSchema,
  winnerHandle: z.string().nullable().default(null),
  margin: z.number().int().min(0).max(100).default(0),
  p1Score: z.number().int().min(0).max(100).optional(),
  p2Score: z.number().int().min(0).max(100).optional(),
  createdAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientTimezone = searchParams.get("tz");
  const clientLang = searchParams.get("lang");
  const overrideLang = searchParams.get("dialect");

  const geo = resolveVisitorGeoContext({
    headers: req.headers,
    clientTimezone,
    clientLang,
    overrideLang,
  });

  const ipHash = hashVisitorIp(req.headers);
  const recentBouts = defaultRingsideHistoryStore.getRecentBouts(ipHash);

  return NextResponse.json(
    {
      geo,
      recentBouts,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json().catch(() => null);
    const parsed = RecordBoutSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid bout summary payload." },
        { status: 400 }
      );
    }

    const ipHash = hashVisitorIp(req.headers);
    const bout = {
      ...parsed.data,
      createdAt: parsed.data.createdAt || new Date().toISOString(),
    };
    const recentBouts = defaultRingsideHistoryStore.recordBout(ipHash, bout);

    return NextResponse.json({ recentBouts }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to record recent bout." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const ipHash = hashVisitorIp(req.headers);
  defaultRingsideHistoryStore.clearBouts(ipHash);
  return NextResponse.json({ recentBouts: [] }, { status: 200 });
}
