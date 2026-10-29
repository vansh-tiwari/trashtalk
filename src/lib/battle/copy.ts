import type { BattleSnapshot } from "../storage/contracts";
import { getPlatformConfig } from "../platforms/registry";
import { toBattleViewModel } from "./presentation";
import { selectShortRoast } from "./short-roast";

const PREPARED_DEMO_IDS = new Set<string>([
  "cf-tourist-vs-petr-legendary",
]);

export interface BattleCopy {
  platformId: BattleSnapshot["platform"];
  platformLabel: string;
  outcomeLine: string;
  roastText: string;
  scoreLabel: string;
  coverageNote: string | null;
  isSample: boolean;
  canonicalPath: string;
}

export function buildBattleCopy(snapshot: BattleSnapshot): BattleCopy {
  const vm = toBattleViewModel(snapshot);
  const platformConfig = getPlatformConfig(snapshot.platform);
  const roastText = selectShortRoast(snapshot);

  let outcomeLine = "";
  let coverageNote: string | null = null;

  if (vm.isMirrorMatch) {
    outcomeLine = "mirror match";
  } else if (vm.outcome === "draw") {
    outcomeLine = "draw · 0 points apart";
  } else if (vm.outcome === "insufficient_data") {
    outcomeLine = "not enough data";
    coverageNote = "insufficient evidence";
  } else if (vm.evidenceState === "partial" || vm.evidenceState === "unknown") {
    outcomeLine = `recorded result: @${vm.winnerHandle}`;
    coverageNote = vm.evidenceState === "unknown" ? "coverage unavailable" : "partial history";
  } else {
    // Supported win
    outcomeLine = `@${vm.winnerHandle} takes it · +${vm.margin}`;
  }

  const isSample = PREPARED_DEMO_IDS.has(snapshot.id);
  const canonicalPath = `/battle/${snapshot.id}`;

  return {
    platformId: snapshot.platform,
    platformLabel: platformConfig.label,
    outcomeLine,
    roastText,
    scoreLabel: vm.scoreLabel,
    coverageNote,
    isSample,
    canonicalPath,
  };
}
