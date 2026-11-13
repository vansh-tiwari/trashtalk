import React from "react";
import { ImageResponse } from "next/og";
import type { BattleSnapshot } from "../storage/contracts";
import type { Platform } from "../platforms/contracts";
import {
  type CardFormat,
  CARD_DIMENSIONS,
  buildBattleCardModel,
} from "./card-model";
import { getCardFonts } from "./fonts";
import { formatNum } from "../battle/formatters";

import { BRAND_COLORS } from "../platforms/visual-tokens";

export type { CardFormat } from "./card-model";

export interface RenderCardOptions {
  download?: boolean;
  canonicalOrigin?: string;
}

/**
 * Helper to adjust handle font size for long handles up to 24 characters
 */
function getHandleFontSize(handle: string, baseSize: number): number {
  if (handle.length > 20) return Math.round(baseSize * 0.60);
  if (handle.length > 15) return Math.round(baseSize * 0.75);
  if (handle.length > 11) return Math.round(baseSize * 0.88);
  return baseSize;
}

function getCardPlayerSubtitle(
  rank: string | undefined,
  metrics?: Record<string, number>,
  platform?: Platform,
  githubMeta?: { followers?: number; totalStars?: number }
): string {
  const rating = metrics?.rating;
  const peak = metrics?.maxRating;
  const solved = metrics?.solved;
  const safeRank = rank ? rank.replace(/(\d+)★/g, "$1-Star").replace(/★/g, " Star") : "Competitor";

  if (platform === "github") {
    const followers = githubMeta?.followers;
    const stars = githubMeta?.totalStars ?? rating;
    if (followers !== undefined && stars !== undefined) {
      return `${formatNum(followers)} followers · ${formatNum(stars)} stars`;
    }
    if (rating !== undefined && rating > 0) {
      return `${safeRank} · ${formatNum(rating)} stars`;
    }
    if (solved !== undefined && solved > 0) {
      return `${safeRank} · ${formatNum(solved)} repos`;
    }
    return safeRank;
  }

  if (rating !== undefined && rating > 0) {
    if (peak && peak > rating) {
      return `${safeRank} · ${formatNum(rating)} (peak ${formatNum(peak)})`;
    }
    return `${safeRank} · ${formatNum(rating)} rating`;
  }

  if (solved !== undefined && solved > 0) {
    return `${safeRank} · ${formatNum(solved)} solved`;
  }

  return safeRank;
}

function getCardMiniReceipts(snapshot: BattleSnapshot): Array<{ label: string; p1: string; p2: string }> {
  const isGithub = snapshot.platform === "github";
  const m1 = snapshot.player1.score.metrics;
  const m2 = snapshot.player2.score.metrics;
  if (!m1 || !m2) return [];

  if (isGithub) {
    return [
      { label: "TOTAL STARS", p1: `${formatNum(m1.rating || 0)} stars`, p2: `${formatNum(m2.rating || 0)} stars` },
      { label: "ORIGINAL REPOS", p1: `${m1.solvedCount || 0}`, p2: `${m2.solvedCount || 0}` },
      { label: "SHIPPING (90D)", p1: `${m1.recentAcceptedCount || 0}`, p2: `${m2.recentAcceptedCount || 0}` },
    ];
  }

  return [
    { label: "PEAK RATING", p1: `${formatNum(m1.maxRating || 0)}`, p2: `${formatNum(m2.maxRating || 0)}` },
    { label: "UNIQUE SOLVES", p1: `${formatNum(m1.solvedCount || 0)}`, p2: `${formatNum(m2.solvedCount || 0)}` },
    { label: "CURRENT RATING", p1: `${formatNum(m1.rating || 0)}`, p2: `${formatNum(m2.rating || 0)}` },
  ];
}

export async function renderBattleCard(
  snapshot: BattleSnapshot,
  format: CardFormat = "og",
  options: RenderCardOptions = {}
): Promise<ImageResponse> {
  const dimensions = CARD_DIMENSIONS[format] || CARD_DIMENSIONS.og;
  const { width, height } = dimensions;

  const origin = options.canonicalOrigin || "https://trashtalk.vercel.app";
  const model = buildBattleCardModel(snapshot, origin);
  const fonts = await getCardFonts();

  const isStory = format === "story";
  const isSquare = format === "square";

  const p1 = model.player1;
  const p2 = model.player2;
  const copy = model.copy;
  const killer = model.killerReceipt;
  const miniReceipts = getCardMiniReceipts(snapshot);

  const isDraw = snapshot.verdict.outcome === "draw" || snapshot.verdict.isMirrorMatch;
  const isP1Winner =
    snapshot.verdict.outcome === "win" &&
    snapshot.verdict.winnerHandle === p1.handle &&
    !snapshot.verdict.isMirrorMatch;
  const isP2Winner =
    snapshot.verdict.outcome === "win" &&
    snapshot.verdict.winnerHandle === p2.handle &&
    !snapshot.verdict.isMirrorMatch;

  const p1Rank = snapshot.player1.rank || (snapshot.platform === "github" ? "Developer" : "Competitor");
  const p2Rank = snapshot.player2.rank || (snapshot.platform === "github" ? "Developer" : "Competitor");
  const p1Subtitle = getCardPlayerSubtitle(
    p1Rank,
    snapshot.player1.score.metrics,
    snapshot.platform,
    snapshot.githubMetadata?.player1
  );
  const p2Subtitle = getCardPlayerSubtitle(
    p2Rank,
    snapshot.player2.score.metrics,
    snapshot.platform,
    snapshot.githubMetadata?.player2
  );

  const headers: Record<string, string> = {
    "Content-Type": "image/png",
    "Cache-Control": "public, max-age=86400, s-maxage=86400, immutable",
  };

  if (options.download) {
    const filename = `trashtalk-${p1.handle}-vs-${p2.handle}-${format}.png`;
    headers["Content-Disposition"] = `attachment; filename="${filename}"`;
  }

  // -----------------------------------------------------------------
  // FORMAT 1: STORY (1080 x 1920, 9:16 Vertical Editorial Clash Poster)
  // -----------------------------------------------------------------
  if (isStory) {
    const p1Size = getHandleFontSize(p1.handle, 56);
    const p2Size = getHandleFontSize(p2.handle, 56);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: BRAND_COLORS.canvas,
            padding: "50px 40px",
            fontFamily: "Hanken Grotesk, sans-serif",
            color: BRAND_COLORS.ink,
          }}
        >
          {/* Inner Fight Card */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
              border: "6px solid #111214",
              boxShadow: "14px 14px 0px #111214",
              overflow: "hidden",
            }}
          >
            {/* 1. Header Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "28px 40px",
                borderBottom: "4px solid #111214",
                width: "100%",
                backgroundColor: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <span
                  style={{
                    fontSize: "46px",
                    fontWeight: 900,
                    color: BRAND_COLORS.ink,
                    letterSpacing: "-1px",
                  }}
                >
                  TrashTalk
                </span>
                <span
                  style={{
                    fontSize: "16px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    backgroundColor: "#111214",
                    padding: "6px 14px",
                    borderRadius: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {model.platform.label} · ARENA
                </span>
              </div>

              <span
                style={{
                  fontSize: "18px",
                  color: BRAND_COLORS.secondaryInk,
                  fontWeight: 700,
                }}
              >
                {model.formattedDate}
              </span>
            </div>

            {/* 2. Combatant Arena (Top & Bottom) */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                padding: "36px 40px",
                flex: 1,
              }}
            >
              {/* Player 1 Block */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  padding: "24px 32px",
                  backgroundColor: isP1Winner ? "#F9F9F8" : "#FFFFFF",
                  border: isP1Winner ? "3px solid #111214" : "2px dashed #DADAD6",
                  borderRadius: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {isP1Winner && (
                      <span
                        style={{
                          backgroundColor: "#111214",
                          color: "#FFFFFF",
                          fontSize: "16px",
                          fontWeight: 900,
                          padding: "4px 12px",
                          borderRadius: "3px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        VICTOR {snapshot.verdict.margin > 0 ? `(+${snapshot.verdict.margin} PTS)` : ""}
                      </span>
                    )}
                    {isP2Winner && (
                      <span
                        style={{
                          backgroundColor: "#FFF0F0",
                          color: "#D82A26",
                          border: "2px solid #D82A26",
                          fontSize: "15px",
                          fontWeight: 900,
                          padding: "4px 10px",
                          borderRadius: "3px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        RUNNER UP
                      </span>
                    )}
                    {isDraw && (
                      <span
                        style={{
                          backgroundColor: "#111214",
                          color: "#FFFFFF",
                          fontSize: "16px",
                          fontWeight: 900,
                          padding: "4px 12px",
                          borderRadius: "3px",
                          letterSpacing: "1px",
                        }}
                      >
                        DRAW · TIED
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "18px",
                      color: BRAND_COLORS.secondaryInk,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {p1Subtitle}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: `${p1Size}px`,
                      fontWeight: 900,
                      color: isP2Winner ? BRAND_COLORS.action : BRAND_COLORS.ink,
                      letterSpacing: "-1px",
                    }}
                  >
                    @{p1.handle.toUpperCase()}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "96px", fontWeight: 900, color: "#111214", lineHeight: 0.9 }}>
                      {p1.score}
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: BRAND_COLORS.secondaryInk }}>
                      PTS
                    </span>
                  </div>
                </div>
              </div>

              {/* Clash Divider with VS & Killer Stat */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "20px",
                  margin: "8px 0",
                }}
              >
                <div style={{ display: "flex", height: "3px", flex: 1, backgroundColor: "#111214" }} />
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: BRAND_COLORS.action,
                    color: "#FFFFFF",
                    fontSize: "24px",
                    fontWeight: 900,
                    padding: "6px 20px",
                    borderRadius: "4px",
                    letterSpacing: "2px",
                  }}
                >
                  VS
                </div>
                {killer && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#111214",
                      color: "#FFFFFF",
                      fontSize: "16px",
                      fontWeight: 800,
                      padding: "6px 16px",
                      borderRadius: "4px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    LEAD: {killer.delta}
                  </div>
                )}
                <div style={{ display: "flex", height: "3px", flex: 1, backgroundColor: "#111214" }} />
              </div>

              {/* Player 2 Block */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  padding: "24px 32px",
                  backgroundColor: isP2Winner ? "#F9F9F8" : "#FFFFFF",
                  border: isP2Winner ? "3px solid #111214" : "2px dashed #DADAD6",
                  borderRadius: "4px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {isP2Winner && (
                      <span
                        style={{
                          backgroundColor: "#111214",
                          color: "#FFFFFF",
                          fontSize: "16px",
                          fontWeight: 900,
                          padding: "4px 12px",
                          borderRadius: "3px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        VICTOR {snapshot.verdict.margin > 0 ? `(+${snapshot.verdict.margin} PTS)` : ""}
                      </span>
                    )}
                    {isP1Winner && (
                      <span
                        style={{
                          backgroundColor: "#FFF0F0",
                          color: "#D82A26",
                          border: "2px solid #D82A26",
                          fontSize: "15px",
                          fontWeight: 900,
                          padding: "4px 10px",
                          borderRadius: "3px",
                          letterSpacing: "1px",
                          textTransform: "uppercase",
                        }}
                      >
                        RUNNER UP
                      </span>
                    )}
                    {isDraw && (
                      <span
                        style={{
                          backgroundColor: "#111214",
                          color: "#FFFFFF",
                          fontSize: "16px",
                          fontWeight: 900,
                          padding: "4px 12px",
                          borderRadius: "3px",
                          letterSpacing: "1px",
                        }}
                      >
                        DRAW · TIED
                      </span>
                    )}
                  </div>
                  <span
                    style={{
                      fontSize: "18px",
                      color: BRAND_COLORS.secondaryInk,
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    {p2Subtitle}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: `${p2Size}px`,
                      fontWeight: 900,
                      color: isP1Winner ? BRAND_COLORS.action : BRAND_COLORS.ink,
                      letterSpacing: "-1px",
                    }}
                  >
                    @{p2.handle.toUpperCase()}
                  </span>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                    <span style={{ fontSize: "96px", fontWeight: 900, color: "#111214", lineHeight: 0.9 }}>
                      {p2.score}
                    </span>
                    <span style={{ fontSize: "20px", fontWeight: 800, color: BRAND_COLORS.secondaryInk }}>
                      PTS
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. The Savage Roast Section */}
            <div
              style={{
                backgroundColor: "#111214",
                color: "#FFFFFF",
                padding: "36px 40px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                width: "100%",
                borderTop: "5px solid #111214",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span
                  style={{
                    backgroundColor: BRAND_COLORS.action,
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 900,
                    padding: "3px 10px",
                    borderRadius: "2px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  OFFICIAL ROAST VERDICT
                </span>
                <span style={{ color: "#DADAD6", fontSize: "16px", fontWeight: 700 }}>
                  "{copy.outcomeLine}"
                </span>
              </div>

              <span
                style={{
                  fontSize: copy.roastText.length > 80 ? "32px" : "38px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1.28,
                  fontStyle: "italic",
                }}
              >
                "{copy.roastText}"
              </span>
            </div>

            {/* 4. Mini Receipts Strip */}
            {miniReceipts.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "18px 40px",
                  backgroundColor: "#F9F9F8",
                  borderTop: "3px solid #111214",
                  borderBottom: "3px solid #111214",
                }}
              >
                {miniReceipts.map((rec, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 800, color: BRAND_COLORS.secondaryInk }}>
                      {rec.label}
                    </span>
                    <span style={{ fontSize: "16px", fontWeight: 900, color: BRAND_COLORS.ink, marginTop: "2px" }}>
                      {rec.p1} vs {rec.p2}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Footer Bar */}
            <div
              style={{
                backgroundColor: BRAND_COLORS.action,
                color: "#FFFFFF",
                padding: "20px 40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 900,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Settle your beef at trashtalk.vercel.app
              </span>
              <span
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                trashtalk.vercel.app
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
        fonts: fonts.map((f) => ({
          name: f.name,
          data: f.data,
          weight: f.weight,
          style: f.style,
        })),
        headers,
      }
    );
  }

  // -----------------------------------------------------------------
  // FORMAT 2: SQUARE (1080 x 1080, 1:1 Fight Poster)
  // -----------------------------------------------------------------
  if (isSquare) {
    const p1Size = getHandleFontSize(p1.handle, 42);
    const p2Size = getHandleFontSize(p2.handle, 42);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: BRAND_COLORS.canvas,
            padding: "40px",
            fontFamily: "Hanken Grotesk, sans-serif",
            color: BRAND_COLORS.ink,
          }}
        >
          {/* Inner Fight Card */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              backgroundColor: "#FFFFFF",
              border: "5px solid #111214",
              boxShadow: "12px 12px 0px #111214",
              overflow: "hidden",
            }}
          >
            {/* 1. Header Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 32px",
                borderBottom: "3.5px solid #111214",
                width: "100%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: BRAND_COLORS.ink,
                    letterSpacing: "-0.5px",
                  }}
                >
                  TrashTalk
                </span>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    backgroundColor: "#111214",
                    padding: "5px 12px",
                    borderRadius: "3px",
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                >
                  {model.platform.label} · FIGHT NIGHT
                </span>
              </div>

              <span
                style={{
                  fontSize: "15px",
                  color: BRAND_COLORS.secondaryInk,
                  fontWeight: 700,
                }}
              >
                {model.formattedDate}
              </span>
            </div>

            {/* 2. Combatant Confrontation Row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "24px 32px",
                flex: 1,
              }}
            >
              {/* Left Combatant */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "38%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isP1Winner && (
                    <span
                      style={{
                        backgroundColor: "#111214",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 900,
                        padding: "3px 10px",
                        borderRadius: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      VICTOR {snapshot.verdict.margin > 0 ? `(+${snapshot.verdict.margin})` : ""}
                    </span>
                  )}
                  {isP2Winner && (
                    <span
                      style={{
                        backgroundColor: "#FFF0F0",
                        color: "#D82A26",
                        border: "1.5px solid #D82A26",
                        fontSize: "12px",
                        fontWeight: 900,
                        padding: "3px 8px",
                        borderRadius: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      RUNNER UP
                    </span>
                  )}
                  {isDraw && (
                    <span
                      style={{
                        backgroundColor: "#111214",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 900,
                        padding: "3px 10px",
                        borderRadius: "2px",
                      }}
                    >
                      DRAW
                    </span>
                  )}
                </div>

                <span
                  style={{
                    fontSize: `${p1Size}px`,
                    fontWeight: 900,
                    color: isP2Winner ? BRAND_COLORS.action : BRAND_COLORS.ink,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.05,
                  }}
                >
                  @{p1.handle.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: BRAND_COLORS.secondaryInk,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {p1Subtitle}
                </span>

                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
                  <span style={{ fontSize: "64px", fontWeight: 900, color: "#111214", lineHeight: 0.9 }}>
                    {p1.score}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: BRAND_COLORS.secondaryInk }}>
                    PTS
                  </span>
                </div>
              </div>

              {/* Center Confrontation Slab */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "0 12px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: BRAND_COLORS.action,
                    color: "#FFFFFF",
                    fontSize: "20px",
                    fontWeight: 900,
                    padding: "4px 16px",
                    borderRadius: "3px",
                    letterSpacing: "1px",
                  }}
                >
                  VS
                </div>
                {killer && (
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 800,
                      color: BRAND_COLORS.ink,
                      backgroundColor: "#EDEDEA",
                      padding: "4px 10px",
                      borderRadius: "2px",
                      textAlign: "center",
                      letterSpacing: "0.5px",
                    }}
                  >
                    LEAD: {killer.delta}
                  </span>
                )}
              </div>

              {/* Right Combatant */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  textAlign: "right",
                  gap: "6px",
                  width: "38%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {isP2Winner && (
                    <span
                      style={{
                        backgroundColor: "#111214",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 900,
                        padding: "3px 10px",
                        borderRadius: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      VICTOR {snapshot.verdict.margin > 0 ? `(+${snapshot.verdict.margin})` : ""}
                    </span>
                  )}
                  {isP1Winner && (
                    <span
                      style={{
                        backgroundColor: "#FFF0F0",
                        color: "#D82A26",
                        border: "1.5px solid #D82A26",
                        fontSize: "12px",
                        fontWeight: 900,
                        padding: "3px 8px",
                        borderRadius: "2px",
                        textTransform: "uppercase",
                      }}
                    >
                      RUNNER UP
                    </span>
                  )}
                  {isDraw && (
                    <span
                      style={{
                        backgroundColor: "#111214",
                        color: "#FFFFFF",
                        fontSize: "13px",
                        fontWeight: 900,
                        padding: "3px 10px",
                        borderRadius: "2px",
                      }}
                    >
                      DRAW
                    </span>
                  )}
                </div>

                <span
                  style={{
                    fontSize: `${p2Size}px`,
                    fontWeight: 900,
                    color: isP1Winner ? BRAND_COLORS.action : BRAND_COLORS.ink,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.05,
                  }}
                >
                  @{p2.handle.toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    color: BRAND_COLORS.secondaryInk,
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  {p2Subtitle}
                </span>

                <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "4px" }}>
                  <span style={{ fontSize: "64px", fontWeight: 900, color: "#111214", lineHeight: 0.9 }}>
                    {p2.score}
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: 800, color: BRAND_COLORS.secondaryInk }}>
                    PTS
                  </span>
                </div>
              </div>
            </div>

            {/* 3. The Savage Roast Section */}
            <div
              style={{
                backgroundColor: "#111214",
                color: "#FFFFFF",
                padding: "28px 36px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                width: "100%",
                borderTop: "4px solid #111214",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      backgroundColor: BRAND_COLORS.action,
                      color: "#FFFFFF",
                      fontSize: "11px",
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      letterSpacing: "1px",
                      textTransform: "uppercase",
                    }}
                  >
                    OFFICIAL ROAST VERDICT
                  </span>
                  <span style={{ color: "#DADAD6", fontSize: "14px", fontWeight: 700 }}>
                    "{copy.outcomeLine}"
                  </span>
                </div>
              </div>

              <span
                style={{
                  fontSize: copy.roastText.length > 90 ? "24px" : "28px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1.3,
                  fontStyle: "italic",
                }}
              >
                "{copy.roastText}"
              </span>
            </div>

            {/* 4. Mini Receipts Strip */}
            {miniReceipts.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 36px",
                  backgroundColor: "#F9F9F8",
                  borderTop: "2.5px solid #111214",
                  borderBottom: "2.5px solid #111214",
                }}
              >
                {miniReceipts.map((rec, idx) => (
                  <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: BRAND_COLORS.secondaryInk }}>
                      {rec.label}
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: 900, color: BRAND_COLORS.ink, marginTop: "2px" }}>
                      {rec.p1} vs {rec.p2}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* 5. Footer Bar */}
            <div
              style={{
                backgroundColor: BRAND_COLORS.action,
                color: "#FFFFFF",
                padding: "16px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: 900,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                Settle your beef at trashtalk.vercel.app
              </span>
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                trashtalk.vercel.app
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width,
        height,
        fonts: fonts.map((f) => ({
          name: f.name,
          data: f.data,
          weight: f.weight,
          style: f.style,
        })),
        headers,
      }
    );
  }

  // -----------------------------------------------------------------
  // FORMAT 3: OG (1200 x 630, 1.91:1 Horizontal Link Preview)
  // -----------------------------------------------------------------
  const p1Size = getHandleFontSize(p1.handle, 36);
  const p2Size = getHandleFontSize(p2.handle, 36);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: BRAND_COLORS.canvas,
          padding: "24px 32px",
          fontFamily: "Hanken Grotesk, sans-serif",
          color: BRAND_COLORS.ink,
        }}
      >
        {/* Inner Fight Card */}
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#FFFFFF",
            border: "3.5px solid #111214",
            boxShadow: "8px 8px 0px #111214",
            overflow: "hidden",
          }}
        >
          {/* 1. Header Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 28px",
              borderBottom: "3px solid #111214",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  color: BRAND_COLORS.ink,
                  letterSpacing: "-0.5px",
                }}
              >
                TrashTalk
              </span>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  backgroundColor: "#111214",
                  padding: "4px 10px",
                  borderRadius: "3px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                {model.platform.label} · ARENA CLASH
              </span>
            </div>

            <span
              style={{
                fontSize: "13px",
                color: BRAND_COLORS.secondaryInk,
                fontWeight: 700,
              }}
            >
              {model.formattedDate}
            </span>
          </div>

          {/* 2. Combatant Arena */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "18px 28px",
              flex: 1,
            }}
          >
            {/* Player 1 Left */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "36%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {isP1Winner && (
                  <span
                    style={{
                      backgroundColor: "#111214",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      alignSelf: "flex-start",
                    }}
                  >
                    VICTOR {snapshot.verdict.margin > 0 ? `(+${snapshot.verdict.margin})` : ""}
                  </span>
                )}
                {isP2Winner && (
                  <span
                    style={{
                      backgroundColor: "#FFF0F0",
                      color: "#D82A26",
                      border: "1.5px solid #D82A26",
                      fontSize: "11px",
                      fontWeight: 900,
                      padding: "2px 6px",
                      borderRadius: "2px",
                      textTransform: "uppercase",
                      alignSelf: "flex-start",
                    }}
                  >
                    RUNNER UP
                  </span>
                )}
                {isDraw && (
                  <span
                    style={{
                      backgroundColor: "#111214",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      alignSelf: "flex-start",
                    }}
                  >
                    TIE
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: `${p1Size}px`,
                  fontWeight: 900,
                  color: isP2Winner ? BRAND_COLORS.action : BRAND_COLORS.ink,
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                @{p1.handle.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: BRAND_COLORS.secondaryInk,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {p1Subtitle}
              </span>
            </div>

            {/* Scoreboard Center with VS & Killer Stat */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 16px",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span
                  style={{
                    fontSize: "76px",
                    fontWeight: 900,
                    color: isP1Winner ? "#111214" : BRAND_COLORS.secondaryInk,
                    letterSpacing: "-3px",
                    lineHeight: 0.9,
                  }}
                >
                  {p1.score}
                </span>
                <span
                  style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: BRAND_COLORS.action,
                    lineHeight: 0.9,
                  }}
                >
                  -
                </span>
                <span
                  style={{
                    fontSize: "76px",
                    fontWeight: 900,
                    color: isP2Winner ? BRAND_COLORS.action : BRAND_COLORS.secondaryInk,
                    letterSpacing: "-3px",
                    lineHeight: 0.9,
                  }}
                >
                  {p2.score}
                </span>
              </div>

              {killer && (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: BRAND_COLORS.ink,
                    backgroundColor: "#EDEDEA",
                    padding: "3px 8px",
                    borderRadius: "2px",
                    letterSpacing: "0.5px",
                  }}
                >
                  LEAD: {killer.delta}
                </span>
              )}
            </div>

            {/* Player 2 Right */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                textAlign: "right",
                gap: "4px",
                width: "36%",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {isP2Winner && (
                  <span
                    style={{
                      backgroundColor: "#111214",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      alignSelf: "flex-end",
                    }}
                  >
                    VICTOR {snapshot.verdict.margin > 0 ? `(+${snapshot.verdict.margin})` : ""}
                  </span>
                )}
                {isP1Winner && (
                  <span
                    style={{
                      backgroundColor: "#FFF0F0",
                      color: "#D82A26",
                      border: "1.5px solid #D82A26",
                      fontSize: "11px",
                      fontWeight: 900,
                      padding: "2px 6px",
                      borderRadius: "2px",
                      textTransform: "uppercase",
                      alignSelf: "flex-end",
                    }}
                  >
                    RUNNER UP
                  </span>
                )}
                {isDraw && (
                  <span
                    style={{
                      backgroundColor: "#111214",
                      color: "#FFFFFF",
                      fontSize: "12px",
                      fontWeight: 900,
                      padding: "2px 8px",
                      borderRadius: "2px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      alignSelf: "flex-end",
                    }}
                  >
                    TIE
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: `${p2Size}px`,
                  fontWeight: 900,
                  color: isP1Winner ? BRAND_COLORS.action : BRAND_COLORS.ink,
                  letterSpacing: "-0.5px",
                  lineHeight: 1,
                }}
              >
                @{p2.handle.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: BRAND_COLORS.secondaryInk,
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {p2Subtitle}
              </span>
            </div>
          </div>

          {/* 3. The Savage Roast Section */}
          <div
            style={{
              backgroundColor: "#111214",
              color: "#FFFFFF",
              padding: "16px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              width: "100%",
              borderTop: "3.5px solid #111214",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span
                  style={{
                    backgroundColor: BRAND_COLORS.action,
                    color: "#FFFFFF",
                    fontSize: "10px",
                    fontWeight: 900,
                    padding: "2px 6px",
                    borderRadius: "2px",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  OFFICIAL ROAST
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#DADAD6",
                    letterSpacing: "0.3px",
                    textTransform: "uppercase",
                  }}
                >
                  "{copy.outcomeLine}"
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: copy.roastText.length > 90 ? "19px" : "22px",
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.28,
                fontStyle: "italic",
              }}
            >
              "{copy.roastText}"
            </span>
          </div>

          {/* 4. Footer Bar */}
          <div
            style={{
              backgroundColor: BRAND_COLORS.action,
              color: "#FFFFFF",
              padding: "10px 28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 900,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Think you can beat them?
            </span>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "#FFFFFF",
              }}
            >
              trashtalk.vercel.app
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
      headers,
    }
  );
}
