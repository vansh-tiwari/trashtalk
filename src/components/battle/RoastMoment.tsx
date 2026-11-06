"use client";

import React from "react";
import Link from "next/link";
import type { BattleCopy } from "@/lib/battle/copy";
import type { RoastPersona } from "@/lib/ai/schemas";

export interface RoastMomentProps {
  copy: BattleCopy;
  persona?: RoastPersona;
  rematchHref: string;
  sceneKey?: string;
  p1Handle?: string;
  p2Handle?: string;
  p1Roast?: string;
  p2Roast?: string;
  languageToggle?: React.ReactNode;
  onPersonaChange?: (persona: RoastPersona) => void;
}

const PERSONA_CONFIG: Array<{ id: RoastPersona; label: string }> = [
  { id: "savage_dev", label: "savage dev" },
  { id: "silicon_valley_vc", label: "VC" },
  { id: "ufc_announcer", label: "UFC" },
  { id: "hype_man", label: "Hype-man" },
];

export default function RoastMoment({
  copy,
  persona = "savage_dev",
  rematchHref,
  p1Handle = "player1",
  p2Handle = "player2",
  p1Roast,
  p2Roast,
  languageToggle,
  onPersonaChange,
}: RoastMomentProps) {
  const isDraw =
    copy.outcomeLine.toLowerCase().includes("draw") ||
    copy.outcomeLine.toLowerCase().includes("0 points apart") ||
    copy.outcomeLine.toLowerCase().includes("mirror");
  const isP2Winner = copy.outcomeLine.toLowerCase().includes(`@${p2Handle.toLowerCase()}`);

  const winnerHandle = isP2Winner ? p2Handle : p1Handle;
  const loserHandle = isP2Winner ? p1Handle : p2Handle;

  // Single or two-statement roast from winner perspective roasting loser
  let unifiedRoast = "";
  if (isDraw) {
    unifiedRoast = copy.roastText || "Same score. Twice the ego.";
  } else if (copy.roastText.toLowerCase().includes(`@${loserHandle.toLowerCase()}`)) {
    unifiedRoast = copy.roastText;
  } else {
    unifiedRoast = `@${loserHandle}, legendary run, but the receipts on the scoreboard tell their own story. ${copy.roastText}`;
  }

  return (
    <section className="sec2 select-none" aria-label="The Roast" style={{ paddingTop: "48px" }}>
      {/* Section Header */}
      <div className="sh2 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-baseline gap-3">
          <h2>The roast</h2>
          <span className="mono text-xs opacity-75">{copy.outcomeLine}</span>
        </div>
        <span className="sr-only">savage dev</span>
        {languageToggle && <div>{languageToggle}</div>}
      </div>

      {/* Unified Single-Statement Roast */}
      <div className="roast-unified-block my-6 p-6 sm:p-8 bg-surface border-2 border-ink shadow-[4px_4px_0px_#111214]">
        <div className="flex items-center gap-2 mb-4">
          <i
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: isDraw ? "var(--bl)" : "var(--or)",
              display: "inline-block",
            }}
            aria-hidden="true"
          />
          <span className="mono text-xs font-bold uppercase tracking-wider text-muted">
            {isDraw ? "Even Match Roast" : `@${winnerHandle} on @${loserHandle}`}
          </span>
        </div>

        <p className="rl" style={{ fontSize: "clamp(24px, 3.2vw, 42px)", lineHeight: 1.15, fontWeight: 800 }}>
          <span className="sr-only">{unifiedRoast}</span>
          <span aria-hidden="true">
            {unifiedRoast.split(" ").map((word, i) => {
              const isKeyword = /^\d+|\b(rating|two-sum|index|champion|speed|gap|segment|dp|tree|points|pts|receipts|scoreboard|legendary)\b/i.test(word);
              const delay = (0.2 + i * 0.04).toFixed(2);
              return (
                <React.Fragment key={`${word}-${i}`}>
                  <span
                    className={`wd ${isKeyword ? "mk" : ""}`}
                    style={{ animationDelay: `${delay}s` }}
                  >
                    {word}
                  </span>{" "}
                </React.Fragment>
              );
            })}
          </span>
        </p>
      </div>

      {/* Rematch Action (.rx) */}
      <div className="rx" aria-label="Roast actions">
        <Link
          href={rematchHref}
          className="fb g"
          style={{
            border: "2px solid var(--ink)",
            background: "#fff",
            color: "var(--ink)",
            minHeight: "48px",
            padding: "0 18px",
            font: "700 17px 'Hanken Grotesk', sans-serif",
            textTransform: "none",
            letterSpacing: "normal",
          }}
        >
          run it back ↺
        </Link>
      </div>
    </section>
  );
}
