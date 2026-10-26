import type { Metadata } from "next";
import "./globals.css";
import { hanken } from "./fonts/fonts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { MotionProvider } from "@/components/motion/MotionProvider";

const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL || "https://trashtalk.dev";

export const metadata: Metadata = {
  metadataBase: new URL(publicAppUrl),
  title: "TrashTalk — Developer Battle Arena & Profile Comparison",
  description:
    "All talk? Bring receipts. Compare developer profiles head-to-head with verified numbers, problem overlap breakdown, and one concise roast.",
  openGraph: {
    title: "TrashTalk — Developer Battle Arena",
    description: "Compare developer stats and let the receipts do the talking.",
    type: "website",
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
          dangerouslySetInnerHTML={{
            __html: `if (typeof window !== 'undefined' && 'serviceWorker' in navigator) { navigator.serviceWorker.getRegistrations().then(function(regs) { for (var r of regs) { r.unregister(); } }); }`,
          }}
        />
      </head>
      <body className="root min-h-screen flex flex-col bg-canvas text-ink font-sans antialiased selection:bg-brand/20">
        <MotionProvider>
          <Navbar />
          <main className="flex-1 w-full">
            {children}
          </main>
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
