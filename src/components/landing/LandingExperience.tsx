"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import type { Platform } from "@/lib/platforms/contracts";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import {
  PREPARED_TOURIST_VS_PETR,
  PREPARED_NEETCODE_VS_LARRYNY,
  PREPARED_TORVALDS_VS_ANTIREZ,
  PREPARED_AKULSAREEN_VS_GENNADY,
} from "@/lib/demo/prepared-battles";
import { toBattleViewModel } from "@/lib/battle/presentation";
import { buildBattleCopy } from "@/lib/battle/copy";
import CompareForm from "@/components/compare/CompareForm";
import MarqueeTicker from "@/components/motion/MarqueeTicker";
import OdometerValue from "@/components/motion/OdometerValue";
import MetricComparison from "@/components/battle/MetricComparison";
import RadarComparison from "@/components/battle/RadarComparison";
import ScoreBreakdown from "@/components/battle/ScoreBreakdown";
import SocialShareStrip from "@/components/share/SocialShareStrip";
import {
  getCanonicalBattleUrl,
  getCardUrl,
  buildSocialShareText,
  getTwitterShareUrl,
  getWhatsAppShareUrl,
  shareOrDownloadCardImage,
  copyText,
} from "@/lib/share/client";
import type { CardFormat } from "@/lib/share/card-model";

export interface LandingExperienceProps {
  demo: BattleSnapshot;
  recentBattles?: BattleSnapshot[];
  initialPlatform?: Platform;
}

const SAMPLE_ARENA_BATTLES: {
  key: Platform;
  label: string;
  matchupLabel: string;
  snapshot: BattleSnapshot;
}[] = [
  {
    key: "codeforces",
    label: "Codeforces",
    matchupLabel: "tourist vs Petr",
    snapshot: PREPARED_TOURIST_VS_PETR,
  },
  {
    key: "leetcode",
    label: "LeetCode",
    matchupLabel: "neetcode vs larryny",
    snapshot: PREPARED_NEETCODE_VS_LARRYNY,
  },
  {
    key: "github",
    label: "GitHub",
    matchupLabel: "torvalds vs antirez",
    snapshot: PREPARED_TORVALDS_VS_ANTIREZ,
  },
  {
    key: "codechef",
    label: "CodeChef",
    matchupLabel: "akulsareen vs gennady",
    snapshot: PREPARED_AKULSAREEN_VS_GENNADY,
  },
];

const SAMPLE_STEP_ROASTS: string[][] = [
  ["400", "Two-Sum", "variants.", "Zero", "indexes."],
  ["50", "public", "repos.", "Zero", "stars."],
  ["Hardstuck", "cyan", "since", "2022.", "Rough."],
  ["10", "days", "on", "Problem", "B.", "Still", "TLE."],
];

export default function LandingExperience({
  demo,
  initialPlatform = "codeforces",
}: LandingExperienceProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(initialPlatform);
  const [previewPlatform, setPreviewPlatform] = useState<Platform>(initialPlatform);
  const [selectedFormat, setSelectedFormat] = useState<CardFormat>("og");
  const [stepRoastIdx, setStepRoastIdx] = useState<number>(0);
  const [instaReady, setInstaReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const handlePlatformChange = (p: Platform) => {
    setSelectedPlatform(p);
    setPreviewPlatform(p);
  };

  const activeSampleMeta =
    SAMPLE_ARENA_BATTLES.find((b) => b.key === previewPlatform) ||
    SAMPLE_ARENA_BATTLES[0];
  const activeSample = activeSampleMeta.snapshot || demo || PREPARED_TOURIST_VS_PETR;

  const vm = toBattleViewModel(activeSample);
  const copy = buildBattleCopy(activeSample);
  const isP1Winner =
    vm.hasAuthoritativeStamp &&
    !vm.isMirrorMatch &&
    vm.outcome === "win" &&
    vm.winnerHandle === vm.p1.handle;
  const isP2Winner =
    vm.hasAuthoritativeStamp &&
    !vm.isMirrorMatch &&
    vm.outcome === "win" &&
    vm.winnerHandle === vm.p2.handle;
  const isDraw = vm.outcome === "draw";
  const activeStepWords = SAMPLE_STEP_ROASTS[stepRoastIdx % SAMPLE_STEP_ROASTS.length];

  const sampleBattleUrl = getCanonicalBattleUrl(origin, activeSample.id);
  const sampleSocialText = buildSocialShareText({
    p1Handle: activeSample.player1.handle,
    p2Handle: activeSample.player2.handle,
    winnerHandle: activeSample.verdict.winnerHandle,
    loserHandle: activeSample.verdict.loserHandle,
    margin: activeSample.verdict.margin,
    roastText: copy.roastText,
    url: sampleBattleUrl,
  });
  const sampleTwitterUrl = getTwitterShareUrl(sampleSocialText);
  const sampleWhatsappUrl = getWhatsAppShareUrl(sampleSocialText);
  const sampleDownloadUrl = getCardUrl(activeSample.id, selectedFormat, true);

  const handleSampleCopyLink = async () => {
    const liveOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "");
    const liveUrl = getCanonicalBattleUrl(liveOrigin, activeSample.id);
    try {
      await copyText(liveUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleSampleInstagram = async () => {
    const targetFormat = selectedFormat === "og" ? "story" : selectedFormat;
    if (selectedFormat === "og") {
      setSelectedFormat("story");
    }
    try {
      await shareOrDownloadCardImage({
        id: activeSample.id,
        format: targetFormat,
        title: "TrashTalk Battle Receipt",
        caption: sampleSocialText,
        url: sampleBattleUrl,
      });
      setInstaReady(true);
      setTimeout(() => setInstaReady(false), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="w-full">
      {/* 1. Dark Arena Hero (.dk .hero2) */}
      <section className="dk hero2 pb-10 sm:pb-16 lg:pb-[72px]">
        <div className="w">
          <div className="hh">
            <div>
              <div className="mono" style={{ marginBottom: "14px" }}>
                The developer battle arena
              </div>
              <h1 className="h1">
                Where developer profiles go to get roasted.
              </h1>
            </div>

            <div>
              <CompareForm
                platform={selectedPlatform}
                onPlatformChange={handlePlatformChange}
              />
            </div>
          </div>

          {/* Animated Full-Width Diagonal Stage (.stg) — No Rounds */}
          <div className="stg" aria-label="Live battle showcase" role="region">
            {/* Matchup 1: You vs Your Rival */}
            <div className="gp" style={{ "--g": 0 } as React.CSSProperties}>
              <div className="mono">Codeforces · Drop your handles &amp; get the receipt</div>
              <div>
                <div className="nm big">
                  <span className="sl">YOU</span>
                </div>
                <div className="rt">
                  <span className="mono">Rating</span>
                  <OdometerValue value={1850} />
                </div>
              </div>
              <div className="vsb">
                <i aria-hidden="true" />
                <b className="big">VS</b>
              </div>
              <div className="r">
                <div className="nm big out">
                  <span className="sl">YOUR_RIVAL</span>
                </div>
                <div className="rt">
                  <span className="mono">Rating</span>
                  <OdometerValue value={1640} />
                </div>
              </div>
            </div>

            {/* Matchup 2: Tourist vs Petr */}
            <div className="gp" style={{ "--g": 1 } as React.CSSProperties}>
              <div className="mono">Codeforces · The GOAT showdown</div>
              <div>
                <div className="nm big">
                  <span className="sl">TOURIST</span>
                </div>
                <div className="rt">
                  <span className="mono">Rating</span>
                  <OdometerValue value={3840} />
                </div>
              </div>
              <div className="vsb">
                <i aria-hidden="true" />
                <b className="big">VS</b>
              </div>
              <div className="r">
                <div className="nm big out">
                  <span className="sl">PETR</span>
                </div>
                <div className="rt">
                  <span className="mono">Rating</span>
                  <OdometerValue value={3300} />
                </div>
              </div>
            </div>

            {/* Matchup 3: You vs Your Friend */}
            <div className="gp" style={{ "--g": 2 } as React.CSSProperties}>
              <div className="mono">Codeforces · Group chat bragging rights</div>
              <div>
                <div className="nm big">
                  <span className="sl">YOU</span>
                </div>
                <div className="rt">
                  <span className="mono">Rating</span>
                  <OdometerValue value={1590} />
                </div>
              </div>
              <div className="vsb">
                <i aria-hidden="true" />
                <b className="big">VS</b>
              </div>
              <div className="r">
                <div className="nm big out">
                  <span className="sl">YOUR_FRIEND</span>
                </div>
                <div className="rt">
                  <span className="mono">Rating</span>
                  <OdometerValue value={1560} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Punch-Red Roast Marquee (.tk) */}
      <MarqueeTicker />

      {/* 3. Three Taps to a Roast Process (.sec2 .g3) */}
      <section
        id="how-it-works"
        className="w sec2 pt-12 pb-12 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-[88px]"
      >
        <div className="sh2">
          <h2>Three taps to a roast</h2>
          <span>No sign-up</span>
        </div>

        <div className="g3">
          {/* Step 01 */}
          <div className="stp">
            <div className="n">01</div>
            <div className="vz">
              <div
                style={{
                  font: "500 16px 'IBM Plex Mono', monospace",
                  background: "#fff",
                  padding: "14px 16px",
                  width: "100%",
                }}
              >
                <span className="tp">neo_coder vs bitwise_bella</span>
              </div>
              <span className="fb press" style={{ minHeight: "44px", fontSize: "18px" }}>
                Fight
              </span>
            </div>
            <h3>Drop two handles</h3>
            <div className="mut">Codeforces, LeetCode, CodeChef, or GitHub.</div>
          </div>

          {/* Step 02 */}
          <div
            className="stp cursor-pointer"
            onClick={() => setStepRoastIdx((prev) => (prev + 1) % SAMPLE_STEP_ROASTS.length)}
            title="Click to cycle roast sample"
          >
            <div className="n">02</div>
            <div className="vz">
              <div
                key={stepRoastIdx}
                style={{
                  font: "800 26px/1.15 'Hanken Grotesk', sans-serif",
                  letterSpacing: "-.03em",
                  textAlign: "center",
                }}
              >
                {activeStepWords.map((w, idx) => (
                  <React.Fragment key={`${w}-${idx}`}>
                    <span className={`wd ${idx < 3 ? "mk" : ""}`}>{w}</span>{" "}
                  </React.Fragment>
                ))}
              </div>
            </div>
            <h3>Get roasted</h3>
            <div className="mut">Short. Brutal. Accurate.</div>
          </div>

          {/* Step 03 */}
          <div className="stp">
            <div className="n">03</div>
            <div className="vz" style={{ padding: "16px" }}>
              <div className="og2" style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
                <div className="oh">
                  <b className="big">TrashTalk</b>
                  <span>Codeforces · Battle result</span>
                </div>
                <div className="om">
                  <div className="op">
                    <span className="ow">Winner</span>
                    <b className="big">NEO_CODER</b>
                    <span className="or2">Expert · 1742</span>
                  </div>
                  <div className="os big">72–64</div>
                  <div className="op r">
                    <b className="big out">BITWISE_BELLA</b>
                    <span className="or2">Specialist · 1583</span>
                  </div>
                </div>
                <div className="oq">
                  <span>“400 Two-Sum variants. Zero indexes.”</span>
                </div>
              </div>
            </div>
            <h3>Send it to them</h3>
            <div className="mut">One tap. The group chat does the rest.</div>
          </div>
        </div>
      </section>

      {/* 4. Live Battle Arena Preview (Real 5-Axis Head-to-Head + Radar + Score Breakdown) */}
      <section
        id="arena-preview"
        className="w sec2 select-none pt-4 pb-12 sm:pb-20 lg:pb-24"
        aria-label="Sample Battle Arena Breakdown"
      >
        <div className="sh2 flex-wrap">
          <div>
            <div className="mono" style={{ marginBottom: "6px" }}>
              Sample battle · {activeSampleMeta.matchupLabel}
            </div>
            <h2>Inside the arena</h2>
          </div>

          <div className="seg2 flex-wrap" role="tablist" aria-label="Sample platform battles">
            {SAMPLE_ARENA_BATTLES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={previewPlatform === item.key}
                className={previewPlatform === item.key ? "on" : ""}
                onClick={() => setPreviewPlatform(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="g2b">
          <MetricComparison vm={vm} />
          <RadarComparison
            axes1={activeSample.player1.score.axes}
            axes2={activeSample.player2.score.axes}
            p1Handle={activeSample.player1.handle}
            p2Handle={activeSample.player2.handle}
            platform={activeSample.platform}
            p1Score={activeSample.player1.score.total}
            p2Score={activeSample.player2.score.total}
          />
        </div>

        <ScoreBreakdown
          p1Score={activeSample.player1.score}
          p2Score={activeSample.player2.score}
          p1Handle={activeSample.player1.handle}
          p2Handle={activeSample.player2.handle}
          outcome={activeSample.verdict.outcome}
          winnerHandle={activeSample.verdict.winnerHandle}
          margin={activeSample.verdict.margin}
          platform={activeSample.platform}
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-rule">
          <div className="mono">
            Verdict: {copy.outcomeLine} — “{copy.roastText}”
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link href="/roast" className="fb g flex-1 sm:flex-initial">
              Solo profile roaster
            </Link>
            <Link href={`/battle/${activeSample.id}`} className="fb o flex-1 sm:flex-initial">
              Open full battle
            </Link>
          </div>
        </div>
      </section>

      {/* 5. In-Page Share Card Preview (.dk.shs) */}
      <section className="dk shs">
        <div className="w">
          <div className="shg">
            <div className="shl">
              <div className="mono">Share</div>
              <h2>Send it to them.</h2>
              <p>Group chat’s waiting. Pick a format. One tap and it’s in the group chat.</p>

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

              <div className="acts flex flex-wrap items-center gap-3">
                <SocialShareStrip
                  twitterUrl={sampleTwitterUrl}
                  whatsappUrl={sampleWhatsappUrl}
                  onInstagramShare={handleSampleInstagram}
                  onCopyLink={handleSampleCopyLink}
                  copied={copied}
                  instaReady={instaReady}
                  theme="dark"
                  onChannelSelect={(ch) => {
                    if (ch === "instagram") setSelectedFormat("story");
                    else if (ch === "x") setSelectedFormat("og");
                  }}
                />
                <a
                  href={sampleDownloadUrl}
                  download
                  className="fb gw w-full sm:w-auto"
                  style={{ minHeight: "48px" }}
                >
                  Download PNG
                </a>
              </div>
            </div>

            <div className="shr2">
              <div
                className="cv"
                style={{
                  width:
                    selectedFormat === "story"
                      ? "min(280px, 100%)"
                      : selectedFormat === "square"
                      ? "min(380px, 100%)"
                      : "min(640px, 100%)",
                }}
              >
                {selectedFormat === "story" ? (
                  <div className="st9">
                    <div className="oh">
                      <b className="big">TrashTalk</b>
                      <span>{activeSampleMeta.label} · Story</span>
                    </div>
                    <div className="st-body">
                      <div className="st-player">
                        <div className="st-meta-top">
                          {isP1Winner && <span className="ow">Winner</span>}
                          {isDraw && <span className="ow">Tie</span>}
                          <span className="or2">
                            {vm.p1.rank || "Competitor"} · {vm.p1.rating || 0}
                          </span>
                        </div>
                        <div className="st-handle-score">
                          <b className={`big ${isP2Winner ? "out" : ""}`}>
                            {vm.p1.handle.toUpperCase()}
                          </b>
                          <span className="st-num big">{vm.p1.score}</span>
                        </div>
                      </div>

                      <div className="st-divider">
                        <span>VS</span>
                      </div>

                      <div className="st-player">
                        <div className="st-meta-top">
                          {isP2Winner && <span className="ow">Winner</span>}
                          {isDraw && <span className="ow">Tie</span>}
                          <span className="or2">
                            {vm.p2.rank || "Competitor"} · {vm.p2.rating || 0}
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
                      <small>trashtalk.vercel.app</small>
                    </div>
                    <div className="of big">
                      <span>Think you can beat them?</span>
                      <span>trashtalk.vercel.app</span>
                    </div>
                  </div>
                ) : selectedFormat === "square" ? (
                  <div className="sq9">
                    <div className="oh">
                      <b className="big">TrashTalk</b>
                      <span>{activeSampleMeta.label} · Square</span>
                    </div>
                    <div className="sq-arena">
                      <div className="sq-player">
                        {isP1Winner && <span className="ow">Winner</span>}
                        {isDraw && <span className="ow">Tie</span>}
                        <b className={`big ${isP2Winner ? "out" : ""}`}>
                          {vm.p1.handle.toUpperCase()}
                        </b>
                        <span className="or2">
                          {vm.p1.rank || "Competitor"} · {vm.p1.rating || 0}
                        </span>
                        <div className="sq-num big">{vm.p1.score}</div>
                      </div>

                      <div className="sq-divider">
                        <span>VS</span>
                      </div>

                      <div className="sq-player r">
                        {isP2Winner && <span className="ow">Winner</span>}
                        {isDraw && <span className="ow">Tie</span>}
                        <b className={`big ${isP1Winner ? "out" : ""}`}>
                          {vm.p2.handle.toUpperCase()}
                        </b>
                        <span className="or2">
                          {vm.p2.rank || "Competitor"} · {vm.p2.rating || 0}
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
                      <span>trashtalk.vercel.app</span>
                    </div>
                  </div>
                ) : (
                  <div className="og2">
                    <div className="oh">
                      <b className="big">TrashTalk</b>
                      <span>{activeSampleMeta.label} · Battle result</span>
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
                        </span>
                      </div>
                    </div>
                    <div className="oq">
                      <span>“{copy.outcomeLine}”</span>
                      <small>on {isP1Winner ? vm.p2.handle : vm.p1.handle}</small>
                    </div>
                    <div className="of big">
                      <span>Think you can beat them?</span>
                      <span>trashtalk.vercel.app</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Who's Next Final CTA (.fin) */}
      <section className="fin">
        <div className="w">
          <div className="big">Who’s next?</div>
          <p>Free. No sign-up. Ten seconds to a roast.</p>
          <div className="w-full max-w-[760px] mx-auto">
            <CompareForm platform={selectedPlatform} idPrefix="footer-" />
          </div>
        </div>
      </section>
    </div>
  );
}
