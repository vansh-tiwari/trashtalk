"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BattleEntry from "@/components/compare/BattleEntry";
import type { Platform } from "@/lib/platforms/contracts";
import { parsePlatform } from "@/lib/platforms/registry";
import type { RoastPersona } from "@/lib/ai/schemas";
import { ArrowRight } from "lucide-react";

function SoloRoastContent() {
  const searchParams = useSearchParams();
  const u = searchParams.get("u") || searchParams.get("handle") || "";
  const persona = (searchParams.get("persona") as RoastPersona) || "savage_dev";
  const initialPlatform = parsePlatform(searchParams.get("platform"));
  const [platform, setPlatform] = useState<Platform>(initialPlatform);

  useEffect(() => {
    const p = parsePlatform(searchParams.get("platform"));
    setPlatform(p);
  }, [searchParams]);

  return (
    <div className="space-y-6 sm:space-y-8 py-4 sm:py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-rule">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-xs text-muted font-medium">mirror match</span>
          <Link
            href="/battle"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink transition-colors min-h-[44px]"
          >
            <span>two handles? enter the arena</span>
            <ArrowRight className="w-3 h-3 text-muted" aria-hidden="true" />
          </Link>
        </div>

        <h1 className="font-sans font-semibold text-2xl sm:text-3xl text-ink tracking-tight">
          roast yourself.
        </h1>

        <p className="text-xs sm:text-sm text-muted">
          one handle against its own record. honest receipts, no promised solo engine.
        </p>
      </div>

      {/* Entry Component in Mirror Mode */}
      <BattleEntry
        platform={platform}
        onPlatformChange={setPlatform}
        initialU1={u}
        initialU2={u}
        initialPersona={persona}
        mode="mirror"
      />
    </div>
  );
}

export default function SoloRoastPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs text-muted">
          loading mirror match...
        </div>
      }
    >
      <SoloRoastContent />
    </Suspense>
  );
}
