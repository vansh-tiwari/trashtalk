import React from "react";
import { ImageResponse } from "next/og";
import { getCardFonts } from "@/lib/share/fonts";

export const runtime = "nodejs";
export const alt = "TrashTalk — The AI Developer Battle Arena & Profile Roaster";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const fonts = await getCardFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#111214",
          color: "#F4F4F4",
          padding: "56px 64px",
          fontFamily: "'Hanken Grotesk', sans-serif",
          position: "relative",
          border: "16px solid #111214",
        }}
      >
        {/* Outer Red Frame Accent */}
        <div
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            right: 24,
            bottom: 24,
            border: "2px solid #D82A26",
            pointerEvents: "none",
          }}
        />

        {/* Top Header Strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderBottom: "2px solid rgba(255, 255, 255, 0.15)",
            paddingBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: 38,
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "#FFFFFF",
                textTransform: "uppercase",
              }}
            >
              TrashTalk
            </span>
            <span
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: "#D82A26",
              }}
            >
              2.0
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#D82A26",
              padding: "6px 14px",
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            THE ARENA · STANDBY
          </div>
        </div>

        {/* Hero Middle Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            margin: "auto 0",
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 900,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              textTransform: "uppercase",
            }}
          >
            Where developer profiles go to get roasted.
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: "rgba(244, 244, 244, 0.75)",
              lineHeight: 1.3,
              maxWidth: "880px",
            }}
          >
            Deterministic 5-axis algorithmic scoring, problem overlap breakdown, and winner-to-loser roasts with 100% verified receipts.
          </div>
        </div>

        {/* Bottom Platform Chips & Tagline */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            borderTop: "2px solid rgba(255, 255, 255, 0.15)",
            paddingTop: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {["CODEFORCES", "LEETCODE", "CODECHEF", "GITHUB"].map((platform) => (
              <div
                key={platform}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  padding: "6px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "0.05em",
                }}
              >
                {platform}
              </div>
            ))}
          </div>

          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#D82A26",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            trashtalk.vanshtiwari.dev
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fonts.map((f) => ({
        name: f.name,
        data: f.data,
        weight: f.weight,
        style: f.style,
      })),
    }
  );
}
