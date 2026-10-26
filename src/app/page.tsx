import React from "react";
import LandingExperience from "@/components/landing/LandingExperience";
import { PREPARED_TOURIST_VS_PETR } from "@/lib/demo/prepared-battles";
import { defaultBattleStore } from "@/lib/storage/battle-store";

export default async function Home() {
  const recentBattles = (await defaultBattleStore.listRecent?.(6)) ?? [];
  return (
    <LandingExperience
      demo={PREPARED_TOURIST_VS_PETR}
      recentBattles={recentBattles}
    />
  );
}
