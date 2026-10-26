import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "var(--canvas)",
        paper: "var(--bg)",
        paper2: "var(--paper2)",
        surface: "var(--surface)",
        ink: "var(--ink)",
        "secondary-ink": "var(--secondary-ink)",
        secondary: "var(--secondary-ink)",
        muted: "var(--muted)",
        rule: "var(--rule)",
        border: "var(--border)",
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
        },
        punch: {
          DEFAULT: "var(--or)",
          dark: "var(--ord)",
          stroke: "var(--stroke-red)",
        },
        action: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
        },
        winner: "var(--winner)",
        player1: {
          DEFAULT: "var(--player-one)",
          surface: "var(--player-one)",
          ink: "var(--player-one-ink)",
          chart: "var(--chart-stroke-1)",
        },
        player2: {
          DEFAULT: "var(--player-two)",
          surface: "var(--player-two)",
          ink: "var(--player-two-ink)",
          chart: "var(--chart-stroke-2)",
        },
        positive: {
          DEFAULT: "var(--positive)",
          surface: "var(--positive-surface)",
        },
        "positive-surface": "var(--positive-surface)",
        "positive-bg": "var(--positive-surface)",
        danger: {
          DEFAULT: "var(--danger)",
          surface: "var(--danger-surface)",
        },
        focus: "var(--focus)",
      },
      fontFamily: {
        sans: [
          "var(--font-hanken)",
          "'Hanken Grotesk'",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        display: [
          "'Big Shoulders Display'",
          "var(--font-hanken)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
        mono: [
          "'IBM Plex Mono'",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
      borderRadius: {
        control: "10px",
        surface: "14px",
        card: "16px",
      },
      maxWidth: {
        container: "1120px",
      },
    },
  },
  plugins: [],
};

export default config;
