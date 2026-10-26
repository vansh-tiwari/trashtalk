import localFont from "next/font/local";

export const hanken = localFont({
  src: "./HankenGrotesk.woff2",
  variable: "--font-hanken",
  display: "swap",
  fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
});


// Deprecated Barlow fonts retained temporarily for backward compatibility with existing tests/exports
export const barlow = localFont({
  src: [
    {
      path: "./Barlow-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Barlow-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Barlow-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-barlow",
  display: "swap",
});

export const barlowCondensed = localFont({
  src: [
    {
      path: "./BarlowCondensed-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-barlow-condensed",
  display: "swap",
});
