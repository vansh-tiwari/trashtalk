import type { Metadata, Viewport } from "next";
import "./globals.css";
import { hanken } from "./fonts/fonts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";
import ArenaAnalytics from "@/components/analytics/ArenaAnalytics";

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trashtalk.vercel.app";

export const viewport: Viewport = {
  themeColor: "#15171B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl),
  title: {
    default: "TrashTalk 2.0 — Brutalist Developer Battle Arena",
    template: "%s · TrashTalk",
  },
  description:
    "Where developer profiles go to get roasted. Compare Codeforces, LeetCode, CodeChef, and GitHub profiles across 5 mathematical grit axes with brutalist receipts.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "developer rivalry",
    "competitive programming",
    "codeforces battle",
    "leetcode comparison",
    "codechef battle",
    "github profile roaster",
    "algorithmic grit",
    "developer roast",
  ],
  authors: [{ name: "TrashTalk Team" }],
  creator: "TrashTalk",
  openGraph: {
    title: "TrashTalk 2.0 — Brutalist Developer Battle Arena",
    description:
      "Where developer profiles go to get roasted. Compare Codeforces, LeetCode, CodeChef, and GitHub profiles across 5 mathematical grit axes with brutalist receipts.",
    type: "website",
    url: publicAppUrl,
    siteName: "TrashTalk",
  },
  twitter: {
    card: "summary_large_image",
    title: "TrashTalk 2.0 — Brutalist Developer Battle Arena",
    description:
      "Where developer profiles go to get roasted. Compare Codeforces, LeetCode, CodeChef, and GitHub profiles across 5 mathematical grit axes with brutalist receipts.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "TrashTalk 2.0",
  url: publicAppUrl,
  applicationCategory: "DeveloperApplication",
  operatingSystem: "All",
  description:
    "Compare Codeforces, LeetCode, CodeChef, and GitHub profiles across 5 mathematical grit axes with brutalist social receipts.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={hanken.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Anton&family=Big+Shoulders+Display:wght@800;900&family=Hanken+Grotesk:wght@400;500;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== 'undefined' && 'serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function(regs) { for (var r of regs) { r.unregister(); } }); }`,
          }}
        />
      </head>
      <body className="root min-h-screen flex flex-col bg-canvas text-ink font-sans antialiased selection:bg-brand/20">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#D82A26] focus:text-white focus:font-mono focus:text-xs focus:font-bold focus:uppercase focus:border-2 focus:border-[#111214] focus:shadow-[4px_4px_0px_#111214]"
        >
          Skip to main content
        </a>
        <MotionProvider>
          <Navbar />
          <main id="main-content" className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </MotionProvider>
        <ArenaAnalytics />
      </body>
    </html>
  );
}
