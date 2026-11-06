import { PREPARED_TOURIST_VS_PETR } from "../../src/lib/demo/prepared-battles";
import type { BattleSnapshot } from "../../src/lib/storage/contracts";

export const E2E_BATTLE_IDS = {
  demo: "cf-tourist-vs-petr-legendary",
  draw: "cf-e2e-draw-result",
  mirror: "cf-e2e-mirror-result",
  partial: "cf-e2e-partial-result",
  insufficient: "cf-e2e-insufficient-result",
  longHandle: "cf-e2e-long-handle-result",
};

export function createE2EFixtures(): Record<string, BattleSnapshot> {
  const drawFixture: BattleSnapshot = {
    ...PREPARED_TOURIST_VS_PETR,
    id: E2E_BATTLE_IDS.draw,
    verdict: {
      ...PREPARED_TOURIST_VS_PETR.verdict,
      outcome: "draw",
      winnerHandle: null,
      loserHandle: null,
      margin: 0,
      player1Score: { ...PREPARED_TOURIST_VS_PETR.verdict.player1Score, total: 88 },
      player2Score: { ...PREPARED_TOURIST_VS_PETR.verdict.player2Score, total: 88 },
    },
  };

  const mirrorFixture: BattleSnapshot = {
    ...PREPARED_TOURIST_VS_PETR,
    id: E2E_BATTLE_IDS.mirror,
    player2: { ...PREPARED_TOURIST_VS_PETR.player1 },
    verdict: {
      ...PREPARED_TOURIST_VS_PETR.verdict,
      isMirrorMatch: true,
      outcome: "win",
      winnerHandle: PREPARED_TOURIST_VS_PETR.player1.handle,
    },
  };

  const partialFixture: BattleSnapshot = {
    ...PREPARED_TOURIST_VS_PETR,
    id: E2E_BATTLE_IDS.partial,
    overlap: {
      ...PREPARED_TOURIST_VS_PETR.overlap,
      isDefinitive: false,
      dnaPercentage: null,
    },
  };

  const insufficientFixture: BattleSnapshot = {
    ...PREPARED_TOURIST_VS_PETR,
    id: E2E_BATTLE_IDS.insufficient,
    verdict: {
      ...PREPARED_TOURIST_VS_PETR.verdict,
      outcome: "insufficient_data",
      winnerHandle: null,
      loserHandle: null,
    },
    coverageNote: "insufficient history to compute verified result",
  };

  const longHandleFixture: BattleSnapshot = {
    ...PREPARED_TOURIST_VS_PETR,
    id: E2E_BATTLE_IDS.longHandle,
    player1: {
      ...PREPARED_TOURIST_VS_PETR.player1,
      handle: "very_long_handle_twenty_four",
      avatarUrl: undefined, // test broken/missing avatar
    },
  };

  return {
    [E2E_BATTLE_IDS.draw]: drawFixture,
    [E2E_BATTLE_IDS.mirror]: mirrorFixture,
    [E2E_BATTLE_IDS.partial]: partialFixture,
    [E2E_BATTLE_IDS.insufficient]: insufficientFixture,
    [E2E_BATTLE_IDS.longHandle]: longHandleFixture,
  };
}
