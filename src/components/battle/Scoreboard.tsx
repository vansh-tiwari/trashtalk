"use client";

import React from "react";
import type { BattleViewModel } from "@/lib/battle/presentation";
import OdometerValue from "@/components/motion/OdometerValue";
import { formatNum } from "@/lib/battle/formatters";

export interface ScoreboardProps {
  vm: BattleViewModel;
}

export default function Scoreboard({ vm }: ScoreboardProps) {
  const isP1Winner =
    !vm.isMirrorMatch && vm.outcome === "win" && vm.winnerHandle === vm.p1.handle;
  const isP2Winner =
    !vm.isMirrorMatch && vm.outcome === "win" && vm.winnerHandle === vm.p2.handle;
  const isDraw = vm.outcome === "draw";

  const scrollToVerdict = () => {
    const verdictEl = document.getElementById("match-verdict") || document.querySelector(".vband");
    if (verdictEl) {
      verdictEl.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="split-hero-stage select-none" aria-label="Scoreboard">
      {/* Top Half: Player 1 (Left: Info, Right: Giant Score) */}
      <div className="split-top-row">
        <div className="split-p1-info" data-testid="player1-panel">
          <div className="flex items-center gap-3">
            <span className="split-k">PLAYER 01</span>
            {isP1Winner && (
              <span className="tagw-leading" data-testid="winner-stamp">
                LEADING {vm.margin > 0 ? `+${vm.margin}` : ""}
              </span>
            )}
            {isDraw && <span className="tagw-leading">TIED</span>}
          </div>
          <h1
            className={`split-nm ${isP2Winner ? "out" : ""}`}
            title={vm.p1.handle}
          >
            <span className="sl">{vm.p1.handle}</span>
          </h1>
          <div className="split-meta">
            {vm.p1.rank ? <span className="split-bd">{vm.p1.rank}</span> : null}
            <span className="split-rating">
              {vm.p1.rating ? (
                <>
                  <strong className="split-rating-num">{formatNum(vm.p1.rating)}</strong>
                  <span className="split-rating-lbl"> rating</span>
                  {vm.p1.maxRating && vm.p1.maxRating !== vm.p1.rating ? (
                    <span className="split-rating-peak"> (peak {formatNum(vm.p1.maxRating)})</span>
                  ) : null}
                </>
              ) : (
                <span className="split-rating-text">{vm.p1.subtitle}</span>
              )}
            </span>
          </div>
        </div>

        <div className="split-p1-score" data-testid="scoreboard-p1-score">
          <div className="split-num">
            <OdometerValue
              value={vm.p1.score}
              ariaLabel={`@${vm.p1.handle} score: ${vm.p1.score}`}
            />
          </div>
          <div className="split-k">PTS</div>
        </div>
      </div>

      {/* Center: Full-Width Slanted White Strip */}
      <div
        className="split-white-strip"
        data-testid="scoreboard-clash-slab"
        onClick={scrollToVerdict}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            scrollToVerdict();
          }
        }}
        title="Click to view match verdict & breakdown"
        aria-label="View match verdict and breakdown"
      >
        <div className="split-white-strip-inner">
          <span className="split-strip-label">
            THE ARENA
            <span className="sr-only"> / @{vm.p1.handle} vs @{vm.p2.handle}</span>
          </span>
          <span className="split-strip-vs" data-testid="scoreboard-vs-slab">
            V S
          </span>
          <span className="split-strip-label">HEAD TO HEAD</span>
        </div>
      </div>

      {/* Bottom Half: Player 2 (Left: Giant Score, Right: Info) */}
      <div className="split-bottom-row">
        <div className="split-p2-score" data-testid="scoreboard-p2-score">
          <div className="split-num">
            <OdometerValue
              value={vm.p2.score}
              ariaLabel={`@${vm.p2.handle} score: ${vm.p2.score}`}
            />
          </div>
          <div className="split-k">PTS</div>
        </div>

        <div className="split-p2-info" data-testid="player2-panel">
          <div className="flex items-center justify-end gap-3">
            {isP2Winner && (
              <span className="tagw-leading" data-testid="winner-stamp">
                LEADING {vm.margin > 0 ? `+${vm.margin}` : ""}
              </span>
            )}
            {isDraw && <span className="tagw-leading">TIED</span>}
            <span className="split-k">PLAYER 02</span>
          </div>
          <h1
            className={`split-nm ${isP1Winner ? "out" : ""}`}
            title={vm.p2.handle}
          >
            <span className="sl">{vm.p2.handle}</span>
          </h1>
          <div className="split-meta">
            <span className="split-rating">
              {vm.p2.rating ? (
                <>
                  <strong className="split-rating-num">{formatNum(vm.p2.rating)}</strong>
                  <span className="split-rating-lbl"> rating</span>
                  {vm.p2.maxRating && vm.p2.maxRating !== vm.p2.rating ? (
                    <span className="split-rating-peak"> (peak {formatNum(vm.p2.maxRating)})</span>
                  ) : null}
                </>
              ) : (
                <span className="split-rating-text">{vm.p2.subtitle}</span>
              )}
            </span>
            {vm.p2.rank ? (
              <span className="split-bd" style={{ marginLeft: "10px", marginRight: 0 }}>
                {vm.p2.rank}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
