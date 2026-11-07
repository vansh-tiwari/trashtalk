import React, { cache } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { getBattleSnapshot } from "@/lib/battle/service";
import BattleResult from "@/components/battle/BattleResult";
import { buildBattleCopy } from "@/lib/battle/copy";

async function getSafeHeaders(): Promise<Headers | null> {
  try {
    return await headers();
  } catch {
    return null;
  }
}

/**
 * React cache deduplicates the snapshot fetch between generateMetadata and SavedBattlePage
 * during the same SSR request lifecycle.
 */
const getCachedBattleSnapshot = cache(async (id: string, headerList: Headers | null) => {
  return await getBattleSnapshot(id, undefined, headerList);
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const headerList = await getSafeHeaders();
  const snapshot = await getCachedBattleSnapshot(id, headerList);

  if (!snapshot) {
    return {
      title: "match not found | trashtalk.",
    };
  }

  const copy = buildBattleCopy(snapshot);
  const title = `${snapshot.player1.handle} vs ${snapshot.player2.handle} — trashtalk.`;
  const description = `${copy.outcomeLine} · ${copy.roastText}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: `/api/og?id=${snapshot.id}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og?id=${snapshot.id}`],
    },
  };
}

export default async function SavedBattlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const headerList = await getSafeHeaders();
  const snapshot = await getCachedBattleSnapshot(id, headerList);

  if (!snapshot) {
    notFound();
  }

  return <BattleResult snapshot={snapshot} />;
}
