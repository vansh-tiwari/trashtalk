"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BattleEntry from "@/components/compare/BattleEntry";
import { parsePlatform, type Platform } from "@/lib/platforms/registry";
import type { RoastPersona } from "@/lib/ai/schemas";
import { ArrowRight } from "lucide-react";

function BattleContent() {
  const searchParams = useSearchParams();
  const rawPlatform = searchParams.get("platform");
  const initialPlatform = parsePlatform(rawPlatform);

  const [platform, setPlatform] = useState<Platform>(initialPlatform);

  // Sync state if search params change
  useEffect(() => {
    setPlatform(parsePlatform(rawPlatform));
  }, [rawPlatform]);

  const u1 = searchParams.get("u1") || "";
  const u2 = searchParams.get("u2") || "";
  const persona = (searchParams.get("persona") as RoastPersona) || "savage_dev";

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-rule">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium">the arena</span>
          <Link
            href="/battle/cf-tourist-vs-petr-legendary"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors min-h-[44px]"
          >
            <span>tourist vs Petr demo</span>
            <ArrowRight className="w-3 h-3 text-muted" aria-hidden="true" />
          </Link>
        </div>

        <h1 className="font-sans font-semibold text-2xl sm:text-3xl text-ink tracking-tight">
          settle it.
        </h1>

        <p className="text-xs sm:text-sm text-muted">
          two handles. one roast. group chat material.
        </p>
      </div>

      {/* Entry Component (Platform-aware) */}
      <BattleEntry
        platform={platform}
        initialU1={u1}
        initialU2={u2}
        initialPersona={persona}
        mode="battle"
        onPlatformChange={(newPlatform) => setPlatform(newPlatform)}
      />
    </div>
  );
}

export default function BattlePage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-muted">
          loading arena...
        </div>
      }
    >
      <BattleContent />
    </Suspense>
  );
}
