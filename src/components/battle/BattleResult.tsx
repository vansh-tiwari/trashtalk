"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import { toBattleViewModel } from "@/lib/battle/presentation";
import { buildBattleCopy } from "@/lib/battle/copy";
import MatchHeader from "@/components/battle/MatchHeader";
import Scoreboard from "@/components/battle/Scoreboard";
import RoastMoment from "@/components/battle/RoastMoment";
import MetricComparison from "@/components/battle/MetricComparison";
import RadarComparison from "@/components/battle/RadarComparison";
import ScoreBreakdown from "@/components/battle/ScoreBreakdown";
import RatingHistoryChart from "@/components/battle/RatingHistoryChart";
import ActivityHeatmap from "@/components/battle/ActivityHeatmap";
import GithubStackSummary from "@/components/battle/GithubStackSummary";
import GithubShowcase from "@/components/battle/GithubShowcase";
import ProblemExplorer from "@/components/problems/ProblemExplorer";
import CompareForm from "@/components/compare/CompareForm";
import ShareDialog from "@/components/share/ShareDialog";
import { getCardUrl, copyText, shareBattle } from "@/lib/share/client";
import type { CardFormat } from "@/lib/share/card-model";
import type { RoastPersona } from "@/lib/ai/schemas";

export interface BattleResultProps {
  snapshot: BattleSnapshot;
}

export default function BattleResult({ snapshot }: BattleResultProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<CardFormat>("og");
  const [copied, setCopied] = useState(false);

  const vm = toBattleViewModel(snapshot);
  const copy = buildBattleCopy(snapshot);
  const persona: RoastPersona = (snapshot.persona as RoastPersona) || "savage_dev";

  const isP1Winner =
    vm.hasAuthoritativeStamp && !vm.isMirrorMatch && vm.outcome === "win" && vm.winnerHandle === vm.p1.handle;
  const isP2Winner =
    vm.hasAuthoritativeStamp && !vm.isMirrorMatch && vm.outcome === "win" && vm.winnerHandle === vm.p2.handle;
  const isDraw = vm.outcome === "draw";

  const rematchParams = new URLSearchParams({
    u1: snapshot.player1.handle,
    u2: snapshot.player2.handle,
    platform: snapshot.platform,
  });
  const rematchHref = `/battle?${rematchParams.toString()}`;

  // Build the verdict banner headline
  let verdictText = `${vm.p1.handle} vs ${vm.p2.handle}`;
  if (vm.isMirrorMatch) {
    verdictText = `${vm.p1.handle} faces their toughest rival: themselves.`;
  } else if (vm.outcome === "win" && vm.winnerHandle) {
    const winner = vm.winnerHandle;
    const loser = winner === vm.p1.handle ? vm.p2.handle : vm.p1.handle;
    verdictText = `${winner} wins. ${loser} has the better README tho.`;
  } else if (vm.outcome === "draw") {
    verdictText = "Same score. Twice the ego.";
  } else if (vm.outcome === "insufficient_data") {
    verdictText = "not enough data. Not enough receipts. No victory lap.";
  }

  const downloadUrl = getCardUrl(snapshot.id, selectedFormat, true);

  const handleCopyLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/battle/${snapshot.id}`;
    try {
      await copyText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // quiet fallback
    }
  };

  const handleGroupChatShare = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/battle/${snapshot.id}`;
    await shareBattle({
      title: "TrashTalk Battle",
      text: `@${snapshot.player1.handle} vs @${snapshot.player2.handle} on TrashTalk: "${copy.roastText}"`,
      url,
    });
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* 1. Full-Screen Split Horizontal Hero (.split-hero-stage) */}
      <Scoreboard vm={vm} />

      {/* 2. Full-Bleed Punch-Red Verdict Banner (.vband) */}
      <section className="vband w-full select-none" aria-label="Battle verdict">
        <div className="w">
          <div className="mono">
            Verdict
          </div>
          <div className="big">
            <span className="sr-only">{verdictText}</span>
            <span aria-hidden="true">
              {verdictText.split(" ").map((word, idx) => (
                <React.Fragment key={`${word}-${idx}`}>
                  <span
                    className="wd"
                    style={{ animationDelay: `${(0.36 + idx * 0.06).toFixed(2)}s` }}
                  >
                    {word}
                  </span>{" "}
                </React.Fragment>
              ))}
            </span>
          </div>
        </div>
      </section>

      {/* 3. Main Result Content (.w) */}
      <div className="w">
        {/* The Roast */}
        <RoastMoment
          copy={copy}
          persona={persona}
          rematchHref={rematchHref}
          p1Handle={snapshot.player1.handle}
          p2Handle={snapshot.player2.handle}
        />

        {/* Head to Head (5 Axes Paired Bars + Radar Chart) */}
        <section className="sec2 select-none" aria-label="Head to Head Breakdown" style={{ paddingTop: "48px" }}>
          <div className="sh2">
            <h2>Head to head</h2>
            <span>5 axes</span>
          </div>
          <div className="g2b">
            <MetricComparison vm={vm} />
            <RadarComparison
              axes1={snapshot.player1.score.axes}
              axes2={snapshot.player2.score.axes}
              p1Handle={snapshot.player1.handle}
              p2Handle={snapshot.player2.handle}
              platform={snapshot.platform}
              p1Score={snapshot.player1.score.total}
              p2Score={snapshot.player2.score.total}
            />
          </div>
          <ScoreBreakdown
            p1Score={snapshot.player1.score}
            p2Score={snapshot.player2.score}
            p1Handle={snapshot.player1.handle}
            p2Handle={snapshot.player2.handle}
            outcome={snapshot.verdict.outcome}
            winnerHandle={snapshot.verdict.winnerHandle}
            margin={snapshot.verdict.margin}
            platform={snapshot.platform}
          />
        </section>

        {/* Form Guide (Activity Heatmap + Rating Chart / Stack Summary) */}
        <section className="sec2 select-none" aria-label="Form Guide" style={{ paddingTop: "48px" }}>
          <div className="sh2">
            <h2>Form guide</h2>
            <span>
              {snapshot.platform === "github"
                ? "Shipping activity · Tech stack"
                : "Last 10 contests · 26 weeks"}
            </span>
          </div>
          <div className="g2b">
            {snapshot.platform === "github" ? (
              <GithubStackSummary snapshot={snapshot} />
            ) : (
              <RatingHistoryChart
                p1Handle={snapshot.player1.handle}
                p2Handle={snapshot.player2.handle}
                p1Rating={snapshot.player1.score.metrics?.rating}
                p2Rating={snapshot.player2.score.metrics?.rating}
              />
            )}
            <ActivityHeatmap
              p1Handle={snapshot.player1.handle}
              p2Handle={snapshot.player2.handle}
              p1TotalSolves={snapshot.player1.score.metrics?.solvedCount}
              p2TotalSolves={snapshot.player2.score.metrics?.solvedCount}
              p1Activity={snapshot.player1.activityLevels}
              p2Activity={snapshot.player2.activityLevels}
              unitLabel={snapshot.platform === "github" ? "repos" : "solves"}
            />
          </div>
        </section>

        {/* Platform-Specific Explorer: GithubShowcase for GitHub, ProblemExplorer for CP */}
        {snapshot.platform === "github" ? (
          <GithubShowcase snapshot={snapshot} />
        ) : (
          <ProblemExplorer
            overlap={snapshot.overlap}
            p1Handle={snapshot.player1.handle}
            p2Handle={snapshot.player2.handle}
            platform={snapshot.platform}
          />
        )}

        {snapshot.coverageNote && (
          <div className="py-4 text-center text-xs text-muted">
            <span>{snapshot.coverageNote}</span>
          </div>
        )}
      </div>

      {/* 4. Dedicated In-Page Share Arena (.dk.shs) */}
      <section id="share-arena" className="dk shs" style={{ marginTop: "96px" }}>
        <div className="w">
          <div className="shg">
            <div className="shl">
              <div className="mono">Share</div>
              <h2>Send it to them.</h2>
              <p>group chat’s waiting. Pick a format. One tap and it’s in the group chat.</p>

              {/* Format Switcher */}
              <div className="fmt" role="tablist" aria-label="Share card formats">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedFormat === "og"}
                  className={selectedFormat === "og" ? "active" : ""}
                  onClick={() => setSelectedFormat("og")}
                >
                  Link preview
                  <small>1200×630</small>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedFormat === "story"}
                  className={selectedFormat === "story" ? "active" : ""}
                  onClick={() => setSelectedFormat("story")}
                >
                  Story
                  <small>1080×1920</small>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedFormat === "square"}
                  className={selectedFormat === "square" ? "active" : ""}
                  onClick={() => setSelectedFormat("square")}
                >
                  Square
                  <small>1080×1080</small>
                </button>
              </div>

              {/* Share Action Buttons */}
              <div className="acts">
                <a
                  href={downloadUrl}
                  download
                  className="fb y"
                >
                  Download PNG
                </a>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="fb gw"
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={handleGroupChatShare}
                  className="fb gw"
                >
                  Send to group chat
                </button>
              </div>
            </div>

            {/* 3D Card Preview with Confetti */}
            <div className="shr2">
              <div
                className="cv"
                style={{
                  width:
                    selectedFormat === "story"
                      ? "280px"
                      : selectedFormat === "square"
                      ? "380px"
                      : "min(640px, 100%)",
                }}
              >
                {selectedFormat === "story" ? (
                  <div className="st9">
                    <div className="oh">
                      <b className="big">TrashTalk</b>
                      <span>Codeforces · Story</span>
                    </div>
                    <div className="st-body">
                      {/* Player 1 Block */}
                      <div className="st-player">
                        <div className="st-meta-top">
                          {isP1Winner && <span className="ow">Winner</span>}
                          {isDraw && <span className="ow">Tie</span>}
                          <span className="or2">
                            {vm.p1.rank || "Competitor"} · {vm.p1.rating || 0}
                            {vm.p1.maxRating && vm.p1.maxRating !== vm.p1.rating ? ` (peak ${vm.p1.maxRating})` : ""}
                          </span>
                        </div>
                        <div className="st-handle-score">
                          <b className={`big ${isP2Winner ? "out" : ""}`}>
                            {vm.p1.handle.toUpperCase()}
                          </b>
                          <span className="st-num big">{vm.p1.score}</span>
                        </div>
                      </div>

                      {/* Central VS Divider */}
                      <div className="st-divider">
                        <span>VS</span>
                      </div>

                      {/* Player 2 Block */}
                      <div className="st-player">
                        <div className="st-meta-top">
                          {isP2Winner && <span className="ow">Winner</span>}
                          {isDraw && <span className="ow">Tie</span>}
                          <span className="or2">
                            {vm.p2.rank || "Competitor"} · {vm.p2.rating || 0}
                            {vm.p2.maxRating && vm.p2.maxRating !== vm.p2.rating ? ` (peak ${vm.p2.maxRating})` : ""}
                          </span>
                        </div>
                        <div className="st-handle-score">
                          <b className={`big ${isP1Winner ? "out" : ""}`}>
                            {vm.p2.handle.toUpperCase()}
                          </b>
                          <span className="st-num big">{vm.p2.score}</span>
                        </div>
                      </div>
                    </div>

                    <div className="oq">
                      <span>“{copy.outcomeLine}”</span>
                      <small>trashtalk.dev</small>
                    </div>
                    <div className="of big">
                      <span>Think you can beat them?</span>
                      <span>trashtalk.dev</span>
                    </div>
                  </div>
                ) : selectedFormat === "square" ? (
                  <div className="sq9">
                    <div className="oh">
                      <b className="big">TrashTalk</b>
                      <span>Codeforces · Square</span>
                    </div>
                    <div className="sq-arena">
                      {/* Player 1 Column */}
                      <div className="sq-player">
                        {isP1Winner && <span className="ow">Winner</span>}
                        {isDraw && <span className="ow">Tie</span>}
                        <b className={`big ${isP2Winner ? "out" : ""}`}>
                          {vm.p1.handle.toUpperCase()}
                        </b>
                        <span className="or2">
                          {vm.p1.rank || "Competitor"} · {vm.p1.rating || 0}
                          {vm.p1.maxRating && vm.p1.maxRating !== vm.p1.rating ? ` (peak ${vm.p1.maxRating})` : ""}
                        </span>
                        <div className="sq-num big">{vm.p1.score}</div>
                      </div>

                      {/* Central VS Badge */}
                      <div className="sq-divider">
                        <span>VS</span>
                      </div>

                      {/* Player 2 Column */}
                      <div className="sq-player r">
                        {isP2Winner && <span className="ow">Winner</span>}
                        {isDraw && <span className="ow">Tie</span>}
                        <b className={`big ${isP1Winner ? "out" : ""}`}>
                          {vm.p2.handle.toUpperCase()}
                        </b>
                        <span className="or2">
                          {vm.p2.rank || "Competitor"} · {vm.p2.rating || 0}
                          {vm.p2.maxRating && vm.p2.maxRating !== vm.p2.rating ? ` (peak ${vm.p2.maxRating})` : ""}
                        </span>
                        <div className="sq-num big">{vm.p2.score}</div>
                      </div>
                    </div>

                    <div className="oq">
                      <span>“{copy.outcomeLine}”</span>
                      <small>on {isP1Winner ? vm.p2.handle : vm.p1.handle}</small>
                    </div>
                    <div className="of big">
                      <span>Think you can beat them?</span>
                      <span>trashtalk.dev</span>
                    </div>
                  </div>
                ) : (
                  <div className="og2">
                    <div className="oh">
                      <b className="big">TrashTalk</b>
                      <span>Codeforces · Battle result</span>
                    </div>
                    <div className="om">
                      <div className="op">
                        {isP1Winner && <span className="ow">Winner</span>}
                        {isDraw && <span className="ow">Tie</span>}
                        <b className={`big ${isP2Winner ? "out" : ""}`}>
                          {vm.p1.handle.toUpperCase()}
                        </b>
                        <span className="or2">
                          {vm.p1.rank || "Competitor"} · {vm.p1.rating || 0}
                          {vm.p1.maxRating && vm.p1.maxRating !== vm.p1.rating ? ` (peak ${vm.p1.maxRating})` : ""}
                        </span>
                      </div>
                      <div className="os big">
                        {vm.p1.score}–{vm.p2.score}
                      </div>
                      <div className="op r">
                        {isP2Winner && <span className="ow">Winner</span>}
                        {isDraw && <span className="ow">Tie</span>}
                        <b className={`big ${isP1Winner ? "out" : ""}`}>
                          {vm.p2.handle.toUpperCase()}
                        </b>
                        <span className="or2">
                          {vm.p2.rank || "Competitor"} · {vm.p2.rating || 0}
                          {vm.p2.maxRating && vm.p2.maxRating !== vm.p2.rating ? ` (peak ${vm.p2.maxRating})` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="oq">
                      <span>“{copy.outcomeLine}”</span>
                      <small>on {isP1Winner ? vm.p2.handle : vm.p1.handle}</small>
                    </div>
                    <div className="of big">
                      <span>Think you can beat them?</span>
                      <span>trashtalk.dev</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confetti Particles */}
              <div className="cf" aria-hidden="true">
                <i style={{ "--x": "-242px", "--yu": "-127px", "--yd": "250px", "--r": "-33deg", "--c": "#FF5A52", width: "13px", height: "27px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "267px", "--yu": "-194px", "--yd": "353px", "--r": "385deg", "--c": "#FF5A52", width: "7px", height: "11px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "276px", "--yu": "-164px", "--yd": "286px", "--r": "624deg", "--c": "#B5B8BF", width: "8px", height: "8px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "-225px", "--yu": "-310px", "--yd": "225px", "--r": "520deg", "--c": "#D82A26", width: "13px", height: "20px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "167px", "--yu": "-167px", "--yd": "224px", "--r": "282deg", "--c": "#FFFFFF", width: "10px", height: "17px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "226px", "--yu": "-295px", "--yd": "264px", "--r": "-123deg", "--c": "#B5B8BF", width: "13px", height: "15px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-240px", "--yu": "-306px", "--yd": "254px", "--r": "104deg", "--c": "#FF5A52", width: "9px", height: "14px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "-238px", "--yu": "-123px", "--yd": "234px", "--r": "-454deg", "--c": "#D82A26", width: "12px", height: "21px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "-244px", "--yu": "-170px", "--yd": "261px", "--r": "-621deg", "--c": "#FF5A52", width: "13px", height: "19px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "375px", "--yu": "-195px", "--yd": "235px", "--r": "498deg", "--c": "#FFFFFF", width: "7px", height: "10px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "70px", "--yu": "-203px", "--yd": "156px", "--r": "-647deg", "--c": "#FFFFFF", width: "11px", height: "13px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "-11px", "--yu": "-332px", "--yd": "371px", "--r": "-663deg", "--c": "#FFFFFF", width: "12px", height: "16px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "25px", "--yu": "-168px", "--yd": "222px", "--r": "297deg", "--c": "#FFFFFF", width: "7px", height: "18px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "59px", "--yu": "-332px", "--yd": "149px", "--r": "-278deg", "--c": "#FFFFFF", width: "11px", height: "21px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "-118px", "--yu": "-229px", "--yd": "185px", "--r": "523deg", "--c": "#FFFFFF", width: "12px", height: "16px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "-374px", "--yu": "-266px", "--yd": "287px", "--r": "323deg", "--c": "#FFFFFF", width: "9px", height: "11px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "365px", "--yu": "-212px", "--yd": "346px", "--r": "15deg", "--c": "#B5B8BF", width: "7px", height: "17px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "65px", "--yu": "-127px", "--yd": "180px", "--r": "-312deg", "--c": "#FFFFFF", width: "11px", height: "25px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-8px", "--yu": "-130px", "--yd": "332px", "--r": "577deg", "--c": "#D82A26", width: "6px", height: "11px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-228px", "--yu": "-218px", "--yd": "165px", "--r": "-365deg", "--c": "#B5B8BF", width: "6px", height: "13px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "46px", "--yu": "-147px", "--yd": "236px", "--r": "-104deg", "--c": "#D82A26", width: "8px", height: "11px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-100px", "--yu": "-171px", "--yd": "379px", "--r": "512deg", "--c": "#B5B8BF", width: "9px", height: "17px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "8px", "--yu": "-142px", "--yd": "347px", "--r": "15deg", "--c": "#FF5A52", width: "10px", height: "25px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-284px", "--yu": "-139px", "--yd": "380px", "--r": "30deg", "--c": "#FFFFFF", width: "6px", height: "13px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-185px", "--yu": "-337px", "--yd": "359px", "--r": "286deg", "--c": "#FFFFFF", width: "7px", height: "11px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-342px", "--yu": "-334px", "--yd": "332px", "--r": "-491deg", "--c": "#FFFFFF", width: "13px", height: "28px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "5px", "--yu": "-252px", "--yd": "155px", "--r": "-241deg", "--c": "#D82A26", width: "8px", height: "8px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "183px", "--yu": "-252px", "--yd": "297px", "--r": "639deg", "--c": "#FF5A52", width: "6px", height: "9px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "-194px", "--yu": "-316px", "--yd": "192px", "--r": "-578deg", "--c": "#D82A26", width: "12px", height: "26px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "52px", "--yu": "-181px", "--yd": "330px", "--r": "-275deg", "--c": "#FFFFFF", width: "7px", height: "10px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "289px", "--yu": "-245px", "--yd": "172px", "--r": "346deg", "--c": "#D82A26", width: "8px", height: "12px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "117px", "--yu": "-200px", "--yd": "200px", "--r": "-278deg", "--c": "#B5B8BF", width: "13px", height: "26px", borderRadius: "1px" } as React.CSSProperties} />
                <i style={{ "--x": "-211px", "--yu": "-180px", "--yd": "186px", "--r": "339deg", "--c": "#B5B8BF", width: "13px", height: "26px", borderRadius: "50%" } as React.CSSProperties} />
                <i style={{ "--x": "78px", "--yu": "-181px", "--yd": "167px", "--r": "-624deg", "--c": "#FF5A52", width: "8px", height: "12px", borderRadius: "1px" } as React.CSSProperties} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Rematch CTA (.fin) */}
      <section className="fin">
        <div className="w">
          <div className="big">Who’s next?</div>
          <p>Free. No sign-up. Ten seconds to a roast.</p>
          <div className="w-full max-w-[760px] mx-auto">
            <CompareForm platform="codeforces" />
          </div>
        </div>
      </section>

      {/* 6. Accessible Share Modal */}
      <ShareDialog
        snapshot={snapshot}
        open={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
