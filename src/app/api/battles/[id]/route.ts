import { NextRequest, NextResponse } from "next/server";
import { getBattleSnapshot } from "@/lib/battle/service";
import { parseBattleId } from "@/lib/battle/validation";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing battle id" }, { status: 400 });
  }

  let safeId: string;
  try {
    safeId = parseBattleId(id);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid battle ID format." },
      { status: 400 }
    );
  }

  const snapshot = await getBattleSnapshot(safeId, undefined, req.headers);

  if (!snapshot) {
    return NextResponse.json({ error: "Battle snapshot not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot, {
    status: 200,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
    },
  });
}
