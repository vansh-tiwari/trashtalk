import React from "react";
import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111214",
          border: "8px solid #D82A26",
          borderRadius: "36px",
          color: "#FFFFFF",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 92,
            fontWeight: 900,
            letterSpacing: "-4px",
            color: "#FFFFFF",
          }}
        >
          TT
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 18,
            fontSize: 14,
            fontWeight: 800,
            backgroundColor: "#D82A26",
            padding: "2px 8px",
            color: "#FFFFFF",
            letterSpacing: "2px",
          }}
        >
          2.0
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
