"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#F2F2F0",
          color: "#111214",
          fontFamily: "system-ui, -apple-system, sans-serif",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            maxWidth: "520px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "4px solid #111214",
            boxShadow: "8px 8px 0px #111214",
            padding: "32px",
          }}
        >
          <div
            style={{
              display: "inline-block",
              backgroundColor: "#111214",
              color: "#FFFFFF",
              fontFamily: "monospace",
              fontSize: "12px",
              fontWeight: 700,
              padding: "4px 10px",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "16px",
            }}
          >
            500 · SYSTEM ERROR
          </div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: 900,
              textTransform: "uppercase",
              margin: "0 0 12px",
              lineHeight: 1,
            }}
          >
            Something went wrong.
          </h1>
          <p
            style={{
              fontSize: "15px",
              color: "#5E6066",
              lineHeight: 1.5,
              margin: "0 0 24px",
            }}
          >
            An unexpected error interrupted the arena. Try reloading or return to the home stage.
          </p>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                backgroundColor: "#D82A26",
                color: "#FFFFFF",
                border: "2px solid #111214",
                padding: "12px 20px",
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <a
              href="/"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#111214",
                border: "2px solid #111214",
                padding: "12px 20px",
                fontWeight: 800,
                fontSize: "14px",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Back to arena
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
