import type { BattleSnapshot } from "../storage/contracts";
import { toBattleViewModel } from "./presentation";

export function selectShortRoast(snapshot: BattleSnapshot): string {
  const vm = toBattleViewModel(snapshot);

  if (vm.isMirrorMatch) {
    return "Your toughest rival? Still you.";
  }

  if (vm.outcome === "draw") {
    return "Same score. Twice the ego.";
  }

  if (vm.outcome === "insufficient_data") {
    return "Not enough receipts. No victory lap.";
  }

  // Historical v1 snapshots with unknown evidence have no trusted receipts
  if (vm.evidenceState === "unknown") {
    return "Big claims. Limited receipts.";
  }

  // Supported win or modern recorded result
  const winner = vm.winnerHandle;
  const loser =
    vm.loserHandle ||
    (winner === snapshot.player1.handle ? snapshot.player2.handle : snapshot.player1.handle);

  const fallbackRoast =
    vm.evidenceState === "partial"
      ? "Big claims. Limited receipts."
      : `@${loser}, the scoreboard would like a word.`;

  const punchline = snapshot.commentary?.punchline;
  if (!punchline || typeof punchline !== "string") {
    return fallbackRoast;
  }

  let text = punchline.trim();
  if (!text) {
    return fallbackRoast;
  }

  if (!winner) {
    return fallbackRoast;
  }

  // Check for contrary winner claims
  if (loser) {
    const escapedLoser = loser.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const contraryRegex = new RegExp(`^winner\\s*:\\s*@?${escapedLoser}\\b`, "i");
    if (contraryRegex.test(text)) {
      return fallbackRoast;
    }
  }

  // Strip matching known winner prefix
  const escapedWinner = winner.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const prefixPatterns = [
    new RegExp(`^winner\\s*:\\s*@?${escapedWinner}\\s*([.:–—-])?\\s*`, "i"),
    new RegExp(`^@?${escapedWinner}\\s*takes\\s*it\\s*([.:–—-])?\\s*`, "i"),
    new RegExp(`^@?${escapedWinner}\\s*wins!?\\s*([.:–—-])?\\s*`, "i"),
    new RegExp(`^@?${escapedWinner}\\s*:\\s*`, "i"),
  ];

  for (const pattern of prefixPatterns) {
    if (pattern.test(text)) {
      text = text.replace(pattern, "").trim();
      break;
    }
  }

  if (!text) {
    return fallbackRoast;
  }

  // Bound: max 24 whitespace-separated words and 160 Unicode code points
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length > 24) {
    return fallbackRoast;
  }

  const codePoints = Array.from(text).length;
  if (codePoints > 160) {
    return fallbackRoast;
  }

  return text;
}
