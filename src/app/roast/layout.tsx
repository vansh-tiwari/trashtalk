import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solo Profile Roaster & Mirror Match",
  description:
    "Roast your own developer profile. Drop your handle to inspect your 5-axis algorithmic score, repository graveyard, and vanity metrics.",
  openGraph: {
    title: "Solo Profile Roaster · TrashTalk",
    description: "Your toughest rival? Still you. Face the receipts and get roasted.",
  },
};

export default function RoastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
