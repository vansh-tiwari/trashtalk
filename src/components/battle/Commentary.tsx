import React from "react";
import { BattleViewModel } from "@/lib/battle/presentation";
import { Sparkles, Terminal } from "lucide-react";

interface CommentaryProps {
  vm: BattleViewModel;
}

export default function Commentary({ vm }: CommentaryProps) {
  const {
    punchline,
    headToHeadRoast,
    player1Roast,
    player2Roast,
    commentarySource,
    persona,
    p1,
    p2,
  } = vm;

  const personaShortLabels: Record<string, string> = {
    savage_dev: "Savage",
    silicon_valley_vc: "VC",
    ufc_announcer: "Fight Hype",
    hype_man: "Hype-Man",
  };

  const personaLabel = personaShortLabels[persona] || persona.replace("_", " ");

  return (
    <section aria-labelledby="commentary-heading" className="bg-surface border border-rule rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-rule">
        <h2
          id="commentary-heading"
          className="font-display font-bold text-xl sm:text-2xl text-ink uppercase tracking-tight"
        >
          Match Commentary
        </h2>

        <div className="flex items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold border ${
              commentarySource === "ai"
                ? "bg-player1/5 text-player1 border-player1/20"
                : "bg-canvas text-muted border-rule"
            }`}
          >
            {commentarySource === "ai" ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-player1" aria-hidden="true" />
                <span>Gemini 3.5 • {personaLabel}</span>
              </>
            ) : (
              <>
                <Terminal className="w-3.5 h-3.5 text-muted" aria-hidden="true" />
                <span>Local • {personaLabel}</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Main Head-to-Head Roast Quote */}
      <blockquote className="bg-canvas border-l-4 border-l-ink p-4 sm:p-5 rounded-r-lg">
        <p className="text-sm sm:text-base text-ink italic leading-relaxed font-sans">
          &ldquo;{headToHeadRoast}&rdquo;
        </p>
      </blockquote>

      {/* Direct Player Roasts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* Player 1 Direct Roast */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-canvas border border-rule border-l-4 border-l-player1 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-player1 block">
            @{p1.handle}
          </span>
          <p className="text-xs sm:text-sm text-ink/90 leading-relaxed">
            {player1Roast}
          </p>
        </div>

        {/* Player 2 Direct Roast */}
        <div className="p-3.5 sm:p-4 rounded-lg bg-canvas border border-rule border-l-4 border-l-player2 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-player2 block">
            @{p2.handle}
          </span>
          <p className="text-xs sm:text-sm text-ink/90 leading-relaxed">
            {player2Roast}
          </p>
        </div>
      </div>

      {/* Punchline Callout */}
      {punchline && (
        <div className="p-3 rounded-lg bg-canvas border border-rule text-center">
          <span className="text-xs sm:text-sm font-semibold text-ink">
            ⚡ {punchline}
          </span>
        </div>
      )}
    </section>
  );
}
