"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { Platform } from "@/lib/platforms/contracts";
import type { BattleSnapshot } from "@/lib/storage/contracts";
import CompareForm from "@/components/compare/CompareForm";
import MarqueeTicker from "@/components/motion/MarqueeTicker";
import OdometerValue from "@/components/motion/OdometerValue";

export interface LandingExperienceProps {
  demo: BattleSnapshot;
  recentBattles?: BattleSnapshot[];
  initialPlatform?: Platform;
}

export default function LandingExperience({
  demo,
  initialPlatform = "codeforces",
}: LandingExperienceProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>(initialPlatform);

  return (
    <div className="w-full">
      {/* 1. Dark Arena Hero (.dk .hero2) */}
      <section className="dk hero2" style={{ paddingBottom: "72px" }}>
        <div className="w">
          <div className="hh">
            <div>
              <div className="mono" style={{ marginBottom: "14px" }}>
                The developer battle arena
              </div>
              <h1 className="h1">
                Where developer profiles go to get roasted.
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-2 select-none">
                <span className="mono text-[11px] uppercase tracking-wider text-white/60 mr-1">
                  Quick Showdowns:
                </span>
                <Link
                  href="/battle/cf-tourist-vs-petr-legendary"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white/10 hover:bg-punch hover:text-white text-white/90 border border-white/20 transition-all rounded-none"
                >
                  tourist vs Petr
                </Link>
                <Link
                  href="/battle/lc-neetcode-vs-larryny-legendary"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white/10 hover:bg-punch hover:text-white text-white/90 border border-white/20 transition-all rounded-none"
                >
                  NeetCode vs LarryNY
                </Link>
                <Link
                  href="/battle/gh-torvalds-vs-antirez-legendary"
                  className="px-2.5 py-1 text-xs font-mono font-bold bg-white/10 hover:bg-punch hover:text-white text-white/90 border border-white/20 transition-all rounded-none"
                >
                  Torvalds vs Antirez
                </Link>
              </div>
            </div>

            <div>
              <CompareForm
                platform={selectedPlatform}
                onPlatformChange={setSelectedPlatform}
              />
            </div>
          </div>

          {/* Animated 3-Round Stage (.stg) */}
          <div className="stg" aria-label="Live battle showcase" role="region">
            {/* Round 01: You vs Your Rival */}
            <div className="gp" style={{ "--g": 0 } as React.CSSProperties}>
              <div className="mono">Round 01 · Codeforces · Drop your handles & get the receipt</div>
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

            {/* Round 02: Tourist vs Petr */}
            <div className="gp" style={{ "--g": 1 } as React.CSSProperties}>
              <div className="mono">Round 02 · Codeforces · The GOAT showdown</div>
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

            {/* Round 03: You vs Your Friend */}
            <div className="gp" style={{ "--g": 2 } as React.CSSProperties}>
              <div className="mono">Round 03 · Codeforces · Group chat bragging rights</div>
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
      <section id="how-it-works" className="w sec2" style={{ paddingTop: "96px" }}>
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
            <div className="mut">Codeforces, LeetCode or CodeChef.</div>
          </div>

          {/* Step 02 */}
          <div className="stp">
            <div className="n">02</div>
            <div className="vz">
              <div
                style={{
                  font: "800 26px/1.15 'Hanken Grotesk', sans-serif",
                  letterSpacing: "-.03em",
                  textAlign: "center",
                }}
              >
                <span className="wd mk">400</span> <span className="wd mk">Two-Sum</span>{" "}
                <span className="wd mk">variants.</span> <span className="wd">Zero</span>{" "}
                <span className="wd">indexes.</span>
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

      {/* 4. Who's Next Final CTA (.fin) */}
      <section className="fin">
        <div className="w">
          <div className="big">Who’s next?</div>
          <p>Free. No sign-up. Ten seconds to a roast.</p>
          <div className="w-full max-w-[760px] mx-auto">
            <CompareForm platform={selectedPlatform} />
          </div>
        </div>
      </section>
    </div>
  );
}
