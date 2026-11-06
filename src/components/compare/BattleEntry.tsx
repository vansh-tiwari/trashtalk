"use client";

import React from "react";
import type { Platform } from "@/lib/platforms/contracts";
import type { RoastPersona } from "@/lib/ai/schemas";
import { isBattleEnabled } from "@/lib/platforms/registry";
import CompareForm from "./CompareForm";
import PlatformAvailability from "../platforms/PlatformAvailability";

export interface BattleEntryProps {
  platform: Platform;
  initialU1?: string;
  initialU2?: string;
  initialPersona?: RoastPersona;
  mode?: "battle" | "mirror";
  onPlatformChange?: (platform: Platform) => void;
  onCreated?: (battleId: string) => void;
  className?: string;
}

export default function BattleEntry({
  platform,
  initialU1,
  initialU2,
  initialPersona,
  mode = "battle",
  onPlatformChange,
  onCreated,
  className = "",
}: BattleEntryProps) {
  if (!isBattleEnabled(platform)) {
    return (
      <PlatformAvailability
        platform={platform}
        onChooseCodeforces={() => onPlatformChange?.("codeforces")}
        className={className}
      />
    );
  }

  return (
    <CompareForm
      platform={platform}
      initialU1={initialU1}
      initialU2={initialU2}
      initialPersona={initialPersona}
      mode={mode}
      onPlatformChange={onPlatformChange}
      onCreated={onCreated}
      className={className}
    />
  );
}
