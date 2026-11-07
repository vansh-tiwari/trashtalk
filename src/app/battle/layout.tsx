import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Matchup",
  description:
    "Enter any two developer handles on Codeforces, LeetCode, CodeChef, or GitHub to calculate mathematical algorithmic grit and get a roast.",
  openGraph: {
    title: "New Developer Battle · TrashTalk",
    description: "Drop two handles and let the verified receipts decide the winner.",
  },
};

export default function BattleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
