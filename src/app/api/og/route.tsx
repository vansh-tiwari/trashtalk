import { NextRequest } from "next/server";
import { getBattleSnapshot } from "@/lib/battle/service";
import { parseBattleId } from "@/lib/battle/validation";
import { type CardFormat, renderBattleCard } from "@/lib/share/card-renderer";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const rawFormat = searchParams.get("format") || "og";
  const download = searchParams.get("download") === "true";

  const format: CardFormat =
    rawFormat === "story" ? "story" : rawFormat === "square" ? "square" : "og";

  if (!id) {
    return new Response("Missing battle id", { status: 400 });
  }

  let safeId: string;
  try {
    safeId = parseBattleId(id);
  } catch (err) {
    return new Response(err instanceof Error ? err.message : "Invalid battle ID", { status: 400 });
  }

  const snapshot = await getBattleSnapshot(safeId, undefined, req.headers);
  if (!snapshot) {
    return new Response("Battle snapshot not found", { status: 404 });
  }

  const canonicalOrigin =
    process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin || "https://trashtalk.vanshtiwari.dev";

  return renderBattleCard(snapshot, format, { download, canonicalOrigin });
}
