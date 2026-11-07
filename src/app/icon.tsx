import React from "react";
import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#111214",
          border: "2px solid #D82A26",
          borderRadius: "4px",
          color: "#FFFFFF",
          fontSize: 18,
          fontWeight: 900,
          fontFamily: "monospace",
          letterSpacing: "-1px",
        }}
      >
        TT
      </div>
    ),
    {
      ...size,
    }
  );
}
